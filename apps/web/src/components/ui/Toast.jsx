import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    const handleToast = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };
    window.addEventListener('nuracare-toast', handleToast);
    return () => window.removeEventListener('nuracare-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <Icons.CheckCircle2 size={18} color="var(--green)" /> : <Icons.AlertCircle size={18} color="#ef4444" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;