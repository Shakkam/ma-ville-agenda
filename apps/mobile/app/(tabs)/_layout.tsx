import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/styles/colors.js';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Événements',
          tabBarLabel: 'Événements',
          tabBarIcon: ({ color }) => <EventIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'À propos',
          tabBarLabel: 'À propos',
          tabBarIcon: ({ color }) => <InfoIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

function EventIcon({ color }: { color: string }) {
  return <EventSymbol color={color} />;
}

function InfoIcon({ color }: { color: string }) {
  return <InfoSymbol color={color} />;
}

// Simple icon replacements (will be replaced with Ionicons in real app)
function EventSymbol({ color }: { color: string }) {
  return <Text style={{ fontSize: 20, color }}>📅</Text>;
}

function InfoSymbol({ color }: { color: string }) {
  return <Text style={{ fontSize: 20, color }}>ℹ️</Text>;
}

import { Text } from 'react-native';
