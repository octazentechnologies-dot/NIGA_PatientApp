import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { radii } from '../../theme/radii';
import { layout, spacing } from '../../theme/spacing';
import { usePatientTabScrollInset } from '../PatientTabBar';
import { SkeletonBone, SkeletonPulse } from './Skeleton';

function TabSkeletonChrome({
  children,
  showHeaderSearch = false,
}: {
  children: ReactNode;
  showHeaderSearch?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();

  return (
    <View style={styles.root} accessibilityRole="progressbar">
      <SkeletonPulse style={styles.flex}>
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
          ]}
        >
          <View style={styles.headerRow}>
            <SkeletonBone width={140} height={22} />
            <View style={styles.headerActions}>
              <SkeletonBone width={40} height={40} radius={radii.full} />
              <SkeletonBone width={40} height={40} radius={radii.full} />
            </View>
          </View>
          {showHeaderSearch ? (
            <SkeletonBone
              width="100%"
              height={48}
              radius={radii.button}
              style={styles.searchBone}
            />
          ) : null}
        </View>
        <View style={[styles.body, { paddingBottom: tabScrollInset }]}>
          {children}
        </View>
      </SkeletonPulse>
    </View>
  );
}

function CardRow() {
  return (
    <View style={styles.card}>
      <SkeletonBone width={48} height={48} radius={radii.full} />
      <View style={styles.cardCopy}>
        <SkeletonBone width="70%" height={14} />
        <SkeletonBone width="45%" height={12} />
        <SkeletonBone width={72} height={22} radius={radii.sm} />
      </View>
    </View>
  );
}

export function HomeTabSkeleton() {
  return (
    <TabSkeletonChrome>
      <View style={styles.chipRow}>
        <SkeletonBone width={88} height={36} radius={radii.full} />
        <SkeletonBone width={104} height={36} radius={radii.full} />
        <SkeletonBone width={96} height={36} radius={radii.full} />
      </View>
      <View style={styles.quickGrid}>
        <SkeletonBone width="47%" height={88} radius={radii.sm} />
        <SkeletonBone width="47%" height={88} radius={radii.sm} />
        <SkeletonBone width="47%" height={88} radius={radii.sm} />
        <SkeletonBone width="47%" height={88} radius={radii.sm} />
      </View>
      <SkeletonBone width={160} height={18} style={styles.sectionTitle} />
      <CardRow />
      <CardRow />
    </TabSkeletonChrome>
  );
}

export function DoctorsTabSkeleton() {
  return (
    <TabSkeletonChrome showHeaderSearch>
      <DoctorListBones />
    </TabSkeletonChrome>
  );
}

function DoctorListBones() {
  return (
    <View style={styles.listOnly}>
      <SkeletonBone width={160} height={18} style={styles.sectionTitle} />
      <View style={styles.chipRow}>
        <SkeletonBone width={72} height={32} radius={radii.full} />
        <SkeletonBone width={88} height={32} radius={radii.full} />
        <SkeletonBone width={96} height={32} radius={radii.full} />
      </View>
      <CardRow />
      <CardRow />
      <CardRow />
      <CardRow />
    </View>
  );
}

/** List-only bones for use under an existing Doctors tab header. */
export function DoctorListSkeleton() {
  return (
    <SkeletonPulse>
      <DoctorListBones />
    </SkeletonPulse>
  );
}

export function RecordsTabSkeleton() {
  return (
    <TabSkeletonChrome>
      <View style={styles.memberRow}>
        <SkeletonBone width={56} height={56} radius={radii.full} />
        <SkeletonBone width={56} height={56} radius={radii.full} />
        <SkeletonBone width={56} height={56} radius={radii.full} />
        <SkeletonBone width={56} height={56} radius={radii.full} />
      </View>
      <View style={styles.chipRow}>
        <SkeletonBone width={64} height={32} radius={radii.full} />
        <SkeletonBone width={96} height={32} radius={radii.full} />
        <SkeletonBone width={88} height={32} radius={radii.full} />
      </View>
      <SkeletonBone width={120} height={16} style={styles.sectionTitle} />
      <CardRow />
      <CardRow />
      <CardRow />
    </TabSkeletonChrome>
  );
}

export function MedicinesTabSkeleton() {
  return (
    <TabSkeletonChrome>
      <View style={styles.heroCard}>
        <SkeletonBone width="55%" height={18} />
        <SkeletonBone width="80%" height={12} />
        <SkeletonBone
          width="100%"
          height={layout.buttonHeight}
          radius={radii.button}
          style={styles.ctaBone}
        />
      </View>
      <SkeletonBone width={140} height={16} style={styles.sectionTitle} />
      <CardRow />
      <CardRow />
    </TabSkeletonChrome>
  );
}

export function AccountTabSkeleton() {
  return (
    <TabSkeletonChrome>
      <View style={styles.profileCard}>
        <SkeletonBone width={72} height={72} radius={radii.full} />
        <SkeletonBone width={160} height={18} />
        <SkeletonBone width={120} height={12} />
      </View>
      <View style={styles.menuList}>
        <SkeletonBone width="100%" height={52} radius={radii.sm} />
        <SkeletonBone width="100%" height={52} radius={radii.sm} />
        <SkeletonBone width="100%" height={52} radius={radii.sm} />
        <SkeletonBone width="100%" height={52} radius={radii.sm} />
        <SkeletonBone width="100%" height={52} radius={radii.sm} />
      </View>
    </TabSkeletonChrome>
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
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    minHeight: layout.minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBone: {
    marginTop: spacing.xs,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ctaBone: {
    marginTop: spacing.sm,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingVertical: spacing.lg,
  },
  menuList: {
    gap: spacing.sm,
  },
  listOnly: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
});
