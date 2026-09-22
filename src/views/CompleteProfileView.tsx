import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { AuthHeader } from '../components/AuthHeader';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { FormField } from '../components/FormField';
import { INDIAN_STATES } from '../config/indianStates';
import type { CompleteProfileViewModel } from '../controllers/useCompleteProfileController';
import type { AppLanguage } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';

export function CompleteProfileView({
  language,
  t,
  screenTitle,
  primaryActionLabel,
  showSkip,
  fullName,
  dateOfBirth,
  gender,
  preferredLanguage,
  cityTaluka,
  address,
  stateId,
  stateLabel,
  alternateMobile,
  email,
  referredBy,
  pincode,
  preferAudio,
  needLargeText,
  needCallAssistance,
  languagePickerOpen,
  statePickerOpen,
  datePickerOpen,
  datePickerValue,
  preferredLanguageLabel,
  onChangeFullName,
  onOpenDatePicker,
  onCloseDatePicker,
  onConfirmDateOfBirth,
  onSelectGender,
  onOpenLanguagePicker,
  onCloseLanguagePicker,
  onSelectPreferredLanguage,
  onChangeCityTaluka,
  onChangeAddress,
  onOpenStatePicker,
  onCloseStatePicker,
  onSelectState,
  onChangeAlternateMobile,
  onChangeEmail,
  onChangeReferredBy,
  onChangePincode,
  onTogglePreferAudio,
  onToggleNeedLargeText,
  onToggleNeedCallAssistance,
  onSelectLanguage,
  onContinue,
  onSkip,
  onBack,
}: CompleteProfileViewModel) {
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.stepBlock}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <AppText variant="headlineMd" color="#1F1F1F">
            {screenTitle}
          </AppText>
        </View>

        <View style={styles.form}>
          <FormField
            label={t('fullName')}
            value={fullName}
            placeholder={t('fullNamePlaceholder')}
            language={language}
            onChangeText={onChangeFullName}
          />
          <FormField
            label={t('dateOfBirth')}
            value={dateOfBirth}
            placeholder={t('dateOfBirthPlaceholder')}
            language={language}
            hint={t('dateOfBirthHint')}
            hintIcon={
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
            }
            rightIcon={
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            }
            onPress={onOpenDatePicker}
          />

          <View style={styles.fieldGroup}>
            <AppText variant="labelSm" color={colors.onSurface}>
              {t('gender')}
            </AppText>
            <View style={styles.genderRow}>
              <GenderChip
                label={t('genderFemale')}
                selected={gender === 'female'}
                onPress={() => onSelectGender('female')}
              />
              <GenderChip
                label={t('genderMale')}
                selected={gender === 'male'}
                onPress={() => onSelectGender('male')}
              />
              <GenderChip
                label={t('genderOther')}
                selected={gender === 'other'}
                onPress={() => onSelectGender('other')}
              />
            </View>
          </View>

          <FormField
            label={t('preferredLanguage')}
            value={preferredLanguageLabel}
            placeholder={t('preferredLanguagePlaceholder')}
            language={language}
            rightIcon={
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            }
            onPress={onOpenLanguagePicker}
          />

          <FormField
            label={t('cityTaluka')}
            value={cityTaluka}
            placeholder={t('cityTalukaPlaceholder')}
            language={language}
            onChangeText={onChangeCityTaluka}
          />
          <FormField
            label={t('address')}
            value={address}
            placeholder={t('addressPlaceholder')}
            language={language}
            multiline
            onChangeText={onChangeAddress}
          />
          <FormField
            label={t('state')}
            value={stateLabel}
            placeholder={t('statePlaceholder')}
            language={language}
            rightIcon={
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            }
            onPress={onOpenStatePicker}
          />

          <View style={styles.fieldGroup}>
            <AppText variant="labelSm" color={colors.onSurface}>
              {t('alternateMobile')}
            </AppText>
            <View style={styles.phoneWrap}>
              <AppText variant="bodyLg" color={colors.onSurfaceVariant}>
                {t('countryCode')}
              </AppText>
              <View style={styles.phoneDivider} />
              <TextInput
                value={alternateMobile}
                onChangeText={onChangeAlternateMobile}
                placeholder={t('mobileNumberPlaceholder')}
                placeholderTextColor={colors.outline}
                keyboardType="number-pad"
                maxLength={10}
                autoComplete="tel"
                accessibilityLabel={t('alternateMobile')}
                style={[
                  styles.phoneInput,
                  {
                    fontFamily: fontFamilyFor('400', language, 'sans'),
                    fontSize: scaleFont(15),
                  },
                ]}
              />
            </View>
          </View>

          <FormField
            label={t('email')}
            value={email}
            placeholder={t('emailPlaceholder')}
            language={language}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onChangeText={onChangeEmail}
          />
          <FormField
            label={t('referredBy')}
            value={referredBy}
            placeholder={t('referredByPlaceholder')}
            language={language}
            onChangeText={onChangeReferredBy}
          />
          <FormField
            label={t('pincode')}
            value={pincode}
            placeholder={t('pincodePlaceholder')}
            language={language}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="postal-code"
            onChangeText={onChangePincode}
          />
        </View>

        <View style={styles.accessibilityCard}>
          <View style={styles.accessibilityTitleRow}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
            <AppText variant="titleMd" color={colors.onSurface} style={styles.flex}>
              {t('accessibilityNeeds')}
            </AppText>
          </View>
          <CheckboxRow
            label={t('preferAudioConsult')}
            checked={preferAudio}
            onPress={onTogglePreferAudio}
          />
          <CheckboxRow
            label={t('needLargeText')}
            checked={needLargeText}
            onPress={onToggleNeedLargeText}
          />
          <CheckboxRow
            label={t('needCallAssistance')}
            checked={needCallAssistance}
            onPress={onToggleNeedCallAssistance}
          />
        </View>

        <View style={styles.privacyBanner}>
          <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          <AppText
            variant="bodyMd"
            color={colors.onSurfaceVariant}
            style={styles.flex}
          >
            {t('profilePrivacyNote')}
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
          label={primaryActionLabel}
          textVariant="titleMd"
          onPress={onContinue}
          style={styles.footerButton}
          iconPosition="end"
          icon={
            showSkip ? (
              <Ionicons name="arrow-forward" size={20} color={colors.onButton} />
            ) : undefined
          }
        />
        {showSkip ? (
          <AppButton
            variant="secondary"
            label={t('skipForNow')}
            textVariant="titleMd"
            onPress={onSkip}
            style={[styles.footerButton, styles.skipButton]}
          />
        ) : null}
      </View>

      <DatePickerSheet
        visible={datePickerOpen}
        value={datePickerValue}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        locale={language === 'mr' ? 'mr-IN' : 'en-IN'}
        cancelLabel={t('cancel')}
        doneLabel={t('done')}
        onCancel={onCloseDatePicker}
        onConfirm={onConfirmDateOfBirth}
      />

      <SafeAreaModal
        transparent
        animationType="fade"
        visible={languagePickerOpen}
        onRequestClose={onCloseLanguagePicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseLanguagePicker}>
          <Pressable
            style={[
              styles.modalCard,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
            onPress={() => undefined}
          >
            <AppText variant="titleMd" color={colors.primary} style={styles.modalTitle}>
              {t('preferredLanguage')}
            </AppText>
            <LanguageOption
              label={t('languageNameMarathi')}
              languageOverride="mr"
              selected={preferredLanguage === 'mr'}
              onPress={() => onSelectPreferredLanguage('mr')}
            />
            <LanguageOption
              label={t('languageNameEnglish')}
              languageOverride="en"
              selected={preferredLanguage === 'en'}
              onPress={() => onSelectPreferredLanguage('en')}
            />
            <LanguageOption
              label={t('languageHindi')}
              languageOverride="mr"
              selected={preferredLanguage === 'hi'}
              onPress={() => onSelectPreferredLanguage('hi')}
            />
          </Pressable>
        </Pressable>
      </SafeAreaModal>
      <SafeAreaModal
        transparent
        animationType="fade"
        visible={statePickerOpen}
        onRequestClose={onCloseStatePicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseStatePicker}>
          <Pressable
            style={[
              styles.stateModalCard,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
            onPress={() => undefined}
          >
            <AppText variant="titleMd" color={colors.primary} style={styles.modalTitle}>
              {t('state')}
            </AppText>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.stateList}
              contentContainerStyle={styles.stateListContent}
            >
              {INDIAN_STATES.map((item) => {
                const label = language === 'mr' ? item.mr : item.en;
                const selected = item.id === stateId;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onSelectState(item.id)}
                    style={[
                      styles.languageOption,
                      selected && styles.languageOptionSelected,
                    ]}
                  >
                    <AppText
                      variant="bodyMd"
                      languageOverride={language === 'mr' ? 'mr' : 'en'}
                      color={selected ? colors.primary : colors.onSurface}
                    >
                      {label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function GenderChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.genderChip, selected && styles.genderChipSelected]}
    >
      <AppText
        variant="bodyMd"
        color={selected ? colors.primary : colors.onSurface}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function CheckboxRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.checkboxRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? (
          <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
        ) : null}
      </View>
      <AppText variant="bodyMd" color={colors.onSurface} style={styles.flex}>
        {label}
      </AppText>
    </Pressable>
  );
}

function LanguageOption({
  label,
  selected,
  languageOverride,
  onPress,
}: {
  label: string;
  selected: boolean;
  languageOverride: AppLanguage;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.languageOption, selected && styles.languageOptionSelected]}
    >
      <AppText
        variant="bodyMd"
        languageOverride={languageOverride}
        color={selected ? colors.primary : colors.onSurface}
      >
        {label}
      </AppText>
    </Pressable>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  stepBlock: {
    gap: spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  form: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderChip: {
    flex: 1,
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipSelected: {
    backgroundColor: colors.languageSelectedFill,
    borderColor: colors.primary,
  },
  accessibilityCard: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  accessibilityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.buttonHeight,
  },
  checkbox: {
    width: 22,
    height: 22,
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
  skipButton: {
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
    gap: spacing.sm,
  },
  modalTitle: {
    marginBottom: spacing.sm,
  },
  languageOption: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  languageOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.languageSelectedFill,
  },
  phoneWrap: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  phoneDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.outlineVariant,
  },
  phoneInput: {
    flex: 1,
    minHeight: layout.buttonHeight,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  stateModalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  stateList: {
    maxHeight: 420,
  },
  stateListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
