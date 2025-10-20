const authService = require('../../services/authService');
const { handleCors } = require('../_helpers/cors');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password, userData } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    const result = await authService.signUp(email, password, userData);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    return res.status(201).json({
      user: { id: result.user.id, email: result.user.email }
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ 
      error: error.message || 'SERVER_ERROR' 
    });
  }
}

module.exports = (req, res) => handleCors(req, res, handler);