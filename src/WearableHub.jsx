import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import AppleHealthImport from './AppleHealthImport';
import { getLatestWearableReadings } from './wellnessEngine';

export default function WearableHub({ onBack, showToast }) {
  const [showAppleImport, setShowAppleImport] = useState(false);
  const [readings, setReadings] = useState({});

  useEffect(() => {
    setReadings(getLatestWearableReadings());

    const handleSync = () => setReadings(getLatestWearableReadings());
    window.addEventListener('wearable-synced', handleSync);
    return () => window.removeEventListener('wearable-synced', handleSync);
  }, []);

  const hasData = Object.keys(readings).length > 0;

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icons.ArrowLeft size={20} color="var(--text-muted)" />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Connected Devices</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Sync your health data automatically</p>
        </div>
      </div>

      <div className="section-title">Device Integrations</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        
        {/* Apple Health Card */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Apple size={24} color="var(--green-dark)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>Apple Health</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: readings.source === 'apple_health' ? 'var(--green-dark)' : 'var(--text-muted)' }}>
                  {readings.source === 'apple_health' ? (
                    <><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }}></span> Connected</>
                  ) : 'Not connected'}
                </div>
              </div>
            </div>
          </div>
          <button className="btn-outline-sm" onClick={() => setShowAppleImport(!showAppleImport)} style={{ width: '100%' }}>
            {showAppleImport ? 'Cancel Import' : 'Import XML Data'}
          </button>
        </div>

        {/* Google Fit Card */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Activity size={24} color="#ca8a04" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>Google Fit</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  Not connected
                </div>
              </div>
            </div>
          </div>
          <button className="btn-outline-sm" onClick={() => showToast('Google Fit OAuth integration is planned for Phase 2.', 'success')} style={{ width: '100%' }}>
            Connect Google Fit
          </button>
        </div>

        {/* Fitbit Card */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Watch size={24} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>Fitbit</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  Not connected
                </div>
              </div>
            </div>
          </div>
          <button className="btn-outline-sm" onClick={() => showToast('Fitbit webhook integration is planned for Phase 3.', 'success')} style={{ width: '100%' }}>
            Connect Fitbit
          </button>
        </div>

        {/* Garmin Card */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Compass size={24} color="#475569" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>Garmin</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                  Not connected
                </div>
              </div>
            </div>
          </div>
          <button className="btn-outline-sm" onClick={() => showToast('Garmin webhook integration is planned for Phase 3.', 'success')} style={{ width: '100%' }}>
            Connect Garmin
          </button>
        </div>
      </div>

      {showAppleImport && (
        <div style={{ marginTop: 24 }}>
          <AppleHealthImport onImportComplete={(data) => {
            setShowAppleImport(false);
            showToast('Apple Health data successfully synced!', 'success');
          }} />
        </div>
      )}

      {hasData && (
        <>
          <div className="section-title" style={{ marginTop: 40 }}>Latest Synced Data</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {readings.steps && (
              <div className="dash-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
                  <Icons.Footprints size={18} color="var(--green-dark)" /> Steps
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{readings.steps.toLocaleString()}</div>
              </div>
            )}
            {readings.heart_rate && (
              <div className="dash-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
                  <Icons.HeartPulse size={18} color="#ef4444" /> Resting HR
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{readings.heart_rate} <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>bpm</span></div>
              </div>
            )}
            {readings.sleep_min && (
              <div className="dash-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
                  <Icons.Moon size={18} color="#6366f1" /> Sleep
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{Math.floor(readings.sleep_min / 60)}h {readings.sleep_min % 60}m</div>
              </div>
            )}
            {readings.calories && (
              <div className="dash-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
                  <Icons.Flame size={18} color="#f59e0b" /> Calories
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{readings.calories.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>kcal</span></div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
