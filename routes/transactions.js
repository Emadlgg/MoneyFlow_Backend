const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transacciones');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});