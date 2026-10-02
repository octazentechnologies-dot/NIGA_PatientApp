import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { LanguageChoiceRow } from '../components/LanguageChoiceRow';
import { Screen } from '../components/Screen';
import { images } from '../config/images';
import type { FirstLaunchViewModel } from '../controllers/useFirstLaunchController';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { moderateScale } from '../utilities/scale';

export function FirstLaunchView({
  t,
  languages,
  selectedLanguageId,
  onSelectLanguage,
  onContinue,
}: FirstLaunchViewModel) {
  const markSize = moderateScale(88);

  return (
    <Screen style={styles.root}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: spacing.md + spacing.lg,
            paddingBottom: spacing.md,
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
            variant="displayLg"
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
            variant="bodyLg"
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
            {languages.map((item) => (
              <LanguageChoiceRow
                key={item.id}
                languageCode={item.code ?? 'en'}
                title={item.name}
                subtitle={item.description}
                selected={item.id === selectedLanguageId}
                onPress={() => onSelectLanguage(item.id)}
              />
            ))}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingHorizontal: spacing.gutter,
    justifyContent: 'flex-start',
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
    backgroundColor: colors.card,
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
    marginTop: 'auto',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  continueButton: {
    width: '100%',
    borderRadius: radii.button,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 12,
  },
  disclaimerIcon: {},
  disclaimerText: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
