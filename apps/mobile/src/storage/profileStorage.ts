import { storage } from './mmkv';

const PROFILE_KEY = 'user_profile';

export function saveProfile(profile: any) {
  storage.set(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile() {
  const data = storage.getString(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearProfile() {
  storage.delete(PROFILE_KEY);
}
