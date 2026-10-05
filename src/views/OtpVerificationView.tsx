import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { AuthHeader } from '../components/AuthHeader';
import { OtpCodeField } from '../components/OtpCodeField';
import type { OtpVerificationViewModel } from '../controllers/useOtpVerificationController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function OtpVerificationView({
  language,
  t,
  formattedMobile,
  code,
  canVerify,
  isVerifying,
  errorMessage,
  autoFocus,
  canResend,
  resendCountdown,
  devOtp,
  onChangeCode,
  onVerify,
  onResend,
  onWhatsApp,
  onContactHelpline,
  onSelectLanguage,
  onBack,
}: OtpVerificationViewModel) {
  const insets = useSafeAreaInsets();
  const [contentMinHeight, setContentMinHeight] = useState<number>();
  const supportEmail = t('otpSupportEmail');

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          if (contentMinHeight == null) {
            setContentMinHeight(event.nativeEvent.layout.height);
          }
        }}
        contentContainerStyle={[
          styles.content,
          contentMinHeight != null && { minHeight: contentMinHeight },
          { paddingBottom: sheetBottomPadding(insets, spacing.xl) },
        ]}
      >
        <View style={styles.copy}>
          <AppText variant="headlineMd" color="#000000" style={styles.center}>
            {t('otpTitle')}
          </AppText>
          <AppText
            variant="bodyMd"
            color={colors.onSurfaceVariant}
            style={styles.center}
          >
            {t('otpSubtitle')}
          </AppText>
          <AppText
            variant="titleMd"
            color="#000000"
            languageOverride="en"
            style={styles.center}
          >
            {formattedMobile}
          </AppText>
        </View>

        <OtpCodeField
          value={code}
          language={language}
          autoFocus={autoFocus}
          accessibilityLabel={t('otpTitle')}
          onChange={onChangeCode}
        />

        {devOtp ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`OTP ${devOtp}. Tap to auto-fill`}
            onPress={() => onChangeCode(devOtp)}
            style={styles.devOtpContainer}
          >
            <AppText variant="bodyMd" color={colors.primary}>
              OTP:{' '}
              <AppText
                variant="titleMd"
                color={colors.primary}
                weightOverride="700"
              >
                {devOtp}
              </AppText>
            </AppText>
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              (Tap to fill)
            </AppText>
          </Pressable>
        ) : null}

        {errorMessage ? (
          <AppText variant="labelSm" color={colors.error} style={styles.center}>
            {errorMessage}
          </AppText>
        ) : null}

        <AppButton
          label={t('verify')}
          textVariant="titleMd"
          disabled={!canVerify}
          loading={isVerifying}
          onPress={onVerify}
          style={styles.actionButton}
        />

        {canResend ? (
          <Pressable accessibilityRole="button" onPress={onResend} hitSlop={8}>
            <AppText
              variant="bodyMd"
              color={colors.button}
              weightOverride="600"
              style={styles.center}
            >
              {t('resendOtp')}
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.resendRow}>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              {t('otpResendIn')}
            </AppText>
            <AppText variant="bodyMd" color="#000000" weightOverride="600">
              {resendCountdown}
            </AppText>
          </View>
        )}

        <View style={styles.secondaryActions}>
          <AppButton
            variant="secondary"
            label={t('contactHelpline')}
            textVariant="titleMd"
            onPress={onContactHelpline}
            style={styles.actionButton}
            icon={
              <Ionicons name="headset-outline" size={20} color={colors.button} />
            }
          />
          <AppButton
            variant="secondary"
            label={t('getCodeWhatsApp')}
            textVariant="titleMd"
            onPress={onWhatsApp}
            style={styles.actionButton}
            icon={
              <Ionicons
                name="chatbox-ellipses-outline"
                size={20}
                color={colors.button}
              />
            }
          />
        </View>

        <View style={styles.support}>
          <AppText
            variant="bodyMd"
            color={colors.onSurfaceVariant}
            style={styles.center}
          >
            {t('otpNeedAssistance')}
          </AppText>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={supportEmail}
            onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
            hitSlop={8}
          >
            <AppText
              variant="titleMd"
              color="#000000"
              languageOverride="en"
              style={styles.center}
            >
              {supportEmail}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
  secondaryActions: {
    gap: spacing.md,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  support: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  devOtpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.chipBackground,
    borderRadius: radii.sm,
    alignSelf: 'center',
  },
});
