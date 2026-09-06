/**
 * NuraCare Permissions Architecture
 * Granular, contextual permissions. Never speculative or bundled.
 */

export type PermissionType = 
  | 'camera'
  | 'microphone'
  | 'location'
  | 'notifications'
  | 'health_connect'
  | 'bluetooth';

export type PermissionStatus = 
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'blocked';

export interface PermissionRationale {
  type: PermissionType;
  title: string;
  subtitle: string;
  featureUsingIt: string;
  explanation: string;
  privacyGuarantee: string;
  iconName: string;
}

export const PERMISSION_RATIONALES: Record<PermissionType, PermissionRationale> = {
  camera: {
    type: 'camera',
    title: 'Camera Access',
    subtitle: 'For meal and medical document scanning',
    featureUsingIt: 'Nutrition Scanner & Health Vault',
    explanation: 'NuraCare uses your camera only when you actively choose to photograph a meal or scan a health document.',
    privacyGuarantee: 'Photos are analyzed strictly for your personal records and are never sold or used for public AI training.',
    iconName: 'Camera'
  },
  microphone: {
    type: 'microphone',
    title: 'Microphone Access',
    subtitle: 'For Trilingual Voice AI Companion',
    featureUsingIt: 'Nura Voice Assistant',
    explanation: 'Allows you to speak naturally in Amharic, English, or Afaan Oromo to ask health questions.',
    privacyGuarantee: 'Audio is streamed solely for speech-to-text processing during active voice sessions and is not recorded in the background.',
    iconName: 'Mic'
  },
  location: {
    type: 'location',
    title: 'Approximate Location',
    subtitle: 'Find nearby healthcare resources',
    featureUsingIt: 'Ethiopian Healthcare & Pharmacy Discovery',
    explanation: 'Helps locate nearby health clinics, pharmacies, and walking routes in your Ethiopian locality.',
    privacyGuarantee: 'We only access coarse location when searching for facilities. Your ongoing location is never tracked.',
    iconName: 'MapPin'
  },
  notifications: {
    type: 'notifications',
    title: 'Notifications',
    subtitle: 'Contextual wellness reminders',
    featureUsingIt: 'Hydration, Medication & Fasting Alerts',
    explanation: 'Sends gentle reminders aligned with your fasting calendar, medication schedules, and hydration goals.',
    privacyGuarantee: 'You can mute, customize, or disable individual reminder categories at any time in Settings.',
    iconName: 'Bell'
  },
  health_connect: {
    type: 'health_connect',
    title: 'Granular Health Connect',
    subtitle: 'Sync steps, sleep & resting heart rate',
    featureUsingIt: 'Automated Recovery & Daily Movement',
    explanation: 'Reads step counts and sleep duration from Android Health Connect or connected wearables.',
    privacyGuarantee: 'Compliant with Android 16+ granular health guidelines. We only request read access to metrics you explicitly enable.',
    iconName: 'Activity'
  },
  bluetooth: {
    type: 'bluetooth',
    title: 'Nearby Bluetooth Devices',
    subtitle: 'Connect compatible health sensors',
    featureUsingIt: 'Wearable Fitness Tracker Sync',
    explanation: 'Connects directly to your fitness band or continuous glucose monitor via BLE.',
    privacyGuarantee: 'Bluetooth is only scanned while actively pairing your hardware device.',
    iconName: 'Bluetooth'
  }
};
