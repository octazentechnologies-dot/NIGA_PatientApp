import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetBottomPadding } from '../utilities/sheetInset';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import type { HealthTipSeed } from '../config/healthTips';
import { images } from '../config/images';
import type { HealthTipViewModel } from '../controllers/useHealthTipController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { scaleFont } from '../utilities/scale';

const GREY_FILL = colors.surfaceVariant;
const ICON_BLUE = colors.primary;

export function HealthTipArticleView({
  t,
  tip,
  related,
  fromApi,
  saved: _saved,
  notesOpen,
  textScale,
  helpful,
  onBack,
  onCycleTextSize,
  onToggleSave: _onToggleSave,
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
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tipTextSize')}
            onPress={onCycleTextSize}
            hitSlop={8}
            style={styles.iconButton}
          >
            <AppText variant="labelMd" color={colors.ink} style={styles.ttIcon}>
              Tt
            </AppText>
          </Pressable>
          {/* BE-031 — bookmarks not planned */}
          <View style={styles.iconButton} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tipShare')}
            onPress={onShare}
            hitSlop={8}
            style={styles.iconButton}
          >
            <Ionicons name="share-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: sheetBottomPadding(insets, spacing.xl) },
        ]}
      >
        <Image source={tip.hero} resizeMode="contain" style={styles.hero} />

        {tip.categoryKey || tip.readMins > 0 ? (
          <View style={styles.metaRow}>
            {tip.categoryKey ? (
              <View style={styles.categoryChip}>
                <AppText
                  variant="labelSm"
                  color={ICON_BLUE}
                  weightOverride="600"
                  raw={fromApi}
                >
                  {t(tip.categoryKey)}
                </AppText>
              </View>
            ) : null}
            {tip.readMins > 0 ? (
              <View style={styles.readRow}>
                <Ionicons name="time-outline" size={14} color={colors.muted} />
                <AppText variant="labelSm" color={colors.muted}>
                  {t('tipMinRead').replace('{count}', String(tip.readMins))}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        <AppText
          variant="headlineMd"
          color={colors.ink}
          style={titleSize}
          raw={fromApi}
        >
          {t(tip.titleKey)}
        </AppText>

        {tip.authorNameKey || tip.publishedKey || tip.reviewerKey ? (
          <View style={styles.authorCard}>
            {tip.authorNameKey ? (
              <View style={styles.authorRow}>
                <Image
                  source={images.doctorPortrait}
                  resizeMode="cover"
                  style={styles.avatar}
                />
                <View style={styles.flex}>
                  <AppText
                    variant="titleMd"
                    color={colors.ink}
                    style={styles.authorName}
                    raw={fromApi}
                  >
                    {t(tip.authorNameKey)}
                  </AppText>
                  {tip.authorCredsKey ? (
                    <AppText variant="labelSm" color={colors.muted} raw={fromApi}>
                      {t(tip.authorCredsKey)}
                    </AppText>
                  ) : null}
                </View>
              </View>
            ) : null}
            {tip.reviewerKey ? (
              <View style={styles.reviewRow}>
                <Ionicons name="checkmark-circle" size={16} color={ICON_BLUE} />
                <AppText variant="labelSm" color={colors.ink} style={styles.flex}>
                  {t('tipReviewedBy').replace('{name}', t(tip.reviewerKey))}
                </AppText>
              </View>
            ) : null}
            {tip.publishedKey ? (
              <AppText variant="labelSm" color={colors.muted} raw={fromApi}>
                {t(tip.publishedKey)}
              </AppText>
            ) : null}
            {tip.reviewNotesKey ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={onToggleNotes}
                  style={({ pressed }) => [
                    styles.notesButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={ICON_BLUE}
                  />
                  <AppText variant="labelSm" color={ICON_BLUE} weightOverride="600">
                    {t(notesOpen ? 'tipHideReviewNotes' : 'tipReadReviewNotes')}
                  </AppText>
                </Pressable>
                {notesOpen ? (
                  <AppText variant="bodyMd" color={colors.muted} style={bodySize}>
                    {t(tip.reviewNotesKey)}
                  </AppText>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}

        {tip.body.map((block, index) => {
          if (block.type === 'heading') {
            return (
              <AppText
                key={`${String(block.key)}-${index}`}
                variant="headlineMd"
                color={colors.ink}
                style={headingSize}
                raw={fromApi}
              >
                {t(block.key)}
              </AppText>
            );
          }
          if (block.type === 'paragraph') {
            return (
              <AppText
                key={`${String(block.key)}-${index}`}
                variant="bodyMd"
                color={colors.muted}
                style={bodySize}
                raw={fromApi}
              >
                {t(block.key)}
              </AppText>
            );
          }
          if (block.type === 'quote') {
            return (
              <View key={`${String(block.key)}-${index}`} style={styles.quote}>
                <AppText
                  variant="headlineMd"
                  color={colors.ink}
                  style={[styles.quoteText, headingSize]}
                  raw={fromApi}
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
                  <AppText
                    variant="bodyMd"
                    color={colors.ink}
                    style={[styles.flex, bodySize]}
                    raw={fromApi}
                  >
                    {t(key)}
                  </AppText>
                </View>
              ))}
            </View>
          );
        })}

        {tip.careTipKeys.length > 0 ? (
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
                <AppText
                  variant="bodyMd"
                  color={colors.ink}
                  style={[styles.flex, bodySize]}
                >
                  {t(key)}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.disclaimer}>
          <View style={styles.careHead}>
            <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
            <AppText variant="titleMd" color={colors.ink} style={styles.disclaimerTitle}>
              {t('tipDisclaimerTitle')}
            </AppText>
          </View>
          <AppText variant="bodyMd" color={colors.muted} style={bodySize}>
            {t('tipDisclaimerBody')}
          </AppText>
        </View>

        <View style={styles.cta}>
          <AppText variant="headlineMd" color={colors.ink} style={headingSize}>
            {t('tipTalkToDoctor')}
          </AppText>
          <AppText variant="bodyMd" color={colors.muted} style={bodySize}>
            {t('tipTalkToDoctorBody')}
          </AppText>
          <AppButton
            label={
              tip.findDoctorKey ? t(tip.findDoctorKey) : t('tipTalkToDoctor')
            }
            onPress={onFindDoctor}
            iconPosition="end"
            icon={<Ionicons name="arrow-forward" size={18} color={colors.card} />}
          />
        </View>

        {related.length > 0 ? (
          <>
            <AppText
              variant="headlineMd"
              color={colors.ink}
              style={styles.relatedTitle}
            >
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
                  category={item.categoryKey ? t(item.categoryKey) : ''}
                  title={t(item.titleKey)}
                  fromApi={fromApi}
                  onPress={() => onOpenRelated(item.id)}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.feedback}>
          <AppText variant="titleMd" color={colors.ink}>
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
                color={helpful === 'up' ? colors.card : ICON_BLUE}
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
                color={helpful === 'down' ? colors.card : ICON_BLUE}
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
  fromApi,
  onPress,
}: {
  tip: HealthTipSeed;
  category: string;
  title: string;
  fromApi: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.relatedCard}>
      <Image source={tip.hero} resizeMode="cover" style={styles.relatedImage} />
      {category ? (
        <AppText
          variant="labelSm"
          color={ICON_BLUE}
          weightOverride="600"
          raw={fromApi}
        >
          {category}
        </AppText>
      ) : null}
      <AppText
        variant="bodyMd"
        color={colors.ink}
        numberOfLines={3}
        weightOverride="600"
        raw={fromApi}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.card,
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
    backgroundColor: colors.primaryContainer,
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
    borderColor: colors.outlineVariant,
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
    backgroundColor: colors.primaryContainer,
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
    borderRadius: radii.button,
    backgroundColor: colors.card,
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
    backgroundColor: colors.primaryContainer,
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
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.sm,
    padding: spacing.lg,
    gap: 12,
  },
  ctaButton: {
    minHeight: 48,
    backgroundColor: colors.button,
    borderRadius: radii.button,
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
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 8,
    backgroundColor: colors.card,
  },
  relatedImage: {
    width: '100%',
    height: 96,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryContainer,
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
    backgroundColor: colors.card,
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
