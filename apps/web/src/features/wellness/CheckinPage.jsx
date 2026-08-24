import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';
import DailyCheckIn from './DailyCheckIn';
import { getCheckins, compute5CoreWellness, getRecoveryRecommendations } from '@/lib/wellnessEngine';

function CoreStat({ label, score, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>{score}</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : 'var(--green)', borderRadius: 4 }}></div>
        </div>
      </div>
    </div>
  );
}

function RecordStat({ icon, label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(34,197,94,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'var(--green-light)', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}

function AvgStat({ icon, label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 20, padding: '24px 16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.04)', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 16px', width: 56, height: 56, borderRadius: 16, background: 'var(--green-light)', alignItems: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AI-POWERED CHAT (Vercel AI SDK)
───────────────────────────────────────── */
function CheckinPage({ profile }) {
  const records = profile?.records || [];
  const [tab, setTab] = useState('today');
  const [checkins, setCheckins] = useState([]);
  
  useEffect(() => {
    const fetch = () => setCheckins(getCheckins());
    fetch();
    window.addEventListener('checkin-completed', fetch);
    return () => window.removeEventListener('checkin-completed', fetch);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = checkins.find(c => c.date === today);
  const wellness = compute5CoreWellness(todayEntry);
  const recommendations = getRecoveryRecommendations(checkins);

  const getAverages = (daysBack) => {
    if (checkins.length === 0) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const recent = checkins.filter(c => new Date(c.date) >= cutoff);
    if (recent.length === 0) return null;

    return {
      sleep: Math.round(recent.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recent.length * 10) / 10,
      stress: Math.round(recent.reduce((sum, c) => sum + c.stress, 0) / recent.length),
      energy: Math.round(recent.reduce((sum, c) => sum + c.energy, 0) / recent.length),
      mood: Math.round(recent.reduce((sum, c) => sum + c.mood, 0) / recent.length),
      count: recent.length
    };
  };

  const weekAvg = getAverages(7);
  const monthAvg = getAverages(30);
  const yearAvg = getAverages(365);

  const [forceCheckin, setForceCheckin] = useState(false);

  return (
    <div className="page active">
      {forceCheckin && <DailyCheckIn forceShow={true} isGlobal={false} onComplete={() => setForceCheckin(false)} />}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="page-title">Wellness History</h1>
              {todayEntry && <span className="urgency-badge-sm urgency-low"><Icons.CheckCircle size={12} style={{marginRight: 4, verticalAlign: 'text-bottom'}} /> Check-in Complete</span>}
            </div>
            <p className="page-subtitle">Track your wellness records and historical trends</p>
          </div>
          <button className="btn-outline-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setForceCheckin(true)}>
            <Icons.RotateCw size={14} /> Retake Check-in
          </button>
        </div>
      </div>

      <div className="discovery-tabs">
        {['today', 'week', 'month', 'year'].map(t => (
          <button key={t} className={`disc-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'today' ? 'Today' : `This ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div className="dashboard-grid">
          <div className="dash-card card-large" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>5-CORE WELLNESS SCORE</span>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={wellness.color} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (wellness.total / 100) * 251.2}
                  transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="800" fill={wellness.color}>{wellness.total}</text>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: wellness.color, marginTop: 8 }}>{wellness.label}</span>
          </div>
          
          <div className="dash-card card-large" style={{ gridColumn: 'span 4' }}>
            {todayEntry ? (
              <div style={{ width: '100%' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>Today's Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <RecordStat icon={<Icons.Moon size={20} color="var(--green-dark)"/>} label="Sleep" value={`${todayEntry.sleepHours}h (${todayEntry.wakeFeeling})`} />
                  <RecordStat icon={<Icons.Zap size={20} color="var(--green-dark)"/>} label="Energy" value={`${todayEntry.energy}/10`} />
                  <RecordStat icon={<Icons.Wind size={20} color="var(--green-dark)"/>} label="Stress & Tension" value={`${todayEntry.stress}/10 (${todayEntry.tension})`} />
                  <RecordStat icon={<Icons.Smile size={20} color="var(--green-dark)"/>} label="Mood & Activity" value={`${todayEntry.mood}/10 (${todayEntry.activity})`} />
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>You haven't completed your check-in today.</div>
            )}
          </div>
          
          <div className="dash-card card-large" style={{ gridColumn: 'span 6', marginTop: 8 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>5-Core Deep Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <CoreStat label="Physical Vitality" score={wellness.cores.physical} icon={<Icons.Activity size={18} color="var(--green-dark)" />} />
              <CoreStat label="Mental Resilience" score={wellness.cores.mental} icon={<Icons.Brain size={18} color="var(--green-dark)" />} />
              <CoreStat label="Recovery & Sleep" score={wellness.cores.recovery} icon={<Icons.Moon size={18} color="var(--green-dark)" />} />
              <CoreStat label="Nutrition & Hydration" score={wellness.cores.nutrition} icon={<Icons.Droplet size={18} color="var(--green-dark)" />} />
              <CoreStat label="Preventive Maintenance" score={wellness.cores.preventive} icon={<Icons.Shield size={18} color="var(--green-dark)" />} />
            </div>
          </div>
          
          <div className="dash-card card-large" style={{ gridColumn: 'span 6', marginTop: 8 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>Way Forward & Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.length > 0 ? recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: '4px solid var(--green)', paddingLeft: 12 }}>
                  <Icons.Sparkles size={20} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text)' }}>{rec}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)' }}>Complete more check-ins to receive personalized AI recommendations.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {(tab === 'week' || tab === 'month' || tab === 'year') && (
        <div className="dash-card card-large" style={{ gridColumn: 'span 6' }}>
          <div style={{ width: '100%' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>
              {tab === 'week' ? '7-Day' : tab === 'month' ? '30-Day' : '365-Day'} Averages
            </h3>
            
            {((tab === 'week' && weekAvg) || (tab === 'month' && monthAvg) || (tab === 'year' && yearAvg)) ? (() => {
              const avg = tab === 'week' ? weekAvg : tab === 'month' ? monthAvg : yearAvg;
              return (
                <div>
                  <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>Based on {avg.count} check-ins</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                    <AvgStat icon={<Icons.Moon size={24} color="var(--green-dark)"/>} label="Avg Sleep" value={`${avg.sleep}h`} />
                    <AvgStat icon={<Icons.Zap size={24} color="var(--green-dark)"/>} label="Avg Energy" value={`${avg.energy}/10`} />
                    <AvgStat icon={<Icons.Wind size={24} color="var(--green-dark)"/>} label="Avg Stress" value={`${avg.stress}/10`} />
                    <AvgStat icon={<Icons.Smile size={24} color="var(--green-dark)"/>} label="Avg Mood" value={`${avg.mood}/10`} />
                  </div>
                </div>
              );
            })() : (
              <div style={{ color: 'var(--text-muted)' }}>Not enough data for this timeframe.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckinPage;