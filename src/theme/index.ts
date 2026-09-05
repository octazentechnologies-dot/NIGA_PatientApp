import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { layout, spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  radii,
  shadows,
  spacing,
  layout,
  typography,
} as const;

export type Theme = typeof theme;

export { colors, layout, radii, shadows, spacing, typography };
