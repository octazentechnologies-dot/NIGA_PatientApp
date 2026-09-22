import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  OrderTrackingStatus,
  OrderTrackingViewModel,
} from '../controllers/useOrderTrackingController';
import { trackingStepIndex } from '../controllers/useOrderTrackingController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const CHART = '#3AA9E0';
const ICON_CYAN = '#5CCEF7';
const OTP_FILL = '#E6F5FE';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';
const STAR = '#F2C14E';

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
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
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
            <Ionicons name="headset-outline" size={22} color={INK} />
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
        {vm.status === 'verifying' ? <VerifyingBlock vm={vm} onCycle={cycleStatus} /> : null}
        {vm.status === 'out_for_delivery' ? (
          <OutForDeliveryBlock vm={vm} onCycle={cycleStatus} />
        ) : null}
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
            <MaterialCommunityIcons name="timer-sand" size={22} color={ICON_CYAN} />
          </View>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={INK}>
              {vm.t('trackVerifyingTitle')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
              {vm.t('trackVerifyingBody')}
            </AppText>
          </View>
        </View>
        <SegmentProgress filled={2} accent={ACTION} />
      </Pressable>

      <View style={styles.card}>
        <AppText
          variant="labelSm"
          color={MUTED}
          weightOverride="600"
          style={styles.uppercase}
        >
          {vm.t('trackRxSummary')}
        </AppText>
        <RxRow code={vm.t('trackRxCode1')} potency={vm.t('trackRxPotency1')} />
        <RxRow code={vm.t('trackRxCode2')} potency={vm.t('trackRxPotency2')} />
      </View>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={INK}>
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

function OutForDeliveryBlock({
  vm,
  onCycle,
}: {
  vm: OrderTrackingViewModel;
  onCycle: () => void;
}) {
  const active = trackingStepIndex(vm.status);

  return (
    <>
      <Pressable accessibilityRole="button" onPress={onCycle} style={styles.card}>
        <View style={styles.statusHead}>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={INK}>
              {vm.t('trackOutForDelivery')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
              {vm.arrivingBy}
            </AppText>
          </View>
          <View style={styles.statusDot} />
        </View>
        <MilestoneProgress activeIndex={active} />
      </Pressable>

      <View style={styles.mapCard}>
        <View style={styles.mapFrame}>
          <Image source={{ uri: MAP_URI }} style={styles.mapImage} />
          <View style={styles.distancePill}>
            <View style={styles.liveDot} />
            <AppText variant="labelSm" color={INK} weightOverride="600">
              {vm.distanceAway}
            </AppText>
          </View>
        </View>
        <View style={styles.mapFoot}>
          <Ionicons name="information-circle-outline" size={16} color={MUTED} />
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('trackLocationApprox')}
          </AppText>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.partnerRow}>
          <Image source={{ uri: PARTNER_URI }} style={styles.partnerAvatar} />
          <View style={styles.flex}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.partnerName}
            </AppText>
            <AppText variant="labelSm" color={MUTED}>
              {vm.t('trackPartnerRole')}
            </AppText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={CHART} />
              <AppText variant="labelSm" color={INK}>
                {vm.partnerRating}
              </AppText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onChatPartner}
            style={styles.outlineIcon}
          >
            <Ionicons name="chatbubble-outline" size={20} color={ACTION_OUTLINE} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCallPartner}
            style={styles.outlineIcon}
          >
            <Ionicons name="call-outline" size={20} color={ACTION_OUTLINE} />
          </Pressable>
        </View>
        <View style={styles.maskedBox}>
          <Ionicons name="lock-closed-outline" size={16} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} style={styles.flex}>
            {vm.t('trackMaskedCall')}
          </AppText>
        </View>
      </View>

      <View style={styles.otpCard}>
        <AppText variant="labelMd" color={INK} weightOverride="600">
          {vm.t('trackOtpTitle')}
        </AppText>
        <View style={styles.otpRow}>
          {vm.otpDigits.map((digit, index) => (
            <View key={`otp-${index}`} style={styles.otpBox}>
              <AppText variant="displayLg" color={INK} weightOverride="600">
                {digit}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="labelSm" color={MUTED}>
          {vm.t('trackOtpWarn')}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={INK}>
          {vm.t('trackOrderDetails')}
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="bodyMd" color={INK}>
            {vm.medicineLine}
          </AppText>
          <AppText variant="bodyMd" color={INK}>
            {vm.medicinePrice}
          </AppText>
        </View>
        <View style={styles.priceRow}>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t('trackDeliveryFee')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.deliveryFee}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {vm.t('trackTotal')}
          </AppText>
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {vm.totalLabel}
          </AppText>
        </View>
        <View style={styles.payRow}>
          <View style={styles.codRow}>
            <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
            <AppText variant="bodyMd" color={INK}>
              {vm.t('trackCod')}
            </AppText>
          </View>
          <Pressable accessibilityRole="button" onPress={vm.onDownloadInvoice}>
            <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
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
            <Ionicons name="alert" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={DANGER} weightOverride="600">
              {vm.t('trackFailedTitle')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
              {vm.t('trackFailedBody')}
            </AppText>
          </View>
        </View>
        <SegmentProgress filled={4} accent={DANGER} lastDanger />
      </Pressable>

      <AppButton
        label={vm.t('trackReschedule')}
        onPress={vm.onReschedule}
        icon={<Ionicons name="calendar-outline" size={20} color="#FFFFFF" />}
      />
      <AppButton
        label={vm.t('trackSwitchPickup')}
        variant="secondary"
        onPress={vm.onSwitchPickup}
        icon={
          <Ionicons name="storefront-outline" size={20} color={ACTION_OUTLINE} />
        }
      />

      <View style={styles.card}>
        <AppText
          variant="labelSm"
          color={MUTED}
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
        <AppText variant="headlineMd" color={INK}>
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
          <Ionicons name="checkmark" size={36} color="#FFFFFF" />
        </View>
        <AppText variant="headlineMd" color={SUCCESS} weightOverride="600">
          {vm.t('trackDelivered')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED}>
          {vm.deliveredAt}
        </AppText>
        <AppText variant="bodyMd" color={INK}>
          {vm.t('trackDeliveredTo')}
        </AppText>
      </Pressable>

      <View style={styles.card}>
        <AppText variant="headlineMd" color={INK} style={styles.center}>
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
                color={value <= vm.rating ? STAR : HAIRLINE}
              />
            </Pressable>
          ))}
        </View>
        <AppText variant="labelSm" color={MUTED} style={styles.center}>
          {vm.t('trackRateHint')}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="labelSm" color={MUTED} weightOverride="600">
          {vm.t('trackOrderRef')}
        </AppText>
        <AppText variant="labelMd" color={INK} weightOverride="600">
          {vm.orderId}
        </AppText>
        <View style={styles.divider} />
        <AppText variant="headlineMd" color={INK}>
          {vm.t('trackHistory')}
        </AppText>
        <TimelineItem
          title={vm.t('trackDelivered')}
          time={vm.deliveredAt}
          success
          active
        />
        <TimelineItem title={vm.t('trackHistOut')} time={vm.t('trackHistOutTime')} />
        <TimelineItem title={vm.t('trackHistPacked')} time={vm.t('trackHistPackedTime')} />
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
                  ? DANGER
                  : on
                    ? index === filled - 1
                      ? accent
                      : SUCCESS
                    : HAIRLINE,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function MilestoneProgress({ activeIndex }: { activeIndex: number }) {
  const icons: Array<keyof typeof Ionicons.glyphMap> = [
    'checkmark',
    'cube-outline',
    'checkmark-done-outline',
    'bicycle-outline',
    'home-outline',
  ];

  return (
    <View style={styles.milestoneWrap}>
      <View style={styles.milestoneTrack} />
      <View
        style={[
          styles.milestoneFill,
          { width: `${Math.min(100, (activeIndex / 4) * 100)}%` },
        ]}
      />
      <View style={styles.milestoneRow}>
        {icons.map((name, index) => {
          const done = index <= activeIndex;
          const current = index === activeIndex;
          return (
            <View
              key={name}
              style={[
                styles.milestoneDot,
                current && styles.milestoneDotLg,
                done ? styles.milestoneOn : styles.milestoneOff,
              ]}
            >
              <Ionicons
                name={name}
                size={current ? 16 : 12}
                color={done ? '#FFFFFF' : MUTED}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RxRow({ code, potency }: { code: string; potency: string }) {
  return (
    <View style={styles.rxRow}>
      <View style={styles.rowGap}>
        <MaterialCommunityIcons name="needle" size={18} color={ICON_CYAN} />
        <AppText variant="labelMd" color={INK}>
          {code}
        </AppText>
      </View>
      <AppText variant="bodyMd" color={MUTED}>
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
        <Ionicons name={icon} size={20} color={INK} />
      </View>
      <View>
        <AppText variant="labelMd" color={INK} weightOverride="600">
          {title}
        </AppText>
        <AppText variant="labelSm" color={MUTED}>
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
  const dot = danger ? DANGER : success ? SUCCESS : active ? CHART : HAIRLINE;
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: dot }]} />
      <View style={styles.flex}>
        <AppText
          variant="labelMd"
          color={danger ? DANGER : INK}
          weightOverride={active ? '600' : '400'}
        >
          {title}
        </AppText>
        {body ? (
          <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
            {body}
          </AppText>
        ) : null}
        <AppText variant="labelSm" color={MUTED} style={styles.mtXs}>
          {time}
        </AppText>
      </View>
    </View>
  );
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
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
    borderColor: HAIRLINE,
    backgroundColor: CARD,
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
    backgroundColor: CHART,
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
    backgroundColor: HAIRLINE,
  },
  milestoneFill: {
    position: 'absolute',
    left: 0,
    height: 2,
    backgroundColor: CHART,
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
    borderColor: CARD,
  },
  milestoneDotLg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  milestoneOn: {
    backgroundColor: CHART,
  },
  milestoneOff: {
    backgroundColor: PAGE,
  },
  mapCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  mapFrame: {
    height: 180,
    backgroundColor: PAGE,
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACTION,
  },
  mapFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
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
    backgroundColor: PAGE,
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
    borderColor: ACTION_OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD,
  },
  maskedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  otpCard: {
    backgroundColor: OTP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    backgroundColor: HAIRLINE,
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
    backgroundColor: DANGER_FILL,
  },
  failedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DANGER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRule: {
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingBottom: spacing.xs,
  },
  pkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  pkgIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ICON_CYAN,
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
    backgroundColor: SUCCESS_FILL,
    alignItems: 'center',
    gap: spacing.xs,
  },
  deliveredCheck: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  center: {
    textAlign: 'center',
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
    borderColor: HAIRLINE,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
});
