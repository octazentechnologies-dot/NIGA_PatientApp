import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function FacebookLoader({ cards = 3 }: { cards?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: cards }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <Animated.View style={{ opacity }}>
        <View style={styles.topRow}>
          <View style={styles.avatar} />
          <View style={styles.copy}>
            <View style={[styles.line, styles.lineTitle]} />
            <View style={[styles.line, styles.lineWide]} />
            <View style={[styles.line, styles.lineMid]} />
            <View style={styles.chipRow}>
              <View style={styles.chip} />
              <View style={styles.chip} />
              <View style={styles.chip} />
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <View>
            <View style={[styles.line, styles.lineFee]} />
            <View style={[styles.line, styles.lineWhen]} />
          </View>
          <View style={styles.button} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  line: {
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  lineTitle: {
    width: '70%',
    height: 16,
  },
  lineWide: {
    width: '95%',
  },
  lineMid: {
    width: '55%',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    width: 64,
    height: 22,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineFee: {
    width: 120,
    height: 14,
    marginBottom: spacing.sm,
  },
  lineWhen: {
    width: 90,
  },
  button: {
    width: 76,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
});
