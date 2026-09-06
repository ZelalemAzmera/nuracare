import { RemoteConfigPayload } from './remoteConfigTypes';

/**
 * Built-in default configuration.
 * Loaded instantly (<2ms) on cold start or when offline, guaranteeing zero blank screens.
 */
export const DEFAULT_REMOTE_CONFIG: RemoteConfigPayload = {
  version: 1,
  minSupportedAppVersion: '1.0.0',
  environment: 'production',
  timestamp: new Date().toISOString(),
  home: {
    greetingFormat: 'time_adaptive',
    refreshIntervalSeconds: 300,
    sections: [
      {
        id: 'sec_ai_insight',
        type: 'ai_insight',
        enabled: true,
        priority: 1,
        title: "Today's Insight",
        subtitle: 'Personalized wellness focus'
      },
      {
        id: 'sec_recovery',
        type: 'recovery',
        enabled: true,
        priority: 2,
        title: 'Recovery Score',
        subtitle: 'Based on sleep & resting heart rate'
      },
      {
        id: 'sec_sleep',
        type: 'sleep',
        enabled: true,
        priority: 3,
        title: 'Sleep Tracking',
        subtitle: 'Restorative sleep stages'
      },
      {
        id: 'sec_hydration',
        type: 'hydration',
        enabled: true,
        priority: 4,
        title: 'Hydration Target',
        subtitle: 'Daily water intake'
      },
      {
        id: 'sec_activity',
        type: 'activity',
        enabled: true,
        priority: 5,
        title: 'Daily Movement',
        subtitle: 'Steps and active burn'
      },
      {
        id: 'sec_nutrition',
        type: 'nutrition',
        enabled: true,
        priority: 6,
        title: 'Cultural Nutrition',
        subtitle: 'Ethiopian meal & fasting guidance'
      },
      {
        id: 'sec_mental_wellness',
        type: 'mental_wellness',
        enabled: true,
        priority: 7,
        title: 'Mindful Recovery',
        subtitle: 'Breathwork & stress reset',
        conditions: {
          requiredFeatureFlag: 'mental_wellness'
        }
      },
      {
        id: 'sec_quick_actions',
        type: 'quick_actions',
        enabled: true,
        priority: 8,
        title: 'Quick Access'
      }
    ]
  },
  features: {
    mental_wellness: true,
    wearable_sync: true,
    voice_companion: true,
    fasting_tracker: true,
    community_challenges: true,
    food_scanner: false, // In development
    health_connect: false, // Granular readiness
    offline_ai_cache: true,
    emergency_kill_switch: false
  },
  ai: {
    enabled: true,
    supportedLanguages: ['en', 'am', 'om'],
    defaultTone: 'encouraging',
    maxContextTokens: 1200,
    safetyFilterLevel: 'strict'
  },
  emergency: {
    maintenanceMode: false,
    killedFeatures: []
  }
};
