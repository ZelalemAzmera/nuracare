export const showToast = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('nuracare-toast', { detail: { message, type } }));
};

export const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

export function stripThinkTags(content) {
  return content.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
}

export function stripJsonBlock(content) {
  let text = stripThinkTags(content);
  text = text.replace(/```json[\s\S]*?```/gi, '');
  text = text.replace(/\{[^{}]*"urgency"[\s\S]*\}\s*$/i, '');
  return text.trim();
}

export function parseUrgencyFromContent(content) {
  let text = stripThinkTags(content);
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    
    const rawMatch = text.match(/\{[^{}]*"urgency"[\s\S]*\}\s*$/i);
    if (rawMatch) return JSON.parse(rawMatch[0]);
  } catch (e) {}
  return null;
}
