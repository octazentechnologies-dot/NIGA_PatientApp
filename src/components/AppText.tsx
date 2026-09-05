import { Text, type TextProps, type TextStyle, useWindowDimensions } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage } from '../localization/types';
import { fontFamilyFor, fontRoleFor, type FontWeightToken } from '../utilities/fonts';
import { colors } from '../theme/colors';
import { typography, weightTokenFor, type TypographyVariant } from '../theme/typography';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
  languageOverride?: AppLanguage;
  weightOverride?: FontWeightToken;
};

export function AppText({
  variant = 'bodyMd',
  color = colors.onSurface,
  languageOverride,
  weightOverride,
  style,
  ...props
}: AppTextProps) {
  useWindowDimensions();
  const { language } = useLocalization();
  const token = typography(variant);
  const { fontWeight: _ignoredWeight, ...tokenWithoutWeight } = token;
  const fontStyle: TextStyle = {
    ...tokenWithoutWeight,
    color,
    fontFamily: fontFamilyFor(
      weightOverride ?? weightTokenFor(variant),
      languageOverride ?? language,
      fontRoleFor(variant),
    ),
  };

  return <Text {...props} style={[fontStyle, style]} />;
}
