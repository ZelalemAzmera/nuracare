import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const storage = !isWeb 
  ? new MMKV({ id: 'nuracare-mobile-storage' }) 
  : {
      set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch(e){} },
      getString: (k: string) => { try { return localStorage.getItem(k); } catch(e){ return null; } },
      delete: (k: string) => { try { localStorage.removeItem(k); } catch(e){} },
      clearAll: () => { try { localStorage.clear(); } catch(e){} },
      contains: (k: string) => { try { return localStorage.getItem(k) !== null; } catch(e){ return false; } },
      getAllKeys: () => [],
      getBoolean: (k: string) => { try { return localStorage.getItem(k) === 'true'; } catch(e) { return false; } },
      getNumber: (k: string) => { try { return Number(localStorage.getItem(k)) || 0; } catch(e) { return 0; } }
    } as any;

export function cacheData(key: string, data: any) {
  storage.set(key, JSON.stringify(data));
}

export function getCachedData<T>(key: string): T | null {
  const data = storage.getString(key);
  return data ? JSON.parse(data) : null;
}

