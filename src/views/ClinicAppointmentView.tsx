import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { CancelAppointmentSheet } from '../components/CancelAppointmentSheet';
import type { AppointmentDetailViewModel } from '../controllers/useAppointmentDetailController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

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
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText variant="headlineMd" color={colors.ink} style={styles.headerTitle}>
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
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <AppText variant="labelMd" color={colors.success} weightOverride="600" style={styles.flex}>
            {vm.clinicBannerLabel}
          </AppText>
        </View>

        {vm.clinicName || vm.clinicAddress ? (
          <View style={styles.card}>
            {vm.clinicName ? (
              <AppText variant="headlineLg" color={colors.ink} raw>
                {vm.clinicName}
              </AppText>
            ) : null}
            {vm.clinicAddress ? (
              <AppText variant="bodyMd" color={colors.muted} raw>
                {vm.clinicAddress}
              </AppText>
            ) : null}

            {vm.clinicMapLink || vm.clinicAddress ? (
              <View style={styles.mapBox}>
                <View style={styles.mapGrid}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <View key={`map-line-${index}`} style={styles.mapLine} />
                  ))}
                </View>
                <View style={styles.mapPin}>
                  <Ionicons name="location" size={28} color={colors.primaryOutline} />
                </View>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              {vm.clinicMapLink || vm.clinicAddress ? (
                <QuickAction
                  icon="navigate-outline"
                  label={vm.t('clinicAptDirections')}
                  onPress={vm.onDirections}
                />
              ) : null}
              {vm.clinicPhone ? (
                <QuickAction
                  icon="call-outline"
                  label={vm.t('clinicAptCall')}
                  onPress={vm.onCallClinic}
                />
              ) : null}
              {vm.clinicAddress || vm.clinicName ? (
                <QuickAction
                  icon="copy-outline"
                  label={
                    vm.addressCopied
                      ? vm.t('clinicAptCopied')
                      : vm.t('clinicAptCopyAddress')
                  }
                  onPress={vm.onCopyAddress}
                />
              ) : null}
            </View>

            {vm.clinicDistanceLabel || vm.clinicTravelNote ? (
              <View style={styles.travelBox}>
                <Ionicons name="car-outline" size={20} color={colors.muted} />
                <View style={styles.flex}>
                  {vm.clinicDistanceLabel ? (
                    <AppText variant="bodyMd" color={colors.muted}>
                      {vm.clinicDistanceLabel}
                    </AppText>
                  ) : null}
                  {vm.clinicTravelNote ? (
                    <AppText variant="labelSm" color={colors.muted}>
                      {vm.clinicTravelNote}
                    </AppText>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <AppText variant="titleMd" color={colors.primary} languageOverride="en">
                {vm.doctorInitials}
              </AppText>
              {vm.verified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color={colors.card} />
                </View>
              ) : null}
            </View>
            <View style={styles.flex}>
              <AppText variant="headlineMd" color={colors.ink}>
                {vm.doctorName}
              </AppText>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.credentials}
              </AppText>
            </View>
          </View>

          <DetailRow label={vm.t('clinicAptWhen')} value={vm.whenLabel} />
          <DetailRow label={vm.t('clinicAptType')} value={vm.modeConsultLabel} />
          <DetailRow label={vm.t('clinicAptPatient')} value={vm.patientLabel} />
          <DetailRow label={vm.t('clinicAptBookingId')} value={vm.bookingId} />
          {vm.clinicFeeAmount ? (
            <View style={styles.detailRowLast}>
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.t('clinicAptFee')}
              </AppText>
              <View style={styles.feeRight}>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600" raw>
                  {vm.clinicFeeAmount}
                </AppText>
                <View style={styles.payPill}>
                  <AppText variant="labelSm" color={colors.muted} weightOverride="600">
                    {vm.t('clinicAptPayAtClinic')}
                  </AppText>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
            {vm.t('clinicAptCheckInTitle')}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            {vm.t('clinicAptCheckInBody')}
          </AppText>
          <AppButton label={vm.t('clinicAptCheckInCta')} onPress={vm.onOpenCheckIn} />
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={colors.ink}>
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
              <Ionicons name="checkmark-circle" size={20} color={colors.primaryOutline} />
              <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
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
            <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
              {vm.t('clinicAptReschedule')}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCancel}
            style={styles.outlineBtn}
          >
            <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
              {vm.t('clinicAptCancel')}
            </AppText>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={vm.onSwitchOnline}
          style={styles.switchLink}
        >
          <AppText variant="labelMd" color={colors.primaryOutline} weightOverride="600">
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
        <Ionicons name={icon} size={22} color={colors.primaryOutline} />
      </View>
      <AppText variant="labelSm" color={colors.primaryOutline} weightOverride="600">
        {label}
      </AppText>
      {sublabel ? (
        <AppText variant="labelSm" color={colors.muted}>
          {sublabel}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="bodyMd" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="labelMd" color={colors.ink} weightOverride="600" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
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
    backgroundColor: colors.successContainer,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  mapBox: {
    height: 160,
    borderRadius: radii.default,
    backgroundColor: colors.primaryContainer,
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
    backgroundColor: colors.primaryOutline,
    marginHorizontal: 12,
  },
  mapPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    borderColor: colors.primaryOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.primaryContainer,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
    backgroundColor: colors.page,
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
    borderColor: colors.primary,
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
