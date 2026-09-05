import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AppLanguage } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

type LanguageToggleProps = {
  language: AppLanguage;
  englishLabel: string;
  marathiLabel: string;
  languageLabel: string;
  onSelect: (language: AppLanguage) => void;
};

export function LanguageToggle({
  language,
  englishLabel,
  marathiLabel,
  languageLabel,
  onSelect,
}: LanguageToggleProps) {
  return (
    <View>
      <View style={styles.captionRow}>
        <Ionicons
          name="globe-outline"
          size={18}
          color={colors.secondary}
        />
        <AppText variant="labelMd" color={colors.onSurfaceVariant}>
          {languageLabel}
        </AppText>
      </View>
      <View style={styles.row}>
        <Chip
          label={englishLabel}
          selected={language === 'en'}
          onPress={() => onSelect('en')}
        />
        <Chip
          label={marathiLabel}
          selected={language === 'mr'}
          onPress={() => onSelect('mr')}
        />
      </View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <AppText
        variant="labelMd"
        color={selected ? colors.onPrimary : colors.secondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.secondary,
  },
});
