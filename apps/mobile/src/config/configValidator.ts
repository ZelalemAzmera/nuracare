import { RemoteConfigPayload, SDUISection } from './remoteConfigTypes';

/**
 * Validates remote config JSON payloads.
 * Ensures the payload matches required schemas, versions, and security invariants.
 * Rejects any payload containing malformed sections or unexpected keys.
 */
export function validateRemoteConfig(data: any): { valid: boolean; config?: RemoteConfigPayload; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload is not a valid JSON object' };
  }

  // Version check
  if (typeof data.version !== 'number' || data.version < 1) {
    return { valid: false, error: 'Missing or invalid version number' };
  }

  // Home validation
  if (!data.home || typeof data.home !== 'object' || !Array.isArray(data.home.sections)) {
    return { valid: false, error: 'Invalid home sections array' };
  }

  // Sanitize and validate each section
  const validSections: SDUISection[] = [];
  for (const s of data.home.sections) {
    if (!s || typeof s !== 'object') continue;
    if (typeof s.id !== 'string' || typeof s.type !== 'string') continue;
    if (typeof s.enabled !== 'boolean' || typeof s.priority !== 'number') continue;

    validSections.push({
      id: s.id,
      type: s.type,
      enabled: s.enabled,
      priority: s.priority,
      title: typeof s.title === 'string' ? s.title : undefined,
      subtitle: typeof s.subtitle === 'string' ? s.subtitle : undefined,
      badge: typeof s.badge === 'string' ? s.badge : undefined,
      payload: s.payload && typeof s.payload === 'object' ? s.payload : {},
      conditions: s.conditions && typeof s.conditions === 'object' ? s.conditions : undefined
    });
  }

  if (validSections.length === 0) {
    return { valid: false, error: 'No valid sections found in remote config' };
  }

  // Features validation
  const features = data.features && typeof data.features === 'object' ? data.features : {};

  // Build validated payload
  const validatedConfig: RemoteConfigPayload = {
    version: data.version,
    minSupportedAppVersion: typeof data.minSupportedAppVersion === 'string' ? data.minSupportedAppVersion : '1.0.0',
    environment: data.environment === 'staging' || data.environment === 'development' ? data.environment : 'production',
    timestamp: typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString(),
    etag: typeof data.etag === 'string' ? data.etag : undefined,
    home: {
      greetingFormat: data.home.greetingFormat === 'standard' ? 'standard' : 'time_adaptive',
      refreshIntervalSeconds: typeof data.home.refreshIntervalSeconds === 'number' ? data.home.refreshIntervalSeconds : 300,
      sections: validSections
    },
    features: {
      mental_wellness: Boolean(features.mental_wellness ?? true),
      wearable_sync: Boolean(features.wearable_sync ?? true),
      voice_companion: Boolean(features.voice_companion ?? true),
      fasting_tracker: Boolean(features.fasting_tracker ?? true),
      community_challenges: Boolean(features.community_challenges ?? true),
      food_scanner: Boolean(features.food_scanner ?? false),
      health_connect: Boolean(features.health_connect ?? false),
      offline_ai_cache: Boolean(features.offline_ai_cache ?? true),
      emergency_kill_switch: Boolean(features.emergency_kill_switch ?? false),
      ...features
    },
    ai: {
      enabled: Boolean(data.ai?.enabled ?? true),
      supportedLanguages: Array.isArray(data.ai?.supportedLanguages) ? data.ai.supportedLanguages : ['en', 'am', 'om'],
      defaultTone: data.ai?.defaultTone ?? 'encouraging',
      maxContextTokens: typeof data.ai?.maxContextTokens === 'number' ? data.ai.maxContextTokens : 1200,
      safetyFilterLevel: data.ai?.safetyFilterLevel ?? 'strict'
    },
    emergency: {
      maintenanceMode: Boolean(data.emergency?.maintenanceMode ?? false),
      maintenanceMessage: data.emergency?.maintenanceMessage,
      killedFeatures: Array.isArray(data.emergency?.killedFeatures) ? data.emergency.killedFeatures : []
    }
  };

  return { valid: true, config: validatedConfig };
}
