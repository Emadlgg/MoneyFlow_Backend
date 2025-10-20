const transactionService = require('../../services/transactionService');
const supabase = require('../../supabase');

// Middleware de autenticación inline
async function authenticate(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token requerido');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Token inválido');
  }
  
  return user;
}

module.exports = async (req, res) => {
  try {
    // Autenticar usuario
    const user = await authenticate(req);
    
    // Obtener ID de la transacción desde la URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID de transacción requerido' });
    }
    
    if (req.method === 'GET') {
      // Obtener transacción específica
      const result = await transactionService.getUserTransactions(user.id, {});
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      const transaction = result.transactions.find(t => t.id === id);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }
      
      return res.status(200).json(transaction);
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Actualizar transacción
      const result = await transactionService.updateTransaction(id, user.id, req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      return res.status(200).json(result.transaction);
      
    } else if (req.method === 'DELETE') {
      // Eliminar transacción
      const result = await transactionService.deleteTransaction(id, user.id);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      return res.status(200).json({ message: 'Transacción eliminada' });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error en transaction by id:', error);
    
    if (error.message === 'Token requerido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'SERVER_ERROR' 
    });
  }
};