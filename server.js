// server.js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'production'}`,
});
const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 8080;
const apiEndpoint = process.env.API_ENDPOINT || 'http://localhost:3000';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/endpoint', (req, res) => {
  res.json({ endpoint: apiEndpoint });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
