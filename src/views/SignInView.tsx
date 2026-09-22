import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { AuthHeader } from '../components/AuthHeader';
import type { SignInViewModel } from '../controllers/useSignInController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';

export function SignInView({
  language,
  t,
  mobileNumber,
  errorMessage,
  agreedToWhatsApp,
  canSendOtp,
  onChangeMobileNumber,
  onToggleWhatsAppConsent,
  onSendOtp,
  onCallHelpline,
  onSelectLanguage,
  onBack,
}: SignInViewModel) {
  const insets = useSafeAreaInsets();
  const [contentMinHeight, setContentMinHeight] = useState<number>();
  const hasError = errorMessage != null;
  const highlightInputError = errorMessage === t('invalidMobile');

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
            {t('signInTitle')}
          </AppText>
          <AppText
            variant="bodyMd"
            color={colors.onSurfaceVariant}
            style={styles.center}
          >
            {t('signInSubtitle')}
          </AppText>
        </View>

        <View style={styles.form}>
          <View
            style={[
              styles.inputWrap,
              hasError && highlightInputError && styles.inputWrapError,
            ]}
          >
            <AppText variant="bodyLg" color={colors.onSurfaceVariant}>
              {t('countryCode')}
            </AppText>
            <View style={styles.inputDivider} />
            <TextInput
              value={mobileNumber}
              onChangeText={onChangeMobileNumber}
              placeholder={t('mobileNumberPlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              keyboardType="number-pad"
              maxLength={10}
              autoComplete="tel"
              textContentType="telephoneNumber"
              accessibilityLabel={t('mobileNumberPlaceholder')}
              style={[
                styles.input,
                {
                  fontFamily: fontFamilyFor('400', language, 'sans'),
                  fontSize: scaleFont(15),
                },
              ]}
            />
          </View>
          {hasError ? (
            <AppText variant="labelSm" color={colors.error}>
              {errorMessage}
            </AppText>
          ) : null}

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToWhatsApp }}
            onPress={onToggleWhatsAppConsent}
            style={styles.consentRow}
          >
            <View
              style={[
                styles.checkbox,
                agreedToWhatsApp && styles.checkboxChecked,
              ]}
            >
              {agreedToWhatsApp ? (
                <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
              ) : null}
            </View>
            <AppText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={styles.consentLabel}
            >
              {t('whatsappConsent')}
            </AppText>
          </Pressable>

          <AppButton
            label={t('sendOtp')}
            textVariant="titleMd"
            disabled={!canSendOtp}
            onPress={onSendOtp}
            style={styles.actionButton}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <AppText
              variant="labelSm"
              color={colors.onSurfaceVariant}
              style={styles.orLabel}
            >
              {t('orDivider')}
            </AppText>
            <View style={styles.orLine} />
          </View>

          <AppButton
            variant="secondary"
            label={t('bookViaHelpline')}
            textVariant="titleMd"
            onPress={onCallHelpline}
            style={[styles.actionButton, styles.helplineButton]}
            icon={
              <Ionicons name="call" size={20} color={colors.button} />
            }
          />
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            style={styles.center}
          >
            {t('helplineHint')}
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            style={styles.center}
          >
            {t('signInDisclaimer')}
          </AppText>
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
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    maxWidth: 448,
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
  form: {
    width: '100%',
    gap: spacing.md,
  },
  inputWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  inputWrapError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.outlineVariant,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: layout.buttonHeight,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    marginTop: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentLabel: {
    flex: 1,
  },
  actionButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
  helplineButton: {
    borderRadius: radii.button,
    backgroundColor: colors.card,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
  orLabel: {
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    paddingTop: spacing.sm,
  },
});
