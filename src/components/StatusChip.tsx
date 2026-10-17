import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

export type StatusChipTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'astro';

const TONE: Record<
  StatusChipTone,
  { ink: string; fill: string }
> = {
  neutral: { ink: colors.muted, fill: colors.surfaceVariant },
  info: { ink: colors.onPrimaryContainer, fill: colors.primaryContainer },
  success: { ink: colors.onSuccessContainer, fill: colors.successContainer },
  warning: { ink: colors.onWarningContainer, fill: colors.warningContainer },
  danger: { ink: colors.onErrorContainer, fill: colors.errorContainer },
  astro: { ink: colors.onAstroContainer, fill: colors.astroContainer },
};

type Props = {
  label: string;
  tone?: StatusChipTone;
};

/** Compact status pill — state indicator, not a button. */
export function StatusChip({ label, tone = 'neutral' }: Props) {
  const palette = TONE[tone];
  if (!label.trim()) {
    return null;
  }
  return (
    <View style={[styles.chip, { backgroundColor: palette.fill }]}>
      <AppText
        variant="labelSm"
        color={palette.ink}
        weightOverride="600"
        raw
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    maxWidth: '100%',
  },
});
