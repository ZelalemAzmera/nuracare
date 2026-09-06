export type RecoveryState = 'Balanced' | 'Early Strain' | 'High Strain' | 'Recovery Needed';

export interface MaslachDimensions {
  workload: number;  // 1-10 (10 = crushing)
  control: number;   // 1-10 (1 = zero agency, 10 = full autonomy)
  reward: number;    // 1-10 (recognition & satisfaction)
  community: number; // 1-10 (supportive relationships)
  fairness: number;  // 1-10 (perceived equity)
  values: number;    // 1-10 (alignment with personal purpose)
}

export interface BurnoutAssessmentResult {
  state: RecoveryState;
  stateColor: string;
  readinessScore: number; // 0-100 (Recovery Readiness)
  exhaustionIndex: number; // 0-100
  dominantMismatchArea?: string;
  insights: string[];
  recommendedInterventionId: string;
  quietModeRecommended: boolean;
  escalationRequired: boolean;
}

export interface RecoveryMicroIntervention {
  id: string;
  category: 'Rest' | 'ClearHead' | 'Offline' | 'Move' | 'Connect' | 'Focus' | 'WindDown';
  title: string;
  subtitle: string;
  durationMin: number;
  iconName: string;
  scienceRationale: string; // Evidence-informed rationale (Nagoski / Leiter)
  steps: string[];
}

export const RECOVERY_INTERVENTIONS: Record<string, RecoveryMicroIntervention> = {
  rest: {
    id: 'rest',
    category: 'Rest',
    title: '15-Minute Restorative Reset',
    subtitle: 'Lie down flat with eyes closed without sleep pressure',
    durationMin: 15,
    iconName: 'Moon',
    scienceRationale: 'Non-Sleep Deep Rest (NSDR) restores striatal dopamine and lowers sympathetic nervous tone without grogginess.',
    steps: [
      'Find a quiet spot and lie flat on your back or recline comfortably.',
      'Place a hand on your abdomen and close your eyes.',
      'Allow your jaw to unclench and let your shoulders drop into the surface.',
      'Release any pressure to sleep or think productively. Just rest for 15 minutes.'
    ]
  },
  clear_head: {
    id: 'clear_head',
    category: 'ClearHead',
    title: '3-Minute Physiological Sigh & Sensory Unhook',
    subtitle: 'Double inhale through the nose, long slow exhale through mouth',
    durationMin: 3,
    iconName: 'Sparkles',
    scienceRationale: 'Completes the physiological stress response by rapidly offloading CO2 and activating the vagus nerve (Nagoski framework).',
    steps: [
      'Take two sharp inhales through your nose: one deep, then top it off with a second quick sniff.',
      'Exhale slowly and completely through your mouth until your lungs are empty.',
      'Repeat this sequence 4 to 5 times.',
      'Look at an object 20+ feet away and let your visual focus soften.'
    ]
  },
  offline: {
    id: 'offline',
    category: 'Offline',
    title: '10-Minute Digital Sunset',
    subtitle: 'Step away from all screens to restore divided attention',
    durationMin: 10,
    iconName: 'SmartphoneOff',
    scienceRationale: 'Continuous digital context-switching depletes prefrontal executive energy. Screen-free intervals restore attentional bandwidth.',
    steps: [
      'Place your phone face-down in another room or out of arm reach.',
      'Step to a window, balcony, or step outside into fresh air.',
      'Drink a full glass of cool water without looking at any device.',
      'Notice 3 ambient sounds around you without evaluating them.'
    ]
  },
  move: {
    id: 'move',
    category: 'Move',
    title: '5-Minute Somatic Stress Cycle Release',
    subtitle: 'Gentle spinal twists, shoulder rolls, and deep joint shakes',
    durationMin: 5,
    iconName: 'Flame',
    scienceRationale: 'Stress hormones require physical signaling to tell the body the perceived danger has ended (Burnout, Nagoski).',
    steps: [
      'Stand up and roll your shoulders backwards 10 times in slow, full circles.',
      'Gently shake out your hands, arms, and feet to release physical contraction.',
      'Do 5 slow torso rotations, letting your arms swing loosely around your waist.',
      'Take one full deep breath and celebrate giving your body relief.'
    ]
  },
  connect: {
    id: 'connect',
    category: 'Connect',
    title: 'Low-Pressure Connection Touchpoint',
    subtitle: 'Send one simple appreciation message to someone you trust',
    durationMin: 2,
    iconName: 'MessageCircle',
    scienceRationale: 'Safe social interaction is a biological signal of safety, mitigating the isolation dimension of burnout (Maslach).',
    steps: [
      'Think of one friend, family member, or colleague who brings you calm.',
      'Send a short, low-pressure text: "Thinking of you today! Hope you are having a peaceful afternoon."',
      'No need to start a long conversation—the act of reaching out signals relational safety.'
    ]
  },
  wind_down: {
    id: 'wind_down',
    category: 'WindDown',
    title: '10-Minute Chamomile & Dimming Ritual',
    subtitle: 'Low lighting, herbal tea (Damakese or Chamomile), zero work tasks',
    durationMin: 10,
    iconName: 'Coffee',
    scienceRationale: 'Dim light triggers pineal melatonin synthesis, signaling your nervous system that work demands have closed for the day.',
    steps: [
      'Dim bright overhead lights or switch to warm, low ambient lamps.',
      'Prepare a cup of warm Chamomile, Damakese, or warm water with lemon.',
      'Write down tomorrow’s single most important task on a physical notepad so your brain stops rehearsing it.',
      'Commit to zero work or screen checking for the remainder of the evening.'
    ]
  }
};

