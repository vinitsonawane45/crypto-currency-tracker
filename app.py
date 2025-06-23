import os
import datetime
import requests
import base64
import re
import secrets
import pyotp
import qrcode
import io
from flask import Flask, render_template, jsonify, request, session, redirect, url_for, flash
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import time
from openai import OpenAI
from requests.exceptions import HTTPError
from flask_bcrypt import Bcrypt
from locale import setlocale, LC_ALL, currency

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

if not MONGO_URI or not OPENAI_API_KEY or not NEWS_API_KEY:
    raise RuntimeError("Please set MONGO_URI, OPENAI_API_KEY, and NEWS_API_KEY in the .env file.")

# Instantiate Flask app and Bcrypt
app = Flask(__name__)
app.secret_key = os.urandom(24)
bcrypt = Bcrypt(app)

# Set locale for currency formatting
try:
    setlocale(LC_ALL, 'en_US.UTF-8')
except Exception as e:
    logger.warning(f"Failed to set locale: {e}")

# Define Jinja2 filter for currency formatting
def format_currency(amount):
    try:
        formatted = currency(amount, symbol=True, grouping=True)
        parts = formatted.split('.')
        if len(parts) > 1:
            decimal_part = parts[1].rstrip('0')
            if decimal_part:
                return f"{parts[0]}.{decimal_part}"
            return parts[0]
        return formatted
    except Exception as e:
        logger.error(f"Error formatting currency: {e}")
        return f"${amount:,.2f}"

app.jinja_env.filters['format_currency'] = format_currency

# Instantiate OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Connect to MongoDB
client_db = MongoClient(MONGO_URI)
db = client_db.get_default_database()
portfolio_col = db.get_collection("portfolio")
alerts_col = db.get_collection("alerts")
prices_cache_col = db.get_collection("prices_cache")
historical_cache_col = db.get_collection("historical_cache")
users_col = db.get_collection("users")
coins_cache_col = db.get_collection("coins_cache")
news_cache_col = db.get_collection("news_cache")
activity_log_col = db.get_collection("activity_log")

# Drop the email_1 index if it exists
try:
    users_col.drop_index("email_1")
    logger.info("Dropped email_1 index from users collection")
except Exception as e:
    logger.info(f"No email_1 index found or error dropping index: {e}")

# Create indexes
prices_cache_col.create_index("timestamp", expireAfterSeconds=300)
historical_cache_col.create_index("timestamp", expireAfterSeconds=3600)
coins_cache_col.create_index("timestamp", expireAfterSeconds=86400)
news_cache_col.create_index("timestamp", expireAfterSeconds=1800)
users_col.create_index("username", unique=True)
activity_log_col.create_index([("username", 1), ("timestamp", -1)])

# CoinGecko API Helper
COINGECKO_SIMPLE_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price"
COINGECKO_COINS_LIST_URL = "https://api.coingecko.com/api/v3/coins/list"
DEFAULT_COINS = ["bitcoin", "ethereum", "ripple", "litecoin", "dogecoin", "binancecoin", "cardano", "solana", "polkadot", "chainlink"]
COIN_SYMBOLS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "ripple": "XRP",
    "litecoin": "LTC",
    "dogecoin": "DOGE",
    "binancecoin": "BNB",
    "cardano": "ADA",
    "solana": "SOL",
    "polkadot": "DOT",
    "chainlink": "LINK"
}

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((requests.exceptions.RequestException, HTTPError)),
    after=lambda retry_state: logger.info(f"Retrying CoinGecko API call, attempt {retry_state.attempt_number}")
)
def fetch_coingecko_prices(coin_ids, vs_currency="usd"):
    logger.info(f"Fetching prices from CoinGecko for coins: {coin_ids}")
    params = {
        "ids": ",".join(coin_ids),
        "vs_currencies": vs_currency,
        "include_market_cap": "true",
        "include_24hr_vol": "true",
        "include_24hr_change": "true"
    }
    resp = requests.get(COINGECKO_SIMPLE_PRICE_URL, params=params, timeout=10)
    if resp.status_code == 429:
        logger.warning("Rate limit exceeded for CoinGecko API")
        raise HTTPError("429 Too Many Requests")
    resp.raise_for_status()
    prices = resp.json()
    logger.info(f"Successfully fetched prices for {coin_ids}, status: {resp.status_code}")
    prices_cache_col.insert_one({
        "coin_ids": sorted(coin_ids),
        "prices": prices,
        "timestamp": time.time()
    })
    return prices

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((requests.exceptions.RequestException, HTTPError)),
    after=lambda retry_state: logger.info(f"Retrying CoinGecko historical API call, attempt {retry_state.attempt_number}")
)
def fetch_historical_prices(coin, days=30, vs_currency="usd"):
    logger.info(f"Fetching historical prices for {coin}")
    url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart?vs_currency={vs_currency}&days={days}"
    resp = requests.get(url, timeout=10)
    if resp.status_code == 429:
        logger.warning("Rate limit exceeded for CoinGecko historical API")
        raise HTTPError("429 Too Many Requests")
    resp.raise_for_status()
    data = resp.json()
    historical = {
        "labels": [datetime.datetime.fromtimestamp(p[0] / 1000).strftime('%Y-%m-%d') for p in data.get("prices", [])],
        "prices": [p[1] for p in data.get("prices", [])],
        "timestamp": time.time()
    }
    historical_cache_col.insert_one({
        "coin": coin,
        "days": days,
        "data": historical,
        "timestamp": time.time()
    })
    return historical

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((requests.exceptions.RequestException, HTTPError)),
    after=lambda retry_state: logger.info(f"Retrying CoinGecko coins list API call, attempt {retry_state.attempt_number}")
)
def fetch_coingecko_coins_list():
    logger.info("Fetching coins list from CoinGecko")
    resp = requests.get(COINGECKO_COINS_LIST_URL, timeout=10)
    if resp.status_code == 429:
        logger.warning("Rate limit exceeded for CoinGecko coins list API")
        raise HTTPError("429 Too Many Requests")
    resp.raise_for_status()
    coins = resp.json()
    coins_cache_col.insert_one({
        "coins": coins,
        "timestamp": time.time()
    })
    return coins

