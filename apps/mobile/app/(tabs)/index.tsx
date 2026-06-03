import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/store/eventStore';
import { EventCard } from '@/components/EventCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Hero, SponsorFooter } from '@/components/Hero';
import { colors, spacing } from '@/styles/colors';
import type { Event } from '@/types/index';

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

  if (error) {
    return (
      <View style={styles.container}>
        <Hero />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Erreur: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
        ListHeaderComponent={
          <>
            <Hero />
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Text style={styles.emptyText}>Aucun événement trouvé</Text>
            )}
          </View>
        }
        ListFooterComponent={<SponsorFooter />}
        contentContainerStyle={styles.listContent}
      />
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
  emptyBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
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
