import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, typography } from '../styles/colors';
import type { Event } from '../types/index';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const categoryColor = colors.category[event.category];
  const startDate = new Date(event.startDate);
  const formattedDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <Text style={styles.date}>
          {formattedDate} • {formattedTime}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          📍 {event.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  categoryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  location: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
