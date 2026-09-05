import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { AuthHeader } from '../components/AuthHeader';
import type { ConsentViewModel } from '../controllers/useConsentController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function ConsentView({
  language,
  t,
  shareHealthRecords,
  medicineFulfilment,
  updatesAndTips,
  noticeOpen,
  onToggleShareHealthRecords,
  onToggleMedicineFulfilment,
  onToggleUpdatesAndTips,
  onReadNotice,
  onCloseNotice,
  onAgree,
  onManageLater,
  onSelectLanguage,
  onBack,
}: ConsentViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AuthHeader
        language={language}
        brandName={t('brandName')}
        backLabel={t('back')}
        onBack={onBack}
        onSelectLanguage={onSelectLanguage}
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.stepBlock}>
          <AppText variant="headlineMd" color="#000000">
            {t('consentTitle')}
          </AppText>
          <View style={styles.titleRule} />
        </View>

        <View style={styles.introCard}>
          <Ionicons name="shield" size={22} color={colors.primary} />
          <AppText variant="bodyMd" color={colors.onSurface} style={styles.flex}>
            {t('consentIntro')}
          </AppText>
        </View>
        <View style={styles.introFooter}>
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            style={styles.noticeVersion}
          >
            {t('privacyNoticeVersion')}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onReadNotice} hitSlop={8}>
            <AppText variant="labelSm" color={colors.primary} weightOverride="600">
              {t('readFullNotice')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.list}>
          <ConsentCard
            icon="videocam"
            title={t('consentTeleconsultTitle')}
            body={t('consentTeleconsultBody')}
            requiredLabel={t('consentRequired')}
            value
            locked
          />
          <ConsentCard
            icon="medkit"
            title={t('consentRecordsTitle')}
            body={t('consentRecordsBody')}
            value={shareHealthRecords}
            onToggle={onToggleShareHealthRecords}
          />
          <ConsentCard
            icon="flask"
            title={t('consentPharmacyTitle')}
            body={t('consentPharmacyBody')}
            value={medicineFulfilment}
            onToggle={onToggleMedicineFulfilment}
          />
          <ConsentCard
            icon="notifications"
            title={t('consentUpdatesTitle')}
            body={t('consentUpdatesBody')}
            value={updatesAndTips}
            onToggle={onToggleUpdatesAndTips}
          />
        </View>

        <View style={styles.recordingNote}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            style={styles.flex}
          >
            {t('consentRecordingNote')}
          </AppText>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <AppButton
          label={t('agreeAndContinue')}
          textVariant="titleMd"
          onPress={onAgree}
          style={styles.footerButton}
        />
        <AppButton
          variant="secondary"
          label={t('manageLater')}
          textVariant="titleMd"
          onPress={onManageLater}
          style={[styles.footerButton, styles.secondaryButton]}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={noticeOpen}
        onRequestClose={onCloseNotice}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseNotice}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <AppText
              variant="titleMd"
              color="#000000"
              style={styles.modalTitle}
            >
              {t('privacyNoticeTitle')}
            </AppText>
            <AppText
              variant="labelSm"
              color={colors.onSurfaceVariant}
              style={styles.modalVersion}
            >
              {t('privacyNoticeVersion')}
            </AppText>
            <AppText variant="bodyMd" color={colors.onSurface}>
              {t('consentIntro')}
            </AppText>
            <AppButton
              label={t('close')}
              textVariant="titleMd"
              onPress={onCloseNotice}
              style={styles.modalClose}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ConsentCard({
  icon,
  title,
  body,
  value,
  locked = false,
  requiredLabel,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  locked?: boolean;
  requiredLabel?: string;
  onToggle?: () => void;
}) {
  return (
    <View style={styles.consentCard}>
      <Ionicons name={icon} size={22} color={colors.primary} style={styles.cardIcon} />
      <View style={styles.consentCopy}>
        <View style={styles.titleRow}>
          <AppText variant="titleMd" color="#000000" style={styles.consentTitle}>
            {title}
          </AppText>
          {requiredLabel ? (
            <View style={styles.requiredBadge}>
              <AppText variant="labelSm" color="#1B5E20" style={styles.requiredBadgeText}>
                {requiredLabel}
              </AppText>
            </View>
          ) : null}
          <ConsentToggle value={value} locked={locked} onToggle={onToggle} />
        </View>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

function ConsentToggle({
  value,
  locked,
  onToggle,
}: {
  value: boolean;
  locked: boolean;
  onToggle?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: locked }}
      disabled={locked}
      onPress={onToggle}
      style={[
        styles.toggleTrack,
        value ? styles.toggleTrackOn : styles.toggleTrackOff,
        locked && styles.toggleLocked,
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          value ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      >
        {value ? (
          <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  stepBlock: {
    gap: spacing.sm,
  },
  titleRule: {
    height: 2,
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  introFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: -spacing.xs,
  },
  noticeVersion: {
    flex: 1,
  },
  list: {
    gap: 12,
    marginTop: spacing.xs,
  },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  cardIcon: {
    marginTop: 2,
  },
  consentCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  consentTitle: {
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  requiredBadgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  toggleTrack: {
    width: 48,
    height: 26,
    borderRadius: radii.full,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  toggleTrackOff: {
    backgroundColor: colors.outlineVariant,
    alignItems: 'flex-start',
  },
  toggleTrackOn: {
    backgroundColor: colors.buttonFill,
    alignItems: 'flex-end',
  },
  toggleLocked: {
    opacity: 0.95,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleThumbOn: {
    backgroundColor: colors.primary,
  },
  toggleThumbOff: {
    backgroundColor: colors.outline,
  },
  recordingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.sm,
  },
  footerButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.sm,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.xs,
  },
  modalVersion: {
    marginBottom: spacing.xs,
  },
  modalClose: {
    marginTop: spacing.sm,
    borderRadius: radii.sm,
  },
});
