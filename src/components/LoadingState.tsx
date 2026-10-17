import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  label?: string;
};

export function LoadingState({ label }: Props) {
  return (
    <View style={styles.root} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.label} raw>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    textAlign: 'center',
  },
});
