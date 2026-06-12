import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getLatestWearableReadings } from './wellnessEngine';

export default function WearableHub({ onBack, showToast, profile }) {
  const [readings, setReadings] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setReadings(getLatestWearableReadings());

    const handleSync = () => setReadings(getLatestWearableReadings());
    window.addEventListener('wearable-synced', handleSync);
    return () => window.removeEventListener('wearable-synced', handleSync);
  }, []);

  const isConnected = profile?.connected_devices?.fitbit === true;
  const hasData = Object.keys(readings).length > 0;

  const handleFitbitConnect = async () => {
    if (!profile || !profile.id) {
      showToast('You must be logged in to connect devices.', 'error');
      return;
    }
    
    setIsConnecting(true);
    try {
      window.location.href = `/api/fitbit-auth?userId=${profile.id}`;
    } catch (err) {
      console.error(err);
      showToast('Error connecting to Fitbit: ' + err.message, 'error');
      setIsConnecting(false);
    }
  };

  const handleFitbitDisconnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/fitbit-disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      
      showToast('Fitbit disconnected successfully', 'success');
      // A small hack to force reload so profile state updates
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      showToast('Error disconnecting: ' + err.message, 'error');
      setIsConnecting(false);
    }
  };

  const handleManualSync = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/fitbit-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      
      showToast('Health data synced successfully!', 'success');
      setReadings(getLatestWearableReadings()); // Refresh local view
    } catch (err) {
      console.error(err);
      showToast('Error syncing device: ' + err.message, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

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

      <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24, background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(14, 165, 233, 0.05) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Activity size={28} color="#0ea5e9" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text)' }}>Fitbit / Google Health</h3>
                {isConnected && (
                    <span style={{ background: '#10b981', color: 'white', fontSize: 12, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Connected</span>
                )}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
              Connect your account to automatically sync your daily steps, heart rate, and sleep data.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!isConnected ? (
            <button 
                className="btn-primary" 
                onClick={handleFitbitConnect} 
                disabled={isConnecting}
                style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0ea5e9', color: 'white' }}
            >
                {isConnecting ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Link size={20} />}
                {isConnecting ? 'Connecting...' : 'Connect Account'}
            </button>
          ) : (
            <button 
                className="btn-secondary" 
                onClick={handleFitbitDisconnect} 
                disabled={isConnecting}
                style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
            >
                {isConnecting ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Unlink size={20} />}
                Disconnect
            </button>
          )}
          
          <button 
            className="btn-secondary" 
            onClick={handleManualSync} 
            disabled={!isConnected || isConnecting}
            style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isConnected ? 1 : 0.5 }}
          >
            <Icons.RefreshCw size={20} className={isConnecting ? 'animate-spin' : ''} />
            Sync Now
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: 0.6, marginTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>More integrations (Apple Health, Garmin) coming soon</span>
        </div>
      </div>

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
