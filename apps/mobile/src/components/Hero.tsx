import React from 'react';
import { ImageBackground, View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/colors';

export const Hero: React.FC = () => {
  return (
    <ImageBackground
      source={require('../../assets/leognan.jpg')}
      style={styles.hero}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>Ma Ville Agenda</Text>
        <Text style={styles.subtitle}>Léognan · l'agenda de votre commune</Text>
      </View>
    </ImageBackground>
  );
};

export const SponsorFooter: React.FC = () => {
  return (
    <View style={styles.sponsor}>
      <Text style={styles.sponsorLabel}>Avec le soutien de</Text>
      <Image
        source={require('../../assets/pensee-gironde.jpg')}
        style={styles.sponsorLogo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sponsor: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sponsorLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sponsorLogo: {
    width: 170,
    height: 56,
  },
});
