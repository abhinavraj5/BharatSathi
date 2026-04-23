const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  let query = supabase.from('experts')
    .select('*, users(full_name, email)')
    .eq('is_available', true);
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/register', auth, async (req, res) => {
  const { category, specialization, bio, languages } = req.body;
  const { data, error } = await supabase.from('experts').insert({
    user_id: req.user.id, category, specialization, bio, languages,
    is_available: true
  }).select();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.from('users').update({ role: 'expert' }).eq('id', req.user.id);
  res.json(data);
});

router.patch('/availability', auth, async (req, res) => {
  const { is_available } = req.body;
  const { data, error } = await supabase.from('experts')
    .update({ is_available }).eq('user_id', req.user.id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;