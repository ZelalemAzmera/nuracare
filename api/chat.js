// Edge runtime — proxies Groq streaming SSE to the client
export const config = { runtime: 'edge' };

function buildSystemPrompt(profile, memoryContext, lang) {
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const recentRecords = (profile?.records || []).slice(-5).map(r =>
    `- ${r.dateStr}: ${r.summary} (${r.urgency} urgency) — action: ${r.action}`
  ).join('\n') || 'No past records yet.';

  const crossMemory = memoryContext || 'No previous sessions yet.';

  const localHerbsDB = {
    ET: ['Damakese (Ocimum lamiifolium)', 'Tena Adam (Ruta chalepensis)', 'Gesho (Rhamnus prinoides)', 'Kosso (Hagenia abyssinica)', 'Wogert (Zehneria scabra)'],
    NG: ['Moringa', 'Bitter leaf (Vernonia amygdalina)', 'Scent leaf (Ocimum gratissimum)'],
    IN: ['Tulsi (Holy Basil)', 'Ashwagandha', 'Turmeric', 'Neem', 'Triphala'],
    DEFAULT: ['Ginger', 'Turmeric', 'Chamomile', 'Peppermint', 'Echinacea']
  };
  const countryCode = profile?.location?.code || 'DEFAULT';
  const userHerbs = localHerbsDB[countryCode] || localHerbsDB['DEFAULT'];

  const medicalNotes = profile?.medicalNotes ? `\nEXTRACTED MEDICAL NOTES (from user uploads):\n${profile.medicalNotes}` : '';

  return `You are Nura, a warm and empathetic AI health companion for NuraCare. You are medically informed but always make clear you are not a replacement for a doctor.

USER PROFILE:
- Name: ${profile?.name || 'there'}
- Age: ${profile?.age ? profile.age + ' years old' : 'unknown'}
- Known conditions: ${profile?.conditions?.length ? profile.conditions.join(', ') : 'none reported'}
- Current medications: ${profile?.medications || 'none reported'}

PAST HEALTH RECORDS (last 5 sessions):
${recentRecords}
${medicalNotes}
USER'S LOCAL HERBS (prefer these when suggesting natural remedies):
${userHerbs.join(', ')}

CROSS-SESSION MEMORY (general knowledge from previous conversations — use this to personalize, reference past topics when relevant, never repeat questions already answered):
${crossMemory}

MEMORY RULES: Always reference the user's name (${firstName}). If they had a similar symptom before, mention it. Use cross-session memory to show you remember them. Keep track of what they told you earlier in THIS conversation — don't ask for info they already shared.

YOUR APPROACH: Have a natural caring conversation. Ask ONE question at a time about symptom, duration, severity. Once you have enough info, give your assessment. For LOW urgency suggest natural remedies (herbs, diet, lifestyle). For HIGH urgency recommend immediate medical attention. After giving your assessment and recommendations, close with a warm complete response. Do NOT ask follow-up questions. The user will continue if they need more.

TONE: Warm, human, 2-4 sentences max. Use user name occasionally.

RED FLAGS (always HIGH urgency): chest pain, difficulty breathing, stroke, severe bleeding, loss of consciousness.
NEVER classify mental/emotional health (sadness, anxiety, depression, unhappiness) as low urgency — minimum is "mid".
CRITICAL NAME RULE: The user's name is "${profile?.name || 'there'}". This contains numbers and letters. It is NOT a typo. Write it EXACTLY as "${profile?.name || 'there'}" — every single character including numbers. NEVER remove, shorten, or modify any part of it.

WHEN YOU HAVE ENOUGH INFO, append this JSON at the END of your message:
\`\`\`json
{"urgency":"low|mid|high","summary":"one-line description","naturalRemedies":["remedy 1","remedy 2","remedy 3"],"action":"what to do next"}
\`\`\`
You MUST wrap your JSON in triple-backtick json fences. NEVER output raw JSON without fences. Only include the JSON once — after you know symptom + duration + severity.${lang === 'am' ? '\n\nCRITICAL: YOU MUST RESPOND ENTIRELY IN AMHARIC (አማርኛ). All greetings, medical assessments, remedies, and instructions must be in Amharic.' : ''}`;
}

async function sendDiscordAlert(urgencyData, profile) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🚨 NuraCare — High Urgency Health Alert',
          color: 0xFF3B30,
          fields: [
            { name: '👤 User', value: profile?.name || 'Anonymous', inline: true },
            { name: '🔴 Urgency', value: 'HIGH', inline: true },
            { name: '📋 Summary', value: urgencyData.summary || 'N/A', inline: false },
            { name: '✅ Action', value: urgencyData.action || 'Seek immediate medical help', inline: false },
          ],
          footer: { text: 'NuraCare Health Agent • Vercel AI SDK' },
          timestamp: new Date().toISOString(),
        }]
      })
    });
  } catch (e) { console.error('Discord webhook failed:', e); }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
    return new Response(JSON.stringify({ error: { message: 'GROQ_API_KEY is missing in Vercel Environment Variables.' } }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const { messages, profile, memoryContext, lang } = await req.json();

    const groqMessages = [
      { role: 'system', content: buildSystemPrompt(profile, memoryContext, lang) },
      ...(messages || [])
        .filter(m => m.id !== 'welcome' && m.content)
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ];

    const modelOptions = ['deepseek-r1-distill-llama-70b', 'qwen-2.5-32b'];
    let groqRes = null;
    
    for (const model of modelOptions) {
      groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model, messages: groqMessages, temperature: 0.6, max_tokens: 1500, stream: true })
      });
      if (groqRes.ok) break;
    }

    if (!groqRes || !groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return new Response(JSON.stringify(err), { status: groqRes?.status || 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Forward the raw Groq SSE stream — accumulate for Discord alert
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullText = '';

    (async () => {
      const reader = groqRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Accumulate text for Discord alert
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try { fullText += JSON.parse(data).choices?.[0]?.delta?.content || ''; } catch {}
        }
        await writer.write(encoder.encode(chunk));
      }
      await writer.close();
      // Fire Discord alert if HIGH urgency detected
      try {
        const match = fullText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          const urgencyData = JSON.parse(match[1]);
          if (urgencyData?.urgency === 'high') await sendDiscordAlert(urgencyData, profile);
        }
      } catch {}
    })();

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' }
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
