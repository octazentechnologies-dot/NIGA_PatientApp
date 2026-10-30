import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { ErrorState } from '../components/ErrorState';
import type {
  OrderTrackingStatus,
  OrderTrackingViewModel,
} from '../controllers/useOrderTrackingController';
import { trackingEventIcon } from '../controllers/useOrderTrackingController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const STATUS_CYCLE: OrderTrackingStatus[] = [
  'verifying',
  'out_for_delivery',
  'failed',
  'delivered',
];

const MAP_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCTIDnm4L7YB_BcWgEAI7OdwCQcpFj6HhJ5SkVaQWwJ_kQvqDk2I-uH7RyE4v3pnW2ZGvj9JXIrA59qRkuEA1JpsTubNPOav0Cp62WyZ9WY63zP1Byu965PIaYVSGpvnWmO16lJUQp870oJnv5Qin2YXvMUZM_NFb4G-QV01mjdtGp1MrO1b3le4gsSqr7sNV2RG8pHVOnxAg7iSHWDgP42hSAVFQMb1ct4W154aggYnE1CnOq0R_Y2';

const PARTNER_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBbRCO8o0Wie-YMB4E4ggWa8PFKtLuumBTQJUPavlUGyquhluMYGf21F3KoYoXsLKsnrOIITd3vwAYrGZ08tMSJAiPndKRMH1Hgkj4kGUzt1bazNzAxQp-m2WarAQGsJVGQp9lLpul3UT-GnRXMiEHbJic2m4qtvE_jkaY7-uxWwPZUZ-2fz3J8s3OCS6MJYMlkFgmmulN83n71XKz8rnZaya1cW5PuMNks9YTpGZpQP7T1JNjv78MW';

