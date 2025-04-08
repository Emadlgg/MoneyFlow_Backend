const express = require('express');
const router = express.Router();
const { Transaction } = require('../db'); // Se importa el modelo Transaction desde la configuración de la DB

// Middleware para validar la transacción en el endpoint POST
const validateTransaction = (req, res, next) => {
  const { amount, category } = req.body;
  const errors = {};

  if (amount === undefined || isNaN(amount)) {
    errors.amount = 'Valid amount is required';
  }
  if (!category || !category.trim()) {
    errors.category = 'Category is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }
  next();
};

// Endpoint POST para crear una nueva transacción
router.post('/', validateTransaction, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      amount: parseFloat(req.body.amount),
      category: req.body.category.trim(),
      date: req.body.date || new Date()
    });

    // Devuelve la transacción creada (puedes devolver el objeto completo o formatearlo según prefieras)
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(error.name === 'SequelizeValidationError' ? 400 : 500).json({
      error: 'Transaction processing failed',
      details: error.errors ? error.errors.map(e => ({
        field: e.path,
        message: e.message
      })) : error.message
    });
  }
});

// **Nuevo:** Endpoint GET para obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

module.exports = router;