def get_coins_list():
    cache = coins_cache_col.find_one()
    if cache:
        logger.info("Using cached coins list")
        return cache["coins"]
    return fetch_coingecko_coins_list()

def get_live_prices(coin_ids, vs_currency="usd"):
    if not coin_ids:
        logger.warning("No coin IDs provided to get_live_prices")
        return {}
    valid_coin_ids = [cid for cid in coin_ids if isinstance(cid, str) and cid.strip()]
    if not valid_coin_ids:
        logger.error("All provided coin IDs are invalid")
        return {}
    cache_key = sorted(valid_coin_ids)
    cache = prices_cache_col.find_one({"coin_ids": cache_key})
    if cache:
        logger.info(f"Using cached prices for coins: {valid_coin_ids}")
        return cache["prices"]
    return fetch_coingecko_prices(valid_coin_ids, vs_currency)

def get_historical_prices(coin, days=30, vs_currency="usd"):
    cache = historical_cache_col.find_one({"coin": coin, "days": days})
    if cache:
        logger.info(f"Using cached historical prices for {coin}")
        return cache["data"]
    return fetch_historical_prices(coin, days, vs_currency)

# News API Helper with Sentiment Analysis
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((requests.exceptions.RequestException, HTTPError)),
    after=lambda retry_state: logger.info(f"Retrying News API call, attempt {retry_state.attempt_number}")
)
def fetch_crypto_news(query="cryptocurrency"):
    logger.info(f"Fetching cryptocurrency news from News API for query: {query}")
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 20
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code == 429:
            logger.warning("Rate limit exceeded for News API")
            raise HTTPError("429 Too Many Requests")
        resp.raise_for_status()
        news_data = resp.json()
        articles = news_data.get("articles", [])
        
        # Add sentiment analysis for each article
        for article in articles:
            if not article.get("sentiment_score"):
                title = article.get("title", "")
                if title:
                    try:
                        prompt = f"Analyze the sentiment of the following news headline about cryptocurrency: '{title}'. Return a sentiment score between -1 (very negative) and 1 (very positive)."
                        completion = client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {"role": "system", "content": "You are a sentiment analysis assistant."},
                                {"role": "user", "content": prompt}
                            ],
                            temperature=0.5,
                            max_tokens=50
                        )
                        score_text = completion.choices[0].message.content.strip()
                        score_match = re.search(r'-?\d*\.?\d+', score_text)
                        article["sentiment_score"] = float(score_match.group()) if score_match else 0.0
                    except Exception as e:
                        logger.warning(f"Failed to analyze sentiment for article '{title}': {e}")
                        article["sentiment_score"] = 0.0
                else:
                    article["sentiment_score"] = 0.0
        
        news_cache_col.insert_one({
            "query": query,
            "articles": articles,
            "timestamp": time.time()
        })
        return articles
    except Exception as e:
        logger.error(f"Error fetching news for query {query}: {e}")
        raise

def get_crypto_news(query="cryptocurrency", force_refresh=False):
    CACHE_EXPIRATION = 15 * 60  # 15 minutes in seconds
    if force_refresh:
        logger.info(f"Force refresh requested for query: {query}")
        return fetch_crypto_news(query)
    
    cache = news_cache_col.find_one({"query": query})
    if cache and (time.time() - cache["timestamp"] < CACHE_EXPIRATION):
        logger.info(f"Using cached news data for query: {query}")
        return cache["articles"]
    
    logger.info(f"Cache miss or expired for query: {query}")
    return fetch_crypto_news(query)

# Activity Logging Helper
def log_activity(username, action, details=None):
    activity_log_col.insert_one({
        "username": username,
        "action": action,
        "details": details or {},
        "timestamp": datetime.datetime.utcnow()
    })

# New API Route for Market Movers
@app.route("/api/market_movers", methods=["GET"])
def api_market_movers():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        prices = get_live_prices(DEFAULT_COINS)
        trending_coins = []
        top_traded_coins = []
        losers_coins = []

        for coin in prices:
            if prices[coin].get("usd") and prices[coin].get("usd_24h_change") is not None:
                coin_data = {
                    "name": coin.capitalize(),
                    "symbol": COIN_SYMBOLS.get(coin, coin.upper()[:3]),
                    "price": prices[coin]["usd"],
                    "change_24h": prices[coin]["usd_24h_change"]
                }
                trending_coins.append(coin_data)
                losers_coins.append(coin_data)
            if prices[coin].get("usd") and prices[coin].get("usd_24h_vol") is not None:
                top_traded_coins.append({
                    "name": coin.capitalize(),
                    "symbol": COIN_SYMBOLS.get(coin, coin.upper()[:3]),
                    "volume": prices[coin]["usd_24h_vol"],
                    "price": prices[coin]["usd"]
                })

        trending_coins.sort(key=lambda x: x["change_24h"], reverse=True)
        top_traded_coins.sort(key=lambda x: x["volume"], reverse=True)
        losers_coins.sort(key=lambda x: x["change_24h"])

        response = {
            "trending": trending_coins[:5],
            "top_traded": top_traded_coins[:5],
            "losers": losers_coins[:5]
        }

        logger.info(f"Market movers fetched for {session['username']}: {len(response['trending'])} trending, {len(response['top_traded'])} top traded, {len(response['losers'])} losers")
        return jsonify(response), 200
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/market_movers: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/market_movers: {e}")
        return jsonify({"error": "Failed to fetch market movers data."}), 500
    except Exception as e:
        logger.error(f"Error in /api/market_movers: {e}")
        return jsonify({"error": "Failed to fetch market movers data."}), 500

# Updated API Routes for Coin Categories
@app.route("/api/trending_coins", methods=["GET"])
def api_trending_coins():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        prices = get_live_prices(DEFAULT_COINS)
        coins = [
            {
                "name": coin.capitalize(),
                "symbol": COIN_SYMBOLS.get(coin, coin.upper()[:3]),
                "price": prices[coin].get("usd"),
                "change_24h": prices[coin].get("usd_24h_change")
            }
            for coin in prices
            if prices[coin].get("usd") and prices[coin].get("usd_24h_change") is not None
        ]
        coins.sort(key=lambda x: x["change_24h"], reverse=True)
        logger.info(f"Trending coins fetched for {session['username']}: {len(coins[:5])} coins")
        return jsonify(coins[:5])
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/trending_coins: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/trending_coins: {e}")
        return jsonify({"error": "Failed to fetch trending coins."}), 500
    except Exception as e:
        logger.error(f"Error in /api/trending_coins: {e}")
        return jsonify({"error": "Failed to fetch trending coins."}), 500

