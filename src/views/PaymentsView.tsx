import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  PaymentItem,
  PaymentsViewModel,
} from '../controllers/usePaymentsController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const CHIP_BORDER = colors.secondary;
const NEUTRAL_FILL = colors.surfaceVariant;

export function PaymentsView(vm: PaymentsViewModel) {
  const insets = useSafeAreaInsets();

  if (vm.refundOpen) {
    return <RefundStatusView vm={vm} />;
  }

  if (!vm.hasPayments) {
    return <PaymentsEmptyView vm={vm} />;
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onLongPress={vm.onToggleEmptyDemo}
            style={styles.headerTitleHit}
          >
            <AppText variant="headlineMd" color={colors.ink} style={styles.headerTitle}>
              {vm.t('payHistTitle')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('payHistDownload')}
            onPress={vm.onDownload}
            style={styles.iconHit}
          >
            <Ionicons name="download-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryRow}
        >
          {vm.summaryCards.map((card) => (
            <View key={card.labelKey} style={styles.summaryCard}>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t(card.labelKey)}
              </AppText>
              <AppText variant="headlineMd" color={colors.ink} weightOverride="600">
                {card.value}
              </AppText>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {vm.filters.map((item) => {
            const on = item.id === vm.filter;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => vm.onSelectFilter(item.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <AppText
                  variant="labelMd"
                  color={on ? colors.ink : colors.muted}
                  weightOverride={on ? '600' : undefined}
                >
                  {vm.t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
            {vm.t('payHistLedgerNote')}
          </AppText>
        </View>

        <AppText variant="labelMd" color={colors.ink} weightOverride="600">
          {vm.monthLabel}
        </AppText>

        {vm.payments.length === 0 ? (
          <View style={styles.filterEmpty}>
            <AppText variant="bodyMd" color={colors.muted} style={styles.center}>
              {vm.t('payHistFilterEmpty')}
            </AppText>
          </View>
        ) : (
          vm.payments.map((item) => (
            <PaymentRow
              key={item.id}
              item={item}
              t={vm.t}
              onPress={() => vm.onOpenPayment(item.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function PaymentsEmptyView({ vm }: { vm: PaymentsViewModel }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onLongPress={vm.onToggleEmptyDemo}
            style={styles.headerTitleHit}
          >
            <AppText variant="headlineMd" color={colors.ink} style={styles.headerTitle}>
              {vm.t('payHistEmptyTitle')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsHelp')}
            onPress={vm.onHelp}
            style={styles.iconHit}
          >
            <Ionicons name="help-circle-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <View style={styles.emptyBody}>
        <View style={styles.emptyArt}>
          <Ionicons name="receipt-outline" size={56} color={colors.ink} />
          <View style={styles.emptyCheck}>
            <Ionicons name="checkmark" size={18} color={colors.iconFill} />
          </View>
        </View>
        <AppText variant="headlineMd" color={colors.ink} style={styles.center}>
          {vm.t('payHistEmptyHeading')}
        </AppText>
        <AppText variant="bodyMd" color={colors.muted} style={styles.center}>
          {vm.t('payHistEmptyBody')}
        </AppText>
        <AppButton
          label={vm.t('payHistBookConsultation')}
          onPress={vm.onBookConsultation}
          style={styles.emptyCta}
        />
      </View>
    </View>
  );
}

function RefundStatusView({ vm }: { vm: PaymentsViewModel }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onCloseRefund}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.headerTitle}>
            {vm.t('payRefundTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsHelp')}
            onPress={vm.onHelp}
            style={styles.iconHit}
          >
            <Ionicons name="help-circle-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.refundHead}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="stethoscope" size={22} color={colors.iconFill} />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {vm.refundTitle}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.refundDate}
              </AppText>
            </View>
            <AppText variant="headlineMd" color={colors.ink} weightOverride="600">
              {vm.refundAmount}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText
            variant="labelSm"
            color={colors.muted}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('payRefundJourney')}
          </AppText>
          {vm.refundSteps.map((step, index) => (
            <View key={step.labelKey} style={styles.journeyRow}>
              <View style={styles.journeyRail}>
                <View style={[styles.journeyDot, step.done && styles.journeyDotOn]}>
                  {step.done ? (
                    <Ionicons name="checkmark" size={12} color={colors.card} />
                  ) : null}
                </View>
                {index < vm.refundSteps.length - 1 ? (
                  <View style={styles.journeyLine} />
                ) : null}
              </View>
              <View style={[styles.flex, styles.journeyCopy]}>
                <View style={styles.journeyTitleRow}>
                  <AppText
                    variant="labelMd"
                    color={colors.ink}
                    weightOverride="600"
                    style={styles.flex}
                  >
                    {vm.t(step.labelKey)}
                  </AppText>
                  <AppText variant="labelSm" color={colors.muted}>
                    {vm.t(step.dateKey)}
                  </AppText>
                </View>
                {step.detailKey ? (
                  <AppText variant="bodyMd" color={colors.muted}>
                    {vm.t(step.detailKey)}
                  </AppText>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <AppText
            variant="labelSm"
            color={colors.muted}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('payRefundBreakdown')}
          </AppText>
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={colors.ink}>
              {vm.t('payRefundTotal')}
            </AppText>
            <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
              {vm.refundTotal}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={colors.ink}>
              {vm.t('payRefundMethodLabel')}
            </AppText>
            <AppText variant="bodyMd" color={colors.ink}>
              {vm.refundMethod}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText
            variant="labelSm"
            color={colors.muted}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('payRefundReference')}
          </AppText>
          <View style={styles.refBox}>
            <View style={styles.flex}>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t('payRefundBankRef')}
              </AppText>
              <AppText variant="bodyMd" color={colors.ink} weightOverride="600">
                {vm.bankReference}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('payRefundCopy')}
              onPress={vm.onCopyReference}
              style={styles.copyHit}
            >
              <Ionicons name="copy-outline" size={20} color={colors.primaryOutline} />
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={vm.onContactSupport}
          style={styles.supportLink}
        >
          <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
            {vm.t('payRefundContactSupport')}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function PaymentRow({
  item,
  t,
  onPress,
}: {
  item: PaymentItem;
  t: PaymentsViewModel['t'];
  onPress: () => void;
}) {
  const refunded = item.status === 'refunded';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, refunded && styles.cardMuted]}
    >
      <View style={styles.paymentRow}>
        <View style={[styles.iconCircle, refunded && styles.iconCircleMuted]}>
          <PaymentIcon kind={item.kind} muted={refunded} />
        </View>
        <View style={styles.flex}>
          <View style={styles.paymentTop}>
            <AppText
              variant="labelMd"
              color={refunded ? colors.muted : colors.ink}
              weightOverride="600"
              style={[styles.flex, refunded && styles.strike]}
              numberOfLines={1}
            >
              {t(item.titleKey)}
            </AppText>
            <AppText
              variant="labelMd"
              color={refunded ? colors.muted : colors.ink}
              weightOverride="600"
              style={refunded ? styles.strike : undefined}
            >
              {item.amountLabel}
            </AppText>
          </View>
          <View style={styles.paymentMeta}>
            <AppText variant="labelSm" color={colors.muted} style={styles.flex} numberOfLines={1}>
              {t(item.metaKey)}
            </AppText>
            <View style={[styles.statusPill, refunded && styles.statusPillMuted]}>
              <AppText
                variant="labelSm"
                color={refunded ? colors.muted : colors.success}
                weightOverride="600"
              >
                {t(refunded ? 'payHistStatusRefunded' : 'payHistStatusPaid')}
              </AppText>
            </View>
          </View>
          {item.noteKey ? (
            <AppText variant="labelSm" color={colors.muted} style={styles.note}>
              {t(item.noteKey)}
            </AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function PaymentIcon({
  kind,
  muted,
}: {
  kind: PaymentItem['kind'];
  muted?: boolean;
}) {
  const color = muted ? colors.muted : colors.iconFill;
  if (kind === 'medicines') {
    return <MaterialCommunityIcons name="pill" size={22} color={color} />;
  }
  if (kind === 'carelink') {
    return <MaterialCommunityIcons name="graph-outline" size={22} color={color} />;
  }
  return <MaterialCommunityIcons name="stethoscope" size={22} color={color} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleHit: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  headerTitle: {
    textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  summaryCard: {
    width: 160,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.xs,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primaryContainer,
    borderColor: CHIP_BORDER,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: {
    opacity: 0.85,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleMuted: {
    backgroundColor: NEUTRAL_FILL,
    borderColor: colors.outlineVariant,
  },
  paymentTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: colors.successContainer,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusPillMuted: {
    backgroundColor: NEUTRAL_FILL,
  },
  note: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  filterEmpty: {
    paddingVertical: spacing.xl,
  },
  center: {
    textAlign: 'center',
  },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyArt: {
    width: 160,
    height: 160,
    borderRadius: radii.default,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyCheck: {
    position: 'absolute',
    right: 36,
    bottom: 36,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCta: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  refundHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  journeyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  journeyRail: {
    width: 24,
    alignItems: 'center',
  },
  journeyDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyDotOn: {
    backgroundColor: colors.success,
  },
  journeyLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.success,
    marginVertical: 2,
  },
  journeyCopy: {
    paddingBottom: spacing.md,
    gap: 2,
  },
  journeyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  refBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    padding: spacing.md,
  },
  copyHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportLink: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
});
