import type { AppLanguage } from '../localization/types';
import type { TypographyVariant } from '../theme/typography';

export type FontWeightToken = '400' | '500' | '600';
export type FontRole = 'serif' | 'sans';

export const fontNames = {
  serifRegular: 'SourceSerif4_400Regular',
  serifSemiBold: 'SourceSerif4_600SemiBold',
  sansRegular: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  devanagariRegular: 'NotoSansDevanagari_400Regular',
  devanagariMedium: 'NotoSansDevanagari_500Medium',
  devanagariSemiBold: 'NotoSansDevanagari_600SemiBold',
} as const;

export function fontRoleFor(variant: TypographyVariant): FontRole {
  switch (variant) {
    case 'displayLg':
    case 'headlineLg':
    case 'headlineMd':
      return 'serif';
    default:
      return 'sans';
  }
}

export function fontFamilyFor(
  weight: FontWeightToken,
  language: AppLanguage,
  role: FontRole,
): string {
  if (language === 'mr') {
    switch (weight) {
      case '500':
        return fontNames.devanagariMedium;
      case '600':
        return fontNames.devanagariSemiBold;
      default:
        return fontNames.devanagariRegular;
    }
  }

  if (role === 'serif') {
    return weight === '400' ? fontNames.serifRegular : fontNames.serifSemiBold;
  }

  switch (weight) {
    case '500':
      return fontNames.sansMedium;
    case '600':
      return fontNames.sansSemiBold;
    default:
      return fontNames.sansRegular;
  }
}
