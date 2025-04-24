require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db');

const app = express();

// Configuración CORS más segura
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prefijo global para API
app.use('/api', (req, res, next) => {
  console.log(`📦 API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;