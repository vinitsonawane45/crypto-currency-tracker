
import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from binance.client import Client
from binance.exceptions import BinanceAPIException
import time
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI")
mongo_client = MongoClient(mongo_uri)
db = mongo_client.get_database("crypto_dashboard")

# Binance API setup
binance_api_key = os.getenv("BINANCE_API_KEY")
binance_secret_key = os.getenv("BINANCE_SECRET_KEY")
client = Client(binance_api_key, binance_secret_key)

# Synchronize Binance server time
try:
    server_time = client.get_server_time()
    local_time = int(time.time() * 1000)
    client.timestamp_offset = server_time['serverTime'] - local_time
    logging.info(f"Binance server time synchronized. Offset: {client.timestamp_offset} ms")
except BinanceAPIException as e:
    logging.error(f"Failed to synchronize Binance server time: {str(e)}")
    client.timestamp_offset = 0  # Fallback to no offset

# Fetch available USDT trading pairs from Binance
def fetch_usdt_symbols():
    try:
        exchange_info = client.get_exchange_info()
        usdt_symbols = {}
        for symbol_info in exchange_info['symbols']:
            symbol = symbol_info['symbol']
            if symbol.endswith('USDT'):
                base_asset = symbol_info['baseAsset'].lower()  # e.g., BTC -> btc
                # Simplified mapping: assume base asset lowercase matches CoinGecko ID
                coin_id = base_asset  # e.g., btc -> btc (we'll treat this as "bitcoin")
                usdt_symbols[coin_id] = symbol  # e.g., { "btc": "BTCUSDT" }
        logging.info(f"Fetched {len(usdt_symbols)} USDT trading pairs from Binance")
        return usdt_symbols
    except BinanceAPIException as e:
        logging.error(f"Failed to fetch USDT symbols from Binance: {str(e)}")
        return {}

# Global variable to store USDT symbols (replaces COIN_MAPPING)
USDT_SYMBOLS = fetch_usdt_symbols()

# Retry decorator for Binance API calls
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
def fetch_binance_price(symbol):
    try:
        ticker = client.get_ticker(symbol=symbol)
        price = float(ticker["lastPrice"])
        price_change = float(ticker["priceChangePercent"])
        return {"usd": price, "usd_24h_change": price_change}
    except BinanceAPIException as e:
        logging.error(f"Failed to fetch price for {symbol}: {str(e)}")
        return {"usd": 0.0, "usd_24h_change": 0.0}

@app.route("/")
def index():
    watchlist = list(db.watchlist.find())
    trending = []
    # Use a subset of USDT symbols as trending coins (e.g., top 5 by trading volume)
    trending_symbols = list(USDT_SYMBOLS.items())[:5]  # Limit to 5 for simplicity
    for coin_id, symbol in trending_symbols:
        price_data = fetch_binance_price(symbol)
        trending.append({
            "id": coin_id,
            "name": coin_id.capitalize(),
            "symbol": symbol.replace("USDT", "").lower(),
            "current_price": price_data["usd"],
            "price_change_percentage_24h": price_data["usd_24h_change"],
            "image": f"/api/image/{coin_id}"
        })
    return render_template("index.html", coins=watchlist, trending=trending)

@app.route("/api/prices")
def get_prices():
    coin_ids = request.args.getlist("ids")
    if not coin_ids:
        watchlist = list(db.watchlist.find())
        trending = list(USDT_SYMBOLS.keys())[:5]  # Use top 5 as trending
        coin_ids = list(set([coin["id"] for coin in watchlist] + trending))
    
    logging.info(f"Fetching prices for coin IDs: {coin_ids}")
    prices = {}
    for coin_id in coin_ids:
        symbol = USDT_SYMBOLS.get(coin_id.lower())
        if not symbol:
            logging.warning(f"No Binance symbol for {coin_id}")
            prices[coin_id] = {"usd": 0.0, "usd_24h_change": 0.0}
            continue
        price_data = fetch_binance_price(symbol)
        if price_data["usd"] == 0.0:
            logging.warning(f"No price data found for {coin_id} ({symbol})")
        prices[coin_id] = price_data
    return jsonify(prices)

