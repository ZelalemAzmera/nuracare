import { create } from 'zustand';
import { RemoteConfigPayload, SDUISection } from '../config/remoteConfigTypes';
import { remoteConfigService } from '../config/remoteConfigService';
import { DEFAULT_REMOTE_CONFIG } from '../config/defaultRemoteConfig';

interface RemoteConfigState {
  config: RemoteConfigPayload;
  isLoading: boolean;
  lastSyncedAt: string | null;
  // Actions
  initialize: () => void;
  syncRemoteConfig: () => Promise<boolean>;
  isFeatureEnabled: (featureName: string) => boolean;
  getSortedSections: (timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night', recoveryScore?: number) => SDUISection[];
}

export const useRemoteConfigStore = create<RemoteConfigState>((set, get) => ({
  config: DEFAULT_REMOTE_CONFIG,
  isLoading: false,
  lastSyncedAt: null,

  initialize: () => {
    const initialConfig = remoteConfigService.initFromCache();
    set({ config: initialConfig });
  },

  syncRemoteConfig: async () => {
    set({ isLoading: true });
    try {
      const { updated, config } = await remoteConfigService.fetchAndApply();
      set({ 
        config, 
        isLoading: false, 
        lastSyncedAt: new Date().toISOString() 
      });
      return updated;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  isFeatureEnabled: (featureName: string) => {
    const { config } = get();
    // Emergency kill switch overrides all
    if (config.features.emergency_kill_switch) {
      return false;
    }
    if (config.emergency.killedFeatures?.includes(featureName)) {
      return false;
    }
    return Boolean(config.features[featureName]);
  },

  getSortedSections: (timeOfDay, recoveryScore) => {
    const { config, isFeatureEnabled } = get();
    const sections = config.home?.sections || [];

    return sections
      .filter((section) => {
        if (!section.enabled) return false;

        // Condition checks
        if (section.conditions) {
          const { requiredFeatureFlag, timeOfDay: validTimes, minRecoveryScore, maxRecoveryScore } = section.conditions;
          
          if (requiredFeatureFlag && !isFeatureEnabled(requiredFeatureFlag)) {
            return false;
          }

          if (timeOfDay && validTimes && validTimes.length > 0 && !validTimes.includes(timeOfDay)) {
            return false;
          }

          if (recoveryScore !== undefined) {
            if (minRecoveryScore !== undefined && recoveryScore < minRecoveryScore) return false;
            if (maxRecoveryScore !== undefined && recoveryScore > maxRecoveryScore) return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }
}));
