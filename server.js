const express = require('express');
const path = require('path');
const yahooFinance = require('yahoo-finance2').default;
const client = require('prom-client'); // Add prom-client for metrics

const app = express();

// Enable metrics collection for default Node.js metrics (e.g., CPU, memory)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Create a custom counter metric for HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware to count HTTP requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  res.on('finish', () => {
    console.log(`Request finished: ${req.method} ${req.path} ${res.statusCode}`);
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API route for hello
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

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});