@app.route("/api/top_traded_coins", methods=["GET"])
def api_top_traded_coins():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        prices = get_live_prices(DEFAULT_COINS)
        coins = [
            {
                "name": coin.capitalize(),
                "symbol": COIN_SYMBOLS.get(coin, coin.upper()[:3]),
                "volume": prices[coin].get("usd_24h_vol"),
                "price": prices[coin].get("usd")
            }
            for coin in prices
            if prices[coin].get("usd") and prices[coin].get("usd_24h_vol") is not None
        ]
        coins.sort(key=lambda x: x["volume"], reverse=True)
        logger.info(f"Top traded coins fetched for {session['username']}: {len(coins[:5])} coins")
        return jsonify(coins[:5])
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/top_traded_coins: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/top_traded_coins: {e}")
        return jsonify({"error": "Failed to fetch top traded coins."}), 500
    except Exception as e:
        logger.error(f"Error in /api/top_traded_coins: {e}")
        return jsonify({"error": "Failed to fetch top traded coins."}), 500

@app.route("/api/losers_coins", methods=["GET"])
def api_losers_coins():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        prices = get_live_prices(DEFAULT_COINS)
        coins = [
            {
                "name": coin.capitalize(),
                "symbol": COIN_SYMBOLS.get(coin, coin.upper()[:3]),
                "price": prices[coin].get("usd"),
                "change_24h": prices[coin].get("usd_24h_change")
            }
            for coin in prices
            if prices[coin].get("usd") and prices[coin].get("usd_24h_change") is not None
        ]
        coins.sort(key=lambda x: x["change_24h"])
        logger.info(f"Losers coins fetched for {session['username']}: {len(coins[:5])} coins")
        return jsonify(coins[:5])
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/losers_coins: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/losers_coins: {e}")
        return jsonify({"error": "Failed to fetch losers coins."}), 500
    except Exception as e:
        logger.error(f"Error in /api/losers_coins: {e}")
        return jsonify({"error": "Failed to fetch losers coins."}), 500

# Existing API Routes
@app.route("/api/market_sentiment", methods=["GET"])
def api_market_sentiment():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        prices = get_live_prices(DEFAULT_COINS)
        changes = [prices.get(coin, {}).get("usd_24h_change", 0) for coin in DEFAULT_COINS]
        valid_changes = [c for c in changes if c is not None]
        if not valid_changes:
            logger.error("No valid price change data available for market sentiment")
            return jsonify({"error": "No price change data available."}), 500
        avg_change = sum(valid_changes) / len(valid_changes)
        score = min(max(int((avg_change + 10) * 5), 0), 100)
        sentiment = "Bullish" if score > 70 else "Bearish" if score < 30 else "Neutral"
        logger.info(f"Market sentiment calculated for {session['username']}: score={score}, sentiment={sentiment}")
        return jsonify({"score": score, "sentiment": sentiment})
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/market_sentiment: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/market_sentiment: {e}")
        return jsonify({"error": "Failed to fetch market sentiment."}), 500
    except Exception as e:
        logger.error(f"Error in /api/market_sentiment: {e}")
        return jsonify({"error": "Failed to fetch market sentiment."}), 500

@app.route("/api/portfolio_summary", methods=["GET"])
def api_portfolio_summary():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        portfolio_items = list(portfolio_col.find({"username": session["username"]}))
        if not portfolio_items:
            logger.info(f"Portfolio is empty for user {session['username']}")
            return jsonify({"error": "Portfolio is empty. Add coins via the portfolio page."}), 404
        valid_items = []
        for item in portfolio_items:
            coin = item.get("coin")
            amount = item.get("amount")
            if not isinstance(coin, str) or not coin.strip():
                logger.warning(f"Invalid coin ID in portfolio for user {session['username']}: {item}")
                continue
            try:
                amount = float(amount)
                if amount < 0:
                    logger.warning(f"Negative amount in portfolio for user {session['username']}, coin {coin}: {amount}")
                    continue
            except (TypeError, ValueError):
                logger.warning(f"Invalid amount in portfolio for user {session['username']}, coin {coin}: {amount}")
                continue
            valid_items.append({"coin": coin, "amount": amount})
        if not valid_items:
            logger.error(f"No valid portfolio items for user {session['username']}")
            return jsonify({"error": "No valid portfolio items found."}), 400
        coin_ids = [item["coin"] for item in valid_items]
        prices = get_live_prices(coin_ids)
        total_value = 0
        allocation = []
        for item in valid_items:
            coin = item["coin"]
            amount = item["amount"]
            price = prices.get(coin, {}).get("usd")
            if price is not None:
                try:
                    value = amount * float(price)
                    total_value += value
                    allocation.append({"coin": coin, "value": value})
                except (TypeError, ValueError) as e:
                    logger.warning(f"Error calculating value for coin {coin}: {e}")
                    continue
        if not allocation:
            logger.error(f"No valid price data for portfolio coins of user {session['username']}")
            return jsonify({"error": "No valid price data for portfolio coins."}), 500
        allocation.sort(key=lambda x: x["value"], reverse=True)
        top_holding = allocation[0]
        top_percentage = (top_holding["value"] / total_value * 100) if total_value > 0 else 0
        logger.info(f"Portfolio summary generated for {session['username']}: total_value={total_value}, top_holding={top_holding['coin']}")
        return jsonify({
            "total_value": total_value,
            "top_holding": {
                "coin": top_holding["coin"],
                "percentage": round(top_percentage, 2)
            },
            "allocation": allocation
        })
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/portfolio_summary: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/portfolio_summary: {e}")
        return jsonify({"error": "Failed to fetch portfolio summary."}), 500
    except Exception as e:
        logger.error(f"Error in /api/portfolio_summary: {e}")
        return jsonify({"error": "Failed to fetch portfolio summary."}), 500

