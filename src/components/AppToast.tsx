import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { AppText } from './AppText';

export type AppToastProps = {
  message: string | null;
  variant?: 'error' | 'success' | 'info';
  onDismiss?: () => void;
  durationMs?: number;
};

/**
 * Reusable in-app toast banner adhering to design system tokens.
 * Replaces Alert.alert across patient modules.
 */
export function AppToast({
  message,
  variant = 'error',
  onDismiss,
  durationMs = 4000,
}: AppToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  const isError = variant === 'error';
  const isSuccess = variant === 'success';

  const iconName: keyof typeof Ionicons.glyphMap = isError
    ? 'alert-circle'
    : isSuccess
      ? 'checkmark-circle'
      : 'information-circle';

  return (
    <View
      style={[
        styles.toast,
        { top: Math.max(insets.top, spacing.sm) + spacing.xs },
        isError
          ? styles.toastError
          : isSuccess
            ? styles.toastSuccess
            : styles.toastInfo,
      ]}
      pointerEvents="box-none"
    >
      <Ionicons name={iconName} size={18} color={colors.card} />
      <AppText variant="bodyMd" color={colors.card} style={styles.toastText} raw>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    left: spacing.gutter,
    right: spacing.gutter,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.full,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: colors.success,
  },
  toastError: {
    backgroundColor: colors.error,
  },
  toastInfo: {
    backgroundColor: colors.primary,
  },
  toastText: {
    flexShrink: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
});
