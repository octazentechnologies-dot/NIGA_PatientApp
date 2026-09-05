import { Dimensions, PixelRatio } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const MIN_SCALE = 0.82;
const MAX_SCALE = 1.06;

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
  return moderateScale(size, 0.7);
}

export function isCompactWidth(): boolean {
  return Dimensions.get('window').width < 767;
}
