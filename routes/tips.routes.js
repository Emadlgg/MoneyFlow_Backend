const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const supabase = require('../supabase'); // ← Importar supabase directamente

router.post('/generate', async (req, res) => {
  try {
    // ✅ Autenticación inline (sin middleware)
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // ✅ Resto de la lógica igual
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
    
    res.json(result);
  } catch (error) {
    console.error('Error in tips route:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
});

module.exports = router;