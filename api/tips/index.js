const aiService = require('../../services/aiService');
const supabase = require('../../supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Autenticación inline
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Validar datos
    const { totalIncome, totalExpenses, expensesByCategory } = req.body;
    
    if (!totalIncome || !totalExpenses) {
      return res.status(400).json({ 
        error: 'Datos financieros incompletos' 
      });
    }

    const userStats = {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      expensesByCategory: expensesByCategory || {}
    };

    const result = await aiService.generateFinancialTips(userStats);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in tips route:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};