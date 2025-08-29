const express = require("express");
const router = express.Router();
const supabase = require("../supabase"); // adapta export si es { supabase } en tu proyecto

// auth middleware: obtiene user desde token Bearer
router.use(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
  const token = auth.replace("Bearer ", "");
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Token inválido" });
    req.user = data.user;
    next();
  } catch (err) {
    console.error("auth middleware error:", err);
    return res.status(500).json({ error: "auth error" });
  }
});

// GET /preferences
router.get("/preferences", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("preferences")
      .eq("user_id", req.user.id)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("fetch prefs err:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ preferences: data?.preferences ?? null });
  } catch (err) {
    console.error("GET /preferences error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// POST /preferences  (upsert)
router.post("/preferences", async (req, res) => {
  try {
    const prefs = req.body?.preferences;
    if (!prefs) return res.status(400).json({ error: "preferences required" });

    const payload = {
      user_id: req.user.id,
      preferences: prefs,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("upsert prefs err:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ ok: true, preferences: data.preferences });
  } catch (err) {
    console.error("POST /preferences error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// TAXES DUE endpoints
// GET /taxes -> list taxes_due for user
router.get("/taxes", async (req, res) => {
  try {
    const { data, error } = await supabase.from("taxes_due").select("*").eq("user_id", req.user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ taxes: data });
  } catch (err) {
    console.error("GET /taxes error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// POST /taxes -> create or update tax due (if id provided it updates)
router.post("/taxes", async (req, res) => {
  try {
    const { id, tax_id, tax_label, due_day, due_month, email } = req.body;
    if (!tax_label) return res.status(400).json({ error: "tax_label required" });

    const row = {
      id: id || undefined,
      user_id: req.user.id,
      tax_id: tax_id || null,
      tax_label,
      due_day: due_day || null,
      due_month: due_month || null,
      email: email || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("taxes_due").upsert(row, { onConflict: "id" }).select().single();
    if (error) throw error;
    return res.json({ ok: true, tax: data });
  } catch (err) {
    console.error("POST /taxes error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE /taxes/:id
router.delete("/taxes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase.from("taxes_due").delete().eq("id", id).eq("user_id", req.user.id).select().single();
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /taxes error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

module.exports = router;