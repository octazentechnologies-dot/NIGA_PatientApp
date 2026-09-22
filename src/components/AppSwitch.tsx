import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';

type AppSwitchProps = {
  value: boolean;
  disabled?: boolean;
  /** RN Switch-compatible API. */
  onValueChange?: (value: boolean) => void;
  /** Convenience when the parent only flips state. */
  onToggle?: () => void;
};

/**
 * Patient-app toggle — pill track, blue thumb + white check when on.
 * Matches the product screenshot used across Consent, Account, Reminders, etc.
 */
export function AppSwitch({
  value,
  disabled = false,
  onValueChange,
  onToggle,
}: AppSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
      onPress={() => {
        if (disabled) {
          return;
        }
        if (onValueChange) {
          onValueChange(!value);
          return;
        }
        onToggle?.();
      }}
      style={[styles.hit, disabled && styles.disabled]}
    >
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]}>
          {value ? (
            <Ionicons name="checkmark" size={12} color={colors.onButton} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const TRACK_H = 28;
const THUMB = 22;
const PAD = 3;

const styles = StyleSheet.create({
  hit: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: 48,
    height: TRACK_H,
    borderRadius: radii.full,
    paddingHorizontal: PAD,
    justifyContent: 'center',
    borderWidth: 1,
  },
  trackOff: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    alignItems: 'flex-start',
  },
  trackOn: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    alignItems: 'flex-end',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOn: {
    backgroundColor: colors.button,
  },
  thumbOff: {
    backgroundColor: colors.outline,
  },
});
