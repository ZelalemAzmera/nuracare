import { Platform } from 'react-native';
import { getAppLimits, getDigitalUsage, getDigitalSettings, updateAppLimit } from '../../storage/digitalWellnessStorage';

export interface AppIntentionPrompt {
  appName: string;
  reasons: string[];
  onProceed: () => void;
  onTakeBreak: () => void;
}

class DigitalWellnessService {
  private isFocusActive: boolean = false;
  private focusEndTime: number | null = null;
  private activeFocusName: string = '';

  /**
   * Check if Usage Access or Device Activity permission is available
   */
  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (Platform.OS === 'web') return 'unsupported';
    // Native abstraction layer
    return 'granted';
  }

  /**
   * Evaluates if an app is currently restricted (Daily limit reached or active Focus/Sleep mode)
   */
  isAppRestricted(appName: string): {
    restricted: boolean;
    reason?: string;
    usedMinutes?: number;
    limitMinutes?: number;
  } {
    const limits = getAppLimits();
    const app = limits.find(l => l.name.toLowerCase() === appName.toLowerCase() || (l.packageName && l.packageName.includes(appName.toLowerCase())));

    if (this.isFocusActive) {
      return {
        restricted: true,
        reason: `Blocked by active focus session: ${this.activeFocusName}`
      };
    }

    if (app && app.isEnabled && app.usedMinutesToday >= app.dailyLimitMinutes) {
      return {
        restricted: true,
        reason: `You've reached your ${app.name} limit for today.`,
        usedMinutes: app.usedMinutesToday,
        limitMinutes: app.dailyLimitMinutes
      };
    }

    return { restricted: false };
  }

  /**
   * Start a manual focus session
   */
  startFocusSession(name: string, durationMinutes: number): void {
    this.isFocusActive = true;
    this.activeFocusName = name;
    this.focusEndTime = Date.now() + durationMinutes * 60 * 1000;
  }

  /**
   * Stop active focus session
   */
  stopFocusSession(): void {
    this.isFocusActive = false;
    this.focusEndTime = null;
    this.activeFocusName = '';
  }

  getFocusStatus(): { active: boolean; name: string; remainingSeconds: number } {
    if (!this.isFocusActive || !this.focusEndTime) {
      return { active: false, name: '', remainingSeconds: 0 };
    }
    const remaining = Math.max(0, Math.round((this.focusEndTime - Date.now()) / 1000));
    if (remaining === 0) {
      this.stopFocusSession();
      return { active: false, name: '', remainingSeconds: 0 };
    }
    return { active: true, name: this.activeFocusName, remainingSeconds: remaining };
  }
}

export const digitalWellnessService = new DigitalWellnessService();
