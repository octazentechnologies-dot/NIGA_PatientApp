import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { PaymentStatusViewModel } from '../controllers/usePaymentStatusController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ICON_BLUE = '#2A7BA3';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const ERROR = '#A3231A';
const ERROR_FILL = '#FBEBE9';
const AMBER = '#8A5109';
const AMBER_FILL = '#FCF3E4';
const AMBER_BORDER = '#F2C14E';
const CHIP_FILL = '#E6F5FE';
const PLACEHOLDER = '#8A8A8A';

export function PaymentStatusView(vm: PaymentStatusViewModel) {
  if (vm.status === 'failed') {
    return <FailedStatus {...vm} />;
  }
  if (vm.status === 'pending') {
    return <PendingStatus {...vm} />;
  }
  return <SuccessStatus {...vm} />;
}

function SuccessStatus({
  t,
  doctorName,
  doctorInitials,
  specialtyLine,
  whenLabel,
  modeConsultLabel,
  patientLabel,
  successMeta,
  onClose,
  onViewAppointment,
  onAddCalendar,
  onDownloadReceipt,
}: PaymentStatusViewModel) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View
        style={[
          styles.successHeader,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <View style={styles.topBarPlain}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onClose}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={24} color="#000000" />
          </Pressable>
        </View>
        <View style={styles.hero}>
          <View style={styles.successRing}>
            <View style={styles.successCore}>
              <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            </View>
          </View>
          <AppText variant="headlineMd" color="#000000" style={styles.heroTitle}>
            {t('payStatusSuccessTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {successMeta}
          </AppText>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 28 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <AppText variant="titleMd" color={ICON_BLUE} languageOverride="en">
                {doctorInitials}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="titleMd" color="#000000" style={styles.doctorName}>
                {doctorName}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {specialtyLine}
              </AppText>
            </View>
          </View>
          <Detail icon="calendar-outline" label={t('payStatusDateTime')} value={whenLabel} />
          <Detail icon="videocam-outline" label={t('payStatusConsultType')} value={modeConsultLabel} />
          <Detail icon="person-outline" label={t('payStatusPatient')} value={patientLabel} />
        </View>

        <View style={styles.reminder}>
          <Ionicons name="notifications-outline" size={20} color={ICON_BLUE} />
          <AppText variant="bodyMd" color="#000000" style={styles.flex}>
            {t('payStatusReminder')}
          </AppText>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: sheetBottomPadding(insets, spacing.md) }]}>
        <AppButton
          label={t('payStatusAddCalendar')}
          onPress={onAddCalendar}
          icon={<Ionicons name="calendar-outline" size={18} color="#FFFFFF" />}
        />
        <AppButton
          variant="secondary"
          label={t('payStatusViewAppointment')}
          onPress={onViewAppointment}
        />
        <Pressable accessibilityRole="button" onPress={onDownloadReceipt} style={styles.linkBtn}>
          <Ionicons name="download-outline" size={16} color={ICON_BLUE} />
          <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
            {t('payStatusReceipt')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function FailedStatus({
  t,
  holdMoreLabel,
  attemptId,
  onRetry,
  onChooseMethod,
  onChooseSlot,
}: PaymentStatusViewModel) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onRetry}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <AppText variant="headlineMd" color="#000000" style={styles.title}>
          {t('payStatusSecure')}
        </AppText>
        <View style={styles.iconButton}>
          <Ionicons name="lock-closed" size={18} color="#000000" />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.failedBody, { paddingBottom: sheetBottomPadding(insets, spacing.xl) }]}
      >
        <View style={styles.failIcon}>
          <Ionicons name="alert-circle" size={48} color={ERROR} />
        </View>
        <AppText variant="displayLg" color={ERROR} style={styles.failTitle}>
          {t('payStatusFailedTitle')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.centerCopy}>
          {t('payStatusFailedBody')}
        </AppText>
        <View style={styles.card}>
          <View style={styles.kvRow}>
            <AppText variant="labelSm" color={MUTED}>
              {t('payStatusReason')}
            </AppText>
            <AppText variant="bodyMd" color="#000000" weightOverride="600" style={styles.kvValue}>
              {t('payStatusFailReason')}
            </AppText>
          </View>
          <View style={styles.hairline} />
          <View style={styles.kvRow}>
            <AppText variant="labelSm" color={MUTED}>
              {t('payStatusAttempt')}
            </AppText>
            <AppText variant="bodyMd" color="#000000" languageOverride="en">
              {attemptId}
            </AppText>
          </View>
        </View>
        <View style={styles.holdStrip}>
          <Ionicons name="time-outline" size={18} color={AMBER} />
          <AppText variant="bodyMd" color={AMBER} style={styles.flex}>
            {holdMoreLabel}
          </AppText>
        </View>
        <AppButton
          label={t('payStatusRetry')}
          onPress={onRetry}
          icon={<Ionicons name="refresh" size={18} color="#FFFFFF" />}
        />
        <AppButton
          variant="secondary"
          label={t('payStatusOtherMethod')}
          onPress={onChooseMethod}
        />
        <Pressable accessibilityRole="button" onPress={onChooseSlot} style={styles.linkBtn}>
          <AppText variant="labelSm" color={MUTED} weightOverride="600">
            {t('payStatusOtherSlot')}
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function PendingStatus({
  t,
  onClose,
  onCheckStatus,
  onContactSupport,
}: PaymentStatusViewModel) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, styles.pendingRoot]}>
      <View
        style={[
          styles.topBarPlain,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onClose}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={24} color="#000000" />
        </Pressable>
      </View>
      <View style={styles.pendingBody}>
        <View style={styles.pendingIcon}>
          <Ionicons name="time" size={48} color={AMBER} />
        </View>
        <AppText variant="headlineMd" color="#000000" style={styles.heroTitle}>
          {t('payStatusPendingTitle')}
        </AppText>
        <AppText variant="bodyLg" color={MUTED} style={styles.centerCopy}>
          {t('payStatusPendingBody')}
        </AppText>
        <View style={styles.stepCard}>
          <View style={styles.stepTrack} />
          <View style={styles.stepProgress} />
          <Step done label={t('payStatusInitiated')} />
          <Step active label={t('payStatusBankConfirming')} />
          <Step label={t('payStatusConfirmed')} />
        </View>
        <AppButton label={t('payStatusCheck')} onPress={onCheckStatus} />
        <AppButton
          variant="secondary"
          label={t('payStatusSupport')}
          onPress={onContactSupport}
        />
        <View style={styles.notifyRow}>
          <Ionicons name="warning-outline" size={14} color={MUTED} />
          <AppText variant="labelSm" color={MUTED} style={styles.flex}>
            {t('payStatusNotify')}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={20} color={ICON_BLUE} />
      <View style={styles.flex}>
        <AppText variant="labelSm" color={MUTED} style={styles.detailLabel}>
          {label}
        </AppText>
        <AppText variant="bodyMd" color="#000000" weightOverride="600">
          {value}
        </AppText>
      </View>
    </View>
  );
}

