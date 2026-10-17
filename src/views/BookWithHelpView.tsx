import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaModal } from '../components/SafeAreaModal';
import { colors } from '../theme/colors';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  BookWithHelpViewModel,
  CallBackTimeId,
} from '../controllers/useBookWithHelpController';
import type { TranslationKey } from '../localization/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';

const CHIP_BORDER = colors.secondary;
const OUTLINE = colors.outline;
const WHATSAPP = colors.success;

const CALL_TIMES: { id: CallBackTimeId; labelKey: TranslationKey }[] = [
  { id: 'now', labelKey: 'bookHelpTimeNow' },
  { id: 'hour', labelKey: 'bookHelpTimeHour' },
  { id: 'morning', labelKey: 'bookHelpTimeMorning' },
  { id: 'evening', labelKey: 'bookHelpTimeEvening' },
];

export function BookWithHelpView(vm: BookWithHelpViewModel) {
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
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={colors.ink}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {vm.t('bookHelpTitle')}
          </AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="headset" size={26} color={colors.ink} />
            <View style={styles.cyanFill} />
          </View>
          <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
            {vm.t('bookHelpIntro')}
          </AppText>
        </View>

        {vm.supportUnavailable ? (
          <AppText variant="bodyMd" color={colors.muted} style={styles.flex} raw>
            Support contact not available yet
          </AppText>
        ) : null}

        {vm.showCallHelpline ? (
          <Pressable
            accessibilityRole="button"
            onPress={vm.onCallHelpline}
            style={styles.channelCard}
          >
            <View style={styles.channelIcon}>
              <Ionicons name="call" size={22} color={colors.ink} />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {vm.t('bookHelpCallTitle')}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t('bookHelpCallMeta')}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ) : null}

        {vm.showWhatsApp ? (
          <Pressable
            accessibilityRole="button"
            onPress={vm.onWhatsApp}
            style={styles.channelCard}
          >
            <View style={[styles.channelIcon, styles.whatsappIcon]}>
              <Ionicons name="logo-whatsapp" size={22} color={WHATSAPP} />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {vm.t('bookHelpWhatsAppTitle')}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t('bookHelpWhatsAppMeta')}
              </AppText>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.muted} />
          </Pressable>
        ) : null}

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.callbackIcon}>
              <Ionicons name="call" size={22} color={colors.card} />
            </View>
            <View style={styles.flex}>
              <AppText variant="labelMd" color={colors.ink} weightOverride="600">
                {vm.t('bookHelpCallbackTitle')}
              </AppText>
              <AppText variant="labelSm" color={colors.muted}>
                {vm.t('bookHelpCallbackMeta')}
              </AppText>
            </View>
          </View>

          <View style={styles.formBody}>
            <Field label={vm.t('bookHelpPatientName')}>
              <TextInput
                value={vm.patientName}
                editable={false}
                style={styles.input}
                placeholderTextColor={colors.muted}
              />
            </Field>
            <Field label={vm.t('bookHelpMobile')}>
              <TextInput
                value={vm.mobileNumber}
                editable={false}
                style={styles.input}
                placeholderTextColor={colors.muted}
              />
            </Field>

            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('bookHelpBestTime')}
            </AppText>
            <View style={styles.chipRow}>
              {CALL_TIMES.map((item) => {
                const on = item.id === vm.callTime;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => vm.onSelectCallTime(item.id)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    {on ? (
                      <Ionicons name="checkmark" size={14} color={colors.ink} />
                    ) : null}
                    <AppText
                      variant="labelMd"
                      color={on ? colors.ink : colors.muted}
                      weightOverride="600"
                    >
                      {vm.t(item.labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('bookHelpNeedLabel')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={vm.onOpenHelpNeedPicker}
              style={styles.selectField}
            >
              <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
                {vm.helpNeedLabel}
              </AppText>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </Pressable>

            {vm.submitted ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <AppText variant="bodyMd" color={colors.success} style={styles.flex}>
                  {vm.t('bookHelpSubmitted')}
                </AppText>
              </View>
            ) : (
              <AppButton
                label={vm.t('bookHelpRequestCta')}
                onPress={vm.onRequestCallBack}
              />
            )}
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.muted} />
          <AppText variant="labelSm" color={colors.muted} style={styles.center}>
            {vm.t('bookHelpDisclaimer')}
          </AppText>
          <AppText variant="labelSm" color={colors.muted} style={styles.center}>
            {vm.t('bookHelpDisclaimerMr')}
          </AppText>
        </View>
      </ScrollView>

      <SafeAreaModal
        visible={vm.helpNeedPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={vm.onCloseHelpNeedPicker}
      >
        <Pressable style={styles.backdrop} onPress={vm.onCloseHelpNeedPicker}>
          <View
            style={[
              styles.sheet,
              { paddingBottom: sheetBottomPadding(insets, spacing.lg) },
            ]}
          >
            <AppText variant="headlineMd" color={colors.ink}>
              {vm.t('bookHelpNeedLabel')}
            </AppText>
            {vm.helpNeedOptions.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                onPress={() => vm.onSelectHelpNeed(option.id)}
                style={styles.sheetRow}
              >
                <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
                  {vm.t(option.labelKey)}
                </AppText>
                {option.id === vm.helpNeed ? (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </SafeAreaModal>
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="labelSm" color={colors.muted}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
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
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cyanFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.iconFill,
    opacity: 0.35,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 88,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappIcon: {
    backgroundColor: colors.successContainer,
  },
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  callbackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  field: { gap: 4 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: radii.default,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
  },
  chipOn: {
    backgroundColor: colors.primaryContainer,
    borderColor: CHIP_BORDER,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: radii.default,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successContainer,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  disclaimer: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  center: { textAlign: 'center' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,31,31,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  flex: { flex: 1 },
});
