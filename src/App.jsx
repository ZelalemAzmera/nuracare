import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useTranslation } from './useTranslation';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
// Vercel AI SDK used in api/chat.js (server-side streaming)
import { discoveryData, getDailyTip } from './data';
import FloatingLeaves, { LeafSVG, FlowerSVG, DropletSVG } from './FloatingLeaves';
import { useAuth } from './AuthContext';
import { useSupabaseProfile, useSupabaseSessions } from './useSupabase';
import DailyCheckIn from './DailyCheckIn';
import WellnessDashboard from './WellnessDashboard';
import LifestyleCoach from './LifestyleCoach';
import { getCheckins } from './wellnessEngine';

class ChatErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, message: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, message: error?.message || 'Unknown error' }; }
  componentDidCatch(error, info) { console.error('Chat render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="page-header" style={{ flexShrink: 0 }}>
            <div><h1 className="page-title">Continuous Care</h1><p className="page-subtitle">Your natural health companion</p></div>
          </div>
          <div className="chat-container">
            <div className="chat-error-banner" style={{ margin: 24, borderRadius: 12 }}>
              <Icons.AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Nura couldn't load.</strong><br />
                <span>The AI couldn't connect. Make sure <code>VITE_GROQ_API_KEY</code> is set in your <code>.env.local</code> file and restart the dev server.</span><br />
                <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: 10, background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#991b1b', fontSize: 13 }}>Try Again</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name];
  return IconComponent ? <IconComponent {...props} /> : <Icons.HelpCircle {...props} />;
};

export default function App() {
  const { user, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const { profile, setProfile, loading: profileLoading } = useSupabaseProfile();
  const { sessions, loading: sessionsLoading } = useSupabaseSessions();
  const { t, lang, setLang } = useTranslation();
  
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discoveryTab, setDiscoveryTab] = useState('herbs');
  
  // We keep currentSessionId in state at App level so sidebar can highlight the active session
  const [currentSessionId, setCurrentSessionId] = useState(() => 'session-' + Date.now());

  // Onboarding Form State
  const [obName, setObName] = useState('');
  const [obAge, setObAge] = useState('');
  const [obConditions, setObConditions] = useState([]);
  const [obOtherCondition, setObOtherCondition] = useState('');
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
    
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.country_code) {
          const p = {
            ...profile,
            location: {
              country: data.country_name,
              code: data.country_code,
              city: data.city
            }
          };
          setProfile(p);
        }
      })
      .catch(() => {});
  }, [profile, setProfile]);

  const saveProfile = (p) => {
    setProfile(p);
  };

  const handleLogout = () => {
    setProfile(null);
    setOnboardingStep(0);
    setActivePage('home');
    setObName(''); setObAge(''); setObConditions([]); setObOtherCondition(''); setObMeds([]);
    signOut();
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
      conditions: allConditions,
      medications: obMeds,
      medicalNotes: medicalNotes || '',
      records: []
    };
    saveProfile(p);
    setProfileMedsInput(p.medications);
  };

  if (authLoading || profileLoading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}><Icons.Loader className="spin" size={32} color="var(--green)"/></div>;
  }

  if (!profile) {
    if (onboardingStep === -1) {
      return <AuthPage setOnboardingStep={setOnboardingStep} useAuth={useAuth} t={t} />;
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
                <button className="btn-primary" onClick={() => { if(obName) setOnboardingStep(2); else alert("Please enter your name"); }}>Continue</button>
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
                <button className="btn-primary" onClick={() => setOnboardingStep(3)}>Continue</button>
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
          <NavItem icon={Icons.CalendarCheck} label="Daily Check-in" active={activePage === 'checkin'} onClick={() => { setActivePage('checkin'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.MessageCircle} label={t("chat")} active={activePage === 'chat'} onClick={() => {setActivePage('chat'); setSidebarOpen(false);}} />
          <NavItem icon={Icons.Stethoscope} label="Checkups" active={activePage === 'checkups'} onClick={() => { setActivePage('checkups'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.Sparkles} label={t("discover")} active={activePage === 'discovery'} onClick={() => { setActivePage('discovery'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.ClipboardList} label="Records" active={activePage === 'records'} onClick={() => { setActivePage('records'); setSidebarOpen(false); }} />
          <NavItem icon={Icons.Zap} label="Lifestyle" active={activePage === 'lifestyle'} onClick={() => { setActivePage('lifestyle'); setSidebarOpen(false); }} />
        </nav>
        <div className="sidebar-bottom">
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'var(--font)', marginBottom: 12, outline: 'none'}}>
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
          <div className="mobile-only-sessions">
            <div style={{fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5}}>{t("past_sessions").toUpperCase()}</div>
            {sessions.slice(0, 5).map(s => (
               <a href="#" key={s.id} className={`nav-item ${currentSessionId === s.id && activePage === 'chat' ? 'active' : ''}`} style={{padding:'8px 20px', fontSize: 13, minHeight: '36px'}} onClick={(e) => {
                 e.preventDefault();
                 setCurrentSessionId(s.id);
                 setActivePage('chat');
                 setSidebarOpen(false);
               }}>
                 <span className="nav-icon" style={{marginRight: 8}}><Icons.MessageCircle size={14}/></span>
                 <span className="nav-label" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.name}</span>
               </a>
            ))}
            <a href="#" className="nav-item" style={{padding:'8px 20px', fontSize: 13, minHeight: '36px', color:'var(--green)', marginBottom: 12}} onClick={(e) => {
                 e.preventDefault();
                 setCurrentSessionId('session-' + Date.now());
                 setActivePage('chat');
                 setSidebarOpen(false);
               }}>
                 <span className="nav-icon" style={{marginRight: 8}}><Icons.Plus size={14}/></span>
                 <span className="nav-label">New Session</span>
            </a>
          </div>
          <NavItem icon={Icons.User} label="Profile" active={activePage === 'profile'} onClick={() => { setActivePage('profile'); setSidebarOpen(false); }} />
        </div>
      </aside>

      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}><Icons.Menu /></button>
        <div className="mobile-logo" style={{display: 'flex', alignItems: 'center'}}><Icons.Leaf size={16} style={{marginRight: 4}}/> NuraCare</div>
        <div className="mobile-avatar">{profile.name ? profile.name[0].toUpperCase() : '🌿'}</div>
      </div>

      <main className="content-area">
        {activePage === 'home' && <Home profile={profile} setActivePage={setActivePage} t={t} />}
        {activePage === 'chat' && <ChatErrorBoundary><Chat profile={profile} saveProfile={saveProfile} sessions={sessions} saveSession={saveSession} currentSessionId={currentSessionId} setCurrentSessionId={setCurrentSessionId} t={t} lang={lang} /></ChatErrorBoundary>}
        {activePage === 'checkups' && <Checkups profile={profile} setActivePage={setActivePage} />}
        {activePage === 'discovery' && <Discovery tab={discoveryTab} setTab={setDiscoveryTab} t={t} />}
        {activePage === 'records' && <Records profile={profile} />}
        {activePage === 'lifestyle' && <LifestyleCoach />}
        {activePage === 'checkin' && <CheckinPage profile={profile} />}
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
              <div className="profile-avatar">{profile.name ? profile.name[0].toUpperCase() : '🌿'}</div>
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
            <div className="section-title">{t("update_medications")}</div>
            <div className="form-group">
              <MedTagInput tags={profileMedsInput} setTags={setProfileMedsInput} placeholder="e.g. Metformin 500mg... Press Enter to add" />
            </div>
            <button className="btn-primary" onClick={() => { const p = {...profile, medications: profileMedsInput}; saveProfile(p); }}>{t("save_medications")}</button>

            <div className="section-title" style={{marginTop: 32}}>{t("medical_notes")}</div>
            <FileUploadStep 
              existingNotes={profile.medicalNotes || ''} 
              isProfile={true} 
              t={t}
              onComplete={(notes) => { const p = {...profile, medicalNotes: notes}; saveProfile(p); alert('Saved!'); }} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <a href="#" className={`nav-item ${active ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onClick(); }}>
      <span className="nav-icon"><Icon /></span>
      <span className="nav-label">{label}</span>
    </a>
  );
}

function MedTagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState('');
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="med-tag-input-wrap">
      {tags.map((tag, i) => (
        <span key={i} className="med-tag">
          {tag}
          <button type="button" className="med-tag-remove" onClick={() => setTags(tags.filter((_, idx) => idx !== i))}><Icons.X size={14}/></button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="med-tag-input"
      />
    </div>
  );
}

function FileUploadStep({ onComplete, existingNotes = '', isProfile = false, t = (k)=>k }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState(existingNotes);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);
    
    try {
      let text = '';
      if (selected.type === 'application/pdf') {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = Math.min(pdf.numPages, 3);
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(s => s.str).join(' ') + '\\n';
        }
      } else if (selected.type.startsWith('image/')) {
        text = `[Image Uploaded: ${selected.name}]`;
      } else {
        text = await selected.text();
      }
      
      const limitedText = text.slice(0, 2000);
      setExtractedText(limitedText);
    } catch (err) {
      console.error('File extraction failed:', err);
      alert('Could not read file. Please try another.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {!extractedText ? (
        <div className="file-drop-area" style={{ border: '2px dashed var(--green-mid)', borderRadius: 16, padding: 32, textAlign: 'center', background: 'var(--green-light)', position: 'relative', cursor: 'pointer' }}>
          <input type="file" accept=".pdf,image/*,.txt" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
          <Icons.UploadCloud size={32} color="var(--green)" style={{ marginBottom: 12, margin: '0 auto' }} />
          <div style={{ fontWeight: 600, color: 'var(--green-dark)' }}>{t("tap_to_upload")}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{t("file_limits")}</div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
              <Icons.FileText size={16} color="var(--green)" /> {file ? file.name : 'Saved Medical Notes'}
            </div>
            <button onClick={() => { setFile(null); setExtractedText(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Icons.X size={16}/></button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxHeight: 100, overflow: 'auto', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
            {extractedText}
          </div>
        </div>
      )}
      
      {isProcessing && <div style={{ fontSize: 13, color: 'var(--green-dark)', marginTop: 12, textAlign: 'center' }}>Processing file...</div>}
      
      {!isProfile && extractedText && (
        <button className="btn-primary" disabled={isProcessing} onClick={() => onComplete(extractedText)} style={{ marginTop: 24 }}>
          {t("complete_profile")} <Icons.CheckCircle size={18} style={{marginLeft: 8}}/>
        </button>
      )}
      {isProfile && extractedText !== existingNotes && (
        <button className="btn-primary" disabled={isProcessing} onClick={() => onComplete(extractedText)} style={{ marginTop: 12 }}>
          {t("save_medical_notes")}
        </button>
      )}
    </div>
  );
}

function WellnessScore({ records }) {
  const score = React.useMemo(() => {
    if (!records || records.length === 0) return 85;
    let s = 100;
    for (const r of records.slice(-10)) {
      if (r.urgency === 'high') s -= 28;
      else if (r.urgency === 'mid') s -= 12;
      else s -= 4;
    }
    return Math.max(8, Math.min(100, Math.round(s)));
  }, [records]);

  const [display, setDisplay] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisplay(score), 150); return () => clearTimeout(t); }, [score]);

  const R = 38, C = 2 * Math.PI * R;
  const offset = C - (display / 100) * C;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Great' : score >= 40 ? 'Fair' : 'Low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg)', borderRadius: 18, padding: '14px 16px', border: '1px solid var(--border)', height: '100%', boxSizing: 'border-box' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>WELLNESS SCORE</span>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="9" />
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke 0.5s ease' }} />
        <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{display}</text>
        <text x="50" y="62" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">{label}</text>
      </svg>
    </div>
  );
}

function Home({ profile, setActivePage, t = (k)=>k }) {
  const medsList = Array.isArray(profile.medications) 
    ? profile.medications 
    : (profile.medications ? profile.medications.split(',').map(m => m.trim()).filter(Boolean) : []);
  const records = profile.records || [];
  const lastRec = records.length > 0 ? records[records.length - 1] : null;
  const tip = getDailyTip();

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("greeting")}{profile.name ? `, ${profile.name}` : ''}</h1>
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
          <div className="tip-label">TODAY's INSIGHT</div>
          <div className="tip-text">{tip.benefit}</div>
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
        <button className="quick-btn" onClick={() => setActivePage('records')}><Icons.ClipboardList size={18} color="var(--green)"/> View Records</button>
      </div>
    </div>
  );
}

function CheckinPage({ profile }) {
  const records = profile?.records || [];
  const [tab, setTab] = useState('today');
  const [checkins, setCheckins] = useState([]);
  
  useEffect(() => {
    const fetch = () => setCheckins(getCheckins());
    fetch();
    window.addEventListener('checkin-completed', fetch);
    return () => window.removeEventListener('checkin-completed', fetch);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = checkins.find(c => c.date === today);

  const getAverages = (daysBack) => {
    if (checkins.length === 0) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const recent = checkins.filter(c => new Date(c.date) >= cutoff);
    if (recent.length === 0) return null;

    return {
      sleep: Math.round(recent.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recent.length * 10) / 10,
      stress: Math.round(recent.reduce((sum, c) => sum + c.stress, 0) / recent.length),
      energy: Math.round(recent.reduce((sum, c) => sum + c.energy, 0) / recent.length),
      mood: Math.round(recent.reduce((sum, c) => sum + c.mood, 0) / recent.length),
      count: recent.length
    };
  };

  const weekAvg = getAverages(7);
  const monthAvg = getAverages(30);
  const yearAvg = getAverages(365);

  const [forceCheckin, setForceCheckin] = useState(false);

  return (
    <div className="page active">
      {forceCheckin && <DailyCheckIn forceShow={true} isGlobal={false} onComplete={() => setForceCheckin(false)} />}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="page-title">Wellness History</h1>
              {todayEntry && <span className="urgency-badge-sm urgency-low"><Icons.CheckCircle size={12} style={{marginRight: 4, verticalAlign: 'text-bottom'}} /> Check-in Complete</span>}
            </div>
            <p className="page-subtitle">Track your wellness records and historical trends</p>
          </div>
          <button className="btn-outline-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setForceCheckin(true)}>
            <Icons.RotateCw size={14} /> Retake Check-in
          </button>
        </div>
      </div>

      <div className="discovery-tabs">
        {['today', 'week', 'month', 'year'].map(t => (
          <button key={t} className={`disc-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'today' ? 'Today' : `This ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div className="dashboard-grid">
          <div style={{ gridColumn: 'span 2' }}>
            <WellnessScore records={records} />
          </div>
          
          <div className="dash-card card-large" style={{ gridColumn: 'span 4' }}>
            {todayEntry ? (
              <div style={{ width: '100%' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>Today's Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <RecordStat icon={<Icons.Moon size={20} color="var(--green-dark)"/>} label="Sleep" value={`${todayEntry.sleepHours}h (${todayEntry.wakeFeeling})`} />
                  <RecordStat icon={<Icons.Zap size={20} color="var(--green-dark)"/>} label="Energy" value={`${todayEntry.energy}/10`} />
                  <RecordStat icon={<Icons.Wind size={20} color="var(--green-dark)"/>} label="Stress & Tension" value={`${todayEntry.stress}/10 (${todayEntry.tension})`} />
                  <RecordStat icon={<Icons.Smile size={20} color="var(--green-dark)"/>} label="Mood & Activity" value={`${todayEntry.mood}/10 (${todayEntry.activity})`} />
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>You haven't completed your check-in today.</div>
            )}
          </div>
        </div>
      )}

      {(tab === 'week' || tab === 'month' || tab === 'year') && (
        <div className="dash-card card-large" style={{ gridColumn: 'span 6' }}>
          <div style={{ width: '100%' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>
              {tab === 'week' ? '7-Day' : tab === 'month' ? '30-Day' : '365-Day'} Averages
            </h3>
            
            {((tab === 'week' && weekAvg) || (tab === 'month' && monthAvg) || (tab === 'year' && yearAvg)) ? (() => {
              const avg = tab === 'week' ? weekAvg : tab === 'month' ? monthAvg : yearAvg;
              return (
                <div>
                  <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>Based on {avg.count} check-ins</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                    <AvgStat icon={<Icons.Moon size={24} color="var(--green-dark)"/>} label="Avg Sleep" value={`${avg.sleep}h`} />
                    <AvgStat icon={<Icons.Zap size={24} color="var(--green-dark)"/>} label="Avg Energy" value={`${avg.energy}/10`} />
                    <AvgStat icon={<Icons.Wind size={24} color="var(--green-dark)"/>} label="Avg Stress" value={`${avg.stress}/10`} />
                    <AvgStat icon={<Icons.Smile size={24} color="var(--green-dark)"/>} label="Avg Mood" value={`${avg.mood}/10`} />
                  </div>
                </div>
              );
            })() : (
              <div style={{ color: 'var(--text-muted)' }}>Not enough data for this timeframe.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RecordStat({ icon, label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(34,197,94,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'var(--green-light)', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}

function AvgStat({ icon, label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 20, padding: '24px 16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.04)', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 16px', width: 56, height: 56, borderRadius: 16, background: 'var(--green-light)', alignItems: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-dark)' }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AI-POWERED CHAT (Vercel AI SDK)
───────────────────────────────────────── */
function parseUrgencyFromContent(content) {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
  } catch (e) {}
  return null;
}

function stripJsonBlock(content) {
  return content.replace(/```json[\s\S]*?```/g, '').trim();
}

function UrgencyCard({ data }) {
  const isMentalHealth = !!data.summary?.toLowerCase().match(/mental|emotion|sad|anxiet|depress|unhappy|stress/);
  const label = data.urgency === 'high' ? '🔴 High Urgency'
    : data.urgency === 'mid' ? '🟡 Moderate — Monitor Closely'
    : '🟢 Low Urgency — Self-Care';
  return (
    <div className={`result-card urgency-card-${data.urgency}`} style={{ marginTop: 12, maxWidth: '90%' }}>
      {!isMentalHealth && <div className={`urgency-badge urgency-${data.urgency}`} style={{ marginBottom: 16 }}>{label}</div>}
      {data.action && (
        <div className="result-section">
          <div className="result-section-label">✅ What To Do</div>
          <p>{data.action}</p>
        </div>
      )}
      {data.naturalRemedies && data.naturalRemedies.length > 0 && (
        <div className="result-section">
          <div className="result-section-label">🌿 Natural Support</div>
          <ul className="natural-list">
            {data.naturalRemedies.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
      <div className="result-saved"><Icons.CheckCircle size={14} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />Saved to your Records</div>
    </div>
  );
}

function getSessionName(messages) {
  const first = messages.find(m => m.role === 'user' && m.content);
  if (!first) return 'New Session';
  const t = first.content.trim();
  return t.length > 40 ? t.slice(0, 40) + '…' : t;
}

// Extract a memory snapshot from a single past session
function extractSessionMemory(session) {
  if (!session || !session.messages || session.messages.length <= 1) return null;
  const firstUser = session.messages.find(m => m.role === 'user' && m.content);
  if (!firstUser) return null;
  let urgency = null, summary = null, action = null, remedies = null;
  for (const m of session.messages) {
    if (m.role === 'assistant' && m.content?.includes('```json')) {
      try {
        const match = m.content.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          const d = JSON.parse(match[1]);
          urgency = d.urgency; summary = d.summary; action = d.action;
          remedies = Array.isArray(d.naturalRemedies) ? d.naturalRemedies.slice(0, 2).join(', ') : null;
          break;
        }
      } catch {}
    }
  }
  const date = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Recent';
  return {
    date,
    topic: firstUser.content.slice(0, 70),
    urgency: urgency || 'unknown',
    summary: summary || firstUser.content.slice(0, 60),
    action: action || null,
    remedies: remedies || null
  };
}

// Build a compact cross-session memory string for the system prompt
function buildCrossSessionMemory(sessions, currentSessionId) {
  const pastSessions = sessions
    .filter(s => s.id !== currentSessionId && s.messages.length > 1)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);
  if (pastSessions.length === 0) return 'No previous sessions yet.';
  return pastSessions.map(s => {
    const m = extractSessionMemory(s);
    if (!m) return null;
    let line = `[${m.date}] User discussed: "${m.summary}" — urgency: ${m.urgency}`;
    if (m.action) line += ` — advised: ${m.action}`;
    if (m.remedies) line += ` — remedies suggested: ${m.remedies}`;
    return '- ' + line;
  }).filter(Boolean).join('\n') || 'No previous sessions yet.';
}

