import { PixelRatio, Text, TextInput } from 'react-native';

type ScalableDefaults = {
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
};

type ComponentWithDefaults = {
  defaultProps?: ScalableDefaults | null;
};

/**
 * Lock app typography to design-token sizes so OS Settings → Display → Font size
 * does not enlarge/shrink text or text inputs.
 *
 * Call once at app entry (before the root component mounts).
 *
 * Note: `Text.defaultProps` is unreliable on New Architecture / Fabric —
 * AppText still sets allowFontScaling={false} explicitly.
 * Android also uses `plugins/withLockSystemFontScale.js` to force fontScale=1.
 */
export function disableSystemFontScaling(): void {
  const text = Text as unknown as ComponentWithDefaults;
  const input = TextInput as unknown as ComponentWithDefaults;

  text.defaultProps = {
    ...text.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };

  input.defaultProps = {
    ...input.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };

  // Code paths that read fontScale (layouts, some libs) stay at 1×.
  try {
    Object.defineProperty(PixelRatio, 'getFontScale', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: () => 1,
    });
  } catch {
    try {
      (PixelRatio as { getFontScale: () => number }).getFontScale = () => 1;
    } catch {
      // ignore
    }
  }
}
