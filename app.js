require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Monta las rutas de auth con prefijo /api/auth
app.use('/api/auth', require('./routes/auth.routes'));

// Monta las rutas de transacciones con prefijo /api/transactions
app.use('/api/transactions', require('./routes/transaction.routes'));

app.get('/', (req, res) => {
  res.send('MoneyFlow API está funcionando!');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

module.exports = app;
