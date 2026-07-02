import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseProfile } from '@/hooks/useSupabase';
import { useCheckups } from '@/hooks/useCheckups';
import DailyCheckIn from '@/features/wellness/DailyCheckIn';
import WellnessDashboard from '@/pages/Wellness';
import LifestyleCoach from '@/pages/Lifestyle';
import WearableHub from '@/pages/Wearables';
import MedicalRecords, { ExpandableRecordCard } from '@/pages/Records';
import SubscriptionPage from '@/pages/Subscription';
import EnterpriseDashboard from '@/pages/Enterprise';
import { PrivacyPolicy, TermsOfService, MedicalDisclaimer } from '@/pages/Legal';
import ToastContainer from '@/components/ui/Toast';
import AppSkeleton from '@/components/ui/AppSkeleton';
import { DeleteModal, ShareModal } from '@/components/ui/Modal';
import NavItem from '@/components/layout/NavItem';
import Chat from '@/features/chat/ChatPanel';
import Checkups from '@/features/checkups/CheckupsPanel';
import Discovery from '@/features/discovery/DiscoveryPanel';
import AuthPage from '@/features/auth/AuthPage';
import Home from '@/pages/Home';
import CheckinPage from '@/features/wellness/CheckinPage';
import FloatingLeaves from '@/components/layout/FloatingLeaves';
import { showToast, formatDate } from '@/lib/utils';
import { TSOM_TYPES } from '@/lib/ethiopianCalendar';
import { supabase } from '@/lib/supabase';

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name];
  return IconComponent ? <IconComponent {...props} /> : <Icons.HelpCircle {...props} />;
};


