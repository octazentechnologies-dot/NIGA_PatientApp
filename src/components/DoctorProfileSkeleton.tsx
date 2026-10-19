import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

/**
 * Shimmer that mirrors DoctorProfileView layout (hero, tabs, about cards, footer).
 */
export function DoctorProfileSkeleton() {
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      <Animated.View style={[styles.flex, { opacity }]}>
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(insets.top, spacing.sm) },
          ]}
        >
          <View style={styles.topBar}>
            <View style={styles.iconBone} />
            <View style={styles.iconBone} />
          </View>
          <View style={styles.hero}>
            <View style={styles.avatar} />
            <View style={[styles.line, styles.nameLine]} />
            <View style={[styles.line, styles.credLine]} />
            <View style={styles.statChip} />
          </View>
        </View>

        <View style={styles.tabs}>
          <View style={styles.tabBone} />
          <View style={styles.tabBone} />
          <View style={styles.tabBone} />
          <View style={styles.tabBone} />
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.shield} />
              <View style={[styles.line, styles.cardTitle]} />
            </View>
            <View style={styles.checkRow}>
              <View style={styles.dot} />
              <View style={[styles.line, styles.checkLine]} />
            </View>
            <View style={styles.checkRow}>
              <View style={styles.dot} />
              <View style={[styles.line, styles.checkLineShort]} />
            </View>
            <View style={[styles.line, styles.linkLine]} />
          </View>

          <View style={[styles.line, styles.summaryLine]} />
          <View style={[styles.line, styles.summaryLineShort]} />

          <View style={[styles.line, styles.sectionTitle]} />
          <View style={styles.consultRow}>
            <View style={styles.consultIcon} />
            <View style={[styles.line, styles.consultLabel]} />
            <View style={[styles.line, styles.consultFee]} />
          </View>
          <View style={styles.consultRow}>
            <View style={styles.consultIcon} />
            <View style={[styles.line, styles.consultLabel]} />
            <View style={[styles.line, styles.consultFee]} />
          </View>
        </View>
      </Animated.View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <Animated.View style={{ opacity }}>
          <View style={styles.availBar}>
            <View style={styles.availIcon} />
            <View style={[styles.line, styles.availLine]} />
          </View>
          <View style={styles.footerRow}>
            <View>
              <View style={[styles.line, styles.feeLine]} />
              <View style={[styles.line, styles.feeLineShort]} />
            </View>
            <View style={styles.bookButton} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.card,
    paddingBottom: spacing.md,
  },
  topBar: {
    minHeight: layout.minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  iconBone: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  line: {
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  nameLine: {
    width: 200,
    height: 20,
    marginTop: spacing.xs,
  },
  credLine: {
    width: 80,
    height: 14,
  },
  statChip: {
    width: 96,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    marginTop: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  tabBone: {
    width: 72,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  body: {
    padding: spacing.gutter,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  shield: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cardTitle: {
    width: '70%',
    height: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  checkLine: {
    flex: 1,
    height: 12,
  },
  checkLineShort: {
    width: '55%',
    height: 12,
  },
  linkLine: {
    width: 96,
    height: 14,
    marginTop: spacing.xs,
  },
  summaryLine: {
    width: '92%',
    height: 12,
  },
  summaryLineShort: {
    width: '60%',
    height: 12,
  },
  sectionTitle: {
    width: 140,
    height: 18,
    marginTop: spacing.sm,
  },
  consultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  consultIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  consultLabel: {
    flex: 1,
    height: 14,
  },
  consultFee: {
    width: 40,
    height: 14,
  },
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  availBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  availIcon: {
    width: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  availLine: {
    flex: 1,
    height: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: layout.buttonHeight,
  },
  feeLine: {
    width: 72,
    height: 14,
    marginBottom: spacing.xs,
  },
  feeLineShort: {
    width: 88,
    height: 14,
  },
  bookButton: {
    width: 168,
    height: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.surfaceContainerHigh,
  },
});
