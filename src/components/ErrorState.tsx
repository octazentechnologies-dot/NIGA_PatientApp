import { StyleSheet, View } from 'react-native';

import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Try again',
}: Props) {
  return (
    <View style={styles.root}>
      <AppText variant="titleMd" color={colors.error} style={styles.title} raw>
        Something went wrong
      </AppText>
      <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.body} raw>
        {message}
      </AppText>
      {onRetry ? (
        <AppButton label={retryLabel} onPress={onRetry} variant="secondary" />
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
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
