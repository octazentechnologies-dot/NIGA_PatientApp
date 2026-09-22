import { PixelRatio, Platform } from 'react-native';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
  type EdgeInsets,
} from 'react-native-safe-area-context';

import { spacing } from '../theme/spacing';

/**
 * AOSP `navigation_bar_height` (portrait). Used ONLY when Android WindowInsets
 * report bottom === 0 while the app still draws edge-to-edge under the system
 * nav — common in release/preview APKs on ColorOS/OxygenOS, while the same
 * device often reports a real inset in the expo-dev-client.
 */
const AOSP_NAVIGATION_BAR_HEIGHT_DP = 48;

/**
 * System bottom inset for home indicator / Android nav / gesture bar.
 *
 * Prefer live WindowInsets. If Android reports 0 (release/OEM quirk), fall
 * back to boot metrics, then AOSP navigation_bar_height so preview/production
 * match development clearance above Back/Home/Recents.
 */
export function systemBottomInset(insets: EdgeInsets): number {
  const live = Math.max(insets.bottom, 0);
  const boot = Math.max(initialWindowMetrics?.insets.bottom ?? 0, 0);
  const reported = Math.max(live, boot);

  if (reported > 0) {
    return reported;
  }

  if (Platform.OS === 'android') {
    return PixelRatio.roundToNearestPixel(AOSP_NAVIGATION_BAR_HEIGHT_DP);
  }

  return 0;
}

/** @deprecated Prefer systemBottomInset — kept for existing call sites. */
export function androidNavInset(insets: EdgeInsets): number {
  return systemBottomInset(insets);
}

/**
 * Sticky footers / absolute CTAs: system inset + design air.
 */
export function sheetBottomPadding(
  insets: EdgeInsets,
  minPadding: number = spacing.md,
): number {
  return systemBottomInset(insets) + Math.max(minPadding, 0);
}

/**
 * Scroll/list bottom padding: inset + existing design spacing.
 */
export function screenScrollBottomPadding(
  insets: EdgeInsets,
  extra: number = spacing.xxl,
): number {
  return systemBottomInset(insets) + Math.max(extra, 0);
}

export function useSystemBottomInset(): number {
  return systemBottomInset(useSafeAreaInsets());
}

export function useSheetBottomPadding(minPadding?: number): number {
  return sheetBottomPadding(useSafeAreaInsets(), minPadding);
}

/** @deprecated Prefer useSystemBottomInset. */
export function useAndroidNavInset(): number {
  return useSystemBottomInset();
}
