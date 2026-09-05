import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  BackHandler,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { SearchDoctorsViewModel } from '../controllers/useSearchDoctorsController';
import type { CareNeed, NearbyDoctor } from '../models/search';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';

export function SearchDoctorsView({
  language,
  t,
  query,
  recents,
  careNeeds,
  doctors,
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
  onSelectLanguage,
  onVoiceSearch,
  onSeeAvailability,
  onOpenDoctor,
  onSubmitSearch,
  onBack,
}: SearchDoctorsViewModel) {
  const insets = useSafeAreaInsets();

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
          color="#000000"
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {t('searchDoctorsTitle')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('searchVoice')}
          accessibilityState={{ selected: listening }}
          hitSlop={8}
          onPress={() => {
            Keyboard.dismiss();
            onVoiceSearch();
          }}
          style={styles.headerSide}
        >
          <Ionicons
            name={listening ? 'mic' : 'mic-outline'}
            size={22}
            color={listening ? colors.primary : colors.onSurface}
          />
        </Pressable>
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
            accessibilityLabel={t('languageLabel')}
            onPress={() => onSelectLanguage(language === 'en' ? 'mr' : 'en')}
            style={styles.langChip}
          >
            <AppText
              variant="labelSm"
              color={colors.primary}
              languageOverride={language === 'en' ? 'mr' : 'en'}
            >
              {language === 'en' ? 'मराठी' : 'EN'}
            </AppText>
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
              title={t(need.titleKey)}
              hint={t(need.hintKey)}
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
              {selectedCityLabel}
            </AppText>
            <Ionicons
              name="chevron-down"
              size={14}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        <View style={styles.doctorList}>
          {doctors.map((doctor) => (
            <DoctorRow
              key={doctor.id}
              doctor={doctor}
              name={t(doctor.nameKey)}
              meta={t(doctor.metaKey)}
              place={t(doctor.placeKey)}
              verifiedLabel={t('homeVerified')}
              openLabel={t('searchDoctorOpen')}
              onPress={() => onOpenDoctor(doctor.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={cityPickerOpen}
        onRequestClose={onCloseCityPicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseCityPicker}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
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
                    {t(city.nameKey)}
                  </AppText>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function CareNeedCard({
  need,
  title,
  hint,
  onPress,
}: {
  need: CareNeed;
  title: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.careCard, need.wide && styles.careCardWide]}
    >
      <Image
        source={need.image}
        resizeMode="contain"
        style={styles.careImage}
      />
      <AppText variant="titleMd" color={colors.onSurface}>
        {title}
      </AppText>
      <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
        {hint}
      </AppText>
    </Pressable>
  );
}

function DoctorRow({
  doctor,
  name,
  meta,
  place,
  verifiedLabel,
  openLabel,
  onPress,
}: {
  doctor: NearbyDoctor;
  name: string;
  meta: string;
  place: string;
  verifiedLabel: string;
  openLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${openLabel}: ${name}`}
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
          <AppText variant="titleMd" color={colors.onSurface} numberOfLines={1}>
            {name}
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
        <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
          {meta}
        </AppText>
        <AppText variant="labelSm" color={colors.onSurfaceVariant}>
          {place}
        </AppText>
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
    backgroundColor: colors.surfaceContainerLowest,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
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
    backgroundColor: colors.surfaceContainerLowest,
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
  langChip: {
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
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
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
  },
  availabilityCard: {
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
    borderRadius: radii.sm,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  careCard: {
    width: '47%',
    flexGrow: 1,
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
  },
  doctorList: {
    gap: spacing.sm,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    backgroundColor: colors.surfaceContainerLowest,
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
