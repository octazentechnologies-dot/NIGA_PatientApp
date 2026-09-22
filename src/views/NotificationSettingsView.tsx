import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import type {
  NotifChannel,
  NotifPrefRowId,
  NotifReminderId,
  NotificationSettingsViewModel,
} from '../controllers/useNotificationSettingsController';
import type { TranslationKey } from '../localization/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const ASTRO = '#6B3FA0';
const ASTRO_FILL = '#F3EEFA';
const NEUTRAL_FILL = '#F2F2F2';

const CHANNELS: { id: NotifChannel; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'push', icon: 'phone-portrait-outline' },
  { id: 'sms', icon: 'chatbubble-ellipses-outline' },
  { id: 'inApp', icon: 'notifications-outline' },
  { id: 'email', icon: 'mail-outline' },
];

const CLINICAL_ROWS: { id: NotifPrefRowId; labelKey: TranslationKey }[] = [
  { id: 'appointmentReminders', labelKey: 'notifSettingsApptReminders' },
  { id: 'joinAlerts', labelKey: 'notifSettingsJoinAlerts' },
  { id: 'prescriptionFollowUp', labelKey: 'notifSettingsRxFollowUp' },
];

const REMINDERS: { id: NotifReminderId; labelKey: TranslationKey }[] = [
  { id: '24h', labelKey: 'notifSettingsRem24h' },
  { id: '2h', labelKey: 'notifSettingsRem2h' },
  { id: '30m', labelKey: 'notifSettingsRem30m' },
  { id: '10m', labelKey: 'notifSettingsRem10m' },
];

export function NotificationSettingsView(vm: NotificationSettingsViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconHit}
          >
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.headerTitle}>
            {vm.t('brandName')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('notifTitle')}
            onPress={vm.onOpenNotifications}
            style={styles.iconHit}
          >
            <Ionicons name="notifications-outline" size={22} color={INK} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <AppText variant="headlineLg" color={INK}>
          {vm.t('notifSettingsTitle')}
        </AppText>
        <AppText variant="bodyMd" color={MUTED}>
          {vm.t('notifSettingsSubtitle')}
        </AppText>

        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed-outline" size={20} color={ACTION} />
          <View style={styles.flex}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t('notifSettingsPrivacyTitle')}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('notifSettingsPrivacyBody')}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.tableHead}>
            <AppText
              variant="labelSm"
              color={MUTED}
              weightOverride="600"
              style={[styles.flex, styles.uppercase]}
            >
              {vm.t('notifSettingsCategory')}
            </AppText>
            {CHANNELS.map((channel) => (
              <View key={channel.id} style={styles.channelHead}>
                <Ionicons name={channel.icon} size={16} color={MUTED} />
              </View>
            ))}
          </View>

          <View style={styles.catPill}>
            <AppText variant="labelSm" color={MUTED} weightOverride="600">
              {vm.t('notifSettingsClinical')}
            </AppText>
          </View>
          {CLINICAL_ROWS.map((row) => (
            <PrefRow
              key={row.id}
              label={vm.t(row.labelKey)}
              values={vm.prefs[row.id]}
              onToggle={(channel) => vm.onTogglePref(row.id, channel)}
            />
          ))}

          <View style={[styles.catPill, styles.catWellness]}>
            <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
              {vm.t('notifSettingsWellness')}
            </AppText>
          </View>
          <PrefRow
            label={vm.t('notifSettingsSelfCare')}
            helper={vm.t('notifSettingsSelfCareNote')}
            nonClinical
            values={vm.prefs.selfCare}
            onToggle={(channel) => vm.onTogglePref('selfCare', channel)}
            nonClinicalLabel={vm.t('accountNonClinical')}
          />

          <View style={styles.catPill}>
            <AppText variant="labelSm" color={MUTED} weightOverride="600">
              {vm.t('notifSettingsMarketing')}
            </AppText>
          </View>
          <PrefRow
            label={vm.t('notifSettingsTipsOffers')}
            values={vm.prefs.marketing}
            onToggle={(channel) => vm.onTogglePref('marketing', channel)}
          />
        </View>

        <View style={styles.card}>
          <AppText variant="headlineMd" color={INK}>
            {vm.t('notifSettingsRemindersTitle')}
          </AppText>
          <View style={styles.reminderWrap}>
            {REMINDERS.map((item) => {
              const on = vm.reminders[item.id];
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => vm.onToggleReminder(item.id)}
                  style={[styles.reminderChip, on && styles.reminderChipOn]}
                >
                  {on ? (
                    <Ionicons name="checkmark" size={14} color={SUCCESS} />
                  ) : null}
                  <AppText
                    variant="labelMd"
                    color={on ? SUCCESS : MUTED}
                    weightOverride="600"
                  >
                    {vm.t(item.labelKey)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.quietRow}>
            <Ionicons name="remove-circle-outline" size={22} color={MUTED} />
            <View style={styles.flex}>
              <AppText variant="labelMd" color={INK} weightOverride="600">
                {vm.t('notifSettingsQuietTitle')}
              </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {vm.quietHoursLabel}
              </AppText>
            </View>
            <AppSwitch
              value={vm.quietHoursOn}
              onValueChange={vm.onToggleQuietHours}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PrefRow({
  label,
  helper,
  nonClinical,
  nonClinicalLabel,
  values,
  onToggle,
}: {
  label: string;
  helper?: string;
  nonClinical?: boolean;
  nonClinicalLabel?: string;
  values: Record<NotifChannel, boolean>;
  onToggle: (channel: NotifChannel) => void;
}) {
  return (
    <View style={styles.prefRow}>
      <View style={styles.prefLabel}>
        <View style={styles.prefTitleRow}>
          {nonClinical ? <View style={styles.astroDot} /> : null}
          <AppText variant="bodyMd" color={INK} style={styles.flex}>
            {label}
          </AppText>
        </View>
        {nonClinical && nonClinicalLabel ? (
          <View style={styles.nonClinicalPill}>
            <AppText variant="labelSm" color={ASTRO} weightOverride="600">
              {nonClinicalLabel}
            </AppText>
          </View>
        ) : null}
        {helper ? (
          <AppText variant="labelSm" color={MUTED} raw>
            {helper}
          </AppText>
        ) : null}
      </View>
      {CHANNELS.map((channel) => (
        <Pressable
          key={channel.id}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: values[channel.id] }}
          onPress={() => onToggle(channel.id)}
          style={styles.checkHit}
        >
          <View
            style={[
              styles.check,
              values[channel.id] && styles.checkOn,
            ]}
          >
            {values[channel.id] ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE,
  },
  header: {
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  iconHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  channelHead: {
    width: 40,
    alignItems: 'center',
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: NEUTRAL_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  catWellness: {
    backgroundColor: SUCCESS_FILL,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 0,
    paddingVertical: spacing.xs,
  },
  prefLabel: {
    flex: 1,
    gap: 4,
    paddingRight: spacing.xs,
  },
  prefTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  astroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SUCCESS,
  },
  nonClinicalPill: {
    alignSelf: 'flex-start',
    backgroundColor: ASTRO_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  checkHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: ACTION,
    borderColor: ACTION,
  },
  reminderWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reminderChip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
    backgroundColor: CARD,
  },
  reminderChipOn: {
    backgroundColor: SUCCESS_FILL,
    borderColor: SUCCESS,
  },
  quietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
