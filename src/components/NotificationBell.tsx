import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { AppText } from './AppText';

type NotificationBellProps = {
  count: number;
  label: string;
  onPress: () => void;
};

/** Bell with an unread count. Hidden when the inbox has nothing unread. */
export function NotificationBell({ count, label, onPress }: NotificationBellProps) {
  const labelCount = count > 99 ? '99+' : String(count);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `${label}, ${labelCount}` : label}
      onPress={onPress}
      style={styles.hit}
    >
      <View style={styles.glyph}>
        <Ionicons name="notifications-outline" size={24} color={colors.onSurface} />
        {count > 0 ? (
          <View style={styles.badge}>
            <AppText
              variant="labelSm"
              color={colors.onError}
              languageOverride="en"
              raw
              weightOverride="700"
              style={styles.badgeLabel}
            >
              {labelCount}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    width: 24,
    height: 24,
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: radii.full,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
  },
});
