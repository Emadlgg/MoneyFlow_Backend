const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  async generateFinancialTips(userStats) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Eres un asesor financiero experto. Analiza esta situación financiera:
        
        - Ingresos totales: $${userStats.totalIncome}
        - Gastos totales: $${userStats.totalExpenses}  
        - Balance neto: $${userStats.netBalance}
        - Categorías de gastos: ${JSON.stringify(userStats.expensesByCategory)}
        
        IMPORTANTE: Responde SOLO con 4 consejos numerados, sin introducción ni conclusión.
        Formato requerido:
        1. [Consejo específico de máximo 25 palabras]
        2. [Consejo específico de máximo 25 palabras]
        3. [Consejo específico de máximo 25 palabras]
        4. [Consejo específico de máximo 25 palabras]
      `;

      console.log('🤖 Enviando prompt a Gemini...');
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log('📝 Respuesta de Gemini:', responseText);

      // Parsear la respuesta de manera más robusta
      const lines = responseText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0); // Eliminar líneas vacías

      // Filtrar solo las líneas que comienzan con número
      const tips = lines
        .filter(line => /^\d+\./.test(line)) // Solo líneas que empiezan con "1.", "2.", etc.
        .slice(0, 4); // Tomar solo los primeros 4

      console.log('✅ Tips parseados:', tips);

      // Si no se obtuvieron suficientes tips, usar fallback
      if (tips.length < 4) {
        console.warn('⚠️ No se obtuvieron 4 consejos, usando fallback');
        return {
          success: false,
          error: 'No se pudieron generar suficientes consejos',
          tips: this.getFallbackTips(userStats)
        };
      }

      return {
        success: true,
        tips: tips
      };
    } catch (error) {
      console.error('❌ Error generating tips:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
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
    
    return tips.slice(0, 4); // Asegurar que siempre sean 4
  }
}

module.exports = new AIService();