import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaModal } from '../components/SafeAreaModal';
import type { SignInViewModel } from '../controllers/useSignInController';
import type { Country } from '../store/api/new/completeProfileApi';
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
  selectedCountryCode,
  selectedCountryName,
  isCountryPickerOpen,
  countries,
  isCountriesLoading,
  onChangeMobileNumber,
  onToggleWhatsAppConsent,
  onOpenCountryPicker,
  onCloseCountryPicker,
  onSelectCountry,
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                selectedCountryName
                  ? `${selectedCountryName} ${selectedCountryCode}`
                  : selectedCountryCode
              }
              onPress={onOpenCountryPicker}
              style={styles.countryCodePickerButton}
            >
              <AppText variant="bodyLg" color={colors.onSurface}>
                {selectedCountryCode}
              </AppText>
              <Ionicons
                name="chevron-down"
                size={14}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
            <View style={styles.inputDivider} />
            <TextInput
              value={mobileNumber}
              onChangeText={onChangeMobileNumber}
              placeholder={t('mobileNumberPlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              keyboardType="number-pad"
              maxLength={selectedCountryCode === '+91' ? 10 : 15}
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

      <CountryPickerModal
        visible={isCountryPickerOpen}
        title={t('country')}
        loading={isCountriesLoading}
        options={countries}
        selectedCode={selectedCountryCode}
        onClose={onCloseCountryPicker}
        onSelect={onSelectCountry}
      />
    </View>
  );
}

function CountryPickerModal({
  visible,
  title,
  loading,
  options,
  selectedCode,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  loading?: boolean;
  options: Country[];
  selectedCode: string;
  onClose: () => void;
  onSelect: (country: Country) => void;
}) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((c) => {
      if (!c) {
        return false;
      }
      const name = c.countryName?.toLowerCase() ?? '';
      const code = c.countryCode?.toLowerCase() ?? '';
      const iso2 = c.iso2Code?.toLowerCase() ?? '';
      const iso3 = c.iso3Code?.toLowerCase() ?? '';
      return (
        name.includes(q) ||
        code.includes(q) ||
        iso2.includes(q) ||
        iso3.includes(q)
      );
    });
  }, [options, search]);

  return (
    <SafeAreaModal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalCard,
            { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
          ]}
          onPress={() => undefined}
        >
          <View style={styles.modalHeader}>
            <AppText
              variant="titleMd"
              color={colors.primary}
              style={styles.modalTitle}
            >
              {title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.outline} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country..."
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.outline} />
              </Pressable>
            ) : null}
          </View>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginVertical: spacing.xl }}
            />
          ) : filtered.length === 0 ? (
            <AppText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={styles.emptyText}
            >
              No countries found
            </AppText>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.countryList}
              contentContainerStyle={styles.countryListContent}
            >
              {filtered.map((item) => {
                const selected = item.countryCode === selectedCode;
                return (
                  <Pressable
                    key={item.countryId}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onSelect(item)}
                    style={[
                      styles.countryOption,
                      selected && styles.countryOptionSelected,
                    ]}
                  >
                    <AppText
                      variant="bodyMd"
                      color={selected ? colors.primary : colors.onSurface}
                      style={styles.countryOptionName}
                    >
                      {item.countryName ?? ''}
                    </AppText>
                    <AppText
                      variant="labelMd"
                      color={
                        selected ? colors.primary : colors.onSurfaceVariant
                      }
                    >
                      {item.countryCode ?? ''}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </SafeAreaModal>
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
  countryCodePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    maxHeight: '80%',
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFont(14),
    color: colors.onSurface,
  },
  countryList: {
    maxHeight: 320,
  },
  countryListContent: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
  },
  countryOptionSelected: {
    backgroundColor: '#EBF4F8',
  },
  countryOptionName: {
    flex: 1,
    marginRight: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
});
