import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Keyboard,
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
import { StatusBarBleed } from '../components/StatusBarBleed';
import type { SearchDoctorsViewModel } from '../controllers/useSearchDoctorsController';
import type { CareNeed, NearbyDoctor } from '../models/search';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { useAndroidStatusBarBackground } from '../utilities/useAndroidPageStatusBar';

export function SearchDoctorsView({
  language,
  t,
  query,
  recents,
  careNeeds,
  doctors,
  doctorsLoading,
  cities,
  selectedCityId,
  selectedCityLabel,
  cityPickerOpen,
  listening,
  voiceErrorKey,
  onChangeQuery,
  onSelectRecent,
  onRemoveRecent,
  onSelectCareNeed,
  onOpenCityPicker,
  onCloseCityPicker,
  onSelectCity,
  onVoiceSearch,
  onSeeAvailability,
  onOpenDoctor,
  onSubmitSearch,
  onBack,
}: SearchDoctorsViewModel) {
  const insets = useSafeAreaInsets();
  useAndroidStatusBarBackground(colors.card);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Keyboard.dismiss();
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  return (
    <View style={styles.root}>
      <StatusBarBleed color={colors.card} />
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
          onPress={() => {
            Keyboard.dismiss();
            onBack();
          }}
          style={styles.headerSide}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <AppText
          variant="headlineMd"
          color={colors.ink}
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {t('searchDoctorsTitle')}
        </AppText>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[styles.searchWrap, listening && styles.searchWrapListening]}
        >
          <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={listening ? t('searchListening') : t('searchPlaceholder')}
            placeholderTextColor={
              listening ? colors.primary : colors.onSurfaceVariant
            }
            accessibilityLabel={t('searchPlaceholder')}
            autoFocus
            returnKeyType="search"
            blurOnSubmit
            onSubmitEditing={() => {
              Keyboard.dismiss();
              onSubmitSearch();
            }}
            style={[
              styles.searchInput,
              {
                fontFamily: fontFamilyFor('400', language, 'sans'),
                fontSize: scaleFont(15),
              },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('searchVoice')}
            accessibilityState={{ selected: listening }}
            hitSlop={8}
            onPress={() => {
              Keyboard.dismiss();
              onVoiceSearch();
            }}
            style={styles.micButton}
          >
            <Ionicons
              name={listening ? 'mic' : 'mic-outline'}
              size={22}
              color={listening ? colors.primary : colors.onSurface}
            />
          </Pressable>
        </View>
        {listening || voiceErrorKey ? (
          <AppText
            variant="labelSm"
            color={voiceErrorKey ? colors.error : colors.primary}
          >
            {voiceErrorKey ? t(voiceErrorKey) : t('searchListening')}
          </AppText>
        ) : null}

        {recents.length > 0 ? (
          <View style={styles.section}>
            <AppText
              variant="labelSm"
              color={colors.onSurfaceVariant}
              style={styles.recentHeading}
            >
              {t('searchRecentHeading')}
            </AppText>
            <View style={styles.recentList}>
              {recents.map((key) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => onSelectRecent(key)}
                  style={styles.recentRow}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.onSurfaceVariant}
                  />
                  <AppText
                    variant="bodyMd"
                    color={colors.onSurface}
                    style={styles.flex}
                    numberOfLines={1}
                  >
                    {t(key)}
                  </AppText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t('searchRemoveRecent')}: ${t(key)}`}
                    hitSlop={8}
                    onPress={() => onRemoveRecent(key)}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.availabilityCard}>
          <AppText variant="titleMd" color={colors.onSurface}>
            {t('searchTalkNow')}
          </AppText>
          <View style={styles.waitRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.onSurfaceVariant}
            />
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              {t('searchTypicalWait')}
            </AppText>
          </View>
          <AppButton
            label={t('searchSeeAvailability')}
            textVariant="titleMd"
            onPress={onSeeAvailability}
            style={styles.availabilityButton}
            icon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.onButton}
              />
            }
            iconPosition="end"
          />
        </View>

        <AppText variant="headlineMd" color={colors.onSurface}>
          {t('searchBrowseCareNeed')}
        </AppText>
        <View style={styles.careGrid}>
          {careNeeds.map((need) => (
            <CareNeedCard
              key={need.id}
              need={need}
              onPress={() => onSelectCareNeed(need)}
            />
          ))}
        </View>
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          style={styles.disclaimer}
        >
          {t('searchCareDisclaimer')}
        </AppText>

        <View style={styles.nearHeader}>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.flex}>
            {t('searchNearYou')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('searchLocation')}
            onPress={onOpenCityPicker}
            style={styles.cityChip}
          >
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <AppText variant="labelMd" color={colors.onSurface}>
              {selectedCityLabel || t('searchLocation')}
            </AppText>
            <Ionicons
              name="chevron-down"
              size={14}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        <View style={styles.doctorList}>
          {doctorsLoading ? (
            <View style={styles.doctorsLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                {t('loading')}
              </AppText>
            </View>
          ) : (
            doctors.map((doctor) => (
              <DoctorRow
                key={doctor.id}
                doctor={doctor}
                verifiedLabel={t('homeVerified')}
                openLabel={t('searchDoctorOpen')}
                onPress={() => onOpenDoctor(doctor.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <SafeAreaModal
        transparent
        animationType="fade"
        visible={cityPickerOpen}
        onRequestClose={onCloseCityPicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseCityPicker}>
          <Pressable
            style={[
              styles.modalCard,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
            onPress={() => undefined}
          >
            <AppText variant="titleMd" color={colors.primary}>
              {t('searchLocation')}
            </AppText>
            {cities.map((city) => {
              const selected = city.id === selectedCityId;
              return (
                <Pressable
                  key={city.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelectCity(city.id)}
                  style={[
                    styles.pickerOption,
                    selected && styles.pickerOptionSelected,
                  ]}
                >
                  <AppText
                    variant="bodyMd"
                    color={selected ? colors.primary : colors.onSurface}
                  >
                    {city.label || (city.nameKey ? t(city.nameKey) : city.id)}
                  </AppText>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function CareNeedCard({
  need,
  onPress,
}: {
  need: CareNeed;
  onPress: () => void;
}) {
  const letter = need.title.trim().charAt(0).toUpperCase() || '?';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.careCard, need.wide && styles.careCardWide]}
    >
      {need.image ? (
        <Image
          source={need.image}
          resizeMode="contain"
          style={styles.careImage}
        />
      ) : (
        <View style={styles.careLetter}>
          <AppText variant="labelMd" color={colors.primary} languageOverride="en">
            {letter}
          </AppText>
        </View>
      )}
      <AppText variant="titleMd" color={colors.onSurface} raw>
        {need.title}
      </AppText>
      {need.hint ? (
        <AppText variant="bodyMd" color={colors.onSurfaceVariant} raw>
          {need.hint}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function DoctorRow({
  doctor,
  verifiedLabel,
  openLabel,
  onPress,
}: {
  doctor: NearbyDoctor;
  verifiedLabel: string;
  openLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${openLabel}: ${doctor.name}`}
      onPress={onPress}
      style={styles.doctorCard}
    >
      <View style={styles.doctorAvatar}>
        <AppText
          variant="labelMd"
          color={colors.primary}
          languageOverride="en"
        >
          {doctor.initials}
        </AppText>
      </View>
      <View style={styles.flex}>
        <View style={styles.doctorNameRow}>
          <AppText
            variant="titleMd"
            color={colors.onSurface}
            numberOfLines={1}
            raw
          >
            {doctor.name}
          </AppText>
          {doctor.verified ? (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primary}
              accessibilityLabel={verifiedLabel}
            />
          ) : null}
        </View>
        {doctor.meta ? (
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} raw>
            {doctor.meta}
          </AppText>
        ) : null}
        {doctor.place ? (
          <AppText variant="labelSm" color={colors.onSurfaceVariant} raw>
            {doctor.place}
          </AppText>
        ) : null}
      </View>
      <View style={styles.doctorArrow}>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
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
  content: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
  },
  searchWrapListening: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: colors.onSurface,
  },
  micButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  recentHeading: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  recentList: {
    gap: spacing.sm,
  },
  recentRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
  },
  availabilityCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  availabilityButton: {
    minHeight: 48,
    width: '100%',
    borderRadius: radii.button,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  careCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  careImage: {
    width: 36,
    height: 36,
    tintColor: colors.primary,
  },
  careLetter: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careCardWide: {
    width: '100%',
    flexGrow: 1,
  },
  disclaimer: {
    fontStyle: 'italic',
  },
  nearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  doctorList: {
    gap: spacing.sm,
  },
  doctorsLoading: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  doctorArrow: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 28, 27, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pickerOption: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pickerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.languageSelectedFill,
  },
});