export function OrderTrackingView(vm: OrderTrackingViewModel) {
  const insets = useSafeAreaInsets();

  const cycleStatus = () => {
    const index = STATUS_CYCLE.indexOf(vm.status);
    vm.onSetStatus(STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length]);
  };

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
          <AppText
            variant="headlineMd"
            color={colors.ink}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('trackOrderTitle').replace('{id}', vm.orderId)}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('medsSupport')}
            onPress={vm.onSupport}
            style={styles.iconHit}
          >
            <Ionicons name="headset-outline" size={22} color={colors.ink} />
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
        {vm.notFound ? (
          <AppText variant="bodyMd" color={colors.muted} style={styles.mtXs} raw>
            Order not found.
          </AppText>
        ) : null}
        {vm.isError ? (
          <ErrorState message="Could not load tracking." onRetry={vm.onRetry} />
        ) : null}
        {vm.timeline.length > 0 ? (
          <View style={styles.card}>
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t('trackHistory')}
            </AppText>
            {vm.timeline.map((ev, index) => {
              const current = index === vm.timeline.length - 1;
              return (
                <View key={ev.id} style={styles.vStep}>
                  <View style={styles.vRail}>
                    <View style={[styles.vDot, current && styles.vDotCurrent]}>
                      <Ionicons
                        name={trackingEventIcon(ev.status)}
                        size={current ? 16 : 13}
                        color={colors.card}
                      />
                    </View>
                    {index < vm.timeline.length - 1 ? <View style={styles.vLine} /> : null}
                  </View>
                  <View style={styles.flex}>
                    <AppText
                      variant="labelMd"
                      color={colors.ink}
                      weightOverride={current ? '600' : '400'}
                      raw
                    >
                      {ev.label || ev.status}
                    </AppText>
                    {ev.at ? (
                      <AppText variant="labelSm" color={colors.muted} raw>
                        {ev.at}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
        {vm.lines.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('trackOrderDetails')}
            onPress={vm.onOpenDetails}
            style={styles.card}
          >
            <View style={styles.cardHead}>
              <AppText variant="headlineMd" color={colors.ink} style={styles.flex}>
                {vm.t('trackOrderDetails')}
              </AppText>
              <View style={styles.arrowHit}>
                <Ionicons name="chevron-forward" size={22} color={colors.ink} />
              </View>
            </View>
            {vm.lines.map((line) => (
              <View key={line.id} style={styles.priceRow}>
                <AppText variant="bodyMd" color={colors.ink} style={styles.flex} raw>
                  {[line.remedyName, line.potencyCode, line.quantityLabel]
                    .filter(Boolean)
                    .join(' · ')}
                </AppText>
              </View>
            ))}
            {vm.totalLabel ? (
              <>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                  <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                    {vm.t('trackTotal')}
                  </AppText>
                  <AppText variant="labelMd" color={colors.ink} weightOverride="600" raw>
                    {vm.totalLabel}
                  </AppText>
                </View>
              </>
            ) : null}
          </Pressable>
        ) : null}
        {vm.nextAction === 'accept' ? (
          <AppButton
            label={vm.t('trackAcceptQuote')}
            onPress={vm.onAcceptQuote}
            disabled={vm.actionBusy}
          />
        ) : null}
        {vm.nextAction === 'pay' && vm.quoteLabel ? (
          <AppButton
            label={`${vm.t('trackPayNow')} · ${vm.quoteLabel}`}
            onPress={vm.onPay}
            disabled={vm.actionBusy}
          />
        ) : null}
        {vm.status === 'verifying' ? <VerifyingBlock vm={vm} onCycle={cycleStatus} /> : null}
        {vm.status === 'out_for_delivery' ? <OutForDeliveryBlock vm={vm} /> : null}
        {vm.status === 'failed' ? <FailedBlock vm={vm} onCycle={cycleStatus} /> : null}
        {vm.status === 'delivered' ? (
          <DeliveredBlock vm={vm} onCycle={cycleStatus} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function VerifyingBlock({
  vm,
  onCycle,
}: {
  vm: OrderTrackingViewModel;
  onCycle: () => void;
}) {
  return (
    <>
      <Pressable accessibilityRole="button" onPress={onCycle} style={styles.card}>
        <View style={styles.rowGap}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="timer-sand" size={22} color={colors.iconFill} />
          </View>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.stageLabel || vm.t('trackVerifyingTitle')}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted} style={styles.mtXs}>
              {vm.nextAction === 'accept'
                ? vm.t('trackQuoteReceivedTitle')
                : vm.nextAction === 'pay'
                  ? vm.t('trackAwaitingPayTitle')
                  : vm.t('trackAwaitingQuoteBody')}
            </AppText>
          </View>
        </View>
        <SegmentProgress filled={2} accent={colors.primary} />
      </Pressable>

      <View style={styles.card}>
        <AppText
          variant="labelSm"
          color={colors.muted}
          weightOverride="600"
          style={styles.uppercase}
        >
          {vm.t('trackRxSummary')}
        </AppText>
        <RxRow code={vm.t('trackRxCode1')} potency={vm.t('trackRxPotency1')} />
        <RxRow code={vm.t('trackRxCode2')} potency={vm.t('trackRxPotency2')} />
      </View>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('trackActivity')}
        </AppText>
        <TimelineItem
          title={vm.t('trackActivityAccepted')}
          time={vm.t('trackActivityAcceptedTime')}
          active
        />
        <TimelineItem
          title={vm.t('trackActivityPlaced')}
          time={vm.t('trackActivityPlacedTime')}
        />
      </View>
    </>
  );
}

function OutForDeliveryBlock({ vm }: { vm: OrderTrackingViewModel }) {
  return (
    <>
      <View style={styles.mapCard}>
        <View style={styles.mapFrame}>
          <Image source={{ uri: MAP_URI }} style={styles.mapImage} />
          <View style={styles.distancePill}>
            <View style={styles.liveDot} />
            <AppText variant="labelSm" color={colors.ink} weightOverride="600">
              {vm.distanceAway}
            </AppText>
          </View>
        </View>
        <View style={styles.mapFoot}>
          <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted}>
            {vm.t('trackLocationApprox')}
          </AppText>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.partnerRow}>
          <Image source={{ uri: PARTNER_URI }} style={styles.partnerAvatar} />
          <View style={styles.flex}>
            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.partnerName}
            </AppText>
            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('trackPartnerRole')}
            </AppText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.secondary} />
              <AppText variant="labelSm" color={colors.ink}>
                {vm.partnerRating}
              </AppText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onChatPartner}
            style={styles.outlineIcon}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primaryOutline} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCallPartner}
            style={styles.outlineIcon}
          >
            <Ionicons name="call-outline" size={20} color={colors.primaryOutline} />
          </Pressable>
        </View>
        <View style={styles.maskedBox}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted} style={styles.flex}>
            {vm.t('trackMaskedCall')}
          </AppText>
        </View>
      </View>

      <View style={styles.otpCard}>
        <AppText variant="labelMd" color={colors.ink} weightOverride="600">
          {vm.t('trackOtpTitle')}
        </AppText>
        <View style={styles.otpRow}>
          {vm.otpDigits.map((digit, index) => (
            <View key={`otp-${index}`} style={styles.otpBox}>
              <AppText variant="displayLg" color={colors.ink} weightOverride="600">
                {digit}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="labelSm" color={colors.muted}>
          {vm.t('trackOtpWarn')}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('trackOrderDetails')}
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="bodyMd" color={colors.ink}>
            {vm.medicineLine}
          </AppText>
          <AppText variant="bodyMd" color={colors.ink}>
            {vm.medicinePrice}
          </AppText>
        </View>
        <View style={styles.priceRow}>
          <AppText variant="bodyMd" color={colors.muted}>
            {vm.t('trackDeliveryFee')}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            {vm.deliveryFee}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {vm.t('trackTotal')}
          </AppText>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {vm.totalLabel}
          </AppText>
        </View>
        <View style={styles.payRow}>
          <View style={styles.codRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <AppText variant="bodyMd" color={colors.ink}>
              {vm.t('trackCod')}
            </AppText>
          </View>
          <Pressable accessibilityRole="button" onPress={vm.onDownloadInvoice}>
            <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
              {vm.t('trackInvoice')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function FailedBlock({
  vm,
  onCycle,
}: {
  vm: OrderTrackingViewModel;
  onCycle: () => void;
}) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onCycle}
        style={[styles.card, styles.failedHero]}
      >
        <View style={styles.rowGap}>
          <View style={styles.failedIcon}>
            <Ionicons name="alert" size={26} color={colors.card} />
          </View>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={colors.error} weightOverride="600">
              {vm.t('trackFailedTitle')}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted} style={styles.mtXs}>
              {vm.t('trackFailedBody')}
            </AppText>
          </View>
        </View>
        <SegmentProgress filled={4} accent={colors.error} lastDanger />
      </Pressable>

      <AppButton
        label={vm.t('trackReschedule')}
        onPress={vm.onReschedule}
        icon={<Ionicons name="calendar-outline" size={20} color={colors.card} />}
      />
      <AppButton
        label={vm.t('trackSwitchPickup')}
        variant="secondary"
        onPress={vm.onSwitchPickup}
        icon={
          <Ionicons name="storefront-outline" size={20} color={colors.primaryOutline} />
        }
      />

      <View style={styles.card}>
        <AppText
          variant="labelSm"
          color={colors.muted}
          weightOverride="600"
          style={[styles.uppercase, styles.sectionRule]}
        >
          {vm.t('trackPackageContents')}
        </AppText>
        <PkgRow title={vm.t('trackPkg1')} qty={vm.t('trackPkg1Qty')} icon="flask-outline" />
        <PkgRow
          title={vm.t('trackPkg2')}
          qty={vm.t('trackPkg2Qty')}
          icon="medical-outline"
        />
      </View>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={colors.ink}>
          {vm.t('trackHistory')}
        </AppText>
        <TimelineItem
          title={vm.t('trackHistFailed')}
          body={vm.t('trackHistFailedBody')}
          time={vm.t('trackHistFailedTime')}
          danger
          active
        />
        <TimelineItem title={vm.t('trackHistOut')} time={vm.t('trackHistOutTime')} />
        <TimelineItem title={vm.t('trackHistPacked')} time={vm.t('trackHistPackedTime')} />
      </View>
    </>
  );
}

