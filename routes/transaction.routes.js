const express = require('express');
const router = express.Router();
const { Transaction } = require('../db'); // Importación clave desde db/index.js

const validateTransaction = (req, res, next) => {
  const { amount, category } = req.body;
  
  const errors = {};
  if (!amount || isNaN(amount)) errors.amount = 'Valid amount is required';
  if (!category?.trim()) errors.category = 'Category is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

router.post('/', validateTransaction, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      amount: parseFloat(req.body.amount),
      category: req.body.category.trim(),
      date: req.body.date || new Date()
    });

    res.status(201).json({
      id: transaction.id,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      createdAt: transaction.createdAt
    });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(error.name === 'SequelizeValidationError' ? 400 : 500).json({ 
      error: 'Transaction processing failed',
      details: error.errors?.map(e => ({
        field: e.path,
        message: e.message
      })) || error.message
    });
  }
});

module.exports = router;