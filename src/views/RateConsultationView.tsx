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

import { AppButton } from '../components/AppButton';
import { AppSwitch } from '../components/AppSwitch';
import { AppText } from '../components/AppText';
import { images } from '../config/images';
import type { RateConsultationViewModel } from '../controllers/useRateConsultationController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const ICON_CYAN = '#5CCEF7';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const CHIP_FILL = '#E6F5FE';
const CHIP_BORDER = '#3AA9E0';
const STAR = '#F2C14E';

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
            <Ionicons name="close" size={24} color={INK} />
          </Pressable>
          <AppText
            variant="headlineMd"
            color={INK}
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
                <AppText variant="labelMd" color={INK} weightOverride="600" style={styles.flex}>
                  {vm.doctorName}
                </AppText>
                <Ionicons name="checkmark-circle" size={18} color={SUCCESS} />
              </View>
              <AppText variant="bodyMd" color={MUTED} style={styles.mtXs}>
                {vm.consultMeta}
              </AppText>
            </View>
          </View>
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark-outline" size={14} color={SUCCESS} />
            <AppText variant="labelSm" color={SUCCESS} weightOverride="600">
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
            <AppText variant="headlineMd" color={INK} style={styles.center}>
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
                <AppText variant="bodyMd" color={INK} style={styles.flex}>
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
                  color={selected ? INK : MUTED}
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
            placeholderTextColor={MUTED}
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
            <Ionicons name="mic-outline" size={22} color={ACTION} />
          </Pressable>
          <AppText variant="labelSm" color={MUTED}>
            {`${vm.reviewText.length} / ${vm.reviewMax}`}
          </AppText>
        </View>

        <View style={styles.guidance}>
          <Ionicons name="information-circle" size={18} color={ICON_CYAN} />
          <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
            {vm.t('rateGuidance')}
          </AppText>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.flex}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.postAsName}
            </AppText>
            <AppText variant="bodyMd" color={MUTED}>
              {vm.t('ratePrivacyNote')}
            </AppText>
          </View>
          <AppSwitch
            value={vm.postPublicly}
            onValueChange={vm.onTogglePostPublicly}
          />
        </View>

        <View style={styles.complaintBlock}>
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {vm.t('rateComplaintTitle')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
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
        <AppButton
          label={vm.t('rateSubmit')}
          onPress={vm.onSubmit}
          disabled={vm.overallRating < 1}
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
          <Ionicons name="close" size={24} color={INK} />
        </Pressable>
      </View>

      <View style={styles.submittedBody}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-circle" size={64} color={SUCCESS} />
        </View>
        <AppText variant="headlineLg" color={INK} style={styles.center}>
          {vm.t('rateThankYou')}
        </AppText>
        <AppText variant="bodyLg" color={MUTED} style={styles.center}>
          {vm.t('rateThankYouBody')}
        </AppText>
        <AppButton
          label={vm.t('rateSeeReviews')}
          onPress={vm.onSeeReviews}
          style={styles.seeReviewsBtn}
        />
        <View style={styles.reviewIdPill}>
          <AppText variant="labelSm" color={MUTED}>
            {vm.t('rateReviewId').replace('{id}', vm.reviewId)}
          </AppText>
        </View>
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
            color={star <= value ? STAR : HAIRLINE}
          />
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
    gap: spacing.lg,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    backgroundColor: PAGE,
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
    backgroundColor: SUCCESS_FILL,
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
    backgroundColor: HAIRLINE,
  },
  aspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  aspectDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HAIRLINE,
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
    borderColor: HAIRLINE,
    backgroundColor: CARD,
    justifyContent: 'center',
  },
  tagOn: {
    backgroundColor: CHIP_FILL,
    borderColor: CHIP_BORDER,
  },
  reviewBox: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: MUTED,
    borderRadius: radii.default,
    minHeight: 120,
  },
  reviewInput: {
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: INK,
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
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  identityCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
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
    borderTopColor: HAIRLINE,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  submittedRoot: {
    backgroundColor: PAGE,
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
    backgroundColor: SUCCESS_FILL,
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
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
