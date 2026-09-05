import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import type { ProfileTab } from '../config/doctorProfiles';
import type { DoctorProfileViewModel } from '../controllers/useDoctorProfileController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { DoctorCredentialsTab } from './DoctorCredentialsTab';

const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const CHIP_FILL = '#E6F5FE';
const STAR = '#fca144';
const STAR_FILL = '#FCF3E4';
const ICON_BLUE = '#3AA9E0';

const TABS: { id: ProfileTab; labelKey: TranslationKey }[] = [
  { id: 'about', labelKey: 'profileTabAbout' },
  { id: 'credentials', labelKey: 'profileTabCredentials' },
  { id: 'reviews', labelKey: 'profileTabReviews' },
  { id: 'availability', labelKey: 'profileTabAvailability' },
];

export function DoctorProfileView({
  t,
  profile,
  tab,
  saved,
  aboutExpanded,
  onBack,
  onShare,
  onToggleSave,
  onSelectTab,
  onToggleAbout,
  onOpenDetails,
  onBook,
}: DoctorProfileViewModel) {
  const insets = useSafeAreaInsets();
  const footerReserve = 118 + Math.max(insets.bottom, spacing.md);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: Math.max(insets.top, spacing.sm) }}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('profileShare')}
              onPress={onShare}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Ionicons name="share-outline" size={22} color="#000000" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? t('profileSaved') : t('profileSave')}
              onPress={onToggleSave}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={saved ? colors.primary : '#000000'}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <AppText
                variant="headlineMd"
                color={ICON_BLUE}
                languageOverride="en"
                style={styles.avatarInitials}
              >
                {profile.initials}
              </AppText>
            </View>
            {profile.verified ? (
              <View style={styles.verifiedBadge}>
                <View style={styles.verifiedBadgeInner}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              </View>
            ) : null}
          </View>
          <AppText variant="headlineMd" color="#000000" style={styles.name}>
            {t(profile.nameKey)}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.credentials}>
            {t(profile.credentialsKey)}
          </AppText>
          <View style={styles.statRow}>
            <View style={[styles.statChip, styles.statChipBlue]}>
              <Ionicons name="briefcase-outline" size={14} color={ICON_BLUE} />
              <AppText variant="labelSm" color={MUTED} style={styles.statLabel}>
                {t(profile.experienceKey)}
              </AppText>
            </View>
            <View style={[styles.statChip, styles.statChipOrange]}>
              <Ionicons name="star" size={14} color={STAR} />
              <AppText variant="labelSm" color={MUTED} style={styles.statLabel}>
                {`${profile.rating} ${t(profile.reviewsKey)}`}
              </AppText>
            </View>
            <View style={[styles.statChip, styles.statChipBlue]}>
              <Ionicons name="people-outline" size={14} color={ICON_BLUE} />
              <AppText variant="labelSm" color={MUTED} style={styles.statLabel}>
                {t(profile.consultsKey)}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <ScrollView
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => onSelectTab(item.id)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <AppText
                  variant="labelSm"
                  color={active ? '#000000' : MUTED}
                  weightOverride={active ? '600' : '500'}
                  style={styles.tabLabel}
                >
                  {t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: footerReserve }]}
      >
        {tab === 'about' ? (
          <AboutTab
            t={t}
            profile={profile}
            aboutExpanded={aboutExpanded}
            onToggleAbout={onToggleAbout}
            onOpenDetails={onOpenDetails}
          />
        ) : null}
        {tab === 'credentials' ? (
          <DoctorCredentialsTab t={t} profile={profile} />
        ) : null}
        {tab === 'reviews' ? <ReviewsTab t={t} profile={profile} /> : null}
        {tab === 'availability' ? (
          <AvailabilityTab t={t} nextAvailable={t(profile.nextAvailableKey)} />
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <View style={styles.nextBanner}>
          <Ionicons name="calendar-outline" size={16} color={ICON_BLUE} />
          <AppText variant="labelSm" color="#000000" style={styles.bannerLabel}>
            {t(profile.nextAvailableKey)}
          </AppText>
        </View>
        <View style={styles.footerRow}>
          <View>
            <AppText variant="labelSm" color={MUTED} style={styles.feeCaption}>
              {t('profileConsultationFee')}
            </AppText>
            <AppText variant="titleMd" color="#000000" style={styles.feeValue}>
              {t(profile.feeKey)}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onBook}
            style={({ pressed }) => [
              styles.bookButton,
              pressed && styles.bookPressed,
            ]}
          >
            <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
              {t('profileBookConsultation')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AboutTab({
  t,
  profile,
  aboutExpanded,
  onToggleAbout,
  onOpenDetails,
}: {
  t: DoctorProfileViewModel['t'];
  profile: DoctorProfileViewModel['profile'];
  aboutExpanded: boolean;
  onToggleAbout: () => void;
  onOpenDetails: () => void;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.verifyCard}>
        <View style={styles.verifyHead}>
          <View style={styles.shield}>
            <Ionicons name="shield-checkmark" size={16} color={SUCCESS} />
          </View>
          <AppText variant="titleMd" color="#000000" style={styles.verifyTitle}>
            {t('profileVerifiedBy')}
          </AppText>
        </View>
        <View style={styles.verifyList}>
          <CheckLine text={t(profile.regVerifiedKey)} />
          <CheckLine text={t('profileQualVerified')} />
          <CheckLine text={t('profileLicensed')} />
        </View>
        <View style={styles.verifyFooter}>
          <AppText variant="labelSm" color={MUTED} style={styles.statLabel}>
            {t(profile.lastVerifiedKey)}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onOpenDetails} hitSlop={8}>
            <AppText
              variant="labelSm"
              color={ICON_BLUE}
              weightOverride="500"
              style={styles.link}
            >
              {t('profileViewDetails')}
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.bioBlock}>
        <AppText
          variant="bodyMd"
          color={MUTED}
          numberOfLines={aboutExpanded ? undefined : 4}
          style={styles.bio}
        >
          {t(profile.aboutKey)}
        </AppText>
        <Pressable accessibilityRole="button" onPress={onToggleAbout} hitSlop={8}>
          <AppText variant="labelSm" color={ICON_BLUE} weightOverride="500">
            {t(aboutExpanded ? 'profileReadLess' : 'profileReadMore')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.stackSm}>
        <AppText variant="headlineMd" color="#000000" style={styles.sectionTitle}>
          {t('profileCareFocus')}
        </AppText>
        <View style={styles.wrap}>
          {profile.careNeedKeys.map((key) => (
            <View key={key} style={styles.careChip}>
              <AppText variant="bodyMd" color="#000000" style={styles.careChipLabel}>
                {t(key)}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="labelSm" color={MUTED}>
          {t('profileCareFocusNote')}
        </AppText>
      </View>

      <View style={styles.consultBlock}>
        <AppText variant="headlineMd" color="#000000" style={styles.sectionTitle}>
          {t('profileConsultations')}
        </AppText>
        <View style={styles.consultCard}>
          <ConsultRow
            icon="videocam-outline"
            label={t('profileVideoConsult')}
            value={t(profile.feeKey)}
          />
          <ConsultRow
            icon="call-outline"
            label={t('profileAudioConsult')}
            value={t(profile.feeKey)}
          />
          <ConsultRow
            icon="chatbubble-outline"
            label={t('profileFollowUpChat')}
            hint={t('profileFollowUpChatHint')}
            badge={t('profileIncluded')}
          />
          <ConsultRow
            icon="medkit-outline"
            label={t('profileClinicVisit')}
            value={t(profile.clinicFeeKey)}
            last
          />
        </View>
      </View>
    </View>
  );
}

function ReviewsTab({
  t,
  profile,
}: {
  t: DoctorProfileViewModel['t'];
  profile: DoctorProfileViewModel['profile'];
}) {
  return (
    <View style={styles.stack}>
      <View style={[styles.statChip, styles.statChipOrange]}>
        <Ionicons name="star" size={16} color={STAR} />
        <AppText variant="titleMd" color="#000000">
          {`${profile.rating} ${t(profile.reviewsKey)}`}
        </AppText>
      </View>
      {profile.reviewIds.map((id) => (
        <View key={id} style={styles.reviewCard}>
          <AppText variant="titleMd" color="#000000">
            {t(id === 1 ? 'profileReview1Name' : 'profileReview2Name')}
          </AppText>
          <View style={styles.ratingDots}>
            {Array.from({ length: 5 }, (_, index) => (
              <Ionicons
                key={index}
                name="star"
                size={12}
                color={index < 4 ? STAR : HAIRLINE}
              />
            ))}
          </View>
          <AppText variant="bodyMd" color={MUTED}>
            {t(id === 1 ? 'profileReview1Body' : 'profileReview2Body')}
          </AppText>
          <AppText variant="labelSm" color={MUTED}>
            {t(id === 1 ? 'profileReview1Date' : 'profileReview2Date')}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function AvailabilityTab({
  t,
  nextAvailable,
}: {
  t: DoctorProfileViewModel['t'];
  nextAvailable: string;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.verifyCard}>
        <View style={styles.verifyHead}>
          <Ionicons name="calendar-outline" size={18} color={ICON_BLUE} />
          <AppText variant="titleMd" color="#000000" style={styles.flex}>
            {nextAvailable}
          </AppText>
        </View>
        <AppText variant="bodyMd" color={MUTED}>
          {t('profileNoSlots')}
        </AppText>
      </View>
    </View>
  );
}

function ConsultRow({
  icon,
  label,
  value,
  hint,
  badge,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  hint?: string;
  badge?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.consultRow, !last && styles.consultDivider]}>
      <View style={styles.consultLeft}>
        <View style={styles.consultIcon}>
          <Ionicons name={icon} size={18} color={ICON_BLUE} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyLg" color="#000000">
            {label}
          </AppText>
          {hint ? (
            <AppText variant="labelSm" color={MUTED}>
              {hint}
            </AppText>
          ) : null}
        </View>
      </View>
      {badge ? (
        <View style={styles.included}>
          <AppText variant="labelSm" color={MUTED}>
            {badge}
          </AppText>
        </View>
      ) : (
        <AppText variant="titleMd" color="#000000">
          {value}
        </AppText>
      )}
    </View>
  );
}

function CheckLine({ text }: { text: string }) {
  return (
    <View style={styles.checkLine}>
      <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
      <AppText variant="bodyMd" color="#000000" style={styles.checkText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  avatarWrap: {
    width: 88,
    height: 88,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  avatarInitials: {
    fontSize: scaleFont(22),
    lineHeight: scaleFont(28),
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeInner: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: scaleFont(24),
    lineHeight: scaleFont(32),
    paddingHorizontal: spacing.md,
  },
  credentials: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    paddingHorizontal: spacing.md,
    maxWidth: '92%',
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statChipBlue: {
    backgroundColor: CHIP_FILL,
  },
  statChipOrange: {
    backgroundColor: STAR_FILL,
  },
  statLabel: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
  },
  tabs: {
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  tabsRow: {
    paddingHorizontal: spacing.gutter,
    gap: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  stack: {
    gap: spacing.lg,
  },
  stackSm: {
    gap: 12,
  },
  verifyCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  verifyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifyTitle: {
    flex: 1,
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  shield: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: SUCCESS_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyList: {
    gap: 8,
  },
  verifyFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  link: {
    textDecorationLine: 'underline',
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
  },
  scroll: {
    flex: 1,
  },
  bioBlock: {
    gap: 8,
  },
  bio: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  careChip: {
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  careChipLabel: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  consultBlock: {
    gap: 12,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  consultCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  consultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  consultDivider: {
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  consultLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consultIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  included: {
    backgroundColor: '#F2F2F2',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ratingDots: {
    flexDirection: 'row',
    gap: 2,
  },
  checkLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkText: {
    flex: 1,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    backgroundColor: '#FFFFFF',
  },
  nextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CHIP_FILL,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: spacing.gutter,
  },
  bannerLabel: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    gap: spacing.md,
  },
  feeCaption: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
  },
  feeValue: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  bookButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookPressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
