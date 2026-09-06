import { storage } from './mmkv';

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string; // e.g., "500mg", "1 capsule"
  frequency: string; // "Once daily", "Twice daily", "Three times daily", "As needed"
  times: string[]; // e.g., ["08:30", "20:00"]
  withFood: boolean;
  category: 'Prescription' | 'Supplement' | 'OTC' | 'Vitamin';
  instructions?: string;
  reminderEnabled: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: 'taken' | 'skipped' | 'snoozed';
  actionTimestamp: string;
  notes?: string;
}

const MEDS_KEY = 'nuracare_medications_list';
const LOGS_KEY = 'nuracare_medication_logs';

const DEFAULT_MEDS: MedicationItem[] = [
  {
    id: 'med-default-1',
    name: 'Vitamin D3 & K2',
    dosage: '2000 IU',
    frequency: 'Once daily',
    times: ['08:30'],
    withFood: true,
    category: 'Vitamin',
    instructions: 'Take with morning meal',
    reminderEnabled: true,
    startDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-default-2',
    name: 'Omega-3 Fish Oil',
    dosage: '1000 mg',
    frequency: 'Once daily',
    times: ['13:00'],
    withFood: true,
    category: 'Supplement',
    instructions: 'Take with lunch',
    reminderEnabled: true,
    startDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med-default-3',
    name: 'Magnesium Glycinate',
    dosage: '200 mg',
    frequency: 'Once daily',
    times: ['21:00'],
    withFood: false,
    category: 'Supplement',
    instructions: 'Take 30 minutes before sleep for muscle relaxation',
    reminderEnabled: true,
    startDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
];

export function getMedications(): MedicationItem[] {
  const data = storage.getString(MEDS_KEY);
  if (!data) {
    storage.set(MEDS_KEY, JSON.stringify(DEFAULT_MEDS));
    return DEFAULT_MEDS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_MEDS;
  }
}

export function saveMedication(item: Omit<MedicationItem, 'id' | 'createdAt'>): MedicationItem {
  const meds = getMedications();
  const newItem: MedicationItem = {
    ...item,
    id: 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  };
  meds.unshift(newItem);
  storage.set(MEDS_KEY, JSON.stringify(meds));
  return newItem;
}

export function updateMedication(updatedItem: MedicationItem): void {
  const meds = getMedications();
  const idx = meds.findIndex(m => m.id === updatedItem.id);
  if (idx >= 0) {
    meds[idx] = updatedItem;
    storage.set(MEDS_KEY, JSON.stringify(meds));
  }
}

export function deleteMedication(id: string): void {
  const meds = getMedications().filter(m => m.id !== id);
  storage.set(MEDS_KEY, JSON.stringify(meds));
}

export function getMedicationLogs(): MedicationLog[] {
  const data = storage.getString(LOGS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function logDoseAction(
  medicationId: string,
  scheduledDate: string,
  scheduledTime: string,
  status: 'taken' | 'skipped' | 'snoozed',
  notes?: string
): MedicationLog {
  const logs = getMedicationLogs();
  const meds = getMedications();
  const med = meds.find(m => m.id === medicationId);

  const existingIdx = logs.findIndex(
    l => l.medicationId === medicationId && l.scheduledDate === scheduledDate && l.scheduledTime === scheduledTime
  );

  const logEntry: MedicationLog = {
    id: existingIdx >= 0 ? logs[existingIdx].id : 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    medicationId,
    medicationName: med?.name || 'Unknown Medication',
    dosage: med?.dosage || '',
    scheduledDate,
    scheduledTime,
    status,
    actionTimestamp: new Date().toISOString(),
    notes,
  };

  if (existingIdx >= 0) {
    logs[existingIdx] = logEntry;
  } else {
    logs.push(logEntry);
  }

  // Keep max 500 log items
  if (logs.length > 500) logs.shift();

  storage.set(LOGS_KEY, JSON.stringify(logs));
  return logEntry;
}

export interface ScheduledDose {
  doseId: string;
  medication: MedicationItem;
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  status: 'taken' | 'skipped' | 'due';
  log?: MedicationLog;
}

export function getTodaySchedule(): ScheduledDose[] {
  const meds = getMedications();
  const logs = getMedicationLogs();
  const today = new Date().toISOString().split('T')[0];

  const doses: ScheduledDose[] = [];

  meds.forEach(med => {
    med.times.forEach((timeStr) => {
      const hour = parseInt(timeStr.split(':')[0], 10);
      let period: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Morning';
      if (hour >= 12 && hour < 17) period = 'Afternoon';
      else if (hour >= 17 && hour < 21) period = 'Evening';
      else if (hour >= 21 || hour < 5) period = 'Night';

      const existingLog = logs.find(
        l => l.medicationId === med.id && l.scheduledDate === today && l.scheduledTime === timeStr
      );

      doses.push({
        doseId: `${med.id}_${today}_${timeStr}`,
        medication: med,
        time: timeStr,
        period,
        status: existingLog ? (existingLog.status as any) : 'due',
        log: existingLog,
      });
    });
  });

  return doses.sort((a, b) => a.time.localeCompare(b.time));
}

export function getAdherenceStats(days: number = 7): {
  percentage: number;
  taken: number;
  total: number;
  streak: number;
} {
  const meds = getMedications();
  const logs = getMedicationLogs();
  if (meds.length === 0) return { percentage: 100, taken: 0, total: 0, streak: 0 };

  const totalDosesExpectedPerDay = meds.reduce((acc, m) => acc + m.times.length, 0);
  const totalExpected = totalDosesExpectedPerDay * days;

  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - days);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  const recentTaken = logs.filter(l => l.scheduledDate >= pastDateStr && l.status === 'taken').length;
  const percentage = totalExpected > 0 ? Math.min(100, Math.round((recentTaken / totalExpected) * 100)) : 100;

  // Streak calculation
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayTaken = logs.filter(l => l.scheduledDate === dStr && l.status === 'taken').length;
    if (dayTaken > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    percentage,
    taken: recentTaken,
    total: totalExpected,
    streak,
  };
}