@app.route("/api/history/<coin_id>")
def get_history(coin_id):
    symbol = USDT_SYMBOLS.get(coin_id.lower())
    if not symbol:
        return jsonify({"error": "Coin not supported"}), 404

    range_param = request.args.get("range", "all")
    intervals = {
        "24h": (Client.KLINE_INTERVAL_1HOUR, 24),
        "7d": (Client.KLINE_INTERVAL_4HOUR, 7 * 6),
        "30d": (Client.KLINE_INTERVAL_1DAY, 30),
        "90d": (Client.KLINE_INTERVAL_1DAY, 90),
        "all": (Client.KLINE_INTERVAL_1WEEK, 52)
    }
    interval, limit = intervals.get(range_param, intervals["all"])

    try:
        klines = client.get_historical_klines(symbol, interval, limit=limit)
        history = [{"t": int(kline[0]), "p": float(kline[4])} for kline in klines]
        return jsonify(history)
    except BinanceAPIException as e:
        logging.error(f"Failed to fetch history for {coin_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch historical data"}), 500

@app.route("/add", methods=["POST"])
def add_to_watchlist():
    symbol = request.form.get("symbol").lower()
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    if symbol not in USDT_SYMBOLS:
        return jsonify({"error": "Coin not supported"}), 400

    existing = db.watchlist.find_one({"id": symbol})
    if existing:
        return jsonify({"error": "Coin already in watchlist"}), 400

    coin_data = {"id": symbol, "name": symbol.capitalize(), "symbol": symbol}
    db.watchlist.insert_one(coin_data)
    return jsonify({"success": True})

@app.route("/remove", methods=["POST"])
def remove_from_watchlist():
    data = request.get_json()
    coin_id = data.get("id").lower()
    db.watchlist.delete_one({"id": coin_id})
    return jsonify({"success": True})

@app.route("/api/portfolio", methods=["GET", "POST", "DELETE"])
def portfolio():
    if request.method == "POST":
        data = request.get_json()
        coin = data.get("coin").lower()
        if coin not in USDT_SYMBOLS:
            return jsonify({"error": "Coin not supported"}), 400
        amount = float(data.get("amount"))
        price = float(data.get("price"))
        entry = {
            "coin": coin,
            "amount": amount,
            "price": price,
            "timestamp": int(time.time() * 1000)
        }
        db.portfolio.insert_one(entry)
        return jsonify({"success": True})

    if request.method == "DELETE":
        coin = request.args.get("coin").lower()
        db.portfolio.delete_one({"coin": coin})
        return jsonify({"success": True})

    portfolio = list(db.portfolio.find())
    prices = fetch_binance_prices([entry["coin"] for entry in portfolio])
    for entry in portfolio:
        coin_id = entry["coin"]
        current_price = prices.get(coin_id, {}).get("usd", 0.0)
        entry["current_price"] = current_price
        entry["current_value"] = entry["amount"] * current_price
        entry["profit_loss"] = (current_price - entry["price"]) * entry["amount"]
        entry["profit_loss_pct"] = ((current_price - entry["price"]) / entry["price"]) * 100 if entry["price"] > 0 else 0
    return jsonify(portfolio)

def fetch_binance_prices(coin_ids):
    prices = {}
    for coin_id in coin_ids:
        symbol = USDT_SYMBOLS.get(coin_id.lower())
        if symbol:
            prices[coin_id] = fetch_binance_price(symbol)
        else:
            prices[coin_id] = {"usd": 0.0, "usd_24h_change": 0.0}
    return prices

