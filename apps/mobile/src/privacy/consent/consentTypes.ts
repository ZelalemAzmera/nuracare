/**
 * NuraCare Granular Consent Architecture
 * Aligned with Ethiopia's Personal Data Protection Proclamation No. 1321/2024
 * and Google Play Health Apps Declaration Requirements.
 */

export interface ConsentState {
  version: number;
  lastUpdated: string;
  privacyPolicyAccepted: boolean;
  termsAccepted: boolean;
  healthDataProcessing: boolean; // Processing of health records & metrics
  aiProcessing: boolean;         // Injection of context into Nura AI
  wearableDataAccess: boolean;   // Reading external wearable or sensor data
  locationProcessing: boolean;   // Coarse facility discovery
  analytics: boolean;            // Performance telemetry (No health data)
  marketing: boolean;            // Opt-in product updates
}

export interface ConsentPurposeInfo {
  key: keyof Omit<ConsentState, 'version' | 'lastUpdated'>;
  title: string;
  description: string;
  legalBasis: 'consent' | 'contract' | 'legitimate_interest';
  isMandatory: boolean;
  ethiopianLawRef: string;
}

export const CONSENT_PURPOSES: ConsentPurposeInfo[] = [
  {
    key: 'privacyPolicyAccepted',
    title: 'Privacy Policy Agreement',
    description: 'Agreement to our basic data handling practices.',
    legalBasis: 'contract',
    isMandatory: true,
    ethiopianLawRef: 'Proc. 1321/2024 Art. 5 (Lawful Processing)'
  },
  {
    key: 'healthDataProcessing',
    title: 'Personal Health Data Processing',
    description: 'Allows NuraCare to store and calculate recovery scores, fasting calendars, and sleep insights.',
    legalBasis: 'consent',
    isMandatory: true,
    ethiopianLawRef: 'Proc. 1321/2024 Art. 14 (Sensitive Personal Data)'
  },
  {
    key: 'aiProcessing',
    title: 'AI Wellness Context Personalization',
    description: 'Enables Nura AI to read your recent recovery score and fasting mode to personalize recommendations.',
    legalBasis: 'consent',
    isMandatory: false,
    ethiopianLawRef: 'Proc. 1321/2024 Art. 14 & Purpose Limitation'
  },
  {
    key: 'wearableDataAccess',
    title: 'Wearables & Health Connect Sync',
    description: 'Allows syncing steps and heart rate from smartwatches or Health Connect.',
    legalBasis: 'consent',
    isMandatory: false,
    ethiopianLawRef: 'Proc. 1321/2024 Art. 8 (Consent Transparency)'
  },
  {
    key: 'locationProcessing',
    title: 'Nearby Health Resource Locator',
    description: 'Use approximate locality to find nearby pharmacies and clinics in Ethiopia.',
    legalBasis: 'consent',
    isMandatory: false,
    ethiopianLawRef: 'Proc. 1321/2024 Art. 8 (Granular Consent)'
  },
  {
    key: 'analytics',
    title: 'Crash & Performance Telemetry',
    description: 'Anonymous error reporting to fix bugs. Never logs medical or health information.',
    legalBasis: 'consent',
    isMandatory: false,
    ethiopianLawRef: 'Proc. 1321/2024 Art. 12 (Data Minimization)'
  }
];
