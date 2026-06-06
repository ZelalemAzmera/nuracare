import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { saveCheckin, computeWellnessScore } from './wellnessEngine';

export default function DailyCheckIn({ onComplete, isGlobal = true, forceShow = false }) {
  const [step, setStep] = useState(0); 
  
  // State
  const [sleepHours, setSleepHours] = useState(7);
  const [wakeFeeling, setWakeFeeling] = useState('Refreshed');
  
  const [energy, setEnergy] = useState(5);
  
  const [stress, setStress] = useState(5);
  const [tension, setTension] = useState('None');
  
  const [mood, setMood] = useState(5);
  const [activity, setActivity] = useState('Light');

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsSubmitted(false);
      setStep(1);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const checkins = JSON.parse(localStorage.getItem('nuracare_wellness_checkins') || '[]');
    const todayCheckin = checkins.find(c => c.date === today);
    if (todayCheckin) {
      setIsSubmitted(true);
    } else {
      setStep(1); // Auto-start the popup if not submitted
    }
  }, [forceShow]);

  const handleSubmit = () => {
    let sleepScore = Math.min(10, Math.max(1, sleepHours));
    if (wakeFeeling === 'Groggy' || wakeFeeling === 'Still Tired') sleepScore -= 2;
    if (wakeFeeling === 'Refreshed') sleepScore += 1;
    sleepScore = Math.min(10, Math.max(1, sleepScore));

    const entry = { 
      mood, 
      sleep: sleepScore, 
      stress, 
      energy,
      sleepHours,
      wakeFeeling,
      tension,
      activity
    };
    const saved = saveCheckin(entry);
    setIsSubmitted(true);
    setStep(0);
    if (onComplete) onComplete(saved);
    
    window.dispatchEvent(new Event('checkin-completed'));
  };

  if (isSubmitted && isGlobal) {
    return null; 
  }

  if (!isSubmitted && step > 0) {
    return (
      <div className="onboarding-overlay" style={{ position: 'fixed', zIndex: 9999, background: 'rgba(250, 250, 250, 0.98)' }}>
        <div className="full-page-form">
          <div className="form-content-box" style={{
            background: 'rgba(255, 255, 255, 1)', 
            border: '1px solid rgba(229, 231, 235, 1)', 
            borderRadius: '32px', 
            padding: '44px 40px', 
            boxShadow: '0 24px 64px rgba(34,197,94,0.15)'
          }}>
            <div className="step-header" style={{ marginBottom: 32 }}>
              {step > 1 ? (
                <button className="btn-back" onClick={() => setStep(step - 1)}><Icons.ArrowLeft size={18}/></button>
              ) : (
                <div style={{width: 18}}></div> 
              )}
              <span className="step-indicator" style={{background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 600}}>{step} of 4</span>
            </div>

            {/* STEP 1: SLEEP */}
            {step === 1 && (
              <div className="onboarding-step active">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ padding: 18, background: 'var(--green-light)', borderRadius: '50%' }}><Icons.Moon size={34} color="var(--green-dark)" /></div>
                </div>
                <h2 className="step-title" style={{ textAlign: 'center', color: 'var(--text)' }}>Let's start with sleep</h2>
                
                <div style={{ marginTop: 32, marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>How many hours did you sleep?</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input type="range" min="0" max="12" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(parseFloat(e.target.value))} style={{ flex: 1, accentColor: 'var(--green)' }} />
                    <span style={{ fontWeight: 800, fontSize: 22, width: 55, color: 'var(--green-dark)' }}>{sleepHours}h</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>How do you feel after waking up?</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {['Refreshed', 'Groggy', 'Still Tired', 'Energetic'].map(opt => (
                      <button key={opt} onClick={() => setWakeFeeling(opt)} style={{
                        padding: '12px 18px', borderRadius: 24, border: '1.5px solid var(--green)',
                        background: wakeFeeling === opt ? 'var(--green)' : 'transparent',
                        color: wakeFeeling === opt ? 'white' : 'var(--green-dark)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: 14
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" style={{ marginTop: 40 }} onClick={() => setStep(2)}>Next Step</button>
              </div>
            )}

            {/* STEP 2: ENERGY */}
            {step === 2 && (
              <div className="onboarding-step active">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ padding: 18, background: 'var(--green-light)', borderRadius: '50%' }}><Icons.Zap size={34} color="var(--green-dark)" /></div>
                </div>
                <h2 className="step-title" style={{ textAlign: 'center', color: 'var(--text)' }}>How is your energy?</h2>
                <p className="step-desc" style={{ textAlign: 'center', marginBottom: 40 }}>Rate your physical and mental battery right now.</p>
                <LargeSlider 
                  value={energy} onChange={setEnergy} 
                  lowLabel="Exhausted" highLabel="Energized" color="var(--green-dark)"
                />
                <button className="btn-primary" style={{ marginTop: 40 }} onClick={() => setStep(3)}>Next Step</button>
              </div>
            )}

            {/* STEP 3: STRESS & TENSION */}
            {step === 3 && (
              <div className="onboarding-step active">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ padding: 18, background: 'var(--green-light)', borderRadius: '50%' }}><Icons.Wind size={34} color="var(--green-dark)" /></div>
                </div>
                <h2 className="step-title" style={{ textAlign: 'center', color: 'var(--text)' }}>Stress & Tension</h2>
                
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, textAlign: 'center', color: 'var(--text)' }}>How heavy is your stress load today?</label>
                  <LargeSlider value={stress} onChange={setStress} lowLabel="Calm" highLabel="Very Stressed" color="var(--green-dark)" />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Are you holding physical tension?</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {['Neck', 'Shoulders', 'Jaw', 'Chest', 'None'].map(opt => (
                      <button key={opt} onClick={() => setTension(opt)} style={{
                        padding: '12px 18px', borderRadius: 24, border: '1.5px solid var(--green)',
                        background: tension === opt ? 'var(--green)' : 'transparent',
                        color: tension === opt ? 'white' : 'var(--green-dark)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: 14
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" style={{ marginTop: 40 }} onClick={() => setStep(4)}>Next Step</button>
              </div>
            )}

            {/* STEP 4: MOOD & ACTIVITY */}
            {step === 4 && (
              <div className="onboarding-step active">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ padding: 18, background: 'var(--green-light)', borderRadius: '50%' }}><Icons.Smile size={34} color="var(--green-dark)" /></div>
                </div>
                <h2 className="step-title" style={{ textAlign: 'center', color: 'var(--text)' }}>Mood & Activity</h2>
                
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, textAlign: 'center', color: 'var(--text)' }}>How are you feeling emotionally?</label>
                  <LargeSlider value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" color="var(--green-dark)" />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>What's your planned daily activity?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {['Rest/None', 'Light (Walk)', 'Moderate (Jog)', 'Intense (Gym)'].map(opt => (
                      <button key={opt} onClick={() => setActivity(opt)} style={{
                        padding: '12px 14px', borderRadius: 20, border: '1.5px solid var(--green)',
                        background: activity === opt ? 'var(--green)' : 'transparent',
                        color: activity === opt ? 'white' : 'var(--green-dark)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: 13
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" style={{ marginTop: 40 }} onClick={handleSubmit}>Complete Check-in</button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  return null;
}

function LargeSlider({ value, onChange, lowLabel, highLabel, color }) {
  return (
    <div style={{ padding: '0 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: color }}>{value}</span><span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'flex-end', marginBottom: 4 }}>/10</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max="10" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))} 
        style={{ width: '100%', height: 10, borderRadius: 10, background: '#e5e7eb', accentColor: 'var(--green)', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginTop: 14 }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