function Step({
  done,
  active,
  label,
}: {
  done?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepDot,
          done && styles.stepDone,
          active && styles.stepActive,
        ]}
      >
        {done ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
        {active ? <View style={styles.stepPulse} /> : null}
      </View>
      <AppText
        variant="labelSm"
        color={active || done ? '#000000' : MUTED}
        weightOverride={active ? '600' : '400'}
        style={styles.stepLabel}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  pendingRoot: {
    flex: 1,
  },
  successHeader: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    paddingBottom: spacing.md,
  },
  topBar: {
    backgroundColor: colors.card,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  topBarPlain: {
    backgroundColor: colors.card,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontSize: scaleFont(22),
    lineHeight: scaleFont(30),
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  failedBody: {
    padding: spacing.gutter,
    alignItems: 'center',
    gap: spacing.md,
  },
  pendingBody: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.gutter,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: scaleFont(24),
    lineHeight: scaleFont(32),
  },
  successRing: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successCore: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 14,
    backgroundColor: colors.card,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: ICON_BLUE,
    borderRadius: radii.sm,
    padding: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: 10,
    backgroundColor: colors.card,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    backgroundColor: colors.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineBtn: {
    alignSelf: 'stretch',
    minHeight: layout.buttonHeight,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  linkBtn: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  failIcon: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: ERROR_FILL,
    borderWidth: 1,
    borderColor: ERROR,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  failTitle: {
    fontSize: scaleFont(32),
    lineHeight: scaleFont(40),
    textAlign: 'center',
  },
  centerCopy: {
    textAlign: 'center',
    maxWidth: 320,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  kvValue: {
    flex: 1,
    textAlign: 'right',
  },
  hairline: {
    height: 1,
    backgroundColor: HAIRLINE,
  },
  holdStrip: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AMBER_FILL,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: radii.sm,
    padding: 12,
  },
  pendingIcon: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: AMBER_FILL,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    paddingVertical: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  stepTrack: {
    position: 'absolute',
    left: 36,
    right: 36,
    top: 35,
    height: 2,
    backgroundColor: HAIRLINE,
  },
  stepProgress: {
    position: 'absolute',
    left: 36,
    width: '42%',
    top: 35,
    height: 2,
    backgroundColor: ICON_BLUE,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: PLACEHOLDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: {
    backgroundColor: SUCCESS,
    borderColor: SUCCESS,
  },
  stepActive: {
    backgroundColor: AMBER_FILL,
    borderWidth: 2,
    borderColor: AMBER,
  },
  stepPulse: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: AMBER,
  },
  stepLabel: {
    textAlign: 'center',
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    maxWidth: 280,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
