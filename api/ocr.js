// api/ocr.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(200).json({ text: '[Simulated OCR]: Normal Blood Pressure 120/80. Prescribed Paracetamol 500mg.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Remove the data URL prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = "Extract all text from this medical document/prescription. Preserve numbers, dosages, and medical terminology accurately.";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (err) {
    console.error('OCR Error:', err);
    return res.status(500).json({ error: 'Failed to extract text from image' });
  }
}