export default function App() {
  const { user, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const { profile, setProfile, clearProfile, loading: profileLoading } = useSupabaseProfile();
  const { sessions, saveSession, deleteSession, clearSessions, loading: sessionsLoading } = useSupabaseSessions();
  const { checkups, updateCheckup } = useCheckups();
  const { t, lang, setLang } = useTranslation();
  
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activePage, setActivePage] = useState(() => localStorage.getItem('nuracare_activePage') || 'home');
  
  useEffect(() => {
    // Handle Payment Redirects
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      showToast('Payment successful! Welcome to Premium.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Give local mock premium access immediately
      if (profile) {
        const p = { ...profile, is_premium: true };
        setProfile(p);
        localStorage.setItem('nuracare_profile', JSON.stringify(p));
      }
    } else if (params.get('payment') === 'cancel') {
      showToast('Payment was cancelled.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nuracare_activePage', activePage);
  }, [activePage]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discoveryTab, setDiscoveryTab] = useState(() => localStorage.getItem('nuracare_discoveryTab') || 'herbs');
  
  useEffect(() => {
    localStorage.setItem('nuracare_discoveryTab', discoveryTab);
  }, [discoveryTab]);

  // Smart Reminder Engine
  useEffect(() => {
    if (!checkups || checkups.length === 0) return;

    // Ask for Notification permission if not granted yet
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const triggerReminder = (checkup, message, flagKey) => {
      showToast(message, 'warning');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('NuraCare Reminder', { body: message });
      }
      updateCheckup(checkup.id, { [flagKey]: true });
    };

    const interval = setInterval(() => {
      const now = new Date();
      checkups.forEach(c => {
        if (!c.next_visit) return;
        const [year, month, day] = c.next_visit.split('-');
        const visitDate = new Date(year, month - 1, day, 9, 0, 0); // 9:00 AM local
        
        const diffMs = visitDate.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffDays <= 5 && diffDays > 4.5 && !c.reminded_5d) {
          triggerReminder(c, `Your ${c.name} appointment is in 5 days.`, 'reminded_5d');
        } else if (diffDays <= 1 && diffDays > 0.5 && !c.reminded_1d) {
          triggerReminder(c, `Reminder: ${c.name} is tomorrow!`, 'reminded_1d');
        } else if (diffHours <= 1 && diffHours > 0 && !c.reminded_1h) {
          triggerReminder(c, `🚨 ${c.name} appointment is in 1 hour!`, 'reminded_1h');
        }
      });
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [checkups, updateCheckup]);
  
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [shareSession, setShareSession] = useState(null);
  
  // We keep currentSessionId in state at App level so sidebar can highlight the active session
  const [currentSessionId, setCurrentSessionId] = useState(() => 'session-' + Date.now());

  // Onboarding Form State
  const [obName, setObName] = useState('');
  useEffect(() => {
    if (user?.user_metadata?.full_name && !obName) {
      setObName(user.user_metadata.full_name);
    }
  }, [user]);
  const [obAge, setObAge] = useState('');
  const [obCulturalHeritage, setObCulturalHeritage] = useState('Global');
  const [obLang, setObLang] = useState('English');
  const [obConditions, setObConditions] = useState([]);
  const [obOtherCondition, setObOtherCondition] = useState('');
  const [obFasting, setObFasting] = useState(TSOM_TYPES.NONE);
  const [obMeds, setObMeds] = useState([]);

  // Profile Meds Edit
  const [profileMedsInput, setProfileMedsInput] = useState([]);

  useEffect(() => {
    if (user && !profile && !profileLoading && onboardingStep <= 0) {
      setOnboardingStep(1);
    }
  }, [user, profile, profileLoading, onboardingStep]);

  useEffect(() => {
    if (profile) {
      if (typeof profile.medications === 'string') {
        setProfileMedsInput(profile.medications.split(',').map(s=>s.trim()).filter(Boolean));
      } else {
        setProfileMedsInput(profile.medications || []);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.location) return;
    
    fetchLocationWithSecurity()
      .then(loc => {
        if (!loc) return;
        if (loc.isVpn) {
          showToast("We noticed you are using a VPN or secure proxy. To make sure we show accurate local medical centers, weather patterns, and currency options, your real-time GPS location will be used during setup.", "warning");
        }
        const p = {
          ...profile,
          location: loc
        };
        setProfile(p);
      })
      .catch(() => {});
  }, [profile, setProfile]);

  const saveProfile = (p) => {
    setProfile(p);
  };

  const handleLogout = async () => {
    await signOut(); // MUST be first — user becomes null before any state clears
    clearProfile();
    clearSessions();
    setOnboardingStep(0);
    setActivePage('home');
    setCurrentSessionId('session-' + Date.now());
    setObName(''); setObAge(''); setObCulturalHeritage('Global'); setObConditions([]); setObOtherCondition(''); setObFasting(TSOM_TYPES.NONE); setObMeds([]);
    localStorage.removeItem('nuracare_activePage');
  };

  const handleDeleteSession = (id) => {
    setSessionToDelete(id);
  };

  const confirmDeleteSession = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      if (currentSessionId === sessionToDelete) {
        setCurrentSessionId('session-' + Date.now());
      }
      setSessionToDelete(null);
    }
  };

  const toggleCondition = (cond) => {
    setObConditions(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]);
  };

  const completeOnboarding = (medicalNotes = '') => {
    const baseConditions = obConditions.filter(c => c !== 'none');
    const allConditions = obOtherCondition.trim()
      ? [...baseConditions, obOtherCondition.trim()]
      : baseConditions;
    const p = {
      name: obName,
      age: obAge,
      culturalHeritage: obCulturalHeritage,
      langPref: obLang,
      conditions: allConditions,
      medications: obMeds,
      fastingMode: obFasting,
      medicalNotes: medicalNotes || '',
      records: []
    };
    saveProfile(p);
    setProfileMedsInput(p.medications);
  };

  if (authLoading || (user && profileLoading)) {
    return <AppSkeleton />;
  }

  if (!profile) {
    if (onboardingStep === -1) {
      return (
        <>
          <AuthPage setOnboardingStep={setOnboardingStep} setActivePage={setActivePage} useAuth={useAuth} t={t} />
          <ToastContainer />
        </>
      );
    }

    if (onboardingStep === 0) {
      return (
        <div className="landing-page">
          <FloatingLeaves />
          <div className="hero-section">
            <div className="hero-icon-wrap"><Icons.Leaf /></div>
            <h1 className="hero-title">NuraCare</h1>
            <p className="hero-subtitle">Your calm, natural health companion.</p>
            <button className="btn-primary btn-large mb-4" onClick={() => {
              if (user) {
                setOnboardingStep(1);
              } else {
                setOnboardingStep(-1);
              }
            }}>
              {user ? (
                <>Complete your profile <Icons.ArrowRight size={20} style={{marginLeft: 8}}/></>
              ) : (
                <>Start your session <Icons.ArrowRight size={20} style={{marginLeft: 8}}/></>
              )}
            </button>
            <div style={{height: 40}}></div>
            <img src="/hero.png" alt="Natural Wellness" className="hero-media" />
          </div>

          <div className="landing-features-wrap">
            <div className="landing-features">
              <div className="feature-card">
                <div className="feat-icon"><Icons.MessageCircle /></div>
                <h3>Intelligent Symptom Checking</h3>
                <p>Chat naturally with Nura to understand your symptoms and gauge urgency in seconds.</p>
              </div>
              <div className="feature-card">
                <div className="feat-icon"><Icons.Sparkles /></div>
                <h3>Natural Holistic Remedies</h3>
                <p>Discover personalized herbal and dietary tips tailored to your body's needs.</p>
              </div>
              <div className="feature-card">
                <div className="feat-icon"><Icons.ShieldCheck /></div>
                <h3>Private Health Records</h3>
                <p>Keep track of your health journey securely with automated session logging.</p>
              </div>
            </div>
          </div>

          <div className="landing-discovery">
            <div className="landing-disc-inner">
              <h2 className="landing-disc-title">Explore Natural Remedies</h2>
              <div className="discovery-grid" style={{marginBottom: 40}}>
                {discoveryData.herbs.slice(0, 4).map(item => (
                  <div key={item.name} className="disc-card">
                    <img src={item.image} alt={item.name} className="disc-card-img" />
                    <div className="disc-card-content">
                      <div className="disc-card-name">{item.name}</div>
                      <div className="disc-card-benefit">{item.benefit}</div>
                      <div className="disc-card-tag">HERB</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('privacy'); }} style={{ margin: '0 10px', color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('terms'); }} style={{ margin: '0 10px', color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('disclaimer'); }} style={{ margin: '0 10px', color: 'var(--text-muted)', textDecoration: 'none' }}>Medical Disclaimer</a>
          </div>
        </div>
      );
    }

    return (
      <div className="onboarding-overlay">
        <div className="onboarding-bg-leaf"></div>
        <div className="full-page-form">
          <div className="form-content-box" style={{background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '28px', padding: '44px 40px', boxShadow: '0 24px 64px rgba(34,197,94,0.12), 0 8px 24px rgba(0,0,0,0.04)'}}>
            {onboardingStep === 1 && (
              <div className="onboarding-step active">
                <div className="step-header">
                  <button className="btn-back" onClick={() => setOnboardingStep(0)}><Icons.ArrowLeft size={16}/></button>
                  <span className="step-indicator">1 of 3</span>
                </div>
                <h2 className="step-title">Let's get acquainted</h2>
                <p className="step-desc">Tell us a bit about yourself so we can personalize your experience.</p>
                <div className="form-group">
                  <label>What's your name?</label>
                  <input type="text" value={obName} onChange={e => setObName(e.target.value)} placeholder="e.g. Sarah" />
                </div>
                <div className="form-group">
                  <label>How old are you?</label>
                  <input type="number" value={obAge} onChange={e => setObAge(e.target.value)} placeholder="e.g. 28" />
                </div>
                <div className="form-group">
                  <label>Location Born (Heritage/Cultural Identity)</label>
                  <select value={obCulturalHeritage} onChange={e => setObCulturalHeritage(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Language & Presentation Preference (Optional)</label>
                  <select value={obLang} onChange={e => setObLang(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}}>
                    <option value="English">English</option>
                    <option value="Amharic">Amharic (አማርኛ)</option>
                    <option value="Oromiffa">Oromiffa (Afaan Oromoo)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location Right Now (Physical Tracker)</label>
                  <button onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        showToast(`GPS Location Pinned! (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`, "success");
                      }, err => showToast("GPS Permission Denied. Using IP fallback.", "error"));
                    }
                  }} className="btn-outline-sm" style={{width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600}}>
                    <Icons.MapPin size={18} color="var(--green)" /> Pin My Location
                  </button>
                </div>
                <button className="btn-primary" onClick={() => { if(obName) setOnboardingStep(2); else showToast("Please enter your name", "error"); }}>Continue</button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="onboarding-step active">
                <div className="step-header">
                  <button className="btn-back" onClick={() => setOnboardingStep(1)}><Icons.ArrowLeft size={16}/></button>
                  <span className="step-indicator">2 of 3</span>
                </div>
                <h2 className="step-title">Your health baseline</h2>
                <p className="step-desc">Do you have any of these common conditions? (Optional)</p>
                <div className="checkbox-grid">
                  {[
                    { id: 'diabetes', label: 'Diabetes', icon: Icons.Activity },
                    { id: 'hypertension', label: 'Hypertension', icon: Icons.Heart },
                    { id: 'asthma', label: 'Asthma', icon: Icons.Wind },
                    { id: 'arthritis', label: 'Arthritis', icon: Icons.Bone },
                    { id: 'anxiety', label: 'Anxiety', icon: Icons.Brain },
                    { id: 'none', label: 'None', icon: Icons.Sparkles }
                  ].map(c => (
                    <label key={c.id} className="checkbox-card" style={obConditions.includes(c.id) ? { borderColor: 'var(--green)', background: 'var(--green-light)' } : {}}>
                      <input type="checkbox" checked={obConditions.includes(c.id)} onChange={() => toggleCondition(c.id)} />
                      <c.icon size={18} style={{ color: 'var(--green)' }} /><span>{c.label}</span>
                    </label>
                  ))}
                  {/* Other — free text */}
                  <label
                    className="checkbox-card"
                    style={obConditions.includes('other') ? { borderColor: 'var(--green)', background: 'var(--green-light)', gridColumn: 'span 2' } : { gridColumn: 'span 2' }}
                  >
                    <input type="checkbox" checked={obConditions.includes('other')} onChange={() => toggleCondition('other')} />
                    <Icons.PenLine size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    <span>Other</span>
                  </label>
                </div>
                {obConditions.includes('other') && (
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <input
                      type="text"
                      value={obOtherCondition}
                      onChange={e => setObOtherCondition(e.target.value)}
                      placeholder="e.g. Celiac disease, Lupus, PCOS..."
                      autoFocus
                    />
                  </div>
                )}
                
                {obCulturalHeritage === 'Ethiopia' && (
                  <>
                    <h3 style={{ fontSize: 16, marginTop: 24, marginBottom: 12, color: 'var(--text)' }}>Track Religious Fasting Calendars?</h3>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: 16, border: '1px solid var(--border)', borderRadius: 12, marginBottom: 8 }}>
                      <input 
                        type="radio" 
                        checked={obFasting === TSOM_TYPES.NONE} 
                        onChange={() => setObFasting(TSOM_TYPES.NONE)} 
                        style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>None</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Track balanced global nutrition macros.</span>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: 16, border: '1px solid var(--border)', borderRadius: 12, marginBottom: 8 }}>
                      <input 
                        type="radio" 
                        checked={obFasting === TSOM_TYPES.ORTHODOX} 
                        onChange={() => setObFasting(TSOM_TYPES.ORTHODOX)} 
                        style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>Orthodox Christian (Tsom)</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Automatically active based on Bahire Hasab.</span>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
                      <input 
                        type="radio" 
                        checked={obFasting === TSOM_TYPES.ISLAMIC} 
                        onChange={() => setObFasting(TSOM_TYPES.ISLAMIC)} 
                        style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>Islamic Fasting</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ramadan & Voluntary Fasts (Lunar tracked).</span>
                      </div>
                    </label>
                  </>
                )}

                <button className="btn-primary" onClick={() => setOnboardingStep(3)} style={{ marginTop: 24 }}>Continue</button>
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="onboarding-step active">
                <div className="step-header">
                  <button className="btn-back" onClick={() => setOnboardingStep(2)}><Icons.ArrowLeft size={16}/></button>
                  <span className="step-indicator">3 of 3</span>
                </div>
                <h2 className="step-title">Regular Medications</h2>
                <p className="step-desc">List any medications you take regularly to help Nura give safe advice. (Optional)</p>
                <div className="form-group">
                  <MedTagInput tags={obMeds} setTags={setObMeds} placeholder="e.g. Metformin, Vitamin D... Press Enter to add" />
                </div>
                <button className="btn-primary" onClick={() => setOnboardingStep(4)}>Continue <Icons.ArrowRight size={18} style={{marginLeft: 8}}/></button>
              </div>
            )}
            {onboardingStep === 4 && (
              <div className="onboarding-step active">
                <div className="step-header">
                  <button className="btn-back" onClick={() => setOnboardingStep(3)}><Icons.ArrowLeft size={16}/></button>
                  <span className="step-indicator">4 of 4</span>
                </div>
                <h2 className="step-title">Medical Records</h2>
                <p className="step-desc">Upload any recent medical reports or test results to give Nura better context. (Optional)</p>
                
                <FileUploadStep onComplete={(notes) => completeOnboarding(notes)} />
                
                <button className="btn-outline-sm" style={{width: '100%', marginTop: 12, padding: 16}} onClick={() => completeOnboarding('')}>Skip for Now</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-app">
      <DailyCheckIn isGlobal={true} />
      <FloatingLeaves />
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Icons.Leaf className="logo-icon-sm" color="var(--green)" />
          <span className="logo-label">NuraCare</span>
        </div>
        <nav className="sidebar-nav">
          <NavItem icon={Icons.Home} label={t("home")} active={activePage === 'home'} onClick={() => {setActivePage('home'); setSidebarOpen(false);}} />
          <NavItem icon={Icons.CalendarCheck} label={t("daily_checkin")} active={activePage === 'checkin'} onClick={() => { setActivePage('checkin'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.MessageCircle} label={t("chat")} active={activePage === 'chat'} onClick={() => {setActivePage('chat'); setSidebarOpen(false);}} />
          <NavItem icon={Icons.Stethoscope} label={t("checkups")} active={activePage === 'checkups'} onClick={() => { setActivePage('checkups'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.Sparkles} label={t("discover")} active={activePage === 'discovery'} onClick={() => { setActivePage('discovery'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.Zap} label={t("lifestyle")} active={activePage === 'lifestyle'} onClick={() => { setActivePage('lifestyle'); setSidebarOpen(false); }} />
        </nav>
        <div className="sidebar-bottom">
          <div className="mobile-only-sessions">
            <div style={{fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5}}>{t("past_sessions").toUpperCase()}</div>
            {sessions.slice(0, 5).map(s => (
               <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                 <a href="#" className={`nav-item ${currentSessionId === s.id && activePage === 'chat' ? 'active' : ''}`} style={{padding:'8px 20px', fontSize: 13, minHeight: '36px', flex: 1, paddingRight: '8px'}} onClick={(e) => {
                   e.preventDefault();
                   setCurrentSessionId(s.id);
                   setActivePage('chat');
                   setSidebarOpen(false);
                 }}>
                   <span className="nav-icon" style={{marginRight: 8}}><Icons.MessageCircle size={14}/></span>
                   <span className="nav-label" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.name}</span>
                 </a>
                 <button style={{ background: 'none', border: 'none', padding: '8px', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.7 }} onClick={(e) => { e.preventDefault(); handleDeleteSession(s.id); }}>
                   <Icons.Trash2 size={14} />
                 </button>
               </div>
            ))}
            <a href="#" className="nav-item" style={{padding:'8px 20px', fontSize: 13, minHeight: '36px', color:'var(--green)', marginBottom: 12}} onClick={(e) => {
                 e.preventDefault();
                 setCurrentSessionId('session-' + Date.now());
                 setActivePage('chat');
                 setSidebarOpen(false);
               }}>
                 <span className="nav-icon" style={{marginRight: 8}}><Icons.Plus size={14}/></span>
                 <span className="nav-label">{t("new_session")}</span>
            </a>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'var(--font)', marginBottom: 12, outline: 'none'}}>
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
          <NavItem icon={Icons.User} label={t("profile")} active={activePage === 'profile'} onClick={() => { setActivePage('profile'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.Star} label={t("upgrade_premium")} active={activePage === 'upgrade'} onClick={() => { setActivePage('upgrade'); setSidebarOpen(false); }} />
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('privacy'); setSidebarOpen(false); }} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('terms'); setSidebarOpen(false); }} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('disclaimer'); setSidebarOpen(false); }} style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Medical Disclaimer</a>
          </div>
        </div>
      </aside>

      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}><Icons.Menu /></button>
        <div className="mobile-logo" style={{display: 'flex', alignItems: 'center'}}><Icons.Leaf size={16} style={{marginRight: 4}}/> NuraCare</div>
        <div className="mobile-avatar">{profile.name ? profile.name[0].toUpperCase() : <Icons.User size={18} />}</div>
      </div>

      <main className="content-area">
        {activePage === 'home' && <Home profile={profile} setActivePage={setActivePage} t={t} />}
        {activePage === 'wellness' && <WellnessDashboard user={profile} profile={profile} records={profile.records || []} />}
        {activePage === 'chat' && <ChatErrorBoundary><Chat profile={profile} saveProfile={saveProfile} sessions={sessions} saveSession={saveSession} deleteSession={deleteSession} handleDeleteSession={handleDeleteSession} setShareSession={setShareSession} currentSessionId={currentSessionId} setCurrentSessionId={setCurrentSessionId} t={t} lang={lang} /></ChatErrorBoundary>}
        {activePage === 'records' && <MedicalRecords profile={profile} onBack={() => setActivePage('profile')} />}
        {activePage === 'checkups' && <Checkups profile={profile} setActivePage={setActivePage} showToast={showToast} />}
        {activePage === 'discovery' && <Discovery t={t} />}
        {activePage === 'lifestyle' && <LifestyleCoach profile={profile} checkins={profile.records || []} t={t} />}
        {activePage === 'checkin' && <CheckinPage profile={profile} />}
        {activePage === 'devices' && <WearableHub onBack={() => setActivePage('profile')} showToast={showToast} profile={profile} />}
        {activePage === 'privacy' && <PrivacyPolicy onBack={() => setActivePage('home')} />}
        {activePage === 'terms' && <TermsOfService onBack={() => setActivePage('home')} />}
        {activePage === 'disclaimer' && <MedicalDisclaimer onBack={() => setActivePage('home')} />}
        {activePage === 'upgrade' && <SubscriptionPage profile={profile} onBack={() => setActivePage('home')} onNavigateEnterprise={() => setActivePage('enterprise')} />}
        {activePage === 'enterprise' && <EnterpriseDashboard onBack={() => setActivePage('home')} />}
        {activePage === 'profile' && (
          <div className="page active">
            <div className="page-header">
              <div>
                <h1 className="page-title">Profile</h1>
                <p className="page-subtitle">Your personal wellness profile</p>
              </div>
              <button className="btn-outline-sm" onClick={handleLogout} style={{color: 'var(--text)', borderColor: 'var(--border)'}}>
                <Icons.LogOut size={14} style={{marginRight: 4, verticalAlign: 'text-bottom'}} /> Logout
              </button>
            </div>
            <div className="profile-card">
              <div className="profile-avatar">{profile.name ? profile.name[0].toUpperCase() : <Icons.User size={32} />}</div>
              <div className="profile-info">
                <h2>{profile.name || 'User'}</h2>
                <p>{profile.age ? `${profile.age} years old` : ''}</p>
              </div>
            </div>
            <div className="section-title">Conditions</div>
            <div className="profile-tags">
              {profile.conditions && profile.conditions.length > 0 ? profile.conditions.map(c => <span key={c} className="profile-tag">{c.charAt(0).toUpperCase() + c.slice(1)}</span>) : <span className="profile-tag">None reported</span>}
            </div>
            <div className="profile-meds">
              {Array.isArray(profile.medications) && profile.medications.length > 0 ? profile.medications.map((m, i) => <span key={i} className="profile-tag" style={{marginRight: 6}}>{m}</span>) : (profile.medications || 'None reported')}
            </div>

            <div className="section-title" style={{ marginTop: 32 }}>Health Records</div>
            <div className="dash-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--green-light)', borderRadius: 12, color: 'var(--green-dark)' }}>
                  <Icons.ClipboardList size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16 }}>Your Historical Vault</h4>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{profile.records?.length || 0} symptom logs and files.</p>
                </div>
              </div>
              <button className="btn-outline-sm" onClick={() => setActivePage('records')}>View Records</button>
            </div>

            <div className="section-title">{t("update_medications")}</div>
            <div className="form-group">
              <MedTagInput tags={profileMedsInput} setTags={setProfileMedsInput} placeholder="e.g. Metformin 500mg... Press Enter to add" />
            </div>
            <button className="btn-primary" onClick={() => { const p = {...profile, medications: profileMedsInput}; saveProfile(p); }}>{t("save_medications")}</button>

            <div className="section-title" style={{marginTop: 32}}>Connected Devices</div>
            <div className="dash-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Watch size={20} color="var(--green-dark)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>Wearables & Health Apps</h4>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Sync data from Apple Health, Google Fit, Fitbit, or Garmin.</p>
                  </div>
                </div>
                <button className="btn-outline-sm" onClick={() => setActivePage('devices')}>Manage Devices</button>
              </div>
            </div>

            <div className="section-title" style={{marginTop: 32}}>Preferences</div>
            <div className="dash-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 12 }}>
                <input 
                  type="radio" 
                  checked={profile.fastingMode === TSOM_TYPES.NONE} 
                  onChange={() => {
                    saveProfile({ ...profile, fastingMode: TSOM_TYPES.NONE });
                    showToast('Standard diet enabled', 'success');
                  }} 
                  style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                />
                <span style={{ fontWeight: 600 }}>Standard Diet (No Restrictions)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 12 }}>
                <input 
                  type="radio" 
                  checked={profile.fastingMode === TSOM_TYPES.ORTHODOX} 
                  onChange={() => {
                    saveProfile({ ...profile, fastingMode: TSOM_TYPES.ORTHODOX });
                    showToast('Orthodox fasting mode enabled', 'success');
                  }} 
                  style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                />
                <span style={{ fontWeight: 600 }}>Orthodox Christian Fasting (Tsom)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={profile.fastingMode === TSOM_TYPES.ISLAMIC} 
                  onChange={() => {
                    saveProfile({ ...profile, fastingMode: TSOM_TYPES.ISLAMIC });
                    showToast('Islamic fasting mode enabled', 'success');
                  }} 
                  style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                />
                <span style={{ fontWeight: 600 }}>Islamic Fasting (Ramadan)</span>
              </label>
              
              <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                NuraCare will adjust nutritional recommendations and athletic tracking based on your active fasting cycle.
              </p>
            </div>

            <div className="section-title" style={{marginTop: 32}}>{t("medical_notes")}</div>
            <FileUploadStep 
              existingNotes={profile.medicalNotes || ''} 
              isProfile={true} 
              t={t}
              onComplete={(notes) => { const p = {...profile, medicalNotes: notes}; saveProfile(p); showToast('Saved!', 'success'); }} 
            />
          </div>
        )}
      </main>

      <DeleteModal 
        isOpen={!!sessionToDelete} 
        onClose={() => setSessionToDelete(null)} 
        onConfirm={confirmDeleteSession} 
      />
      <ShareModal 
        isOpen={!!shareSession} 
        onClose={() => setShareSession(null)} 
        session={shareSession} 
      />
      <ToastContainer />
    </div>
  );
}