/**
 * 3-Day Recovery Plan structure for when strain remains elevated
 */
export const THREE_DAY_RECOVERY_PLAN = [
  {
    day: 1,
    title: 'Day 1: Decompress & Unload',
    objective: 'Interrupt the acute stress cycle and protect tonight’s sleep.',
    actions: [
      'Enable Sleep Mode 60 minutes earlier tonight',
      'Do a 5-minute somatic release after dinner',
      'Postpone 1 non-essential task until tomorrow'
    ]
  },
  {
    day: 2,
    title: 'Day 2: Reclaim Agency & Movement',
    objective: 'Restore the Workload/Control balance (Maslach framework).',
    actions: [
      'Take a 20-minute continuous walk outside',
      'Set one explicit boundary: no work messages during lunch',
      'Connect briefly with someone who makes you laugh'
    ]
  },
  {
    day: 3,
    title: 'Day 3: Realign & Restore',
    objective: 'Protect long-term energy and reconnect with what matters.',
    actions: [
      'Do 1 activity purely for joy (music, nature, cooking)',
      'Review your week’s top stressor and eliminate or delegate a portion of it',
      'Check in with NuraCare to evaluate your renewed recovery score'
    ]
  }
];

/**
 * Core Burnout & Recovery Evaluation Engine
 */
export function evaluateBurnoutAndRecovery(params: {
  dailyCheckin?: {
    sleep: number; // 1-10
    stress: number; // 1-10
    energy: number; // 1-10
    mood: number;   // 1-10
    drainLevel?: 'none' | 'little' | 'moderate' | 'very' | 'completely';
    manageability?: 'easy' | 'manageable' | 'difficult' | 'overwhelming';
    disconnectAbility?: 'yes' | 'somewhat' | 'not_really';
    meaningConnected?: 'yes' | 'somewhat' | 'not_today';
  };
  digitalUsage?: {
    totalScreenMinutes: number;
    socialMediaMinutes: number;
    lateNightMinutes: number;
  };
  maslach?: Partial<MaslachDimensions>;
}): BurnoutAssessmentResult {
  const checkin = params.dailyCheckin;
  const digital = params.digitalUsage;

  let exhaustionPoints = 0;
  let readiness = 100;
  const insights: string[] = [];

  // 1. Check-in signals (Subjective exhaustion & drain)
  if (checkin) {
    // Sleep deficit
    if (checkin.sleep < 5) {
      exhaustionPoints += 25;
      readiness -= 25;
      insights.push('Lower sleep duration is diminishing your physiological reserve.');
    } else if (checkin.sleep < 7) {
      exhaustionPoints += 10;
      readiness -= 10;
    }

    // Stress load
    if (checkin.stress >= 8) {
      exhaustionPoints += 30;
      readiness -= 30;
      insights.push('Reported stress has been elevated. Your nervous system is working in overdrive.');
    } else if (checkin.stress >= 6) {
      exhaustionPoints += 15;
      readiness -= 15;
    }

    // Manageability & Control (Maslach mismatch: Workload vs Control)
    if (checkin.manageability === 'overwhelming') {
      exhaustionPoints += 25;
      readiness -= 20;
      insights.push('Tasks feel overwhelming today. Consider renegotiating or deferring one non-essential task.');
    } else if (checkin.manageability === 'difficult') {
      exhaustionPoints += 12;
      readiness -= 10;
    }

    // Disconnect inability
    if (checkin.disconnectAbility === 'not_really') {
      exhaustionPoints += 15;
      readiness -= 15;
      insights.push('Boundary strain: You are finding it difficult to mentally disconnect after work.');
    }
  }

  // 2. Digital Load (Attention fragmentation & late-night screen time)
  if (digital) {
    if (digital.lateNightMinutes > 30) {
      exhaustionPoints += 15;
      readiness -= 15;
      insights.push('Late-night phone usage occurred simultaneously with reduced sleep quality.');
    }
    if (digital.socialMediaMinutes > 150) {
      exhaustionPoints += 10;
      readiness -= 10;
      insights.push('High digital volume today may be contributing to cognitive fatigue.');
    }
  }

  const finalReadiness = Math.min(100, Math.max(15, Math.round(readiness)));
  const finalExhaustion = Math.min(100, Math.max(5, Math.round(exhaustionPoints)));

  let state: RecoveryState = 'Balanced';
  let stateColor = '#16a34a'; // Emerald
  let quietModeRecommended = false;
  let recommendedInterventionId = 'clear_head';

  if (finalReadiness < 40 || finalExhaustion > 65) {
    state = 'Recovery Needed';
    stateColor = '#ef4444'; // Red
    quietModeRecommended = true;
    recommendedInterventionId = 'rest';
  } else if (finalReadiness < 60 || finalExhaustion > 45) {
    state = 'High Strain';
    stateColor = '#f97316'; // Orange
    quietModeRecommended = true;
    recommendedInterventionId = 'offline';
  } else if (finalReadiness < 75 || finalExhaustion > 25) {
    state = 'Early Strain';
    stateColor = '#f59e0b'; // Amber
    recommendedInterventionId = 'move';
  }

  return {
    state,
    stateColor,
    readinessScore: finalReadiness,
    exhaustionIndex: finalExhaustion,
    insights: insights.slice(0, 3),
    recommendedInterventionId,
    quietModeRecommended,
    escalationRequired: false
  };
}

export const MASLACH_AREAS = ['Workload', 'Control', 'Reward', 'Community', 'Fairness', 'Values'];
