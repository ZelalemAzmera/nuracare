/**
 * NuraCare Data Classification Architecture
 * Defines strict handling, logging, storage, and export policies for every data field.
 */

export type DataSensitivityLevel = 
  | 'PUBLIC'
  | 'INTERNAL'
  | 'PERSONAL'
  | 'SENSITIVE_PERSONAL'
  | 'HEALTH_SENSITIVE'
  | 'SECURITY_CRITICAL';

export interface FieldClassification {
  fieldName: string;
  category: DataSensitivityLevel;
  allowInAnalytics: boolean;
  allowInOrdinaryLogs: boolean;
  requiresEncryptionAtRest: boolean;
  requiresExplicitConsent: boolean;
  retentionDays: number | 'indefinite_until_deleted';
}

export const DATA_FIELD_CLASSIFICATIONS: Record<string, FieldClassification> = {
  // Identity & Auth
  'user_id': { fieldName: 'user_id', category: 'INTERNAL', allowInAnalytics: false, allowInOrdinaryLogs: true, requiresEncryptionAtRest: true, requiresExplicitConsent: false, retentionDays: 'indefinite_until_deleted' },
  'email': { fieldName: 'email', category: 'PERSONAL', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'full_name': { fieldName: 'full_name', category: 'PERSONAL', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'password_hash': { fieldName: 'password_hash', category: 'SECURITY_CRITICAL', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },

  // Health Metrics
  'recovery_score': { fieldName: 'recovery_score', category: 'HEALTH_SENSITIVE', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'sleep_duration': { fieldName: 'sleep_duration', category: 'HEALTH_SENSITIVE', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'heart_rate': { fieldName: 'heart_rate', category: 'HEALTH_SENSITIVE', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'blood_pressure': { fieldName: 'blood_pressure', category: 'HEALTH_SENSITIVE', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'medications': { fieldName: 'medications', category: 'HEALTH_SENSITIVE', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },
  'fasting_mode': { fieldName: 'fasting_mode', category: 'SENSITIVE_PERSONAL', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },

  // AI Conversations
  'ai_chat_messages': { fieldName: 'ai_chat_messages', category: 'HEALTH_SENSITIVE', allowInAnalytics: false, allowInOrdinaryLogs: false, requiresEncryptionAtRest: true, requiresExplicitConsent: true, retentionDays: 'indefinite_until_deleted' },

  // System & Telemetry
  'app_version': { fieldName: 'app_version', category: 'INTERNAL', allowInAnalytics: true, allowInOrdinaryLogs: true, requiresEncryptionAtRest: false, requiresExplicitConsent: false, retentionDays: 365 },
  'device_os': { fieldName: 'device_os', category: 'INTERNAL', allowInAnalytics: true, allowInOrdinaryLogs: true, requiresEncryptionAtRest: false, requiresExplicitConsent: false, retentionDays: 365 },
  'api_latency_ms': { fieldName: 'api_latency_ms', category: 'INTERNAL', allowInAnalytics: true, allowInOrdinaryLogs: true, requiresEncryptionAtRest: false, requiresExplicitConsent: false, retentionDays: 90 }
};

/**
 * Checks if a given field is safe for telemetry logging.
 * Guarantees that health or sensitive data is never leaked to third-party logs.
 */
export function isSafeForTelemetry(fieldName: string): boolean {
  const classification = DATA_FIELD_CLASSIFICATIONS[fieldName];
  if (!classification) return false;
  return classification.allowInAnalytics && classification.category === 'INTERNAL';
}
