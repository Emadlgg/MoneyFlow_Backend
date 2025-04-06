const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db'); // Importa la inicialización de la DB

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en las peticiones

// Rutas (ejemplo)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('MoneyFlow API está funcionando!');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

module.exports = app; // Exporta la app para usarla en index.js