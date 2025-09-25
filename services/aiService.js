const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  async generateFinancialTips(userStats) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Actúa como asesor financiero experto. Un usuario tiene estos datos:
        
        📊 SITUACIÓN FINANCIERA:
        - Ingresos totales: $${userStats.totalIncome}
        - Gastos totales: $${userStats.totalExpenses}  
        - Balance neto: $${userStats.netBalance}
        - Categorías de gastos: ${JSON.stringify(userStats.expensesByCategory)}
        
        DAME EXACTAMENTE 4 CONSEJOS:
        - Personalizados para su situación
        - Prácticos y accionables
        - Máximo 25 palabras por consejo
        - En español
        - Formato: "1. [consejo]\\n2. [consejo]\\n..."
      `;

      const result = await model.generateContent(prompt);
      const tips = result.response.text().split('\n').filter(tip => tip.trim());
      
      return {
        success: true,
        tips: tips.slice(0, 4)
      };
    } catch (error) {
      console.error('Error generating tips:', error);
      return {
        success: false,
        error: error.message,
        tips: this.getFallbackTips(userStats)
      };
    }
  }

  getFallbackTips(userStats) {
    const tips = [];
    
    if (userStats.totalExpenses > userStats.totalIncome * 0.8) {
      tips.push("1. Revisa y reduce gastos no esenciales este mes");
    }
    
    if (userStats.netBalance < 0) {
      tips.push("2. Crea un presupuesto 50/30/20: necesidades/deseos/ahorros");
    }
    
    tips.push("3. Automatiza un 10% de tus ingresos para ahorro de emergencia");
    tips.push("4. Revisa suscripciones mensuales y cancela las que no uses");
    
    return tips;
  }
}

module.exports = new AIService();