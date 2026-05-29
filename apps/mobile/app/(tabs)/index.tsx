import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/store/eventStore.js';
import { EventCard } from '@/components/EventCard.js';
import { CategoryFilter } from '@/components/CategoryFilter.js';
import { colors, spacing } from '@/styles/colors.js';
import type { Event } from '@/types/index.js';

export default function EventsScreen() {
  const router = useRouter();
  const {
    filteredEvents,
    loading,
    error,
    selectedCategory,
    fetchEvents,
    setSelectedCategory,
  } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  if (loading && filteredEvents.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {filteredEvents.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Aucun événement trouvé
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => handleEventPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </View>
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
  listContent: {
    paddingBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
