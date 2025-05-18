// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger básico
app.use('/api', (req, res, next) => {
  console.log(`📦 ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handler genérico
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'SERVER_ERROR' });
});

module.exports = app;