function DeliveredBlock({
  vm,
  onCycle,
}: {
  vm: OrderTrackingViewModel;
  onCycle: () => void;
}) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onCycle}
        style={[styles.card, styles.deliveredHero]}
      >
        <View style={styles.deliveredCheck}>
          <Ionicons name="checkmark" size={36} color={colors.card} />
        </View>
        <AppText variant="headlineMd" color={colors.success} weightOverride="600">
          {vm.t('trackDelivered')}
        </AppText>
        <AppText variant="bodyMd" color={colors.muted}>
          {vm.deliveredAt}
        </AppText>
        <AppText variant="bodyMd" color={colors.ink}>
          {vm.t('trackDeliveredTo')}
        </AppText>
      </Pressable>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={colors.ink} style={styles.center}>
          {vm.t('trackRateTitle')}
        </AppText>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={`star-${value}`}
              accessibilityRole="button"
              onPress={() => vm.onSelectRating(value)}
              style={styles.starHit}
            >
              <Ionicons
                name={value <= vm.rating ? 'star' : 'star-outline'}
                size={32}
                color={value <= vm.rating ? colors.tertiaryContainer : colors.outlineVariant}
              />
            </Pressable>
          ))}
        </View>
        <AppText variant="labelSm" color={colors.muted} style={styles.center}>
          {vm.t('trackRateHint')}
        </AppText>
        <TextInput
          value={vm.reviewComment}
          onChangeText={vm.onChangeReviewComment}
          placeholder={vm.t('trackReviewComment')}
          placeholderTextColor={colors.muted}
          multiline
          style={styles.reviewInput}
        />
        <AppButton
          label={vm.t('trackSubmitReview')}
          onPress={vm.onSubmitReview}
          disabled={vm.actionBusy || vm.rating < 1}
        />
      </View>
    </>
  );
}

