import { MinimizedWellnessContext } from './aiTypes';
import { useConsentStore } from '../store/consentStore';

/**
 * Context Minimizer
 * Enforces privacy-by-design and purpose limitation (Ethiopian Law Proc. 1321/2024 Art. 12).
 * Strictly checks user consent before assembling biometric context for AI inference.
 */
export function buildMinimizedContext(
  profile: any,
  recentRecords: any[],
  queryText: string
): MinimizedWellnessContext | null {
  const { consent } = useConsentStore.getState();

  // If user has revoked AI biometric processing consent, return zero context
  if (!consent.aiProcessing || !consent.healthDataProcessing) {
    return null;
  }

  const context: MinimizedWellnessContext = {};
  const lowerQuery = queryText.toLowerCase();

  // Only inject sleep if query is related to energy, fatigue, rest, or sleep
  if (lowerQuery.includes('sleep') || lowerQuery.includes('tired') || lowerQuery.includes('energy') || lowerQuery.includes('ድካም')) {
    context.sleepHours = '7h 42m';
  }

  // Only inject fasting mode if query touches diet, nutrition, food, or fasting
  if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('fasting') || lowerQuery.includes('tsom') || lowerQuery.includes('ምግብ') || lowerQuery.includes('ጾም')) {
    context.fastingMode = profile?.fastingMode || 'Standard (No Restrictions)';
  }

  // Inject general recovery readiness score
  context.recoveryScore = 84;

  if (profile?.medications) {
    const meds = profile.medications.split(',').filter(Boolean);
    context.activeMedicationsCount = meds.length;
  }

  return context;
}
