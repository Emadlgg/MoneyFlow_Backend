// routes/transaction.routes.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Middleware de autenticación: extrae y valida JWT
router.use(async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  const token = auth.replace('Bearer ', '')
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido' })
  }
  req.user = user
  next()
})

// Listar transacciones del usuario
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// Crear nueva transacción (incluye explícitamente user_id)
router.post('/', async (req, res, next) => {
  const { amount, category, date } = req.body
  if (typeof amount !== 'number' || !category) {
    return res.status(400).json({ error: 'amount y category son requeridos' })
  }
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: req.user.id,
          amount,
          category,
          date: date || new Date()
        }
      ])
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
