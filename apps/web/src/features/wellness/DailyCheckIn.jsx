import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { saveCheckin, computeWellnessScore } from '@/lib/wellnessEngine';

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

  const [mealStyle, setMealStyle] = useState('Individual Plate');
  const [portion, setPortion] = useState('Normal');

  const [plannedActivity, setPlannedActivity] = useState('Rest Day (Suggested)');
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
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
      if (localStorage.getItem('nuracare_welcome_done')) {
        setStep(1); // Auto-start the popup if not submitted and user is not brand new
      }
    }
  }, [forceShow]);

  useEffect(() => {
    const handleFirst = () => {
      setStep(1);
    };
    window.addEventListener('trigger-first-checkin', handleFirst);
    return () => window.removeEventListener('trigger-first-checkin', handleFirst);
  }, []);

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
      activity,
      mealStyle,
      portion
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
          <div className="form-content-box checkin-form-box">
            <div className="step-header" style={{ marginBottom: 32 }}>
              {step > 1 ? (
                <button className="btn-back" onClick={() => setStep(step - 1)}><Icons.ArrowLeft size={18}/></button>
              ) : (
                <div style={{width: 18}}></div> 
              )}
              <span className="step-indicator" style={{background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 600}}>{step} of 5</span>
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
                  
                    <div style={{ background: 'var(--green-light)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--green)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icons.Watch size={24} color="var(--green-dark)" />
                        <div>
                          {isEditingSleep ? (
                            <input type="number" autoFocus value={sleepHours} onChange={e => setSleepHours(Number(e.target.value))} onBlur={() => setIsEditingSleep(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingSleep(false)} style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', width: '80px', background: 'var(--white)', border: '2px solid var(--green)', borderRadius: '12px', padding: '8px 12px', outline: 'none', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)' }} />
                          ) : (
                             <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--green-dark)' }}>{sleepHours}h 15m</div>
                          )}
                          <div style={{ fontSize: '13px', color: 'var(--green-dark)', opacity: 0.8 }}>Synced via Fitbit/Google Health</div>
                        </div>
                      </div>
                      <button onClick={() => setIsEditingSleep(!isEditingSleep)} style={{ background: 'var(--white)', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--green-dark)', cursor: 'pointer' }}>{isEditingSleep ? 'Done' : 'Edit'}</button>
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
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Today's Planned Activity</label>
                  
                  <div style={{ background: 'var(--green-light)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--green)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icons.Activity size={24} color="var(--green-dark)" />
                      <div>
                        {isEditingActivity ? (
                          <input type="text" autoFocus value={plannedActivity} onChange={e => setPlannedActivity(e.target.value)} onBlur={() => setIsEditingActivity(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingActivity(false)} style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', width: '180px', background: 'var(--white)', border: '2px solid var(--green)', borderRadius: '12px', padding: '8px 12px', outline: 'none', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)' }} />
                        ) : (
                          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--green-dark)' }}>{plannedActivity}</div>
                        )}
                        <div style={{ fontSize: '13px', color: 'var(--green-dark)', opacity: 0.8 }}>Based on your wearable data</div>
                      </div>
                    </div>
                    <button onClick={() => setIsEditingActivity(!isEditingActivity)} style={{ background: 'var(--white)', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--green-dark)', cursor: 'pointer' }}>{isEditingActivity ? 'Done' : 'Edit'}</button>
                  </div>
                </div>

                <button className="btn-primary" style={{ marginTop: 40 }} onClick={() => setStep(5)}>Next Step</button>
              </div>
            )}

            {/* STEP 5: NUTRITION & GEBETA */}
            {step === 5 && (
              <div className="onboarding-step active">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ padding: 18, background: 'var(--green-light)', borderRadius: '50%' }}><Icons.Utensils size={34} color="var(--green-dark)" /></div>
                </div>
                <h2 className="step-title" style={{ textAlign: 'center', color: 'var(--text)' }}>Nutrition & Meals</h2>
                
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>How did you eat your main meals?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    {['Individual Plate', 'Communal (Gebeta)'].map(opt => (
                      <button key={opt} onClick={() => setMealStyle(opt)} style={{
                        padding: '14px', borderRadius: 16, border: '1.5px solid var(--green)',
                        background: mealStyle === opt ? 'var(--green)' : 'transparent',
                        color: mealStyle === opt ? 'white' : 'var(--green-dark)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: 14
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {mealStyle === 'Communal (Gebeta)' && (
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid #e2e8f0', fontSize: 13, color: 'var(--text-muted)' }}>
                    <Icons.Info size={16} style={{ marginBottom: 8, color: '#3b82f6' }} />
                    <p style={{ margin: 0 }}><strong>Gebeta Tip:</strong> When sharing a plate, imagine dividing it into slices like a pie. If there are 4 people, your portion is roughly 1/4 of the injera and toppings directly in front of you. Try not to reach across!</p>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Estimated Portion Size</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {['Light', 'Normal', 'Heavy (Overate)'].map(opt => (
                      <button key={opt} onClick={() => setPortion(opt)} style={{
                        padding: '12px 18px', borderRadius: 24, border: '1.5px solid var(--green)',
                        background: portion === opt ? 'var(--green)' : 'transparent',
                        color: portion === opt ? 'white' : 'var(--green-dark)',
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
