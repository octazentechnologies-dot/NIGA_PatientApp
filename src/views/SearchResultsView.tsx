import { Ionicons } from '@expo/vector-icons';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { DoctorFiltersSheet } from '../components/DoctorFiltersSheet';
import { EmptyDoctorsIllustration } from '../components/EmptyDoctorsIllustration';
import { ErrorState } from '../components/ErrorState';
import { FacebookLoader } from '../components/FacebookLoader';
import { PatientTabBar, usePatientTabScrollInset } from '../components/PatientTabBar';
import { WhyOrderSheet, type WhyOrderChip } from '../components/WhyOrderSheet';
import type { HomeTab } from '../controllers/useHomeController';
import type { SearchResultsViewModel } from '../controllers/useSearchResultsController';
import type { DoctorSearchResult } from '../models/search';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

type SearchResultsViewProps = SearchResultsViewModel & {
  selectedTab: HomeTab;
  onSelectTab: (tab: HomeTab) => void;
};

export function SearchResultsView({
  language,
  t,
  loading,
  isError,
  canLoadMore,
  results,
  filterCount,
  videoFilterOn,
  marathiFilterOn,
  specialtyFilterOn,
  availabilityFilterOn,
  languageFilterOn,
  whyOrderOpen,
  filtersOpen,
  filterDraft,
  matchingCount,
  datePickerOpen,
  customDate,
  cityOptions = [],
  qualificationOptions = [],
  selectedTab,
  onBack,
  onOpenSearch,
  onOpenFilters,
  onCloseFilters,
  onResetFilters,
  onClearFilters,
  onApplyFilters,
  onToggleCareNeed,
  onToggleMode,
  onToggleAvailabilitySlot,
  onChangeFeeRange,
  onToggleFilterLanguage,
  onToggleGender,
  onToggleRecognized,
  onToggleFocusCert,
  onChangeLocationQuery,
  onToggleCity,
  onToggleCurrentLocation,
  onOpenDatePicker,
  onCloseDatePicker,
  onSelectCustomDate,
  onOpenSort,
  onRemoveVideoFilter,
  onRemoveMarathiFilter,
  onRemoveSpecialtyFilter,
  onRemoveAvailabilityFilter,
  onRemoveLanguageFilter,
  onOpenWhyOrder,
  onCloseWhyOrder,
  onSelectLanguage,
  onBook,
  onBookAssistance,
  onRetry,
  onLoadMore,
  onSelectTab,
}: SearchResultsViewProps) {
  const insets = useSafeAreaInsets();
  const tabScrollInset = usePatientTabScrollInset();
  const isEmpty = !loading && !isError && results.length === 0;

  const whyOrderChips: WhyOrderChip[] = [
    {
      id: 'skin',
      label: t('searchCareSkin'),
      onRemove: onRemoveSpecialtyFilter,
    },
    {
      id: 'marathi',
      label: t('searchFilterMarathi'),
      onRemove: onRemoveMarathiFilter,
    },
    {
      id: 'video',
      label: t('searchFilterVideo'),
      onRemove: onRemoveVideoFilter,
    },
    {
      id: 'distance',
      label: t('searchWhyOrderDistanceChip'),
      onRemove: () => undefined,
    },
  ];

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          hitSlop={8}
          onPress={onBack}
          style={styles.headerSide}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <AppText
          variant="titleMd"
          color={colors.ink}
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {isEmpty ? t('brandName') : t('searchResultsTitle')}
        </AppText>
        {isEmpty ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('languageLabel')}
            onPress={() => onSelectLanguage(language === 'en' ? 'mr' : 'en')}
            style={styles.languageButton}
          >
            <AppText
              variant="labelMd"
              color={colors.ink}
              languageOverride={language === 'en' ? 'mr' : 'en'}
            >
              {language === 'en' ? 'मराठी' : 'EN'}
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('homeSearchPlaceholder')}
              hitSlop={8}
              onPress={onOpenSearch}
              style={styles.headerIcon}
            >
              <Ionicons name="search" size={22} color={colors.onSurface} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('searchLocation')}
              hitSlop={8}
              style={styles.headerIcon}
            >
              <Ionicons name="location-outline" size={22} color={colors.onSurface} />
            </Pressable>
          </View>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.toolbar}>
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onOpenFilters}
              style={styles.toolButton}
            >
              <Ionicons name="filter" size={18} color={colors.ink} />
              <AppText variant="labelMd" color={colors.ink}>
                {`${t('searchAllFilters')} (${filterCount})`}
              </AppText>
            </Pressable>
            {specialtyFilterOn ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRemoveSpecialtyFilter}
                style={styles.activeChip}
              >
                <AppText variant="labelMd" color={colors.ink}>
                  {t('searchFilterSpecialty')}
                </AppText>
                <Ionicons name="close" size={14} color={colors.ink} />
              </Pressable>
            ) : null}
            {availabilityFilterOn ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRemoveAvailabilityFilter}
                style={styles.activeChip}
              >
                <AppText variant="labelMd" color={colors.ink}>
                  {t('searchFilterAvailabilityTodayLabel')}
                </AppText>
                <Ionicons name="close" size={14} color={colors.ink} />
              </Pressable>
            ) : null}
            {languageFilterOn ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRemoveLanguageFilter}
                style={styles.activeChip}
              >
                <AppText variant="labelMd" color={colors.ink}>
                  {t('searchFilterLanguageMarathi')}
                </AppText>
                <Ionicons name="close" size={14} color={colors.ink} />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={onOpenSort}
              style={styles.toolButton}
            >
              <AppText variant="labelMd" color={colors.ink}>
                {t('searchSortDistance')}
              </AppText>
            </Pressable>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.toolbar}>
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onOpenFilters}
              style={styles.toolButton}
            >
              <Ionicons name="options-outline" size={18} color={colors.ink} />
              <AppText variant="labelMd" color={colors.ink}>
                {t('searchFilters')}
              </AppText>
              {filterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <AppText
                    variant="labelSm"
                    color={colors.onPrimary}
                    style={styles.filterBadgeText}
                  >
                    {String(filterCount)}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onOpenSort}
              style={styles.toolButton}
            >
              <AppText variant="labelMd" color={colors.ink}>
                {t('searchSortRelevance')}
              </AppText>
              <Ionicons name="chevron-down" size={16} color={colors.muted} />
            </Pressable>
            {videoFilterOn ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRemoveVideoFilter}
                style={styles.activeChip}
              >
                <AppText variant="labelMd" color={colors.ink}>
                  {t('searchFilterVideo')}
                </AppText>
                <Ionicons name="close" size={14} color={colors.ink} />
              </Pressable>
            ) : null}
            {marathiFilterOn ? (
              <Pressable
                accessibilityRole="button"
                onPress={onRemoveMarathiFilter}
                style={styles.activeChip}
              >
                <AppText
                  variant="labelMd"
                  color={colors.ink}
                  languageOverride="mr"
                >
                  {t('searchFilterMarathi')}
                </AppText>
                <Ionicons name="close" size={14} color={colors.ink} />
              </Pressable>
            ) : null}
            <View style={styles.toolButton}>
              <AppText variant="labelMd" color={colors.ink}>
                {t('searchFilterAvailableToday')}
              </AppText>
            </View>
            <View style={styles.toolButton}>
              <AppText variant="labelMd" color={colors.ink}>
                {t('searchFilterUnder500')}
              </AppText>
            </View>
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.loaderWrap}
        >
          <FacebookLoader cards={3} />
        </ScrollView>
      ) : isError ? (
        <ErrorState message={t('searchResultsEmptyBody')} onRetry={onRetry} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyArt}>
            <EmptyDoctorsIllustration />
          </View>
          <AppText variant="titleMd" color={colors.ink} style={styles.centerText}>
            {t('searchResultsEmptyTitle')}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted} style={styles.emptyBody}>
            {t('searchResultsEmptyBody')}
          </AppText>
          <View style={styles.emptyActions}>
            <AppButton
              label={t('searchResultsClearFilters')}
              textVariant="titleMd"
              onPress={onClearFilters}
              style={styles.emptyButton}
            />
            <AppButton
              label={t('searchResultsBookAssistance')}
              variant="secondary"
              textVariant="titleMd"
              onPress={onBookAssistance}
              style={styles.emptyButton}
            />
          </View>
          <AppText variant="bodyMd" color={colors.muted} style={styles.centerText}>
            {t('searchResultsHelplinePrefix')}
            <AppText
              variant="labelMd"
              color={colors.primary}
              style={styles.helplineLink}
              onPress={() => Linking.openURL('tel:104')}
            >
              {t('searchResultsHelplineNumber')}
            </AppText>
          </AppText>
        </View>
      ) : (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: tabScrollInset }]}
        >
          <View style={styles.summaryRow}>
            <AppText variant="bodyMd" color={colors.muted}>
              {t('searchResultsCount')}
            </AppText>
            <Pressable accessibilityRole="button" onPress={onOpenWhyOrder}>
              <AppText variant="labelMd" color={colors.primary}>
                {t('searchResultsWhyOrder')}
              </AppText>
            </Pressable>
          </View>

          {results.map((doctor) => (
            <DoctorResultCard
              key={doctor.id}
              doctor={doctor}
              t={t}
              onOpen={() => onBook(doctor.id)}
            />
          ))}
          {canLoadMore ? (
            <AppButton
              label={t('searchResultsTitle')}
              variant="secondary"
              onPress={onLoadMore}
              style={{ marginTop: spacing.md }}
            />
          ) : null}
        </ScrollView>
      )}

      <PatientTabBar
        selectedTab={selectedTab}
        t={t}
        onSelectTab={onSelectTab}
      />

      <DoctorFiltersSheet
        language={language}
        t={t}
        visible={filtersOpen}
        draft={filterDraft}
        matchingCount={matchingCount}
        datePickerOpen={datePickerOpen}
        customDate={customDate}
        onClose={onCloseFilters}
        onReset={onResetFilters}
        onClear={onClearFilters}
        onApply={onApplyFilters}
        onToggleCareNeed={onToggleCareNeed}
        onToggleMode={onToggleMode}
        onToggleAvailability={onToggleAvailabilitySlot}
        onChangeFeeRange={onChangeFeeRange}
        onToggleLanguage={onToggleFilterLanguage}
        onToggleGender={onToggleGender}
        onToggleRecognized={onToggleRecognized}
        onToggleFocusCert={onToggleFocusCert}
        onChangeLocationQuery={onChangeLocationQuery}
        onToggleCity={onToggleCity}
        onToggleCurrentLocation={onToggleCurrentLocation}
        onOpenDatePicker={onOpenDatePicker}
        onCloseDatePicker={onCloseDatePicker}
        onSelectCustomDate={onSelectCustomDate}
        cityOptions={cityOptions}
        qualificationOptions={qualificationOptions}
      />

      <WhyOrderSheet
        visible={whyOrderOpen}
        t={t}
        chips={whyOrderChips}
        onClose={onCloseWhyOrder}
      />
    </View>
  );
}

