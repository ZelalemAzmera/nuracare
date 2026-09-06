/**
 * NuraCare Server-Driven UI (SDUI) & Remote Configuration Types
 * 
 * Strict declarative schemas. Never contains executable JS or code strings.
 */

export type SectionType = 
  | 'recovery'
  | 'sleep'
  | 'hydration'
  | 'nutrition'
  | 'activity'
  | 'ai_insight'
  | 'mental_wellness'
  | 'quick_actions'
  | 'health_vault_summary'
  | 'fasting_banner';

export interface SDUISection {
  id: string;
  type: SectionType;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  title?: string;
  subtitle?: string;
  badge?: string;
  payload?: Record<string, any>;
  // Visibility rules
  conditions?: {
    minAppVersion?: string;
    maxAppVersion?: string;
    timeOfDay?: ('morning' | 'afternoon' | 'evening' | 'night')[];
    minRecoveryScore?: number;
    maxRecoveryScore?: number;
    requiresFasting?: boolean;
    requiredFeatureFlag?: string;
  };
}

export interface FeatureFlags {
  mental_wellness: boolean;
  wearable_sync: boolean;
  voice_companion: boolean;
  fasting_tracker: boolean;
  community_challenges: boolean;
  food_scanner: boolean;
  health_connect: boolean;
  offline_ai_cache: boolean;
  emergency_kill_switch: boolean;
  [key: string]: boolean;
}

export interface RemoteConfigPayload {
  version: number;
  minSupportedAppVersion: string;
  environment: 'production' | 'staging' | 'development';
  timestamp: string;
  etag?: string;
  home: {
    greetingFormat: 'time_adaptive' | 'standard';
    refreshIntervalSeconds: number;
    sections: SDUISection[];
  };
  features: FeatureFlags;
  ai: {
    enabled: boolean;
    supportedLanguages: ('en' | 'am' | 'om')[];
    defaultTone: 'encouraging' | 'clinical' | 'concise';
    maxContextTokens: number;
    safetyFilterLevel: 'strict' | 'moderate';
  };
  emergency: {
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    killedFeatures: string[];
  };
}
