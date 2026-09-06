import { isSafeForTelemetry } from './dataClassification';

export type AuditEventType = 
  | 'login'
  | 'logout'
  | 'permission_granted'
  | 'permission_revoked'
  | 'consent_updated'
  | 'data_export_requested'
  | 'account_deletion_requested'
  | 'configuration_updated'
  | 'kill_switch_activated';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * AuditLogger
 * Logs security and compliance events safely without ever leaking health data.
 */
class AuditLogger {
  private inMemoryQueue: AuditLogEntry[] = [];

  public log(eventType: AuditEventType, userId?: string, metadata?: Record<string, any>): void {
    // Sanitize metadata to strip any sensitive biometric/health values
    const sanitizedMetadata: Record<string, any> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        if (isSafeForTelemetry(key) || key.startsWith('meta_')) {
          sanitizedMetadata[key] = value;
        } else {
          sanitizedMetadata[key] = '[REDACTED_BY_PRIVACY_POLICY]';
        }
      }
    }

    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      metadata: sanitizedMetadata
    };

    this.inMemoryQueue.push(entry);

    if (__DEV__) {
      console.log(`[AUDIT] ${entry.eventType} at ${entry.timestamp}`, sanitizedMetadata);
    }
  }

  public getRecentLogs(): AuditLogEntry[] {
    return [...this.inMemoryQueue];
  }
}

export const auditLogger = new AuditLogger();
