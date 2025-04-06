const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../db'); // Ahora importado desde db/index.js

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validación mejorada
  if (!email?.trim() || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required',
      fields: {
        email: !email?.trim() ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      }
    });
  }

  try {
    const user = await User.create({ 
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10)
    });

    // Respuesta sin password
    const userResponse = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(201).json(userResponse);

  } catch (error) {
    console.error('Registration error:', error);
    
    const statusMap = {
      'SequelizeUniqueConstraintError': 409,
      'SequelizeValidationError': 400,
      default: 500
    };

    res.status(statusMap[error.name] || statusMap.default).json({
      error: 'Registration failed',
      details: error.errors?.map(e => ({
        field: e.path,
        message: e.message
      })) || error.message
    });
  }
});

module.exports = router;