function DoctorResultCard({
  doctor,
  t,
  onOpen,
}: {
  doctor: DoctorSearchResult;
  t: SearchResultsViewModel['t'];
  onOpen: () => void;
}) {
  return (
    <View style={styles.card}>
      {doctor.sponsored ? (
        <View style={styles.sponsoredTag}>
          <AppText
            variant="labelSm"
            color={colors.ink}
            style={styles.sponsoredText}
          >
            {t('searchSponsored')}
          </AppText>
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <AppText
                variant="titleMd"
                color={colors.primary}
                languageOverride="en"
              >
                {doctor.initials}
              </AppText>
            </View>
            {doctor.verified ? (
              <View
                accessibilityLabel={t('homeVerified')}
                style={styles.verifiedBadge}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              </View>
            ) : null}
          </View>
          <View style={styles.flex}>
            <AppText variant="titleMd" color={colors.ink} raw>
              {t(doctor.nameKey)}
            </AppText>
            {doctor.credentialsKey ? (
              <AppText variant="bodyMd" color={colors.muted} raw>
                {t(doctor.credentialsKey)}
              </AppText>
            ) : null}
            {doctor.registrationKey ? (
              <AppText variant="bodyMd" color={colors.muted} raw>
                {t(doctor.registrationKey)}
              </AppText>
            ) : null}
            {doctor.experienceKey ? (
              <AppText variant="labelSm" color={colors.muted}>
                {t(doctor.experienceKey)}
              </AppText>
            ) : null}
            <View style={styles.tags}>
              {doctor.languageKeys.map((key) => (
                <View key={key} style={styles.tag}>
                  <AppText
                    variant="labelSm"
                    color={colors.ink}
                    languageOverride={
                      key === 'searchLangMarathi' ? 'mr' : undefined
                    }
                  >
                    {t(key)}
                  </AppText>
                </View>
              ))}
              {doctor.modes.map((mode) => (
                <View key={mode} style={styles.tag}>
                  <Ionicons
                    name={mode === 'video' ? 'videocam-outline' : 'storefront-outline'}
                    size={12}
                    color={colors.ink}
                  />
                  <AppText variant="labelSm" color={colors.ink}>
                    {t(mode === 'video' ? 'searchModeVideo' : 'searchModeClinic')}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {doctor.certifiedKey ? (
          <View style={styles.certified}>
            <Ionicons name="trophy" size={20} color={colors.ink} />
            <AppText variant="labelMd" color={colors.ink} style={styles.flex}>
              {t(doctor.certifiedKey)}
            </AppText>
          </View>
        ) : null}

        {doctor.sponsored ? (
          <View style={styles.paidNote}>
            <Ionicons name="information-circle-outline" size={16} color={colors.ink} />
            <AppText variant="labelSm" color={colors.ink} style={styles.flex}>
              {t('searchPaidPlacement')}
            </AppText>
          </View>
        ) : null}

        {doctor.rating != null && doctor.reviewCount > 0 ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.tertiaryContainer} />
            <AppText variant="labelMd" color={colors.ink} raw>
              {doctor.rating}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted} style={styles.reviews} raw>
              {String(doctor.reviewCount)}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.cardFooter}>
        <View style={styles.flex}>
          {doctor.feeLabel ? (
            <View style={styles.feeRow}>
              <AppText variant="labelMd" color={colors.ink} raw>
                {doctor.feeLabel}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {t('searchConsultation')}
              </AppText>
            </View>
          ) : null}
          <View style={styles.whenRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={doctor.availabilitySoon ? colors.success : colors.muted}
            />
            <AppText
              variant="labelSm"
              color={doctor.availabilitySoon ? colors.success : colors.muted}
              raw
            >
              {t(doctor.availabilityKey)}
            </AppText>
          </View>
        </View>
        <AppButton
          label={t('searchBook')}
          textVariant="labelMd"
          onPress={onOpen}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  headerSide: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  languageButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: spacing.sm,
  },
  toolbarContent: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: 8,
  },
  toolButton: {
    position: 'relative',
    overflow: 'visible',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingLeft: 12,
    paddingRight: spacing.sm,
    paddingVertical: 6,
  },
  loaderWrap: {
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  list: {
    padding: spacing.gutter,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  emptyArt: {
    width: 208,
    height: 208,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  emptyActions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  emptyButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radii.button,
  },
  centerText: {
    textAlign: 'center',
  },
  helplineLink: {
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sponsoredTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: colors.tertiaryFixed,
    borderBottomLeftRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sponsoredText: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarWrap: {
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.successContainer,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  certified: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.tertiaryContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: 12,
  },
  paidNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.tertiaryFixed,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    padding: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviews: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  whenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  bookButton: {
    minHeight: 48,
    minWidth: 84,
    borderRadius: radii.button,
    paddingHorizontal: spacing.lg,
  },
  flex: {
    flex: 1,
  },
});
