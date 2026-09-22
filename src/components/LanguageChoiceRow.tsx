import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { AppLanguage } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

type LanguageChoiceRowProps = {
  languageCode: AppLanguage;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

export function LanguageChoiceRow({
  languageCode,
  title,
  subtitle,
  selected,
  onPress,
}: LanguageChoiceRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.row, selected ? styles.rowSelected : styles.rowIdle]}
    >
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={selected ? colors.button : colors.outlineVariant}
      />
      <View style={styles.labels}>
        <AppText
          variant="bodyLg"
          color="#000000"
          languageOverride={languageCode}
          weightOverride="600"
        >
          {title}
        </AppText>
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          languageOverride={languageCode}
        >
          {subtitle}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 64,
    borderRadius: radii.sm,
  },
  rowSelected: {
    backgroundColor: colors.buttonFill,
    borderWidth: 1.5,
    borderColor: colors.button,
  },
  rowIdle: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  labels: {
    flex: 1,
  },
});
