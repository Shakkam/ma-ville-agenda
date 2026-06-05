import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { pushApi } from '../api/client';

// Registers this device's Expo push token with the API so residents get
// notified when a new event is published.
//
// Native only: web push isn't supported here, and the heavy expo-notifications
// module is dynamically imported so it's never evaluated in the web bundle.
export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    // Physical device required (simulators don't get push tokens).
    if (!Device.isDevice) return;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Général',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    await pushApi.register(tokenResponse.data, Platform.OS);
  } catch (e) {
    // Never let notification setup crash the app.
    console.warn('Push registration skipped/failed:', e);
  }
}
