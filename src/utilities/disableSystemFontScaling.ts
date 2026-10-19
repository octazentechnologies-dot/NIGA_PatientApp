import { Text, TextInput } from 'react-native';

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
}
