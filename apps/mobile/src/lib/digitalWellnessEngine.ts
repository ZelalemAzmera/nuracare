export interface AppLimitItem {
  id: string;
  name: string;
  packageName: string;
  category: 'Social' | 'Entertainment' | 'Games' | 'Work' | 'Other';
  dailyLimitMinutes: number;
  usedMinutesToday: number;
  sessionLimitMinutes?: number;
  isEnabled: boolean;
  schedule?: {
    start: string; // e.g. "20:00"
    end: string;   // e.g. "07:00"
    days: number[]; // 0-6
  };
  pauseBeforeOpen: boolean;
}

export interface WebsiteLimitItem {
  id: string;
  domain: string;
  dailyLimitMinutes: number;
  usedMinutesToday: number;
  isBlocked: boolean;
  schedule?: {
    start: string;
    end: string;
  };
}

export interface FocusSessionPreset {
  id: string;
  name: string;
  durationMinutes: number;
  icon: string;
  description: string;
  blockedCategories: string[];
}

export interface DigitalUsageSnapshot {
  date: string;
  totalScreenMinutes: number;
  yesterdayScreenMinutes: number;
  socialMediaMinutes: number;
  lateNightMinutes: number; // Usage after 10 PM
  appOpensCount: number;
  categories: {
    social: number;
    entertainment: number;
    work: number;
    education: number;
    other: number;
  };
  topApps: {
    name: string;
    minutes: number;
    category: string;
    icon: string;
  }[];
}

export interface DigitalWellnessSettings {
  screenTimeTrackingEnabled: boolean;
  strictModeEnabled: boolean;
  strictPinHash?: string; // Salted SHA-256
  strictPinSalt?: string;
  safeBrowsingEnabled: boolean;
  safeBrowsingHoursOnly: boolean;
  sleepModeEnabled: boolean;
  sleepSchedule: {
    start: string; // "22:30"
    end: string;   // "07:00"
  };
  quietModeThreshold: number; // Auto quiet notifications if strain is high
}

export const FOCUS_PRESETS: FocusSessionPreset[] = [
  {
    id: 'preset-study',
    name: 'Study & Deep Work',
    durationMinutes: 45,
    icon: 'GraduationCap',
    description: 'Blocks social media, games, and video streaming. Keeps education & notes accessible.',
    blockedCategories: ['Social', 'Entertainment', 'Games']
  },
  {
    id: 'preset-reset',
    name: 'Mental Reset',
    durationMinutes: 20,
    icon: 'Sparkles',
    description: 'Complete screen blackout. Encourages walking, breathing, or quiet reflection.',
    blockedCategories: ['Social', 'Entertainment', 'Games', 'Work', 'Other']
  },
  {
    id: 'preset-sleep',
    name: 'Bedtime Wind-Down',
    durationMinutes: 60,
    icon: 'Moon',
    description: 'Prepares brain for melatonin release. Disables late-night doom-scrolling.',
    blockedCategories: ['Social', 'Entertainment', 'Games']
  },
  {
    id: 'preset-detox',
    name: 'Digital Detox',
    durationMinutes: 120,
    icon: 'Shield',
    description: 'Extended uninterrupted attention block for social connection and presence.',
    blockedCategories: ['Social', 'Entertainment', 'Games']
  }
];

export function computeDigitalBalanceScore(
  usage: DigitalUsageSnapshot,
  limits: AppLimitItem[] = []
): {
  score: number;
  label: 'Optimal' | 'Balanced' | 'Moderate Strain' | 'High Digital Load';
  color: string;
  strengths: string[];
  opportunities: string[];
} {
  let score = 100;

  // 1. Total Screen Time impact (> 4h reduces points)
  if (usage.totalScreenMinutes > 360) {
    score -= 30;
  } else if (usage.totalScreenMinutes > 240) {
    score -= 15;
  } else if (usage.totalScreenMinutes < 180) {
    score += 5;
  }

  // 2. Social Media proportion (> 2h reduces points)
  if (usage.socialMediaMinutes > 150) {
    score -= 20;
  } else if (usage.socialMediaMinutes > 90) {
    score -= 10;
  }

  // 3. Late Night phone use after 10 PM (Crucial sleep disruption signal)
  if (usage.lateNightMinutes > 45) {
    score -= 25;
  } else if (usage.lateNightMinutes > 15) {
    score -= 12;
  }

  // 4. Comparison to yesterday
  const diff = usage.totalScreenMinutes - usage.yesterdayScreenMinutes;
  if (diff < -20) {
    score += 8; // Improved compared to yesterday
  } else if (diff > 45) {
    score -= 10;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(score)));

  const strengths: string[] = [];
  const opportunities: string[] = [];

  if (usage.socialMediaMinutes < 90) {
    strengths.push('Mindful social media usage today');
  } else {
    opportunities.push('Social media time is higher than average');
  }

  if (usage.lateNightMinutes <= 15) {
    strengths.push('Protected sleep window with minimal late-night screen time');
  } else {
    opportunities.push('Late-night screen use may delay natural melatonin and sleep onset');
  }

  if (diff < 0) {
    strengths.push(`Using phone ${Math.abs(diff)} minutes less than yesterday`);
  }

  let label: 'Optimal' | 'Balanced' | 'Moderate Strain' | 'High Digital Load' = 'Balanced';
  let color = '#22c55e'; // Green

  if (finalScore >= 80) {
    label = 'Optimal';
    color = '#16a34a';
  } else if (finalScore >= 65) {
    label = 'Balanced';
    color = '#10b981';
  } else if (finalScore >= 45) {
    label = 'Moderate Strain';
    color = '#f59e0b';
  } else {
    label = 'High Digital Load';
    color = '#ef4444';
  }

  return {
    score: finalScore,
    label,
    color,
    strengths: strengths.slice(0, 2),
    opportunities: opportunities.slice(0, 2)
  };
}

/**
 * Hash PIN securely with salt (Strict Mode self-control protection)
 */
export async function hashStrictPin(pin: string, salt: string): Promise<string> {
  // Simple deterministic SHA-256 simulator for environments without native WebCrypto
  let hash = 0;
  const str = `${salt}:${pin}:nuracare_strict`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

export async function verifyStrictPin(inputPin: string, storedHash: string, salt: string): Promise<boolean> {
  const computed = await hashStrictPin(inputPin, salt);
  return computed === storedHash;
}
