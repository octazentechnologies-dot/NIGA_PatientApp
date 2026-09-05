import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountView } from './AccountView';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { PatientTabBar } from '../components/PatientTabBar';
import { CARE_CATEGORIES } from '../config/careCategories';
import { getHomeHealthTips } from '../config/healthTips';
import { images } from '../config/images';
import type { HomeViewModel } from '../controllers/useHomeController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

const QUICK_ACTIONS: {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  labelKey: TranslationKey;
  badgeKey?: TranslationKey;
}[] = [
  { icon: 'stethoscope', labelKey: 'homeBookConsultation' },
  {
    icon: 'lightning-bolt',
    labelKey: 'homeInstantAdvice',
    badgeKey: 'homeInstantBadge',
  },
  { icon: 'file-document-outline', labelKey: 'homeMyPrescriptions' },
  { icon: 'bottle-tonic-plus-outline', labelKey: 'homeOrderMedicines' },
];

export function HomeView({
  language,
  t,
  greeting,
  selectedTab,
  selectedMemberLabel,
  memberPickerOpen,
  memberOptions,
  selectedMemberId,
  onSelectTab,
  onOpenSearch,
  onOpenMemberPicker,
  onCloseMemberPicker,
  onSelectMember,
  onSelectLanguage,
  onOpenNotifications,
  onJoinConsultation,
  onOpenHealthTip,
  appointments,
  account,
}: HomeViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {selectedTab === 'home' ? (
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerCopy}>
                <AppText
                  variant="titleMd"
                  color="#000000"
                  style={styles.greeting}
                >
                  {greeting}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={onOpenMemberPicker}
                  style={styles.forWhomChip}
                >
                  <AppText variant="labelSm" color={colors.onSurface}>
                    {`${t('homeForPrefix')}: ${selectedMemberLabel}`}
                  </AppText>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={colors.onSurface}
                  />
                </Pressable>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('languageLabel')}
                  onPress={() =>
                    onSelectLanguage(language === 'en' ? 'mr' : 'en')
                  }
                  style={styles.languageButton}
                >
                  <AppText
                    variant="labelMd"
                    color={colors.onSurface}
                    languageOverride={language === 'en' ? 'en' : 'mr'}
                  >
                    {language === 'en' ? 'EN' : 'मराठी'}
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('homeNotifications')}
                  onPress={onOpenNotifications}
                  style={styles.bellButton}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={colors.onSurface}
                  />
                  <View style={styles.bellDot} />
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('homeSearchPlaceholder')}
              onPress={onOpenSearch}
              style={styles.searchWrap}
            >
              <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
              <AppText
                variant="bodyMd"
                color={colors.onSurfaceVariant}
                style={styles.searchPlaceholder}
                numberOfLines={1}
              >
                {t('homeSearchPlaceholder')}
              </AppText>
            </Pressable>
          </View>

          <View style={styles.body}>
            <View style={styles.consultCard}>
              <View style={styles.doctorRow}>
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <AppText
                      variant="titleMd"
                      color={colors.onSurface}
                      style={styles.doctorName}
                    >
                      {t('homeDoctorName')}
                    </AppText>
                    <View
                      accessibilityLabel={t('homeVerified')}
                      style={styles.verifiedBadge}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color="#000000"
                      />
                    </View>
                  </View>
                  <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                    {t('homeDoctorQualification')}
                  </AppText>
                </View>
                <Image
                  source={images.doctorPortrait}
                  resizeMode="cover"
                  style={styles.doctorPhoto}
                />
              </View>

              <View style={styles.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.onSurfaceVariant}
                />
                <AppText variant="bodyMd" color={colors.onSurface}>
                  {t('homeConsultDate')}
                </AppText>
              </View>
              <View style={styles.metaRow}>
                <Ionicons
                  name="videocam-outline"
                  size={16}
                  color={colors.onSurfaceVariant}
                />
                <AppText variant="bodyMd" color={colors.onSurface}>
                  {t('homeConsultMode')}
                </AppText>
              </View>

              <View style={styles.startsBanner}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.onSurfaceVariant}
                />
                <AppText variant="bodyMd" color={colors.onSurface}>
                  {t('homeStartsIn')}
                </AppText>
              </View>

              <AppButton
                label={t('homeJoinConsultation')}
                textVariant="titleMd"
                onPress={onJoinConsultation}
                style={styles.joinButton}
              />
            </View>

            <AppText variant="headlineMd" color={colors.onSurface}>
              {t('homeQuickActions')}
            </AppText>
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.labelKey}
                  accessibilityRole="button"
                  style={styles.quickCard}
                >
                  {action.badgeKey ? (
                    <View style={styles.quickBadge}>
                      <AppText
                        variant="labelSm"
                        color={colors.onPrimary}
                        style={styles.badgeText}
                      >
                        {t(action.badgeKey)}
                      </AppText>
                    </View>
                  ) : null}
                  <View style={styles.quickIconWrap}>
                    <MaterialCommunityIcons
                      name={action.icon}
                      size={26}
                      color={colors.primary}
                    />
                  </View>
                  <AppText
                    variant="bodyMd"
                    color={colors.onSurface}
                    style={styles.centerText}
                  >
                    {t(action.labelKey)}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <AppText variant="headlineMd" color={colors.onSurface}>
              {t('homeCareCategories')}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {CARE_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  style={styles.categoryItem}
                >
                  <View style={styles.categoryIcon}>
                    <Image
                      source={category.image}
                      resizeMode="contain"
                      style={styles.categoryImage}
                    />
                  </View>
                  <AppText
                    variant="labelSm"
                    color={colors.onSurface}
                    style={styles.centerText}
                    numberOfLines={2}
                  >
                    {t(category.homeLabelKey)}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>

            <AppText variant="headlineMd" color={colors.onSurface}>
              {t('homeHealthTips')}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipRow}
            >
              {getHomeHealthTips().map((tip) => (
                <Pressable
                  key={tip.id}
                  accessibilityRole="button"
                  onPress={() => onOpenHealthTip(tip.id)}
                  style={styles.tipCard}
                >
                  <Image
                    source={tip.hero}
                    resizeMode="contain"
                    style={styles.tipImage}
                  />
                  <View style={styles.tipChip}>
                    <AppText variant="labelSm" color={colors.primary} weightOverride="600">
                      {t(tip.categoryKey)}
                    </AppText>
                  </View>
                  <AppText
                    variant="titleMd"
                    color={colors.onSurface}
                    numberOfLines={3}
                    style={styles.tipTitle}
                  >
                    {t(tip.titleKey)}
                  </AppText>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant} numberOfLines={2}>
                    {t('tipReviewedBy').replace('{name}', t(tip.reviewerKey))}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      ) : selectedTab === 'doctors' ? (
        <View
          style={[
            styles.doctorsTab,
            { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
          ]}
        >
          <View style={styles.header}>
            <AppText variant="titleMd" color="#000000" style={styles.greeting}>
              {t('homeTabDoctors')}
            </AppText>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              {t('doctorsTabSubtitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('homeSearchPlaceholder')}
              onPress={onOpenSearch}
              style={styles.searchWrap}
            >
              <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
              <AppText
                variant="bodyMd"
                color={colors.onSurfaceVariant}
                style={styles.searchPlaceholder}
                numberOfLines={1}
              >
                {t('homeSearchPlaceholder')}
              </AppText>
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookingsList}
          >
            <AppText variant="headlineMd" color="#000000">
              {t('doctorsBookings')}
            </AppText>
            {appointments.length === 0 ? (
              <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                {t('doctorsNoBookings')}
              </AppText>
            ) : (
              appointments.map((item) => (
                <View key={item.id} style={styles.bookingCard}>
                  <View style={styles.bookingHead}>
                    <View style={styles.bookingAvatar}>
                      <AppText variant="titleMd" color={colors.primary} languageOverride="en">
                        {item.doctorInitials}
                      </AppText>
                    </View>
                    <View style={styles.flex}>
                      <AppText variant="titleMd" color="#000000">
                        {t(item.doctorNameKey)}
                      </AppText>
                      <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
                        {`${t('payStatusHomeopath')} · ${t(item.experienceKey)}`}
                      </AppText>
                      <View style={styles.waitingBadge}>
                        <AppText variant="labelSm" color="#8A5109" weightOverride="600">
                          {t('doctorsWaitingAcceptance')}
                        </AppText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                      {item.whenLabel}
                    </AppText>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="videocam-outline" size={16} color={colors.primary} />
                    <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                      {item.modeConsultLabel}
                    </AppText>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="person-outline" size={16} color={colors.primary} />
                    <AppText variant="bodyMd" color="#000000" style={styles.flex}>
                      {item.patientLabel}
                    </AppText>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      ) : selectedTab === 'account' ? (
        <AccountView {...account} />
      ) : (
        <View
          style={[
            styles.placeholder,
            { paddingTop: Math.max(insets.top, spacing.lg) },
          ]}
        >
          <Ionicons
            name="construct-outline"
            size={40}
            color={colors.onSurfaceVariant}
          />
          <AppText variant="titleMd" color={colors.onSurface}>
            {t(
              selectedTab === 'records'
                ? 'homeTabRecords'
                : selectedTab === 'medicines'
                  ? 'homeTabMedicines'
                  : 'homeTabAccount',
            )}
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
            {t('homeComingSoon')}
          </AppText>
        </View>
      )}

      <PatientTabBar
        selectedTab={selectedTab}
        t={t}
        onSelectTab={onSelectTab}
      />

      <Modal
        transparent
        animationType="fade"
        visible={memberPickerOpen}
        onRequestClose={onCloseMemberPicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseMemberPicker}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <AppText variant="titleMd" color={colors.primary}>
              {t('homeForWhom')}
            </AppText>
            {memberOptions.map((option) => {
              const label = option.nameKey
                ? t(option.nameKey)
                : (option.name ?? '');
              const selected = option.id === selectedMemberId;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelectMember(option.id)}
                  style={[
                    styles.pickerOption,
                    selected && styles.pickerOptionSelected,
                  ]}
                >
                  <AppText
                    variant="bodyMd"
                    color={selected ? colors.primary : colors.onSurface}
                    languageOverride={option.name ? 'en' : undefined}
                  >
                    {label}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
  },
  forWhomChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageButton: {
    minHeight: 36,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.error,
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
  searchPlaceholder: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  consultCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  doctorName: {
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorPhoto: {
    width: 56,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  startsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  joinButton: {
    minHeight: 48,
    width: '100%',
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    flexGrow: 1,
    minHeight: 112,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    overflow: 'hidden',
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.onSurface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  centerText: {
    textAlign: 'center',
  },
  categoryRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  categoryItem: {
    width: 88,
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 36,
    height: 36,
    tintColor: colors.primary,
  },
  tipRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  tipCard: {
    width: 260,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
  },
  tipImage: {
    width: '100%',
    height: 132,
    borderRadius: radii.sm,
    backgroundColor: colors.buttonFill,
  },
  tipChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.buttonFill,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tipTitle: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  doctorsTab: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  bookingsList: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  bookingCard: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  bookingHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bookingAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCF3E4',
    borderWidth: 1,
    borderColor: '#F2C14E',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
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
