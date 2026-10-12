import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import { AuthHeader } from '../components/AuthHeader';
import type { ConsentViewModel } from '../controllers/useConsentController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

export function ConsentView({
  language,
  t,
  consents,
  isLoading,
  isError,
  togglingConsentId,
  noticeOpen,
  onToggleConsent,
  onRetry,
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
        style={styles.scroll}
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
          {isLoading && consents.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : isError && consents.length === 0 ? (
            <View style={styles.errorContainer}>
              <AppText variant="bodyMd" color={colors.error}>
                Failed to load consents.
              </AppText>
              <AppButton
                label="Retry"
                variant="secondary"
                onPress={onRetry}
                style={styles.retryButton}
              />
            </View>
          ) : (
            consents.map((item) => (
              <ConsentCard
                key={item.consentTypeId}
                icon={getConsentIcon(item.code)}
                title={item.title}
                body={item.description}
                value={item.granted}
                isToggling={togglingConsentId === item.consentTypeId}
                onToggle={() => onToggleConsent(item.consentTypeId)}
              />
            ))
          )}
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
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
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

      <SafeAreaModal
        transparent
        animationType="fade"
        visible={noticeOpen}
        onRequestClose={onCloseNotice}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseNotice}>
          <Pressable
            style={[
              styles.modalCard,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
            onPress={() => undefined}
          >
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
      </SafeAreaModal>
    </View>
  );
}

function getConsentIcon(code: string): keyof typeof Ionicons.glyphMap {
  switch (code?.toLowerCase()) {
    case 'privacy':
      return 'shield-checkmark';
    case 'booking':
      return 'calendar';
    case 'telerecording':
      return 'videocam';
    case 'pharmacyshare':
      return 'flask';
    case 'marketing':
      return 'notifications';
    case 'caregiver':
      return 'people';
    default:
      return 'document-text';
  }
}

function ConsentCard({
  icon,
  title,
  body,
  value,
  isToggling = false,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  isToggling?: boolean;
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
          {isToggling ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.switchLoader} />
          ) : (
            <AppSwitch
              value={value}
              onToggle={onToggle}
            />
          )}
        </View>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
          {body}
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
  scroll: {
    flex: 1,
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
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  retryButton: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
  },
  switchLoader: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignSelf: 'stretch',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  footerButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
  secondaryButton: {
    borderRadius: radii.button,
    backgroundColor: colors.card,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
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
    borderRadius: radii.button,
  },
});
