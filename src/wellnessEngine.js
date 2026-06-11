// src/wellnessEngine.js

const STORAGE_KEY = 'nuracare_wellness_checkins';

export function getCheckins() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse wellness check-ins", e);
    return [];
  }
}

// Save a new check-in (overwrites existing for the same date)
export function saveCheckin(entry) {
  const checkins = getCheckins();
  const dateStr = entry.date || new Date().toISOString().split('T')[0];
  
  const newEntry = {
    ...entry,
    date: dateStr,
    timestamp: entry.timestamp || Date.now()
  };

  const existingIndex = checkins.findIndex(c => c.date === dateStr);
  if (existingIndex >= 0) {
    checkins[existingIndex] = newEntry;
  } else {
    checkins.push(newEntry);
  }

  // Keep last 365 days
  if (checkins.length > 365) {
    checkins.shift();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkins));
  return newEntry;
}

// Compute Burnout Risk (0-100)
// Higher score = higher risk
export function computeBurnoutRisk(checkin) {
  if (!checkin) return { score: 0, label: 'Low', color: '#22c55e' };

  // Invert sleep, mood, energy (low = bad)
  const invSleep = 10 - checkin.sleep;
  const invEnergy = 10 - checkin.energy;
  const invMood = 10 - checkin.mood;

  const score = (
    invSleep * 0.30 +
    checkin.stress * 0.35 +
    invEnergy * 0.20 +
    invMood * 0.15
  ) * 10;

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let label = 'Low Risk';
  let color = '#22c55e'; // Green

  if (finalScore > 65) {
    label = 'High Risk';
    color = '#ef4444'; // Red
  } else if (finalScore > 30) {
    label = 'Moderate Risk';
    color = '#f59e0b'; // Amber
  }

  return { score: finalScore, label, color };
}

// Compute Wellness Score (0-100)
// Higher score = better wellness
export function computeWellnessScore(checkin) {
  if (!checkin) return { score: 85, label: 'Good', color: '#22c55e' };

  const invStress = 10 - checkin.stress;

  const score = (
    checkin.sleep * 0.30 +
    checkin.mood * 0.25 +
    checkin.energy * 0.25 +
    invStress * 0.20
  ) * 10;

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let label = 'Excellent';
  let color = '#22c55e';

  if (finalScore < 40) {
    label = 'Needs Attention';
    color = '#ef4444';
  } else if (finalScore < 70) {
    label = 'Fair';
    color = '#f59e0b';
  }

  return { score: finalScore, label, color };
}

// Compute 5-Core Wellness Score (0-100)
export function compute5CoreWellness(checkin, profile = {}) {
  if (!checkin) {
    return {
      total: 0,
      label: 'Needs Data',
      color: '#cbd5e1',
      cores: { physical: 0, mental: 0, recovery: 0, nutrition: 0, preventive: 0 }
    };
  }

  // 1. Physical Vitality
  let physical = Math.round((checkin.energy * 10 + (checkin.activity === 'Active' ? 10 : checkin.activity === 'Moderate' ? 5 : 0)) / 1.1);

  // 2. Mental Resilience
  const invStress = 10 - checkin.stress;
  let mental = Math.round((checkin.mood * 5 + invStress * 5));

  // 3. Recovery & Sleep
  let recovery = Math.round((checkin.sleep * 10));

  // 4. Nutrition & Hydration
  let nutrition = checkin.hydration ? Math.round(checkin.hydration * 10) : 80;

  // 5. Preventive Maintenance
  let preventive = profile.records && profile.records.length > 0 ? 90 : 60;

  physical = Math.min(100, Math.max(0, physical));
  mental = Math.min(100, Math.max(0, mental));
  recovery = Math.min(100, Math.max(0, recovery));
  
  const total = Math.round((physical + mental + recovery + nutrition + preventive) / 5);

  let label = 'Optimal';
  let color = '#22c55e';
  if (total < 40) { label = 'Needs Attention'; color = '#ef4444'; }
  else if (total < 70) { label = 'Fair'; color = '#f59e0b'; }

  return { total, label, color, cores: { physical, mental, recovery, nutrition, preventive } };
}

// Generate personalized recovery recommendations
export function getRecoveryRecommendations(checkins) {
  if (!checkins || checkins.length === 0) return ["Complete a daily check-in to get personalized recommendations."];

  const recommendations = [];
  const latest = checkins[checkins.length - 1];
  const burnout = computeBurnoutRisk(latest);

  // Check recent trends (last 3 days)
  const recent = checkins.slice(-3);
  const avgSleep = recent.reduce((sum, c) => sum + c.sleep, 0) / recent.length;
  const avgStress = recent.reduce((sum, c) => sum + c.stress, 0) / recent.length;

  if (burnout.score > 65) {
    recommendations.push("🚨 Your burnout risk is elevated. Reduce non-essential tasks today and prioritize recovery.");
  }

  if (latest.stress > 7 || avgStress > 7) {
    recommendations.push("🧘 Your stress levels are high. Try the 5-5 breathing exercise in the Lifestyle tab.");
  }

  if (latest.sleep < 5 || avgSleep < 6) {
    recommendations.push("🌙 You've been lacking sleep. Try to go to bed 30 minutes earlier tonight and reduce screen time.");
  }

  if (latest.energy < 4) {
    recommendations.push("⚡ Your energy is low. Schedule a 5-minute micro-break every 90 minutes today.");
  }

  if (latest.mood < 4) {
    recommendations.push("🚶 Sunlight can naturally boost mood. Try to get 15 minutes of outdoor light today.");
  }

  if (recommendations.length === 0) {
    recommendations.push("✨ You're doing great! Keep up the good habits and maintain your routine.");
  }

  return recommendations;
}
