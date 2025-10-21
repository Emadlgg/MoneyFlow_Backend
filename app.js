require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ✅ CORS configurado correctamente
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://moneyflow-frontend-five.vercel.app',
  'https://moneyflow-frontend.vercel.app',
  'https://moneyflow-frontend-git-develop.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (Postman, curl, etc)
    if (!origin) return callback(null, true);
    
    // Verificar si está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Verificar si es un preview deployment de Vercel
    if (/https:\/\/moneyflow-frontend-.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`📦 ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
  next();
});

// ✅ Rutas (usando /routes que ya tienes)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/tips', require('./routes/tips.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'MoneyFlow Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      transactions: '/api/transactions/*',
      notifications: '/api/notifications/*',
      tips: '/api/tips/*'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'SERVER_ERROR',
    path: req.path
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    message: `La ruta ${req.path} no existe`
  });
});

// Solo para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Exportar para Vercel
module.exports = app;