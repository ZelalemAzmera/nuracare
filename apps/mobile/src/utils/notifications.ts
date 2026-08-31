import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token = 'mock-push-token';
  return token;
}

export async function schedulePushNotification(title: string, body: string, secondsDelay = 2) {
  console.log(`[Notification] ${title}: ${body} in ${secondsDelay}s`);
}
