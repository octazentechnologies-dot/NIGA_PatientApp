import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  PaymentItem,
  PaymentsViewModel,
} from '../controllers/usePaymentsController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const CHIP_FILL = '#E6F5FE';
const CHIP_BORDER = '#3AA9E0';
const ICON_CYAN = '#5CCEF7';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const NEUTRAL_FILL = '#F2F2F2';

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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onLongPress={vm.onToggleEmptyDemo}
            style={styles.headerTitleHit}
          >
            <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
              {vm.t('payHistTitle')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('payHistDownload')}
            onPress={vm.onDownload}
            style={styles.iconHit}
          >
            <Ionicons name="download-outline" size={22} color={INK} />
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
              <AppText variant="labelSm" color={MUTED}>
                {vm.t(card.labelKey)}
              </AppText>
              <AppText variant="headlineMd" color={INK} weightOverride="600">
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
                  color={on ? INK : MUTED}
                  weightOverride={on ? '600' : undefined}
                >
                  {vm.t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={ACTION} />
          <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
            {vm.t('payHistLedgerNote')}
          </AppText>
        </View>

        <AppText variant="labelMd" color={INK} weightOverride="600">
          {vm.monthLabel}
        </AppText>

        {vm.payments.length === 0 ? (
          <View style={styles.filterEmpty}>
            <AppText variant="bodyMd" color={MUTED} style={styles.center}>
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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onLongPress={vm.onToggleEmptyDemo}
            style={styles.headerTitleHit}
          >
            <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
              {vm.t('payHistEmptyTitle')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsHelp')}
            onPress={vm.onHelp}
            style={styles.iconHit}
          >
            <Ionicons name="help-circle-outline" size={22} color={INK} />
          </Pressable>
        </View>
      </View>

      <View style={styles.emptyBody}>
        <View style={styles.emptyArt}>
          <Ionicons name="receipt-outline" size={56} color={INK} />
          <View style={styles.emptyCheck}>
            <Ionicons name="checkmark" size={18} color={ICON_CYAN} />
          </View>
        </View>
        <AppText variant="headlineMd" color={INK} style={styles.center}>
          {vm.t('payHistEmptyHeading')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.center}>
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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
            {vm.t('payRefundTitle')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsHelp')}
            onPress={vm.onHelp}
            style={styles.iconHit}
          >
            <Ionicons name="help-circle-outline" size={22} color={INK} />
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
              <MaterialCommunityIcons name="stethoscope" size={22} color={ICON_CYAN} />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.refundTitle}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.refundDate}
              </AppText>
            </View>
            <AppText variant="headlineMd" color={INK} weightOverride="600">
              {vm.refundAmount}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText
            variant="labelSm"
            color={MUTED}
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
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
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
                    color={INK}
                    weightOverride="600"
                    style={styles.flex}
                  >
                    {vm.t(step.labelKey)}
                  </AppText>
                  <AppText variant="labelSm" color={MUTED}>
                    {vm.t(step.dateKey)}
                  </AppText>
                </View>
                {step.detailKey ? (
                  <AppText variant="bodyMd" color={MUTED}>
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
            color={MUTED}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('payRefundBreakdown')}
          </AppText>
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={INK}>
              {vm.t('payRefundTotal')}
            </AppText>
            <AppText variant="bodyMd" color={INK} weightOverride="600">
              {vm.refundTotal}
            </AppText>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="bodyMd" color={INK}>
              {vm.t('payRefundMethodLabel')}
            </AppText>
            <AppText variant="bodyMd" color={INK}>
              {vm.refundMethod}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText
            variant="labelSm"
            color={MUTED}
            weightOverride="600"
            style={styles.uppercase}
          >
            {vm.t('payRefundReference')}
          </AppText>
          <View style={styles.refBox}>
            <View style={styles.flex}>
              <AppText variant="labelSm" color={MUTED}>
                {vm.t('payRefundBankRef')}
              </AppText>
              <AppText variant="bodyMd" color={INK} weightOverride="600">
                {vm.bankReference}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={vm.t('payRefundCopy')}
              onPress={vm.onCopyReference}
              style={styles.copyHit}
            >
              <Ionicons name="copy-outline" size={20} color={ACTION_OUTLINE} />
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={vm.onContactSupport}
          style={styles.supportLink}
        >
          <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
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
              color={refunded ? MUTED : INK}
              weightOverride="600"
              style={[styles.flex, refunded && styles.strike]}
              numberOfLines={1}
            >
              {t(item.titleKey)}
            </AppText>
            <AppText
              variant="labelMd"
              color={refunded ? MUTED : INK}
              weightOverride="600"
              style={refunded ? styles.strike : undefined}
            >
              {item.amountLabel}
            </AppText>
          </View>
          <View style={styles.paymentMeta}>
            <AppText variant="labelSm" color={MUTED} style={styles.flex} numberOfLines={1}>
              {t(item.metaKey)}
            </AppText>
            <View style={[styles.statusPill, refunded && styles.statusPillMuted]}>
              <AppText
                variant="labelSm"
                color={refunded ? MUTED : SUCCESS}
                weightOverride="600"
              >
                {t(refunded ? 'payHistStatusRefunded' : 'payHistStatusPaid')}
              </AppText>
            </View>
          </View>
          {item.noteKey ? (
            <AppText variant="labelSm" color={MUTED} style={styles.note}>
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
  const color = muted ? MUTED : ICON_CYAN;
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
    backgroundColor: PAGE,
  },
  header: {
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHIP_BORDER,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: CHIP_FILL,
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleMuted: {
    backgroundColor: NEUTRAL_FILL,
    borderColor: HAIRLINE,
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
    backgroundColor: SUCCESS_FILL,
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: INK,
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
    backgroundColor: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyDotOn: {
    backgroundColor: SUCCESS,
  },
  journeyLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: SUCCESS,
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
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
