import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@/styles/colors';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ma Ville Agenda</Text>

        <Text style={styles.section}>À propos</Text>
        <Text style={styles.text}>
          Ma Ville Agenda est une application mobile gratuite qui vous permet
          de découvrir facilement tous les événements de votre commune.
        </Text>

        <Text style={styles.section}>Version</Text>
        <Text style={styles.text}>0.1.0</Text>

        <Text style={styles.section}>Développé par</Text>
        <Text style={styles.text}>Équipe citoyenne de Léognan</Text>

        <Text style={styles.section}>Licence</Text>
        <Text style={styles.text}>MIT</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
