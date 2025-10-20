const supabase = require('../../supabase');

// Middleware de autenticación inline
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
    
    // Manejar diferentes rutas y métodos
    const path = req.url.split('?')[0];
    
    // GET /api/notifications/preferences
    if (req.method === 'GET' && path.includes('/preferences')) {
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
    
    // POST /api/notifications/preferences
    if (req.method === 'POST' && path.includes('/preferences')) {
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
    
    // GET /api/notifications/taxes
    if (req.method === 'GET' && path.includes('/taxes')) {
      const { data, error } = await supabase
        .from("taxes_due")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      return res.json({ taxes: data });
    }
    
    // POST /api/notifications/taxes
    if (req.method === 'POST' && path.includes('/taxes')) {
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
    
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('Error in notifications:', error);
    
    if (error.message === 'Token requerido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'SERVER_ERROR' 
    });
  }
};