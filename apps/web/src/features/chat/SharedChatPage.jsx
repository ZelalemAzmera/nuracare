import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import FloatingLeaves from '@/components/layout/FloatingLeaves';
import { parseUrgencyFromContent, stripJsonBlock } from '@/lib/utils';
import { UrgencyCard } from '@/features/chat/UrgencyCard';

export default function SharedChatPage({ token }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/shared/${token}`);
        if (!res.ok) {
          throw new Error('Chat not found or no longer shared.');
        }
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [token]);

  if (loading) {
    return (
      <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Icons.Loader className="spin" size={32} color="var(--green)" />
        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading shared conversation...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <Icons.HeartCrack size={48} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.5 }} />
        <h2>Chat Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, marginTop: 8 }}>{error || 'This conversation is not available.'}</p>
        <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => window.location.href = '/'}>Go to NuraCare</button>
      </div>
    );
  }

  const messages = session.messages || [];

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FloatingLeaves />
      <div className="page-header" style={{ flexShrink: 0, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">{session.name || 'Shared Conversation'}</h1>
            <p className="page-subtitle">Shared on {new Date(session.shared_at).toLocaleDateString()}</p>
          </div>
          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            Get NuraCare
          </button>
        </div>
      </div>
      
      <div className="chat-container" style={{ flex: 1 }}>
        <div className="chat-messages" style={{ paddingBottom: 100 }}>
          {messages.filter(m => m.role !== 'system').map((m) => {
            if (m.role === 'assistant') {
              const urgencyData = parseUrgencyFromContent(m.content || '');
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
        </div>
      </div>
    </div>
  );
}
