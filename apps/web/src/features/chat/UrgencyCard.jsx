import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

export function UrgencyCard({ data }) {
  const isMentalHealth = !!data.summary?.toLowerCase().match(/mental|emotion|sad|anxiet|depress|unhappy|stress/);
  const label = data.urgency === 'high' ? <><Icons.AlertOctagon size={16} style={{marginRight: 6, verticalAlign: 'text-bottom'}}/> High Urgency</>
    : data.urgency === 'mid' ? <><Icons.AlertTriangle size={16} style={{marginRight: 6, verticalAlign: 'text-bottom'}}/> Moderate — Monitor Closely</>
    : <><Icons.CheckCircle size={16} style={{marginRight: 6, verticalAlign: 'text-bottom'}}/> Low Urgency — Self-Care</>;
  return (
    <div className={`result-card urgency-card-${data.urgency}`} style={{ marginTop: 12, maxWidth: '90%' }}>
      {!isMentalHealth && <div className={`urgency-badge urgency-${data.urgency}`} style={{ marginBottom: 16 }}>{label}</div>}
      
      {data.urgency === 'high' && (
        <div className="result-section" style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
          <div className="result-section-label" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}><Icons.AlertCircle size={18} /> Immediate Medical Attention Recommended</div>
          <p style={{ color: '#991b1b', fontSize: '14px', marginBottom: '12px' }}>Your symptoms indicate a potentially serious condition. Please seek medical help immediately.</p>
          {data._hospitals && data._hospitals.length > 0 ? (
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#991b1b', marginBottom: 8 }}>Nearest facilities to your current location:</p>
              {data._hospitals.map((h, i) => (
                <a key={i} href={h.directionsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'white', borderRadius: 8, marginBottom: 6, textDecoration: 'none', color: '#991b1b', border: '1px solid #fecaca', fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{h.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#dc2626' }}><Icons.MapPin size={14}/> {h.distance}</span>
                </a>
              ))}
            </div>
          ) : (
            <a href="https://www.google.com/maps/search/hospitals+near+me/" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#dc2626', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
              <Icons.MapPin size={18} style={{marginRight: 8}} /> Find Nearest Hospital
            </a>
          )}
        </div>
      )}

      {data.action && data.urgency !== 'high' && (
        <div className="result-section">
          <div className="result-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icons.CheckSquare size={18} /> What To Do</div>
          <p>{data.action}</p>
        </div>
      )}
      {data.naturalRemedies && data.naturalRemedies.length > 0 && data.urgency !== 'high' && (
        <div className="result-section">
          <div className="result-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Leaf size={18} /> Natural Support</div>
          <ul className="natural-list">
            {data.naturalRemedies.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
      <div className="result-saved"><Icons.CheckCircle size={14} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />Saved to your Records</div>
    </div>
  );
}
