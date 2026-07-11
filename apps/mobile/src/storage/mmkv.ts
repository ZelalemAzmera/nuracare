import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'nuracare-mobile-storage'
});

export function cacheData(key: string, data: any) {
  storage.set(key, JSON.stringify(data));
}

export function getCachedData<T>(key: string): T | null {
  const data = storage.getString(key);
  return data ? JSON.parse(data) : null;
}
