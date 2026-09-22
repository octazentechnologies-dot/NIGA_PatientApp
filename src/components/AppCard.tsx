import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

export function AppCard({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: radii.default,
    padding: layout.cardPadding,
    gap: spacing.ms,
  },
});
