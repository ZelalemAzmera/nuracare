import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useTranslation } from './useTranslation';
import { COUNTRIES } from './countries';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
// Vercel AI SDK used in api/chat.js (server-side streaming)
import { discoveryData, getDailyTip } from './data';
import FloatingLeaves, { LeafSVG, FlowerSVG, DropletSVG } from './FloatingLeaves';
import { useAuth } from './AuthContext';
import { useSupabaseProfile, useSupabaseSessions } from './useSupabase';
import { useCheckups } from './useCheckups';
import DailyCheckIn from './DailyCheckIn';
import WellnessDashboard from './WellnessDashboard';
import LifestyleCoach from './LifestyleCoach';
import WearableHub from './WearableHub';
import { PrivacyPolicy, TermsOfService, MedicalDisclaimer } from './LegalPages';
import { getCheckins, compute5CoreWellness, getRecoveryRecommendations } from './wellnessEngine';
import { getDiscoveryFeed, getAvailableTags } from './discoveryEngine';
import { TSOM_TYPES } from './ethiopianCalendar';
import MedicalRecords, { ExpandableRecordCard } from './MedicalRecords';
import SubscriptionPage from './SubscriptionPage';
import EnterpriseDashboard from './EnterpriseDashboard';
import { supabase } from './supabase';
import { fetchNearbyHospitals, fetchLocationWithSecurity } from './liveApis';

