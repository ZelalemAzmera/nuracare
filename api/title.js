export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
    return new Response(JSON.stringify({ error: { message: 'GROQ_API_KEY is missing in Vercel Environment Variables.' } }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { firstUserMsg, firstAiSummary } = await req.json();

    const prompt = `Generate a concise 2-4 word chat session title for this health conversation.
User said: "${firstUserMsg || ''}". Nura responded about: "${firstAiSummary || ''}".
Format: Title Case, no quotes, no punctuation.`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ 
        model: 'llama-3.3-70b-versatile', 
        messages: [{ role: 'user', content: prompt }], 
        temperature: 0.3, 
        max_tokens: 20, 
        stream: false 
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return new Response(JSON.stringify(err), { status: groqRes.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await groqRes.json();
    let title = data.choices?.[0]?.message?.content?.trim()?.replace(/["']/g, '') || 'New Session';
    title = title.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();

    return new Response(JSON.stringify({ title }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Title API error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
