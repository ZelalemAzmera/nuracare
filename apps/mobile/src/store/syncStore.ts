import { create } from 'zustand';
import { getCachedData, cacheData } from '../storage/mmkv';

interface SyncState {
  isSyncing: boolean;
  lastSynced: string | null;
  pendingCheckIns: string[];
  pendingMessages: string[];
  addToQueue: (type: 'checkIn' | 'message', id: string) => void;
  removeFromQueue: (type: 'checkIn' | 'message', id: string) => void;
  setSyncing: (status: boolean) => void;
  setLastSynced: (date: string) => void;
  loadSyncState: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSynced: null,
  pendingCheckIns: [],
  pendingMessages: [],
  
  addToQueue: (type, id) => set((state) => {
    const queueName = type === 'checkIn' ? 'pendingCheckIns' : 'pendingMessages';
    const newQueue = [...state[queueName], id];
    cacheData(queueName, newQueue);
    return { [queueName]: newQueue } as Partial<SyncState>;
  }),

  removeFromQueue: (type, id) => set((state) => {
    const queueName = type === 'checkIn' ? 'pendingCheckIns' : 'pendingMessages';
    const newQueue = state[queueName].filter(itemId => itemId !== id);
    cacheData(queueName, newQueue);
    return { [queueName]: newQueue } as Partial<SyncState>;
  }),

  setSyncing: (status) => set({ isSyncing: status }),
  
  setLastSynced: (date) => {
    cacheData('lastSynced', date);
    set({ lastSynced: date });
  },

  loadSyncState: () => {
    const pendingCheckIns = getCachedData<string[]>('pendingCheckIns') || [];
    const pendingMessages = getCachedData<string[]>('pendingMessages') || [];
    const lastSynced = getCachedData<string>('lastSynced') || null;
    set({ pendingCheckIns, pendingMessages, lastSynced });
  }
}));
