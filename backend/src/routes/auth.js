const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role, phone, language } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    await supabase.from('users').insert({
      id: data.user.id, email, full_name: fullName,
      role: role || 'user', phone, language: language || 'en'
    });

    res.json({ user: data.user, session: data.session });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    
    const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
    res.json({ user: data.user, profile, session: data.session });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;