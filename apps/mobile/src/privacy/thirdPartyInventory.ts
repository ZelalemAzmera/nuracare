export interface ThirdPartyService {
  name: string;
  category: 'Cloud Database' | 'AI Inference' | 'Analytics' | 'Payments' | 'Notifications';
  dataSent: string[];
  purpose: string;
  retentionPeriod: string;
  isConsentRequired: boolean;
  canBeDisabled: boolean;
  legalTransferMechanism: string;
}

export const THIRD_PARTY_INVENTORY: ThirdPartyService[] = [
  {
    name: 'Supabase (Cloud Auth & DB)',
    category: 'Cloud Database',
    dataSent: ['User ID', 'Encrypted email', 'Wellness logs', 'Hashed credentials'],
    purpose: 'Secure user account management and encrypted cloud data synchronization.',
    retentionPeriod: 'Duration of active account, or until account deletion request.',
    isConsentRequired: true,
    canBeDisabled: false,
    legalTransferMechanism: 'Standard Contractual Clauses & Encryption at Rest (AES-256)'
  },
  {
    name: 'NuraCare Dedicated AI Gateway',
    category: 'AI Inference',
    dataSent: ['Explicit conversational prompt', 'Selected recovery/fasting context'],
    purpose: 'Generate personalized lifestyle guidance in English, Amharic, or Afaan Oromo.',
    retentionPeriod: 'Ephemeral during active inference session. Zero training retention.',
    isConsentRequired: true,
    canBeDisabled: true,
    legalTransferMechanism: 'Zero Data Retention API Agreement'
  },
  {
    name: 'Expo Push Notification Gateway',
    category: 'Notifications',
    dataSent: ['Anonymous device push token'],
    purpose: 'Deliver scheduled hydration and fasting reminders.',
    retentionPeriod: 'Active device token lifespan.',
    isConsentRequired: true,
    canBeDisabled: true,
    legalTransferMechanism: 'Operating System Push Service'
  }
];
