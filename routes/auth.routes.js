// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Registro
router.post('/register', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) throw error;

    return res.status(201).json({
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    res.json({
      token: data.session.access_token,
      user: data.user
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
