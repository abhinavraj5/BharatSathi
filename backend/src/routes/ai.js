const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-pro" // ✅ WORKING MODEL
    });

    const result = await model.generateContent(message);

    const reply = result.response.text();

    res.json({ reply });

  } catch (e) {
    console.error("🔥 AI ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;