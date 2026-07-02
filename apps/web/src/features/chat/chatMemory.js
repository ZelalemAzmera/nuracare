function getSessionName(messages) {
  const first = messages.find(m => m.role === 'user' && m.content);
  if (!first) return 'New Session';
  const t = first.content.trim();
  return t.length > 40 ? t.slice(0, 40) + '…' : t;
}

function extractSessionMemory(session) {
  if (!session || !session.messages || session.messages.length <= 1) return null;
  const firstUser = session.messages.find(m => m.role === 'user' && m.content);
  if (!firstUser) return null;
  let urgency = null, summary = null, action = null, remedies = null;
  for (const m of session.messages) {
    if (m.role === 'assistant' && m.content?.includes('```json')) {
      try {
        const match = m.content.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          const d = JSON.parse(match[1]);
          urgency = d.urgency; summary = d.summary; action = d.action;
          remedies = Array.isArray(d.naturalRemedies) ? d.naturalRemedies.slice(0, 2).join(', ') : null;
          break;
        }
      } catch {}
    }
  }
  const date = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recent';
  return {
    date,
    topic: firstUser.content.slice(0, 70),
    urgency: urgency || 'unknown',
    summary: summary || firstUser.content.slice(0, 60),
    action: action || null,
    remedies: remedies || null
  };
}

function buildCrossSessionMemory(sessions, currentSessionId) {
  const pastSessions = sessions
    .filter(s => s.id !== currentSessionId && s.messages.length > 1)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);
  if (pastSessions.length === 0) return 'No previous sessions yet.';
  return pastSessions.map(s => {
    const m = extractSessionMemory(s);
    if (!m) return null;
    let line = `[${m.date}] User discussed: "${m.summary}" — urgency: ${m.urgency}`;
    if (m.action) line += ` — advised: ${m.action}`;
    if (m.remedies) line += ` — remedies suggested: ${m.remedies}`;
    return '- ' + line;
  }).filter(Boolean).join('\n') || 'No previous sessions yet.';
}

export { getSessionName, extractSessionMemory, buildCrossSessionMemory };