@app.route("/api/crypto_news", methods=["GET"])
def api_crypto_news():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        query = request.args.get("query", "cryptocurrency")
        force_refresh = request.args.get("force_refresh", "false").lower() == "true"
        articles = get_crypto_news(query=query, force_refresh=force_refresh)
        if not articles:
            logger.info(f"No news articles available for user {session['username']} with query {query}")
            return jsonify({"error": "No news articles available."}), 404
        formatted_articles = [
            {
                "title": article["title"],
                "url": article["url"],
                "source": article["source"]["name"],
                "date": article["publishedAt"].split("T")[0],
                "urlToImage": article.get("urlToImage", "")
            }
            for article in articles[:5]
            if article.get("title") and article.get("url") and article.get("source", {}).get("name") and article.get("publishedAt")
        ]
        logger.info(f"Crypto news fetched for {session['username']}: {len(formatted_articles)} articles with query {query}")
        return jsonify(formatted_articles)
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/crypto_news: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/crypto_news: {e}")
        return jsonify({"error": "Failed to fetch crypto news."}), 500
    except Exception as e:
        logger.error(f"Error in /api/crypto_news: {e}")
        return jsonify({"error": "Failed to fetch crypto news."}), 500

@app.route("/api/news", methods=["GET"])
def api_news():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        query = request.args.get("query", "cryptocurrency")
        force_refresh = request.args.get("force_refresh", "false").lower() == "true"
        articles = get_crypto_news(query=query, force_refresh=force_refresh)
        if not articles:
            logger.info(f"No news articles available for user {session['username']} with query {query}")
            return jsonify({"error": "No news articles available."}), 404
        formatted_articles = [
            {
                "title": article["title"],
                "description": article.get("description", ""),
                "source": article["source"]["name"],
                "publishedAt": article["publishedAt"],
                "sentiment_score": article.get("sentiment_score", 0.0),
                "url": article["url"],
                "urlToImage": article.get("urlToImage", "")
            }
            for article in articles[:5]
            if article.get("title") and article.get("url") and article.get("source", {}).get("name") and article.get("publishedAt")
        ]
        logger.info(f"News fetched for {session['username']}: {len(formatted_articles)} articles with query {query}")
        return jsonify(formatted_articles)
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/news: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/news: {e}")
        return jsonify({"error": "Failed to fetch news."}), 500
    except Exception as e:
        logger.error(f"Error in /api/news: {e}")
        return jsonify({"error": "Failed to fetch news."}), 500

@app.route("/api/chatbot", methods=["POST"])
def api_chatbot():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    data = request.get_json(force=True)
    message = data.get("message", "").strip().lower()
    if not message:
        return jsonify({"response": "Please enter a message."}), 400

    try:
        price_match = re.match(r"^(?:/price|price\s+of)\s+([\w\s-]+)$", message)
       
        if price_match:
            coin = price_match.group(1).strip().lower()
            coin_map = {
                "bitcoin": "bitcoin",
                "btc": "bitcoin",
                "ethereum": "ethereum",
                "eth": "ethereum",
                "ripple": "ripple",
                "xrp": "ripple",
                "litecoin": "litecoin",
                "ltc": "litecoin",
                "dogecoin": "dogecoin",
                "doge": "dogecoin",
                "binance coin": "binancecoin",
                "bnb": "binancecoin",
                "cardano": "cardano",
                "ada": "cardano",
                "solana": "solana",
                "sol": "solana",
                "polkadot": "polkadot",
                "dot": "polkadot",
                "chainlink": "chainlink",
                "link": "chainlink"
            }
            coin_id = coin_map.get(coin, coin.replace(" ", ""))
            prices = get_live_prices([coin_id])
            if coin_id in prices and prices[coin_id].get("usd"):
                price = prices[coin_id]["usd"]
                change_24h = prices[coin_id].get("usd_24h_change", 0)
                response = f"The current price of {coin_id.capitalize()} is {format_currency(price)}. "
                response += f"24h change: {change_24h:+.2f}%."
                return jsonify({"response": response})
            else:
                return jsonify({"response": f"Sorry, I couldn't find price data for {coin.capitalize()}."})

        prompt = (
            "You are a cryptocurrency assistant. Provide concise, accurate answers about cryptocurrencies, blockchain, and related topics. "
            f"User query: {message}"
        )
        models = ["gpt-4o-mini", "gpt-3.5-turbo"]
        for model in models:
            try:
                completion = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a crypto assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=150
                )
                response = completion.choices[0].message.content.strip()
                return jsonify({"response": response})
            except Exception as e:
                logger.error(f"OpenAI API error with {model}: {e}")
                if model == models[-1]:
                    return jsonify({"response": "Sorry, I'm having trouble responding right now. Try again later."}), 500
    except HTTPError as e:
        if "429" in str(e):
            return jsonify({"response": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/chatbot: {e}")
        return jsonify({"response": "Failed to fetch data."}), 500
    except Exception as e:
        logger.error(f"Error in /api/chatbot: {e}")
        return jsonify({"response": "An error occurred. Please try again."}), 500

# Authentication Routes
@app.route("/login", methods=["GET", "POST"])
def login_page():
    if request.method == "POST":
        username = request.form.get("username").strip().lower()
        password = request.form.get("password")
        tfa_code = request.form.get("tfa_code", "").strip()
        user = users_col.find_one({"username": username})

        if user and bcrypt.check_password_hash(user["password"], password):
            if user.get("tfa_secret"):
                if not tfa_code:
                    flash("Please enter your 2FA code.", "warning")
                    return render_template("login.html", user=None, show_tfa=True, username=username)
                totp = pyotp.TOTP(user["tfa_secret"])
                if not totp.verify(tfa_code):
                    flash("Invalid 2FA code.", "danger")
                    return render_template("login.html", user=None, show_tfa=True, username=username)
            session["username"] = username
            log_activity(username, "login", {"ip": request.remote_addr})
            flash("Login successful!", "success")
            return redirect(url_for("dashboard_page"))
        else:
            flash("Invalid username or password.", "danger")
            return render_template("login.html", user=None)
    
    return render_template("login.html", user=None)

@app.route("/signup", methods=["GET", "POST"])
def signup_page():
    if request.method == "POST":
        username = request.form.get("username").strip().lower()
        password = request.form.get("password")
        
        if not username or not password:
            flash("Username and password are required.", "danger")
            return render_template("signup.html", user=None)
        
        if users_col.find_one({"username": username}):
            flash("Username already exists.", "danger")
            return render_template("signup.html", user=None)
        
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        users_col.insert_one({
            "username": username,
            "password": hashed_password,
            "watchlist": [],
            "favorite_coin": None,
            "profile_picture": None,
            "tfa_secret": None,
            "api_keys": []
        })
        session["username"] = username
        log_activity(username, "signup")
        flash("Account created successfully!", "success")
        return redirect(url_for("dashboard_page"))
    
    return render_template("signup.html", user=None)

@app.route("/logout")
def logout():
    if "username" in session:
        log_activity(session["username"], "logout")
    session.pop("username", None)
    flash("Logged out successfully.", "success")
    return redirect(url_for("login_page"))

# Profile Routes
@app.route("/profile")
def profile_page():
    if "username" not in session:
        return redirect(url_for("login_page"))
    user = users_col.find_one({"username": session["username"]})
    if not user:
        flash("User not found.", "danger")
        session.pop("username", None)
        return redirect(url_for("login_page"))
    
    coins = user.get("watchlist", [])
    if user.get("favorite_coin"):
        coins.append(user["favorite_coin"])
    prices = {}
    if coins:
        try:
            prices = get_live_prices(list(set(coins)))
        except Exception as e:
            logger.error(f"Error fetching prices for profile: {e}")
            flash("Failed to fetch coin prices.", "danger")
    
    activities = list(activity_log_col.find({"username": session["username"]})
                      .sort("timestamp", -1)
                      .limit(10))
    for activity in activities:
        activity["_id"] = str(activity["_id"])
        activity["timestamp"] = activity["timestamp"].strftime("%Y-%m-%d %H:%M:%S UTC")

    return render_template("profile.html", user=user, prices=prices, activities=activities)

@app.route("/settings")
def settings_page():
    if "username" not in session:
        return redirect(url_for("login_page"))
    user = users_col.find_one({"username": session["username"]})
    if not user:
        flash("User not found.", "danger")
        session.pop("username", None)
        return redirect(url_for("login_page"))
    return render_template("settings.html", user=user)

@app.route("/api/profile/picture", methods=["POST"])
def api_profile_picture():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400
    
    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "No file selected."}), 400
    
    allowed_extensions = {"png", "jpg", "jpeg"}
    if not file.filename.lower().rsplit(".", 1)[-1] in allowed_extensions:
        return jsonify({"error": "Invalid file type. Only PNG, JPG, and JPEG are allowed."}), 400
    
    try:
        file_data = file.read()
        if len(file_data) > 1_000_000:
            return jsonify({"error": "File size exceeds 1MB limit."}), 400
        
        base64_image = base64.b64encode(file_data).decode("utf-8")
        mime_type = file.content_type
        base64_string = f"data:{mime_type};base64,{base64_image}"
        
        users_col.update_one(
            {"username": session["username"]},
            {"$set": {"profile_picture": base64_string}}
        )
        log_activity(session["username"], "update_profile_picture")
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logger.error(f"Error uploading profile picture: {e}")
        return jsonify({"error": "Failed to upload profile picture."}), 500

