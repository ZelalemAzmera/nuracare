import { storage } from './mmkv';
import {
  AppLimitItem,
  WebsiteLimitItem,
  DigitalUsageSnapshot,
  DigitalWellnessSettings
} from '../lib/digitalWellnessEngine';

const USAGE_KEY = 'nuracare_digital_usage';
const APP_LIMITS_KEY = 'nuracare_app_limits';
const WEB_LIMITS_KEY = 'nuracare_web_limits';
const SETTINGS_KEY = 'nuracare_digital_settings';

const DEFAULT_USAGE: DigitalUsageSnapshot = {
  date: new Date().toISOString().split('T')[0],
  totalScreenMinutes: 258, // 4h 18m
  yesterdayScreenMinutes: 282, // 4h 42m (-24m)
  socialMediaMinutes: 102, // 1h 42m
  lateNightMinutes: 38,
  appOpensCount: 64,
  categories: {
    social: 102,
    entertainment: 58,
    work: 72,
    education: 26,
    other: 32
  },
  topApps: [
    { name: 'Instagram', minutes: 45, category: 'Social', icon: 'Camera' },
    { name: 'YouTube', minutes: 35, category: 'Entertainment', icon: 'Youtube' },
    { name: 'TikTok', minutes: 22, category: 'Social', icon: 'Music' },
    { name: 'Telegram', minutes: 28, category: 'Social', icon: 'MessageCircle' }
  ]
};

const DEFAULT_LIMITS: AppLimitItem[] = [
  {
    id: 'limit-social',
    name: 'Social Media (Total)',
    packageName: 'all.social',
    category: 'Social',
    dailyLimitMinutes: 60,
    usedMinutesToday: 48,
    isEnabled: true,
    pauseBeforeOpen: true
  },
  {
    id: 'limit-tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    category: 'Social',
    dailyLimitMinutes: 20,
    usedMinutesToday: 22, // Over limit
    sessionLimitMinutes: 15,
    isEnabled: true,
    pauseBeforeOpen: true
  },
  {
    id: 'limit-instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'Social',
    dailyLimitMinutes: 35,
    usedMinutesToday: 30,
    isEnabled: true,
    pauseBeforeOpen: true
  },
  {
    id: 'limit-youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'Entertainment',
    dailyLimitMinutes: 60,
    usedMinutesToday: 35,
    isEnabled: false,
    pauseBeforeOpen: false
  }
];

const DEFAULT_WEB_LIMITS: WebsiteLimitItem[] = [
  { id: 'web-1', domain: 'tiktok.com', dailyLimitMinutes: 15, usedMinutesToday: 5, isBlocked: false },
  { id: 'web-2', domain: 'reddit.com', dailyLimitMinutes: 30, usedMinutesToday: 12, isBlocked: false },
  { id: 'web-3', domain: 'x.com', dailyLimitMinutes: 20, usedMinutesToday: 18, isBlocked: false }
];

const DEFAULT_SETTINGS: DigitalWellnessSettings = {
  screenTimeTrackingEnabled: true,
  strictModeEnabled: false,
  safeBrowsingEnabled: true,
  safeBrowsingHoursOnly: true,
  sleepModeEnabled: true,
  sleepSchedule: {
    start: '22:30',
    end: '07:00'
  },
  quietModeThreshold: 70
};

export function getDigitalUsage(): DigitalUsageSnapshot {
  const data = storage.getString(USAGE_KEY);
  if (!data) {
    storage.set(USAGE_KEY, JSON.stringify(DEFAULT_USAGE));
    return DEFAULT_USAGE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_USAGE;
  }
}

export function saveDigitalUsage(usage: DigitalUsageSnapshot): void {
  storage.set(USAGE_KEY, JSON.stringify(usage));
}

export function getAppLimits(): AppLimitItem[] {
  const data = storage.getString(APP_LIMITS_KEY);
  if (!data) {
    storage.set(APP_LIMITS_KEY, JSON.stringify(DEFAULT_LIMITS));
    return DEFAULT_LIMITS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_LIMITS;
  }
}

export function updateAppLimit(updated: AppLimitItem): void {
  const limits = getAppLimits();
  const idx = limits.findIndex(l => l.id === updated.id);
  if (idx >= 0) {
    limits[idx] = updated;
  } else {
    limits.push(updated);
  }
  storage.set(APP_LIMITS_KEY, JSON.stringify(limits));
}

export function getWebLimits(): WebsiteLimitItem[] {
  const data = storage.getString(WEB_LIMITS_KEY);
  if (!data) {
    storage.set(WEB_LIMITS_KEY, JSON.stringify(DEFAULT_WEB_LIMITS));
    return DEFAULT_WEB_LIMITS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_WEB_LIMITS;
  }
}

export function saveWebLimit(item: WebsiteLimitItem): void {
  const limits = getWebLimits();
  const idx = limits.findIndex(w => w.id === item.id);
  if (idx >= 0) {
    limits[idx] = item;
  } else {
    limits.push(item);
  }
  storage.set(WEB_LIMITS_KEY, JSON.stringify(limits));
}

export function getDigitalSettings(): DigitalWellnessSettings {
  const data = storage.getString(SETTINGS_KEY);
  if (!data) {
    storage.set(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateDigitalSettings(settings: Partial<DigitalWellnessSettings>): DigitalWellnessSettings {
  const current = getDigitalSettings();
  const updated = { ...current, ...settings };
  storage.set(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
