const aiService = require('../../services/aiService');
const supabase = require('../../supabase');
const { handleCors } = require('../_helpers/cors');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('📥 [Tips API] Request recibida');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ No Authorization header');
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Token inválido:', authError);
      return res.status(401).json({ error: 'Token inválido' });
    }

    console.log('✅ Usuario autenticado:', user.id);

    const { totalIncome, totalExpenses, expensesByCategory } = req.body;
    
    console.log('📊 Datos recibidos:', { totalIncome, totalExpenses });
    
    if (totalIncome === undefined || totalIncome === null || 
        totalExpenses === undefined || totalExpenses === null) {
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

    console.log('🤖 Generando tips con IA...');
    const result = await aiService.generateFinancialTips(userStats);
    
    console.log('✅ Tips generados:', result);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error in tips route:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

module.exports = (req, res) => handleCors(req, res, handler);