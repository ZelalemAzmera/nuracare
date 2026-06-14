import { GoogleGenerativeAI } from '@google/generative-ai';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

async function handleOCR(req, res) {
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

async function handleClassify(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;

    const prompt = `Analyze the following extracted text from a document. Determine if it is a medical document (e.g., lab results, prescriptions, medical records, discharge summaries, etc.) or something entirely unrelated (like a receipt, legal document, or random text).
    
If it IS a medical document:
Return JSON:
{
  "medical": true,
  "extracted": {
    "conditions": ["list", "of", "conditions"],
    "medications": ["list", "of", "medications"],
    "metrics": ["list", "of", "metrics like Blood Pressure 120/80"],
    "next_visit_date": "YYYY-MM-DD or null if not mentioned",
    "appointment_type": "e.g. Cardiology Follow-up, or null",
    "doctor_name": "Doctor name or null"
  }
}

If it is NOT a medical document:
Return JSON:
{
  "medical": false,
  "reason": "Explain why it is not a medical document and what the user should upload instead."
}

Text to analyze:
${text.slice(0, 3000)}

Output ONLY valid JSON wrapped in triple backticks: \`\`\`json { ... } \`\`\``;

    const { text: responseText } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      temperature: 0.1,
    });

    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```([\s\S]*?)```/) || [null, responseText];
    let cleanJson = jsonMatch[1].trim();
    
    if (cleanJson.startsWith('{') === false) {
      const startIndex = cleanJson.indexOf('{');
      const endIndex = cleanJson.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        cleanJson = cleanJson.substring(startIndex, endIndex + 1);
      }
    }

    return res.status(200).json(JSON.parse(cleanJson));
  } catch (error) {
    console.error('Classification error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleExtractAppointment(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { text } = req.body;
    const prompt = `Extract appointment details from the following message. If it mentions scheduling or having an appointment, checkup, or doctor visit, extract the info.
Return JSON ONLY:
{
  "detected": true/false,
  "name": "e.g. Dentist Appointment",
  "date": "YYYY-MM-DD if specified, else null",
  "doctor": "Doctor name or null"
}

Message: "${text}"
Output ONLY valid JSON wrapped in triple backticks: \`\`\`json { ... } \`\`\``;

    const { text: responseText } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt,
      temperature: 0.1,
    });

    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```([\s\S]*?)```/) || [null, responseText];
    let cleanJson = jsonMatch[1].trim();
    if (cleanJson.startsWith('{') === false) {
      const startIndex = cleanJson.indexOf('{');
      const endIndex = cleanJson.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        cleanJson = cleanJson.substring(startIndex, endIndex + 1);
      }
    }
    return res.status(200).json(JSON.parse(cleanJson));
  } catch (error) {
    console.error('Extraction error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  const action = req.query.action || (req.body && req.body.action);

  switch (action) {
    case 'ocr':
      return handleOCR(req, res);
    case 'classify':
      return handleClassify(req, res);
    case 'extract-appointment':
      return handleExtractAppointment(req, res);
    default:
      return res.status(400).json({ error: 'Invalid or missing action parameter' });
  }
}
