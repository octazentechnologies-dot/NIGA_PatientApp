import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import type { DoctorProfileSeed } from '../config/doctorProfiles';
import type { TranslationKey } from '../localization/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const SUCCESS_BORDER = '#CEEBDD';
const AMBER = '#8A5109';
const AMBER_FILL = '#FDF3DC';
const AMBER_BORDER = '#F2C14E';
const GREY_FILL = '#F2F2F2';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const CHIP_FILL = '#E6F5FE';
const ICON_BLUE = '#3AA9E0';

type Translate = (key: TranslationKey) => string;

export function DoctorCredentialsTab({
  t,
  profile,
}: {
  t: Translate;
  profile: DoctorProfileSeed;
}) {
  const { credentialsDetail } = profile;

  return (
    <View style={styles.root}>
      <View style={styles.identity}>
        <View style={styles.identityAvatar}>
          <AppText
            variant="titleMd"
            color={ICON_BLUE}
            languageOverride="en"
            style={styles.identityInitials}
          >
            {profile.initials}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="titleMd" color="#000000" style={styles.identityName}>
            {t(profile.nameKey)}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.bodySm}>
            {t('credAndVerification')}
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Ionicons name="school-outline" size={28} color="#000000" />
          <AppText variant="titleMd" color="#000000" style={styles.sectionTitle}>
            {t('credRecognisedTitle')}
          </AppText>
        </View>
        <View style={[styles.banner, styles.bannerGreen]}>
          <Ionicons name="information-circle-outline" size={22} color={SUCCESS} />
          <AppText variant="bodyMd" color={SUCCESS} style={styles.bannerText}>
            {t('credRecognisedNote')}
          </AppText>
        </View>
        {credentialsDetail.qualifications.map((item) => (
          <View key={item.titleKey} style={styles.card}>
            <AppText variant="bodyLg" color="#000000" weightOverride="600">
              {t(item.titleKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.cardDetail}>
              {t(item.detailKey)}
            </AppText>
            <VerifiedPill icon="checkmark-circle" label={t(item.badgeKey)} />
          </View>
        ))}
        <View style={styles.card}>
          <AppText variant="bodyLg" color="#000000" weightOverride="600">
            {t(credentialsDetail.registration.titleKey)}
          </AppText>
          <View style={styles.regLines}>
            <AppText variant="bodyMd" color={MUTED}>
              {t(credentialsDetail.registration.councilKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {t(credentialsDetail.registration.statusKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {t(credentialsDetail.registration.validKey)}
            </AppText>
          </View>
          <VerifiedPill icon="shield-checkmark" label={t('credLicensedBadge')} />
        </View>
      </View>

      {credentialsDetail.focus ? (
        <View style={styles.section}>
          <View style={styles.hairline} />
          <View style={styles.sectionHead}>
            <Ionicons name="ribbon-outline" size={28} color={AMBER} />
            <AppText variant="titleMd" color={AMBER} style={styles.sectionTitle}>
              {t('credFocusTitle')}
            </AppText>
          </View>
          <View style={[styles.banner, styles.bannerAmber]}>
            <Ionicons name="warning" size={22} color={AMBER} />
            <AppText variant="bodyMd" color="#000000" style={styles.bannerText}>
              {t('credFocusWarning')}
            </AppText>
          </View>
          <View style={styles.card}>
            <View style={styles.focusTitleRow}>
              <AppText
                variant="bodyLg"
                color="#000000"
                weightOverride="600"
                style={styles.flex}
              >
                {t(credentialsDetail.focus.titleKey)}
              </AppText>
              <View style={styles.activeTag}>
                <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
                  {t('credActive')}
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMd" color={MUTED} style={styles.bodySm}>
              {t(credentialsDetail.focus.idKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.bodySm}>
              {t(credentialsDetail.focus.validKey)}
            </AppText>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.outlineButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="qr-code-outline" size={18} color={ICON_BLUE} />
              <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
                {t('credVerifyCertificate')}
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}

      {credentialsDetail.careLink ? (
        <View style={styles.section}>
          <View style={styles.hairline} />
          <View style={styles.sectionHead}>
            <Ionicons name="git-network-outline" size={28} color={MUTED} />
            <AppText variant="titleMd" color="#000000" style={styles.sectionTitle}>
              {t('credCareLinkTitle')}
            </AppText>
          </View>
          <View style={[styles.banner, styles.bannerGrey]}>
            <Ionicons name="information-circle-outline" size={22} color={MUTED} />
            <AppText variant="bodyMd" color={MUTED} style={styles.bannerText}>
              {t('credCareLinkNote')}
            </AppText>
          </View>
          <View style={styles.card}>
            <AppText variant="bodyLg" color="#000000" weightOverride="600">
              {t(credentialsDetail.careLink.titleKey)}
            </AppText>
            <AppText variant="bodyMd" color={MUTED} style={styles.quote}>
              {t(credentialsDetail.careLink.quoteKey)}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.reportCard}>
        <AppText variant="titleMd" color="#000000" style={styles.reportTitle}>
          {t('credSomethingWrong')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.reportBody}>
          {t('credReportsGoTo')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        >
          <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
            {t('credReportError')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.legal}>
        <AppText variant="bodyMd" color={MUTED} style={styles.legalLink}>
          {t('credReportProfileLink')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.legalLink}>
          {t('credPrivacyLink')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED} style={styles.copyright}>
          {t('credNetworkCopyright')}
        </AppText>
      </View>
    </View>
  );
}

function VerifiedPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={16} color={SUCCESS} />
      <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 32,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    backgroundColor: '#FFFFFF',
  },
  identityAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInitials: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(20),
  },
  identityName: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  section: {
    gap: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  bannerGreen: {
    backgroundColor: SUCCESS_FILL,
    borderColor: SUCCESS_BORDER,
  },
  bannerAmber: {
    backgroundColor: AMBER_FILL,
    borderColor: AMBER_BORDER,
  },
  bannerGrey: {
    backgroundColor: GREY_FILL,
    borderColor: GREY_FILL,
  },
  bannerText: {
    flex: 1,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 8,
  },
  cardDetail: {
    marginTop: 4,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  regLines: {
    gap: 8,
    marginTop: 4,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  focusTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  activeTag: {
    backgroundColor: SUCCESS_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  outlineButton: {
    minHeight: 48,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.85,
    backgroundColor: CHIP_FILL,
  },
  quote: {
    fontStyle: 'italic',
    marginTop: 4,
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  hairline: {
    height: 1,
    backgroundColor: HAIRLINE,
    marginBottom: 8,
  },
  reportCard: {
    marginTop: 8,
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    gap: spacing.md,
  },
  reportTitle: {
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
  },
  reportBody: {
    textAlign: 'center',
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  legal: {
    alignItems: 'center',
    gap: 12,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  legalLink: {
    textAlign: 'center',
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  copyright: {
    textAlign: 'center',
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  bodySm: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
  },
  flex: {
    flex: 1,
  },
});
