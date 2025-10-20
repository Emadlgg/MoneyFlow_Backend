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
      const { data, error } = await supabase
        .from("taxes_due")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      return res.json({ taxes: data });
    }
    
    if (req.method === 'POST') {
      const { id, tax_id, tax_label, due_day, due_month, email } = req.body;
      
      if (!tax_label) {
        return res.status(400).json({ error: 'tax_label required' });
      }

      const row = {
        id: id || undefined,
        user_id: user.id,
        tax_id: tax_id || null,
        tax_label,
        due_day: due_day || null,
        due_month: due_month || null,
        email: email || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("taxes_due")
        .upsert(row, { onConflict: "id" })
        .select()
        .single();
        
      if (error) throw error;
      
      return res.json({ ok: true, tax: data });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    if (error.message === 'Token requerido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: error.message || 'SERVER_ERROR' });
  }
}

module.exports = (req, res) => handleCors(req, res, handler);