const transactionService = require('../../services/transactionService');
const supabase = require('../../supabase');
const { handleCors } = require('../_helpers/cors');

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

async function handler(req, res) {
  try {
    const user = await authenticate(req);
    
    if (req.method === 'GET') {
      const filters = {
        type: req.query.type,
        category: req.query.category,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };
      
      const result = await transactionService.getUserTransactions(user.id, filters);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      return res.status(200).json(result.transactions);
      
    } else if (req.method === 'POST') {
      const result = await transactionService.createTransaction(user.id, req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      return res.status(201).json(result.transaction);
      
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error en transactions:', error);
    
    if (error.message === 'Token requerido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'SERVER_ERROR' 
    });
  }
}

module.exports = (req, res) => handleCors(req, res, handler);