@app.route("/api/summary")
def summary():
    try:
        portfolio = list(db.portfolio.find())
        if not portfolio:
            return jsonify({"portfolio_value": 0.0, "portfolio_profit_loss": 0.0})

        prices = fetch_binance_prices([entry["coin"] for entry in portfolio])
        total_value = 0.0
        total_profit_loss = 0.0

        for entry in portfolio:
            coin_id = entry["coin"].lower()
            amount = entry["amount"]
            entry_price = entry["price"]
            current_price = prices.get(coin_id, {}).get("usd", 0.0)
            
            current_value = amount * current_price
            profit_loss = (current_price - entry_price) * amount

            total_value += current_value
            total_profit_loss += profit_loss

        return jsonify({
            "portfolio_value": total_value,
            "portfolio_profit_loss": total_profit_loss
        })
    except Exception as e:
        logging.error(f"Error in /api/summary: {str(e)}")
        return jsonify({"error": "Failed to fetch summary"}), 500

@app.route("/api/alerts", methods=["GET", "POST", "DELETE"])
def alerts():
    if request.method == "POST":
        data = request.get_json()
        coin = data.get("coin").lower()
        if coin not in USDT_SYMBOLS:
            return jsonify({"error": "Coin not supported"}), 400
        high = data.get("high")
        low = data.get("low")
        if high is None and low is None:
            return jsonify({"error": "At least one price threshold must be set"}), 400
        alert = {"coin": coin, "high": high, "low": low}
        db.alerts.update_one({"coin": coin}, {"$set": alert}, upsert=True)
        return jsonify({"success": True})

    if request.method == "DELETE":
        coin = request.args.get("coin").lower()
        db.alerts.delete_one({"coin": coin})
        return jsonify({"success": True})

    return jsonify(list(db.alerts.find()))

@app.route("/api/notes", methods=["GET", "POST"])
def notes():
    if request.method == "POST":
        data = request.get_json()
        coin = data.get("coin").lower()
        text = data.get("text")
        db.notes.update_one({"coin": coin}, {"$set": {"text": text}}, upsert=True)
        return jsonify({"success": True})

    return jsonify(list(db.notes.find()))

@app.route("/api/compare", methods=["GET", "POST"])
def compare():
    if request.method == "POST":
        data = request.get_json()
        coins = data.get("coins")
        if len(coins) < 2 or len(coins) > 5:
            return jsonify({"error": "Select 2-5 coins to compare"}), 400

        # Validate coins
        for coin in coins:
            if coin.lower() not in USDT_SYMBOLS:
                return jsonify({"error": f"Coin not supported: {coin}"}), 400

        comparison_id = str(int(time.time() * 1000))
        history = {}
        for coin in coins:
            symbol = USDT_SYMBOLS.get(coin.lower())
            if symbol:
                klines = client.get_historical_klines(symbol, Client.KLINE_INTERVAL_1DAY, limit=30)
                history[coin] = [{"date": kline[0], "price": float(kline[4])} for kline in klines]

        comparison = {
            "id": comparison_id,
            "coins": coins,
            "history": history,
            "created_at": int(time.time() * 1000)
        }
        db.comparisons.insert_one(comparison)
        return jsonify({"id": comparison_id})

    comparison_id = request.args.get("id")
    if comparison_id:
        comparison = db.comparisons.find_one({"id": comparison_id})
        if not comparison:
            return jsonify({"error": "Comparison not found"}), 404
        return jsonify(comparison["history"])

    comparisons = list(db.comparisons.find().sort("created_at", -1).limit(5))
    return jsonify(comparisons)

@app.route("/api/search")
def search():
    query = request.args.get("q", "").lower()
    coins = []
    for coin_id in USDT_SYMBOLS.keys():
        if query in coin_id:
            symbol = USDT_SYMBOLS[coin_id]
            coins.append({
                "id": coin_id,
                "name": coin_id.capitalize(),
                "symbol": symbol.replace("USDT", "").lower()
            })
    return jsonify(coins)

@app.route("/api/image/<coin_id>")
def get_image(coin_id):
    return jsonify(f"https://coin-images.coingecko.com/coins/images/{coin_id}/large/icon.png")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
