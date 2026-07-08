import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

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
            setLoading(true);
            signInWithGoogle(); 
          }} disabled={loading} style={{width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--border)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;