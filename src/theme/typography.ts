import type { TextStyle } from 'react-native';

import type { AppLanguage } from '../localization/types';
import { isCompactWidth, scaleFont } from '../utilities/scale';

export type TypographyVariant =
  | 'displayLg'
  | 'headlineLg'
  | 'headlineMd'
  | 'titleMd'
  | 'bodyLg'
  | 'bodyMd'
  | 'labelLg'
  | 'labelMd'
  | 'labelSm';

type TypographyStyle = Pick<
  TextStyle,
  'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'
>;

function size(fontSize: number, lineHeight: number): Pick<
  TypographyStyle,
  'fontSize' | 'lineHeight'
> {
  return {
    fontSize: scaleFont(fontSize),
    lineHeight: scaleFont(lineHeight),
  };
}

/**
 * Mobile type scale (HomeoCentrum):
 * Display 22–28 · Section 18–20 · Body 14–16 · Caption 12–13 · Button 14–16
 */
export function typography(
  variant: TypographyVariant,
  language: AppLanguage = 'en',
): TypographyStyle {
  const compact = isCompactWidth();
  const mr = language === 'mr';
  /** Extra leading for Devanagari matras without changing EN rhythm much. */
  const lh = (base: number) => base + (mr ? 2 : 0);

  switch (variant) {
    case 'displayLg':
      return {
        ...size(compact ? 24 : 28, lh(compact ? 32 : 36)),
        fontWeight: '700',
        letterSpacing: mr ? 0 : -0.2,
      };
    case 'headlineLg':
      return {
        ...size(compact ? 22 : 24, lh(compact ? 30 : 32)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'headlineMd':
      return {
        ...size(22, lh(30)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'titleMd':
      return {
        ...size(18, lh(24)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'bodyLg':
      return {
        ...size(16, lh(24)),
        fontWeight: '400',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'bodyMd':
      return {
        ...size(15, lh(22)),
        fontWeight: '400',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'labelLg':
      return {
        ...size(15, lh(20)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'labelMd':
      return {
        ...size(13, lh(18)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : 0.14,
      };
    case 'labelSm':
      return {
        ...size(12, lh(16)),
        fontWeight: '500',
        letterSpacing: mr ? 0 : undefined,
      };
  }
}

export function weightTokenFor(
  variant: TypographyVariant,
): '400' | '500' | '600' | '700' {
  switch (variant) {
    case 'displayLg':
      return '700';
    case 'headlineLg':
    case 'headlineMd':
    case 'titleMd':
    case 'labelLg':
    case 'labelMd':
      return '600';
    case 'labelSm':
      return '500';
    default:
      return '400';
  }
}
