import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/styles/colors';
import { registerForPushNotifications } from '@/lib/registerPush';

export default function RootLayout() {
  useEffect(() => {
    // No-op on web; on native, asks permission and registers the push token.
    registerForPushNotifications();
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.background,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="event/[id]"
          options={{
            title: 'Détail de l\'événement',
          }}
        />
      </Stack>
    </>
  );
}
