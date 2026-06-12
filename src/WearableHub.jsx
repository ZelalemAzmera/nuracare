import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getLatestWearableReadings } from './wellnessEngine';

export default function WearableHub({ onBack, showToast, profile }) {
  const [readings, setReadings] = useState({});
  const [isConnectingFitbit, setIsConnectingFitbit] = useState(false);
  const [isConnectingOura, setIsConnectingOura] = useState(false);

  useEffect(() => {
    setReadings(getLatestWearableReadings());

    const handleSync = () => setReadings(getLatestWearableReadings());
    window.addEventListener('wearable-synced', handleSync);
    return () => window.removeEventListener('wearable-synced', handleSync);
  }, []);

  const isFitbitConnected = profile?.connected_devices?.fitbit === true;
  const isOuraConnected = profile?.connected_devices?.oura === true;
  const hasData = Object.keys(readings).length > 0;

  const handleFitbitConnect = async () => {
    if (!profile || !profile.id) return showToast('You must be logged in.', 'error');
    setIsConnectingFitbit(true);
    try { window.location.href = `/api/fitbit-auth?userId=${profile.id}`; }
    catch (err) { showToast('Error: ' + err.message, 'error'); setIsConnectingFitbit(false); }
  };

  const handleFitbitDisconnect = async () => {
    setIsConnectingFitbit(true);
    try {
      const res = await fetch('/api/fitbit-disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: profile.id }) });
      if (!res.ok) throw new Error('Failed to disconnect');
      showToast('Fitbit disconnected successfully', 'success');
      window.location.reload(); 
    } catch (err) { showToast('Error: ' + err.message, 'error'); setIsConnectingFitbit(false); }
  };

  const handleFitbitSync = async () => {
    setIsConnectingFitbit(true);
    try {
      const res = await fetch('/api/fitbit-sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: profile.id }) });
      if (!res.ok) throw new Error('Sync failed');
      showToast('Fitbit data synced successfully!', 'success');
      setReadings(getLatestWearableReadings()); 
    } catch (err) { showToast('Error: ' + err.message, 'error'); } 
    finally { setIsConnectingFitbit(false); }
  };

  const handleOuraConnect = async () => {
    if (!profile || !profile.id) return showToast('You must be logged in.', 'error');
    setIsConnectingOura(true);
    try { window.location.href = `/api/oura-auth?userId=${profile.id}`; }
    catch (err) { showToast('Error: ' + err.message, 'error'); setIsConnectingOura(false); }
  };

  const handleOuraDisconnect = async () => {
    setIsConnectingOura(true);
    try {
      const res = await fetch('/api/oura-disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: profile.id }) });
      if (!res.ok) throw new Error('Failed to disconnect');
      showToast('Oura Ring disconnected successfully', 'success');
      window.location.reload(); 
    } catch (err) { showToast('Error: ' + err.message, 'error'); setIsConnectingOura(false); }
  };

  const handleOuraSync = async () => {
    setIsConnectingOura(true);
    try {
      const res = await fetch('/api/oura-sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: profile.id }) });
      if (!res.ok) throw new Error('Sync failed');
      showToast('Oura data synced successfully!', 'success');
      setReadings(getLatestWearableReadings()); 
    } catch (err) { showToast('Error: ' + err.message, 'error'); } 
    finally { setIsConnectingOura(false); }
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
        {/* Fitbit Card */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(14, 165, 233, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Activity size={28} color="#0ea5e9" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text)' }}>Fitbit / Google Health</h3>
                  {isFitbitConnected && <span style={{ background: '#10b981', color: 'white', fontSize: 12, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Connected</span>}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Sync your daily steps, heart rate, and sleep data.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {!isFitbitConnected ? (
              <button className="btn-primary" onClick={handleFitbitConnect} disabled={isConnectingFitbit} style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0ea5e9', color: 'white' }}>
                  {isConnectingFitbit ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Link size={20} />} Connect
              </button>
            ) : (
              <button className="btn-secondary" onClick={handleFitbitDisconnect} disabled={isConnectingFitbit} style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
                  {isConnectingFitbit ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Unlink size={20} />} Disconnect
              </button>
            )}
            <button className="btn-secondary" onClick={handleFitbitSync} disabled={!isFitbitConnected || isConnectingFitbit} style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isFitbitConnected ? 1 : 0.5 }}>
              <Icons.RefreshCw size={20} className={isConnectingFitbit ? 'animate-spin' : ''} /> Sync Now
            </button>
          </div>
        </div>

        {/* Oura Ring Card */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Circle size={28} color="#8b5cf6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--text)' }}>Oura Ring</h3>
                  {isOuraConnected && <span style={{ background: '#10b981', color: 'white', fontSize: 12, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Connected</span>}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Connect your ring for detailed sleep and readiness tracking.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {!isOuraConnected ? (
              <button className="btn-primary" onClick={handleOuraConnect} disabled={isConnectingOura} style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#8b5cf6', color: 'white' }}>
                  {isConnectingOura ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Link size={20} />} Connect
              </button>
            ) : (
              <button className="btn-secondary" onClick={handleOuraDisconnect} disabled={isConnectingOura} style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
                  {isConnectingOura ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Unlink size={20} />} Disconnect
              </button>
            )}
            <button className="btn-secondary" onClick={handleOuraSync} disabled={!isOuraConnected || isConnectingOura} style={{ flex: 1, padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isOuraConnected ? 1 : 0.5 }}>
              <Icons.RefreshCw size={20} className={isConnectingOura ? 'animate-spin' : ''} /> Sync Now
            </button>
          </div>
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

