const supabase = require('../../supabase');

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
    const user = await authenticate(req);
    
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("preferences")
        .eq("user_id", user.id)
        .single();
        
      if (error && error.code !== "PGRST116") {
        return res.status(500).json({ error: error.message });
      }
      
      return res.json({ preferences: data?.preferences ?? null });
    }
    
    if (req.method === 'POST') {
      const prefs = req.body?.preferences;
      
      if (!prefs) {
        return res.status(400).json({ error: 'preferences required' });
      }

      const payload = {
        user_id: user.id,
        preferences: prefs,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notification_preferences")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      return res.json({ ok: true, preferences: data.preferences });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    if (error.message === 'Token requerido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: error.message || 'SERVER_ERROR' });
  }
};