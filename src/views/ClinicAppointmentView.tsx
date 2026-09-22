import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { CancelAppointmentSheet } from '../components/CancelAppointmentSheet';
import type { AppointmentDetailViewModel } from '../controllers/useAppointmentDetailController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';

type ClinicAppointmentViewModel = AppointmentDetailViewModel & {
  clinicName: string;
  clinicAddress: string;
  clinicDistanceLabel: string;
  clinicTravelNote: string;
  clinicFeeAmount: string;
  clinicBannerLabel: string;
  addressCopied: boolean;
  onOpenCheckIn: () => void;
  onCopyAddress: () => void;
  onDirections: () => void;
  onCallClinic: () => void;
  onSwitchOnline: () => void;
};

export function ClinicAppointmentView(vm: ClinicAppointmentViewModel) {
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
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
            {vm.t('clinicAptTitle')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 28 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={22} color={SUCCESS} />
          <AppText variant="labelMd" color={SUCCESS} weightOverride="600" style={styles.flex}>
            {vm.clinicBannerLabel}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="headlineLg" color={INK}>
            {vm.clinicName}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.clinicAddress}
          </AppText>

          <View style={styles.mapBox}>
            <View style={styles.mapGrid}>
              {Array.from({ length: 12 }).map((_, index) => (
                <View key={`map-line-${index}`} style={styles.mapLine} />
              ))}
            </View>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={28} color={ACTION_OUTLINE} />
            </View>
          </View>

          <View style={styles.actionRow}>
            <QuickAction
              icon="navigate-outline"
              label={vm.t('clinicAptDirections')}
              onPress={vm.onDirections}
            />
            <QuickAction
              icon="call-outline"
              label={vm.t('clinicAptCall')}
              sublabel={vm.t('clinicAptMasked')}
              onPress={vm.onCallClinic}
            />
            <QuickAction
              icon="copy-outline"
              label={
                vm.addressCopied
                  ? vm.t('clinicAptCopied')
                  : vm.t('clinicAptCopyAddress')
              }
              onPress={vm.onCopyAddress}
            />
          </View>

          <View style={styles.travelBox}>
            <Ionicons name="car-outline" size={20} color={MUTED} />
            <View style={styles.flex}>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.clinicDistanceLabel}
              </AppText>
              <AppText variant="labelSm" color={MUTED}>
                {vm.clinicTravelNote}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <AppText variant="titleMd" color={ACTION} languageOverride="en">
                {vm.doctorInitials}
              </AppText>
              {vm.verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
            <View style={styles.flex}>
              <AppText variant="headlineMd" color={INK}>
                {vm.doctorName}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.credentials}
              </AppText>
            </View>
          </View>

          <DetailRow label={vm.t('clinicAptWhen')} value={vm.whenLabel} />
          <DetailRow label={vm.t('clinicAptType')} value={vm.modeConsultLabel} />
          <DetailRow label={vm.t('clinicAptPatient')} value={vm.patientLabel} />
          <DetailRow label={vm.t('clinicAptBookingId')} value={vm.bookingId} />
          <View style={styles.detailRowLast}>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('clinicAptFee')}
            </AppText>
            <View style={styles.feeRight}>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.clinicFeeAmount}
              </AppText>
              <View style={styles.payPill}>
                <AppText variant="labelSm" color={MUTED} weightOverride="600">
                  {vm.t('clinicAptPayAtClinic')}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('clinicAptCheckInTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {vm.t('clinicAptCheckInBody')}
          </AppText>
          <AppButton label={vm.t('clinicAptCheckInCta')} onPress={vm.onOpenCheckIn} />
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('clinicAptBringTitle')}
          </AppText>
          {(
            [
              'clinicAptBring1',
              'clinicAptBring2',
              'clinicAptBring3',
              'clinicAptBring4',
            ] as const
          ).map((key) => (
            <View key={key} style={styles.bringRow}>
              <Ionicons name="checkmark-circle" size={20} color={ACTION_OUTLINE} />
              <AppText variant="bodyMd" color={INK} style={styles.flex}>
                {vm.t(key)}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.footerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onChangeTime}
            style={styles.outlineBtn}
          >
            <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
              {vm.t('clinicAptReschedule')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCancel}
            style={styles.outlineBtn}
          >
            <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
              {vm.t('clinicAptCancel')}
            </AppText>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onSwitchOnline}
          style={styles.switchLink}
        >
          <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
            {vm.t('clinicAptSwitchOnline')}
          </AppText>
        </Pressable>
      </ScrollView>

      <CancelAppointmentSheet
        language={vm.language}
        t={vm.t}
        cancelSheetOpen={vm.cancelSheetOpen}
        cancelReason={vm.cancelReason}
        cancelNote={vm.cancelNote}
        canConfirmCancel={vm.canConfirmCancel}
        refundTitle={vm.refundTitle}
        refundBody={vm.refundBody}
        onCloseCancelSheet={vm.onCloseCancelSheet}
        onSelectCancelReason={vm.onSelectCancelReason}
        onChangeCancelNote={vm.onChangeCancelNote}
        onConfirmCancel={vm.onConfirmCancel}
      />
    </View>
  );
}

function QuickAction({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickCircle}>
        <Ionicons name={icon} size={22} color={ACTION_OUTLINE} />
      </View>
      <AppText variant="labelSm" color={ACTION_OUTLINE} weightOverride="600">
        {label}
      </AppText>
      {sublabel ? (
        <AppText variant="labelSm" color={MUTED}>
          {sublabel}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="bodyMd" color={MUTED}>
        {label}
      </AppText>
      <AppText variant="labelMd" color={INK} weightOverride="600" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE },
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  mapBox: {
    height: 160,
    borderRadius: radii.default,
    backgroundColor: '#E8EEF2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGrid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
    justifyContent: 'space-evenly',
    paddingVertical: 8,
  },
  mapLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ACTION_OUTLINE,
    marginHorizontal: 12,
  },
  mapPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    gap: 4,
    minWidth: 88,
  },
  quickCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ACTION_OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.sm,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F5FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CARD,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  detailRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  feeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  payPill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: PAGE,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bringRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  outlineBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  switchLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
});
