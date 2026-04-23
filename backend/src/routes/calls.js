const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/request', auth, async (req, res) => {
  const { expert_id, category, notes } = req.body;
  const { data, error } = await supabase.from('call_requests').insert({
    user_id: req.user.id, expert_id, category, notes, status: 'pending'
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/my-requests', auth, async (req, res) => {
  const { data, error } = await supabase.from('call_requests')
    .select('*').or(`user_id.eq.${req.user.id},expert_id.eq.${req.user.id}`)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('call_requests')
    .update({ status }).eq('id', req.params.id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;