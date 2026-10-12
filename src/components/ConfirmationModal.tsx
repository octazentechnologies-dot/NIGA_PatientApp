import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { AppText } from './AppText';

export type ConfirmationModalVariant = 'danger' | 'warning' | 'primary';

export type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationModalVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  customIcon?: ReactNode;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  onRequestClose?: () => void;
  children?: ReactNode;
};

/**
 * Reusable, fully customized SaaS confirmation dialog modal.
 * Adheres strictly to app theme tokens (colors, radii, spacing, AppText).
 */
export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon,
  customIcon,
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  onRequestClose,
  children,
}: ConfirmationModalProps) {
  const handleClose = () => {
    if (loading) return;
    if (onRequestClose) {
      onRequestClose();
    } else {
      onCancel();
    }
  };

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const defaultIconName: keyof typeof Ionicons.glyphMap = isDanger
    ? 'trash-outline'
    : isWarning
      ? 'alert-circle-outline'
      : 'help-circle-outline';

  const iconName = icon || defaultIconName;

  const iconColor = isDanger
    ? colors.error
    : isWarning
      ? '#B76E00'
      : colors.primary;

  const iconBgColor = isDanger
    ? '#FDECEA'
    : isWarning
      ? '#FFF4E5'
      : colors.buttonFill;

  const iconBorderColor = isDanger
    ? '#F8D7DA'
    : isWarning
      ? '#FFE2B3'
      : colors.primaryContainer;

  const confirmBtnBg = isDanger
    ? colors.error
    : isWarning
      ? '#B76E00'
      : colors.button;

  return (
    <SafeAreaModal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          {customIcon ? (
            customIcon
          ) : (
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: iconBgColor,
                  borderColor: iconBorderColor,
                },
              ]}
            >
              <Ionicons name={iconName} size={26} color={iconColor} />
            </View>
          )}

          <AppText
            variant="titleMd"
            color={colors.onSurface}
            weightOverride="600"
            style={styles.title}
          >
            {title}
          </AppText>

          {message ? (
            <AppText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={styles.body}
            >
              {message}
            </AppText>
          ) : null}

          {children}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              disabled={loading}
              onPress={onCancel}
              style={styles.cancelBtn}
            >
              <AppText variant="titleMd" color={colors.onSurface} weightOverride="600">
                {cancelLabel}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              disabled={loading || confirmDisabled}
              onPress={onConfirm}
              style={[
                styles.confirmBtn,
                { backgroundColor: confirmBtnBg },
                (loading || confirmDisabled) && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <AppText variant="titleMd" color="#FFFFFF" weightOverride="600">
                  {confirmLabel}
                </AppText>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 27, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  confirmBtn: {
    flex: 1,
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
