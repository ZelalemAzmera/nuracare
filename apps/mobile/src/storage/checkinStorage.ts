import { storage } from './mmkv';
import type { CheckIn } from '../shared';

const CHECKINS_KEY = 'wellness_checkins';

export function saveCheckin(entry: CheckIn) {
  const checkins = getCheckins();
  const dateStr = entry.date || new Date().toISOString().split('T')[0];
  
  const newEntry = {
    ...entry,
    date: dateStr,
    timestamp: (entry as any).timestamp || Date.now()
  };

  const existingIndex = checkins.findIndex(c => c.date === dateStr);
  if (existingIndex >= 0) {
    checkins[existingIndex] = newEntry;
  } else {
    checkins.push(newEntry);
  }

  if (checkins.length > 365) checkins.shift();
  
  storage.set(CHECKINS_KEY, JSON.stringify(checkins));
  return newEntry;
}

export function getCheckins(): CheckIn[] {
  const data = storage.getString(CHECKINS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTodayCheckin(): CheckIn | undefined {
  const today = new Date().toISOString().split('T')[0];
  return getCheckins().find(c => c.date === today);
}
