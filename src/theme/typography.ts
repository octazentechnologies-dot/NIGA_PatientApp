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
  | 'labelSm'
  | 'pageTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  | 'button'
  | 'helperText';

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
 * Mobile type scale (Standardized Clinical Trust / patient):
 * - Large titles (displayLg / pageTitle): 22–24
 * - Section headings (headlineMd / sectionTitle): 18–20
 * - Card titles & subheadings (titleMd / cardTitle): 16–17
 * - Standard body text (bodyLg / bodyMd / body): 14–16
 * - Secondary labels & buttons (labelLg / button / labelMd): 12–15
 * - Captions & metadata (labelSm / caption / helperText): 11–12
 *
 * Weights:
 * - Regular: 400
 * - Medium emphasis: 500
 * - Semibold: 600 (refined, avoiding excessive 700 bold)
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
        ...size(compact ? 22 : 24, lh(compact ? 28 : 32)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : -0.2,
      };
    case 'headlineLg':
    case 'pageTitle':
      return {
        ...size(compact ? 20 : 22, lh(compact ? 26 : 28)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'headlineMd':
    case 'sectionTitle':
      return {
        ...size(compact ? 18 : 20, lh(compact ? 24 : 26)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'titleMd':
    case 'cardTitle':
      return {
        ...size(compact ? 16 : 17, lh(compact ? 22 : 24)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'bodyLg':
      return {
        ...size(compact ? 15 : 16, lh(compact ? 22 : 24)),
        fontWeight: '400',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'bodyMd':
    case 'body':
      return {
        ...size(compact ? 14 : 15, lh(compact ? 20 : 22)),
        fontWeight: '400',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'bodyMedium':
      return {
        ...size(compact ? 14 : 15, lh(compact ? 20 : 22)),
        fontWeight: '500',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'labelLg':
    case 'button':
      return {
        ...size(compact ? 14 : 15, lh(compact ? 18 : 20)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'labelMd':
    case 'label':
      return {
        ...size(compact ? 12 : 13, lh(compact ? 16 : 18)),
        fontWeight: '600',
        letterSpacing: mr ? 0 : 0.14,
      };
    case 'labelSm':
      return {
        ...size(compact ? 11 : 12, lh(compact ? 15 : 16)),
        fontWeight: '500',
        letterSpacing: mr ? 0 : undefined,
      };
    case 'caption':
    case 'helperText':
      return {
        ...size(compact ? 11 : 12, lh(compact ? 15 : 16)),
        fontWeight: '400',
        letterSpacing: mr ? 0 : undefined,
      };
  }
}

export function weightTokenFor(
  variant: TypographyVariant,
): '400' | '500' | '600' | '700' {
  switch (variant) {
    case 'displayLg':
    case 'headlineLg':
    case 'headlineMd':
    case 'titleMd':
    case 'labelLg':
    case 'labelMd':
    case 'pageTitle':
    case 'sectionTitle':
    case 'cardTitle':
    case 'button':
    case 'label':
      return '600';
    case 'labelSm':
    case 'bodyMedium':
      return '500';
    case 'caption':
    case 'helperText':
    case 'bodyLg':
    case 'bodyMd':
    case 'body':
    default:
      return '400';
  }
}
