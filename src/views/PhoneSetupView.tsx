import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { PhoneSetupViewModel } from '../controllers/usePhoneSetupController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const ACTION_OUTLINE = '#276F93';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const ICON_FILL = '#E6F5FE';
const NOT_SET_FILL = '#F0F1F3';
const NOT_SET = '#6B7280';

export function PhoneSetupView(vm: PhoneSetupViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={24} color={INK} />
          </Pressable>
          <AppText variant="headlineMd" color={INK} style={styles.flex} numberOfLines={2}>
            {vm.t('phoneSetupTitle')}
          </AppText>
          <View style={styles.iconButton} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        <AppText variant="bodyMd" color={MUTED}>
          {vm.t('phoneSetupBody')}
        </AppText>

        <PermissionCard
          icon="notifications-outline"
          iconFill={SUCCESS_FILL}
          iconColor={SUCCESS}
          title={vm.t('phoneSetupNotifications')}
          hint={vm.t('phoneSetupNotificationsHint')}
          granted={vm.notificationsGranted}
          notSetLabel={vm.t('phoneSetupNotSet')}
          allowLabel={vm.t('phoneSetupAllow')}
          allowedLabel={vm.t('phoneSetupAllowed')}
          onAllow={vm.onAllowNotifications}
        />
        <PermissionCard
          icon="mic-outline"
          iconFill={ICON_FILL}
          iconColor={colors.primary}
          title={vm.t('phoneSetupMic')}
          hint={vm.t('phoneSetupMicHint')}
          granted={vm.microphoneGranted}
          notSetLabel={vm.t('phoneSetupNotSet')}
          allowLabel={vm.t('phoneSetupAllow')}
          allowedLabel={vm.t('phoneSetupAllowed')}
          onAllow={vm.onAllowMicrophone}
        />
        <PermissionCard
          icon="videocam-outline"
          iconFill={ICON_FILL}
          iconColor={colors.primary}
          title={vm.t('phoneSetupCamera')}
          hint={vm.t('phoneSetupCameraHint')}
          granted={vm.cameraGranted}
          notSetLabel={vm.t('phoneSetupNotSet')}
          allowLabel={vm.t('phoneSetupAllow')}
          allowedLabel={vm.t('phoneSetupAllowed')}
          onAllow={vm.onAllowCamera}
        />
        {vm.showBattery ? (
          <PermissionCard
            icon="battery-charging-outline"
            iconFill={ICON_FILL}
            iconColor={colors.primary}
            title={vm.t('phoneSetupBattery')}
            hint={vm.t('phoneSetupBatteryHint')}
            note={vm.t('phoneSetupBatteryNote')}
            granted={vm.batteryGranted}
            notSetLabel={vm.t('phoneSetupNotSet')}
            allowLabel={vm.t('phoneSetupAllow')}
            allowedLabel={vm.t('phoneSetupAllowed')}
            onAllow={vm.onAllowBattery}
          />
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: sheetBottomPadding(insets, spacing.sm) }]}
      >
        <AppButton label={vm.t('phoneSetupContinue')} onPress={vm.onContinue} />
        <Pressable
          accessibilityRole="button"
          onPress={vm.onLater}
          style={styles.later}
        >
          <AppText variant="titleMd" color={ACTION_OUTLINE} weightOverride="600">
            {vm.t('phoneSetupLater')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function PermissionCard({
  icon,
  iconFill,
  iconColor,
  title,
  hint,
  note,
  granted,
  notSetLabel,
  allowLabel,
  allowedLabel,
  onAllow,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  iconFill: string;
  iconColor: string;
  title: string;
  hint: string;
  note?: string;
  granted: boolean;
  notSetLabel: string;
  allowLabel: string;
  allowedLabel: string;
  onAllow: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: iconFill }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.flex}>
          <AppText variant="labelSm" color={MUTED} weightOverride="600" style={styles.kicker}>
            {title}
          </AppText>
          <AppText variant="bodyMd" color={INK}>
            {hint}
          </AppText>
          {note ? (
            <AppText variant="bodyMd" color={MUTED} style={styles.note}>
              {note}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardBottom}>
        <View style={[styles.pill, granted ? styles.pillOn : styles.pillOff]}>
          <AppText
            variant="labelSm"
            color={granted ? SUCCESS : NOT_SET}
            weightOverride="600"
          >
            {granted ? allowedLabel : notSetLabel}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onAllow}
          disabled={granted}
          style={styles.allowHit}
        >
          <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
            {granted ? allowedLabel : allowLabel}
          </AppText>
        </Pressable>
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
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.default,
    borderWidth: 1,
    borderColor: HAIRLINE,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  note: {
    fontStyle: 'italic',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
  },
  cardBottom: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pill: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillOn: {
    backgroundColor: SUCCESS_FILL,
  },
  pillOff: {
    backgroundColor: NOT_SET_FILL,
  },
  allowHit: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  later: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
