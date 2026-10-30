import Toast, {
  BaseToast,
  ErrorToast,
  type ToastConfig,
} from 'react-native-toast-message';

import { useLocalization } from '../localization/i18n';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { fontFamilyFor } from '../utilities/fonts';

const noFontScale = {
  allowFontScaling: false,
  maxFontSizeMultiplier: 1,
} as const;

function buildToastConfig(language: 'en' | 'mr'): ToastConfig {
  const title = typography('labelMd', language);
  const body = typography('labelSm', language);
  const titleFamily = fontFamilyFor('500', language, 'sans');
  const bodyFamily = fontFamilyFor('400', language, 'sans');

  return {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: colors.success,
          backgroundColor: colors.successContainer,
          height: undefined,
          minHeight: 56,
          paddingVertical: 10,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Props={noFontScale}
        text2Props={noFontScale}
        text1Style={{
          fontSize: title.fontSize,
          lineHeight: title.lineHeight,
          fontFamily: titleFamily,
          color: colors.onSuccessContainer,
        }}
        text2Style={{
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          fontFamily: bodyFamily,
          color: colors.ink,
        }}
        text2NumberOfLines={4}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: colors.error,
          backgroundColor: colors.errorContainer,
          height: undefined,
          minHeight: 56,
          paddingVertical: 10,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Props={noFontScale}
        text2Props={noFontScale}
        text1Style={{
          fontSize: title.fontSize,
          lineHeight: title.lineHeight,
          fontFamily: titleFamily,
          color: colors.onErrorContainer,
        }}
        text2Style={{
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          fontFamily: bodyFamily,
          color: colors.ink,
        }}
        text2NumberOfLines={4}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: colors.primary,
          backgroundColor: colors.primaryContainer,
          height: undefined,
          minHeight: 56,
          paddingVertical: 10,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Props={noFontScale}
        text2Props={noFontScale}
        text1Style={{
          fontSize: title.fontSize,
          lineHeight: title.lineHeight,
          fontFamily: titleFamily,
          color: colors.onPrimaryContainer,
        }}
        text2Style={{
          fontSize: body.fontSize,
          lineHeight: body.lineHeight,
          fontFamily: bodyFamily,
          color: colors.ink,
        }}
        text2NumberOfLines={4}
      />
    ),
  };
}

/** Mount once at the app root so every screen can show an API toast. */
export function ApiResponseToast() {
  const { language } = useLocalization();
  return <Toast config={buildToastConfig(language)} />;
}
