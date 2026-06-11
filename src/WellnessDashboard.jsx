import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCheckins, computeBurnoutRisk, compute5CoreWellness, getRecoveryRecommendations } from './wellnessEngine';

export default function WellnessDashboard() {
  const [checkins, setCheckins] = useState([]);
  const [latest, setLatest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    const data = getCheckins();
    setCheckins(data.slice(-7)); // Last 7 days for charts
    if (data.length > 0) {
      setLatest(data[data.length - 1]);
      setRecommendations(getRecoveryRecommendations(data));
    }
  }, []);

  const burnout = computeBurnoutRisk(latest);
  const wellness = compute5CoreWellness(latest);

  const formatChartData = (metric) => {
    return checkins.map(c => ({
      date: new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: c[metric]
    }));
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">Wellness Intelligence</h1>
          <p className="page-subtitle">Your AI-powered health & burnout tracker</p>
        </div>
      </div>

      {/* Top Scores */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
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

        <div className="dash-card card-large" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: burnout.score > 65 ? '#fee2e2' : 'var(--card-bg)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>BURNOUT RISK</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Icons.Flame size={48} color={burnout.color} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: burnout.color }}>{burnout.score}%</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: burnout.color }}>{burnout.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Core Breakdown */}
      <div className="section-title">5-Core Breakdown</div>
      <div className="dash-card card-large" style={{ marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <CoreStat label="Physical Vitality" score={wellness.cores.physical} icon={<Icons.Activity size={18} color="var(--green-dark)" />} />
          <CoreStat label="Mental Resilience" score={wellness.cores.mental} icon={<Icons.Brain size={18} color="var(--green-dark)" />} />
          <CoreStat label="Recovery & Sleep" score={wellness.cores.recovery} icon={<Icons.Moon size={18} color="var(--green-dark)" />} />
          <CoreStat label="Nutrition & Hydration" score={wellness.cores.nutrition} icon={<Icons.Droplet size={18} color="var(--green-dark)" />} />
          <CoreStat label="Preventive Maintenance" score={wellness.cores.preventive} icon={<Icons.Shield size={18} color="var(--green-dark)" />} />
        </div>
      </div>

      {/* 7-Day Trends */}
      <div className="section-title">7-Day Trends</div>
      {checkins.length < 2 ? (
        <div className="dash-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Need at least 2 days of check-ins to show trends.
        </div>
      ) : (
        <div className="dashboard-grid">
          <ChartCard title="Mood" data={formatChartData('mood')} color="#22c55e" icon={<Icons.Smile />} />
          <ChartCard title="Energy" data={formatChartData('energy')} color="#f59e0b" icon={<Icons.Zap />} />
          <ChartCard title="Sleep" data={formatChartData('sleep')} color="#6366f1" icon={<Icons.Moon />} />
          <ChartCard title="Stress" data={formatChartData('stress')} color="#ef4444" icon={<Icons.Wind />} />
        </div>
      )}

      {/* AI Recommendations */}
      <div className="section-title" style={{ marginTop: 32 }}>AI Recommendations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map((rec, i) => (
          <div key={i} className="dash-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: '4px solid var(--green)' }}>
            <Icons.Sparkles size={20} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 15, lineHeight: 1.5 }}>{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, data, color, icon }) {
  return (
    <div className="dash-card" style={{ gridColumn: 'span 2', padding: '16px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
        {React.cloneElement(icon, { size: 16, color })} {title}
      </div>
      <div style={{ height: 120, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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
