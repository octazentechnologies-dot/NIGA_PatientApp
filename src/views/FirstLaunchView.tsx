import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { LanguageChoiceRow } from '../components/LanguageChoiceRow';
import { images } from '../config/images';
import type { FirstLaunchViewModel } from '../controllers/useFirstLaunchController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { moderateScale } from '../utilities/scale';

export function FirstLaunchView({
  language,
  t,
  onSelectLanguage,
  onContinue,
}: FirstLaunchViewModel) {
  const insets = useSafeAreaInsets();
  const markSize = moderateScale(88);

  return (
    <View style={styles.root}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, spacing.md) + spacing.lg,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={images.favicon}
            style={{ width: markSize, height: markSize, tintColor: '#000000' }}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={t('brandName')}
          />
          <AppText
            variant="headlineLg"
            color="#000000"
            style={styles.brand}
          >
            {t('brandName')}
          </AppText>
          <AppText
            variant="bodyMd"
            color={colors.onSurfaceVariant}
            style={styles.byline}
          >
            {t('byline')}
          </AppText>
          <AppText
            variant="headlineMd"
            color="#000000"
            style={styles.headline}
          >
            {t('welcomeHeadline')}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="titleMd" color="#000000" style={styles.cardTitle}>
            {t('chooseLanguageTitle')}
          </AppText>
          <View style={styles.options}>
            <LanguageChoiceRow
              languageCode="mr"
              title={t('languageNameMarathi')}
              subtitle={t('continueInMarathi')}
              selected={language === 'mr'}
              onPress={() => onSelectLanguage('mr')}
            />
            <LanguageChoiceRow
              languageCode="en"
              title={t('languageNameEnglish')}
              subtitle={t('continueInEnglish')}
              selected={language === 'en'}
              onPress={() => onSelectLanguage('en')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton
            label={t('continue')}
            textVariant="titleMd"
            onPress={onContinue}
            style={styles.continueButton}
          />

          <View style={styles.disclaimer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.outline}
              style={styles.disclaimerIcon}
            />
            <AppText
              variant="labelSm"
              color={colors.onSurfaceVariant}
              style={styles.disclaimerText}
            >
              {t('teleconsultDisclaimer')}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingHorizontal: spacing.gutter,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  brand: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  byline: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  headline: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  options: {
    gap: 12,
  },
  footer: {
    gap: spacing.lg,
  },
  continueButton: {
    width: '100%',
    borderRadius: radii.sm,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 12,
  },
  disclaimerIcon: {
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
  },
});
