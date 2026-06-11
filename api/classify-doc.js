import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { text } = await req.json();

    const prompt = `Analyze the following extracted text from a document. Determine if it is a medical document (e.g., lab results, prescriptions, medical records, discharge summaries, etc.) or something entirely unrelated (like a receipt, legal document, or random text).
    
If it IS a medical document:
Return JSON:
{
  "medical": true,
  "extracted": {
    "conditions": ["list", "of", "conditions"],
    "medications": ["list", "of", "medications"],
    "metrics": ["list", "of", "metrics like Blood Pressure 120/80"]
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
    
    // In case model outputs prefix text before json block
    if (cleanJson.startsWith('{') === false) {
      const startIndex = cleanJson.indexOf('{');
      const endIndex = cleanJson.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        cleanJson = cleanJson.substring(startIndex, endIndex + 1);
      }
    }

    return new Response(cleanJson, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Classification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
