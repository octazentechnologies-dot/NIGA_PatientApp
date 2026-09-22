import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type {
  MyReviewItem,
  MyReviewsViewModel,
  ReviewStatus,
} from '../controllers/useMyReviewsController';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

const INK = '#1F1F1F';
const MUTED = '#595959';
const HAIRLINE = '#DDDFE2';
const PAGE = '#F5F6F7';
const CARD = '#FFFFFF';
const ACTION = '#2A7BA3';
const LINK = '#17739F';
const STAR = '#F2C14E';
const SUCCESS = '#0F7A4E';
const SUCCESS_FILL = '#E9F5EF';
const NEUTRAL_FILL = '#F2F2F2';
const DANGER = '#A3231A';
const DANGER_FILL = '#FBEBE9';
const PENDING_FILL = '#E6F5FE';

export function MyReviewsView(vm: MyReviewsViewModel) {
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
            {vm.t('myReviewsTitle')}
          </AppText>
          <View style={styles.iconHit} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 24 + sheetBottomPadding(insets, spacing.md) },
        ]}
      >
        <View style={styles.pendingCard}>
          <View style={styles.flex}>
            <AppText variant="labelMd" color={INK} weightOverride="600">
              {vm.t('myReviewsPendingTitle')}
            </AppText>
            <View style={styles.pendingMeta}>
              <MaterialCommunityIcons name="stethoscope" size={16} color={MUTED} />
              <AppText variant="bodyMd" color={MUTED}>
                {vm.pendingDoctor}, {vm.pendingDate}
              </AppText>
            </View>
          </View>
          <AppButton
            label={vm.t('myReviewsRateCta')}
            onPress={vm.onRatePending}
            icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
            style={styles.rateBtn}
          />
        </View>

        {vm.reviews.map((item) => (
          <ReviewCard key={item.id} item={item} vm={vm} />
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={MUTED} />
          <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
            {vm.t('myReviewsPolicyNote')}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function ReviewCard({
  item,
  vm,
}: {
  item: MyReviewItem;
  vm: MyReviewsViewModel;
}) {
  const status = statusStyle(item.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.flex}>
          <AppText variant="labelMd" color={INK} weightOverride="600">
            {item.doctorName}
          </AppText>
          <AppText variant="bodyMd" color={MUTED}>
            {item.dateLabel}
          </AppText>
        </View>
        <Pressable accessibilityRole="button" style={styles.moreHit}>
          <Ionicons name="ellipsis-vertical" size={18} color={MUTED} />
        </Pressable>
      </View>

      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Ionicons
            key={`${item.id}-star-${index}`}
            name={index < item.rating ? 'star' : 'star-outline'}
            size={18}
            color={index < item.rating ? STAR : HAIRLINE}
          />
        ))}
      </View>

      <AppText
        variant="bodyMd"
        color={item.struck ? MUTED : INK}
        style={[styles.quote, item.struck && styles.struck]}
      >
        “{vm.t(item.quoteKey)}”
      </AppText>

      <View
        style={[
          styles.statusBox,
          item.status === 'rejected' && styles.statusBoxRejected,
        ]}
      >
        <View style={[styles.statusPill, { backgroundColor: status.fill }]}>
          <Ionicons name={status.icon} size={14} color={status.color} />
          <AppText variant="labelSm" color={status.color} weightOverride="600">
            {vm.t(status.labelKey)}
          </AppText>
        </View>

        {item.status === 'rejected' ? (
          <View style={styles.rejectedCopy}>
            <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
              {vm.t(item.footerKey)}{' '}
              <AppText
                variant="bodyMd"
                color={LINK}
                weightOverride="600"
                style={styles.underline}
                onPress={() => vm.onSeeWhy(item.id)}
              >
                {vm.t('myReviewsSeeWhy')}
              </AppText>
            </AppText>
            {item.canAppeal ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => vm.onAppeal(item.id)}
                style={styles.appealHit}
              >
                <AppText variant="labelMd" color={ACTION} weightOverride="600">
                  {vm.t('myReviewsAppeal')}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <AppText variant="bodyMd" color={MUTED} style={styles.flex}>
            {vm.t(item.footerKey)}
          </AppText>
        )}
      </View>
    </View>
  );
}

function statusStyle(status: ReviewStatus): {
  labelKey: Parameters<MyReviewsViewModel['t']>[0];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  fill: string;
} {
  if (status === 'published') {
    return {
      labelKey: 'myReviewsStatusPublished',
      icon: 'checkmark-circle',
      color: SUCCESS,
      fill: SUCCESS_FILL,
    };
  }
  if (status === 'moderation') {
    return {
      labelKey: 'myReviewsStatusModeration',
      icon: 'time-outline',
      color: ACTION,
      fill: PENDING_FILL,
    };
  }
  return {
    labelKey: 'myReviewsStatusRejected',
    icon: 'close-circle',
    color: DANGER,
    fill: DANGER_FILL,
  };
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
  pendingCard: {
    backgroundColor: SUCCESS_FILL,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.md,
  },
  pendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rateBtn: {
    alignSelf: 'flex-start',
    minWidth: 140,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moreHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  quote: {
    fontStyle: 'italic',
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  statusBox: {
    marginTop: spacing.xs,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.default,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  statusBoxRejected: {
    backgroundColor: DANGER_FILL,
    borderColor: '#F5C6C2',
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rejectedCopy: {
    gap: spacing.sm,
  },
  appealHit: {
    minHeight: 48,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: NEUTRAL_FILL,
    borderRadius: radii.default,
    padding: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
