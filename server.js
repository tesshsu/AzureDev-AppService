// server.js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'production'}`,
});
const express = require('express');
const path = require('path');
const yahooFinance = require('yahoo-finance2').default;

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API route for hello (keeping from previous setup)
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// API route to fetch top 20 U.S. stocks
const topStocks = [
    "AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "BRK-B",
    "JPM", "V", "WMT", "MA", "PG", "UNH", "HD", "DIS", "PYPL", "NFLX",
    "ADBE", "CRM"
];

app.get('/api/stocks', async (req, res) => {
    try {
        const stockData = [];
        for (const symbol of topStocks) {
            const ticker = await yahooFinance.quote(symbol);
            const name = ticker.shortName || symbol;
            const price = ticker.regularMarketPrice || 'N/A';
            stockData.push({ symbol, name, price });
        }
        res.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});