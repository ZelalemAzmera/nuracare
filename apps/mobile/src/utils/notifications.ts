import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16a34a',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
    token = 'mock-push-token'; // Replace with real token when projectId is configured
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function schedulePushNotification(title: string, body: string, secondsDelay = 2) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: 'goes here' },
    },
    trigger: { seconds: secondsDelay },
  });
}
