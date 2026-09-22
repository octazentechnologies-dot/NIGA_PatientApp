import { type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TranslationKey } from '../localization/types';
import type {
  DoctorAvailabilitySlot,
  DoctorConsultMode,
  DoctorFilterLanguage,
  DoctorFilters,
} from '../models/search';
import { FEE_RANGE_MAX, FEE_RANGE_MIN } from '../models/search';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { DatePickerSheet } from './DatePickerSheet';
import { FeeRangeSlider } from './FeeRangeSlider';

const HAIRLINE = '#E6E6E6';
const CHIP_FILL = '#E6F5FE';

export const FILTER_CARE_NEEDS: { id: string; titleKey: TranslationKey }[] = [
  { id: 'skin', titleKey: 'searchCareSkin' },
  { id: 'allergy', titleKey: 'searchCareAllergy' },
  { id: 'digestive', titleKey: 'searchCareDigestive' },
  { id: 'women', titleKey: 'searchCareWomen' },
  { id: 'child', titleKey: 'searchCareChild' },
  { id: 'pain', titleKey: 'searchCarePain' },
  { id: 'lifestyle', titleKey: 'searchCareLifestyle' },
];

const CONSULT_MODES: {
  id: DoctorConsultMode;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: TranslationKey;
}[] = [
  { id: 'video', icon: 'videocam-outline', labelKey: 'searchModeVideo' },
  { id: 'audio', icon: 'call-outline', labelKey: 'filterModeAudio' },
  { id: 'chat', icon: 'chatbubble-outline', labelKey: 'filterModeChat' },
  { id: 'clinic', icon: 'medkit-outline', labelKey: 'filterModeClinicVisit' },
];

const AVAILABILITY: { id: DoctorAvailabilitySlot; labelKey: TranslationKey }[] =
  [
    { id: 'now', labelKey: 'filterAvailableNow' },
    { id: 'today', labelKey: 'filterToday' },
    { id: 'tomorrow', labelKey: 'filterTomorrow' },
  ];

const FILTER_LANGUAGES: {
  id: DoctorFilterLanguage;
  labelKey: TranslationKey;
  languageOverride?: 'en' | 'mr';
}[] = [
  { id: 'mr', labelKey: 'searchLangMarathi', languageOverride: 'mr' },
  { id: 'en', labelKey: 'searchLangEnglish', languageOverride: 'en' },
  { id: 'hi', labelKey: 'searchLangHindi' },
];

type DoctorFiltersSheetProps = {
  language: 'en' | 'mr';
  t: (key: TranslationKey) => string;
  visible: boolean;
  draft: DoctorFilters;
  matchingCount: number;
  datePickerOpen: boolean;
  customDate: Date;
  onClose: () => void;
  onReset: () => void;
  onClear: () => void;
  onApply: () => void;
  onToggleCareNeed: (id: string) => void;
  onToggleMode: (mode: DoctorConsultMode) => void;
  onToggleAvailability: (slot: DoctorAvailabilitySlot) => void;
  onChangeFeeRange: (low: number, high: number) => void;
  onToggleLanguage: (language: DoctorFilterLanguage) => void;
  onToggleGender: (gender: 'male' | 'female') => void;
  onToggleRecognized: () => void;
  onToggleFocusCert: () => void;
  onChangeLocationQuery: (value: string) => void;
  onToggleCity: (cityId: string) => void;
  onToggleCurrentLocation: () => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onSelectCustomDate: (date: Date) => void;
};

