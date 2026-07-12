import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

import WellnessScore from '@/components/shared/WellnessScore';
import { getDailyTip } from '@/data/discovery';
import { LeafSVG, FlowerSVG, DropletSVG } from '@/components/layout/FloatingLeaves';

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name];
  return IconComponent ? <IconComponent {...props} /> : <Icons.HelpCircle {...props} />;
};

function Home({ profile, setActivePage, t = (k)=>k }) {
  const medsList = Array.isArray(profile.medications) 
    ? profile.medications 
    : (profile.medications ? profile.medications.split(',').map(m => m.trim()).filter(Boolean) : []);
  const records = profile.records || [];
  const lastRec = records.length > 0 ? records[records.length - 1] : null;
  const tip = getDailyTip();

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "greeting_morning" : hour < 18 ? "greeting_afternoon" : "greeting_evening";

  useEffect(() => {
    if ((!profile.records || profile.records.length === 0) && !localStorage.getItem('nuracare_welcome_done')) {
      const t = setTimeout(() => {
        showToast("Welcome to NuraCare! Let's start with your first daily check-in.", "success");
        localStorage.setItem('nuracare_welcome_done', 'true');
        window.dispatchEvent(new Event('trigger-first-checkin'));
      }, 12000);
      return () => clearTimeout(t);
    }
  }, [profile]);

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t(greetingKey)}{profile.name ? `, ${profile.name}` : ''}</h1>
          <p className="page-subtitle">{t("wellness_overview")}</p>
          {profile.location && (
            <div style={{marginTop: 8, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center'}}>
              <Icons.MapPin size={14} style={{marginRight: 4}} /> {profile.location.city}, {profile.location.country}
            </div>
          )}
        </div>
        <div className="date-badge">{formatDate(new Date())}</div>
      </div>

      <div className="tip-card-home">
        <div className="tip-bg-shapes">
          <div style={{position: 'absolute', top: -10, right: -10, width: 90, height: 90, opacity: 0.18, transform: 'rotate(15deg)'}}><LeafSVG id="tip-leaf" /></div>
          <div style={{position: 'absolute', bottom: -8, right: 40, width: 44, height: 44, opacity: 0.13, transform: 'rotate(-15deg)'}}><DropletSVG id="tip-drop" /></div>
          <div style={{position: 'absolute', top: 16, right: 150, width: 44, height: 44, opacity: 0.13, transform: 'rotate(45deg)'}}><FlowerSVG id="tip-flower" /></div>
        </div>
        <div className="tip-icon-large">
          <DynamicIcon name={tip.icon} size={28} />
        </div>
        <div className="tip-content-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="tip-label">TODAY'S INSIGHT</div>
            {tip.tags && tip.tags.length > 0 && (
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontWeight: 600, color: 'var(--green-dark)' }}>
                #{tip.tags[0]}
              </span>
            )}
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 18, color: 'var(--green-dark)' }}>{tip.name}</h3>
          <div className="tip-text" style={{ marginBottom: tip.vid ? 12 : 0 }}>{tip.benefit}</div>
          {tip.vid && (
            <a href={tip.vid} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green-dark)', textDecoration: 'none', fontWeight: 600, background: 'rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: 12 }}>
              <Icons.PlayCircle size={16} /> Watch How
            </a>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card card-large">
          <div className="dash-card-icon"><Icons.HeartPulse size={24} color="var(--green)" /></div>
          <div className="dash-card-info">
            <span className="dash-card-label">Overall Status</span>
            <span className="dash-card-value">
              {lastRec
                ? lastRec.urgency === 'high' ? 'Needs Attention'
                : lastRec.urgency === 'mid' ? 'Monitoring'
                : 'Feeling Good'
                : 'Feeling Good'}
            </span>
          </div>
          <div className="status-dot green"></div>
        </div>
        <div className="dash-card" style={{ gridColumn: 'span 2' }}>
          <div className="dash-card-icon"><Icons.Calendar size={24} color="var(--green)" /></div>
          <div className="dash-card-info">
            <span className="dash-card-label">Last Checkup</span>
            <span className="dash-card-value">{lastRec ? lastRec.dateStr : 'None yet'}</span>
          </div>
        </div>
        <div className="dash-card" style={{ gridColumn: 'span 2' }}>
          <div className="dash-card-icon"><Icons.Zap size={24} color="var(--green)" /></div>
          <div className="dash-card-info">
            <span className="dash-card-label">Urgency Level</span>
            <span className="dash-card-value">
              {lastRec ? <span className={`urgency-badge-sm urgency-${lastRec.urgency}`}>{lastRec.urgency.toUpperCase()}</span> : '—'}
            </span>
          </div>
        </div>
        <div className="dash-card" style={{ gridColumn: 'span 2' }}>
          <div className="dash-card-icon"><Icons.TrendingUp size={24} color="var(--green)" /></div>
          <div className="dash-card-info">
            <span className="dash-card-label">Recovery</span>
            <span className="dash-card-value">{lastRec ? 'Monitoring' : '—'}</span>
          </div>
        </div>
      </div>

      <div className="section-title"><Icons.Pill size={16} style={{marginRight:4, verticalAlign:'text-bottom'}}/> Medication Reminders</div>
      <div className="med-reminder-area">
        {medsList.length > 0 ? medsList.map((m, i) => (
          <div className="med-item" key={i}>
            <Icons.Pill size={18} color="var(--green)" /> <span>{m}</span>
          </div>
        )) : <div className="empty-state-small">No medications added yet. <a href="#" onClick={(e)=>{e.preventDefault(); setActivePage('profile');}}>Add in Profile →</a></div>}
      </div>

      <div className="section-title">Quick Actions</div>
      <div className="quick-actions">
        <button className="quick-btn" onClick={() => setActivePage('chat')}><Icons.MessageCircle size={18} color="var(--green)"/> Check Symptoms</button>
        <button className="quick-btn" onClick={() => setActivePage('discovery')}><Icons.Compass size={18} color="var(--green)"/> Explore Tips</button>
        <button className="quick-btn" onClick={() => setActivePage('wellness')}><Icons.Activity size={18} color="var(--green)"/> Wellness Score</button>
      </div>
    </div>
  );
}

export default Home;