import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

import { UrgencyCard } from '@/features/chat/UrgencyCard';
import { getSessionName, extractSessionMemory, buildCrossSessionMemory } from '@/features/chat/chatMemory';
import ChatErrorBoundary from '@/features/chat/ChatErrorBoundary';
function Chat({ profile, saveProfile, sessions, saveSession, deleteSession, handleDeleteSession, setShareSession, currentSessionId, setCurrentSessionId, t = (k)=>k, lang = 'en' }) {
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const { addCheckup } = useCheckups();

  const [messages, setMessages] = useState(() => {
    try {
      const fn = profile?.name?.split(' ')[0] || 'there';
      // Only use check-in data for returning users with sessions — prevents stale data from
      // a different user on the same device being shown to a new account
      const hasExistingSessions = sessions && sessions.some(s => s.messages?.some(m => m.role === 'user'));
      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentCheckins = hasExistingSessions
        ? getCheckins().filter(c => new Date(c.date) >= sevenDaysAgo).slice(-3)
        : [];
      const checkinContext = recentCheckins.length > 0 
        ? `\n\nRecent Wellness Check-ins (scale 1-10):\n${recentCheckins.map(c => `[${c.date}] Mood: ${c.mood}, Sleep: ${c.sleep}, Stress: ${c.stress}, Energy: ${c.energy}`).join('\n')}` 
        : '';
      
      const systemPrompt = {
        id: 'system',
        role: 'system',
        content: `You are Nura, a proactive AI Wellness and Health Companion. Your tone is calm, empathetic, and intelligent.
WELLNESS CONTEXT:${checkinContext}
- You must proactively ask about the user's wellness (mood, sleep, stress, energy) natively in the chat if they haven't checked in recently.
- If you notice elevated stress or poor sleep in their history, bring it up naturally and suggest they visit the "Lifestyle" or "Wellness" tabs for 5-5 breathing or recovery tips.
- Do not just wait for symptom complaints. Ask "How did you sleep?" or "How is your energy today?" to start the conversation.
- Always provide natural remedies and lifestyle tips first before recommending a doctor, unless the urgency is high.`
      };

      const hour = new Date().getHours();
      let timeContext = hour < 12 ? "How did you sleep last night?" : hour < 18 ? "How has your day been so far?" : "How are your energy levels this evening?";
      
      // Only personalise greeting for returning users with recent check-ins
      if (hasExistingSessions && recentCheckins.length > 0) {
        const last = recentCheckins[recentCheckins.length - 1];
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = last.date === todayStr;
        
        if (isToday) {
          if (last.stress >= 7) timeContext = lang === 'am' ? "ዛሬ በጣም እንደተጨነቁ አይቻለሁ። አሁን እንዴት ነዎት?" : "I saw from your check-in that you're quite stressed today. How are you holding up now?";
          else if (last.sleep <= 5) timeContext = lang === 'am' ? "በደንብ እንዳልተኙ አስተውያለሁ። በጣም ደክሞዎታል?" : "I noticed you didn't sleep well. Are you feeling very tired?";
          else timeContext = lang === 'am' ? "ቀደም ብለው እንደገቡ አይቻለሁ። ከጠዋቱ ጋር ሲነፃፀር አሁን እንዴት ይሰማዎታል?" : "I saw you checked in earlier. How are you feeling compared to this morning?";
        } else {
          const daysSince = Math.floor((new Date() - new Date(last.date)) / (1000 * 60 * 60 * 24));
          if (daysSince >= 2) timeContext = lang === 'am' ? `ካለፈው ጊዜ ጀምሮ ጥቂት ቀናት አልፈዋል። እንዴት ነበሩ?` : `It's been a few days since your last check-in. How have you been?`;
          else if (last.mood <= 5) timeContext = lang === 'am' ? `ባለፈው ጊዜ ትንሽ አዝነው ነበር። ዛሬ የተሻለ ነው?` : `You were feeling a bit down last time we spoke. Are things any better today?`;
        }
      }
      
      const welcomeContent = lang === 'am' 
        ? `ሰላም ${fn} እኔ ኑራ ነኝ፣ የግል የጤና ጓደኛዎ። ${timeContext}`
        : `Hi ${fn}, I'm Nura, your personal health companion. ${timeContext}`;
      const welcome = { id: 'welcome', role: 'assistant', content: welcomeContent };
      
      const cur = sessions.find(s => s.id === currentSessionId);
      if (cur && cur.messages && cur.messages.length > 0) {
        // Ensure system prompt is at the top
        if (cur.messages[0].role !== 'system') {
          return [systemPrompt, ...cur.messages];
        }
        return cur.messages;
      }
      return [systemPrompt, welcome];
    } catch { return [{ id: 'welcome', role: 'assistant', content: lang === 'am' ? `ሰላም እኔ ኑራ ነኝ። ዛሬ ምን ይሰማዎታል?` : `Hi there, I'm Nura. How are you feeling today?` }]; }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatLang, setChatLang] = useState(lang);
  const [showQuickStart, setShowQuickStart] = useState(() => {
    const cur = sessions.find(s => s.id === currentSessionId);
    return !cur || !cur.messages || cur.messages.length <= 1;
  });
  const chatEndRef = useRef(null);
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

  const generateSmartTitle = async (firstUserMsg, firstAiSummary, sessionId) => {
    try {
      const existingSession = sessions.find(s => s.id === sessionId);
      if (!existingSession) return;
      
      const placeholderTitle = firstUserMsg.split(' ').slice(0, 4).join(' ') + '...';
      
      saveSession({
        ...existingSession,
        name: placeholderTitle,
        isSmartName: true
      });
      
      const isDev = import.meta.env.DEV;
      let title = '';
      if (isDev) {
        const prompt = `Generate a concise 2-4 word chat title for this health conversation. User: "${firstUserMsg}". Topic: "${firstAiSummary}". Format: Title Case, no quotes, no punctuation.`;
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
          body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 20 })
        });
        const data = await res.json();
        title = data.choices?.[0]?.message?.content?.trim()?.replace(/["']/g, '');
        title = stripThinkTags(title || '');
      } else {
        const res = await fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstUserMsg, firstAiSummary })
        });
        const data = await res.json();
        title = data.title;
      }
      
      if (title) {
        saveSession({
          ...existingSession,
          name: title,
          isSmartName: true
        });
      }
    } catch (e) {
      console.error('Smart title failed:', e);
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession) {
        saveSession({
          ...existingSession,
          name: firstUserMsg.split(' ').slice(0, 5).join(' ') + '...',
          isSmartName: false
        });
      }
    }
  };

  const activeSessionIdLocally = useRef(currentSessionId);

  // Persist to sessions store
  useEffect(() => {
    if (isStreaming) return;
    if (currentSessionId !== activeSessionIdLocally.current) return; // Prevent saving old messages to new session ID during switch
    try {
      const existingSession = sessions.find(s => s.id === currentSessionId);
      const name = existingSession?.isSmartName ? existingSession.name : getSessionName(messages);
      
      const hasUserMessage = messages.some(m => m.role === 'user');
      if (!hasUserMessage) return; // Never save empty sessions
      
      saveSession({
        id: currentSessionId,
        name: existingSession?.isSmartName ? existingSession.name : name,
        messages
      });
    } catch (e) {
      console.error('Error auto-saving session', e);
    }
  }, [messages, currentSessionId, isStreaming]); // Note: saveSession and sessions omitted from dep array to avoid infinite loops when sessions update


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Proactive check-in: follow up on HIGH urgency sessions
  useEffect(() => {
    if (messages.length !== 1) return; // only on fresh load
    const highRecords = (profile?.records || []).filter(r => r.urgency === 'high');
    if (highRecords.length === 0) return;
    const lastHigh = highRecords[highRecords.length - 1];
    const lastCheckinId = localStorage.getItem('nuracare_last_checkin');
    if (lastCheckinId === String(lastHigh.id)) return;
    const timer = setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 'checkin-' + Date.now(), role: 'assistant',
        content: `Hey ${firstName}, last time you mentioned ${lastHigh.summary.toLowerCase()}. How are you feeling now — is it getting better?`
      }]);
      setShowQuickStart(false);
      try { localStorage.setItem('nuracare_last_checkin', String(lastHigh.id)); } catch {}
    }, 1000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const buildSystemPrompt = () => {
    const recentRecords = (profile?.records || []).slice(-5).map(r =>
      `- ${r.dateStr}: ${r.summary} (${r.urgency} urgency) — action: ${r.action}`
    ).join('\n') || 'No past records yet.';

    const crossMemory = buildCrossSessionMemory(sessions, currentSessionId);

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
- Current medications: ${Array.isArray(profile?.medications) ? profile.medications.join(', ') : (profile?.medications || 'none reported')}

PAST HEALTH RECORDS (last 5 sessions):
${recentRecords}
${medicalNotes}

USER'S LOCAL HERBS (prefer these when suggesting natural remedies):
${userHerbs.join(', ')}

CROSS-SESSION MEMORY (general knowledge from previous conversations — use this to personalize, reference past topics when relevant, never repeat questions already answered):
${crossMemory}

MEMORY RULES: Always reference the user's name (${profile?.name?.split(' ')[0] || 'there'}). If they had a similar symptom before, mention it. Use cross-session memory to show you remember them. Keep track of what they told you earlier in THIS conversation — don't ask for info they already shared.

YOUR APPROACH: Have a natural caring conversation. Ask ONE question at a time about symptom, duration, severity. Once you have enough info, give your assessment. For LOW urgency suggest natural remedies (herbs, diet, lifestyle). For HIGH urgency recommend immediate medical attention. After giving your assessment and recommendations, close with a warm complete response. Do NOT ask follow-up questions. The user will continue if they need more.

TONE: Warm, human, 2-4 sentences max. Use user name occasionally.

RED FLAGS (always HIGH urgency): chest pain, difficulty breathing, stroke, severe bleeding, loss of consciousness.
NEVER classify mental/emotional health (sadness, anxiety, depression, unhappiness) as low urgency — minimum is "mid".
CRITICAL NAME RULE: The user's name is spelled EXACTLY as written in the profile. Address them letter-for-letter with zero modifications.
CRITICAL GREETING RULE: ALWAYS start your response with "Hi ${profile?.name?.split(' ')[0] || 'there'}, " — NEVER skip this or alter the letters.

WHEN YOU HAVE ENOUGH INFO, append this JSON at the END of your message:
\`\`\`json
{"urgency":"low|mid|high","summary":"one-line description","naturalRemedies":["remedy 1","remedy 2","remedy 3"],"action":"what to do next"}
\`\`\`
Only include the JSON once — after you know symptom + duration + severity.${chatLang === 'am' ? '\n\nCRITICAL: YOU MUST RESPOND ENTIRELY IN AMHARIC (አማርኛ). All greetings, medical assessments, remedies, and instructions must be in Amharic.' : ''}`;
  };

  useEffect(() => {
    setMessages(prev => {
      const newSys = { id: 'system', role: 'system', content: buildSystemPrompt() };
      const updated = [...prev];
      if (updated.length > 0 && updated[0].role === 'system') {
        updated[0] = newSys;
      } else {
        updated.unshift(newSys);
      }
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLang]);

  const sendMessage = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || isLoading || isStreaming) return;
    setShowQuickStart(false);
    setChatError(null);

    const userMsg = { id: String(Date.now()), role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      let res;
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // Local dev: call Groq directly (needs VITE_GROQ_API_KEY in .env.local)
        if (!GROQ_KEY) throw new Error('Add VITE_GROQ_API_KEY to your .env.local file.');
        const groqMessages = [
          { role: 'system', content: buildSystemPrompt() },
          ...updatedMessages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || '' }))
        ];
        res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({ model: 'deepseek-r1-distill-llama-70b', messages: groqMessages, temperature: 0.6, max_tokens: 1500, stream: true })
        });
      } else {
        // Production: use /api/chat (server-side key, no CORS issues)
        const memoryContext = buildCrossSessionMemory(sessions, currentSessionId);
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages, profile, memoryContext, lang })
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Error ${res.status}`);
      }

      // Stream word-by-word
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let streamId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const token = JSON.parse(data).choices?.[0]?.delta?.content || '';
            if (!token) continue;
            accumulated += token;
            if (!streamId) {
              streamId = 'stream-' + Date.now();
              setIsLoading(false);
              setIsStreaming(true);
              setMessages(prev => [...prev, { id: streamId, role: 'assistant', content: accumulated }]);
            } else {
              setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: accumulated } : m));
            }
          } catch {}
        }
      }

      // After streaming complete — save urgency record
      const urgencyData = parseUrgencyFromContent(accumulated);
      if (urgencyData?.urgency) {
        // If HIGH urgency, fetch real nearby hospitals and inject into the urgency data
        if (urgencyData.urgency === 'high') {
          try {
            const pos = await new Promise((resolve, reject) => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
                  () => reject('no gps')
                );
              } else reject('no gps');
            });
            const hospitals = await fetchNearbyHospitals(pos.lat, pos.lon);
            if (hospitals.length > 0) {
              urgencyData._hospitals = hospitals;
              // Re-render the last message with hospital data embedded
              setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: accumulated, _urgencyHospitals: hospitals } : m));
            }
          } catch { /* GPS denied or failed, UrgencyCard falls back to generic link */ }
        }

        saveProfile({ ...profile, records: [...(profile.records || []), {
          id: Date.now(), dateStr: formatDate(new Date()),
          summary: urgencyData.summary || 'Health check',
          urgency: urgencyData.urgency, action: urgencyData.action || '',
          natural: Array.isArray(urgencyData.naturalRemedies) ? urgencyData.naturalRemedies : []
        }]});
      }

      // ── Appointment Detection ──────────────────────────────────────────────
      // Scan the user's OWN message for appointment keywords first (instant, no API needed)
      try {
        const userText = trimmed.toLowerCase();
        const appointmentKeywords = [
          'appointment', 'checkup', 'check-up', 'check up', 'doctor visit',
          'hospital', 'clinic', 'dentist', 'eye exam', 'follow-up', 'follow up',
          'i have an appointment', 'scheduled', 'booked', 'i have a checkup',
          'see my doctor', 'visit my doctor', 'going to the doctor',
          'i have a dental', 'i have a medical'
        ];
        const hasAppointmentMention = appointmentKeywords.some(k => userText.includes(k));

        if (hasAppointmentMention) {
          // Try to parse a date from the message
          const today = new Date();
          let detectedDate = null;
          let appointmentName = 'Doctor Appointment';

          // Named date patterns: "on June 20", "on the 15th", "next Monday", "tomorrow", "in 3 days"
          const months = { january:0, february:1, march:2, april:3, may:4, june:5, july:6, august:7, september:8, october:9, november:10, december:11 };
          const shortMonths = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
          const days = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };

          // "next monday", "next tuesday" etc.
          const nextDayMatch = userText.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
          if (nextDayMatch) {
            const targetDay = days[nextDayMatch[1].toLowerCase()];
            const d = new Date(today);
            d.setDate(d.getDate() + ((targetDay + 7 - d.getDay()) % 7 || 7));
            detectedDate = d.toISOString().split('T')[0];
          }

          // "tomorrow"
          if (!detectedDate && userText.includes('tomorrow')) {
            const d = new Date(today);
            d.setDate(d.getDate() + 1);
            detectedDate = d.toISOString().split('T')[0];
          }

          // "in X days"
          const inDaysMatch = userText.match(/in\s+(\d+)\s+days?/i);
          if (!detectedDate && inDaysMatch) {
            const d = new Date(today);
            d.setDate(d.getDate() + parseInt(inDaysMatch[1]));
            detectedDate = d.toISOString().split('T')[0];
          }

          // "on June 20" or "on 20 June"
          const monthNames = { ...months, ...shortMonths };
          const onMonthDayMatch = userText.match(/on\s+([a-z]+)\s+(\d{1,2})/i) || userText.match(/on\s+(\d{1,2})\s+([a-z]+)/i);
          if (!detectedDate && onMonthDayMatch) {
            const [_, a, b] = onMonthDayMatch;
            let month, day;
            if (isNaN(a)) { month = monthNames[a.toLowerCase()]; day = parseInt(b); }
            else { day = parseInt(a); month = monthNames[b.toLowerCase()]; }
            if (month !== undefined && day) {
              const d = new Date(today.getFullYear(), month, day);
              if (d < today) d.setFullYear(d.getFullYear() + 1);
              detectedDate = d.toISOString().split('T')[0];
            }
          }

          // "on the 15th / 3rd / 21st"
          const onOrdinalMatch = userText.match(/on\s+the\s+(\d{1,2})(?:st|nd|rd|th)?/i);
          if (!detectedDate && onOrdinalMatch) {
            const d = new Date(today.getFullYear(), today.getMonth(), parseInt(onOrdinalMatch[1]));
            if (d < today) d.setMonth(d.getMonth() + 1);
            detectedDate = d.toISOString().split('T')[0];
          }

          // Determine appointment name from the user's text
          if (userText.includes('dentist') || userText.includes('dental')) appointmentName = 'Dentist Appointment';
          else if (userText.includes('eye')) appointmentName = 'Eye Exam';
          else if (userText.includes('follow')) appointmentName = 'Follow-up Visit';
          else if (userText.includes('checkup') || userText.includes('check-up')) appointmentName = 'General Checkup';
          else if (userText.includes('hospital')) appointmentName = 'Hospital Visit';

          // Log the checkup — with date if found, without if just mentioned
          await addCheckup({
            name: appointmentName,
            date_logged: new Date().toISOString().split('T')[0],
            next_visit: detectedDate || null,
            source: 'ai_chat',
            notes: `Mentioned in chat: "${trimmed.slice(0, 120)}${trimmed.length > 120 ? '...' : ''}"`
          });
          showToast(`📅 ${appointmentName} logged to Checkups!`, 'success');
        }
      } catch (e) {
        console.error('Error detecting appointment from user message:', e);
      }

      // Generate smart title if it's the first exchange
      if (updatedMessages.filter(m => m.role === 'user').length === 1) {
        const firstUserMsg = updatedMessages.find(m => m.role === 'user')?.content || '';
        const firstAiSummary = urgencyData?.summary || stripJsonBlock(accumulated).slice(0, 50);
        generateSmartTitle(firstUserMsg, firstAiSummary, currentSessionId);
      }
    } catch (err) {
      console.error('Nura error:', err);
      setChatError(err?.message || 'Connection failed.');
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: "I'm having trouble connecting right now. Please check the error banner above." }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };


  const startNewSession = () => {
    const newId = 'session-' + Date.now();
    const systemPromptObj = { id: 'system', role: 'system', content: buildSystemPrompt() };
    const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${firstName}, starting a fresh session — what's going on today?` };
    setCurrentSessionId(newId);
    setMessages([systemPromptObj, welcome]);
    setInput(''); setShowQuickStart(true); setChatError(null);
  };

  const switchToSession = (sid) => {
    const s = sessions.find(x => x.id === sid);
    if (!s) return;
    setCurrentSessionId(sid);
    setMessages(s.messages || []);
    setChatError(null);
    setShowQuickStart(!s.messages || s.messages.length <= 1);
  };



  // Sync messages when currentSessionId changes from parent (e.g. sidebar) or when DB finishes initial load
  useEffect(() => {
    // 1. If the user switched sessions, force a sync from DB or reset to welcome message
    if (activeSessionIdLocally.current !== currentSessionId) {
      const s = sessions.find(x => x.id === currentSessionId);
      if (s && s.messages) {
        setMessages(s.messages);
        setShowQuickStart(s.messages.length <= 1);
      } else {
        const systemPromptObj = { id: 'system', role: 'system', content: buildSystemPrompt() };
        const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${firstName}, starting a fresh session — what's going on today?` };
        setMessages([systemPromptObj, welcome]);
        setShowQuickStart(true);
      }
      setChatError(null);
      activeSessionIdLocally.current = currentSessionId;
      return;
    }

    // 2. Otherwise, we are in the SAME session. We only sync from DB if our local messages are empty/new
    // (e.g. initial load where DB finished fetching after component mount)
    const s = sessions.find(x => x.id === currentSessionId);
    if (s && s.messages && messages.length <= 1 && s.messages.length > 1) {
      setMessages(s.messages);
      setShowQuickStart(false);
    }
  }, [currentSessionId, sessions, firstName, messages.length]);

  const quickOptions = lang === 'am' 
    ? ['ራስ ምታት', 'የሆድ ሕመም', 'የጉሮሮ ሕመም', 'ድካም', 'ሳል', 'ትኩሳት'] 
    : ['Headache', 'Stomach ache', 'Sore throat', 'Fatigue', 'Cough', 'Fever'];

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 style={{fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6}}>{t("hello")}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} <Icons.Hand size={24} color="var(--green-dark)" /></h2>
          <p style={{color: 'var(--text-muted)', marginBottom: 24}}>I'm Nura, your health companion. What's on your mind today?</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, gap: 12 }}>
        {/* ── Sessions Sidebar ── */}
        <div className="chat-sessions-sidebar">
          <button className="new-session-btn" onClick={startNewSession}>
            <Icons.PenLine size={15} /> New Session
          </button>
          <div className="sessions-list">
            {sessions.length === 0 && (
              <p className="sessions-empty">Your past sessions will appear here</p>
            )}
            {[...sessions].reverse().map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className={`session-item ${s.id === currentSessionId ? 'active' : ''}`}
                  style={{ flex: 1, marginRight: 0, paddingRight: '8px' }}
                  onClick={() => switchToSession(s.id)}
                >
                  <Icons.MessageCircle size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                </button>
                <button 
                  style={{ background: 'none', border: 'none', padding: '10px 12px', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.7 }}
                  onClick={() => handleDeleteSession(s.id)}
                >
                  <Icons.Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="chat-container" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 20, zIndex: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={chatLang} onChange={(e) => setChatLang(e.target.value)} style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'var(--font)', outline: 'none', background: 'rgba(255,255,255,0.8)', color: 'var(--text)', fontSize: 13 }}>
                <option value="en">English (Chat)</option>
                <option value="am">አማርኛ (ውይይት)</option>
              </select>
              <button 
                className="btn-icon"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: 13, color: 'var(--text)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                onClick={() => {
                  setShareSession(sessions.find(s => s.id === currentSessionId));
                }}
              >
                <Icons.Share size={14} /> {t("share")}
              </button>
            </div>
          </div>
          {chatError && (
            <div className="chat-error-banner">
              <Icons.AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div><strong>Connection issue:</strong> {chatError}</div>
            </div>
          )}
          <div className="chat-messages">
            {messages.filter(m => m.role !== 'system').map((m) => {
              if (m.role === 'assistant') {
                const urgencyData = parseUrgencyFromContent(m.content || '');
                if (urgencyData && m._urgencyHospitals) {
                  urgencyData._hospitals = m._urgencyHospitals;
                }
                const displayText = stripJsonBlock(m.content || '');
                return (
                  <div key={m.id}>
                    {displayText && (
                      <div className="chat-bubble bubble-ai">
                        <div className="bubble-label"><Icons.Leaf size={12} style={{ marginRight: 4 }} />Nura</div>
                        {displayText}
                      </div>
                    )}
                    {urgencyData?.urgency && <UrgencyCard data={urgencyData} />}
                  </div>
                );
              }
              return <div key={m.id} className="chat-bubble bubble-user">{m.content}</div>;
            })}
            {isLoading && (
              <div className="chat-bubble bubble-ai typing-bubble">
                <div className="bubble-label"><Icons.Leaf size={12} style={{ marginRight: 4 }} />Nura</div>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            {showQuickStart && !messages.some(m => m.role === 'user') && (
              <div className="chat-options">
                {quickOptions.map(opt => (
                  <button key={opt} className="chat-opt-btn" onClick={() => sendMessage(opt)}>{opt}</button>
                ))}
              </div>
            )}
            <div className="chat-text-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder={t("type_message")}
                disabled={isLoading || isStreaming}
              />
              <button className="btn-send" onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading || isStreaming}>
                <Icons.Send size={18} />
                <span>{t("send")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



export default Chat;