@app.route("/api/profile/username", methods=["POST"])
def api_profile_username():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    data = request.get_json(force=True)
    new_username = data.get("username", "").strip().lower()
    
    if not new_username:
        return jsonify({"error": "Username is required."}), 400
    
    if users_col.find_one({"username": new_username, "username": {"$ne": session["username"]}}):
        return jsonify({"error": "Username already exists."}), 400
    
    try:
        users_col.update_one(
            {"username": session["username"]},
            {"$set": {"username": new_username}}
        )
        portfolio_col.update_many(
            {"username": session["username"]},
            {"$set": {"username": new_username}}
        )
        alerts_col.update_many(
            {"username": session["username"]},
            {"$set": {"username": new_username}}
        )
        activity_log_col.update_many(
            {"username": session["username"]},
            {"$set": {"username": new_username}}
        )
        log_activity(session["username"], "update_username", {"new_username": new_username})
        session["username"] = new_username
        return jsonify({"status": "success", "new_username": new_username}), 200
    except Exception as e:
        logger.error(f"Error updating username: {e}")
        return jsonify({"error": "Failed to update username."}), 500

@app.route("/api/profile/2fa/setup", methods=["POST"])
def api_2fa_setup():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    user = users_col.find_one({"username": session["username"]})
    if user.get("tfa_secret"):
        return jsonify({"error": "2FA is already enabled."}), 400
    
    tfa_secret = pyotp.random_base32()
    totp = pyotp.TOTP(tfa_secret)
    provisioning_uri = totp.provisioning_uri(name=session["username"], issuer_name="CryptoLux")
    
    qr = qrcode.QRCode()
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    session["tfa_temp_secret"] = tfa_secret
    
    return jsonify({
        "status": "success",
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "secret": tfa_secret
    }), 200

# @app.route("/api/profile/2fa/verify", methods=["POST"])
# def api_2fa_verify():
#     if "username" not in session:
#         return jsonify({"error": "Authentication required. Please log in."}), 401
    
#     if "tfa_temp_secret" not in session:
#         return jsonify({"error": "No 2FA setup in progress."}), 400
    
#     data = request.get_json(force=True)
#     tfa_code = data.get("tfa_code", "").strip()
    
#     if not tfa_code:
#         return jsonify({"error": "2FA code is required."}), 400
    
