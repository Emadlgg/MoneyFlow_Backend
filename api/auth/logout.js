const authService = require('../../services/authService');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const result = await authService.signOut();
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    return res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ 
      error: error.message || 'SERVER_ERROR' 
    });
  }
};