const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class TransactionService {
  async createTransaction(userId, transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: transactionData.type,
          amount: parseFloat(transactionData.amount),
          description: transactionData.description,
          category: transactionData.category,
          date: transactionData.date || new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserTransactions(userId, filters = {}) {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Aplicar filtros opcionales
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, transactions: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTransaction(transactionId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteTransaction(transactionId, userId) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTransactionStats(userId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = data.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }
        return acc;
      }, { totalIncome: 0, totalExpenses: 0 });

      stats.balance = stats.totalIncome - stats.totalExpenses;

      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TransactionService();