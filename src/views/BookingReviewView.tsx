import { type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import type { BookingReviewViewModel } from '../controllers/useBookingReviewController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ICON_BLUE = '#3AA9E0';
const GREY_FILL = '#F2F2F2';
const PLACEHOLDER = '#8A8A8A';

export function BookingReviewView({
  language,
  t,
  profile,
  shortCredsKey,
  whenLabel,
  modeConsultLabel,
  patientLabel,
  doctorFeeLabel,
  platformFeeLabel,
  taxesLabel,
  totalLabel,
  reason,
  attached,
  shareRecords,
  reminders,
  policyOpen,
  emergencyOpen,
  onBack,
  onChangeWhen,
  onChangeMode,
  onChangePatient,
  onChangeReason,
  onToggleAttach,
  onToggleShareRecords,
  onToggleReminders,
  onTogglePolicy,
  onToggleEmergency,
  onProceedPay,
}: BookingReviewViewModel) {
  const insets = useSafeAreaInsets();
  const footerReserve = 108 + Math.max(insets.bottom, spacing.md);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: Math.max(insets.top, spacing.sm) }}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <AppText variant="headlineMd" color="#000000" style={styles.title}>
            {t('reviewTitle')}
          </AppText>
          <View style={styles.iconButton} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: footerReserve }]}
      >
        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <AppText variant="titleMd" color={ICON_BLUE} languageOverride="en">
                {profile.initials}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="titleMd" color="#000000" style={styles.doctorName}>
                {t(profile.nameKey)}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {t(shortCredsKey)}
              </AppText>
            </View>
          </View>
          <DetailRow
            label={t('reviewWhen')}
            value={whenLabel}
            changeLabel={t('reviewChange')}
            onChange={onChangeWhen}
          />
          <DetailRow
            label={t('reviewMode')}
            value={modeConsultLabel}
            changeLabel={t('reviewChange')}
            onChange={onChangeMode}
          />
          <DetailRow
            label={t('reviewPatient')}
            value={patientLabel}
            changeLabel={t('reviewChange')}
            onChange={onChangePatient}
            last
          />
        </View>

        <View style={styles.section}>
          <AppText variant="labelSm" color={MUTED} style={styles.sectionLabel}>
            {t('reviewReason')}
          </AppText>
          <TextInput
            value={reason}
            onChangeText={onChangeReason}
            placeholder={t('reviewReasonPlaceholder')}
            placeholderTextColor={PLACEHOLDER}
            multiline
            textAlignVertical="top"
            style={[
              styles.reason,
              { fontFamily: fontFamilyFor('400', language, 'sans') },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onToggleAttach}
            style={({ pressed }) => [styles.attach, pressed && styles.pressed]}
          >
            <Ionicons
              name={attached ? 'document-text-outline' : 'add'}
              size={20}
              color={ICON_BLUE}
            />
            <AppText variant="bodyMd" color={ICON_BLUE} weightOverride="600" style={styles.flex}>
              {attached ? t('reviewAttachFile') : t('reviewAttach')}
            </AppText>
            {attached ? (
              <AppText variant="labelSm" color={MUTED}>
                {t('reviewRemoveAttach')}
              </AppText>
            ) : null}
          </Pressable>
          <AppText variant="labelSm" color={MUTED} style={styles.attachHint}>
            {t('reviewAttachHint')}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="labelSm" color={MUTED} style={styles.sectionLabel}>
            {t('reviewPayment')}
          </AppText>
          <PayRow label={t('reviewDoctorFee')} value={doctorFeeLabel} />
          <PayRow label={t('reviewPlatformFee')} value={platformFeeLabel} />
          <PayRow label={t('reviewTaxes')} value={taxesLabel} />
          <View style={styles.payDivider} />
          <View style={styles.payRow}>
            <AppText variant="titleMd" color="#000000" style={styles.totalPay}>
              {t('reviewTotalPayable')}
            </AppText>
            <AppText variant="titleMd" color="#000000" style={styles.totalPay}>
              {totalLabel}
            </AppText>
          </View>
          <View style={styles.lockNote}>
            <AppText variant="labelSm" color={MUTED}>
              {t('reviewPriceLocked')}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.consentHead}>
            <Ionicons name="shield-outline" size={20} color={ICON_BLUE} />
            <AppText variant="titleMd" color="#000000" style={styles.consentTitle}>
              {t('reviewConsents')}
            </AppText>
          </View>
          <ConsentRow
            checked
            locked
            title={t('reviewDataConsent')}
            body={t('reviewDataConsentBody')}
          />
          <ConsentRow
            checked={shareRecords}
            title={t('reviewShareRecords')}
            body={t('reviewShareRecordsBody')}
            onPress={onToggleShareRecords}
          />
          <ConsentRow
            checked={reminders}
            title={t('reviewReminders')}
            onPress={onToggleReminders}
          />
          <View style={styles.recordingNote}>
            <AppText variant="labelSm" color={MUTED} style={styles.recordingCopy}>
              {t('reviewRecordingNote')}
            </AppText>
          </View>
        </View>

        <View style={styles.cardFlush}>
          <Accordion
            icon="calendar-clear-outline"
            title={t('reviewPolicy')}
            open={policyOpen}
            onToggle={onTogglePolicy}
          >
            <View style={styles.policyList}>
              {(
                [
                  'reviewPolicyFree',
                  'reviewPolicyFullRefund',
                  'reviewPolicyHalfRefund',
                  'reviewPolicyNoRefund',
                ] as const
              ).map((key) => (
                <View key={key} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
                    {t(key)}
                  </AppText>
                </View>
              ))}
            </View>
          </Accordion>
          <View style={styles.payDivider} />
          <Accordion
            icon="medkit-outline"
            title={t('reviewNotEmergency')}
            open={emergencyOpen}
            onToggle={onToggleEmergency}
          >
            <AppText variant="bodyMd" color={MUTED} style={styles.policyCopy}>
              {t('reviewNotEmergencyBody')}
            </AppText>
          </Accordion>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View>
          <AppText variant="labelSm" color={MUTED} style={styles.totalCap}>
            {t('reviewTotalAmount')}
          </AppText>
          <AppText variant="titleMd" color="#000000" style={styles.footerTotal}>
            {totalLabel}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onProceedPay}
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
        >
          <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
            {t('reviewProceedPay')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  changeLabel,
  onChange,
  last,
}: {
  label: string;
  value: string;
  changeLabel: string;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <AppText variant="bodyMd" color="#000000" style={styles.flex}>
        <AppText variant="bodyMd" color={MUTED} weightOverride="500">
          {`${label} — `}
        </AppText>
        {value}
      </AppText>
      <Pressable accessibilityRole="button" onPress={onChange} hitSlop={8}>
        <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
          {changeLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

function PayRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.payRow}>
      <AppText variant="bodyMd" color="#000000">
        {label}
      </AppText>
      <AppText variant="bodyMd" color="#000000">
        {value}
      </AppText>
    </View>
  );
}

