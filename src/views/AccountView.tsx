import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type { AccountViewModel } from '../controllers/useAccountController';
import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';

const SUCCESS_FILL = '#E8F5E9';
const SUCCESS_TEXT = '#1B5E20';
const WARNING_FILL = '#ffdcc0';
const WARNING_TEXT = '#8d4f00';
const ASTRO_FILL = '#f3eefa';
const ASTRO_TEXT = '#6b3fa0';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'muted';

type RowConfig = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: TranslationKey;
  badgeKey?: TranslationKey;
  badgeTone?: BadgeTone;
  value?: string;
  chevron?: boolean;
};

const MY_CARE_ROWS: RowConfig[] = [
  {
    id: 'family',
    icon: 'people-outline',
    labelKey: 'accountFamilyMembers',
    badgeKey: 'accountFamilyMembersBadge',
  },
  { id: 'appointments', icon: 'calendar-outline', labelKey: 'accountAppointments' },
  { id: 'prescriptions', icon: 'medkit-outline', labelKey: 'accountPrescriptions' },
  { id: 'records', icon: 'folder-outline', labelKey: 'accountHealthRecords' },
  { id: 'insights', icon: 'stats-chart-outline', labelKey: 'accountHealthInsights' },
  { id: 'pain', icon: 'body-outline', labelKey: 'accountPainPoints' },
  {
    id: 'reminders',
    icon: 'notifications-outline',
    labelKey: 'accountReminders',
    badgeKey: 'accountRemindersBadge',
    badgeTone: 'success',
  },
  {
    id: 'carelink',
    icon: 'link-outline',
    labelKey: 'accountCareLink',
    badgeKey: 'accountCareLinkBadge',
    badgeTone: 'success',
  },
];

const PAYMENT_ROWS: RowConfig[] = [
  {
    id: 'methods',
    icon: 'card-outline',
    labelKey: 'accountPaymentMethods',
    badgeKey: 'accountPaymentMethodsBadge',
  },
  {
    id: 'receipts',
    icon: 'receipt-outline',
    labelKey: 'accountPaymentsReceipts',
  },
  {
    id: 'membership',
    icon: 'id-card-outline',
    labelKey: 'accountMembership',
    badgeKey: 'accountComingSoon',
    badgeTone: 'muted',
  },
];

const PRIVACY_ROWS: RowConfig[] = [
  {
    id: 'consent',
    icon: 'shield-checkmark-outline',
    labelKey: 'accountConsentCentre',
    badgeKey: 'accountConsentBadge',
  },
  {
    id: 'data-requests',
    icon: 'document-text-outline',
    labelKey: 'accountDataRequests',
  },
  {
    id: 'login',
    icon: 'laptop-outline',
    labelKey: 'accountLoginActivity',
    badgeKey: 'accountLoginActivityBadge',
  },
  { id: 'download', icon: 'download-outline', labelKey: 'accountDownloadData' },
];

const HELP_ROWS: RowConfig[] = [
  { id: 'help', icon: 'help-circle-outline', labelKey: 'accountHelpCentre' },
  {
    id: 'tickets',
    icon: 'ticket-outline',
    labelKey: 'accountSupportTickets',
    badgeKey: 'accountSupportTicketsBadge',
    badgeTone: 'warning',
  },
  { id: 'about', icon: 'information-circle-outline', labelKey: 'accountAbout' },
  { id: 'terms', icon: 'document-outline', labelKey: 'accountTerms' },
];

