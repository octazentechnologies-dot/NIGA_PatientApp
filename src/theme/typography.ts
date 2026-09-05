import type { TextStyle } from 'react-native';

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

export function typography(variant: TypographyVariant): TypographyStyle {
  const compact = isCompactWidth();

  switch (variant) {
    case 'displayLg':
      return {
        ...size(compact ? 32 : 40, compact ? 40 : 52),
        fontWeight: '600',
        letterSpacing: -0.8,
      };
    case 'headlineLg':
      return {
        ...size(compact ? 26 : 32, compact ? 34 : 40),
        fontWeight: '600',
      };
    case 'headlineMd':
      return {
        ...size(22, 30),
        fontWeight: '600',
      };
    case 'titleMd':
      return {
        ...size(18, 24),
        fontWeight: '600',
      };
    case 'bodyLg':
      return {
        ...size(16, 24),
        fontWeight: '400',
      };
    case 'bodyMd':
      return {
        ...size(15, 22),
        fontWeight: '400',
      };
    case 'labelLg':
      return {
        ...size(15, 20),
        fontWeight: '600',
      };
    case 'labelMd':
      return {
        ...size(13, 18),
        fontWeight: '600',
        letterSpacing: 0.14,
      };
    case 'labelSm':
      return {
        ...size(11, 15),
        fontWeight: '500',
      };
  }
}

export function weightTokenFor(
  variant: TypographyVariant,
): '400' | '500' | '600' {
  switch (variant) {
    case 'displayLg':
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
