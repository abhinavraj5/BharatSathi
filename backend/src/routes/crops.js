const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image' });
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };
    
    const result = await model.generateContent([
      'Analyze this crop image. Identify: 1) Crop type 2) Disease (if any) 3) Cause 4) Treatment/remedies 5) Prevention. Provide practical advice for Indian farmers.',
      imagePart
    ]);
    
    const analysis = result.response.text();
    
    const fileName = `${req.user.id}/${Date.now()}-${req.file.originalname}`;
    await supabase.storage.from('crop-images').upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype
    });
    
    await supabase.from('crop_reports').insert({
      user_id: req.user.id, image_path: fileName, analysis
    });
    
    res.json({ analysis });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;