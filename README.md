# BDashboard

A modern, hacker-style dashboard built with Node.js featuring real-time widgets for time, weather, stocks, crypto, and gold prices.

## Features

- **Main Clock**: Local time with date display
- **Vietnam Clock**: GMT+7 timezone display
- **Houston Weather**: Real-time weather data
- **Stock Indices**: Configurable stock symbols with real-time prices
- **Gold Price**: Current gold spot price
- **Cryptocurrency**: Bitcoin (BTC) and Ethereum (ETH) prices
- **System Status**: Dashboard uptime and last update time

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Keys** (Optional but recommended)
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - **Weather**: Get free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - **Stocks**: Get free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

3. **Run the Dashboard**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access Dashboard**
   Open your browser to: `http://localhost:3000`

## Usage

- **Add Stock Symbols**: Type a stock symbol in the input field and press Enter
- **Remove Stock Symbols**: Click on any stock symbol to remove it (minimum 1 required)
- **Real-time Updates**: All data refreshes automatically at different intervals

## API Endpoints

- `GET /api/weather` - Houston weather data
- `GET /api/crypto` - Bitcoin and Ethereum prices
- `GET /api/gold` - Gold spot price
- `GET /api/stocks/:symbol` - Stock price for given symbol

## Technologies

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, CSS3
- **APIs**: OpenWeatherMap, CoinGecko, Metals.live, Alpha Vantage
- **Styling**: Modern hacker aesthetic with green terminal colors

## Notes

- The dashboard works without API keys but with limited functionality
- Some APIs have rate limits on free tiers
- Weather data updates every 5 minutes
- Crypto prices update every 30 seconds
- Stock prices update every minute

Enjoy your hacker dashboard! 🚀
