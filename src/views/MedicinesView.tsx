import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { NotificationBell } from '../components/NotificationBell';
import { usePatientTabScrollInset } from '../components/PatientTabBar';
import {
  useMedicinesController,
  type MedicinesViewModel,
  type PastOrder,
  type PastOrderStatus,
} from '../controllers/useMedicinesController';
import type { OrderMedicinesLaunch } from '../utilities/medicineOrderStage';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

export function MedicinesView({
  onBookFollowUp,
  onSeePrescriptions,
  onTrackOrder,
  onOrderRx,
  onOpenPastOrder,
  onOpenNotifications,
  onPayOrder,
  onStartRefillOrder,
  notificationCount = 0,
  forceHasOrders,
}: {
  onBookFollowUp?: () => void;
  onSeePrescriptions?: () => void;
  onTrackOrder?: (orderId?: string) => void;
  onOrderRx?: (launch: OrderMedicinesLaunch) => void;
  onOpenPastOrder?: (id: string) => void;
  onOpenNotifications?: () => void;
  onPayOrder?: (orderId: number) => void;
  onStartRefillOrder?: (launch: OrderMedicinesLaunch) => void;
  notificationCount?: number;
  forceHasOrders?: boolean;
} = {}) {
  const vm = useMedicinesController({
    onBookFollowUp,
    onSeePrescriptions,
    onTrackOrder,
    onOrderRx,
    onOpenPastOrder,
    onOpenNotifications,
    onPayOrder,
    onStartRefillOrder,
    forceHasOrders,
  });
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        {vm.hasOrders ? (
          <ListHeader vm={vm} notificationCount={notificationCount} />
        ) : (
          <EmptyHeader vm={vm} notificationCount={notificationCount} />
        )}
      </View>

      {vm.hasOrders ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vm.isRefreshing}
              onRefresh={vm.onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.body,
            { paddingBottom: tabScrollInset },
          ]}
        >
          <MemberChips vm={vm} />
          {vm.actionNote ? (
            <AppText variant="bodyMd" color={colors.ink}>
              {vm.actionNote}
            </AppText>
          ) : null}
          <RefillSection vm={vm} />
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
                <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              </View>
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {vm.t('medsProblemOrder')}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vm.isRefreshing}
              onRefresh={vm.onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.emptyWrap,
            { flexGrow: 1, paddingBottom: tabScrollInset },
          ]}
        >
          <MemberChips vm={vm} />
          <View style={styles.emptyCenter}>
            <EmptyState vm={vm} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function HeaderActions({
  vm,
  notificationCount,
}: {
  vm: MedicinesViewModel;
  notificationCount: number;
}) {
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
          color={colors.ink}
          languageOverride={vm.language === 'en' ? 'en' : 'mr'}
        >
          {vm.language === 'en' ? 'EN' : 'मराठी'}
        </AppText>
      </Pressable>
      <NotificationBell
        count={notificationCount}
        label={vm.t('homeNotifications')}
        onPress={vm.onOpenNotifications}
      />
    </View>
  );
}

function ListHeader({
  vm,
  notificationCount,
}: {
  vm: MedicinesViewModel;
  notificationCount: number;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.flex}>
        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('medsTitle')}
        </AppText>
        <AppText variant="labelSm" color={colors.muted}>
          {vm.t('medsSubtitle')}
        </AppText>
      </View>
      <HeaderActions vm={vm} notificationCount={notificationCount} />
    </View>
  );
}