#     totp = pyotp.TOTP(session["tfa_temp_secret"])
#     if totp.verify(tfa_code):
#         users_col.update_one(
#             {"username": session["username"]},
#             {"$set": {"tfa_secret": session["tfa_temp_secret"]}}
#         )
#         log_activity(session["username"], "enable_2fa")
#         session.pop("tfa_temp_secret", None)
#         return jsonify({"status": "success"}), 200
#     else:
#         return jsonify({"error": "Invalid 2FA code."}), 400
@app.route("/api/profile/2fa/verify", methods=["POST"])
def api_2fa_verify():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if "tfa_temp_secret" not in session:
        return jsonify({"error": "No 2FA setup in progress."}), 400
    data = request.get_json(force=True)
    tfa_code = data.get("tfa_code", "").strip()
    if not tfa_code:
        return jsonify({"error": "2FA code is required."}), 400
    totp = pyotp.TOTP(session["tfa_temp_secret"])
    if totp.verify(tfa_code):
        users_col.update_one(
            {"username": session["username"]},
            {"$set": {"tfa_secret": session["tfa_temp_secret"]}}
        )
        log_activity(session["username"], "enable_2fa")
        session.pop("tfa_temp_secret", None)
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"error": "Invalid 2FA code."}), 400

@app.route("/api/profile/2fa/disable", methods=["POST"])
def api_2fa_disable():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    data = request.get_json(force=True)
    tfa_code = data.get("tfa_code", "").strip()
    user = users_col.find_one({"username": session["username"]})
    
    if not user.get("tfa_secret"):
        return jsonify({"error": "2FA is not enabled."}), 400
    
    if not tfa_code:
        return jsonify({"error": "2FA code is required."}), 400
    
    totp = pyotp.TOTP(user["tfa_secret"])
    if totp.verify(tfa_code):
        users_col.update_one(
            {"username": session["username"]},
            {"$set": {"tfa_secret": None}}
        )
        log_activity(session["username"], "disable_2fa")
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"error": "Invalid 2FA code."}), 400

@app.route("/api/profile/api_key", methods=["POST"])
def api_generate_api_key():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    api_key = secrets.token_urlsafe(32)
    hashed_api_key = bcrypt.generate_password_hash(api_key).decode("utf-8")
    
    users_col.update_one(
        {"username": session["username"]},
        {"$push": {"api_keys": {"key_hash": hashed_api_key, "created_at": datetime.datetime.utcnow()}}}
    )
    log_activity(session["username"], "generate_api_key")
    
    return jsonify({"status": "success", "api_key": api_key}), 200

@app.route("/api/profile/api_key/<index>", methods=["DELETE"])
def api_revoke_api_key(index):
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    try:
        index = int(index)
        users_col.update_one(
            {"username": session["username"]},
            {"$pull": {"api_keys": {"$position": index}}}
        )
        log_activity(session["username"], "revoke_api_key", {"index": index})
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logger.error(f"Error revoking API key: {e}")
        return jsonify({"error": "Failed to revoke API key."}), 400

@app.route("/api/profile/delete", methods=["DELETE"])
def api_profile_delete():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    
    try:
        users_col.delete_one({"username": session["username"]})
        portfolio_col.delete_many({"username": session["username"]})
        alerts_col.delete_many({"username": session["username"]})
        activity_log_col.delete_many({"username": session["username"]})
        log_activity(session["username"], "delete_account")
        session.pop("username", None)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logger.error(f"Error deleting profile: {e}")
        return jsonify({"error": "Failed to delete profile."}), 500

# API for Coin Suggestions
@app.route("/api/coins", methods=["GET"])
def api_coins():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    query = request.args.get("q", "").strip().lower()
    try:
        coins = get_coins_list()
        filtered_coins = [
            {"id": coin["id"], "name": coin["name"], "symbol": coin["symbol"]}
            for coin in coins
            if query and (
                coin["id"].lower().startswith(query) or
                coin["name"].lower().startswith(query) or
                coin["symbol"].lower().startswith(query)
            )
        ][:10]
        return jsonify(filtered_coins)
    except HTTPError as e:
        if "429" in str(e):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error fetching coins list: {e}")
        return jsonify({"error": "Failed to fetch coins list."}), 500
    except Exception as e:
        logger.error(f"Error fetching coins list: {e}")
        return jsonify({"error": "Failed to fetch coins list."}), 500

# Routes: Render Pages
def register_routes():
    @app.route("/")
    def root():
        if "username" not in session:
            return redirect(url_for("login_page"))
        user = users_col.find_one({"username": session["username"]})
        if not user:
            flash("User not found.", "danger")
            session.pop("username", None)
            return redirect(url_for("login_page"))
        return render_template("dashboard.html", user=user)

    @app.route("/dashboard")
    def dashboard_page():
        if "username" not in session:
            return redirect(url_for("login_page"))
        user = users_col.find_one({"username": session["username"]})
        if not user:
            flash("User not found.", "danger")
            session.pop("username", None)
            return redirect(url_for("login_page"))
        return render_template("dashboard.html", user=user)

    @app.route("/portfolio")
    def portfolio_page():
        if "username" not in session:
            return redirect(url_for("login_page"))
        user = users_col.find_one({"username": session["username"]})
        if not user:
            flash("User not found.", "danger")
            session.pop("username", None)
            return redirect(url_for("login_page"))
        return render_template("portfolio.html", user=user)

    @app.route("/compare")
    def compare_page():
        if "username" not in session:
            return redirect(url_for("login_page"))
        user = users_col.find_one({"username": session["username"]})
        if not user:
            flash("User not found.", "danger")
            session.pop("username", None)
            return redirect(url_for("login_page"))
        return render_template("compare.html", user=user)

    @app.route("/alerts")
    def alerts_page():
        if "username" not in session:
            return redirect(url_for("login_page"))
        user = users_col.find_one({"username": session["username"]})
        if not user:
            flash("User not found.", "danger")
            session.pop("username", None)
            return redirect(url_for("login_page"))
        return render_template("alerts.html", user=user)

    @app.route("/news")
    def news_page():
        if "username" not in session:
            return redirect(url_for("login_page"))
        user = users_col.find_one({"username": session["username"]})
        if not user:
            flash("User not found.", "danger")
            session.pop("username", None)
            return redirect(url_for("login_page"))
        return render_template("news.html", user=user)

register_routes()

