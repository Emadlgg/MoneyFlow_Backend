const authService = require('../../services/authService');
const { handleCors } = require('../_helpers/cors');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    const result = await authService.signIn(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    return res.status(200).json({
      token: result.session.access_token,
      user: result.user
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ 
      error: error.message || 'SERVER_ERROR' 
    });
  }
}

module.exports = (req, res) => handleCors(req, res, handler);