function EmptyHeader({
  vm,
  notificationCount,
}: {
  vm: MedicinesViewModel;
  notificationCount: number;
}) {
  return (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        onPress={() => vm.onSelectMember('everyone')}
        style={styles.emptyTitleBlock}
      >
        <View style={styles.titleWithCaret}>
          <AppText variant="headlineMd" color={colors.ink}>
            {vm.t('medsTitle')}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={colors.ink} />
        </View>
        <AppText variant="labelSm" color={colors.muted}>
          {vm.t('medsAllFamily')}
        </AppText>
      </Pressable>
      <HeaderActions vm={vm} notificationCount={notificationCount} />
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
                color={on ? colors.ink : colors.muted}
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

function RefillSection({ vm }: { vm: MedicinesViewModel }) {
  if (vm.pendingRefills.length === 0 && vm.approvedRefills.length === 0) return null;
  return (
    <View style={styles.section}>
      {vm.pendingRefills.length > 0 ? (
        <View style={styles.card}>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {vm.t('medsRefillPendingTitle')}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            {vm.t('medsRefillPendingBody')}
          </AppText>
          {vm.pendingRefills.map((row) => (
            <AppText key={row.id} variant="bodyMd" color={colors.ink} raw>
              {row.title}
              {row.subtitle ? ` · ${row.subtitle}` : ''}
            </AppText>
          ))}
        </View>
      ) : null}
      {vm.approvedRefills.map((row) => (
        <View key={row.id} style={styles.card}>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {vm.t('medsRefillApprovedTitle')}
          </AppText>
          <AppText variant="bodyMd" color={colors.ink} raw>
            {row.title}
            {row.subtitle ? ` · ${row.subtitle}` : ''}
          </AppText>
          <AppButton
            label={vm.t('medsStartRefill')}
            onPress={() => vm.onStartRefill(row)}
          />
        </View>
      ))}
    </View>
  );
}

function ActiveOrderCard({ vm }: { vm: MedicinesViewModel }) {
  if (vm.openOrders.length === 0) return null;
  return (
    <>
      {vm.openOrders.map((order) => (
        <View key={order.id} style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsTrackOrder')}
            onPress={() => vm.onTrackOrder(order.id)}
          >
            <View style={styles.activeHead}>
              <View style={styles.flex}>
                <AppText
                  variant="labelSm"
                  color={colors.primary}
                  weightOverride="600"
                  style={styles.uppercase}
                >
                  {vm.t('medsActiveOrder')}
                </AppText>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600" raw>
                  {vm
                    .t('medsActiveOrderLine')
                    .replace('{id}', order.orderLabel)
                    .replace('{status}', vm.t(order.statusKey))}
                </AppText>
              </View>
              <View style={styles.badge}>
                <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                  {vm.t(order.statusKey)}
                </AppText>
              </View>
            </View>
            <View style={styles.progressRow}>
              {Array.from({ length: order.progressTotal }).map((_, index) => {
                const filled = index < order.progressFilled;
                return (
                  <View
                    key={`${order.id}-step-${index}`}
                    style={[
                      styles.progressSeg,
                      index === 0 && styles.progressSegFirst,
                      index === order.progressTotal - 1 && styles.progressSegLast,
                      filled ? styles.progressSegOn : styles.progressSegOff,
                    ]}
                  />
                );
              })}
            </View>
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t(order.statusKey)}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {order.pharmacy}
            </AppText>
            {order.quoteLabel ? (
              <AppText variant="labelMd" color={colors.ink} weightOverride="600" raw>
                {order.quoteLabel}
              </AppText>
            ) : null}
          </Pressable>
          {order.action === 'accept' ? (
            <AppButton
              label={vm.t('medsAcceptQuote')}
              onPress={() => vm.onAcceptQuote(order.id)}
            />
          ) : null}
          {order.action === 'pay' && order.quoteLabel ? (
            <AppButton
              label={vm.t('medsPayNow')}
              onPress={() => vm.onPayOrder(order.id)}
            />
          ) : null}
          <AppButton
            label={vm.t('medsTrackOrder')}
            variant="secondary"
            onPress={() => vm.onTrackOrder(order.id)}
          />
        </View>
      ))}
    </>
  );
}

function PrescriptionsSection({ vm }: { vm: MedicinesViewModel }) {
  if (!vm.orderableRx || vm.orderableRx.length === 0) return null;
  return (
    <View style={styles.section}>
      <AppText variant="headlineMd" color={colors.ink}>
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
                color={rx.expired ? colors.muted : colors.primary}
              />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {rx.title}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
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
              color={rx.expired ? colors.error : colors.success}
              weightOverride="500"
            >
              {vm.t(rx.badgeKey)}
            </AppText>
          </View>
          {rx.canOrder ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => vm.onOrderRx(rx)}
              style={styles.outlineBtn}
            >
              <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
                {vm.t('medsOrder')}
              </AppText>
            </Pressable>
          ) : (
            <AppText variant="bodyMd" color={colors.error}>
              {vm.t('rxMustSign')}
            </AppText>
          )}
        </View>
      ))}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
          {vm.t('medsPharmacyNote')}
        </AppText>
      </View>
    </View>
  );
}

function PastOrdersSection({ vm }: { vm: MedicinesViewModel }) {
  return (
    <View style={[styles.section, styles.pastSection]}>
      <AppText variant="headlineMd" color={colors.ink}>
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
                color={on ? colors.ink : colors.muted}
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
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {order.orderLabel}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            {order.dateLabel}
          </AppText>
        </View>
        <StatusBadge status={order.status} label={t(order.statusKey)} />
      </View>
      <AppText variant="bodyMd" color={mutedRow ? colors.muted : colors.ink}>
        {order.medsLine}
      </AppText>
      <View style={styles.pastFoot}>
        <View style={styles.flex}>
          <AppText variant="bodyMd" color={colors.muted}>
            {order.pharmacy}
          </AppText>
          {order.priceLabel ? (
            <AppText
              variant="labelMd"
              color={mutedRow ? colors.muted : colors.ink}
              weightOverride="600"
              raw
              style={order.priceStruck ? styles.struck : undefined}
            >
              {order.refundNote
                ? `${order.priceLabel} ${t('medsRefundedNote')}`
                : order.priceLabel}
            </AppText>
          ) : null}
        </View>
        <View style={styles.pastActions}>
          {order.canReorder ? (
            <Pressable
              accessibilityRole="button"
              onPress={onReorder}
              style={styles.reorderHit}
            >
              <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                {t('medsReorder')}
              </AppText>
            </Pressable>
          ) : null}
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
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
        color={success ? colors.success : colors.error}
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
          color={colors.primary}
        />
      </View>
      <AppText variant="headlineMd" color={colors.ink} style={styles.center}>
        {vm.t('medsEmptyTitle')}
      </AppText>
      <AppText variant="bodyMd" color={colors.muted} style={styles.center}>
        {vm.t('medsEmptyBody')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={vm.onSeePrescriptions}
        style={styles.emptyLink}
      >
        <AppText variant="labelMd" color={colors.primary} weightOverride="600">
          {vm.t('medsSeePrescriptions')}
        </AppText>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
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
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.secondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.secondary,
    position: 'relative',
  },
  progressSegOff: {
    backgroundColor: colors.primaryContainer,
    position: 'relative',
  },
  progressDot: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
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
    borderTopColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.successContainer,
    borderColor: 'rgba(15, 122, 78, 0.2)',
  },
  badgeDanger: {
    backgroundColor: colors.errorContainer,
    borderColor: 'rgba(163, 35, 26, 0.2)',
  },
  outlineBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.primary,
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
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  pastList: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  pastRow: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  pastBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
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
  reorderHit: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
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
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.primaryContainer,
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
    borderColor: colors.outlineVariant,
    padding: spacing.xl,
  },
  emptyGlow: {
    width: 120,
    height: 120,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
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
