import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/store/eventStore';
import { EventCard } from '@/components/EventCard';
import { colors, spacing } from '@/styles/colors';
import type { Event, EventCategory } from '@/types/index';

// French localization for the calendar.
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = 'fr';

const CATEGORIES: { cat: EventCategory; label: string }[] = [
  { cat: 'CULTURE', label: 'Culture' },
  { cat: 'SPORT', label: 'Sport' },
  { cat: 'ANIMATION', label: 'Animation' },
  { cat: 'COMMERCE', label: 'Commerce' },
  { cat: 'AUTRE', label: 'Autre' },
];

const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function PlanningScreen() {
  const router = useRouter();
  const { events, fetchEvents } = useEventStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // One colored dot per category present on each day (multi-dot marking).
  const markedDates = useMemo(() => {
    const dayCats: Record<string, Set<EventCategory>> = {};
    for (const e of events) {
      const k = dateKey(new Date(e.startDate));
      (dayCats[k] ??= new Set()).add(e.category);
    }

    const marks: Record<string, {
      dots?: { key: string; color: string }[];
      selected?: boolean;
      selectedColor?: string;
    }> = {};

    for (const [day, cats] of Object.entries(dayCats)) {
      marks[day] = {
        dots: Array.from(cats).map((c) => ({ key: c, color: colors.category[c] })),
      };
    }

    if (selectedDate) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: colors.primary };
    }
    return marks;
  }, [events, selectedDate]);

  const dayEvents: Event[] = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => dateKey(new Date(e.startDate)) === selectedDate);
  }, [events, selectedDate]);

  return (
    <ScrollView style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="multi-dot"
        firstDay={1}
        enableSwipeMonths
        theme={{
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          textMonthFontWeight: '700',
        }}
      />

      {/* Legend */}
      <View style={styles.legend}>
        {CATEGORIES.map(({ cat, label }) => (
          <View key={cat} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.category[cat] }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.dayPanel}>
        {!selectedDate ? (
          <Text style={styles.hint}>📆 Touchez un jour pour voir ses événements</Text>
        ) : dayEvents.length === 0 ? (
          <Text style={styles.hint}>Aucun événement ce jour-là</Text>
        ) : (
          <>
            <Text style={styles.dayTitle}>
              {dayEvents.length} événement{dayEvents.length > 1 ? 's' : ''}
            </Text>
            {dayEvents.map((event) => (
              <EventCard key={event.id} event={event} onPress={() => router.push(`/event/${event.id}`)} />
            ))}
          </>
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dayPanel: {
    paddingVertical: spacing.md,
  },
  hint: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
