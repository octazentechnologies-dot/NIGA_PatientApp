import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import type { DoctorProfileSeed } from '../config/doctorProfiles';
import type { TranslationKey } from '../localization/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';
import { colors } from '../theme/colors';

const SUCCESS_BORDER = colors.successContainer;
const AMBER = colors.warning;
const AMBER_FILL = colors.tertiaryFixed;
const AMBER_BORDER = colors.tertiaryContainer;
const GREY_FILL = colors.surfaceVariant;
const ICON_BLUE = colors.primary;

type Translate = (key: TranslationKey) => string;

export function DoctorCredentialsTab({
  t,
  profile,
}: {
  t: Translate;
  profile: DoctorProfileSeed;
}) {
  const { credentialsDetail } = profile;
  const hasQualifications = credentialsDetail.qualifications.length > 0;
  const registration = credentialsDetail.registration;
  const hasRegistration = Boolean(registration?.titleKey);

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
          <AppText variant="titleMd" color={colors.ink} style={styles.identityName} raw>
            {t(profile.nameKey)}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted} style={styles.bodySm}>
            {t('credAndVerification')}
          </AppText>
        </View>
      </View>

      {hasQualifications ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="school-outline" size={28} color={colors.ink} />
            <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
              {t('credRecognisedTitle')}
            </AppText>
          </View>
          <View style={[styles.banner, styles.bannerGreen]}>
            <Ionicons name="information-circle-outline" size={22} color={colors.success} />
            <AppText variant="bodyMd" color={colors.success} style={styles.bannerText}>
              {t('credRecognisedNote')}
            </AppText>
          </View>
          {credentialsDetail.qualifications.map((item) => (
            <View key={String(item.titleKey)} style={styles.card}>
              {item.titleKey ? (
                <AppText variant="bodyLg" color={colors.ink} weightOverride="600" raw>
                  {t(item.titleKey)}
                </AppText>
              ) : null}
              {item.detailKey ? (
                <AppText variant="bodyMd" color={colors.muted} style={styles.cardDetail} raw>
                  {t(item.detailKey)}
                </AppText>
              ) : null}
              {item.badgeKey ? (
                <VerifiedPill icon="checkmark-circle" label={t(item.badgeKey)} />
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {hasRegistration && registration ? (
        <View style={styles.section}>
          <View style={styles.card}>
            <AppText variant="bodyLg" color={colors.ink} weightOverride="600" raw>
              {t(registration.titleKey)}
            </AppText>
            {registration.councilKey ? (
              <View style={styles.regLines}>
                <AppText variant="bodyMd" color={colors.muted} raw>
                  {t(registration.councilKey)}
                </AppText>
                {registration.statusKey ? (
                  <AppText variant="bodyMd" color={colors.muted} raw>
                    {t(registration.statusKey)}
                  </AppText>
                ) : null}
                {registration.validKey ? (
                  <AppText variant="bodyMd" color={colors.muted} raw>
                    {t(registration.validKey)}
                  </AppText>
                ) : null}
              </View>
            ) : null}
            <VerifiedPill icon="shield-checkmark" label={t('credLicensedBadge')} />
          </View>
        </View>
      ) : null}

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
            <AppText variant="bodyMd" color={colors.ink} style={styles.bannerText}>
              {t('credFocusWarning')}
            </AppText>
          </View>
          <View style={styles.card}>
            <View style={styles.focusTitleRow}>
              <AppText
                variant="bodyLg"
                color={colors.ink}
                weightOverride="600"
                style={styles.flex}
              >
                {t(credentialsDetail.focus.titleKey)}
              </AppText>
              <View style={styles.activeTag}>
                <AppText variant="labelSm" color={colors.success} weightOverride="600">
                  {t('credActive')}
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMd" color={colors.muted} style={styles.bodySm}>
              {t(credentialsDetail.focus.idKey)}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted} style={styles.bodySm}>
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
            <Ionicons name="git-network-outline" size={28} color={colors.muted} />
            <AppText variant="titleMd" color={colors.ink} style={styles.sectionTitle}>
              {t('credCareLinkTitle')}
            </AppText>
          </View>
          <View style={[styles.banner, styles.bannerGrey]}>
            <Ionicons name="information-circle-outline" size={22} color={colors.muted} />
            <AppText variant="bodyMd" color={colors.muted} style={styles.bannerText}>
              {t('credCareLinkNote')}
            </AppText>
          </View>
          <View style={styles.card}>
            <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
              {t(credentialsDetail.careLink.titleKey)}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted} style={styles.quote}>
              {t(credentialsDetail.careLink.quoteKey)}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.reportCard}>
        <AppText variant="titleMd" color={colors.ink} style={styles.reportTitle}>
          {t('credSomethingWrong')}
        </AppText>
        <AppText variant="bodyMd" color={colors.muted} style={styles.reportBody}>
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
      <Ionicons name={icon} size={14} color={colors.success} />
      <AppText variant="labelSm" color={colors.success} weightOverride="600">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identityAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInitials: {
    fontSize: scaleFont(18),
  },
  identityName: {
    marginBottom: 2,
  },
  flex: {
    flex: 1,
  },
  bodySm: {
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  bannerGreen: {
    backgroundColor: colors.successContainer,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
  },
  bannerAmber: {
    backgroundColor: AMBER_FILL,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
  },
  bannerGrey: {
    backgroundColor: GREY_FILL,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  bannerText: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardDetail: {
    marginTop: 2,
  },
  regLines: {
    gap: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.successContainer,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  focusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.successContainer,
  },
  outlineButton: {
    marginTop: spacing.xs,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: ICON_BLUE,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  quote: {
    marginTop: 4,
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reportTitle: {
    marginBottom: 2,
  },
  reportBody: {
    marginBottom: spacing.xs,
  },
});
