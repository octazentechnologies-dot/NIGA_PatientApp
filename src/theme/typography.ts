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
 * Mobile type scale (Clinical Trust / patient):
 * Display 22–26 · Section 17–20 · Body 15–16 · Caption 12–13 · Button 15
 * Slightly tighter than the old prototype scale — refined, not shouty.
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
        ...size(compact ? 22 : 26, lh(compact ? 30 : 34)),
        fontWeight: '700',
        letterSpacing: mr ? 0 : -0.2,
      };
    case 'headlineLg':
      return {
        ...size(compact ? 20 : 22, lh(compact ? 28 : 30)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'headlineMd':
      return {
        ...size(20, lh(28)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'titleMd':
      return {
        ...size(17, lh(24)),
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
