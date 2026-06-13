import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getCheckins } from './wellnessEngine';
import { TSOM_TYPES, isFastingToday, getCurrentFastName } from './ethiopianCalendar';
import { fetchNearbyGyms, fetchFoodNutrition } from './liveApis';

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
    alert('Vitals saved to history!');
  };

  // Routing
  if (activeSection === 'running') return <RunningDashboard onBack={() => setActiveSection('overview')} />;
  if (activeSection === 'yoga') return <YogaDashboard onBack={() => setActiveSection('overview')} recent={recentData} />;
  if (activeSection === 'gym') return <GymDashboard onBack={() => setActiveSection('overview')} recent={recentData} profile={profile} />;
  if (activeSection === 'nutrition') return <NutritionDashboard onBack={() => setActiveSection('overview')} profile={profile} />;

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

      {/* AI Suggestion Board */}
      <div className="section-title">✨ Personalized AI Insights</div>
      {analysis && (
        <div className="dash-card card-large" style={{ 
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 32px rgba(34,197,94,0.06)',
          marginBottom: 32,
        }}>
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
        
        <OverviewCard 
          title="Running Tracker" desc="Track your outdoor runs or treadmill distance."
          icon={<Icons.Navigation size={28} color="var(--green-dark)" />}
          onClick={() => setActiveSection('running')}
        />

        <OverviewCard 
          title="Gym & Strength" desc="Log sets, reps, and get routine suggestions."
          icon={<Icons.Dumbbell size={28} color="var(--green-dark)" />}
          onClick={() => setActiveSection('gym')}
        />

        <OverviewCard 
          title="Nutrition & Fasting" desc="Log your meals, macros, and track fasting rules."
          icon={<Icons.Utensils size={28} color="var(--green-dark)" />}
          onClick={() => setActiveSection('nutrition')}
        />

        <OverviewCard 
          title="Yoga Flow" desc="Guided sessions based on your body tension."
          icon={<Icons.Flower2 size={28} color="var(--green-dark)" />}
          onClick={() => setActiveSection('yoga')}
        />

      </div>

      <div className="section-title" style={{ marginTop: 32 }}>❤️ Vitals & Hydration</div>
      
      <div className="dash-card" style={{ background: 'var(--white)', padding: 32, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18, textAlign: 'center' }}>Sync Your Vitals</h3>
        <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Automatically import heart rate, steps, and weight from your smart device.</p>
        
        <button onClick={() => alert("Syncing wearable...")} style={{ width: '100%', background: 'var(--bg)', color: 'var(--green-dark)', border: '2px solid var(--green)', padding: 16, borderRadius: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <Icons.Watch size={20} /> Sync Wearable Device
        </button>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-muted)' }}>No wearable device? Log Manually:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <div className="dash-card" style={{ background: 'var(--bg)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-muted)' }}>
                <Icons.Footprints size={18} color="var(--green-dark)" /> Steps
              </div>
              <input type="number" value={vitals.steps || ''} onChange={(e) => updateVital('steps', e.target.value)} placeholder="0" style={{ width: '100%', fontSize: 24, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none' }} />
            </div>
            
            <div className="dash-card" style={{ background: 'var(--bg)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-muted)' }}>
                <Icons.HeartPulse size={18} color="#ef4444" /> Heart Rate (bpm)
              </div>
              <input type="number" value={vitals.hr || ''} onChange={(e) => updateVital('hr', e.target.value)} placeholder="0" style={{ width: '100%', fontSize: 24, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none' }} />
            </div>

            <div className="dash-card" style={{ background: 'var(--bg)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-muted)' }}>
                <Icons.Scale size={18} color="#6366f1" /> Weight (kg)
              </div>
              <input type="number" value={vitals.weight || ''} onChange={(e) => updateVital('weight', e.target.value)} placeholder="0.0" style={{ width: '100%', fontSize: 24, fontWeight: 800, border: 'none', background: 'transparent', outline: 'none' }} />
            </div>

            <div className="dash-card" style={{ background: 'var(--bg)', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Droplets size={18} color="#0ea5e9" /> Water</span>
                <span style={{ fontWeight: 800 }}>{vitals.water}/8</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[1,2,3,4,5,6,7,8].map(glass => (
                  <div 
                    key={glass} 
                    onClick={() => updateVital('water', glass === vitals.water ? glass - 1 : glass)}
                    style={{ 
                      width: 28, height: 36, borderRadius: '4px 4px 12px 12px', 
                      background: glass <= vitals.water ? '#0ea5e9' : 'var(--white)', 
                      cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSaveVitals} style={{ width: '100%', marginTop: 24, background: 'var(--green)', color: 'white', border: 'none', padding: 16, borderRadius: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icons.Save size={18} /> Save Manual Vitals
          </button>
        </div>
      </div>

      {vitalsHistory.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Vitals History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {vitalsHistory.map((v, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--green-dark)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{v.date}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v.time}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Steps:</span> <span>{v.steps || 0}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>HR:</span> <span>{v.hr || 0} bpm</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Weight:</span> <span>{v.weight || 0} kg</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Water:</span> <span>{v.water || 0}/8</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   DASHBOARD COMPONENTS
-------------------------------------------------------------------------- */

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

  const handleReset = () => {
    setIsActive(false);
    setTimer(0);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(34,197,94,0.04)', textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'monospace', color: isActive ? 'var(--green-dark)' : 'var(--text)', marginBottom: 16 }}>
        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button 
          onClick={() => setIsActive(!isActive)}
          style={{ 
            background: isActive ? '#ef4444' : 'var(--green)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 32px', 
            borderRadius: 24, 
            fontWeight: 600, 
            fontSize: 16, 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            boxShadow: `0 8px 24px ${isActive ? '#ef444466' : 'rgba(34,197,94,0.3)'}` 
          }}
        >
          {isActive ? 'Stop Session' : 'Start Session'}
        </button>
        {(!isActive && timer > 0) && (
          <button 
            onClick={handleReset}
            style={{ background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', padding: '12px 24px', borderRadius: 24, fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* --- RUNNING --- */
function RunningDashboard({ onBack }) {
  const [distance, setDistance] = useState('');
  const [history, setHistory] = useState([]);

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
  
  return (
    <div className="page active">
      <DashHeader title="Running Tracker" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Navigation size={24} color="var(--green-dark)"/></div>} />
      
      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 3' }}>
          <LiveTimer />
        </div>
        <div className="dash-card" style={{ gridColumn: 'span 3', background: 'var(--white)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, textAlign: 'center' }}>Sync Your Activity</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Automatically import your runs from your smartwatch or fitness tracker.</p>
          
          <button onClick={() => alert("Syncing wearable data...")} style={{ width: '100%', background: 'var(--bg)', color: 'var(--green-dark)', border: '2px solid var(--green)', padding: 16, borderRadius: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            <Icons.Watch size={20} /> Sync Wearable Device
          </button>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)', display: 'block' }}>No wearable device? Enter manually:</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="number" 
                placeholder="Distance (km)" 
                value={distance} 
                onChange={(e) => setDistance(e.target.value)}
                style={{ flex: 2, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 16, fontWeight: 600, outline: 'none' }}
              />
              <button onClick={handleSaveRun} style={{ flex: 1, background: 'var(--green)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Recent Runs</h3>
          {history.map(r => (
            <div key={r.id} style={{ background: 'var(--white)', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{r.date}</span>
              <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>{r.distance} km</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- GYM --- */
function GymDashboard({ onBack, recent, profile }) {
  const [exercise, setExercise] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [loggedSets, setLoggedSets] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState('legs');
  const [warning, setWarning] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState([]);

  useEffect(() => {
    // Recovery warning logic
    const workouts = JSON.parse(localStorage.getItem('nuracare_workouts') || '[]');
    setWorkoutHistory(workouts.filter(w => w.type === 'gym').reverse());
    if (workouts.length >= 3) {
      const recentWorkouts = workouts.slice(-3);
      // simplified check: just check if all last 3 workouts had 'legs' or similar
      // A more robust check:
      let legCount = 0;
      let pushCount = 0;
      let pullCount = 0;
      recentWorkouts.forEach(w => {
        if (!w.sets) return;
        if (w.sets.some(s => EXERCISE_DB.legs.includes(s.exercise))) legCount++;
        if (w.sets.some(s => EXERCISE_DB.push.includes(s.exercise))) pushCount++;
        if (w.sets.some(s => EXERCISE_DB.pull.includes(s.exercise))) pullCount++;
      });
      if (legCount >= 3 && selectedMuscle === 'legs') setWarning('You have trained legs 3 times recently. Consider resting them today.');
      else if (pushCount >= 3 && selectedMuscle === 'push') setWarning('You have trained push muscles 3 times recently. Consider a pull or leg day.');
      else if (pullCount >= 3 && selectedMuscle === 'pull') setWarning('You have trained pull muscles 3 times recently. Consider a push or leg day.');
      else setWarning('');
    }
  }, [selectedMuscle]);
  
  const handleAddSet = () => {
    if (!exercise || !repsInput) return;
    const repStr = weightInput ? `${repsInput} reps @ ${weightInput}kg` : `${repsInput} reps`;
    setLoggedSets([...loggedSets, { id: Date.now(), exercise, reps: repStr }]);
    setExercise('');
    setRepsInput('');
    setWeightInput('');
  };

  const handleSaveWorkout = () => {
    if (loggedSets.length === 0) return;
    const workouts = JSON.parse(localStorage.getItem('nuracare_workouts') || '[]');
    const newWorkout = { id: Date.now(), date: new Date().toLocaleDateString(), type: 'gym', sets: loggedSets };
    workouts.push(newWorkout);
    localStorage.setItem('nuracare_workouts', JSON.stringify(workouts));
    setWorkoutHistory([newWorkout, ...workoutHistory]);
    setLoggedSets([]);
    alert('Workout saved successfully!');
  };

  // Dynamic Workout Generator
  const generateWorkout = () => {
    const isEthiopia = profile?.location?.code === 'ET' || profile?.location?.country === 'Ethiopia';
    
    if (isEthiopia) {
      return {
        title: "Gym-Less Everyday Movement",
        desc: "No gym nearby? Use your bodyweight to build functional strength.",
        exercises: ["Bodyweight Squats", "Pushups", "Pull-ups (or Doorway Rows)", "Planks"]
      };
    }

    if (!recent) return { title: "Full Body Foundation", exercises: [EXERCISE_DB.legs[0], EXERCISE_DB.push[3], EXERCISE_DB.pull[1], EXERCISE_DB.core[0]] };
    
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
  const allExercises = [...EXERCISE_DB.legs, ...EXERCISE_DB.push, ...EXERCISE_DB.pull, ...EXERCISE_DB.core, ...EXERCISE_DB.recovery].sort();

  return (
    <div className="page active">
      <DashHeader title="Gym & Strength" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Dumbbell size={24} color="var(--green-dark)"/></div>} />
      
      <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
        <Icons.BrainCircuit size={28} color="var(--green-dark)" style={{ flexShrink: 0 }} />
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: '0 0 4px 0', color: 'var(--text)', fontSize: 18 }}>{workout.title}</h4>
            {profile?.location?.code !== 'ET' && profile?.location?.country !== 'Ethiopia' && (
              <a href="https://www.google.com/maps/search/gyms+near+me/" target="_blank" rel="noreferrer" className="btn-outline-sm" style={{ display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}>
                <Icons.MapPin size={14} /> Find Nearby Gyms
              </a>
            )}
          </div>
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

      {profile?.location?.code !== 'ET' && profile?.location?.country !== 'Ethiopia' && (
        <LiveGymFinder profile={profile} />
      )}

      <div className="dash-card" style={{ background: 'var(--white)', padding: 32 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18, textAlign: 'center' }}>Sync Workout Data</h3>
        <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Automatically pull sets and reps from your wearable device.</p>
        
        <button onClick={() => alert("Syncing workout from wearable...")} style={{ width: '100%', background: 'var(--bg)', color: 'var(--green-dark)', border: '2px solid var(--green)', padding: 16, borderRadius: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <Icons.Watch size={20} /> Sync Wearable Device
        </button>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-muted)' }}>No wearable device? Log Manually:</h3>
        
        {warning && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Icons.AlertTriangle size={16} /> {warning}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
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
          <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-end', border: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Tap to log grid:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Reps" value={repsInput} onChange={(e)=>setRepsInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 16, fontWeight: 700 }} />
                <input type="number" placeholder="Weight (kg)" value={weightInput} onChange={(e)=>setWeightInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 16, fontWeight: 700 }} />
              </div>
            </div>
            <button onClick={handleAddSet} disabled={!repsInput} style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: repsInput ? 'pointer' : 'not-allowed', opacity: repsInput ? 1 : 0.5 }}>
              <Icons.Plus size={20} />
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
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#000', height: 200 }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${pose.vid}?controls=1&modestbranding=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      style={{ display: 'block' }}
                    ></iframe>
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

/* --- LIVE GYM FINDER --- */
function LiveGymFinder({ profile }) {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const results = await fetchNearbyGyms(pos.coords.latitude, pos.coords.longitude);
            setGyms(results);
          } catch { setError('Failed to fetch gyms.'); }
          setLoading(false);
        },
        () => { setError('GPS permission denied.'); setLoading(false); }
      );
    } else {
      setError('Geolocation not supported.'); setLoading(false);
    }
  }, []);

  return (
    <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, border: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Map size={20} color="var(--green-dark)" /> Gym & Studio Finder</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)' }}>Live results from OpenStreetMap near {profile?.location?.city || 'your location'}:</p>
      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}><Icons.Loader className="spin" size={16} style={{ marginRight: 8 }} />Searching nearby fitness centers...</p>}
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {!loading && gyms.length === 0 && !error && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No fitness facilities found nearby. Try expanding your search radius.</p>}
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {gyms.map((gym, i) => (
          <div key={i} style={{ minWidth: 210, background: 'var(--white)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: 15 }}>{gym.name}</h5>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{gym.type}</div>
            <div style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 12 }}>{gym.distance}</div>
            <a href={gym.directionsUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', textAlign: 'center', background: 'var(--green-light)', color: 'var(--green-dark)', border: 'none', padding: '8px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>Directions</a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- NUTRITION DASHBOARD --- */
function NutritionDashboard({ onBack, profile }) {
  const isEthiopia = profile?.location?.code === 'ET' || profile?.location?.country === 'Ethiopia';
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [logged, setLogged] = useState(() => JSON.parse(localStorage.getItem('nuracare_nutrition_log') || '[]'));

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const data = await fetchFoodNutrition(searchQuery);
    setResults(data);
    setSearching(false);
  };

  const logFood = (food) => {
    const entry = { ...food, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updated = [entry, ...logged];
    setLogged(updated);
    localStorage.setItem('nuracare_nutrition_log', JSON.stringify(updated));
    setResults([]);
    setSearchQuery('');
  };

  return (
    <div className="page active">
      <DashHeader title="Nutrition Tracker" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Utensils size={24} color="var(--green-dark)"/></div>} />
      
      {isEthiopia && (
        <div className="dash-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Icons.PieChart size={24} color="var(--green-dark)" />
            <h3 style={{ margin: 0 }}>Gebeta Fractional Logging</h3>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>In Ethiopia, communal eating is standard. Log your meals by estimating the fraction of the Gebeta you consumed.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['1/4 Gebeta', '1/2 Gebeta', '3/4 Gebeta', 'Full Gebeta'].map(fraction => (
              <button key={fraction} style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--green)', background: 'var(--white)', color: 'var(--green-dark)', fontWeight: 600, cursor: 'pointer' }}>
                {fraction}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Active Fasting Rules</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>Tsom is active today. Ensure your plate contains no meat, dairy, or eggs. Recommended: Shiro, Gomen, and Misir.</p>
          </div>
        </div>
      )}

      <div className="dash-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Icons.Database size={24} color="var(--green-dark)" />
          <h3 style={{ margin: 0 }}>Global Macro Tracker</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Powered by OpenFoodFacts — the world's largest open food database. Search real products and log exact macronutrients.</p>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search foods (e.g. 'Chicken Breast', 'Oats')" style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 15 }} />
          <button onClick={handleSearch} disabled={searching} style={{ background: 'var(--text)', color: 'white', border: 'none', padding: '0 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{searching ? 'Searching...' : 'Search'}</button>
        </div>
        
        {results.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15 }}>Results (per 100g)</h4>
            {results.map((food, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 12, marginBottom: 8, border: '1px solid var(--border)' }}>
                {food.image && <img src={food.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{food.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{food.brand} • {food.serving}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12 }}>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>{food.calories} kcal</span>
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>
                </div>
                <button onClick={() => logFood(food)} style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Log</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {logged.length > 0 && (
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Today's Log</h3>
          {logged.slice(0, 10).map((entry, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{entry.name} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({entry.time})</span></span>
              <span style={{ fontWeight: 600 }}>{entry.calories} kcal</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 700, fontSize: 15, color: 'var(--green-dark)' }}>
            <span>Total</span>
            <span>{logged.reduce((sum, e) => sum + (e.calories || 0), 0)} kcal</span>
          </div>
        </div>
      )}
    </div>
  );
}

