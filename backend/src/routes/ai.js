const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ WORKING CHAT ROUTE (NO AUTH FOR NOW)
router.post('/chat', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    const prompt = `
You are a helpful AI assistant for rural users in India.

Rules:
- Keep answers simple
- Give practical advice
- Use ${language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English'}
- Focus on farming, health, education, government schemes

User question: ${message}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.error("🔥 AI ERROR:", error.message);

    // fallback response (VERY IMPORTANT)
    res.json({
      reply: "Sorry, I couldn't process that. Please try again."
    });
  }
});

module.exports = router;