export const showToast = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('nuracare-toast', { detail: { message, type } }));
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    const handleToast = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };
    window.addEventListener('nuracare-toast', handleToast);
    return () => window.removeEventListener('nuracare-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <Icons.CheckCircle2 size={18} color="var(--green)" /> : <Icons.AlertCircle size={18} color="#ef4444" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

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

const AppSkeleton = () => (
  <div className="skeleton-app">
    <div className="skeleton-sidebar">
      <div className="skeleton-block" style={{ height: 40, width: '60%', marginBottom: 24 }} />
      <div className="skeleton-block" style={{ height: 24, width: '100%', marginBottom: 12 }} />
      <div className="skeleton-block" style={{ height: 24, width: '80%', marginBottom: 12 }} />
      <div className="skeleton-block" style={{ height: 24, width: '90%', marginBottom: 12 }} />
    </div>
    <div className="skeleton-main">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="skeleton-circle" style={{ width: 48, height: 48 }} />
        <div className="skeleton-block" style={{ height: 32, width: 200 }} />
      </div>
      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        <div className="skeleton-block" style={{ height: 120, flex: 1 }} />
        <div className="skeleton-block" style={{ height: 120, flex: 1 }} />
        <div className="skeleton-block" style={{ height: 120, flex: 1 }} />
      </div>
      <div className="skeleton-block" style={{ height: 300, width: '100%', marginTop: 24 }} />
    </div>
  </div>
);

const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name];
  return IconComponent ? <IconComponent {...props} /> : <Icons.HelpCircle {...props} />;
};

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Session</h3>
          <button className="modal-close-btn" onClick={onClose}><Icons.X size={20} /></button>
        </div>
        <div className="modal-body">
          Are you sure you want to delete this session? This action cannot be undone.
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;
  const [loading, setLoading] = useState(false);
  const [shareToken, setShareToken] = useState(session.share_token || null);

  const getShareUrl = () => `${window.location.origin}/share/${shareToken}`;

  const createShareLink = async () => {
    setLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authSession.access_token}` },
        body: JSON.stringify({ sessionId: session.id })
      });
      const data = await res.json();
      if (res.ok && data.shareToken) {
        setShareToken(data.shareToken);
        await navigator.clipboard.writeText(`${window.location.origin}/share/${data.shareToken}`);
        showToast("Share link created and copied to clipboard!");
      } else {
        showToast(data.error || "Failed to create share link", "error");
      }
    } catch(e) {
      console.error(e);
      showToast("Error creating share link", "error");
    }
    setLoading(false);
  };

  const revokeShareLink = async () => {
    setLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authSession.access_token}` },
        body: JSON.stringify({ sessionId: session.id })
      });
      if (res.ok) {
        setShareToken(null);
        showToast("Share link revoked.");
      } else {
        showToast("Failed to revoke share link", "error");
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (!shareToken) {
      await createShareLink();
      return;
    }
    try {
      await navigator.clipboard.writeText(getShareUrl());
      showToast("Link copied to clipboard!");
    } catch(e) { console.error('Failed to copy', e); }
  };

  const shareAction = (fn) => () => {
    if(!shareToken) return showToast("Create a link first!", "error");
    fn();
    onClose();
  };

  const shareWhatsApp = shareAction(() => window.open(`https://wa.me/?text=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareTelegram = shareAction(() => window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareTwitter = shareAction(() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareEmail = shareAction(() => window.open(`mailto:?subject=My Chat with Nura&body=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareNative = shareAction(async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'My Chat with Nura', url: getShareUrl() });
      else showToast("Your device doesn't support native sharing.", "error");
    } catch(e) { if (e.name !== 'AbortError') console.error('Share failed', e); }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
        <div className="modal-header">
          <h3 className="modal-title">Share Chat</h3>
          <button className="modal-close-btn" onClick={onClose}><Icons.X size={20} /></button>
        </div>
        <div className="modal-body" style={{paddingTop: 10}}>
          <p style={{marginBottom: 16, color: 'var(--text-muted)'}}>Anyone with this link will be able to view this conversation. They will not see your private medical profile.</p>
          
          <div style={{display: 'flex', gap: 10, marginBottom: 24}}>
            <button className="btn-primary" style={{flex: 1, display: 'flex', gap: 8, justifyContent: 'center', opacity: loading ? 0.7 : 1}} onClick={copyToClipboard} disabled={loading}>
              {loading ? <Icons.Loader className="spin" size={18} /> : <Icons.Link size={18} />}
              {shareToken ? 'Copy Link' : 'Create Link'}
            </button>
            {shareToken && (
              <button onClick={revokeShareLink} disabled={loading} style={{background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 12, padding: '0 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                Stop
              </button>
            )}
          </div>

          {shareToken && (
            <div style={{background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {getShareUrl()}
            </div>
          )}

          <div style={{height: 1, background: 'var(--border)', margin: '0 -24px 20px', position: 'relative'}}>
            <span style={{position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 10px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase'}}>Also share via</span>
          </div>

          <div className="share-options-grid" style={{opacity: shareToken ? 1 : 0.5, pointerEvents: shareToken ? 'auto' : 'none'}}>
            <button className="share-option" onClick={shareWhatsApp}>
              <div className="share-icon-wrap share-icon-whatsapp"><Icons.MessageCircle size={24} /></div>
              <span className="share-option-label">WhatsApp</span>
            </button>
            <button className="share-option" onClick={shareTelegram}>
              <div className="share-icon-wrap" style={{background: '#e0f2fe', color: '#0ea5e9'}}><Icons.Send size={24} /></div>
              <span className="share-option-label">Telegram</span>
            </button>
            <button className="share-option" onClick={shareTwitter}>
              <div className="share-icon-wrap" style={{background: '#f1f5f9', color: '#0f1419'}}><Icons.Twitter size={24} /></div>
              <span className="share-option-label">X</span>
            </button>
            <button className="share-option" onClick={shareEmail}>
              <div className="share-icon-wrap share-icon-email"><Icons.Mail size={24} /></div>
              <span className="share-option-label">Email</span>
            </button>
            <button className="share-option" onClick={shareNative}>
              <div className="share-icon-wrap" style={{background: '#f3f4f6', color: '#4b5563'}}><Icons.MoreHorizontal size={24} /></div>
              <span className="share-option-label">More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
    clearProfile();
    clearSessions();
    setOnboardingStep(0);
    setActivePage('home');
    setCurrentSessionId('session-' + Date.now());
    setObName(''); setObAge(''); setObCulturalHeritage('Global'); setObConditions([]); setObOtherCondition(''); setObFasting(TSOM_TYPES.NONE); setObMeds([]);
    localStorage.removeItem('nuracare_activePage');
    await signOut();
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
  const { addCheckup } = useCheckups();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState(existingNotes);
  const [classificationResult, setClassificationResult] = useState(null);
  const [showAppointmentSuggestion, setShowAppointmentSuggestion] = useState(false);

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
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1000;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = Math.min(MAX_WIDTH, img.width);
              canvas.height = img.height * Math.min(1, scaleSize);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(selected);
        });

        const ocrRes = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        
        if (!ocrRes.ok) throw new Error('OCR failed');
        const ocrData = await ocrRes.json();
        text = ocrData.text || `[Image Uploaded: ${selected.name}]`;
      } else {
        text = await selected.text();
      }
      
      const limitedText = text.slice(0, 2000);
      
      const res = await fetch('/api/classify-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: limitedText })
      });
      
      if (!res.ok) throw new Error('Classification failed');
      const data = await res.json();
      
      if (data.medical) {
        setExtractedText(limitedText);
        setClassificationResult(data.extracted);
        if (data.extracted.next_visit_date) {
          setShowAppointmentSuggestion(true);
        }
        showToast('Medical document identified successfully!', 'success');
      } else {
        setExtractedText('');
        setFile(null);
        setShowAppointmentSuggestion(false);
        showToast('Not a medical document: ' + (data.reason || 'Please upload lab results or prescriptions.'), 'error');
      }
    } catch (err) {
      console.error('File extraction failed:', err);
      showToast('Could not analyze file. Please try another.', 'error');
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: 'var(--green-dark)' }}>
              <Icons.FileCheck size={16} color="var(--green)" /> {file ? file.name : 'Saved Medical Notes'}
            </div>
            <button onClick={() => { setFile(null); setExtractedText(''); setClassificationResult(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Icons.X size={16}/></button>
          </div>
          
          {classificationResult && (
            <div style={{ marginBottom: 12, padding: 12, background: 'var(--green-light)', borderRadius: 8, fontSize: 13 }}>
              <strong>Detected Entities:</strong>
              {classificationResult.conditions?.length > 0 && <div>• Conditions: {classificationResult.conditions.join(', ')}</div>}
              {classificationResult.medications?.length > 0 && <div>• Medications: {classificationResult.medications.join(', ')}</div>}
              {classificationResult.metrics?.length > 0 && <div>• Metrics: {classificationResult.metrics.join(', ')}</div>}
            </div>
          )}
          
          {showAppointmentSuggestion && classificationResult?.next_visit_date && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--green-dark)' }}>
                <Icons.Calendar size={24} />
                <div>
                  <strong>Nura detected an upcoming {classificationResult.appointment_type || 'Follow-up'}</strong>
                  <div style={{ fontSize: 13 }}>Scheduled for: {classificationResult.next_visit_date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={async () => {
                  await addCheckup({
                    name: classificationResult.appointment_type || 'Follow-up',
                    doctor: classificationResult.doctor_name || null,
                    next_visit: classificationResult.next_visit_date,
                    source: 'medical_file'
                  });
                  showToast('Appointment saved to Checkups!', 'success');
                  setShowAppointmentSuggestion(false);
                }}>Yes, Save</button>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setShowAppointmentSuggestion(false)}>Dismiss</button>
              </div>
            </div>
          )}
          
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
  const wellness = compute5CoreWellness(todayEntry);
  const recommendations = getRecoveryRecommendations(checkins);

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
          <div className="dash-card card-large" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>5-CORE WELLNESS SCORE</span>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={wellness.color} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (wellness.total / 100) * 251.2}
                  transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="800" fill={wellness.color}>{wellness.total}</text>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: wellness.color, marginTop: 8 }}>{wellness.label}</span>
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
          
          <div className="dash-card card-large" style={{ gridColumn: 'span 6', marginTop: 8 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>5-Core Deep Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <CoreStat label="Physical Vitality" score={wellness.cores.physical} icon={<Icons.Activity size={18} color="var(--green-dark)" />} />
              <CoreStat label="Mental Resilience" score={wellness.cores.mental} icon={<Icons.Brain size={18} color="var(--green-dark)" />} />
              <CoreStat label="Recovery & Sleep" score={wellness.cores.recovery} icon={<Icons.Moon size={18} color="var(--green-dark)" />} />
              <CoreStat label="Nutrition & Hydration" score={wellness.cores.nutrition} icon={<Icons.Droplet size={18} color="var(--green-dark)" />} />
              <CoreStat label="Preventive Maintenance" score={wellness.cores.preventive} icon={<Icons.Shield size={18} color="var(--green-dark)" />} />
            </div>
          </div>
          
          <div className="dash-card card-large" style={{ gridColumn: 'span 6', marginTop: 8 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18 }}>Way Forward & Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.length > 0 ? recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: '4px solid var(--green)', paddingLeft: 12 }}>
                  <Icons.Sparkles size={20} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text)' }}>{rec}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)' }}>Complete more check-ins to receive personalized AI recommendations.</div>
              )}
            </div>
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