export function DoctorFiltersSheet({
  language,
  t,
  visible,
  draft,
  matchingCount,
  datePickerOpen,
  customDate,
  onClose,
  onReset,
  onClear,
  onApply,
  onToggleCareNeed,
  onToggleMode,
  onToggleAvailability,
  onChangeFeeRange,
  onToggleLanguage,
  onToggleGender,
  onToggleRecognized,
  onToggleFocusCert,
  onChangeLocationQuery,
  onToggleCity,
  onToggleCurrentLocation,
  onOpenDatePicker,
  onCloseDatePicker,
  onSelectCustomDate,
}: DoctorFiltersSheetProps) {
  const insets = useSafeAreaInsets();
  const cityChips = [
    { id: 'pune', nameKey: 'searchCityPune' as const },
    { id: 'mumbai', nameKey: 'searchCityMumbai' as const },
    { id: 'solapur', nameKey: 'searchCitySolapur' as const },
  ].filter((city) => {
    const needle = draft.locationQuery.trim().toLowerCase();
    if (!needle) {
      return city.id !== 'solapur';
    }
    return t(city.nameKey).toLowerCase().includes(needle);
  });

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.sm) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerStart}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('close')}
                onPress={onClose}
                style={styles.iconButton}
              >
                <Ionicons name="close" size={22} color="#000000" />
              </Pressable>
              <AppText variant="titleMd" color="#000000">
                {t('searchFilters')}
              </AppText>
            </View>
            <Pressable accessibilityRole="button" onPress={onReset} hitSlop={8}>
              <AppText variant="labelMd" color={colors.primary}>
                {t('filterResetAll')}
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.content}
          >
            <Section title={t('filterCareNeed')}>
              <View style={styles.wrap}>
                {FILTER_CARE_NEEDS.map((need) => (
                  <ChoiceChip
                    key={need.id}
                    label={t(need.titleKey)}
                    selected={draft.careNeedIds.includes(need.id)}
                    onPress={() => onToggleCareNeed(need.id)}
                  />
                ))}
              </View>
            </Section>

            <Section title={t('filterConsultMode')}>
              <View style={styles.wrap}>
                {CONSULT_MODES.map((mode) => (
                  <ChoiceChip
                    key={mode.id}
                    label={t(mode.labelKey)}
                    selected={draft.modes.includes(mode.id)}
                    icon={mode.icon}
                    onPress={() => onToggleMode(mode.id)}
                  />
                ))}
              </View>
            </Section>

            <Section title={t('filterAvailability')}>
              <View style={styles.wrap}>
                {AVAILABILITY.map((slot) => (
                  <ChoiceChip
                    key={slot.id}
                    label={t(slot.labelKey)}
                    selected={draft.availability.includes(slot.id)}
                    onPress={() => onToggleAvailability(slot.id)}
                  />
                ))}
                <ChoiceChip
                  label={
                    draft.customDate
                      ? draft.customDate
                      : t('filterSelectDate')
                  }
                  selected={draft.availability.includes('date')}
                  icon="chevron-down"
                  iconPosition="end"
                  onPress={onOpenDatePicker}
                />
              </View>
            </Section>

            <Section
              title={t('filterFeeRange')}
              trailing={`₹${draft.feeMin} – ₹${draft.feeMax}`}
            >
              <View style={styles.sliderPad}>
                <FeeRangeSlider
                  low={draft.feeMin}
                  high={draft.feeMax}
                  onChange={onChangeFeeRange}
                />
                <View style={styles.feeEnds}>
                  <AppText variant="labelSm" color="#707976">
                    {t('filterFeeMin')}
                  </AppText>
                  <AppText variant="labelSm" color="#707976">
                    {t('filterFeeMax')}
                  </AppText>
                </View>
              </View>
              <View style={styles.wrap}>
                <ChoiceChip
                  compact
                  label={t('filterFeeUnder500')}
                  selected={draft.feeMin === FEE_RANGE_MIN && draft.feeMax === 500}
                  onPress={() => onChangeFeeRange(FEE_RANGE_MIN, 500)}
                />
                <ChoiceChip
                  compact
                  label={t('filterFee500to1000')}
                  selected={draft.feeMin === 500 && draft.feeMax === 1000}
                  onPress={() => onChangeFeeRange(500, 1000)}
                />
              </View>
            </Section>

            <Section title={t('languageLabel')}>
              <View style={styles.wrap}>
                {FILTER_LANGUAGES.map((item) => (
                  <ChoiceChip
                    key={item.id}
                    label={t(item.labelKey)}
                    languageOverride={item.languageOverride}
                    selected={draft.languages.includes(item.id)}
                    onPress={() => onToggleLanguage(item.id)}
                  />
                ))}
              </View>
            </Section>

            <Section title={t('filterDoctorSection')}>
              <View style={styles.wrap}>
                <ChoiceChip
                  label={t('genderMale')}
                  selected={draft.genders.includes('male')}
                  onPress={() => onToggleGender('male')}
                />
                <ChoiceChip
                  label={t('genderFemale')}
                  selected={draft.genders.includes('female')}
                  onPress={() => onToggleGender('female')}
                />
              </View>
            </Section>

            <Section title={t('filterQualifications')}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: draft.recognizedQualification }}
                onPress={onToggleRecognized}
                style={styles.checkRow}
              >
                <CheckBox checked={draft.recognizedQualification} />
                <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                  {t('filterRecognizedQual')}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: draft.focusCertified }}
                onPress={onToggleFocusCert}
                style={styles.checkRow}
              >
                <CheckBox checked={draft.focusCertified} />
                <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                  {t('filterFocusCert')}
                </AppText>
              </Pressable>
            </Section>

            <Section title={t('filterLocation')}>
              <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color="#707976" />
                <TextInput
                  value={draft.locationQuery}
                  onChangeText={onChangeLocationQuery}
                  placeholder={t('filterLocationPlaceholder')}
                  placeholderTextColor="#707976"
                  style={[
                    styles.searchInput,
                    {
                      fontFamily: fontFamilyFor('400', language, 'sans'),
                      fontSize: scaleFont(15),
                    },
                  ]}
                />
              </View>
              <View style={styles.wrap}>
                {cityChips.map((city) => (
                  <ChoiceChip
                    key={city.id}
                    label={t(city.nameKey)}
                    selected={draft.cityIds.includes(city.id)}
                    onPress={() => onToggleCity(city.id)}
                  />
                ))}
                <ChoiceChip
                  label={t('filterCurrentLocation')}
                  selected={draft.useCurrentLocation}
                  icon="navigate-outline"
                  onPress={onToggleCurrentLocation}
                />
              </View>
            </Section>

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={18} color="#707976" />
              <AppText variant="bodyMd" color="#707976" style={styles.flex}>
                {t('filterResultsDisclaimer')}
              </AppText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={t('filterClear')}
              variant="secondary"
              textVariant="titleMd"
              onPress={onClear}
              style={styles.footerClear}
            />
            <AppButton
              label={t('filterShowDoctors').replace(
                '{count}',
                String(matchingCount),
              )}
              textVariant="titleMd"
              onPress={onApply}
              style={styles.footerApply}
            />
          </View>
        </View>
      </View>

      <DatePickerSheet
        visible={datePickerOpen}
        value={customDate}
        minimumDate={new Date()}
        maximumDate={new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)}
        locale={language === 'mr' ? 'mr-IN' : 'en-IN'}
        cancelLabel={t('cancel')}
        doneLabel={t('done')}
        onCancel={onCloseDatePicker}
        onConfirm={onSelectCustomDate}
      />
    </SafeAreaModal>
  );
}