# API Routes
@app.route("/api/prices", methods=["GET"])
def api_prices():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    coin_list = request.args.get("coins", "").strip()
    if not coin_list:
        return jsonify({"error": "No coins specified."}), 400
    coin_ids = [c.strip().lower() for c in coin_list.split(",")]
    try:
        prices = get_live_prices(coin_ids)
        return jsonify(prices)
    except HTTPError as e:
        if "429" in str(e):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/prices: {e}")
        return jsonify({"error": f"Failed to fetch prices: {e}"}), 500
    except Exception as e:
        logger.error(f"Error in /api/prices: {e}")
        return jsonify({"error": f"Failed to fetch prices: {e}"}), 500

@app.route("/api/market_summary", methods=["GET"])
def api_market_summary():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    default_coins = ["bitcoin", "ethereum", "ripple", "litecoin", "dogecoin"]
    try:
        prices = get_live_prices(default_coins)
    except HTTPError as e:
        if "429" in str(e):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Failed to fetch prices: {e}")
        return jsonify({"error": f"Failed to fetch live prices: {e}"}), 500
    except Exception as e:
        logger.error(f"Failed to fetch prices: {e}")
        return jsonify({"error": f"Failed to fetch live prices: {e}"}), 500

    market_lines = []
    for coin in default_coins:
        price = prices.get(coin, {}).get("usd")
        if price is not None:
            market_lines.append(f"- {coin.capitalize()}: ${price:,.2f}")
        else:
            market_lines.append(f"- {coin.capitalize()}: (unavailable)")

    prompt = (
        "You are a cryptocurrency market analyst. Here are the current prices (USD):\n\n"
        + "\n".join(market_lines)
        + "\n\nPlease write a 2–3 sentence summary of the current market situation, mention any notable movements or trends, and keep it concise."
    )

    models = ["gpt-4o-mini", "gpt-3.5-turbo"]
    for model in models:
        try:
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a crypto market summary generator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            summary = completion.choices[0].message.content.strip()
            return jsonify({"summary": summary})
        except Exception as e:
            logger.error(f"OpenAI API error with {model}: {e}")
            if model == models[-1]:
                return jsonify({"error": f"OpenAI API error: {e}"}), 500

@app.route("/api/market_trend", methods=["GET"])
def api_market_trend():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        prices = get_live_prices(DEFAULT_COINS)
        historical_data = {}
        for coin in DEFAULT_COINS:
            historical = get_historical_prices(coin, days=30)
            historical_data[coin] = historical["prices"]

        labels = historical["labels"]
        avg_prices = []
        for i in range(len(labels)):
            daily_prices = [historical_data[coin][i] for coin in DEFAULT_COINS if i < len(historical_data[coin])]
            if daily_prices:
                avg_prices.append(sum(daily_prices) / len(daily_prices))
            else:
                avg_prices.append(None)

        return jsonify({
            "labels": labels,
            "values": [p if p is not None else 0 for p in avg_prices]
        })
    except HTTPError as e:
        if "429" in str(e):
            logger.error(f"Rate limit exceeded in /api/market_trend: {e}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/market_trend: {e}")
        return jsonify({"error": "Failed to fetch market trend data."}), 500
    except Exception as e:
        logger.error(f"Error in /api/market_trend: {e}")
        return jsonify({"error": "Failed to fetch market trend data."}), 500

@app.route("/api/compare", methods=["GET"])
def api_compare():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    coin1 = request.args.get("coin1", "").strip().lower()
    coin2 = request.args.get("coin2", "").strip().lower()
    if not coin1 or not coin2:
        return jsonify({"error": "Both 'coin1' and 'coin2' required."}), 400
    try:
        prices = get_live_prices([coin1, coin2])
        p1 = prices.get(coin1, {}).get("usd")
        p2 = prices.get(coin2, {}).get("usd")
        market_cap1 = prices.get(coin1, {}).get("usd_market_cap")
        market_cap2 = prices.get(coin2, {}).get("usd_market_cap")
        volume_24h1 = prices.get(coin1, {}).get("usd_24h_vol")
        volume_24h2 = prices.get(coin2, {}).get("usd_24h_vol")
        change_24h1 = prices.get(coin1, {}).get("usd_24h_change")
        change_24h2 = prices.get(coin2, {}).get("usd_24h_change")
        if p1 is None or p2 is None:
            return jsonify({"error": "Invalid coin IDs or price data unavailable."}), 400
        historical1 = get_historical_prices(coin1)
        historical2 = get_historical_prices(coin2)
        return jsonify({
            "coin1": coin1,
            "price1": p1,
            "market_cap1": market_cap1 if market_cap1 is not None else None,
            "volume_24h1": volume_24h1 if volume_24h1 is not None else None,
            "change_24h1": change_24h1 if change_24h1 is not None else None,
            "coin2": coin2,
            "price2": p2,
            "market_cap2": market_cap2 if market_cap2 is not None else None,
            "volume_24h2": volume_24h2 if volume_24h2 is not None else None,
            "change_24h2": change_24h2 if change_24h2 is not None else None,
            "historical1": historical1,
            "historical2": historical2,
            "difference": p1 - p2 if p1 is not None and p2 is not None else None
        })
    except HTTPError as e:
        if "429" in str(e):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        logger.error(f"Error in /api/compare: {e}")
        return jsonify({"error": f"Failed to fetch data: {e}"}), 500
    except Exception as e:
        logger.error(f"Error in /api/compare: {e}")
        return jsonify({"error": f"Failed to fetch data: {e}"}), 500

