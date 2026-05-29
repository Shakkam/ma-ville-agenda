import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../styles/colors';
import type { EventCategory } from '../types/index';

type Category = EventCategory | null;

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

const categories: Array<{ label: string; value: EventCategory }> = [
  { label: 'Culture', value: 'CULTURE' },
  { label: 'Sport', value: 'SPORT' },
  { label: 'Animation', value: 'ANIMATION' },
  { label: 'Commerce', value: 'COMMERCE' },
  { label: 'Autre', value: 'AUTRE' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.chip, selected === null && styles.chipSelected]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[styles.chipText, selected === null && styles.chipTextSelected]}
          >
            Tous
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.chip,
              selected === cat.value && [
                styles.chipSelected,
                { backgroundColor: colors.category[cat.value] },
              ],
            ]}
            onPress={() => onSelect(cat.value)}
          >
            <Text
              style={[
                styles.chipText,
                selected === cat.value && styles.chipTextSelected,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  chip: {
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.background,
  },
});
