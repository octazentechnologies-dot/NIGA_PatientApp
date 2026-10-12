import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { images } from '../config/images';
import type { AppLanguage } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { AppText } from './AppText';

type AuthHeaderProps = {
  language: AppLanguage;
  brandName: string;
  backLabel: string;
  onBack: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
};

export function AuthHeader({
  language,
  brandName,
  backLabel,
  onBack,
  onSelectLanguage,
}: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, spacing.sm),
          paddingBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        {/* <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={8}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </Pressable> */}
        <Image
          source={images.favicon}
          style={styles.brandMark}
          resizeMode="contain"
          accessibilityLabel={brandName}
        />
        <AppText
          variant="headlineMd"
          color="#000000"
          style={styles.brandName}
          numberOfLines={1}
        >
          {brandName}
        </AppText>
      </View>
      {/* <View style={styles.languageSwitch}>
        <LanguageChip
          label="EN"
          languageOverride="en"
          selected={language === 'en'}
          onPress={() => onSelectLanguage('en')}
        />
        <LanguageChip
          label="मराठी"
          languageOverride="mr"
          selected={language === 'mr'}
          onPress={() => onSelectLanguage('mr')}
        />
      </View> */}
    </View>
  );
}

function LanguageChip({
  label,
  selected,
  languageOverride,
  onPress,
}: {
  label: string;
  selected: boolean;
  languageOverride: AppLanguage;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <AppText
        variant="labelSm"
        languageOverride={languageOverride}
        color={selected ? colors.onButton : colors.button}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  backButton: {
    width: 40,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  brandMark: {
    width: 28,
    height: 28,
    tintColor: '#000000',
  },
  brandName: {
    flexShrink: 1,
  },
  languageSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.button,
    borderRadius: radii.full,
    padding: 2,
    minHeight: 36,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.button,
  },
  chipPressed: {
    opacity: 0.8,
  },
});