@app.route("/api/watchlist", methods=["GET", "POST", "DELETE"])
def api_watchlist():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if request.method == "GET":
        user = users_col.find_one({"username": session["username"]})
        watchlist = user.get("watchlist", [])
        prices = {}
        if watchlist:
            try:
                prices = get_live_prices(watchlist)
            except Exception as e:
                logger.error(f"Error fetching watchlist prices: {e}")
        return jsonify({"watchlist": [
            {
                "coin": coin,
                "price": prices.get(coin, {}).get("usd"),
                "change_24h": prices.get(coin, {}).get("usd_24h_change")
            } for coin in watchlist
        ]})
    if request.method == "POST":
        data = request.get_json(force=True)
        coin = data.get("coin", "").strip().lower()
        if not coin:
            return jsonify({"error": "Coin ID required."}), 400
        user = users_col.find_one({"username": session["username"]})
        watchlist = user.get("watchlist", [])
        if coin not in watchlist:
            watchlist.append(coin)
            users_col.update_one(
                {"username": session["username"]},
                {"$set": {"watchlist": watchlist}}
            )
            log_activity(session["username"], "add_to_watchlist", {"coin": coin})
            prices = {}
            try:
                prices = get_live_prices([coin])
            except Exception as e:
                logger.error(f"Error fetching price for {coin}: {e}")
            return jsonify({
                "status": "success",
                "coin": {
                    "coin": coin,
                    "price": prices.get(coin, {}).get("usd"),
                    "change_24h": prices.get(coin, {}).get("usd_24h_change")
                }
            }), 200
        return jsonify({"error": "Coin already in watchlist."}), 400
    if request.method == "DELETE":
        data = request.get_json(force=True)
        coin = data.get("coin", "").strip().lower()
        if not coin:
            return jsonify({"error": "Coin ID required."}), 400
        user = users_col.find_one({"username": session["username"]})
        watchlist = user.get("watchlist", [])
        if coin in watchlist:
            watchlist.remove(coin)
            users_col.update_one(
                {"username": session["username"]},
                {"$set": {"watchlist": watchlist}}
            )
            log_activity(session["username"], "remove_from_watchlist", {"coin": coin})
            return jsonify({"status": "success", "watchlist": watchlist}), 200
        return jsonify({"error": "Coin not in watchlist."}), 404

@app.route("/api/favorite", methods=["POST"])
def api_favorite():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    data = request.get_json(force=True)
    coin = data.get("coin", "").strip().lower()
    if not coin:
        return jsonify({"error": "Coin ID required."}), 400
    users_col.update_one(
        {"username": session["username"]},
        {"$set": {"favorite_coin": coin}}
    )
    log_activity(session["username"], "set_favorite_coin", {"coin": coin})
    prices = {}
    try:
        prices = get_live_prices([coin])
    except Exception as e:
        logger.error(f"Error fetching price for {coin}: {e}")
    return jsonify({
        "status": "success",
        "favorite_coin": {
            "coin": coin,
            "price": prices.get(coin, {}).get("usd"),
            "change_24h": prices.get(coin, {}).get("usd_24h_change")
        }
    }), 200

@app.route("/api/alerts", methods=["GET", "POST"])
def api_alerts():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if request.method == "GET":
        items = [{"_id": str(d["_id"]), "coin": d["coin"], "condition": d['condition'], "price": d['price']} for d in alerts_col.find({"username": session["username"]})]
        return jsonify(items)
    data = request.get_json(force=True)
    coin = data.get("coin", "").strip().lower()
    cond = data.get("condition", "").strip().lower()
    price = data.get("price")
    if cond not in ("above", "below") or not coin or price is None:
        return jsonify({"error": "Fields 'coin', 'condition', 'price' required."}), 400
    try:
        price = float(price)
    except ValueError:
        return jsonify({"error": "'price' must be number."}), 400
    alerts_col.insert_one({"coin": coin, "condition": cond, "price": price, "username": session["username"]})
    log_activity(session["username"], "create_alert", {"coin": coin, "condition": cond, "price": price})
    return jsonify({"status": "success"}), 200

@app.route("/api/alerts/<id>", methods=["DELETE"])
def api_delete_alert(id):
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        result = alerts_col.delete_one({"_id": ObjectId(id), "username": session["username"]})
        if result.deleted_count == 0:
            return jsonify({"error": "Alert not found or not authorized."}), 404
        log_activity(session["username"], "delete_alert", {"alert_id": id})
        return jsonify({"status": "deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/historical_prices", methods=["GET"])
def api_historical_prices():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    coin = request.args.get("coin", "").strip().lower()
    days = request.args.get("days", "30").strip()
    if not coin:
        return jsonify({"error": "Coin ID required."}), 400
    try:
        days = int(days)
    except ValueError:
        return jsonify({"error": "Days must be integer."}), 400
    try:
        historical = get_historical_prices(coin, days)
        prices = historical["prices"]
        labels = historical["labels"]
        if len(prices) >= 7:
            ma = [sum(prices[i:i+7])/7 for i in range(len(prices)-6)]
            ma = [None]*(len(prices)-len(ma)) + ma
        else:
            ma = [None]*len(prices)
        return jsonify({"labels": labels, "prices": prices, "moving_average": ma})
    except HTTPError as e:
        if "429" in str(e):
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        return jsonify({"error": "Failed to fetch historical data."}), 500
    except Exception as e:
        return jsonify({"error": "Failed to fetch historical data."}), 500

@app.route("/api/portfolio", methods=["GET", "POST"])
def api_portfolio():
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    if request.method == "GET":
        items = [{"_id": str(d["_id"]), "coin": d["coin"], "amount": d["amount"]} for d in portfolio_col.find({"username": session["username"]})]
        return jsonify(items)
    data = request.get_json(force=True)
    coin = data.get("coin", "").strip().lower()
    amount = data.get("amount")
    if not coin or amount is None:
        return jsonify({"error": "Both 'coin' and 'amount' are required."}), 400
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"error": "'amount' must be a number."}), 400
    existing = portfolio_col.find_one({"coin": coin, "username": session["username"]})
    if existing:
        portfolio_col.update_one({"_id": existing["_id"], "username": session["username"]}, {"$set": {"amount": amount}})
        log_activity(session["username"], "update_portfolio", {"coin": coin, "amount": amount})
    else:
        portfolio_col.insert_one({"coin": coin, "amount": amount, "username": session["username"]})
        log_activity(session["username"], "add_to_portfolio", {"coin": coin, "amount": amount})
    return jsonify({"status": "success"}), 200

@app.route("/api/portfolio/<id>", methods=["DELETE"])
def delete_portfolio(id):
    if "username" not in session:
        return jsonify({"error": "Authentication required. Please log in."}), 401
    try:
        result = portfolio_col.delete_one({"_id": ObjectId(id), "username": session["username"]})
        if result.deleted_count == 0:
            return jsonify({"error": "Item not found or not authorized."}), 404
        log_activity(session["username"], "delete_from_portfolio", {"portfolio_id": id})
        return jsonify({"status": "deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)