function SegmentProgress({
  filled,
  accent,
  lastDanger,
}: {
  filled: number;
  accent: string;
  lastDanger?: boolean;
}) {
  return (
    <View style={styles.segmentRow}>
      {Array.from({ length: 5 }).map((_, index) => {
        const on = index < filled;
        const isLast = index === 4 && lastDanger;
        return (
          <View
            key={`seg-${index}`}
            style={[
              styles.segment,
              {
                backgroundColor: isLast
                  ? colors.error
                  : on
                    ? index === filled - 1
                      ? accent
                      : colors.success
                    : colors.outlineVariant,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function RxRow({ code, potency }: { code: string; potency: string }) {
  return (
    <View style={styles.rxRow}>
      <View style={styles.rowGap}>
        <MaterialCommunityIcons name="needle" size={18} color={colors.iconFill} />
        <AppText variant="labelMd" color={colors.ink}>
          {code}
        </AppText>
      </View>
      <AppText variant="bodyMd" color={colors.muted}>
        {potency}
      </AppText>
    </View>
  );
}

function PkgRow({
  title,
  qty,
  icon,
}: {
  title: string;
  qty: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.pkgRow}>
      <View style={styles.pkgIcon}>
        <Ionicons name={icon} size={20} color={colors.ink} />
      </View>
      <View>
        <AppText variant="labelMd" color={colors.ink} weightOverride="600">
          {title}
        </AppText>
        <AppText variant="labelSm" color={colors.muted}>
          {qty}
        </AppText>
      </View>
    </View>
  );
}

function TimelineItem({
  title,
  body,
  time,
  active,
  danger,
  success,
}: {
  title: string;
  body?: string;
  time: string;
  active?: boolean;
  danger?: boolean;
  success?: boolean;
}) {
  const dot = danger ? colors.error : success ? colors.success : active ? colors.secondary : colors.outlineVariant;
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: dot }]} />
      <View style={styles.flex}>
        <AppText
          variant="labelMd"
          color={danger ? colors.error : colors.ink}
          weightOverride={active ? '600' : '400'}
        >
          {title}
        </AppText>
        {body ? (
          <AppText variant="bodyMd" color={colors.muted} style={styles.mtXs}>
            {body}
          </AppText>
        ) : null}
        <AppText variant="labelSm" color={colors.muted} style={styles.mtXs}>
          {time}
        </AppText>
      </View>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    flex: 1,
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
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrowHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vStep: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  vRail: {
    width: 32,
    alignItems: 'center',
  },
  vDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vDotCurrent: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  vLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginTop: 2,
    backgroundColor: colors.secondary,
  },
  flex: {
    flex: 1,
  },
  mtXs: {
    marginTop: 4,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    marginTop: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 999,
  },
  milestoneWrap: {
    marginTop: spacing.md,
    height: 36,
    justifyContent: 'center',
  },
  milestoneTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.outlineVariant,
  },
  milestoneFill: {
    position: 'absolute',
    left: 0,
    height: 2,
    backgroundColor: colors.secondary,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  milestoneDotLg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  milestoneOn: {
    backgroundColor: colors.secondary,
  },
  milestoneOff: {
    backgroundColor: colors.page,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  mapFrame: {
    height: 180,
    backgroundColor: colors.page,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  distancePill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  mapFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.page,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  outlineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primaryOutline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  maskedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  otpCard: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radii.button,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginVertical: 4,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  codRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  failedHero: {
    backgroundColor: colors.errorContainer,
  },
  failedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRule: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.xs,
  },
  pkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  pkgIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.iconFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: 4,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  deliveredHero: {
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    gap: spacing.xs,
  },
  deliveredCheck: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  reviewInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  starHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
});
