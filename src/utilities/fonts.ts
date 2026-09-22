import type { AppLanguage } from '../localization/types';
import type { TypographyVariant } from '../theme/typography';

export type FontWeightToken = '400' | '500' | '600' | '700';
/** English uses Poppins for all roles; kept for call-site compatibility. */
export type FontRole = 'serif' | 'sans';

export const fontNames = {
  /** English — Poppins (Velzon / NigaHomeopathy-UI) */
  sansRegular: 'Poppins_400Regular',
  sansMedium: 'Poppins_500Medium',
  sansSemiBold: 'Poppins_600SemiBold',
  sansBold: 'Poppins_700Bold',
  /** Marathi — Noto Sans Devanagari everywhere */
  devanagariRegular: 'NotoSansDevanagari_400Regular',
  devanagariMedium: 'NotoSansDevanagari_500Medium',
  devanagariSemiBold: 'NotoSansDevanagari_600SemiBold',
  devanagariBold: 'NotoSansDevanagari_700Bold',
  /** System fallback if custom fonts fail to load */
  fallback: 'sans-serif',
} as const;

/** Headings and body share Poppins (EN) / Noto Sans Devanagari (MR). */
export function fontRoleFor(_variant: TypographyVariant): FontRole {
  return 'sans';
}

export function fontFamilyFor(
  weight: FontWeightToken,
  language: AppLanguage,
  _role: FontRole = 'sans',
): string {
  if (language === 'mr') {
    switch (weight) {
      case '500':
        return fontNames.devanagariMedium;
      case '600':
        return fontNames.devanagariSemiBold;
      case '700':
        return fontNames.devanagariBold;
      default:
        return fontNames.devanagariRegular;
    }
  }

  switch (weight) {
    case '500':
      return fontNames.sansMedium;
    case '600':
      return fontNames.sansSemiBold;
    case '700':
      return fontNames.sansBold;
    default:
      return fontNames.sansRegular;
  }
}
