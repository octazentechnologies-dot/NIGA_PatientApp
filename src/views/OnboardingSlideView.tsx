import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { PaginationDots } from '../components/PaginationDots';
import { Screen } from '../components/Screen';
import { SlideStrip } from '../components/SlideStrip';
import type {
  OnboardingSlideContent,
  OnboardingViewModel,
} from '../controllers/useOnboardingController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

export function OnboardingSlideView({
  t,
  slides,
  pageCount,
  activePageIndex,
  onSkip,
  onGetStarted,
  onHaveAccount,
}: OnboardingViewModel) {
  const { width } = useWindowDimensions();
  const illustrationSize = Math.min(width - spacing.gutter * 2, 360);

  return (
    <Screen style={styles.root}>
      <View style={[styles.skipRow, { paddingTop: spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onSkip}
          style={styles.skipButton}
        >
          <AppText variant="labelMd" color="#000000">
            {t('skip')}
          </AppText>
        </Pressable>
        <View style={styles.dotsWrap}>
          <PaginationDots count={pageCount} activeIndex={activePageIndex} />
        </View>
      </View>

      <View style={styles.stage}>
        <SlideStrip index={activePageIndex}>
          {slides.map((slide) => (
            <OnboardingSlideBody
              key={slide.titleKey}
              slide={slide}
              title={t(slide.titleKey)}
              body={t(slide.bodyKey)}
              illustrationSize={illustrationSize}
            />
          ))}
        </SlideStrip>
      </View>

      <View style={[styles.footer, { paddingBottom: spacing.lg }]}>
        <View style={styles.actions}>
          <AppButton
            label={t('getStarted')}
            textVariant="titleMd"
            onPress={onGetStarted}
            style={styles.actionButton}
          />
          <AppButton
            variant="secondary"
            label={t('alreadyHaveAccount')}
            textVariant="titleMd"
            onPress={onHaveAccount}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Screen>
  );
}

function OnboardingSlideBody({
  slide,
  title,
  body,
  illustrationSize,
}: {
  slide: OnboardingSlideContent;
  title: string;
  body: string;
  illustrationSize: number;
}) {
  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.illustrationWrap}>
        <View
          style={[
            styles.illustrationFrame,
            { width: illustrationSize, height: illustrationSize },
          ]}
        >
          <Image
            source={slide.image}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel={title}
          />
        </View>
      </View>

      <View style={styles.copy}>
        <AppText variant="headlineMd" color="#000000" style={styles.title}>
          {title}
        </AppText>
        <AppText
          variant="bodyLg"
          color={colors.onSurfaceVariant}
          style={styles.body}
        >
          {body}
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.page,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
  },
  skipButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  dotsWrap: {
    paddingRight: spacing.md,
    paddingBottom: spacing.xs,
  },
  stage: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.gutter,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.card,
  },
  illustrationWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  illustrationFrame: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  copy: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.button,
  },
});
