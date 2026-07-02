import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

function WellnessScore({ records }) {
  const score = React.useMemo(() => {
    if (!records || records.length === 0) return 85;
    let s = 100;
    for (const r of records.slice(-10)) {
      if (r.urgency === 'high') s -= 28;
      else if (r.urgency === 'mid') s -= 12;
      else s -= 4;
    }
    return Math.max(8, Math.min(100, Math.round(s)));
  }, [records]);

  const [display, setDisplay] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisplay(score), 150); return () => clearTimeout(t); }, [score]);

  const R = 38, C = 2 * Math.PI * R;
  const offset = C - (display / 100) * C;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Great' : score >= 40 ? 'Fair' : 'Low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', borderRadius: 18, padding: '14px 16px', border: '1px solid var(--border)', height: '100%', boxSizing: 'border-box' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>WELLNESS SCORE</span>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="9" />
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke 0.5s ease' }} />
        <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{display}</text>
        <text x="50" y="62" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">{label}</text>
      </svg>
    </div>
  );
}

export default WellnessScore;