function Section({
  title,
  trailing,
  children,
}: {
  title?: string;
  trailing?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHead}>
          <AppText variant="titleMd" color="#000000" style={styles.flex}>
            {title}
          </AppText>
          {trailing ? (
            <AppText variant="labelMd" color="#000000">
              {trailing}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
  icon,
  iconPosition = 'start',
  compact,
  languageOverride,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'start' | 'end';
  compact?: boolean;
  languageOverride?: 'en' | 'mr';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
      ]}
    >
      {selected && iconPosition === 'start' ? (
        <Ionicons name="checkmark" size={16} color={colors.primary} />
      ) : icon && iconPosition === 'start' ? (
        <Ionicons name={icon} size={16} color="#000000" />
      ) : null}
      <AppText
        variant="labelMd"
        color="#000000"
        languageOverride={languageOverride}
      >
        {label}
      </AppText>
      {icon && iconPosition === 'end' ? (
        <Ionicons name={icon} size={16} color="#000000" />
      ) : null}
    </Pressable>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxOn]}>
      {checked ? (
        <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(48, 49, 46, 0.4)',
  },
  sheet: {
    height: '90%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.default,
    borderTopRightRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    marginTop: spacing.sm,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  headerStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.gutter,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: colors.card,
  },
  chipCompact: {
    minHeight: 36,
    borderRadius: radii.sm,
  },
  chipSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: CHIP_FILL,
  },
  sliderPad: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  feeEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchWrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: colors.onSurface,
  },
  checkRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOn: {
    backgroundColor: colors.primary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: '#F9FAFB',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  footerClear: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.button,
  },
  footerApply: {
    flex: 2,
    minHeight: 52,
    borderRadius: radii.button,
  },
  flex: {
    flex: 1,
  },
});
