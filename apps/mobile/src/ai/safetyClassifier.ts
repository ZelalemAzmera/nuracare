import { SafetyClassificationResult } from './aiTypes';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cannot breathe', 'shortness of breath', 'severe bleeding',
  'stroke', 'unconscious', 'fainted', 'suicide', 'kill myself', 'overdose', 'poison',
  'የደረት ህመም', 'መተንፈስ አቃተኝ', 'ደም መፍሰስ', 'ራስ መሳት', // Amharic
  'dhukkubbi qoma', 'harganuu dadhabuu', 'dhiiguu hamaa', 'of wallaaluu' // Afaan Oromo
];

const CLINICAL_DIAGNOSIS_PATTERNS = [
  'do i have cancer', 'diagnose me', 'prescribe me', 'is this a tumor',
  'ካንሰር አለብኝ', 'መድሃኒት እዘዝልኝ',
  'dhukkuba kansaarii qabaa', 'qoricha naaf barreessi'
];

/**
 * Health Safety Classifier
 * Ensures Nura AI operates strictly as a wellness companion and never pretends to replace
 * professional emergency medical triage or clinical diagnosis.
 */
export function classifyHealthQuery(userMessage: string): SafetyClassificationResult {
  const lower = userMessage.toLowerCase().trim();

  // 1. Check for red-flag emergency symptoms
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
  if (isEmergency) {
    return {
      riskLevel: 'emergency_escalation',
      disclaimerRequired: true,
      emergencyGuidance: 
        '⚠️ EMERGENCY ALERT: You described symptoms that may require urgent medical attention. ' +
        'Please call 907 (Ethiopia Emergency Helpline) or visit the nearest emergency medical center immediately. ' +
        'Nura AI is an educational wellness companion and cannot diagnose or treat emergencies.',
      safeToProceed: false
    };
  }

  // 2. Check for explicit clinical diagnosis requests
  const isDiagnosis = CLINICAL_DIAGNOSIS_PATTERNS.some((kw) => lower.includes(kw.toLowerCase()));
  if (isDiagnosis) {
    return {
      riskLevel: 'caution',
      disclaimerRequired: true,
      emergencyGuidance: 
        'Notice: NuraCare provides wellness, fitness, and lifestyle guidance only. ' +
        'We cannot provide a medical diagnosis or prescribe medications. Please consult a licensed healthcare professional.',
      safeToProceed: true
    };
  }

  // 3. Normal wellness query
  return {
    riskLevel: 'wellness',
    disclaimerRequired: false,
    safeToProceed: true
  };
}