function Chat({ profile, saveProfile, sessions, saveSession, currentSessionId, setCurrentSessionId, t = (k)=>k, lang = 'en' }) {
  const firstName = profile?.name?.split(' ')[0] || 'there';

  const [messages, setMessages] = useState(() => {
    try {
      const fn = profile?.name?.split(' ')[0] || 'there';
      const recentCheckins = getCheckins().slice(-3);
      const checkinContext = recentCheckins.length > 0 
        ? `\n\nRecent Wellness Check-ins (scale 1-10):\n${recentCheckins.map(c => `[${c.date}] Mood: ${c.mood}, Sleep: ${c.sleep}, Stress: ${c.stress}, Energy: ${c.energy}`).join('\n')}` 
        : '';
      
      const systemPrompt = {
        id: 'system',
        role: 'system',
        content: `You are Nura, a proactive AI Wellness and Health Companion. Your tone is calm, empathetic, and intelligent.
WELLNESS CONTEXT:${checkinContext}
- You must proactively ask about the user's wellness (mood, sleep, stress, energy) natively in the chat if they haven't checked in recently.
- If you notice elevated stress or poor sleep in their history, bring it up naturally and suggest they visit the "Lifestyle" or "Wellness" tabs for 5-5 breathing or recovery tips.
- Do not just wait for symptom complaints. Ask "How did you sleep?" or "How is your energy today?" to start the conversation.
- Always provide natural remedies and lifestyle tips first before recommending a doctor, unless the urgency is high.`
      };

      const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${fn} 👋 I'm Nura, your personal health companion. How did you sleep last night? How are your stress and energy levels today?` };
      
      const cur = sessions.find(s => s.id === currentSessionId);
      if (cur && cur.messages && cur.messages.length > 0) {
        // Ensure system prompt is at the top
        if (cur.messages[0].role !== 'system') {
          return [systemPrompt, ...cur.messages];
        }
        return cur.messages;
      }
      return [systemPrompt, welcome];
    } catch { return [{ id: 'welcome', role: 'assistant', content: `Hi there 👋 I'm Nura. How are you feeling today?` }]; }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [showQuickStart, setShowQuickStart] = useState(() => {
    const cur = sessions.find(s => s.id === currentSessionId);
    return !cur || !cur.messages || cur.messages.length <= 1;
  });
  const chatEndRef = useRef(null);
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

  const generateSmartTitle = async (firstUserMsg, firstAiSummary, sessionId) => {
    try {
      const isDev = import.meta.env.DEV;
      let title = '';
      if (isDev) {
        const prompt = `Generate a 3-5 word chat title for this health conversation. User: "${firstUserMsg}". Topic: "${firstAiSummary}". Format: Title Case, no quotes, no punctuation.`;
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
          body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 20 })
        });
        const data = await res.json();
        title = data.choices?.[0]?.message?.content?.trim()?.replace(/["']/g, '');
      } else {
        const res = await fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstUserMsg, firstAiSummary })
        });
        const data = await res.json();
        title = data.title;
      }
      
      if (title) {
        const cur = sessions.find(s => s.id === sessionId);
        if (cur) {
          saveSession({ ...cur, name: title, isSmartName: true });
        }
      }
    } catch (e) {
      console.error('Smart title failed:', e);
    }
  };

  // Persist to sessions store
  useEffect(() => {
    try {
      const existingSession = sessions.find(s => s.id === currentSessionId);
      const name = existingSession?.isSmartName ? existingSession.name : getSessionName(messages);
      
      if (messages.length > 1 || existingSession) {
        saveSession({
          id: currentSessionId,
          name: existingSession?.isSmartName ? existingSession.name : name,
          messages
        });
      }
    } catch (e) {
      console.error('Error auto-saving session', e);
    }
  }, [messages, currentSessionId]); // Note: saveSession and sessions omitted from dep array to avoid infinite loops when sessions update


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Proactive check-in: follow up on HIGH urgency sessions
  useEffect(() => {
    if (messages.length !== 1) return; // only on fresh load
    const highRecords = (profile?.records || []).filter(r => r.urgency === 'high');
    if (highRecords.length === 0) return;
    const lastHigh = highRecords[highRecords.length - 1];
    const lastCheckinId = localStorage.getItem('nuracare_last_checkin');
    if (lastCheckinId === String(lastHigh.id)) return;
    const timer = setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 'checkin-' + Date.now(), role: 'assistant',
        content: `Hey ${firstName} 👋 Last time you mentioned ${lastHigh.summary.toLowerCase()}. How are you feeling now — is it getting better? 🌿`
      }]);
      setShowQuickStart(false);
      try { localStorage.setItem('nuracare_last_checkin', String(lastHigh.id)); } catch {}
    }, 1000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const buildSystemPrompt = () => {
    const recentRecords = (profile?.records || []).slice(-5).map(r =>
      `- ${r.dateStr}: ${r.summary} (${r.urgency} urgency) — action: ${r.action}`
    ).join('\n') || 'No past records yet.';

    const crossMemory = buildCrossSessionMemory(sessions, currentSessionId);

    const localHerbsDB = {
      ET: ['Damakese (Ocimum lamiifolium)', 'Tena Adam (Ruta chalepensis)', 'Gesho (Rhamnus prinoides)', 'Kosso (Hagenia abyssinica)', 'Wogert (Zehneria scabra)'],
      NG: ['Moringa', 'Bitter leaf (Vernonia amygdalina)', 'Scent leaf (Ocimum gratissimum)'],
      IN: ['Tulsi (Holy Basil)', 'Ashwagandha', 'Turmeric', 'Neem', 'Triphala'],
      DEFAULT: ['Ginger', 'Turmeric', 'Chamomile', 'Peppermint', 'Echinacea']
    };
    const countryCode = profile?.location?.code || 'DEFAULT';
    const userHerbs = localHerbsDB[countryCode] || localHerbsDB['DEFAULT'];

    const medicalNotes = profile?.medicalNotes ? `\nEXTRACTED MEDICAL NOTES (from user uploads):\n${profile.medicalNotes}` : '';

    return `You are Nura, a warm and empathetic AI health companion for NuraCare. You are medically informed but always make clear you are not a replacement for a doctor.

USER PROFILE:
- Name: ${profile?.name || 'there'}
- Age: ${profile?.age ? profile.age + ' years old' : 'unknown'}
- Known conditions: ${profile?.conditions?.length ? profile.conditions.join(', ') : 'none reported'}
- Current medications: ${Array.isArray(profile?.medications) ? profile.medications.join(', ') : (profile?.medications || 'none reported')}

PAST HEALTH RECORDS (last 5 sessions):
${recentRecords}
${medicalNotes}

USER'S LOCAL HERBS (prefer these when suggesting natural remedies):
${userHerbs.join(', ')}

CROSS-SESSION MEMORY (general knowledge from previous conversations — use this to personalize, reference past topics when relevant, never repeat questions already answered):
${crossMemory}

MEMORY RULES: Always reference the user's name (${profile?.name?.split(' ')[0] || 'there'}). If they had a similar symptom before, mention it. Use cross-session memory to show you remember them. Keep track of what they told you earlier in THIS conversation — don't ask for info they already shared.

YOUR APPROACH: Have a natural caring conversation. Ask ONE question at a time about symptom, duration, severity. Once you have enough info, give your assessment. For LOW urgency suggest natural remedies (herbs, diet, lifestyle). For HIGH urgency recommend immediate medical attention. After giving your assessment and recommendations, close with a warm complete response. Do NOT ask follow-up questions. The user will continue if they need more.

TONE: Warm, human, 2-4 sentences max. Use user name occasionally.

RED FLAGS (always HIGH urgency): chest pain, difficulty breathing, stroke, severe bleeding, loss of consciousness.
NEVER classify mental/emotional health (sadness, anxiety, depression, unhappiness) as low urgency — minimum is "mid".
CRITICAL NAME RULE: The user's name is spelled EXACTLY as written in the profile. Address them letter-for-letter with zero modifications. Never shorten or alter it. Example — if name is "${profile?.name}", always write "${profile?.name}".

WHEN YOU HAVE ENOUGH INFO, append this JSON at the END of your message:
\`\`\`json
{"urgency":"low|mid|high","summary":"one-line description","naturalRemedies":["remedy 1","remedy 2","remedy 3"],"action":"what to do next"}
\`\`\`
Only include the JSON once — after you know symptom + duration + severity.${lang === 'am' ? '\n\nCRITICAL: YOU MUST RESPOND ENTIRELY IN AMHARIC (አማርኛ). All greetings, medical assessments, remedies, and instructions must be in Amharic.' : ''}`;
  };

  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || isLoading || isStreaming) return;
    setShowQuickStart(false);
    setChatError(null);

    const userMsg = { id: String(Date.now()), role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      let res;
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // Local dev: call Groq directly (needs VITE_GROQ_API_KEY in .env.local)
        if (!GROQ_KEY) throw new Error('Add VITE_GROQ_API_KEY to your .env.local file.');
        const groqMessages = [
          { role: 'system', content: buildSystemPrompt() },
          ...updatedMessages.slice(1).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || '' }))
        ];
        res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: groqMessages, temperature: 0.75, max_tokens: 1024, stream: true })
        });
      } else {
        // Production: use /api/chat (server-side key, no CORS issues)
        const memoryContext = buildCrossSessionMemory(sessions, currentSessionId);
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages, profile, memoryContext, lang })
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Error ${res.status}`);
      }

      // Stream word-by-word
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let streamId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const token = JSON.parse(data).choices?.[0]?.delta?.content || '';
            if (!token) continue;
            accumulated += token;
            if (!streamId) {
              streamId = 'stream-' + Date.now();
              setIsLoading(false);
              setIsStreaming(true);
              setMessages(prev => [...prev, { id: streamId, role: 'assistant', content: accumulated }]);
            } else {
              setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: accumulated } : m));
            }
          } catch {}
        }
      }

      // After streaming complete — save urgency record
      const urgencyData = parseUrgencyFromContent(accumulated);
      if (urgencyData?.urgency) {
        saveProfile({ ...profile, records: [...(profile.records || []), {
          id: Date.now(), dateStr: formatDate(new Date()),
          summary: urgencyData.summary || 'Health check',
          urgency: urgencyData.urgency, action: urgencyData.action || '',
          natural: Array.isArray(urgencyData.naturalRemedies) ? urgencyData.naturalRemedies : []
        }]});
      }

      // Generate smart title if it's the first exchange
      if (updatedMessages.filter(m => m.role === 'user').length === 1) {
        const firstUserMsg = updatedMessages.find(m => m.role === 'user')?.content || '';
        const firstAiSummary = urgencyData?.summary || stripJsonBlock(accumulated).slice(0, 50);
        generateSmartTitle(firstUserMsg, firstAiSummary, currentSessionId);
      }
    } catch (err) {
      console.error('Nura error:', err);
      setChatError(err?.message || 'Connection failed.');
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: "I'm having trouble connecting right now. 🌿 Please check the error banner above." }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };


  const startNewSession = () => {
    const newId = 'session-' + Date.now();
    const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${firstName} 👋 Starting a fresh session — what's going on today? 🌿` };
    setCurrentSessionId(newId);
    setMessages([welcome]);
    setInput(''); setShowQuickStart(true); setChatError(null);
  };

  const switchToSession = (sid) => {
    const s = sessions.find(x => x.id === sid);
    if (!s) return;
    setCurrentSessionId(sid);
    setMessages(s.messages || []);
    setChatError(null);
    setShowQuickStart(!s.messages || s.messages.length <= 1);
  };

  // Sync messages when currentSessionId changes from parent (e.g. sidebar)
  useEffect(() => {
    const s = sessions.find(x => x.id === currentSessionId);
    if (s && s.messages) {
      setMessages(s.messages);
      setShowQuickStart(s.messages.length <= 1);
      setChatError(null);
    } else if (messages.length === 0 || messages[0]?.id !== 'welcome') {
      const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${firstName} 👋 Starting a fresh session — what's going on today? 🌿` };
      setMessages([welcome]);
      setShowQuickStart(true);
      setChatError(null);
    }
  }, [currentSessionId, sessions]);

  const quickOptions = ['Headache', 'Stomach ache', 'Sore throat', 'Fatigue', 'Cough', 'Fever'];

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 style={{fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8}}>{t("hello")}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: 24}}>I'm Nura, your health companion. What's on your mind today?</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, gap: 12 }}>
        {/* ── Sessions Sidebar ── */}
        <div className="chat-sessions-sidebar">
          <button className="new-session-btn" onClick={startNewSession}>
            <Icons.PenLine size={15} /> New Session
          </button>
          <div className="sessions-list">
            {sessions.length === 0 && (
              <p className="sessions-empty">Your past sessions will appear here</p>
            )}
            {[...sessions].reverse().map(s => (
              <button
                key={s.id}
                className={`session-item ${s.id === currentSessionId ? 'active' : ''}`}
                onClick={() => switchToSession(s.id)}
              >
                <Icons.MessageCircle size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="chat-container" style={{ flex: 1, minWidth: 0 }}>
          {chatError && (
            <div className="chat-error-banner">
              <Icons.AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div><strong>Connection issue:</strong> {chatError}</div>
            </div>
          )}
          <div className="chat-messages">
            {messages.filter(m => m.role !== 'system').map((m) => {
              if (m.role === 'assistant') {
                const urgencyData = parseUrgencyFromContent(m.content || '');
                const displayText = stripJsonBlock(m.content || '');
                return (
                  <div key={m.id}>
                    {displayText && (
                      <div className="chat-bubble bubble-ai">
                        <div className="bubble-label"><Icons.Leaf size={12} style={{ marginRight: 4 }} />Nura</div>
                        {displayText}
                      </div>
                    )}
                    {urgencyData?.urgency && <UrgencyCard data={urgencyData} />}
                  </div>
                );
              }
              return <div key={m.id} className="chat-bubble bubble-user">{m.content}</div>;
            })}
            {isLoading && (
              <div className="chat-bubble bubble-ai typing-bubble">
                <div className="bubble-label"><Icons.Leaf size={12} style={{ marginRight: 4 }} />Nura</div>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            {showQuickStart && messages.length <= 1 && (
              <div className="chat-options">
                {quickOptions.map(opt => (
                  <button key={opt} className="chat-opt-btn" onClick={() => sendMessage(opt)}>{opt}</button>
                ))}
              </div>
            )}
            <div className="chat-text-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder={t("type_message")}
                disabled={isLoading || isStreaming}
              />
              <button className="btn-send" onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading || isStreaming}>
                {t("send")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



function Checkups({ profile, setActivePage }) {
  const records = [...(profile.records || [])].reverse();
  return (
    <div className="page active">
      <div className="page-header">
        <div><h1 className="page-title">Checkups</h1><p className="page-subtitle">Your recent health check summaries</p></div>
      </div>
      <div>
        {records.length === 0 ? (
          <div className="empty-state">
            <Icons.Stethoscope size={52} className="empty-icon" />
            <p>No checkups yet.</p>
            <p className="empty-sub">Start a symptom check to get your first summary.</p>
            <button className="btn-primary" onClick={() => setActivePage('chat')}>Start Checkup</button>
          </div>
        ) : records.map(r => (
          <div key={r.id} className="checkup-card">
            <div className="checkup-header">
              <span className="checkup-title">Symptom Check</span>
              <span className={`urgency-badge-sm urgency-${r.urgency}`}>{r.urgency.toUpperCase()}</span>
            </div>
            <div className="checkup-meta">Recorded on {r.dateStr}</div>
            <p style={{fontSize: 14, marginBottom: 12}}><strong>Summary:</strong> {r.summary}</p>
            <div className="checkup-tips">
              {r.natural && r.natural.length > 0
                ? r.natural.map((tip, i) => <li key={i}>{tip}</li>)
                : (
                  <>
                    <li>Continue monitoring symptoms</li>
                    <li>Stay hydrated and rest</li>
                    {r.urgency === 'high' && <li><strong>Action required:</strong> Consult a doctor</li>}
                  </>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Discovery({ tab, setTab }) {
  return (
    <div className="page active">
      <div className="page-header">
        <div><h1 className="page-title">Discovery</h1><p className="page-subtitle">Natural health knowledge for everyday life</p></div>
      </div>
      <div className="discovery-tabs">
        <button className={`disc-tab ${tab === 'herbs' ? 'active' : ''}`} onClick={() => setTab('herbs')}>Herbs</button>
        <button className={`disc-tab ${tab === 'fruits' ? 'active' : ''}`} onClick={() => setTab('fruits')}>Fruits</button>
        <button className={`disc-tab ${tab === 'tips' ? 'active' : ''}`} onClick={() => setTab('tips')}>Health Tips</button>
      </div>
      <div className="discovery-grid">
        {discoveryData[tab].map(item => (
          <div key={item.name} className="disc-card">
            <img src={item.image} alt={item.name} className="disc-card-img" />
            <div className="disc-card-content">
              <div className="disc-card-name">{item.name}</div>
              <div className="disc-card-benefit">{item.benefit}</div>
              <div className="disc-card-tag">{tab.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Records({ profile }) {
  const records = [...(profile.records || [])].reverse();
  const statusMap = { low: 'Improving', mid: 'Monitoring', high: 'Needs Attention' };
  return (
    <div className="page active">
      <div className="page-header">
        <div><h1 className="page-title">Records</h1><p className="page-subtitle">Your personal health history</p></div>
      </div>
      <div>
        {records.length === 0 ? (
          <div className="empty-state">
            <Icons.ClipboardList size={52} className="empty-icon" />
            <p>No records yet.</p>
            <p className="empty-sub">Complete a symptom check to see your history here.</p>
          </div>
        ) : records.map(r => (
          <div key={r.id} className="record-card">
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
              {r.action && <span className="record-action-hint">{r.action.slice(0, 60)}…</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthPage({ setOnboardingStep, useAuth, t = (k)=>k }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        alert('Signup successful! Please check your email to verify, or try logging in.');
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="onboarding-bg-leaf"></div>
      <div className="full-page-form" style={{maxWidth: 400, margin: '0 auto', position: 'relative', zIndex: 10, width: '100%', padding: '20px'}}>
        <div className="form-content-box" style={{background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '28px', padding: '44px 40px', boxShadow: '0 24px 64px rgba(34,197,94,0.12), 0 8px 24px rgba(0,0,0,0.04)'}}>
          <div className="step-header">
            <button type="button" className="btn-back" onClick={() => setOnboardingStep(0)}><Icons.ArrowLeft size={16}/></button>
          </div>
          <h2 className="step-title" style={{textAlign: 'center'}}>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{textAlign: 'left'}}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}} />
            </div>
            <div className="form-group" style={{marginTop: 16, textAlign: 'left'}}>
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}} />
            </div>
            {errorMsg && <div style={{color: 'var(--red)', fontSize: 13, marginTop: 12, textAlign: 'center'}}>{errorMsg}</div>}
            
            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: 24, marginBottom: 16}} disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          <div style={{textAlign: 'center', marginBottom: 16, fontSize: 14, color: 'var(--text-muted)'}}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setErrorMsg(''); }} style={{color: 'var(--green)', fontWeight: 600}}>
              {isLogin ? "Sign Up" : "Log In"}
            </a>
          </div>

          <div style={{display: 'flex', alignItems: 'center', margin: '20px 0'}}>
            <div style={{flex: 1, height: 1, background: 'var(--border)'}}></div>
            <span style={{margin: '0 10px', color: 'var(--text-muted)', fontSize: 12}}>OR</span>
            <div style={{flex: 1, height: 1, background: 'var(--border)'}}></div>
          </div>

          <button type="button" className="btn-outline-sm" onClick={() => { signInWithGoogle(); }} style={{width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--border)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
