import { storage } from './mmkv';

const CHECKUPS_KEY = 'wellness_checkups';

export function saveCheckup(checkup: any) {
  const checkups = getCheckups();
  const index = checkups.findIndex((c: any) => c.id === checkup.id);
  
  if (index >= 0) {
    checkups[index] = checkup;
  } else {
    checkups.push(checkup);
  }
  
  storage.set(CHECKUPS_KEY, JSON.stringify(checkups));
  return checkup;
}

export function getCheckups() {
  const data = storage.getString(CHECKUPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function deleteCheckup(id: string) {
  const checkups = getCheckups();
  const filtered = checkups.filter((c: any) => c.id !== id);
  storage.set(CHECKUPS_KEY, JSON.stringify(filtered));
}
