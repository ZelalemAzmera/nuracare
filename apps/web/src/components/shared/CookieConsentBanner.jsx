import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const COOKIE_PREFS_KEY = 'nuracare_cookie_preferences';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    personalization: false,
    marketing: false
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_PREFS_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true
    };
    savePreferences(allAccepted);
  };

  const handleRejectOptional = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      personalization: false,
      marketing: false
    };
    savePreferences(onlyEssential);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs) => {
    try {
      localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      zIndex: 9999,
      padding: '20px 24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Main Banner Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icons.Cookie size={22} color="#b45309" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Your Privacy & Cookie Choices
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              NuraCare uses essential cookies to enable authentication and core functionality. We also use optional telemetry cookies to improve performance. In accordance with Ethiopian Proclamation No. 1321/2024, you have the right to accept or reject optional cookies.
            </p>
          </div>
        </div>

        {/* Manage Preferences Accordion */}
        {showManage && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}>
            {/* Essential */}
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Essential Cookies</strong>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>Required</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Required for secure login and platform navigation.</p>
            </div>

            {/* Analytics */}
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Performance Telemetry</strong>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Helps us measure API speed and fix app crashes.</p>
            </div>

            {/* Personalization */}
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Personalization</strong>
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={(e) => setPreferences({ ...preferences, personalization: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Remembers language and cultural calendar choices.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={() => setShowManage(!showManage)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              marginRight: 'auto'
            }}
          >
            {showManage ? 'Hide Preferences' : 'Manage Preferences'}
          </button>

          <button
            onClick={handleRejectOptional}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reject Optional
          </button>

          {showManage ? (
            <button
              onClick={handleSaveCustom}
              style={{
                backgroundColor: '#16a34a',
                border: 'none',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Save Custom Choices
            </button>
          ) : (
            <button
              onClick={handleAcceptAll}
              style={{
                backgroundColor: '#16a34a',
                border: 'none',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Accept All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
