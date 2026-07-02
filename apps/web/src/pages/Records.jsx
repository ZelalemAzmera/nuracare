import React, { useState } from 'react';
import * as Icons from 'lucide-react';

export function ExpandableRecordCard({ r }) {
  const [expanded, setExpanded] = useState(false);
  const statusMap = { low: 'Improving', mid: 'Monitoring', high: 'Needs Attention' };
  
  return (
    <div className="record-card" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
      <div className="record-card-header">
        <span className="record-date"><Icons.Calendar size={13} style={{marginRight:5,verticalAlign:'text-bottom'}}/>{r.dateStr}</span>
        <span className={`urgency-badge-sm urgency-${r.urgency}`}>{r.urgency.toUpperCase()}</span>
      </div>
      <div className="record-symptom">{r.summary}</div>
      <div className="record-meta-row">
        <span className="record-status-pill">
          {r.urgency === 'low' ? <Icons.TrendingUp size={12}/> : r.urgency === 'mid' ? <Icons.Activity size={12}/> : <Icons.AlertTriangle size={12}/>}
          {statusMap[r.urgency] || 'Logged'}
        </span>
        {!expanded && r.action && <span className="record-action-hint">{r.action.slice(0, 40)}… <Icons.ChevronDown size={14} style={{verticalAlign: 'middle'}}/></span>}
        {expanded && <Icons.ChevronUp size={14} style={{ color: 'var(--text-muted)' }}/>}
      </div>
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 8 }}><strong>Action Plan:</strong> {r.action}</div>
          {r.natural && r.natural.length > 0 && (
            <div><strong>Natural Remedies:</strong> {r.natural.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MedicalRecords({ profile, onBack }) {
  const records = profile?.records || [];

  return (
    <div className="page active">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
            <Icons.ArrowLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Medical Records</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Your historical health vault</p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        {(!records || records.length === 0) ? (
          <div className="empty-state">
            <Icons.ClipboardList size={52} className="empty-icon" />
            <p>No records yet.</p>
            <p className="empty-sub">Complete a symptom check to see your history here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {[...records].reverse().map(r => (
              <ExpandableRecordCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>

      {profile?.medicalNotes && (
        <div className="dash-card card-large" style={{ marginTop: 32 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: 'var(--text)' }}>Extracted Medical Notes</h3>
          <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12, whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--text-muted)' }}>
            {profile.medicalNotes}
          </div>
        </div>
      )}
    </div>
  );
}
