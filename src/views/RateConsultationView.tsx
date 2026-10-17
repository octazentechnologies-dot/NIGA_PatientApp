import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { colors } from '../theme/colors';

import { AppButton } from '../components/AppButton';
import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type { RateConsultationViewModel } from '../controllers/useRateConsultationController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const CHIP_BORDER = colors.secondary;
export function RateConsultationView(vm: RateConsultationViewModel) {
  const insets = useSafeAreaInsets();

  if (vm.submitted) {
    return <ReviewSubmittedView vm={vm} insetsTop={insets.top} insetsBottom={insets.bottom} />;
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('back')}
            onPress={vm.onClose}
            style={styles.iconHit}
          >
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={colors.ink}
            style={styles.headerTitle}
            numberOfLines={2}
          >
            {vm.t('rateTitle')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 110 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <Image source={images.doctorPortrait} style={styles.avatar} />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <AppText variant="labelMd" color={colors.ink} weightOverride="600" style={styles.flex}>
                  {vm.doctorName}
                </AppText>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              </View>
              <AppText variant="bodyMd" color={colors.muted} style={styles.mtXs}>
                {vm.consultMeta}
              </AppText>
            </View>
          </View>
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
            <AppText variant="labelSm" color={colors.success} weightOverride="600">
              {vm.t('rateVerifiedConsultation')}
            </AppText>
          </View>
        </View>

        <View style={styles.overallBlock}>
          <StarRow
            value={vm.overallRating}
            size={40}
            onSelect={vm.onSelectOverall}
          />
          {vm.overallLabel ? (
            <AppText variant="headlineMd" color={colors.ink} style={styles.center}>
              {vm.overallLabel}
            </AppText>
          ) : null}
        </View>

        <View style={styles.hairline} />

        <View style={styles.card}>
          {vm.aspects.map((aspect, index) => (
            <View key={aspect.id}>
              {index > 0 ? <View style={styles.aspectDivider} /> : null}
              <View style={styles.aspectRow}>
                <AppText variant="bodyMd" color={colors.ink} style={styles.flex}>
                  {vm.t(aspect.labelKey)}
                </AppText>
                <StarRow
                  value={vm.aspectRatings[aspect.id]}
                  size={26}
                  onSelect={(value) => vm.onSelectAspect(aspect.id, value)}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tagWrap}>
          {vm.tags.map((tag) => {
            const selected = vm.selectedTags.includes(tag.id);
            return (
              <Pressable
                key={tag.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => vm.onToggleTag(tag.id)}
                style={[styles.tag, selected && styles.tagOn]}
              >
                <AppText
                  variant="bodyMd"
                  color={selected ? colors.ink : colors.muted}
                  weightOverride={selected ? '600' : undefined}
                >
                  {vm.t(tag.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.reviewBox}>
          <TextInput
            value={vm.reviewText}
            onChangeText={vm.onChangeReviewText}
            placeholder={vm.t('rateReviewPlaceholder')}
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            style={styles.reviewInput}
            maxLength={vm.reviewMax}
          />
        </View>
        <View style={styles.reviewMeta}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={vm.t('rateVoiceInput')}
            onPress={vm.onVoiceInput}
            style={styles.micHit}
          >
            <Ionicons name="mic-outline" size={22} color={colors.primary} />
          </Pressable>
          <AppText variant="labelSm" color={colors.muted}>
            {`${vm.reviewText.length} / ${vm.reviewMax}`}
          </AppText>
        </View>

        <View style={styles.guidance}>
          <Ionicons name="information-circle" size={18} color={colors.iconFill} />
          <AppText variant="bodyMd" color={colors.muted} style={styles.flex}>
            {vm.t('rateGuidance')}
          </AppText>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.flex}>
            <AppText variant="labelMd" color={colors.ink} weightOverride="600">
              {vm.postAsName}
            </AppText>
            <AppText variant="bodyMd" color={colors.muted}>
              {vm.t('ratePrivacyNote')}
            </AppText>
          </View>
          <AppSwitch
            value={vm.postPublicly}
            onValueChange={vm.onTogglePostPublicly}
          />
        </View>

        <View style={styles.complaintBlock}>
          <AppText variant="labelMd" color={colors.ink} weightOverride="600">
            {vm.t('rateComplaintTitle')}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            {vm.t('rateComplaintBody')}
          </AppText>
          <AppButton
            label={vm.t('rateRaiseComplaint')}
            variant="secondary"
            onPress={vm.onRaiseComplaint}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        {vm.submitError ? (
          <AppText variant="bodyMd" color={colors.error} raw>
            {vm.submitError}
          </AppText>
        ) : null}
        <AppButton
          label={vm.t('rateSubmit')}
          onPress={vm.onSubmit}
          disabled={!vm.canSubmit}
        />
      </View>
    </View>
  );
}

function ReviewSubmittedView({
  vm,
  insetsTop,
  insetsBottom,
}: {
  vm: RateConsultationViewModel;
  insetsTop: number;
  insetsBottom: number;
}) {
  return (
    <View style={[styles.root, styles.submittedRoot]}>
      <View style={[styles.submittedHeader, { paddingTop: Math.max(insetsTop, spacing.sm) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.t('back')}
          onPress={vm.onClose}
          style={styles.iconHit}
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.submittedBody}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <AppText variant="headlineLg" color={colors.ink} style={styles.center}>
          {vm.t('rateThankYou')}
        </AppText>
        <AppText variant="bodyLg" color={colors.muted} style={styles.center}>
          {vm.t('rateThankYouBody')}
        </AppText>
        <AppButton
          label={vm.t('rateSeeReviews')}
          onPress={vm.onSeeReviews}
          style={styles.seeReviewsBtn}
        />
        {vm.reviewId ? (
          <View style={styles.reviewIdPill}>
            <AppText variant="labelSm" color={colors.muted}>
              {vm.t('rateReviewId').replace('{id}', vm.reviewId)}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={{ height: Math.max(insetsBottom, spacing.lg) }} />
    </View>
  );
}

function StarRow({
  value,
  size,
  onSelect,
}: {
  value: number;
  size: number;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={`${star}`}
          onPress={() => onSelect(star)}
          style={styles.starHit}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? colors.tertiaryContainer : colors.outlineVariant}
          />
        </Pressable>
      ))}
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
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.page,
  },
  flex: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mtXs: {
    marginTop: 4,
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successContainer,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  overallBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starHit: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
  aspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  aspectDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  tagOn: {
    backgroundColor: colors.primaryContainer,
    borderColor: CHIP_BORDER,
  },
  reviewBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: radii.default,
    minHeight: 120,
  },
  reviewInput: {
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -spacing.sm,
  },
  micHit: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidance: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.page,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  identityCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.default,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  complaintBlock: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  submittedRoot: {
    backgroundColor: colors.page,
  },
  submittedHeader: {
    paddingHorizontal: spacing.sm,
  },
  submittedBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  seeReviewsBtn: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  reviewIdPill: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
