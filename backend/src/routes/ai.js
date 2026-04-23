const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a helpful assistant for rural users in India. 
    Respond in ${language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English'}.
    Topics: farming, government schemes, health awareness, education.
    User question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    
    await supabase.from('chat_logs').insert({
      user_id: req.user.id, message, reply, language
    });
    
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/loan-recommend', auth, async (req, res) => {
  try {
    const { crop, landSize, state } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Recommend low-interest agricultural loans and government schemes for an Indian farmer growing ${crop} on ${landSize} acres in ${state}. Include KCC, PM-Kisan, and state-specific options.`;
    const result = await model.generateContent(prompt);
    res.json({ recommendation: result.response.text() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;