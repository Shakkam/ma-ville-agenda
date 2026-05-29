import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { eventApi } from '@/api/client.js';
import { colors, spacing, typography } from '@/styles/colors.js';
import type { Event } from '@/types/index.js';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await eventApi.getEvent(eventId);
      setEvent(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load event';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'Événement non trouvé'}
        </Text>
      </View>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const formattedDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formattedStartTime = startDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedEndTime = endDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryColor = colors.category[event.category];

  return (
    <ScrollView style={styles.container}>
      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <View
          style={[styles.categoryBadge, { backgroundColor: categoryColor }]}
        >
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Date et heure</Text>
          <Text style={styles.text}>
            {formattedDate}
          </Text>
          <Text style={styles.text}>
            {formattedStartTime} - {formattedEndTime}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Lieu</Text>
          <Text style={styles.text}>{event.location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.text}>{event.description}</Text>
        </View>

        {event.externalUrl && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(event.externalUrl!)}
          >
            <Text style={styles.buttonText}>Voir plus d'infos</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  categoryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 18,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
});
