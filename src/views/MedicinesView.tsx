import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { usePatientTabScrollInset } from '../components/PatientTabBar';
import {
  useMedicinesController,
  type MedicinesViewModel,
  type PastOrder,
  type PastOrderStatus,
} from '../controllers/useMedicinesController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const CHIP_FILL = '#E6F5FE';
const CHART = '#3AA9E0';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';

export function MedicinesView({
  onBookFollowUp,
  onSeePrescriptions,
  onTrackOrder,
  onOrderRx,
  onOpenPastOrder,
  onOpenNotifications,
  forceHasOrders,
}: {
  onBookFollowUp?: () => void;
  onSeePrescriptions?: () => void;
  onTrackOrder?: () => void;
  onOrderRx?: (id: string) => void;
  onOpenPastOrder?: (id: string) => void;
  onOpenNotifications?: () => void;
  forceHasOrders?: boolean;
} = {}) {
  const vm = useMedicinesController({
    onBookFollowUp,
    onSeePrescriptions,
    onTrackOrder,
    onOrderRx,
    onOpenPastOrder,
    onOpenNotifications,
    forceHasOrders,
  });
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        {vm.hasOrders ? <ListHeader vm={vm} /> : <EmptyHeader vm={vm} />}
      </View>

      {vm.hasOrders ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.body,
            { paddingBottom: tabScrollInset },
          ]}
        >
          <MemberChips vm={vm} />
          <ActiveOrderCard vm={vm} />
          <PrescriptionsSection vm={vm} />
          <PastOrdersSection vm={vm} />
          <Pressable
            accessibilityRole="button"
            onPress={vm.onOpenHelp}
            style={styles.helpRow}
          >
            <View style={styles.helpLeft}>
              <View style={styles.helpIcon}>
                <Ionicons name="help-circle-outline" size={18} color={ACTION} />
              </View>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('medsProblemOrder')}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={MUTED} />
          </Pressable>
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <MemberChips vm={vm} />
          <View style={styles.emptyCenter}>
            <EmptyState vm={vm} />
          </View>
        </View>
      )}
    </View>
  );
}

function HeaderActions({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vm.t('languageLabel')}
        onPress={() => vm.onSelectLanguage(vm.language === 'en' ? 'mr' : 'en')}
        style={styles.languageButton}
      >
        <AppText
          variant="labelMd"
          color={INK}
          languageOverride={vm.language === 'en' ? 'en' : 'mr'}
        >
          {vm.language === 'en' ? 'EN' : 'मराठी'}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vm.t('homeNotifications')}
        onPress={vm.onOpenNotifications}
        style={styles.bellButton}
      >
        <Ionicons name="notifications-outline" size={22} color={INK} />
        <View style={styles.bellDot} />
      </Pressable>
    </View>
  );
}

function ListHeader({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.flex}>
        <AppText variant="headlineMd" color={INK}>
          {vm.t('medsTitle')}
        </AppText>
        <AppText variant="labelSm" color={MUTED}>
          {vm.t('medsSubtitle')}
        </AppText>
      </View>
      <HeaderActions vm={vm} />
    </View>
  );
}

function EmptyHeader({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        onPress={() => vm.onSelectMember('everyone')}
        style={styles.emptyTitleBlock}
      >
        <View style={styles.titleWithCaret}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('medsTitle')}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={INK} />
        </View>
        <AppText variant="labelSm" color={MUTED}>
          {vm.t('medsAllFamily')}
        </AppText>
      </Pressable>
      <HeaderActions vm={vm} />
    </View>
  );
}

