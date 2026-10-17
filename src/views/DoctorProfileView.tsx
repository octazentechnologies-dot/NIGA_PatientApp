import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { ProfileTab } from '../config/doctorProfiles';
import type { DoctorProfileViewModel } from '../controllers/useDoctorProfileController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { DoctorCredentialsTab } from './DoctorCredentialsTab';

const STAR_FILL = colors.warningContainer;
const ICON_BLUE = colors.primary;

const TABS: { id: ProfileTab; labelKey: TranslationKey }[] = [
  { id: 'about', labelKey: 'profileTabAbout' },
  { id: 'credentials', labelKey: 'profileTabCredentials' },
  { id: 'reviews', labelKey: 'profileTabReviews' },
  { id: 'availability', labelKey: 'profileTabAvailability' },
];

export function DoctorProfileView({
  t,
  profile,
  reviews,
  tab,
  saved: _saved,
  aboutExpanded,
  onBack,
  onShare,
  onToggleSave: _onToggleSave,
  onSelectTab,
  onToggleAbout,
  onOpenDetails,
  onBook,
}: DoctorProfileViewModel) {
  const insets = useSafeAreaInsets();
  const footerReserve = 118 + sheetBottomPadding(insets, spacing.md);

  return (
    <View style={styles.root}>
      <View
        style={{
          paddingTop: Math.max(insets.top, spacing.sm),
          backgroundColor: colors.card,
        }}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('profileShare')}
              onPress={onShare}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Ionicons name="share-outline" size={22} color={colors.ink} />
            </Pressable>
            {/* BE-031 — bookmarks not planned */}
            <View style={styles.iconButton} />
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
                  <Ionicons name="checkmark" size={12} color={colors.card} />
                </View>
              </View>
            ) : null}
          </View>
          <AppText variant="headlineMd" color={colors.ink} style={styles.name} raw>
            {t(profile.nameKey)}
          </AppText>
          {profile.credentialsKey ? (
            <AppText variant="bodyMd" color={colors.muted} style={styles.credentials} raw>
              {t(profile.credentialsKey)}
            </AppText>
          ) : null}
          <View style={styles.statRow}>
            {profile.rating != null && profile.reviewCount > 0 ? (
              <View style={[styles.statChip, styles.statChipOrange]}>
                <Ionicons name="star" size={14} color={colors.tertiaryContainer} />
                <AppText variant="labelSm" color={colors.muted} style={styles.statLabel} raw>
                  {`${profile.rating} (${profile.reviewCount})`}
                </AppText>
              </View>
            ) : null}
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
                  color={active ? colors.ink : colors.muted}
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
        {tab === 'reviews' ? (
          <ReviewsTab t={t} profile={profile} reviews={reviews} />
        ) : null}
        {tab === 'availability' ? (
          <AvailabilityTab
            t={t}
            nextAvailable={
              profile.nextAvailableKey ? t(profile.nextAvailableKey) : ''
            }
          />
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        {profile.nextAvailableKey ? (
          <View style={styles.nextBanner}>
            <Ionicons name="calendar-outline" size={16} color={ICON_BLUE} />
            <AppText variant="labelSm" color={colors.ink} style={styles.bannerLabel}>
              {t(profile.nextAvailableKey)}
            </AppText>
          </View>
        ) : null}
        <View style={styles.footerRow}>
          <View>
            {profile.teleFeeLabel ? (
              <>
                <AppText variant="labelSm" color={colors.muted} style={styles.feeCaption} raw>
                  Tele
                </AppText>
                <AppText variant="titleMd" color={colors.ink} style={styles.feeValue} raw>
                  {profile.teleFeeLabel}
                </AppText>
              </>
            ) : null}
            {profile.clinicFeeLabel ? (
              <>
                <AppText variant="labelSm" color={colors.muted} style={styles.feeCaption} raw>
                  In-clinic
                </AppText>
                <AppText variant="bodyMd" color={colors.ink} raw>
                  {profile.clinicFeeLabel}
                </AppText>
              </>
            ) : null}
          </View>
          <AppButton
            label={t('profileBookConsultation')}
            onPress={onBook}
            style={styles.bookButton}
          />
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
      {profile.verified || profile.registrationNumber ? (
        <View style={styles.verifyCard}>
          <View style={styles.verifyHead}>
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            </View>
            <AppText variant="titleMd" color={colors.ink} style={styles.verifyTitle}>
              {t('profileVerifiedBy')}
            </AppText>
          </View>
          <View style={styles.verifyList}>
            {profile.registrationNumber ? (
              <CheckLine text={profile.registrationNumber} />
            ) : null}
            {profile.verified && profile.regVerifiedKey ? (
              <CheckLine text={t(profile.regVerifiedKey)} />
            ) : null}
          </View>
          <View style={styles.verifyFooter}>
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
      ) : null}

      {profile.aboutKey ? (
        <View style={styles.bioBlock}>
          <AppText
            variant="bodyMd"
            color={colors.muted}
            numberOfLines={aboutExpanded ? undefined : 4}
            style={styles.bio}
            raw
          >
            {t(profile.aboutKey)}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onToggleAbout} hitSlop={8}>
            <AppText variant="labelSm" color={ICON_BLUE} weightOverride="500">
              {t(aboutExpanded ? 'profileReadLess' : 'profileReadMore')}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {profile.careNeedKeys && profile.careNeedKeys.length > 0 ? (
        <View style={styles.stackSm}>
          <AppText variant="headlineMd" color={colors.ink} style={styles.sectionTitle}>
            {t('profileCareFocus')}
          </AppText>
          <View style={styles.wrap}>
            {profile.careNeedKeys.map((key) => (
              <View key={key} style={styles.careChip}>
                <AppText variant="bodyMd" color={colors.ink} style={styles.careChipLabel}>
                  {t(key)}
                </AppText>
              </View>
            ))}
          </View>
          <AppText variant="labelSm" color={colors.muted}>
            {t('profileCareFocusNote')}
          </AppText>
        </View>
      ) : null}

      {profile.teleFeeLabel || profile.clinicFeeLabel ? (
        <View style={styles.consultBlock}>
          <AppText variant="headlineMd" color={colors.ink} style={styles.sectionTitle}>
            {t('profileConsultations')}
          </AppText>
          <View style={styles.consultCard}>
            {profile.teleFeeLabel ? (
              <ConsultRow
                icon="videocam-outline"
                label={t('profileVideoConsult')}
                value={profile.teleFeeLabel}
              />
            ) : null}
            {profile.clinicFeeLabel ? (
              <ConsultRow
                icon="medkit-outline"
                label={t('profileClinicVisit')}
                value={profile.clinicFeeLabel}
                last
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ReviewsTab({
  t,
  profile,
  reviews,
}: {
  t: DoctorProfileViewModel['t'];
  profile: DoctorProfileViewModel['profile'];
  reviews: DoctorProfileViewModel['reviews'];
}) {
  return (
    <View style={styles.stack}>
      {profile.rating != null && profile.reviewCount > 0 ? (
        <View style={[styles.statChip, styles.statChipOrange]}>
          <Ionicons name="star" size={16} color={colors.tertiaryContainer} />
          <AppText variant="titleMd" color={colors.ink} raw>
            {`${profile.rating} (${profile.reviewCount})`}
          </AppText>
        </View>
      ) : null}
      {!reviews || reviews.length === 0 ? (
        <View style={styles.verifyCard}>
          <AppText
            variant="bodyMd"
            color={colors.muted}
            style={{ textAlign: 'center', paddingVertical: spacing.md }}
          >
            {t('profileNoReviews')}
          </AppText>
        </View>
      ) : (
        reviews.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <AppText variant="titleMd" color={colors.ink}>
              {rev.reviewerName}
            </AppText>
            <View style={styles.ratingDots}>
              {Array.from({ length: 5 }, (_, index) => (
                <Ionicons
                  key={index}
                  name="star"
                  size={12}
                  color={index < rev.rating ? colors.tertiaryContainer : colors.outlineVariant}
                />
              ))}
            </View>
            {rev.body ? (
              <AppText variant="bodyMd" color={colors.muted}>
                {rev.body}
              </AppText>
            ) : null}
            {rev.dateLabel ? (
              <AppText variant="labelSm" color={colors.muted}>
                {rev.dateLabel}
              </AppText>
            ) : null}
          </View>
        ))
      )}
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
        {nextAvailable ? (
          <View style={styles.verifyHead}>
            <Ionicons name="calendar-outline" size={18} color={ICON_BLUE} />
            <AppText variant="titleMd" color={colors.ink} style={styles.flex} raw>
              {nextAvailable}
            </AppText>
          </View>
        ) : null}
        <AppText variant="bodyMd" color={colors.muted}>
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
          <AppText variant="bodyLg" color={colors.ink}>
            {label}
          </AppText>
          {hint ? (
            <AppText variant="labelSm" color={colors.muted}>
              {hint}
            </AppText>
          ) : null}
        </View>
      </View>
      {badge ? (
        <View style={styles.included}>
          <AppText variant="labelSm" color={colors.muted}>
            {badge}
          </AppText>
        </View>
      ) : value ? (
        <AppText variant="titleMd" color={colors.ink} raw>
          {value}
        </AppText>
      ) : null}
    </View>
  );
}

function CheckLine({ text }: { text: string }) {
  return (
    <View style={styles.checkLine}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <AppText variant="bodyMd" color={colors.ink} style={styles.checkText} raw>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  topBar: {
    backgroundColor: colors.card,
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
    backgroundColor: colors.primaryContainer,
    borderWidth: 4,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
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
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeInner: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.success,
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
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statChipBlue: {
    backgroundColor: colors.primaryContainer,
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
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.card,
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
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 12,
    backgroundColor: colors.card,
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
    backgroundColor: colors.successContainer,
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
    borderTopColor: colors.outlineVariant,
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
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    borderTopColor: colors.outlineVariant,
  },
  consultCard: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
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
    borderBottomColor: colors.outlineVariant,
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
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  included: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.card,
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
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.card,
  },
  nextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryContainer,
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
  },
  flex: {
    flex: 1,
  },
});
