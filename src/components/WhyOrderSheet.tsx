import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaModal } from './SafeAreaModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TranslationKey } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { AppText } from './AppText';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const CHIP_FILL = '#E6F5FE';
const BANNER_BORDER = '#3AA9E0';
const BAR_FILL = '#3AA9E0';
const INFO_ICON = '#2E9AD1';
const ACTION = '#2A7BA3';
const HANDLE = '#D6D6D6';
const SPONSORED_BG = '#F9F9F9';

export type WhyOrderChip = {
  id: string;
  label: string;
  onRemove?: () => void;
};

export type WhyOrderWeight = {
  id: string;
  labelKey: TranslationKey;
  percent: number;
};

const WEIGHTS: WhyOrderWeight[] = [
  { id: 'care', labelKey: 'searchWhyOrderWeightCare', percent: 25 },
  { id: 'creds', labelKey: 'searchWhyOrderWeightCreds', percent: 15 },
  { id: 'availability', labelKey: 'searchWhyOrderWeightAvailability', percent: 15 },
  { id: 'distance', labelKey: 'searchWhyOrderWeightDistance', percent: 15 },
  { id: 'language', labelKey: 'searchWhyOrderWeightLanguage', percent: 10 },
  { id: 'experience', labelKey: 'searchWhyOrderWeightExperience', percent: 10 },
  { id: 'reliability', labelKey: 'searchWhyOrderWeightReliability', percent: 5 },
  { id: 'reviews', labelKey: 'searchWhyOrderWeightReviews', percent: 5 },
];

const DOCTOR_REASONS: TranslationKey[] = [
  'searchWhyOrderReasonSkin',
  'searchWhyOrderReasonMarathi',
  'searchWhyOrderReasonSlot',
  'searchWhyOrderReasonDistance',
];

type WhyOrderSheetProps = {
  visible: boolean;
  t: (key: TranslationKey) => string;
  chips: WhyOrderChip[];
  onClose: () => void;
  onReport?: () => void;
};

/**
 * Bottom sheet: “How we ordered these doctors” — ranking transparency.
 * Spec: stitch_hellohomeo_design_system (49).
 */
export function WhyOrderSheet({
  visible,
  t,
  chips,
  onClose,
  onReport,
}: WhyOrderSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaModal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: sheetBottomPadding(insets, spacing.sm) },
          ]}
          onPress={() => undefined}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <AppText variant="headlineMd" color={INK} style={styles.title}>
              {t('searchWhyOrderTitle')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={INK} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.body}
          >
            <View style={styles.banner}>
              <Ionicons
                name="information-circle"
                size={22}
                color={INFO_ICON}
                style={styles.bannerIcon}
              />
              <AppText variant="bodyMd" color={INK} style={styles.flex} weightOverride="500">
                {t('searchWhyOrderBanner')}
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText variant="labelSm" color={MUTED} weightOverride="600" style={styles.sectionLabel}>
                {t('searchWhyOrderYourSearch')}
              </AppText>
              <View style={styles.chipWrap}>
                {chips.map((chip) => (
                  <View key={chip.id} style={styles.chip}>
                    <AppText variant="bodyMd" color={INK}>
                      {chip.label}
                    </AppText>
                    {chip.onRemove ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('close')}
                        onPress={chip.onRemove}
                        hitSlop={8}
                        style={styles.chipRemove}
                      >
                        <Ionicons name="close" size={16} color={INK} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText variant="labelSm" color={MUTED} weightOverride="600" style={styles.sectionLabel}>
                {t('searchWhyOrderWhatWeWeigh')}
              </AppText>
              <View style={styles.weightList}>
                {WEIGHTS.map((item) => (
                  <View key={item.id} style={styles.weightRow}>
                    <View style={styles.weightHead}>
                      <AppText variant="bodyMd" color={INK} style={styles.flex} weightOverride="500">
                        {t(item.labelKey)}
                      </AppText>
                      <AppText variant="labelSm" color={INK} weightOverride="600">
                        {`${item.percent}%`}
                      </AppText>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[styles.barFill, { width: `${item.percent}%` }]}
                      />
                    </View>
                  </View>
                ))}
              </View>
              <AppText variant="labelSm" color={MUTED} style={styles.version}>
                {t('searchWhyOrderRankingVersion')}
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText variant="labelSm" color={MUTED} weightOverride="600" style={styles.sectionLabel}>
                {t('searchWhyOrderThisDoctor')}
              </AppText>
              <View style={styles.doctorCard}>
                <AppText variant="titleMd" color={INK} style={styles.doctorTitle}>
                  {t('searchWhyOrderDoctorReasonsTitle')}
                </AppText>
                {DOCTOR_REASONS.map((key) => (
                  <View key={key} style={styles.reasonRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={INFO_ICON}
                    />
                    <AppText variant="bodyMd" color={INK} style={styles.flex}>
                      {t(key)}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sponsoredCard}>
            <AppText variant="titleMd" color={INK} weightOverride="500" style={styles.sponsoredTitle}>
              {t('searchWhyOrderSponsoredTitle')}
            </AppText>
              <AppText variant="bodyMd" color={MUTED}>
                {t('searchWhyOrderSponsoredBody')}
              </AppText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={onReport}
              style={styles.reportHit}
            >
              <AppText variant="labelSm" color={ACTION} weightOverride="600">
                {t('searchWhyOrderReport')}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </SafeAreaModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderWidth: 1,
    borderColor: HAIRLINE,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: HANDLE,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: BANNER_BORDER,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  bannerIcon: {
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CHIP_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 36,
  },
  chipRemove: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightList: {
    gap: spacing.md,
  },
  weightRow: {
    gap: 6,
  },
  weightHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  barTrack: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: HAIRLINE,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: BAR_FILL,
    borderRadius: radii.full,
  },
  version: {
    marginTop: spacing.xs,
  },
  doctorCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.card,
  },
  doctorTitle: {
    marginBottom: spacing.xs,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sponsoredCard: {
    backgroundColor: SPONSORED_BG,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sponsoredTitle: {
    marginBottom: 2,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  reportHit: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});
