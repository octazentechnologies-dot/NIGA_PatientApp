import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type { ConsultNowViewModel } from '../controllers/useConsultNowController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { colors } from '../theme/colors';

const SUCCESS_BORDER = colors.successContainer;
const ICON_FILL = colors.iconFill;
const BUSY = colors.success;

export function ConsultNowUnavailableView(vm: ConsultNowViewModel) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onCancelSearch}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <AppText variant="headlineMd" color={colors.ink} style={styles.title}>
          {vm.t('brandName')}
        </AppText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 28 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.hero}>
          <Image
            source={images.doctorNotAvailable}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.busyBadge}>
            <AppText variant="labelSm" color={colors.card} style={styles.center}>
              {vm.t('noDoctorBusy')}
            </AppText>
          </View>
        </View>

        <AppText variant="headlineMd" color={colors.ink} style={styles.center}>
          {vm.t('noDoctorTitle')}
        </AppText>
        <AppText variant="bodyLg" color={colors.muted} style={styles.center}>
          {vm.t('noDoctorBodyLead')}
          <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
            {vm.noDoctorLanguageLabel}
          </AppText>
          {' + '}
          <AppText variant="bodyLg" color={colors.ink} weightOverride="600">
            {vm.noDoctorNeedLabel}
          </AppText>
          {vm.t('noDoctorBodyTail')}
        </AppText>

        <View style={styles.actions}>
          {vm.widenLanguage ? (
            <ActionCard
              icon="globe-outline"
              title={vm.widenTitle}
              subtitle={vm.t('noDoctorWidenHint')}
              onPress={vm.onWidenSearch}
            />
          ) : null}
          <ActionCard
            icon="calendar-outline"
            title={vm.t('noDoctorBookSlot')}
            subtitle={vm.earliestSlotLabel}
            onPress={vm.onBookEarliest}
          />
          <ActionCard
            icon="headset-outline"
            title={vm.t('noDoctorCallback')}
            subtitle={
              vm.callbackRequested
                ? vm.t('noDoctorCallbackDone')
                : vm.t('noDoctorCallbackHint')
            }
            onPress={vm.onRequestCallback}
          />
        </View>

        <View style={styles.notCharged}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <AppText variant="labelSm" color={colors.success}>
            {vm.t('noDoctorNotCharged')}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={22} color={ICON_FILL} />
      </View>
      <View style={styles.flex}>
        <AppText variant="titleMd" color={colors.ink} style={styles.cardTitle}>
          {title}
        </AppText>
        <AppText variant="labelSm" color={colors.muted}>
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  topBar: {
    backgroundColor: colors.card,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'left',
  },
  body: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  illustration: {
    width: 260,
    height: 220,
  },
  busyBadge: {
    marginTop: -20,
    backgroundColor: BUSY,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '92%',
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: spacing.sm,
  },
  card: {
    width: '100%',
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 2,
  },
  flex: {
    flex: 1,
  },
  notCharged: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successContainer,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
