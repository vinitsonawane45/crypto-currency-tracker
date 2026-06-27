# 🪙 CryptoLux — Cryptocurrency Tracker

A full-stack cryptocurrency tracking web application built with **Flask** and **MongoDB**. CryptoLux provides real-time coin prices, portfolio management, price alerts, news sentiment analysis, an AI-powered chatbot, and robust user authentication — all in one place.

---

## 🚀 Feature

- **Live Crypto Prices** — Fetches real-time prices from the CoinGecko API for 10 major coins (BTC, ETH, XRP, LTC, DOGE, BNB, ADA, SOL, DOT, LINK).
- **Market Movers** — Displays top trending coins, top traded coins by volume, and biggest losers in 24 hours.
- **Market Sentiment** — Calculates a market sentiment score (Bullish / Neutral / Bearish) based on aggregate 24h price changes.
- **Historical Price Charts** — View price history for any supported coin over customizable time ranges.
- **Portfolio Management** — Track your holdings; view total portfolio value and asset allocation breakdown.
- **Price Alerts** — Set and manage price alerts for any supported coin.
- **Watchlist & Favourite Coin** — Personalise your dashboard by pinning coins you care about.
- **Crypto News Feed** — Pulls the latest cryptocurrency news from NewsAPI with AI-powered sentiment scoring on each headline.
- **AI Chatbot** — Ask anything about crypto; powered by OpenAI GPT (with a fast `/price <coin>` shortcut command).
- **User Authentication** — Secure sign-up / login with bcrypt-hashed passwords.
- **Two-Factor Authentication (2FA)** — TOTP-based 2FA with QR code setup via `pyotp` and `qrcode`.
- **Profile Management** — Update username, upload a profile picture, view activity history.
- **API Key Management** — Generate and revoke personal API keys from the settings page.
- **Activity Logging** — Every significant user action is persisted in MongoDB for audit purposes.
- **Smart Caching** — MongoDB TTL indexes cache API responses (prices: 5 min, news: 15 min, historical: 1 h, coin list: 24 h) to minimise external API calls.
- **Retry Logic** — All external API calls use `tenacity` with exponential back-off and up to 5 retry attempts.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| Database | MongoDB (via PyMongo) |
| Authentication | Flask-Bcrypt, pyotp (TOTP 2FA) |
| Price Data | CoinGecko API |
| News | NewsAPI |
| AI / Chatbot | OpenAI API (GPT-4o-mini / GPT-3.5-turbo) |
| Sentiment Analysis | OpenAI API |
| Frontend | HTML, CSS, Jinja2 templates |
| Resilience | tenacity (retry + back-off) |
| Config | python-dotenv |

---

## 📁 Project Structure

```
crypto-currency-tracker/
├── app.py               # Main Flask application (routes, API helpers, auth)
├── templates/           # Jinja2 HTML templates
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── profile.html
│   └── settings.html
├── static/              # CSS, JS, and image assets
├── app.log              # Application log file (auto-generated)
├── .env                 # Environment variables (not committed)
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.9+
- MongoDB instance (local or cloud, e.g. MongoDB Atlas)
- CoinGecko API access (free tier works)
- NewsAPI key — [newsapi.org](https://newsapi.org)
- OpenAI API key — [platform.openai.com](https://platform.openai.com)

### 1. Clone the repository

```bash
git clone https://github.com/vinitsonawane45/crypto-currency-tracker.git
cd crypto-currency-tracker
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> If a `requirements.txt` is not present, install the packages manually:
> ```bash
> pip install flask pymongo python-dotenv flask-bcrypt pyotp qrcode openai requests tenacity
> ```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
OPENAI_API_KEY=sk-...
NEWS_API_KEY=your_newsapi_key
```

### 5. Run the application

```bash
python app.py
```

The app will start at `http://127.0.0.1:5000`.

---

## 🔌 API Endpoints

All endpoints require an active session (login first).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/market_movers` | Trending, top traded, and losing coins |
| GET | `/api/trending_coins` | Top 5 coins by 24h price gain |
| GET | `/api/top_traded_coins` | Top 5 coins by 24h trading volume |
| GET | `/api/losers_coins` | Top 5 coins by 24h price drop |
| GET | `/api/market_sentiment` | Overall market sentiment score |
| GET | `/api/portfolio_summary` | Portfolio total value and allocation |
| GET | `/api/crypto_news?query=...` | Latest news headlines (no sentiment) |
| GET | `/api/news?query=...` | Latest news with sentiment scores |
| POST | `/api/chatbot` | AI chatbot response |
| POST | `/api/profile/picture` | Upload profile picture |
| POST | `/api/profile/username` | Update username |
| POST | `/api/profile/2fa/setup` | Initialise 2FA — returns QR code |
| POST | `/api/profile/2fa/verify` | Confirm & enable 2FA |
| POST | `/api/profile/2fa/disable` | Disable 2FA |
| POST | `/api/profile/api_key` | Generate a new API key |
| DELETE | `/api/profile/api_key/<index>` | Revoke an API key |

---

## 🤖 Chatbot Usage

From any page, you can send messages to the built-in chatbot:

- **Quick price lookup**: `/price bitcoin` or `price of ETH`
- **General crypto questions**: e.g. *"What is DeFi?"*, *"How does Proof of Stake work?"*

---

## 🔐 Security Notes

- Passwords are hashed with **bcrypt** — never stored in plain text.
- Two-factor authentication uses **TOTP** (compatible with Google Authenticator, Authy, etc.).
- API keys are stored as bcrypt hashes; the raw key is shown only once at generation.
- Session secret is generated with `os.urandom(24)` — set a stable `SECRET_KEY` in `.env` for production.

---

## 🪙 Supported Coins

| Name | Symbol | CoinGecko ID |
|---|---|---|
| Bitcoin | BTC | bitcoin |
| Ethereum | ETH | ethereum |
| XRP | XRP | ripple |
| Litecoin | LTC | litecoin |
| Dogecoin | DOGE | dogecoin |
| BNB | BNB | binancecoin |
| Cardano | ADA | cardano |
| Solana | SOL | solana |
| Polkadot | DOT | polkadot |
| Chainlink | LINK | chainlink |

---

## 📜 License

This project is open-source. Feel free to fork, modify, and build on it.

---

## 🙌 Acknowledgements

- [CoinGecko](https://www.coingecko.com) — Free crypto price data
- [NewsAPI](https://newsapi.org) — News aggregation
- [OpenAI](https://openai.com) — GPT-powered chatbot and sentiment analysis
- [Flask](https://flask.palletsprojects.com) — Lightweight Python web framework
- [MongoDB](https://www.mongodb.com) — Flexible NoSQL database
