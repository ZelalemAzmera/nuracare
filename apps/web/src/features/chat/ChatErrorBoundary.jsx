import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

class ChatErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, message: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, message: error?.message || 'Unknown error' }; }
  componentDidCatch(error, info) { console.error('Chat render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="page-header" style={{ flexShrink: 0 }}>
            <div><h1 className="page-title">Continuous Care</h1><p className="page-subtitle">Your natural health companion</p></div>
          </div>
          <div className="chat-container">
            <div className="chat-error-banner" style={{ margin: 24, borderRadius: 12 }}>
              <Icons.AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Nura couldn't load.</strong><br />
                <span>The AI couldn't connect. Make sure <code>VITE_GROQ_API_KEY</code> is set in your <code>.env.local</code> file and restart the dev server.</span><br />
                <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: 10, background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#991b1b', fontSize: 13 }}>Try Again</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ChatErrorBoundary;