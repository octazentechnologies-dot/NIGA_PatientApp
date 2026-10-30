import { Dimensions, PixelRatio, Platform } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const MIN_SCALE = 0.82;
const MAX_SCALE = 1.06;
/** Slightly tighter type on Android — Material/system metrics read larger than iOS. */
const ANDROID_FONT_FACTOR = 0.9;

export function screenScale(): number {
  const { width, height } = Dimensions.get('window');
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function moderateScale(size: number, factor = 0.65): number {
  const scale = screenScale();
  const scaled = size + (size * scale - size) * factor;
  return Math.max(1, Math.round(PixelRatio.roundToNearestPixel(scaled)));
}

export function scaleFont(size: number): number {
  const scaled = moderateScale(size, 0.7);
  if (Platform.OS !== 'android') {
    return scaled;
  }
  return Math.max(
    1,
    Math.round(PixelRatio.roundToNearestPixel(scaled * ANDROID_FONT_FACTOR)),
  );
}

/** Apply the same Android-only reduction to raw token font sizes (e.g. TextInput). */
export function platformFontSize(size: number): number {
  if (Platform.OS !== 'android') {
    return size;
  }
  return Math.max(
    1,
    Math.round(PixelRatio.roundToNearestPixel(size * ANDROID_FONT_FACTOR)),
  );
}

export function isCompactWidth(): boolean {
  return Dimensions.get('window').width < 767;
}
