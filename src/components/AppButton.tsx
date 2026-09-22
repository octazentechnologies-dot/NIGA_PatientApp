import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';

import { toUiLabel } from '../utilities/textCase';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { AppText } from './AppText';

type AppButtonProps = PressableProps & {
  label: string;
  /** `primary` = filled; `secondary` = outline; `ghost` = text only. */
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  /**
   * @deprecated Label size is fixed for uniformity (titleMd — matches Doctor app).
   * Kept so existing call sites compile; ignored.
   */
  textVariant?: string;
};

/** @deprecated Prefer `toUiLabel` from utilities/textCase. */
export const toButtonLabel = toUiLabel;

/**
 * Canonical patient-app action button.
 * Filled: `#2A7BA3` + white label. Outline: `#2A7BA3` border + label.
 * Pill corners, titleMd (18 SemiBold) label — same as Doctor app buttons.
 */
export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  icon,
  iconPosition = 'start',
  disabled,
  style,
  textVariant: _textVariant,
  ...props
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDisabled = disabled || loading;
  const labelColor = isPrimary ? colors.onButton : colors.button;
  const displayLabel = toUiLabel(label);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isGhost && styles.ghost,
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style(state) : style,
        // Keep shape uniform even if callers pass a conflicting radius.
        styles.pill,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'start' ? icon : null}
          <AppText
            variant="titleMd"
            color={labelColor}
            weightOverride="600"
            style={styles.label}
            numberOfLines={2}
            raw
          >
            {displayLabel}
          </AppText>
          {iconPosition === 'end' ? icon : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    textAlign: 'center',
    flexShrink: 1,
  },
  primary: {
    backgroundColor: colors.button,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.button,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
