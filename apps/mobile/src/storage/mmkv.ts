import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const cacheData = (key: string, value: any) => {
  storage.set(key, JSON.stringify(value));
};

export const getCachedData = <T>(key: string): T | null => {
  const data = storage.getString(key);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const clearCache = (key: string) => {
  storage.delete(key);
};