function MemberChips({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={styles.chipScrollWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {vm.members.map((member) => {
          const on = member.id === vm.memberId;
          return (
            <Pressable
              key={member.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => vm.onSelectMember(member.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <AppText
                variant="labelMd"
                color={on ? INK : MUTED}
                weightOverride={on ? '600' : '500'}
              >
                {vm.t(member.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ActiveOrderCard({ vm }: { vm: MedicinesViewModel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={vm.t('medsTrackOrder')}
      onPress={vm.onTrackOrder}
      style={styles.card}
    >
      <View style={styles.activeHead}>
        <View style={styles.flex}>
          <AppText
            variant="labelSm"
            color={ACTION}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('medsActiveOrder')}
          </AppText>
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {vm
              .t('medsActiveOrderLine')
              .replace('{id}', vm.activeOrderId)
              .replace('{status}', vm.activeStatusLine)}
          </AppText>
        </View>
        <Ionicons name="car-outline" size={24} color={ACTION} />
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: vm.activeProgressTotal }).map((_, index) => {
          const filled = index < vm.activeProgressFilled;
          const isLastFilled = index === vm.activeProgressFilled - 1;
          return (
            <View
              key={`step-${index}`}
              style={[
                styles.progressSeg,
                index === 0 && styles.progressSegFirst,
                index === vm.activeProgressTotal - 1 && styles.progressSegLast,
                filled ? styles.progressSegOn : styles.progressSegOff,
              ]}
            >
              {isLastFilled ? <View style={styles.progressDot} /> : null}
            </View>
          );
        })}
      </View>

      <AppText variant="headlineMd" color={INK}>
        {vm.arrivingBy}
      </AppText>
      <AppText variant="bodyMd" color={MUTED}>
        {vm.fulfilledBy}
      </AppText>
      <AppButton
        label={vm.t('medsTrackOrder')}
        onPress={vm.onTrackOrder}
        style={styles.trackBtn}
      />
    </Pressable>
  );
}

function PrescriptionsSection({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={styles.section}>
      <AppText variant="headlineMd" color={INK}>
        {vm.t('medsRxSection')}
      </AppText>
      {vm.orderableRx.map((rx) => (
        <View
          key={rx.id}
          style={[styles.card, rx.expired && styles.rxExpiredCard]}
        >
          <View style={styles.rxTop}>
            <View style={[styles.rxIcon, rx.expired && styles.rxIconMuted]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={rx.expired ? MUTED : ACTION}
              />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {rx.title}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {rx.doctorLine}
              </AppText>
            </View>
          </View>
          <View
            style={[
              styles.badge,
              rx.expired ? styles.badgeDanger : styles.badgeSuccess,
            ]}
          >
            <AppText
              variant="labelSm"
              color={rx.expired ? DANGER : SUCCESS}
              weightOverride="500"
            >
              {vm.t(rx.badgeKey)}
            </AppText>
          </View>
          {rx.expired ? (
            <Pressable
              accessibilityRole="button"
              onPress={vm.onBookFollowUp}
              style={styles.followLink}
            >
              <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
                {vm.t('medsBookFollowUp')}
              </AppText>
              <Ionicons name="arrow-forward" size={16} color={ACTION_OUTLINE} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => vm.onOrderRx(rx.id)}
              style={styles.outlineBtn}
            >
              <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
                {vm.t('medsOrder')}
              </AppText>
            </Pressable>
          )}
        </View>
      ))}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle" size={16} color={ACTION} />
        <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
          {vm.t('medsPharmacyNote')}
        </AppText>
      </View>
    </View>
  );
}

function PastOrdersSection({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={[styles.section, styles.pastSection]}>
      <AppText variant="headlineMd" color={INK}>
        {vm.t('medsPastOrders')}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {vm.pastFilters.map((filter) => {
          const on = filter.id === vm.pastFilter;
          return (
            <Pressable
              key={filter.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => vm.onSelectPastFilter(filter.id)}
              style={[styles.filterChip, on && styles.chipOn]}
            >
              <AppText
                variant="labelSm"
                color={on ? INK : MUTED}
                weightOverride={on ? '600' : '500'}
              >
                {vm.t(filter.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.pastList}>
        {vm.pastOrders.map((order, index) => (
          <PastOrderRow
            key={order.id}
            order={order}
            t={vm.t}
            bordered={index < vm.pastOrders.length - 1}
            onPress={() => vm.onOpenPastOrder(order.id)}
            onReorder={() => vm.onReorder(order.id)}
          />
        ))}
      </View>
    </View>
  );
}

function PastOrderRow({
  order,
  t,
  bordered,
  onPress,
  onReorder,
}: {
  order: PastOrder;
  t: MedicinesViewModel['t'];
  bordered: boolean;
  onPress: () => void;
  onReorder: () => void;
}) {
  const mutedRow = order.status !== 'delivered';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.pastRow, bordered && styles.pastBorder, mutedRow && styles.pastMuted]}
    >
      <View style={styles.pastHead}>
        <View style={styles.flex}>
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {order.orderLabel}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {order.dateLabel}
          </AppText>
        </View>
        <StatusBadge status={order.status} label={t(order.statusKey)} />
      </View>
      <AppText variant="bodyMd" color={mutedRow ? MUTED : INK}>
        {order.medsLine}
      </AppText>
      <View style={styles.pastFoot}>
        <View style={styles.flex}>
          <AppText variant="bodyMd" color={MUTED}>
            {order.pharmacy}
          </AppText>
          <AppText
            variant="labelMd"
            color={mutedRow ? MUTED : INK}
            weightOverride="600"
            style={order.priceStruck ? styles.struck : undefined}
          >
            {order.refundNote
              ? `${order.priceLabel} ${t('medsRefundedNote')}`
              : order.priceLabel}
          </AppText>
        </View>
        <View style={styles.pastActions}>
          {order.canReorder ? (
            <Pressable accessibilityRole="button" onPress={onReorder} hitSlop={8}>
              <AppText variant="labelSm" color={ACTION} weightOverride="600">
                {t('medsReorder')}
              </AppText>
            </Pressable>
          ) : null}
          <Ionicons name="chevron-forward" size={20} color={MUTED} />
        </View>
      </View>
    </Pressable>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: PastOrderStatus;
  label: string;
}) {
  const success = status === 'delivered';
  return (
    <View
      style={[
        styles.badge,
        success ? styles.badgeSuccess : styles.badgeDanger,
      ]}
    >
      <AppText
        variant="labelSm"
        color={success ? SUCCESS : DANGER}
        weightOverride="500"
      >
        {label}
      </AppText>
    </View>
  );
}

function EmptyState({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyGlow}>
        <MaterialCommunityIcons
          name="bottle-tonic-plus-outline"
          size={56}
          color={ACTION}
        />
      </View>
      <AppText variant="headlineMd" color={INK} style={styles.center}>
        {vm.t('medsEmptyTitle')}
      </AppText>
      <AppText variant="bodyMd" color={MUTED} style={styles.center}>
        {vm.t('medsEmptyBody')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={vm.onSeePrescriptions}
        style={styles.emptyLink}
      >
        <AppText variant="labelMd" color={ACTION} weightOverride="600">
          {vm.t('medsSeePrescriptions')}
        </AppText>
        <Ionicons name="arrow-forward" size={16} color={ACTION} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: radii.default,
    borderBottomRightRadius: radii.default,
  },
  headerRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageButton: {
    minHeight: 36,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.error,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitleBlock: {
    flex: 1,
  },
  titleWithCaret: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  chipScrollWrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: 2,
  },
  chip: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHART,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.md,
    gap: spacing.sm,
  },
  activeHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
    marginVertical: spacing.xs,
  },
  progressSeg: {
    flex: 1,
    height: 8,
  },
  progressSegFirst: {
    borderTopLeftRadius: radii.full,
    borderBottomLeftRadius: radii.full,
  },
  progressSegLast: {
    borderTopRightRadius: radii.full,
    borderBottomRightRadius: radii.full,
  },
  progressSegOn: {
    backgroundColor: CHART,
    position: 'relative',
  },
  progressSegOff: {
    backgroundColor: CHIP_FILL,
    position: 'relative',
  },
  progressDot: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: ACTION,
  },
  trackBtn: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  section: {
    gap: spacing.md,
  },
  pastSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    paddingTop: spacing.lg,
  },
  rxExpiredCard: {
    backgroundColor: colors.page,
  },
  rxTop: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rxIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxIconMuted: {
    backgroundColor: colors.card,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: SUCCESS_FILL,
    borderColor: 'rgba(15, 122, 78, 0.2)',
  },
  badgeDanger: {
    backgroundColor: DANGER_FILL,
    borderColor: 'rgba(163, 35, 26, 0.2)',
  },
  outlineBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  followLink: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.md,
  },
  pastList: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    overflow: 'hidden',
  },
  pastRow: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  pastBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  pastMuted: {
    backgroundColor: 'rgba(245, 246, 247, 0.5)',
  },
  pastHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pastFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  helpRow: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    paddingHorizontal: spacing.md,
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: 'rgba(58, 169, 224, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 0,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    padding: spacing.xl,
  },
  emptyGlow: {
    width: 120,
    height: 120,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyLink: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
});