function CoreStat({ label, score, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>{score}</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : 'var(--green)', borderRadius: 4 }}></div>
        </div>
      </div>
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
export function stripThinkTags(content) {
  return content.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
}

export function stripJsonBlock(content) {
  let text = stripThinkTags(content);
  text = text.replace(/```json[\s\S]*?```/gi, '');
  text = text.replace(/\{[^{}]*"urgency"[\s\S]*\}\s*$/i, '');
  return text.trim();
}

export function parseUrgencyFromContent(content) {
  let text = stripThinkTags(content);
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    
    const rawMatch = text.match(/\{[^{}]*"urgency"[\s\S]*\}\s*$/i);
    if (rawMatch) return JSON.parse(rawMatch[0]);
  } catch (e) {}
  return null;
}

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

function getSessionName(messages) {
  const first = messages.find(m => m.role === 'user' && m.content);
  if (!first) return 'New Session';
  const t = first.content.trim();
  return t.length > 40 ? t.slice(0, 40) + '…' : t;
}

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

function Chat({ profile, saveProfile, sessions, saveSession, deleteSession, handleDeleteSession, setShareSession, currentSessionId, setCurrentSessionId, t = (k)=>k, lang = 'en' }) {
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const { addCheckup } = useCheckups();

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

      const hour = new Date().getHours();
      let timeContext = hour < 12 ? "How did you sleep last night?" : hour < 18 ? "How has your day been so far?" : "How are your energy levels this evening?";
      
      if (recentCheckins && recentCheckins.length > 0) {
        const last = recentCheckins[recentCheckins.length - 1];
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = last.date === todayStr;
        
        if (isToday) {
          if (last.stress >= 7) timeContext = lang === 'am' ? "ዛሬ በጣም እንደተጨነቁ አይቻለሁ። አሁን እንዴት ነዎት?" : "I saw from your check-in that you're quite stressed today. How are you holding up now?";
          else if (last.sleep <= 5) timeContext = lang === 'am' ? "በደንብ እንዳልተኙ አስተውያለሁ። በጣም ደክሞዎታል?" : "I noticed you didn't sleep well. Are you feeling very tired?";
          else timeContext = lang === 'am' ? "ቀደም ብለው እንደገቡ አይቻለሁ። ከጠዋቱ ጋር ሲነፃፀር አሁን እንዴት ይሰማዎታል?" : "I saw you checked in earlier. How are you feeling compared to this morning?";
        } else {
          const daysSince = Math.floor((new Date() - new Date(last.date)) / (1000 * 60 * 60 * 24));
          if (daysSince >= 2) timeContext = lang === 'am' ? `ካለፈው ጊዜ ጀምሮ ጥቂት ቀናት አልፈዋል። እንዴት ነበሩ?` : `It's been a few days since your last check-in. How have you been?`;
          else if (last.mood <= 5) timeContext = lang === 'am' ? `ባለፈው ጊዜ ትንሽ አዝነው ነበር። ዛሬ የተሻለ ነው?` : `You were feeling a bit down last time we spoke. Are things any better today?`;
        }
      }
      
      const welcomeContent = lang === 'am' 
        ? `ሰላም ${fn} እኔ ኑራ ነኝ፣ የግል የጤና ጓደኛዎ። ${timeContext}`
        : `Hi ${fn}, I'm Nura, your personal health companion. ${timeContext}`;
      const welcome = { id: 'welcome', role: 'assistant', content: welcomeContent };
      
      const cur = sessions.find(s => s.id === currentSessionId);
      if (cur && cur.messages && cur.messages.length > 0) {
        // Ensure system prompt is at the top
        if (cur.messages[0].role !== 'system') {
          return [systemPrompt, ...cur.messages];
        }
        return cur.messages;
      }
      return [systemPrompt, welcome];
    } catch { return [{ id: 'welcome', role: 'assistant', content: lang === 'am' ? `ሰላም እኔ ኑራ ነኝ። ዛሬ ምን ይሰማዎታል?` : `Hi there, I'm Nura. How are you feeling today?` }]; }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatLang, setChatLang] = useState(lang);
  const [showQuickStart, setShowQuickStart] = useState(() => {
    const cur = sessions.find(s => s.id === currentSessionId);
    return !cur || !cur.messages || cur.messages.length <= 1;
  });
  const chatEndRef = useRef(null);
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

  const generateSmartTitle = async (firstUserMsg, firstAiSummary, sessionId) => {
    try {
      const existingSession = sessions.find(s => s.id === sessionId);
      if (!existingSession) return;
      
      const placeholderTitle = firstUserMsg.split(' ').slice(0, 4).join(' ') + '...';
      
      saveSession({
        ...existingSession,
        name: placeholderTitle,
        isSmartName: true
      });
      
      const isDev = import.meta.env.DEV;
      let title = '';
      if (isDev) {
        const prompt = `Generate a concise 2-4 word chat title for this health conversation. User: "${firstUserMsg}". Topic: "${firstAiSummary}". Format: Title Case, no quotes, no punctuation.`;
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
          body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 20 })
        });
        const data = await res.json();
        title = data.choices?.[0]?.message?.content?.trim()?.replace(/["']/g, '');
        title = stripThinkTags(title || '');
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
        saveSession({
          ...existingSession,
          name: title,
          isSmartName: true
        });
      }
    } catch (e) {
      console.error('Smart title failed:', e);
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession) {
        saveSession({
          ...existingSession,
          name: firstUserMsg.split(' ').slice(0, 5).join(' ') + '...',
          isSmartName: false
        });
      }
    }
  };

  const activeSessionIdLocally = useRef(currentSessionId);

  // Persist to sessions store
  useEffect(() => {
    if (isStreaming) return;
    if (currentSessionId !== activeSessionIdLocally.current) return; // Prevent saving old messages to new session ID during switch
    try {
      const existingSession = sessions.find(s => s.id === currentSessionId);
      const name = existingSession?.isSmartName ? existingSession.name : getSessionName(messages);
      
      const hasUserMessage = messages.some(m => m.role === 'user');
      if (!hasUserMessage) return; // Never save empty sessions
      
      saveSession({
        id: currentSessionId,
        name: existingSession?.isSmartName ? existingSession.name : name,
        messages
      });
    } catch (e) {
      console.error('Error auto-saving session', e);
    }
  }, [messages, currentSessionId, isStreaming]); // Note: saveSession and sessions omitted from dep array to avoid infinite loops when sessions update


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
        content: `Hey ${firstName}, last time you mentioned ${lastHigh.summary.toLowerCase()}. How are you feeling now — is it getting better?`
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
CRITICAL NAME RULE: The user's name is spelled EXACTLY as written in the profile. Address them letter-for-letter with zero modifications.
CRITICAL GREETING RULE: ALWAYS start your response with "Hi ${profile?.name?.split(' ')[0] || 'there'}, " — NEVER skip this or alter the letters.

