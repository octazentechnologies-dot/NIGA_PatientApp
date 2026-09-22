import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { ClinicCheckInState } from '../controllers/useAppointmentDetailController';
import type { TranslationKey } from '../localization/types';
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
const SUCCESS_BORDER = '#B8E4D0';
const WARN = '#8A5109';
const WARN_FILL = '#FCF3E4';
const WARN_BORDER = '#F6E0B5';
const DISABLED_FILL = '#F2F2F2';

export type ClinicCheckInViewModel = {
  t: (key: TranslationKey) => string;
  clinicName: string;
  clinicAddress: string;
  appointmentWhenLabel: string;
  checkInState: ClinicCheckInState;
  checkedInAtLabel: string;
  queuePosition: number;
  waitMinutes: number;
  doctorName: string;
  onBack: () => void;
  onConfirmCheckIn: () => void;
  onTellClinic: () => void;
  onSelectDemoState: (state: ClinicCheckInState) => void;
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
        <AppText variant="headlineLg" color={INK}>
          {vm.t('clinicCheckInDemoTitle')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED}>
          {vm.t('clinicCheckInDemoBody')}
        </AppText>

        <StateCard
          title={vm.t('clinicCheckInVariantEarly')}
          clinicName={vm.clinicName}
          clinicAddress={vm.clinicAddress}
          whenLabel={vm.appointmentWhenLabel}
          active={vm.checkInState === 'early'}
          onPress={() => vm.onSelectDemoState('early')}
        >
          <View style={styles.statusBox}>
            <Ionicons name="location-outline" size={36} color={MUTED} />
            <AppText
              variant="labelSm"
              color={MUTED}
              weightOverride="600"
              style={styles.uppercase}
            >
              {vm.t('clinicCheckInLabel')}
            </AppText>
            <AppText variant="bodyMd" color={INK} style={styles.center}>
              {vm.t('clinicCheckInEarlyBody')}
            </AppText>
            <View style={[styles.checkBtn, styles.checkBtnDisabled]}>
              <Ionicons name="person-add-outline" size={18} color={MUTED} />
              <AppText variant="labelMd" color={MUTED} weightOverride="600">
                {vm.t('clinicCheckInCta')}
              </AppText>
            </View>
          </View>
        </StateCard>

        <StateCard
          title={vm.t('clinicCheckInVariantWaiting')}
          clinicName={vm.clinicName}
          clinicAddress={vm.clinicAddress}
          whenLabel={vm.appointmentWhenLabel}
          active={vm.checkInState === 'waiting'}
          onPress={() => vm.onSelectDemoState('waiting')}
        >
          <View style={styles.waitingBox}>
            <View style={styles.waitingTop}>
              <Ionicons name="checkmark-circle" size={22} color={SUCCESS} />
              <AppText variant="labelMd" color={SUCCESS} weightOverride="600">
                {vm.t('clinicCheckInCheckedAt').replace('{time}', vm.checkedInAtLabel)}
              </AppText>
            </View>
            <View style={styles.queueCard}>
              <View style={styles.queueBadge}>
                <AppText variant="headlineMd" color={SUCCESS}>
                  {String(vm.queuePosition)}
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="labelMd" color={INK} weightOverride="600">
                  {vm
                    .t('clinicCheckInQueue')
                    .replace('{n}', String(vm.queuePosition))}
                </AppText>
                <AppText variant="bodyMd" color={MUTED}>
                  {vm
                    .t('clinicCheckInWait')
                    .replace('{minutes}', String(vm.waitMinutes))}
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMd" color={MUTED} style={styles.waitingNote}>
              {vm
                .t('clinicCheckInSeatNote')
                .replace('{name}', vm.doctorName)}
            </AppText>
          </View>
        </StateCard>

        <StateCard
          title={vm.t('clinicCheckInVariantReady')}
          clinicName={vm.clinicName}
          clinicAddress={vm.clinicAddress}
          whenLabel={vm.appointmentWhenLabel}
          active={vm.checkInState === 'ready'}
          onPress={() => vm.onSelectDemoState('ready')}
        >
          <View style={styles.statusBox}>
            <Ionicons name="location" size={36} color={ACTION} />
            <AppText
              variant="labelSm"
              color={MUTED}
              weightOverride="600"
              style={styles.uppercase}
            >
              {vm.t('clinicCheckInLabel')}
            </AppText>
            <AppText variant="bodyMd" color={INK} style={styles.center}>
              {vm.t('clinicCheckInReadyBody')}
            </AppText>
            <AppButton
              label={vm.t('clinicCheckInNowCta')}
              onPress={vm.onConfirmCheckIn}
              icon={
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
              }
              style={styles.checkBtnActive}
            />
          </View>
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
              style={styles.tellBtn}
            >
              <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
                {vm.t('clinicCheckInTellClinic')}
              </AppText>
            </Pressable>
          </View>
        </StateCard>
      </ScrollView>
    </View>
  );
}

function StateCard({
  title,
  clinicName,
  clinicAddress,
  whenLabel,
  active,
  onPress,
  children,
}: {
  title: string;
  clinicName: string;
  clinicAddress: string;
  whenLabel: string;
  active: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.stateWrap, active && styles.stateWrapActive]}
    >
      <AppText variant="headlineMd" color={INK} style={styles.variantTitle}>
        {title}
      </AppText>
      <View style={styles.card}>
        <View style={styles.clinicHead}>
          <View style={styles.storeIcon}>
            <Ionicons name="storefront-outline" size={22} color={MUTED} />
          </View>
          <View style={styles.flex}>
            <AppText variant="headlineMd" color={INK}>
              {clinicName}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {clinicAddress}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {whenLabel}
            </AppText>
          </View>
        </View>
        {children}
      </View>
    </Pressable>
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
  stateWrap: {
    gap: spacing.sm,
  },
  stateWrapActive: {
    opacity: 1,
  },
  variantTitle: {
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  clinicHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DISABLED_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    backgroundColor: PAGE,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  center: { textAlign: 'center' },
  checkBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  checkBtnDisabled: {
    backgroundColor: DISABLED_FILL,
  },
  checkBtnActive: {
    width: '100%',
    marginTop: spacing.xs,
  },
  waitingBox: {
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  waitingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  queueBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SUCCESS_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingNote: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lateStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: WARN_FILL,
    borderWidth: 1,
    borderColor: WARN_BORDER,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  lateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  tellBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: ACTION_OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
});
