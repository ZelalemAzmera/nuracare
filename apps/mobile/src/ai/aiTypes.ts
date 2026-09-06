export type SupportedLanguage = 'en' | 'am' | 'om';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromo', nativeLabel: 'Afaan Oromo' }
];

export interface MinimizedWellnessContext {
  recoveryScore?: number;
  sleepHours?: string;
  fastingMode?: string;
  recentSymptoms?: string[];
  activeMedicationsCount?: number;
}

export type SafetyRiskLevel = 'wellness' | 'caution' | 'emergency_escalation';

export interface SafetyClassificationResult {
  riskLevel: SafetyRiskLevel;
  disclaimerRequired: boolean;
  emergencyGuidance?: string;
  safeToProceed: boolean;
}
