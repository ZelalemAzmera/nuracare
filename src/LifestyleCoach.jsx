import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getCheckins } from './wellnessEngine';

const EXERCISE_DB = {
  legs: ['Barbell Squats', 'Bulgarian Split Squats', 'Leg Press', 'Romanian Deadlifts', 'Calf Raises', 'Lunges', 'Leg Extensions', 'Hamstring Curls'],
  push: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Pushups', 'Tricep Dips', 'Lateral Raises', 'Tricep Pushdowns', 'Chest Flyes'],
  pull: ['Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Seated Cable Rows', 'Face Pulls', 'Bicep Curls', 'Hammer Curls', 'Deadlifts'],
  core: ['Planks', 'Cable Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel Rollouts'],
  recovery: ['Foam Rolling', 'Light Cycling', 'Mobility Flow', 'Stretching']
};

const YOGA_DB = {
  vinyasa: ['Sun Salutation', 'Downward Dog', 'Warrior I', 'Warrior II', 'Triangle Pose', 'Chaturanga', 'Upward Dog'],
  restorative: ['Child\'s Pose', 'Corpse Pose (Savasana)', 'Supported Bridge', 'Legs-Up-The-Wall', 'Reclining Bound Angle'],
  release: ['Cat-Cow', 'Thread the Needle', 'Puppy Pose', 'Seated Neck Release', 'Eagle Arms'],
  yin: ['Butterfly Pose', 'Dragon Pose', 'Sleeping Swan', 'Sphinx Pose', 'Supported Fish Pose']
};

export default function LifestyleCoach() {
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

    if (recent.stress >= 7 || recent.mood <= 4) {
      setAnalysis({
        title: "De-Stress & Regulate",
        desc: "Your recent check-in indicates high tension. Focus on nervous system regulation and calming nutrition.",
        foods: ["Chamomile Tea", "Magnesium-rich spinach", "Ashwagandha", "Dark Chocolate"],
        exercise: "Restorative Yoga (15-30 mins)",
        focus: "calm"
      });
    } else if (recent.energy >= 7 && recent.sleep >= 6) {
      setAnalysis({
        title: "High Energy Flow",
        desc: "You are well-rested and energized. This is a great time to push your cardiovascular fitness or hit the gym.",
        foods: ["Complex carbs (Oats/Quinoa)", "Hydrating fruits (Watermelon/Berries)", "Lean protein"],
        exercise: "Running or Heavy Gym Session",
        focus: "energy"
      });
    } else if (recent.sleep <= 5 || recent.energy <= 4) {
      setAnalysis({
        title: "Active Recovery & Rest",
        desc: "Your energy is low. Avoid intense workouts. Focus on gentle movement and deep nutrition for recovery.",
        foods: ["Tart Cherry Juice (for sleep)", "Warm Turmeric Milk", "Bone Broth"],
        exercise: "Light Yoga or simple breathing exercises",
        focus: "sleep"
      });
    } else {
      setAnalysis({
        title: "Balanced Maintenance",
        desc: "You are in a stable state. Maintain your routine with a mix of cardio, flexibility, and balanced meals.",
        foods: ["Mixed nuts", "Leafy greens", "Fatty fish (Omega-3s)"],
        exercise: "Gym or a Moderate Run",
        focus: "balance"
      });
    }
  };

  // Routing
  if (activeSection === 'running') return <RunningDashboard onBack={() => setActiveSection('overview')} />;
  if (activeSection === 'yoga') return <YogaDashboard onBack={() => setActiveSection('overview')} recent={recentData} />;
  if (activeSection === 'gym') return <GymDashboard onBack={() => setActiveSection('overview')} recent={recentData} />;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lifestyle & Nutrition</h1>
          <p className="page-subtitle">AI-driven habits, workouts, and natural remedies</p>
        </div>
      </div>

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
          title="Yoga Flow" desc="Guided sessions based on your body tension."
          icon={<Icons.Flower2 size={28} color="var(--green-dark)" />}
          onClick={() => setActiveSection('yoga')}
        />

      </div>
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

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(34,197,94,0.04)', textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'monospace', color: isActive ? 'var(--green-dark)' : 'var(--text)', marginBottom: 16 }}>
        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </div>
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
    </div>
  );
}

/* --- RUNNING --- */
function RunningDashboard({ onBack }) {
  const [distance, setDistance] = useState('');
  
  return (
    <div className="page active">
      <DashHeader title="Running Tracker" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Navigation size={24} color="var(--green-dark)"/></div>} />
      
      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 3' }}>
          <LiveTimer />
        </div>
        <div className="dash-card" style={{ gridColumn: 'span 3', background: 'var(--white)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <label style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Distance Logged (km)</label>
          <input 
            type="number" 
            placeholder="e.g. 5.2" 
            value={distance} 
            onChange={(e) => setDistance(e.target.value)}
            style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: '1.5px solid var(--border)', fontSize: 20, fontWeight: 600, outline: 'none' }}
          />
          <button style={{ marginTop: 24, background: 'var(--green)', color: 'white', border: 'none', padding: 16, borderRadius: 16, fontWeight: 600, cursor: 'pointer' }}>
            Save Run
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- GYM --- */
function GymDashboard({ onBack, recent }) {
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  
  // Dynamic Workout Generator
  const generateWorkout = () => {
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

      <div className="dash-card" style={{ background: 'var(--white)', padding: 32 }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: 18 }}>Log Set</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Exercise Type</label>
            <input 
              type="text" 
              list="exercise-list"
              placeholder="e.g. Barbell Squats" 
              value={exercise} 
              onChange={(e)=>setExercise(e.target.value)} 
              style={{ width: '100%', padding: 14, borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15 }} 
            />
            <datalist id="exercise-list">
              {allExercises.map(ex => <option key={ex} value={ex} />)}
            </datalist>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Reps x Weight</label>
            <input type="text" placeholder="e.g. 10x 60kg" value={reps} onChange={(e)=>setReps(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 15 }} />
          </div>
        </div>
        <button style={{ marginTop: 24, width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 16, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
          Add Set to Workout
        </button>
      </div>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {flow.poses.map((pose, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Icons.Target size={16} color="var(--green-dark)" /> {pose}
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
