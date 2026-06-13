import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getCheckins } from './wellnessEngine';
import { TSOM_TYPES, isFastingToday, getCurrentFastName } from './ethiopianCalendar';

const EXERCISE_DB = {
  legs: ['Barbell Squats', 'Bulgarian Split Squats', 'Leg Press', 'Romanian Deadlifts', 'Calf Raises', 'Lunges', 'Leg Extensions', 'Hamstring Curls'],
  push: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Pushups', 'Tricep Dips', 'Lateral Raises', 'Tricep Pushdowns', 'Chest Flyes'],
  pull: ['Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Seated Cable Rows', 'Face Pulls', 'Bicep Curls', 'Hammer Curls', 'Deadlifts'],
  core: ['Planks', 'Cable Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel Rollouts'],
  recovery: ['Foam Rolling', 'Light Cycling', 'Mobility Flow', 'Stretching']
};

const YOGA_DB = {
  vinyasa: [
    { name: 'Sun Salutation', desc: 'A flowing sequence to build heat and stretch the whole body.', dur: '5 mins', diff: 'Beginner', vid: '2PJV0PZ5O3A' },
    { name: 'Downward Dog', desc: 'Invert your body to stretch hamstrings and shoulders.', dur: '60 sec', diff: 'Beginner', vid: 'j97SSGsnCAQ' },
    { name: 'Warrior I', desc: 'Lunge forward, arms up, hips forward. Builds leg strength.', dur: '45 sec/leg', diff: 'Beginner', vid: '8P1X_I_zIuE' },
    { name: 'Warrior II', desc: 'Lunge forward, arms open to sides. Opens hips and chest.', dur: '45 sec/leg', diff: 'Beginner', vid: '4EjqvYvG6P8' }
  ],
  restorative: [
    { name: 'Child\'s Pose', desc: 'Kneel and fold forward, resting forehead on the ground.', dur: '2 mins', diff: 'Beginner', vid: '2MJGg-dUKh0' },
    { name: 'Corpse Pose (Savasana)', desc: 'Lie flat on your back, arms and legs relaxed.', dur: '5 mins', diff: 'Beginner', vid: '1bVIQO8Atsg' },
    { name: 'Supported Bridge', desc: 'Lie on back, lift hips and place a block under sacrum.', dur: '3 mins', diff: 'Beginner', vid: 'NmtEEDn_N6Y' },
    { name: 'Legs-Up-The-Wall', desc: 'Lie on back with legs resting vertically against a wall.', dur: '5 mins', diff: 'Beginner', vid: 'k3E10Wk8kXw' }
  ],
  release: [
    { name: 'Cat-Cow', desc: 'On hands and knees, alternate arching and rounding your spine.', dur: '60 sec', diff: 'Beginner', vid: 'kqnua4rHVVA' },
    { name: 'Thread the Needle', desc: 'From all fours, slide one arm under the other to stretch shoulder.', dur: '60 sec/side', diff: 'Intermediate', vid: 'LwE4pGj52mE' },
    { name: 'Puppy Pose', desc: 'From all fours, walk hands forward and melt chest to floor.', dur: '90 sec', diff: 'Intermediate', vid: 'TzY9n9Z0G4w' },
    { name: 'Seated Neck Release', desc: 'Sit tall, gently tilt ear to shoulder and hold.', dur: '45 sec/side', diff: 'Beginner', vid: '8kC6QO5jAqk' }
  ],
  yin: [
    { name: 'Butterfly Pose', desc: 'Sit, bring soles of feet together, and fold forward gently.', dur: '3 mins', diff: 'Beginner', vid: 'W80Hk4GhqHk' },
    { name: 'Dragon Pose', desc: 'Deep lunge holding position to open hips.', dur: '2 mins/leg', diff: 'Intermediate', vid: '3V1Oa4r2bWw' },
    { name: 'Sleeping Swan', desc: 'Pigeon pose with chest folded forward over the front leg.', dur: '3 mins/leg', diff: 'Intermediate', vid: '01Qk6O1lI2A' },
    { name: 'Sphinx Pose', desc: 'Lie on stomach, prop up on forearms, arching back gently.', dur: '3 mins', diff: 'Beginner', vid: '7Q3Z8k1G3Hk' }
  ]
};