WHEN YOU HAVE ENOUGH INFO, append this JSON at the END of your message:
\`\`\`json
{"urgency":"low|mid|high","summary":"one-line description","naturalRemedies":["remedy 1","remedy 2","remedy 3"],"action":"what to do next"}
\`\`\`
Only include the JSON once — after you know symptom + duration + severity.${chatLang === 'am' ? '\n\nCRITICAL: YOU MUST RESPOND ENTIRELY IN AMHARIC (አማርኛ). All greetings, medical assessments, remedies, and instructions must be in Amharic.' : ''}`;
  };

  useEffect(() => {
    setMessages(prev => {
      const newSys = { id: 'system', role: 'system', content: buildSystemPrompt() };
      const updated = [...prev];
      if (updated.length > 0 && updated[0].role === 'system') {
        updated[0] = newSys;
      } else {
        updated.unshift(newSys);
      }
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLang]);

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
          body: JSON.stringify({ model: 'deepseek-r1-distill-llama-70b', messages: groqMessages, temperature: 0.6, max_tokens: 1500, stream: true })
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
        // If HIGH urgency, fetch real nearby hospitals and inject into the urgency data
        if (urgencyData.urgency === 'high') {
          try {
            const pos = await new Promise((resolve, reject) => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
                  () => reject('no gps')
                );
              } else reject('no gps');
            });
            const hospitals = await fetchNearbyHospitals(pos.lat, pos.lon);
            if (hospitals.length > 0) {
              urgencyData._hospitals = hospitals;
              // Re-render the last message with hospital data embedded
              setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: accumulated, _urgencyHospitals: hospitals } : m));
            }
          } catch { /* GPS denied or failed, UrgencyCard falls back to generic link */ }
        }

        saveProfile({ ...profile, records: [...(profile.records || []), {
          id: Date.now(), dateStr: formatDate(new Date()),
          summary: urgencyData.summary || 'Health check',
          urgency: urgencyData.urgency, action: urgencyData.action || '',
          natural: Array.isArray(urgencyData.naturalRemedies) ? urgencyData.naturalRemedies : []
        }]});
      }

      try {
        const appointmentRes = await fetch('/api/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'extract-appointment', text: accumulated })
        });
        if (appointmentRes.ok) {
          const appointmentData = await appointmentRes.json();
          if (appointmentData.detected && appointmentData.date) {
            await addCheckup({
              name: appointmentData.name || 'AI Suggested Appointment',
              doctor: appointmentData.doctor || null,
              next_visit: appointmentData.date,
              source: 'ai_chat',
              notes: 'Extracted automatically from your conversation with Nura.'
            });
            showToast(`Added ${appointmentData.name || 'appointment'} to Checkups!`, 'success');
          }
        }
      } catch (e) {
        console.error('Error extracting appointment:', e);
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
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: "I'm having trouble connecting right now. Please check the error banner above." }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };


  const startNewSession = () => {
    const newId = 'session-' + Date.now();
    const systemPromptObj = { id: 'system', role: 'system', content: buildSystemPrompt() };
    const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${firstName}, starting a fresh session — what's going on today?` };
    setCurrentSessionId(newId);
    setMessages([systemPromptObj, welcome]);
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



  // Sync messages when currentSessionId changes from parent (e.g. sidebar) or when DB finishes initial load
  useEffect(() => {
    // 1. If the user switched sessions, force a sync from DB or reset to welcome message
    if (activeSessionIdLocally.current !== currentSessionId) {
      const s = sessions.find(x => x.id === currentSessionId);
      if (s && s.messages) {
        setMessages(s.messages);
        setShowQuickStart(s.messages.length <= 1);
      } else {
        const systemPromptObj = { id: 'system', role: 'system', content: buildSystemPrompt() };
        const welcome = { id: 'welcome', role: 'assistant', content: `Hi ${firstName}, starting a fresh session — what's going on today?` };
        setMessages([systemPromptObj, welcome]);
        setShowQuickStart(true);
      }
      setChatError(null);
      activeSessionIdLocally.current = currentSessionId;
      return;
    }

    // 2. Otherwise, we are in the SAME session. We only sync from DB if our local messages are empty/new
    // (e.g. initial load where DB finished fetching after component mount)
    const s = sessions.find(x => x.id === currentSessionId);
    if (s && s.messages && messages.length <= 1 && s.messages.length > 1) {
      setMessages(s.messages);
      setShowQuickStart(false);
    }
  }, [currentSessionId, sessions, firstName, messages.length]);

  const quickOptions = lang === 'am' 
    ? ['ራስ ምታት', 'የሆድ ሕመም', 'የጉሮሮ ሕመም', 'ድካም', 'ሳል', 'ትኩሳት'] 
    : ['Headache', 'Stomach ache', 'Sore throat', 'Fatigue', 'Cough', 'Fever'];

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 style={{fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6}}>{t("hello")}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} <Icons.Hand size={24} color="var(--green-dark)" /></h2>
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
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className={`session-item ${s.id === currentSessionId ? 'active' : ''}`}
                  style={{ flex: 1, marginRight: 0, paddingRight: '8px' }}
                  onClick={() => switchToSession(s.id)}
                >
                  <Icons.MessageCircle size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                </button>
                <button 
                  style={{ background: 'none', border: 'none', padding: '10px 12px', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.7 }}
                  onClick={() => handleDeleteSession(s.id)}
                >
                  <Icons.Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="chat-container" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 20, zIndex: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={chatLang} onChange={(e) => setChatLang(e.target.value)} style={{ padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border)', fontFamily: 'var(--font)', outline: 'none', background: 'rgba(255,255,255,0.8)', color: 'var(--text)', fontSize: 13 }}>
                <option value="en">English (Chat)</option>
                <option value="am">አማርኛ (ውይይት)</option>
              </select>
              <button 
                className="btn-icon"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: 13, color: 'var(--text)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                onClick={() => {
                  setShareSession(sessions.find(s => s.id === currentSessionId));
                }}
              >
                <Icons.Share size={14} /> {t("share")}
              </button>
            </div>
          </div>
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
                if (urgencyData && m._urgencyHospitals) {
                  urgencyData._hospitals = m._urgencyHospitals;
                }
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
            {showQuickStart && !messages.some(m => m.role === 'user') && (
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
                <Icons.Send size={18} />
                <span>{t("send")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



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

function Discovery({ t }) {
  const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem('nuracare_interests') || '[]'));
  const [feed, setFeed] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'local'

  useEffect(() => {
    setAvailableTags(getAvailableTags());
  }, []);

  useEffect(() => {
    let baseFeed = getDiscoveryFeed(filters);
    if (activeTab === 'local') {
      baseFeed = baseFeed.filter(i => i.tags && i.tags.includes('ethiopian'));
    }
    setFeed(baseFeed);
  }, [filters, activeTab]);

  const toggleFilter = (tag) => {
    const updated = filters.includes(tag) ? filters.filter(f => f !== tag) : [...filters, tag];
    setFilters(updated);
    localStorage.setItem('nuracare_interests', JSON.stringify(updated));
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div><h1 className="page-title">Discovery Feed</h1><p className="page-subtitle">Your personalized, dynamic health knowledge</p></div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('all')} 
          style={{ background: 'transparent', border: 'none', padding: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: activeTab === 'all' ? 'var(--green-dark)' : 'var(--text-muted)', borderBottom: activeTab === 'all' ? '3px solid var(--green)' : '3px solid transparent', cursor: 'pointer' }}
        >
          Explore All
        </button>
        <button 
          onClick={() => setActiveTab('local')} 
          style={{ background: 'transparent', border: 'none', padding: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: activeTab === 'local' ? 'var(--green-dark)' : 'var(--text-muted)', borderBottom: activeTab === 'local' ? '3px solid var(--green)' : '3px solid transparent', cursor: 'pointer' }}
        >
          Local Superfoods
        </button>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-muted)' }}>Follow your interests:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {availableTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => toggleFilter(tag)}
              style={{ 
                padding: '6px 12px', 
                borderRadius: 20, 
                border: `1.5px solid ${filters.includes(tag) ? 'var(--green-dark)' : 'var(--border)'}`,
                background: filters.includes(tag) ? 'var(--green-light)' : 'transparent',
                color: filters.includes(tag) ? 'var(--green-dark)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
              {filters.includes(tag) ? <Icons.Check size={14}/> : <Icons.Plus size={14}/>} {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title">{activeTab === 'local' ? 'Nutritional Breakdown' : 'Articles & Guides'}</div>
      <div className="discovery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {feed.filter(i => !i.vid).map((item, i) => {
          return (
            <div key={i} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, overflow: 'hidden' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover', backgroundColor: '#e8f5e9' }} onError={(e)=>{e.target.src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pfefferminze_natur_peppermint.jpg/400px-Pfefferminze_natur_peppermint.jpg'}} />
              <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{item.name}</h3>
                <span style={{ fontSize: 11, background: 'var(--bg)', padding: '4px 8px', borderRadius: 10, fontWeight: 600 }}>{item.category.toUpperCase()}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.benefit}</p>
              
              {activeTab === 'local' && item.tags.includes('ethiopian') && (
                <div style={{ marginTop: 12, padding: 12, background: 'var(--green-light)', borderRadius: 8, fontSize: 12, color: 'var(--green-dark)' }}>
                  <strong>Nutritional Highlight:</strong> Often rich in essential minerals, fiber, or natural anti-microbial properties unique to the highland geography. 
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {feed.filter(i => !!i.vid).length > 0 && <div className="section-title" style={{ marginTop: 40 }}>Watch & Learn</div>}
      <div className="discovery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {feed.filter(i => !!i.vid).map((item, i) => (
          <div key={i} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, overflow: 'hidden', background: '#fafafa' }}>
            <a href={item.vid} target="_blank" rel="noreferrer" style={{ position: 'relative', display: 'block', backgroundColor: '#000' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover', opacity: 0.9 }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80'}} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#ff0000', borderRadius: '12px', width: 68, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <Icons.Play size={28} color="#fff" fill="#fff" />
              </div>
            </a>
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{item.name}</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.benefit}</p>
              <a href={item.vid} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#ef4444', textDecoration: 'none', fontWeight: 600, border: '1px solid #ef4444', padding: '6px 12px', borderRadius: 20 }}>
                <Icons.Youtube size={16} /> Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function AuthPage({ setOnboardingStep, setActivePage, useAuth, t = (k)=>k }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name, phone);
        setSuccessMsg('Signup successful! Please check your email to verify your account.');
        showToast('Signup successful! Please check your email.', 'success');
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
            {!isLogin && (
              <>
                <div className="form-group" style={{textAlign: 'left', marginBottom: 16}}>
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Smith" required={!isLogin} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}} />
                </div>
                <div className="form-group" style={{textAlign: 'left', marginBottom: 16}}>
                  <label>Phone Number (Optional)</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}} />
                </div>
              </>
            )}
            <div className="form-group" style={{textAlign: 'left', marginBottom: 16}}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}} />
            </div>
            <div className="form-group" style={{textAlign: 'left'}}>
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'}} />
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left' }}>
              <input 
                type="checkbox" 
                id="agreeTerms" 
                checked={agreedToTerms} 
                onChange={(e) => setAgreedToTerms(e.target.checked)} 
                style={{ marginTop: 4, cursor: 'pointer', accentColor: 'var(--green)' }} 
              />
              <label htmlFor="agreeTerms" style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                I agree to the <a href="#" onClick={(e) => { e.preventDefault(); setOnboardingStep(0); setActivePage('terms'); }} style={{ color: 'var(--green)' }}>Terms of Service</a> and <a href="#" onClick={(e) => { e.preventDefault(); setOnboardingStep(0); setActivePage('privacy'); }} style={{ color: 'var(--green)' }}>Privacy Policy</a>.
              </label>
            </div>

            {errorMsg && <div style={{color: 'var(--red)', fontSize: 13, marginTop: 12, textAlign: 'center'}}>{errorMsg}</div>}
            {successMsg && <div style={{color: 'var(--green-dark)', background: 'var(--green-light)', padding: '12px', borderRadius: '8px', fontSize: 13, marginTop: 12, textAlign: 'center', fontWeight: '500'}}>{successMsg}</div>}
            
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

          <button type="button" className="btn-outline-sm" onClick={() => { 
            if (!agreedToTerms) {
              setErrorMsg("You must agree to the Terms of Service and Privacy Policy to continue.");
              return;
            }
            signInWithGoogle(); 
          }} style={{width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--border)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
