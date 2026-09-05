import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import type { HealthTipSeed } from '../config/healthTips';
import { images } from '../config/images';
import type { HealthTipViewModel } from '../controllers/useHealthTipController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

const MUTED = '#595959';
const HAIRLINE = '#E6E6E6';
const CHIP_FILL = '#E6F5FE';
const GREY_FILL = '#F2F2F2';
const ICON_BLUE = '#3AA9E0';

export function HealthTipArticleView({
  t,
  tip,
  related,
  saved,
  notesOpen,
  textScale,
  helpful,
  onBack,
  onCycleTextSize,
  onToggleSave,
  onShare,
  onToggleNotes,
  onOpenRelated,
  onFindDoctor,
  onHelpful,
  onReport,
}: HealthTipViewModel) {
  const insets = useSafeAreaInsets();
  const bodySize = {
    fontSize: scaleFont(15) * textScale,
    lineHeight: scaleFont(22) * textScale,
  };
  const headingSize = {
    fontSize: scaleFont(22) * textScale,
    lineHeight: scaleFont(30) * textScale,
  };
  const titleSize = {
    fontSize: scaleFont(24) * textScale,
    lineHeight: scaleFont(32) * textScale,
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          hitSlop={8}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tipTextSize')}
            onPress={onCycleTextSize}
            hitSlop={8}
            style={styles.iconButton}
          >
            <AppText variant="labelMd" color="#000000" style={styles.ttIcon}>
              Tt
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? t('tipSaved') : t('tipSave')}
            onPress={onToggleSave}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? colors.primary : '#000000'}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tipShare')}
            onPress={onShare}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="share-outline" size={22} color="#000000" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, spacing.xl) },
        ]}
      >
        <Image source={tip.hero} resizeMode="contain" style={styles.hero} />

        <View style={styles.metaRow}>
          <View style={styles.categoryChip}>
            <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
              {t(tip.categoryKey)}
            </AppText>
          </View>
          <View style={styles.readRow}>
            <Ionicons name="time-outline" size={14} color={MUTED} />
            <AppText variant="labelSm" color={MUTED}>
              {t('tipMinRead').replace('{count}', String(tip.readMins))}
            </AppText>
          </View>
        </View>

        <AppText variant="headlineMd" color="#000000" style={titleSize}>
          {t(tip.titleKey)}
        </AppText>

        <View style={styles.authorCard}>
          <View style={styles.authorRow}>
            <Image
              source={images.doctorPortrait}
              resizeMode="cover"
              style={styles.avatar}
            />
            <View style={styles.flex}>
              <AppText variant="titleMd" color="#000000" style={styles.authorName}>
                {t(tip.authorNameKey)}
              </AppText>
              <AppText variant="labelSm" color={MUTED}>
                {t(tip.authorCredsKey)}
              </AppText>
            </View>
          </View>
          <View style={styles.reviewRow}>
            <Ionicons name="checkmark-circle" size={16} color={ICON_BLUE} />
            <AppText variant="labelSm" color="#000000" style={styles.flex}>
              {t('tipReviewedBy').replace('{name}', t(tip.reviewerKey))}
            </AppText>
          </View>
          <AppText variant="labelSm" color={MUTED}>
            {t(tip.publishedKey)}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={onToggleNotes}
            style={({ pressed }) => [
              styles.notesButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="document-text-outline" size={16} color={ICON_BLUE} />
            <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
              {t(notesOpen ? 'tipHideReviewNotes' : 'tipReadReviewNotes')}
            </AppText>
          </Pressable>
          {notesOpen ? (
            <AppText variant="bodyMd" color={MUTED} style={bodySize}>
              {t(tip.reviewNotesKey)}
            </AppText>
          ) : null}
        </View>

        {tip.body.map((block, index) => {
          if (block.type === 'heading') {
            return (
              <AppText
                key={`${block.key}-${index}`}
                variant="headlineMd"
                color="#000000"
                style={headingSize}
              >
                {t(block.key)}
              </AppText>
            );
          }
          if (block.type === 'paragraph') {
            return (
              <AppText
                key={`${block.key}-${index}`}
                variant="bodyMd"
                color={MUTED}
                style={bodySize}
              >
                {t(block.key)}
              </AppText>
            );
          }
          if (block.type === 'quote') {
            return (
              <View key={`${block.key}-${index}`} style={styles.quote}>
                <AppText
                  variant="headlineMd"
                  color="#000000"
                  style={[styles.quoteText, headingSize]}
                >
                  {`“${t(block.key)}”`}
                </AppText>
              </View>
            );
          }
          return (
            <View key={`checks-${index}`} style={styles.checkList}>
              {block.keys.map((key) => (
                <View key={key} style={styles.checkRow}>
                  <Ionicons name="checkmark-circle" size={20} color={ICON_BLUE} />
                  <AppText variant="bodyMd" color="#000000" style={[styles.flex, bodySize]}>
                    {t(key)}
                  </AppText>
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.careBox}>
          <View style={styles.careHead}>
            <Ionicons name="leaf-outline" size={18} color={ICON_BLUE} />
            <AppText variant="titleMd" color={ICON_BLUE} style={styles.careTitle}>
              {t('tipDailyCare')}
            </AppText>
          </View>
          {tip.careTipKeys.map((key) => (
            <View key={key} style={styles.careItem}>
              <View style={styles.careDot} />
              <AppText variant="bodyMd" color="#000000" style={[styles.flex, bodySize]}>
                {t(key)}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <View style={styles.careHead}>
            <Ionicons name="information-circle-outline" size={18} color={MUTED} />
            <AppText variant="titleMd" color="#000000" style={styles.disclaimerTitle}>
              {t('tipDisclaimerTitle')}
            </AppText>
          </View>
          <AppText variant="bodyMd" color={MUTED} style={bodySize}>
            {t('tipDisclaimerBody')}
          </AppText>
        </View>

        <View style={styles.cta}>
          <AppText variant="headlineMd" color="#000000" style={headingSize}>
            {t('tipTalkToDoctor')}
          </AppText>
          <AppText variant="bodyMd" color={MUTED} style={bodySize}>
            {t('tipTalkToDoctorBody')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={onFindDoctor}
            style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
          >
            <AppText variant="bodyLg" color="#FFFFFF" weightOverride="600">
              {t(tip.findDoctorKey)}
            </AppText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <AppText variant="headlineMd" color="#000000" style={styles.relatedTitle}>
          {t('tipRelatedReading')}
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedRow}
        >
          {related.map((item) => (
            <RelatedCard
              key={item.id}
              tip={item}
              category={t(item.categoryKey)}
              title={t(item.titleKey)}
              onPress={() => onOpenRelated(item.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.feedback}>
          <AppText variant="titleMd" color="#000000">
            {t('tipHelpful')}
          </AppText>
          <View style={styles.thumbRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onHelpful('up')}
              style={[
                styles.thumb,
                helpful === 'up' && styles.thumbActive,
              ]}
            >
              <Ionicons
                name="thumbs-up-outline"
                size={22}
                color={helpful === 'up' ? '#FFFFFF' : ICON_BLUE}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onHelpful('down')}
              style={[
                styles.thumb,
                helpful === 'down' && styles.thumbActive,
              ]}
            >
              <Ionicons
                name="thumbs-down-outline"
                size={22}
                color={helpful === 'down' ? '#FFFFFF' : ICON_BLUE}
              />
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={onReport} hitSlop={8}>
            <AppText variant="labelSm" color={ICON_BLUE} style={styles.report}>
              {t('tipReport')}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function RelatedCard({
  tip,
  category,
  title,
  onPress,
}: {
  tip: HealthTipSeed;
  category: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.relatedCard}>
      <Image source={tip.hero} resizeMode="cover" style={styles.relatedImage} />
      <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
        {category}
      </AppText>
      <AppText variant="bodyMd" color="#000000" numberOfLines={3} weightOverride="600">
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
    backgroundColor: '#FFFFFF',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttIcon: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(20),
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    width: '100%',
    height: 220,
    alignSelf: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: CHIP_FILL,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorCard: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: CHIP_FILL,
  },
  authorName: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quote: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  quoteText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  checkList: {
    gap: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  careBox: {
    backgroundColor: CHIP_FILL,
    borderLeftWidth: 4,
    borderLeftColor: ICON_BLUE,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 10,
  },
  careHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  careTitle: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  careDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: ICON_BLUE,
    marginTop: 8,
  },
  disclaimer: {
    backgroundColor: GREY_FILL,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 8,
  },
  disclaimerTitle: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
  },
  cta: {
    backgroundColor: CHIP_FILL,
    borderRadius: radii.sm,
    padding: spacing.lg,
    gap: 12,
  },
  ctaButton: {
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
  },
  relatedTitle: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(28),
    marginTop: spacing.sm,
  },
  relatedRow: {
    gap: 12,
    paddingRight: spacing.md,
  },
  relatedCard: {
    width: 200,
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  relatedImage: {
    width: '100%',
    height: 96,
    borderRadius: radii.sm,
    backgroundColor: CHIP_FILL,
  },
  feedback: {
    alignItems: 'center',
    gap: 12,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 16,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: ICON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbActive: {
    backgroundColor: ICON_BLUE,
  },
  report: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.85,
  },
  flex: {
    flex: 1,
  },
});