export function AccountView({
  language,
  t,
  profileName,
  profileInitials,
  profilePhone,
  astroEnabled,
  lowDataMode,
  languagePickerOpen,
  languageValue,
  appVersionLabel,
  onEditProfile,
  onOpenRow,
  onToggleAstro,
  onToggleLowData,
  onOpenLanguagePicker,
  onCloseLanguagePicker,
  onSelectLanguage,
  onLogOut,
  onDeleteAccount,
}: AccountViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
      ]}
    >
      <View style={styles.profileRow}>
        <View>
          <View style={styles.avatar}>
            <AppText variant="titleMd" color={colors.primary} languageOverride="en">
              {profileInitials}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('accountEditProfile')}
            onPress={onEditProfile}
            style={styles.avatarEdit}
          >
            <Ionicons name="pencil" size={12} color={colors.onPrimary} />
          </Pressable>
        </View>
        <View style={styles.profileCopy}>
          <AppText
            variant="titleMd"
            color={colors.onSurface}
            languageOverride="en"
          >
            {profileName}
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} languageOverride="en">
            {profilePhone}
          </AppText>
        </View>
        <AppButton
          variant="secondary"
          label={t('accountEditProfile')}
          textVariant="labelSm"
          onPress={onEditProfile}
          style={styles.editButton}
        />
      </View>

      <Section title={t('accountSectionMyCare')}>
        {MY_CARE_ROWS.map((row) => (
          <AccountRow
            key={row.id}
            icon={row.icon}
            label={t(row.labelKey)}
            badge={row.badgeKey ? t(row.badgeKey) : undefined}
            badgeTone={row.badgeTone}
            onPress={() => onOpenRow(row.id)}
          />
        ))}
      </Section>

      <Section
        title={t('accountSectionWellness')}
        headerRight={
          <View style={styles.nonClinicalBadge}>
            <AppText variant="labelSm" color={ASTRO_TEXT} style={styles.badgeText}>
              {t('accountNonClinical')}
            </AppText>
          </View>
        }
      >
        <AccountRow
          icon="planet-outline"
          label={t('accountAstroWellness')}
          helper={t('accountAstroHelper')}
          chevron={false}
          trailing={
            <Switch
              value={astroEnabled}
              onValueChange={onToggleAstro}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor={colors.surfaceContainerLowest}
              ios_backgroundColor={colors.outlineVariant}
            />
          }
        />
        <AccountRow
          icon="gift-outline"
          label={t('accountBirthDetails')}
          onPress={() => onOpenRow('birth')}
        />
      </Section>

      <Section title={t('accountSectionPreferences')}>
        <AccountRow
          icon="globe-outline"
          label={t('languageLabel')}
          value={languageValue}
          onPress={onOpenLanguagePicker}
        />
        <AccountRow
          icon="notifications-outline"
          label={t('homeNotifications')}
          onPress={() => onOpenRow('notifications')}
        />
        <AccountRow
          icon="accessibility-outline"
          label={t('accountAccessibility')}
          value={t('accountAccessibilityValue')}
          onPress={() => onOpenRow('accessibility')}
        />
        <AccountRow
          icon="cloud-offline-outline"
          label={t('accountLowDataMode')}
          helper={t('accountLowDataHelper')}
          chevron={false}
          trailing={
            <Switch
              value={lowDataMode}
              onValueChange={onToggleLowData}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor={colors.surfaceContainerLowest}
              ios_backgroundColor={colors.outlineVariant}
            />
          }
        />
      </Section>

      <Section title={t('accountSectionPayments')}>
        {PAYMENT_ROWS.map((row) => (
          <AccountRow
            key={row.id}
            icon={row.icon}
            label={t(row.labelKey)}
            badge={row.badgeKey ? t(row.badgeKey) : undefined}
            badgeTone={row.badgeTone}
            onPress={() => onOpenRow(row.id)}
          />
        ))}
      </Section>

      <Section title={t('accountSectionPrivacy')}>
        {PRIVACY_ROWS.map((row) => (
          <AccountRow
            key={row.id}
            icon={row.icon}
            label={t(row.labelKey)}
            badge={row.badgeKey ? t(row.badgeKey) : undefined}
            badgeTone={row.badgeTone}
            onPress={() => onOpenRow(row.id)}
          />
        ))}
      </Section>

      <Section title={t('accountSectionHelp')}>
        {HELP_ROWS.map((row) => (
          <AccountRow
            key={row.id}
            icon={row.icon}
            label={t(row.labelKey)}
            badge={row.badgeKey ? t(row.badgeKey) : undefined}
            badgeTone={row.badgeTone}
            onPress={() => onOpenRow(row.id)}
          />
        ))}
        <AccountRow
          icon="shield-outline"
          label={t('accountPrivacyNotice')}
          value={t('accountPrivacyNoticeVersion')}
          onPress={() => onOpenRow('privacy')}
        />
      </Section>

      <Pressable accessibilityRole="button" onPress={onLogOut} style={styles.footerAction}>
        <AppText variant="titleMd" color={colors.primary}>
          {t('accountLogOut')}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onDeleteAccount}
        style={styles.footerAction}
      >
        <AppText variant="titleMd" color={colors.error}>
          {t('accountDeleteAccount')}
        </AppText>
      </Pressable>
      <AppText
        variant="labelSm"
        color={colors.onSurfaceVariant}
        style={styles.deleteNote}
      >
        {t('accountDeleteAccountNote')}
      </AppText>

      <AppText variant="labelSm" color={colors.onSurfaceVariant} style={styles.version}>
        {appVersionLabel}
      </AppText>
      <Image
        source={images.favicon}
        style={styles.footerMark}
        resizeMode="contain"
        accessibilityLabel={t('brandName')}
      />

      <Modal
        transparent
        animationType="fade"
        visible={languagePickerOpen}
        onRequestClose={onCloseLanguagePicker}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseLanguagePicker}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <AppText variant="titleMd" color={colors.primary}>
              {t('languageLabel')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: language === 'en' }}
              onPress={() => onSelectLanguage('en')}
              style={[
                styles.pickerOption,
                language === 'en' && styles.pickerOptionSelected,
              ]}
            >
              <AppText
                variant="bodyMd"
                color={language === 'en' ? colors.primary : colors.onSurface}
                languageOverride="en"
              >
                {t('english')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: language === 'mr' }}
              onPress={() => onSelectLanguage('mr')}
              style={[
                styles.pickerOption,
                language === 'mr' && styles.pickerOptionSelected,
              ]}
            >
              <AppText
                variant="bodyMd"
                color={language === 'mr' ? colors.primary : colors.onSurface}
                languageOverride="mr"
              >
                {t('marathi')}
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Section({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.sectionTitle}>
          {title}
        </AppText>
        {headerRight}
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function AccountRow({
  icon,
  label,
  value,
  badge,
  badgeTone = 'neutral',
  helper,
  chevron = true,
  trailing,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  helper?: string;
  chevron?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.rowInner}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={styles.rowCopy}>
        <View style={styles.rowTop}>
          <AppText variant="bodyMd" color={colors.onSurface} style={styles.flex}>
            {label}
          </AppText>
          {badge ? <Badge label={badge} tone={badgeTone} /> : null}
          {value ? (
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              {value}
            </AppText>
          ) : null}
          {trailing}
          {chevron ? (
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          ) : null}
        </View>
        {helper ? (
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {helper}
          </AppText>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {content}
    </Pressable>
  );
}

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const fill =
    tone === 'success'
      ? SUCCESS_FILL
      : tone === 'warning'
        ? WARNING_FILL
        : colors.surfaceContainerLow;
  const text =
    tone === 'success'
      ? SUCCESS_TEXT
      : tone === 'warning'
        ? WARNING_TEXT
        : colors.onSurfaceVariant;

  return (
    <View style={[styles.badge, { backgroundColor: fill }]}>
      <AppText variant="labelSm" color={text} style={styles.badgeText}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.buttonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  editButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
  },
  nonClinicalBadge: {
    backgroundColor: ASTRO_FILL,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  footerAction: {
    minHeight: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteNote: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footerMark: {
    width: 28,
    height: 28,
    alignSelf: 'center',
    tintColor: '#000000',
    opacity: 0.7,
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
