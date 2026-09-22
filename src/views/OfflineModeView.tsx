import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  OfflineAvailableId,
  OfflineModeViewModel,
} from '../controllers/useOfflineModeController';
import type { TranslationKey } from '../localization/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ACTION_OUTLINE = '#276F93';

const AVAILABLE: {
  id: OfflineAvailableId;
  labelKey: TranslationKey;
}[] = [
  { id: 'prescriptions', labelKey: 'offlineAvailablePrescriptions' },
  { id: 'appointments', labelKey: 'offlineAvailableAppointments' },
  { id: 'emergency', labelKey: 'offlineAvailableEmergency' },
];

const UNAVAILABLE: TranslationKey[] = [
  'offlineUnavailableSearch',
  'offlineUnavailableBook',
  'offlineUnavailableJoin',
];

export function OfflineModeView(vm: OfflineModeViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, spacing.md),
          paddingBottom: sheetBottomPadding(insets, spacing.md),
        },
      ]}
      accessibilityViewIsModal
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        <View style={styles.hero}>
          <View style={styles.wifiCircle}>
            <Ionicons name="wifi" size={36} color={INK} />
            <View style={styles.slash} />
          </View>
          <AppText variant="headlineLg" color={INK} style={styles.center}>
            {vm.t('offlineTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.t('offlineSubtitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={styles.center}>
            {vm.t('offlineSubtitleMr')}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Ionicons name="checkmark-circle" size={18} color={ACTION} />
            <AppText
              variant="labelSm"
              color={ACTION}
              weightOverride="600"
              style={styles.sectionLabel}
            >
              {vm.t('offlineAvailableHeader')}
            </AppText>
          </View>
          {AVAILABLE.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => vm.onOpenAvailable(item.id)}
              style={[
                styles.row,
                index < AVAILABLE.length - 1 && styles.rowBorder,
              ]}
            >
              <Ionicons name="checkmark" size={18} color={ACTION} />
              <AppText variant="bodyMd" color={INK} style={styles.flex}>
                {vm.t(item.labelKey)}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={MUTED} />
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Ionicons name="cloud-offline-outline" size={18} color={MUTED} />
            <AppText
              variant="labelSm"
              color={MUTED}
              weightOverride="600"
              style={styles.sectionLabel}
            >
              {vm.t('offlineUnavailableHeader')}
            </AppText>
          </View>
          {UNAVAILABLE.map((key, index) => (
            <View
              key={key}
              style={[
                styles.row,
                index < UNAVAILABLE.length - 1 && styles.rowBorder,
              ]}
            >
              <Ionicons name="close-circle" size={18} color={MUTED} />
              <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
                {vm.t(key)}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={vm.t('offlineTryAgain')}
          onPress={vm.onTryAgain}
          disabled={vm.checking}
          icon={
            vm.checking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
            )
          }
        />
        <Pressable
          accessibilityRole="button"
          onPress={vm.onCallHelpline}
          style={styles.outlineBtn}
        >
          <Ionicons name="call-outline" size={18} color={ACTION_OUTLINE} />
          <AppText variant="labelMd" color={ACTION_OUTLINE} weightOverride="600">
            {vm.t('offlineCallHelpline')}
          </AppText>
        </Pressable>
        <AppText variant="labelSm" color={MUTED} style={styles.center}>
          {vm.t('offlineCallNote')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: PAGE,
    zIndex: 9999,
    elevation: 9999,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  wifiCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  slash: {
    position: 'absolute',
    width: 2,
    height: 52,
    backgroundColor: INK,
    transform: [{ rotate: '40deg' }],
    borderRadius: 1,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  footer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  outlineBtn: {
    minHeight: 48,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: ACTION,
    backgroundColor: CARD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
