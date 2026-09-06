import { create } from 'zustand';
import { ConsentState } from '../privacy/consent/consentTypes';
import { getCachedData, cacheData } from '../storage/mmkv';

const CONSENT_STORAGE_KEY = 'nuracare_consent_state_v1';

const DEFAULT_CONSENT: ConsentState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  privacyPolicyAccepted: true,
  termsAccepted: true,
  healthDataProcessing: true,
  aiProcessing: true,
  wearableDataAccess: false,
  locationProcessing: false,
  analytics: true,
  marketing: false
};

interface ConsentStoreState {
  consent: ConsentState;
  hasLoaded: boolean;
  loadConsent: () => void;
  updateConsent: (key: keyof Omit<ConsentState, 'version' | 'lastUpdated'>, value: boolean) => void;
  revokeAllOptional: () => void;
}

export const useConsentStore = create<ConsentStoreState>((set, get) => ({
  consent: DEFAULT_CONSENT,
  hasLoaded: false,

  loadConsent: () => {
    try {
      const cached = getCachedData<ConsentState>(CONSENT_STORAGE_KEY);
      if (cached) {
        set({ consent: cached, hasLoaded: true });
        return;
      }
    } catch (e) {
      console.warn('[ConsentStore] Load error:', e);
    }
    set({ consent: DEFAULT_CONSENT, hasLoaded: true });
  },

  updateConsent: (key, value) => {
    const current = get().consent;
    const updated: ConsentState = {
      ...current,
      [key]: value,
      lastUpdated: new Date().toISOString()
    };
    set({ consent: updated });
    cacheData(CONSENT_STORAGE_KEY, updated);
  },

  revokeAllOptional: () => {
    const current = get().consent;
    const updated: ConsentState = {
      ...current,
      aiProcessing: false,
      wearableDataAccess: false,
      locationProcessing: false,
      analytics: false,
      marketing: false,
      lastUpdated: new Date().toISOString()
    };
    set({ consent: updated });
    cacheData(CONSENT_STORAGE_KEY, updated);
  }
}));
