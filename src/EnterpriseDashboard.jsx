import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockData = [
  { name: 'Mon', stress: 6.5, energy: 7, sleep: 6 },
  { name: 'Tue', stress: 6.8, energy: 6.5, sleep: 5.8 },
  { name: 'Wed', stress: 7.2, energy: 6, sleep: 5.5 },
  { name: 'Thu', stress: 6.9, energy: 6.5, sleep: 6.2 },
  { name: 'Fri', stress: 6.2, energy: 7.5, sleep: 7 },
  { name: 'Sat', stress: 4.5, energy: 8.5, sleep: 8.2 },
  { name: 'Sun', stress: 4.8, energy: 8, sleep: 7.8 },
];

const teamData = [
  { department: 'Engineering', avgWellness: 72, riskLevel: 'Medium' },
  { department: 'Sales', avgWellness: 65, riskLevel: 'High' },
  { department: 'Marketing', avgWellness: 80, riskLevel: 'Low' },
  { department: 'HR', avgWellness: 78, riskLevel: 'Low' },
];

export default function EnterpriseDashboard({ onBack }) {
  return (
    <div className="page active" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}><Icons.ArrowLeft size={24}/></button>
        <div>
          <h1 className="page-title">Enterprise Dashboard</h1>
          <p className="page-subtitle">Aggregate employee wellness & productivity metrics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="dash-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--text-muted)' }}>
            <Icons.Users size={18} /> Total Active Employees
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>142</div>
        </div>
        <div className="dash-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--text-muted)' }}>
            <Icons.Activity size={18} /> Avg Company Wellness
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-dark)' }}>74/100</div>
        </div>
        <div className="dash-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--text-muted)' }}>
            <Icons.AlertTriangle size={18} color="#ef4444" /> Burnout Risk (High)
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>12%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div className="dash-card">
          <h3 style={{ marginBottom: 24 }}>Company Stress & Energy Trends (7 Days)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} name="Avg Stress" />
                <Line type="monotone" dataKey="energy" stroke="#22c55e" strokeWidth={3} name="Avg Energy" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card">
          <h3 style={{ marginBottom: 24 }}>Department Wellness Breakdown</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="avgWellness" fill="var(--green)" radius={[0, 4, 4, 0]} name="Wellness Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <h3 style={{ marginBottom: 16 }}>Recommended Interventions</h3>
        <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <li style={{ marginBottom: 8 }}><strong>Sales Team:</strong> High burnout risk detected. Consider introducing a "No-Meeting Friday" afternoon to allow for deep work and decompression.</li>
          <li style={{ marginBottom: 8 }}><strong>Engineering Team:</strong> Ergonomic issues rising. Send a reminder about the 20-20-20 rule and encourage taking brief stretching breaks.</li>
          <li style={{ marginBottom: 0 }}><strong>Company Wide:</strong> Sleep quality is lowest on Wednesdays. Suggest offering a late-start Thursday once a month.</li>
        </ul>
      </div>
    </div>
  );
}
