import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function AppCard({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
});