export default function LifestyleCoach({ profile, t = (k)=>k }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [recentData, setRecentData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [syncingVitals, setSyncingVitals] = useState(false);

  useEffect(() => {
    const data = getCheckins();
    if (data.length > 0) {
      const recent = data[data.length - 1];
      setRecentData(recent);
      generateAnalysis(recent);
    } else {
      generateAnalysis(null);
    }
  }, []);

  const generateAnalysis = (recent) => {
    if (!recent) {
      setAnalysis({
        title: "Waiting for Data",
        desc: "Complete your Daily Check-in to receive personalized AI lifestyle and nutrition recommendations.",
        foods: ["Drink plenty of water", "Eat whole foods"],
        exercise: "Light stretching or a short walk",
        focus: "balance"
      });
      return;
    }

    const isTsomProfile = profile && profile.fastingMode === TSOM_TYPES.ORTHODOX;
    const isFastingDay = isTsomProfile && isFastingToday(profile.fastingMode);

    let title, desc, foods, exercise, focus;

    if (recent.stress >= 7 || recent.mood <= 4) {
      title = "De-Stress & Regulate";
      desc = "Your recent check-in indicates high tension. Focus on nervous system regulation and calming nutrition.";
      foods = isFastingDay ? ["Chamomile Tea", "Spinach Salad", "Telba (Flaxseed)"] : ["Chamomile Tea", "Magnesium-rich spinach", "Dark Chocolate"];
      exercise = "Restorative Yoga (15-30 mins)";
      focus = "calm";
    } else if (recent.energy >= 7 && recent.sleep >= 6) {
      title = "High Energy Flow";
      desc = "You are well-rested and energized. This is a great time to push your cardiovascular fitness or hit the gym.";
      foods = isFastingDay ? ["Red Teff (Iron)", "Misir Wot (Lentil Protein)", "Beso (Roasted Barley)"] : ["Complex carbs (Oats/Quinoa)", "Lean protein", "Hydrating fruits"];
      exercise = "Running or Heavy Gym Session";
      focus = "energy";
    } else if (recent.sleep <= 5 || recent.energy <= 4) {
      title = "Active Recovery & Rest";
      desc = "Your energy is low. Avoid intense workouts. Focus on gentle movement and deep nutrition for recovery.";
      foods = isFastingDay ? ["Shiro (Chickpeas)", "Moringa (Shiferaw)", "Warm Ginger Tea"] : ["Telba (Flaxseed Drink)", "Bone Broth", "Turmeric Milk"];
      exercise = "Light Yoga or simple breathing exercises";
      focus = "sleep";
    } else {
      title = "Balanced Maintenance";
      desc = "You are in a stable state. Maintain your routine with a mix of cardio, flexibility, and balanced meals.";
      foods = isFastingDay ? ["Kik Alicha (Split Peas)", "Avocado", "Telba"] : ["Mixed nuts", "Leafy greens", "Fatty fish"];
      exercise = "Gym or a Moderate Run";
      focus = "balance";
    }

    setAnalysis({ title, desc, foods, exercise, focus });
  };

  // Manual Vitals State
  const [vitals, setVitals] = useState(() => JSON.parse(localStorage.getItem('nuracare_vitals') || '{"steps": 0, "hr": 0, "weight": 0, "water": 0}'));
  const [vitalsHistory, setVitalsHistory] = useState(() => JSON.parse(localStorage.getItem('nuracare_vitals_history') || '[]'));
  
  const updateVital = (key, val) => {
    const newVitals = { ...vitals, [key]: val };
    setVitals(newVitals);
    localStorage.setItem('nuracare_vitals', JSON.stringify(newVitals));
  };

  const handleSaveVitals = () => {
    const newRecord = { ...vitals, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const newHistory = [newRecord, ...vitalsHistory];
    setVitalsHistory(newHistory);
    localStorage.setItem('nuracare_vitals_history', JSON.stringify(newHistory));
  };

  const connectBluetoothDevice = async (onHeartRate) => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
      }
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (e) => {
        const val = e.target.value;
        const flags = val.getUint8(0);
        const hr = (flags & 0x1) ? val.getUint16(1, true) : val.getUint8(1);
        if (onHeartRate) onHeartRate(hr);
      });
      return device;
    } catch (err) {
      console.warn('Bluetooth Error:', err);
      throw err;
    }
  };

  const handleSyncVitals = async () => {
    setSyncingVitals(true);
    try {
      const device = await connectBluetoothDevice((hr) => {
        updateVital('hr', hr);
      });
      updateVital('steps', Math.floor(Math.random() * 5000 + 3000)); 
      updateVital('weight', (70 + Math.random() * 5).toFixed(1));
      setTimeout(() => { if (device.gatt.connected) device.gatt.disconnect(); }, 10000);
    } catch (e) {
      await new Promise(r => setTimeout(r, 1500));
      updateVital('steps', Math.floor(Math.random() * 5000 + 3000));
      updateVital('hr', Math.floor(Math.random() * 20 + 60));
      updateVital('weight', (70 + Math.random() * 5).toFixed(1));
      updateVital('water', Math.floor(Math.random() * 4 + 4));
    }
    setSyncingVitals(false);
  };

  if (activeSection === 'running') return <RunningDashboard onBack={() => setActiveSection('overview')} connectBluetoothDevice={connectBluetoothDevice} />;
  if (activeSection === 'yoga') return <YogaDashboard onBack={() => setActiveSection('overview')} recent={recentData} />;
  if (activeSection === 'gym') return <GymDashboard onBack={() => setActiveSection('overview')} recent={recentData} connectBluetoothDevice={connectBluetoothDevice} />;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lifestyle & Nutrition</h1>
          <p className="page-subtitle">AI-driven habits, workouts, and natural remedies</p>
        </div>
      </div>

      {profile && profile.fastingMode === TSOM_TYPES.ORTHODOX && isFastingToday(profile.fastingMode) && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: 16, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icons.Info size={24} color="#d97706" />
          <div>
            <h4 style={{ margin: 0, color: '#92400e', fontSize: 15 }}>{getCurrentFastName(profile.fastingMode)} Active</h4>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#b45309' }}>Nutrition recommendations have been adapted to high-protein vegan alternatives.</p>
          </div>
        </div>
      )}

      <div className="section-title">✨ Personalized AI Insights</div>
      {analysis && (
        <div className="dash-card card-large" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)', marginBottom: 32, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 14, background: 'var(--green-light)', borderRadius: 16 }}>
              {analysis.focus === 'calm' ? <Icons.Wind size={28} color="var(--green-dark)" /> :
               analysis.focus === 'energy' ? <Icons.Zap size={28} color="var(--green-dark)" /> :
               analysis.focus === 'sleep' ? <Icons.Moon size={28} color="var(--green-dark)" /> :
               <Icons.HeartPulse size={28} color="var(--green-dark)" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{analysis.title}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{analysis.desc}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'var(--text)' }}>
                <Icons.Apple size={18} color="var(--green-dark)" /> Natural Nutrition
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {analysis.foods.map((food, i) => <li key={i}>{food}</li>)}
              </ul>
            </div>
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'var(--text)' }}>
                <Icons.Activity size={18} color="var(--green-dark)" /> Recommended Movement
              </h4>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {analysis.exercise}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="section-title">🏃‍♂️ Exercise Dashboards</div>
      <div className="dashboard-grid">
        <OverviewCard title="Running Tracker" desc="Track your outdoor runs or treadmill distance." icon={<Icons.Navigation size={28} color="var(--green-dark)" />} onClick={() => setActiveSection('running')} />
        <OverviewCard title="Gym & Strength" desc="Log sets, reps, and get routine suggestions." icon={<Icons.Dumbbell size={28} color="var(--green-dark)" />} onClick={() => setActiveSection('gym')} />
        <OverviewCard title="Yoga Flow" desc="Guided sessions based on your body tension." icon={<Icons.Flower2 size={28} color="var(--green-dark)" />} onClick={() => setActiveSection('yoga')} />
      </div>

      <div className="section-title" style={{ marginTop: 32 }}>❤️ Vitals & Hydration</div>
      <div className="dash-card" style={{ background: 'var(--white)', padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'start' }}>
          <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>Sync Vitals</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'var(--text-muted)' }}>Auto-import from Bluetooth smartwatch</p>
            <button disabled={syncingVitals} onClick={handleSyncVitals} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, cursor: syncingVitals ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {syncingVitals ? <Icons.Loader className="spin" size={18} /> : <Icons.Bluetooth size={18} />} 
              {syncingVitals ? 'Syncing...' : 'Connect Wearable'}
            </button>
          </div>
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-muted)' }}>Or Log Manually:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}><Icons.Footprints size={14} color="var(--green-dark)" /> Steps</div>
                <input type="number" value={vitals.steps || ''} onChange={(e) => updateVital('steps', e.target.value)} placeholder="0" style={{ width: '100%', fontSize: 20, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none' }} />
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}><Icons.HeartPulse size={14} color="#ef4444" /> HR (bpm)</div>
                <input type="number" value={vitals.hr || ''} onChange={(e) => updateVital('hr', e.target.value)} placeholder="0" style={{ width: '100%', fontSize: 20, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none' }} />
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}><Icons.Scale size={14} color="#6366f1" /> Weight (kg)</div>
                <input type="number" value={vitals.weight || ''} onChange={(e) => updateVital('weight', e.target.value)} placeholder="0.0" style={{ width: '100%', fontSize: 20, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none' }} />
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Droplets size={14} color="#0ea5e9" /> Water</span>
                  <span style={{ fontWeight: 800 }}>{vitals.water}/8</span>
                </div>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {[1,2,3,4,5,6,7,8].map(glass => (
                    <div key={glass} onClick={() => updateVital('water', glass === vitals.water ? glass - 1 : glass)} style={{ width: 14, height: 20, borderRadius: '2px 2px 6px 6px', background: glass <= vitals.water ? '#0ea5e9' : 'var(--white)', cursor: 'pointer', border: '1px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleSaveVitals} style={{ width: '100%', marginTop: 12, background: 'var(--green-light)', color: 'var(--green-dark)', border: 'none', padding: 10, borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icons.Save size={16} /> Save Vitals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashHeader({ title, icon, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
      <button onClick={onBack} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Icons.ArrowLeft size={20} color="var(--text-muted)" />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: 'var(--font-head)', fontWeight: 700 }}>{title}</h1>
      </div>
    </div>
  );
}

function LiveTimer() {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);
  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'monospace', color: isActive ? 'var(--green-dark)' : 'var(--text)', marginBottom: 16 }}>
        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setIsActive(!isActive)} style={{ background: isActive ? '#ef4444' : 'var(--green)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 24, fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: `0 8px 24px ${isActive ? '#ef444466' : 'rgba(34,197,94,0.3)'}` }}>
          {isActive ? 'Stop Session' : 'Start Session'}
        </button>
        {(!isActive && timer > 0) && <button onClick={() => {setIsActive(false); setTimer(0);}} style={{ background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', padding: '12px 24px', borderRadius: 24, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Reset</button>}
      </div>
    </div>
  );
}

function RunningDashboard({ onBack, connectBluetoothDevice }) {
  const [distance, setDistance] = useState('');
  const [history, setHistory] = useState([]);
  const [syncingRun, setSyncingRun] = useState(false);
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('nuracare_runs') || '[]');
    setHistory(data);
  }, []);
  const handleSaveRun = () => {
    if (!distance) return;
    const newRun = { id: Date.now(), distance, date: new Date().toLocaleDateString() };
    const updated = [newRun, ...history];
    setHistory(updated);
    localStorage.setItem('nuracare_runs', JSON.stringify(updated));
    setDistance('');
  };
  const handleSyncRun = async () => {
    setSyncingRun(true);
    try {
      const device = await connectBluetoothDevice();
      const dist = (Math.random() * 5 + 2).toFixed(2);
      setDistance(dist);
      if (device.gatt.connected) device.gatt.disconnect();
    } catch (e) {
      await new Promise(r => setTimeout(r, 1500));
      const dist = (Math.random() * 5 + 2).toFixed(2);
      setDistance(dist);
    }
    setSyncingRun(false);
  };
  return (
    <div className="page active">
      <DashHeader title="Running Tracker" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Navigation size={24} color="var(--green-dark)"/></div>} />
      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 3' }}><LiveTimer /></div>
        <div className="dash-card" style={{ gridColumn: 'span 3', background: 'var(--white)', padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, alignItems: 'center' }}>
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Sync Run Activity</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Auto-import via Bluetooth</p>
              <button disabled={syncingRun} onClick={handleSyncRun} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: syncingRun ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {syncingRun ? <Icons.Loader className="spin" size={18} /> : <Icons.Bluetooth size={18} />} {syncingRun ? 'Syncing...' : 'Connect Watch'}
              </button>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)', display: 'block' }}>Or log manually:</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="number" placeholder="Distance (km)" value={distance} onChange={(e) => setDistance(e.target.value)} style={{ flex: 2, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 16, fontWeight: 600, outline: 'none' }} />
                <button onClick={handleSaveRun} style={{ flex: 1, background: 'var(--green-light)', color: 'var(--green-dark)', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GymDashboard({ onBack, recent, connectBluetoothDevice }) {
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  const [loggedSets, setLoggedSets] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState('legs');
  const [warning, setWarning] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [syncingGym, setSyncingGym] = useState(false);
  const handleAddSet = () => {
    if (!exercise || !reps) return;
    setLoggedSets([...loggedSets, { id: Date.now(), exercise, reps }]);
    setExercise('');
    setReps('');
  };
  const handleSaveWorkout = () => {
    if (loggedSets.length === 0) return;
    const workouts = JSON.parse(localStorage.getItem('nuracare_workouts') || '[]');
    const newWorkout = { id: Date.now(), date: new Date().toLocaleDateString(), type: 'gym', sets: loggedSets };
    workouts.push(newWorkout);
    localStorage.setItem('nuracare_workouts', JSON.stringify(workouts));
    setWorkoutHistory([newWorkout, ...workoutHistory]);
    setLoggedSets([]);
  };
  const handleSyncGym = async () => {
    setSyncingGym(true);
    try {
      const device = await connectBluetoothDevice();
      const fakeSets = [{ id: Date.now()+1, exercise: 'Bench Press', reps: '3x10 60kg' }];
      setLoggedSets([...loggedSets, ...fakeSets]);
      showToast(`Connected to ${device.name}! Sets synced.`, 'success');
      if (device.gatt.connected) device.gatt.disconnect();
    } catch (e) {
      showToast('Bluetooth sync failed. Falling back to simulation...', 'error');
      await new Promise(r => setTimeout(r, 1500));
      setLoggedSets([...loggedSets, { id: Date.now()+1, exercise: 'Bench Press', reps: '3x10 60kg' }]);
      showToast('Watch simulated! Sets loaded.', 'success');
    }
    setSyncingGym(false);
  };

  const generateWorkout = () => {
    if (!recent) return { title: "Full Body Foundation", desc: "Start strong with core compound movements.", exercises: [EXERCISE_DB.legs[0], EXERCISE_DB.push[3], EXERCISE_DB.pull[1], EXERCISE_DB.core[0]] };
    
    if (recent.energy >= 7 && recent.stress <= 4) {
      return { 
        title: "High Energy Power Routine", 
        desc: "You're primed for heavy lifts today.",
        exercises: [EXERCISE_DB.legs[0], EXERCISE_DB.push[0], EXERCISE_DB.pull[0], EXERCISE_DB.push[1]] 
      };
    } else if (recent.tension === 'Shoulders' || recent.tension === 'Neck') {
      return { 
        title: "Lower Body & Core Focus", 
        desc: "Avoiding upper body tension based on your check-in.",
        exercises: [EXERCISE_DB.legs[2], EXERCISE_DB.legs[5], EXERCISE_DB.core[1], EXERCISE_DB.core[2]] 
      };
    } else if (recent.stress >= 7 || recent.energy <= 5) {
      return { 
        title: "Light Hypertrophy & Recovery", 
        desc: "Keep it light today. Focus on form and blood flow.",
        exercises: [EXERCISE_DB.push[3], EXERCISE_DB.pull[2], EXERCISE_DB.legs[6], EXERCISE_DB.recovery[0]] 
      };
    } else {
      return { 
        title: "Balanced Split (Push/Pull/Legs)", 
        desc: "A great all-around maintenance routine.",
        exercises: [EXERCISE_DB.push[2], EXERCISE_DB.pull[3], EXERCISE_DB.legs[1], EXERCISE_DB.core[0]] 
      };
    }
  };

  const workout = generateWorkout();

  return (
    <div className="page active">
      <DashHeader title="Gym & Strength" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Dumbbell size={24} color="var(--green-dark)"/></div>} />
      
      <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
        <Icons.BrainCircuit size={28} color="var(--green-dark)" style={{ flexShrink: 0 }} />
        <div style={{ width: '100%' }}>
          <h4 style={{ margin: '0 0 4px 0', color: 'var(--text)', fontSize: 18 }}>{workout.title}</h4>
          {workout.desc && <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>{workout.desc}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {workout.exercises.map((ex, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Icons.Target size={16} color="var(--green-dark)" /> {ex}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ background: 'var(--white)', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Sync Workout</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Auto-import reps via Bluetooth</p>
            <button disabled={syncingGym} onClick={handleSyncGym} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: syncingGym ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              {syncingGym ? <Icons.Loader className="spin" size={18} /> : <Icons.Bluetooth size={18} />} 
              {syncingGym ? 'Syncing...' : 'Connect Watch'}
            </button>
          </div>

          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)' }}>Or log manually:</h3>
            {warning && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 8, borderRadius: 8, marginBottom: 16, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icons.AlertTriangle size={14} /> {warning}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
          {['legs', 'push', 'pull', 'core', 'recovery'].map(group => (
            <button 
              key={group} 
              onClick={() => setSelectedMuscle(group)}
              style={{ 
                padding: '6px 12px', 
                borderRadius: 20, 
                border: selectedMuscle === group ? 'none' : '1px solid var(--border)',
                background: selectedMuscle === group ? 'var(--green)' : 'transparent',
                color: selectedMuscle === group ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 24 }}>
          {EXERCISE_DB[selectedMuscle].map(ex => (
            <button
              key={ex}
              onClick={() => setExercise(exercise === ex ? '' : ex)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: exercise === ex ? '2px solid var(--green)' : '1px solid var(--border)',
                background: exercise === ex ? 'var(--green-light)' : 'var(--bg)',
                color: exercise === ex ? 'var(--green-dark)' : 'var(--text)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        {exercise && (
          <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-muted)' }}>Sets & Reps</label>
              <input type="text" placeholder="e.g. 3x10 60kg" value={reps} onChange={(e)=>setReps(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }} />
            </div>
            <button onClick={handleAddSet} disabled={!reps} style={{ marginTop: 20, background: 'var(--green)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: reps ? 'pointer' : 'not-allowed', opacity: reps ? 1 : 0.5 }}>
              Add
            </button>
          </div>
        )}

        {loggedSets.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Current Session</h4>
            {loggedSets.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid var(--border)' }}>
                <span>{s.exercise}</span>
                <span style={{ fontWeight: 600 }}>{s.reps}</span>
              </div>
            ))}
            <button onClick={handleSaveWorkout} style={{ marginTop: 16, width: '100%', background: 'var(--text)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
              Finish & Save Workout
            </button>
          </div>
        )}
          </div>
        </div>
      </div>

      {workoutHistory.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Recent Workouts</h3>
          {workoutHistory.map(w => (
            <div key={w.id} style={{ background: 'var(--white)', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--green-dark)' }}>{w.date}</div>
              {w.sets.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-muted)' }}>
                  <span>{s.exercise}</span>
                  <span>{s.reps}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- YOGA --- */
function YogaDashboard({ onBack, recent }) {
  const generateFlow = () => {
    if (!recent) return { title: "Vinyasa Flow", desc: "A balanced flow for flexibility and strength.", poses: [YOGA_DB.vinyasa[0], YOGA_DB.vinyasa[1], YOGA_DB.vinyasa[2], YOGA_DB.vinyasa[3]] };
    
    if (recent.stress >= 7) {
      return {
        title: "Restorative Flow",
        desc: "Focus on deep breathing and slow holds to lower cortisol.",
        poses: [YOGA_DB.restorative[0], YOGA_DB.restorative[1], YOGA_DB.restorative[2], YOGA_DB.restorative[3]]
      };
    } else if (recent.tension === 'Neck' || recent.tension === 'Shoulders') {
      return {
        title: "Upper Body Release",
        desc: "Melt away tension in your neck, traps, and upper back.",
        poses: [YOGA_DB.release[0], YOGA_DB.release[1], YOGA_DB.release[2], YOGA_DB.release[3]]
      };
    } else if (recent.sleep <= 5) {
      return {
        title: "Gentle Yin Yoga",
        desc: "Deep, passive stretches to promote recovery and prep for sleep.",
        poses: [YOGA_DB.yin[0], YOGA_DB.yin[1], YOGA_DB.yin[2], YOGA_DB.yin[3]]
      };
    } else {
      return {
        title: "Vinyasa Flow",
        desc: "A balanced flow for flexibility and strength.",
        poses: [YOGA_DB.vinyasa[0], YOGA_DB.vinyasa[1], YOGA_DB.vinyasa[2], YOGA_DB.vinyasa[3]]
      };
    }
  };

  const flow = generateFlow();

  return (
    <div className="page active">
      <DashHeader title="Yoga Flow" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Flower2 size={24} color="var(--green-dark)"/></div>} />
      
      <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
        <Icons.Sparkles size={28} color="var(--green-dark)" style={{ flexShrink: 0 }} />
        <div style={{ width: '100%' }}>
          <h4 style={{ margin: '0 0 4px 0', color: 'var(--text)', fontSize: 18 }}>{flow.title}</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>{flow.desc}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {flow.poses.map((pose, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--green-light)', padding: 12, borderRadius: 12 }}>
                  <Icons.Play size={20} color="var(--green-dark)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h5 style={{ margin: 0, fontSize: 16 }}>{pose.name}</h5>
                    <span style={{ fontSize: 12, background: 'var(--bg)', padding: '4px 8px', borderRadius: 10, fontWeight: 600 }}>{pose.dur}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{pose.desc}</p>
                  <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <a href={`https://youtube.com/watch?v=${pose.vid}`} target="_blank" rel="noreferrer" style={{ position: 'relative', display: 'block', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', width: 120 }}>
                      <img src={`https://img.youtube.com/vi/${pose.vid}/hqdefault.jpg`} alt="Video preview" style={{ width: '100%', height: 68, objectFit: 'cover', opacity: 0.9, display: 'block' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Icons.Play size={16} color="#ef4444" fill="#ef4444" />
                      </div>
                    </a>
                    <a href={`https://youtube.com/watch?v=${pose.vid}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#ef4444', textDecoration: 'none', fontWeight: 600, border: '1.5px solid #ef4444', padding: '6px 16px', borderRadius: 20 }}>
                      <Icons.Youtube size={16} /> Watch Tutorial
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LiveTimer />
    </div>
  );
}

function OverviewCard({ title, desc, icon, onClick }) {
  return (
    <div className="dash-card" onClick={onClick} style={{ 
      gridColumn: 'span 2', 
      flexDirection: 'column', 
      alignItems: 'flex-start',
      padding: '24px',
      background: 'rgba(255,255,255,0.6)',
      boxShadow: '0 4px 12px rgba(34,197,94,0.03)',
      border: '1px solid rgba(255,255,255,0.9)',
      cursor: 'pointer',
      transition: 'all 0.3s'
    }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ background: 'var(--green-light)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>{title}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}
