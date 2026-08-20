export const ChatEngine = {
  processMessage: async (messages: any[], profile: any) => {
    const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!GROQ_KEY) throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY in .env');

    const recentRecords = (profile?.records || []).slice(-5).map((r: any) =>
      `- ${r.dateStr}: ${r.summary} (${r.urgency} urgency) — action: ${r.action}`
    ).join('\n') || 'No past records yet.';

    const systemPrompt = `You are Nura, a warm and empathetic AI health companion for NuraCare. You are medically informed but always make clear you are not a replacement for a doctor.

USER PROFILE:
- Name: ${profile?.name || 'there'}
- Age: ${profile?.age ? profile.age + ' years old' : 'unknown'}
- Known conditions: ${profile?.conditions?.length ? profile.conditions.join(', ') : 'none reported'}
- Current medications: ${Array.isArray(profile?.medications) ? profile.medications.join(', ') : (profile?.medications || 'none reported')}

PAST HEALTH RECORDS (last 5 sessions):
${recentRecords}

YOUR APPROACH: Have a natural caring conversation. Ask ONE question at a time about symptom, duration, severity. Once you have enough info, give your assessment. For LOW urgency suggest natural remedies. For HIGH urgency recommend immediate medical attention. Do NOT ask follow-up questions after giving recommendations.

TONE: Warm, human, 2-4 sentences max.

RED FLAGS (always HIGH urgency): chest pain, difficulty breathing, stroke, severe bleeding, loss of consciousness.

WHEN YOU HAVE ENOUGH INFO, append this JSON at the END of your message:
\`\`\`json
{"urgency":"low|mid|high","summary":"one-line description","naturalRemedies":["remedy 1","remedy 2"],"action":"what to do next"}
\`\`\`
Only include the JSON once — after you know symptom + duration + severity.`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${GROQ_KEY}` 
      },
      body: JSON.stringify({ 
        model: 'openai/gpt-oss-120b', 
        messages: groqMessages, 
        temperature: 0.6, 
        max_tokens: 1000
      })
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || "I'm having trouble processing that right now.";
  }
};
