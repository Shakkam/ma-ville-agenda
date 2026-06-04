import React, { useEffect } from 'react';
import { View, SectionList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/store/eventStore';
import { EventCard } from '@/components/EventCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Hero, SponsorFooter } from '@/components/Hero';
import { colors, spacing } from '@/styles/colors';
import type { Event } from '@/types/index';

// Group events (already sorted by date asc) into day sections for an agenda view.
function groupEventsByDay(events: Event[]): { title: string; data: Event[] }[] {
  const order: string[] = [];
  const map: Record<string, { title: string; data: Event[] }> = {};
  for (const e of events) {
    const d = new Date(e.startDate);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) {
      const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      map[key] = { title: label.charAt(0).toUpperCase() + label.slice(1), data: [] };
      order.push(key);
    }
    map[key].data.push(e);
  }
  return order.map((k) => map[k]);
}

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

  const sections = groupEventsByDay(filteredEvents);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>📅 {section.title}</Text>
          </View>
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
        stickySectionHeadersEnabled={false}
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
  dateHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  dateHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
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
