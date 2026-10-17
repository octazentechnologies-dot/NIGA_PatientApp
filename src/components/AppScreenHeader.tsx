import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { layout, spacing } from '../theme/spacing';
import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  /** Soft brand wash under the header (no gradient). */
  brandWash?: boolean;
};

/**
 * Canonical in-app screen header — back + title + optional actions.
 * Presentation only; callers keep their existing navigation handlers.
 */
export function AppScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  right,
  brandWash = false,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        brandWash && styles.wash,
        { paddingTop: Math.max(insets.top, spacing.sm) },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            hitSlop={8}
            onPress={onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={styles.iconHit} />
        )}
        <View style={styles.titleBlock}>
          <AppText
            variant="titleMd"
            color={colors.ink}
            numberOfLines={1}
            style={styles.title}
            raw
          >
            {title}
          </AppText>
          {subtitle ? (
            <AppText
              variant="labelSm"
              color={colors.muted}
              numberOfLines={1}
              raw
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>
        <View style={styles.right}>{right ?? <View style={styles.iconHit} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
  },
  wash: {
    backgroundColor: colors.primaryContainer,
    borderBottomColor: colors.primaryFixedDim,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.minTapTarget,
  },
  iconHit: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    textAlign: 'left',
  },
  right: {
    minWidth: layout.minTapTarget,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
