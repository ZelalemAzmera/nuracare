import { RemoteConfigPayload } from './remoteConfigTypes';
import { DEFAULT_REMOTE_CONFIG } from './defaultRemoteConfig';
import { validateRemoteConfig } from './configValidator';
import { getCachedData, cacheData } from '../storage/mmkv';

const STORAGE_KEY_ACTIVE_CONFIG = 'nuracare_remote_config_active';
const STORAGE_KEY_PREVIOUS_CONFIG = 'nuracare_remote_config_previous';

/**
 * Remote Config Service
 * Provides instant cold-start from MMKV cache and safe asynchronous sync.
 */
class RemoteConfigService {
  private activeConfig: RemoteConfigPayload = DEFAULT_REMOTE_CONFIG;

  constructor() {
    this.initFromCache();
  }

  /**
   * Initializes config from local MMKV cache immediately.
   * If cache is empty or corrupt, falls back to DEFAULT_REMOTE_CONFIG.
   */
  public initFromCache(): RemoteConfigPayload {
    try {
      const cached = getCachedData<RemoteConfigPayload>(STORAGE_KEY_ACTIVE_CONFIG);
      if (cached) {
        const { valid, config } = validateRemoteConfig(cached);
        if (valid && config) {
          this.activeConfig = config;
          return this.activeConfig;
        }
      }
    } catch (err) {
      console.warn('[RemoteConfig] Cache read error, using default:', err);
    }
    this.activeConfig = DEFAULT_REMOTE_CONFIG;
    return this.activeConfig;
  }

  /**
   * Returns current in-memory active config.
   */
  public getConfig(): RemoteConfigPayload {
    return this.activeConfig;
  }

  /**
   * Fetches latest remote configuration from backend / CDN.
   * Compares versions, validates schema, and applies changes safely without UI flickering.
   */
  public async fetchAndApply(remoteUrl?: string): Promise<{ updated: boolean; config: RemoteConfigPayload }> {
    try {
      // In production, remoteUrl points to Supabase Edge Function or secure CDN endpoint
      const endpoint = remoteUrl || 'https://api.nuracare.pro.et/api/v1/config/mobile';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'If-None-Match': this.activeConfig.etag || '',
          'X-Client-Version': '1.0.0'
        },
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      // If server returned 304 Not Modified or network failed, retain cached
      if (!response || response.status === 304) {
        return { updated: false, config: this.activeConfig };
      }

      if (!response.ok) {
        console.warn(`[RemoteConfig] Server returned ${response.status}. Retaining current config.`);
        return { updated: false, config: this.activeConfig };
      }

      const rawJson = await response.json();
      const { valid, config, error } = validateRemoteConfig(rawJson);

      if (!valid || !config) {
        console.error('[RemoteConfig] Remote configuration failed validation:', error);
        return { updated: false, config: this.activeConfig };
      }

      // Check version comparison
      if (config.version <= this.activeConfig.version) {
        return { updated: false, config: this.activeConfig };
      }

      // Safe update: Backup active config as previous for potential rollback
      cacheData(STORAGE_KEY_PREVIOUS_CONFIG, this.activeConfig);
      
      // Save new validated config
      this.activeConfig = config;
      cacheData(STORAGE_KEY_ACTIVE_CONFIG, config);

      return { updated: true, config: this.activeConfig };
    } catch (error) {
      console.warn('[RemoteConfig] Network fetch failed, offline fallback active:', error);
      return { updated: false, config: this.activeConfig };
    }
  }

  /**
   * Rollback to previously known good configuration in case of emergency.
   */
  public rollback(): RemoteConfigPayload {
    try {
      const previous = getCachedData<RemoteConfigPayload>(STORAGE_KEY_PREVIOUS_CONFIG);
      if (previous) {
        this.activeConfig = previous;
        cacheData(STORAGE_KEY_ACTIVE_CONFIG, previous);
        return this.activeConfig;
      }
    } catch (e) {
      console.error('[RemoteConfig] Rollback failed:', e);
    }
    this.activeConfig = DEFAULT_REMOTE_CONFIG;
    return this.activeConfig;
  }
}

export const remoteConfigService = new RemoteConfigService();
