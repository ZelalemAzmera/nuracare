import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCheckins, computeBurnoutRisk, computeWellnessScore, getRecoveryRecommendations } from './wellnessEngine';

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
  const wellness = computeWellnessScore(latest);

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
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>WELLNESS SCORE</span>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={wellness.color} strokeWidth="10"
                strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (wellness.score / 100) * 251.2}
                transform="rotate(-90 50 50)" />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="800" fill={wellness.color}>{wellness.score}</text>
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
