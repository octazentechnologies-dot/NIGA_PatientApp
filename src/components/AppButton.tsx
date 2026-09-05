import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import type { TypographyVariant } from '../theme/typography';
import { AppText } from './AppText';

type AppButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  textVariant?: TypographyVariant;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
};

export function AppButton({
  label,
  variant = 'primary',
  textVariant = 'labelLg',
  loading = false,
  icon,
  iconPosition = 'start',
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDisabled = disabled || loading;
  const labelColor = isPrimary ? colors.onButton : colors.button;

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
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'start' ? icon : null}
          <AppText
            variant={textVariant === 'titleMd' ? 'labelLg' : textVariant}
            color={labelColor}
            style={styles.label}
            numberOfLines={2}
          >
            {label}
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
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'transparent',
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
