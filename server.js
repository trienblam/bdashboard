const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to convert Open-Meteo weather codes to descriptions
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return weatherCodes[code] || 'Unknown';
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/weather', async (req, res) => {
  try {
    // Open-Meteo API - No API key required, completely free
    // Houston coordinates: 29.7604, -95.3698
    // Using Imperial units (Fahrenheit and mph)
    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast?latitude=29.7604&longitude=-95.3698&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=America/Chicago&temperature_unit=fahrenheit&wind_speed_unit=mph'
    );
    
    // Transform data to match expected format
    const weatherData = {
      name: 'Houston',
      main: {
        temp: response.data.current.temperature_2m,
        humidity: response.data.current.relative_humidity_2m
      },
      wind: {
        speed: response.data.current.wind_speed_10m
      },
      weather: [{
        id: response.data.current.weather_code,
        main: getWeatherDescription(response.data.current.weather_code),
        description: getWeatherDescription(response.data.current.weather_code).toLowerCase()
      }]
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/api/crypto', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    );
    res.json(response.data);
  } catch (error) {
    console.error('Crypto API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

app.get('/api/gold', async (req, res) => {
  try {
    // Mock gold data since reliable free gold APIs are limited
    const mockGoldData = {
      price: 2650.50 + (Math.random() - 0.5) * 20, // Mock price around $2650
      change: (Math.random() - 0.5) * 2 // Random change between -1% to +1%
    };
    
    res.json(mockGoldData);
  } catch (error) {
    console.error('Gold API error:', error.message);
    // Return mock data as fallback
    const mockGoldData = {
      price: 2650.50,
      change: 0.5
    };
    res.json(mockGoldData);
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    // Using Yahoo Finance unofficial endpoint - No API key required
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    // Transform Yahoo Finance data to match expected format
    if (response.data && response.data.chart && response.data.chart.result && response.data.chart.result.length > 0) {
      const result = response.data.chart.result[0];
      const meta = result.meta;
      
      const currentPrice = meta.regularMarketPrice || 0;
      const previousClose = meta.previousClose || 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? ((change / previousClose) * 100) : 0;
      
      const transformedData = {
        'Global Quote': {
          '01. symbol': symbol.toUpperCase(),
          '02. open': (meta.regularMarketOpen || 0).toString(),
          '03. high': (meta.regularMarketDayHigh || 0).toString(),
          '04. low': (meta.regularMarketDayLow || 0).toString(),
          '05. price': currentPrice.toString(),
          '06. volume': (meta.regularMarketVolume || 0).toString(),
          '07. latest trading day': new Date().toISOString().split('T')[0],
          '08. previous close': previousClose.toString(),
          '09. change': change.toFixed(2),
          '10. change percent': `${changePercent.toFixed(2)}%`
        }
      };
      res.json(transformedData);
    } else {
      res.status(404).json({ error: 'Stock not found' });
    }
  } catch (error) {
    console.error('Stock API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Hacker Dashboard running on http://localhost:${PORT}`);
});
