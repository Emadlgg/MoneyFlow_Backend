const supabase = require('../../../supabase');

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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const user = await authenticate(req);
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }
    
    const { error } = await supabase
      .from("taxes_due")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) throw error;
    
    return res.json({ ok: true });
    
  } catch (error) {
    if (error.message === 'Token requerido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: error.message || 'SERVER_ERROR' });
  }
};