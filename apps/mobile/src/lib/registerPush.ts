import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { pushApi } from '../api/client';

export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    if (!Device.isDevice) {
      console.log('[Push] Not a physical device — skipping');
      return;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    console.log('[Push] Permission status:', existing);
    let status = existing;
    if (existing !== 'granted') {
      const { status: asked } = await Notifications.requestPermissionsAsync();
      status = asked;
      console.log('[Push] After request:', status);
    }
    if (status !== 'granted') {
      console.warn('[Push] Permission denied — no push token registered');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Général',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    console.log('[Push] projectId:', projectId);
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    console.log('[Push] Token obtained:', tokenResponse.data);

    await pushApi.register(tokenResponse.data, Platform.OS);
    console.log('[Push] Token registered with API ✓');
  } catch (e) {
    console.warn('[Push] Registration failed:', e);
  }
}
