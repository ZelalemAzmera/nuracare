import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

function Checkups({ profile, setActivePage, showToast = alert }) {
  const { checkups, addCheckup, deleteCheckup, loading } = useCheckups();
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' or 'history'
  const [modalOpen, setModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [nextVisit, setNextVisit] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  const handleSaveVisit = async () => {
    if (!activeItem) return;
    const newVisit = { 
      name: activeItem.name, 
      doctor: doctorName,
      date_logged: new Date().toISOString().split('T')[0],
      notes,
      next_visit: nextVisit,
      source: 'manual'
    };
    await addCheckup(newVisit);
    setModalOpen(false);
    setDoctorName('');
    setNotes('');
    setNextVisit('');
    setActiveTab('history'); // Auto-switch to History tab so user sees the new entry
    showToast(`${activeItem.name} logged successfully!`, 'success');
  };

  const openModal = (item) => {
    setActiveItem(item);
    setDoctorName('');
    setNotes('');
    setNextVisit('');
    setModalOpen(true);
  };

  const getDueStatus = (dateStr) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `Overdue by ${Math.abs(days)} days`, color: '#ef4444', bg: '#fef2f2' };
    if (days <= 14) return { text: `Due in ${days} days`, color: '#d97706', bg: '#fffbeb' };
    return null;
  };

  const createCalendarLink = (visit) => {
    if (!visit.next_visit) return '#';
    const date = visit.next_visit.replace(/-/g, '');
    const title = encodeURIComponent(`${visit.name} Appointment`);
    const details = encodeURIComponent(`NuraCare Reminder: Scheduled checkup for ${visit.name}${visit.doctor ? ` with ${visit.doctor}` : ''}.`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}T090000Z/${date}T100000Z&details=${details}`;
  };

  const plannerItems = [
    { name: 'Annual Physical Check', freq: 'Yearly', desc: 'Comprehensive metabolic panel, blood pressure, and general health review.', icon: <Icons.Activity size={24}/> },
    { name: 'Dental Cleaning', freq: 'Every 6 months', desc: 'Preventive cleaning and exam.', icon: <Icons.Smile size={24}/> },
    { name: 'Eye Exam', freq: 'Every 1-2 years', desc: 'Vision check and eye health screening.', icon: <Icons.Eye size={24}/> },
    { name: 'Skin Cancer Screening', freq: 'Yearly', desc: 'Full body dermatology check.', icon: <Icons.Sun size={24}/> },
    { name: 'Vaccination Review', freq: 'Yearly', desc: 'Flu shot and other recommended boosters.', icon: <Icons.Shield size={24}/> },
  ];

  const filteredHistory = checkups.filter(c => {
    if (historyFilter === 'upcoming') return c.next_visit && new Date(c.next_visit) >= new Date(new Date().setHours(0,0,0,0));
    if (historyFilter === 'manual') return c.source === 'manual';
    if (historyFilter === 'ai') return c.source !== 'manual';
    return true;
  });

  return (
    <div className="page active" style={{ position: 'relative' }}>
      <div className="page-header">
        <div><h1 className="page-title">Checkups</h1><p className="page-subtitle">Your routine checkup planner & log</p></div>
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, background: 'var(--bg)', padding: 4, borderRadius: 12 }}>
        <button className={activeTab === 'planner' ? 'btn-primary' : 'btn-ghost'} style={{ flex: 1, padding: 12, borderRadius: 10 }} onClick={() => setActiveTab('planner')}>Planner</button>
        <button className={activeTab === 'history' ? 'btn-primary' : 'btn-ghost'} style={{ flex: 1, padding: 12, borderRadius: 10 }} onClick={() => setActiveTab('history')}>History Log</button>
      </div>

      {activeTab === 'planner' && (
        <>
          <div className="dash-card card-large" style={{ background: 'var(--green-light)', border: 'none', marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green-dark)' }}>
              <Icons.ShieldCheck size={20} /> Stay Ahead of Illness
            </h3>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: 14, lineHeight: 1.5 }}>
              Preventive care helps catch problems early when they are most treatable. Use this planner to track your routine visits.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 32 }}>
            {plannerItems.map((item, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, color: 'var(--text)' }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>{item.name}</h4>
                    <span style={{ fontSize: 12, background: 'var(--green-light)', color: 'var(--green-dark)', padding: '4px 8px', borderRadius: 10, fontWeight: 600 }}>{item.freq}</span>
                  </div>
                  <p style={{ margin: '4px 0 12px 0', fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</p>
                  <button 
                    onClick={() => openModal(item)}
                    style={{ background: 'transparent', border: '1.5px solid var(--border)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    Log Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            {['all', 'upcoming', 'manual', 'ai'].map(f => (
              <button 
                key={f}
                onClick={() => setHistoryFilter(f)}
                style={{
                  background: historyFilter === f ? 'var(--green-light)' : 'var(--bg)',
                  color: historyFilter === f ? 'var(--green-dark)' : 'var(--text-muted)',
                  border: `1px solid ${historyFilter === f ? 'var(--green)' : 'var(--border)'}`,
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                }}>
                {f === 'ai' ? 'AI-Suggested' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Loading checkups...</p>
          ) : filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg)', borderRadius: 16 }}>
              <Icons.Stethoscope size={48} color="var(--border)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--text-muted)' }}>No records found in this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {filteredHistory.map(visit => {
                const status = getDueStatus(visit.next_visit);
                return (
                  <div key={visit.id} style={{ background: 'var(--white)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600 }}>{visit.name}</span>
                        {status && <span style={{ fontSize: 11, background: status.bg, color: status.color, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{status.text}</span>}
                        {visit.source === 'medical_file' && <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0ea5e9', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>From File 📄</span>}
                        {visit.source === 'ai_chat' && <span style={{ fontSize: 11, background: '#f3e8ff', color: '#9333ea', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>From Chat 💬</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{visit.date_logged}</span>
                        <button onClick={() => deleteCheckup(visit.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><Icons.Trash2 size={16} /></button>
                      </div>
                    </div>
                    {visit.doctor && <p style={{ margin: '0 0 4px 0', fontSize: 13, color: 'var(--text-muted)' }}><Icons.User size={12} style={{verticalAlign: 'text-bottom', marginRight: 4}}/> {visit.doctor}</p>}
                    {visit.notes && <p style={{ margin: '4px 0 12px 0', fontSize: 14, color: 'var(--text)' }}><strong>Findings:</strong> {visit.notes}</p>}
                    
                    {visit.next_visit && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--green-dark)', fontWeight: 600 }}>
                          <Icons.Calendar size={14} style={{verticalAlign: 'text-bottom', marginRight: 4}}/> Next: {visit.next_visit}
                        </p>
                        <a href={createCalendarLink(visit)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1a73e8', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icons.Plus size={12} /> Google Calendar
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--white)', padding: 32, borderRadius: 24, width: '90%', maxWidth: 400, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 20 }}>Log {activeItem?.name}</h3>
            
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Doctor or Clinic Name</label>
            <input 
              type="text" 
              value={doctorName} 
              onChange={e => setDoctorName(e.target.value)} 
              placeholder="e.g. Dr. Abebe, Yekatit 12" 
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16, fontFamily: 'inherit' }}
            />

            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Doctor's Findings</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Any notes, prescriptions, or advice?" 
              style={{ width: '100%', height: 80, padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16, resize: 'none', fontFamily: 'inherit' }}
            />
            
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Schedule Next Visit</label>
            <input 
              type="date" 
              value={nextVisit} 
              onChange={e => setNextVisit(e.target.value)} 
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24, fontFamily: 'inherit' }}
            />
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'var(--bg)', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveVisit} style={{ flex: 1, padding: '12px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkups;