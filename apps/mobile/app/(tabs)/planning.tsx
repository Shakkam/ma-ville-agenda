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

  const todayKey = dateKey(new Date());

  const renderDay = ({ date, state }: { date?: { dateString: string; day: number }; state?: string }) => {
    if (!date) return <View style={styles.dayCell} />;
    const cats = CATEGORIES.map((c) => c.cat).filter((c) => dayCategories[date.dateString]?.has(c));
    const isSelected = date.dateString === selectedDate;
    const isToday = date.dateString === todayKey;
    const outOfMonth = state === 'disabled';
    const isPast = date.dateString < todayKey;
    const dimmed = outOfMonth || (isPast && !isToday);
    const hasEvents = cats.length > 0;

    return (
      <TouchableOpacity
        style={[styles.dayCell, hasEvents && styles.dayCellEvent]}
        onPress={() => setSelectedDate(date.dateString)}
        disabled={outOfMonth}
      >
        <View
          style={[
            styles.dayNumWrap,
            isToday && !isSelected && styles.dayTodayRing,
            isSelected && styles.daySelected,
          ]}
        >
          <Text
            style={[
              styles.dayNum,
              dimmed && styles.dayDimmed,
              isToday && !isSelected && styles.dayToday,
              isSelected && styles.daySelectedText,
            ]}
          >
            {date.day}
          </Text>
        </View>
        <View style={styles.dayDots}>
          {cats.slice(0, 4).map((c) => (
            <View
              key={c}
              style={[styles.dot, { backgroundColor: colors.category[c] }, dimmed && styles.dotDim]}
            />
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
  arrow: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 14,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 50,
    paddingTop: 3,
    paddingBottom: 5,
    marginVertical: 1,
    borderRadius: 8,
  },
  dayCellEvent: {
    backgroundColor: 'rgba(45,147,196,0.10)',
  },
  dayNumWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayTodayRing: {
    borderWidth: 2,
    borderColor: colors.primary,
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
  dayDimmed: {
    color: colors.disabled,
  },
  dayDots: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 5,
    height: 8,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotDim: {
    opacity: 0.4,
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
