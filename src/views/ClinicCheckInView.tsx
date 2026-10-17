import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { ClinicCheckInState } from '../controllers/useAppointmentDetailController';
import type { TranslationKey } from '../localization/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const WARN = colors.warning;
const WARN_FILL = colors.warningContainer;
const DISABLED_FILL = colors.surfaceVariant;

export type ClinicCheckInViewModel = {
  t: (key: TranslationKey) => string;
  clinicName: string;
  clinicAddress: string;
  appointmentWhenLabel: string;
  checkInState: ClinicCheckInState;
  checkedInAtLabel: string;
  queuePosition: number | null;
  waitMinutes: number | null;
  readyAtLabel: string | null;
  doctorName: string;
  checkInBusy?: boolean;
  onBack: () => void;
  onConfirmCheckIn: () => void;
  onTellClinic: () => void;
};

export function ClinicCheckInView(vm: ClinicCheckInViewModel) {
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
        {(vm.clinicName || vm.clinicAddress) ? (
          <View style={styles.clinicCard}>
            {vm.clinicName ? (
              <AppText variant="titleMd" color={colors.ink}>
                {vm.clinicName}
              </AppText>
            ) : null}
            {vm.clinicAddress ? (
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.clinicAddress}
              </AppText>
            ) : null}
            {vm.appointmentWhenLabel ? (
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.appointmentWhenLabel}
              </AppText>
            ) : null}
          </View>
        ) : null}

        {vm.checkInState === 'waiting' ? (
          <View style={styles.waitingBox}>
            <View style={styles.waitingTop}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <AppText variant="labelMd" color={colors.success} weightOverride="600">
                {vm.checkedInAtLabel
                  ? vm
                      .t('clinicCheckInCheckedAt')
                      .replace('{time}', vm.checkedInAtLabel)
                  : vm.t('clinicCheckInLabel')}
              </AppText>
            </View>
            {vm.queuePosition != null ? (
              <View style={styles.queueCard}>
                <View style={styles.queueBadge}>
                  <AppText variant="headlineMd" color={colors.success}>
                    {String(vm.queuePosition)}
                  </AppText>
                </View>
                <View style={styles.flex}>
                  <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                    {vm
                      .t('clinicCheckInQueue')
                      .replace('{n}', String(vm.queuePosition))}
                  </AppText>
                  {vm.waitMinutes != null ? (
                    <AppText variant="bodyMd" color={colors.muted}>
                      {vm
                        .t('clinicCheckInWait')
                        .replace('{minutes}', String(vm.waitMinutes))}
                    </AppText>
                  ) : null}
                </View>
              </View>
            ) : null}
            {vm.readyAtLabel ? (
              <AppText variant="bodyMd" color={colors.muted}>
                {vm.readyAtLabel}
              </AppText>
            ) : null}
            {vm.doctorName ? (
              <AppText variant="bodyMd" color={colors.muted} style={styles.waitingNote}>
                {vm
                  .t('clinicCheckInSeatNote')
                  .replace('{name}', vm.doctorName)}
              </AppText>
            ) : null}
          </View>
        ) : vm.checkInState === 'early' ? (
          <View style={styles.statusBox}>
            <Ionicons name="location-outline" size={36} color={colors.muted} />
            <AppText
              variant="labelSm"
              color={colors.muted}
              weightOverride="600"
              style={styles.uppercase}
            >
              {vm.t('clinicCheckInLabel')}
            </AppText>
            <AppText variant="bodyMd" color={colors.ink} style={styles.center}>
              {vm.t('clinicCheckInEarlyBody')}
            </AppText>
            <View style={[styles.checkBtn, styles.checkBtnDisabled]}>
              <Ionicons name="person-add-outline" size={18} color={colors.muted} />
              <AppText variant="labelMd" color={colors.muted} weightOverride="600">
                {vm.t('clinicCheckInCta')}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <Ionicons name="location" size={36} color={colors.primary} />
            <AppText
              variant="labelSm"
              color={colors.muted}
              weightOverride="600"
              style={styles.uppercase}
            >
              {vm.t('clinicCheckInLabel')}
            </AppText>
            <AppText variant="bodyMd" color={colors.ink} style={styles.center}>
              {vm.t('clinicCheckInReadyBody')}
            </AppText>
            <AppButton
              label={vm.t('clinicCheckInNowCta')}
              onPress={vm.onConfirmCheckIn}
              disabled={vm.checkInBusy}
              icon={
                <Ionicons name="person-add-outline" size={18} color={colors.card} />
              }
              style={styles.checkBtnActive}
            />
          </View>
        )}

        {vm.checkInState === 'ready' || vm.checkInState === 'waiting' ? (
          <View style={styles.lateStrip}>
            <View style={styles.lateLeft}>
              <Ionicons name="time-outline" size={20} color={WARN} />
              <AppText variant="labelMd" color={WARN} weightOverride="600">
                {vm.t('clinicCheckInRunningLate')}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onTellClinic}
              style={styles.lateBtn}
            >
              <AppText variant="labelMd" color={colors.primary} weightOverride="600">
                {vm.t('clinicCheckInTellClinic')}
              </AppText>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { flex: 1 },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.md, gap: spacing.md },
  clinicCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statusBox: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  center: { textAlign: 'center' },
  uppercase: { textTransform: 'uppercase' },
  checkBtn: {
    marginTop: spacing.sm,
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkBtnDisabled: { backgroundColor: DISABLED_FILL },
  checkBtnActive: { alignSelf: 'stretch', marginTop: spacing.sm },
  waitingBox: {
    backgroundColor: colors.successContainer,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  waitingTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  queueBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  waitingNote: { marginTop: spacing.xs },
  lateStrip: {
    backgroundColor: WARN_FILL,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lateLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  lateBtn: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.sm },
});
