import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SponsorFooter } from '@/components/Hero';
import { colors, spacing, typography } from '@/styles/colors';
import { registerForPushNotifications } from '../../src/lib/registerPush';

type PushStatus = 'idle' | 'checking' | 'ok' | 'denied' | 'error';

export default function AboutScreen() {
  const [pushStatus, setPushStatus] = useState<PushStatus>('idle');
  const [pushDetail, setPushDetail] = useState('');

  const testPush = async () => {
    if (Platform.OS === 'web') { setPushStatus('error'); setPushDetail('Web non supporté'); return; }
    setPushStatus('checking');
    setPushDetail('');
    try {
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: asked } = await Notifications.requestPermissionsAsync();
        if (asked !== 'granted') {
          setPushStatus('denied');
          setPushDetail('Permission refusée — active les notifications dans les Paramètres Android');
          return;
        }
      }
      await registerForPushNotifications();
      setPushStatus('ok');
      setPushDetail('Token enregistré ✓ — tu recevras les notifications push');
    } catch (e) {
      setPushStatus('error');
      setPushDetail(String(e));
    }
  };

  useEffect(() => { if (Platform.OS !== 'web') testPush(); }, []);

  const statusColor = { idle: '#90a4ae', checking: '#ffa726', ok: '#4caf50', denied: '#f44336', error: '#f44336' }[pushStatus];
  const statusLabel = { idle: '…', checking: 'Vérification…', ok: '✓ Actives', denied: '✗ Refusées', error: '✗ Erreur' }[pushStatus];

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

        <Text style={styles.section}>Notifications push</Text>
        <View style={[styles.pushBox, { borderColor: statusColor }]}>
          <Text style={[styles.pushStatus, { color: statusColor }]}>{statusLabel}</Text>
          {pushDetail ? <Text style={styles.pushDetail}>{pushDetail}</Text> : null}
        </View>
        <TouchableOpacity style={styles.retryBtn} onPress={testPush}>
          <Text style={styles.retryBtnText}>Tester / réactiver</Text>
        </TouchableOpacity>
      </View>

      <SponsorFooter />
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
  pushBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  pushStatus: {
    fontSize: 15,
    fontWeight: '700',
  },
  pushDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
