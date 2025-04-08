const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { User } = require('../db'); 
const JWT_SECRET = process.env.JWT_SECRET || 'moneyflow';

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario
    const user = await User.create({ email, password: hashedPassword });

    // Genera un token JWT (opcional)
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    
    console.log(`Usuario registrado: ${user.email}`);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrarse' });
  }
});

// Ruta para logearse (opcional)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Busca el usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verifica la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera el token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Ruta para obtener todos los usuarios (para propósitos de prueba o administración)
router.get('/users', async (req, res) => {
  try {
    // Excluimos el campo "password" de la respuesta
    const users = await User.findAll({ attributes: ['id', 'email', 'createdAt'] });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;
