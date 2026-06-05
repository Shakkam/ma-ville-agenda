import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const CATEGORY_ICON: Record<EventCategory, string> = {
  CULTURE: '🎭',
  SPORT: '🏅',
  ANIMATION: '🎉',
  COMMERCE: '🛍️',
  AUTRE: '📌',
};

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

  // Map each day -> the distinct categories present that day (ordered as CATEGORIES).
  const dayCategories = useMemo(() => {
    const map: Record<string, Set<EventCategory>> = {};
    for (const e of events) {
      const k = dateKey(new Date(e.startDate));
      (map[k] ??= new Set()).add(e.category);
    }
    return map;
  }, [events]);

  const dayEvents: Event[] = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => dateKey(new Date(e.startDate)) === selectedDate);
  }, [events, selectedDate]);

  const initialMonth = useMemo(() => {
    if (events.length === 0) return undefined;
    const earliest = events.reduce((min, e) => (e.startDate < min ? e.startDate : min), events[0].startDate);
    return dateKey(new Date(earliest));
  }, [events]);

  const renderDay = ({ date, state }: { date?: { dateString: string; day: number }; state?: string }) => {
    if (!date) return <View style={styles.dayCell} />;
    const cats = CATEGORIES.map((c) => c.cat).filter((c) => dayCategories[date.dateString]?.has(c));
    const isSelected = date.dateString === selectedDate;
    const isToday = state === 'today';
    const disabled = state === 'disabled';

    return (
      <TouchableOpacity style={styles.dayCell} onPress={() => setSelectedDate(date.dateString)} disabled={disabled}>
        <View style={[styles.dayNumWrap, isSelected && styles.daySelected]}>
          <Text
            style={[
              styles.dayNum,
              disabled && styles.dayDisabled,
              isToday && !isSelected && styles.dayToday,
              isSelected && styles.daySelectedText,
            ]}
          >
            {date.day}
          </Text>
        </View>
        <View style={styles.dayIcons}>
          {cats.slice(0, 3).map((c) => (
            <Text key={c} style={styles.dayIcon}>{CATEGORY_ICON[c]}</Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Calendar
        key={initialMonth ?? 'today'}
        current={initialMonth}
        dayComponent={renderDay}
        firstDay={1}
        enableSwipeMonths
        renderArrow={(direction) => (
          <Text style={styles.arrow}>{direction === 'left' ? '‹' : '›'}</Text>
        )}
        theme={{
          arrowColor: colors.primary,
          textMonthFontWeight: '700',
        }}
      />

      {/* Legend */}
      <View style={styles.legend}>
        {CATEGORIES.map(({ cat, label }) => (
          <View key={cat} style={styles.legendItem}>
            <Text style={styles.legendIcon}>{CATEGORY_ICON[cat]}</Text>
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
  arrow: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 14,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 46,
    paddingTop: 2,
  },
  dayNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayNum: {
    fontSize: 15,
    color: colors.text,
  },
  daySelectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  dayToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayDisabled: {
    color: colors.disabled,
  },
  dayIcons: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 1,
    height: 14,
  },
  dayIcon: {
    fontSize: 11,
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
    gap: 4,
  },
  legendIcon: {
    fontSize: 14,
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