function ConsentRow({
  checked,
  locked,
  title,
  body,
  onPress,
}: {
  checked: boolean;
  locked?: boolean;
  title: string;
  body?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: locked }}
      disabled={locked}
      onPress={onPress}
      style={[styles.consentRow, locked && styles.consentLocked]}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxOn,
          locked && styles.checkboxLocked,
        ]}
      >
        {checked ? (
          <Ionicons name="checkmark" size={14} color={locked ? MUTED : '#FFFFFF'} />
        ) : null}
      </View>
      <View style={styles.flex}>
        <View style={styles.consentTitleRow}>
          <AppText variant="bodyMd" color="#000000" weightOverride="600" style={styles.flex}>
            {title}
          </AppText>
          {locked ? <Ionicons name="lock-closed" size={14} color={MUTED} /> : null}
        </View>
        {body ? (
          <AppText variant="labelSm" color={MUTED} style={styles.consentBody}>
            {body}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

function Accordion({
  icon,
  title,
  open,
  onToggle,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.accordion}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={styles.accordionHead}
      >
        <Ionicons name={icon} size={20} color="#000000" />
        <AppText variant="bodyMd" color="#000000" weightOverride="600" style={styles.flex}>
          {title}
        </AppText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={MUTED}
        />
      </Pressable>
      {open ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: scaleFont(22),
    lineHeight: scaleFont(30),
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: spacing.gutter,
    gap: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  cardFlush: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: '#E6F5FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: scaleFont(12),
  },
  reason: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: PLACEHOLDER,
    borderRadius: radii.sm,
    padding: 12,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  attach: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: ICON_BLUE,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  attachHint: {
    textAlign: 'center',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  payDivider: {
    height: 1,
    backgroundColor: HAIRLINE,
  },
  totalPay: {
    fontSize: scaleFont(18),
    lineHeight: scaleFont(24),
  },
  lockNote: {
    backgroundColor: GREY_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: 8,
  },
  consentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consentTitle: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consentLocked: {
    opacity: 0.85,
  },
  consentTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  consentBody: {
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: PLACEHOLDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: ICON_BLUE,
    borderColor: ICON_BLUE,
  },
  checkboxLocked: {
    backgroundColor: GREY_FILL,
    borderColor: PLACEHOLDER,
  },
  recordingNote: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  recordingCopy: {
    fontStyle: 'italic',
    backgroundColor: GREY_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: 8,
    overflow: 'hidden',
  },
  accordion: {
    paddingVertical: 4,
  },
  accordionHead: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: 10,
  },
  accordionBody: {
    paddingLeft: 46,
    paddingRight: spacing.md,
    paddingBottom: spacing.md,
  },
  policyList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: MUTED,
    marginTop: 8,
  },
  policyCopy: {
    lineHeight: scaleFont(20),
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalCap: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  footerTotal: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  payButton: {
    flex: 1,
    maxWidth: 200,
    minHeight: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
