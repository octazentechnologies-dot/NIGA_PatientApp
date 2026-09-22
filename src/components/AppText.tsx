import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Text, type TextProps, type TextStyle, useWindowDimensions } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage } from '../localization/types';
import { fontFamilyFor, fontRoleFor, type FontWeightToken } from '../utilities/fonts';
import { toUiLabel } from '../utilities/textCase';
import { colors } from '../theme/colors';
import { typography, weightTokenFor, type TypographyVariant } from '../theme/typography';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
  languageOverride?: AppLanguage;
  weightOverride?: FontWeightToken;
  /** Skip Title Case (body copy, legal, dynamic values). */
  raw?: boolean;
};

const TITLE_CASE_VARIANTS: ReadonlySet<TypographyVariant> = new Set([
  'displayLg',
  'headlineLg',
  'headlineMd',
  'titleMd',
  'labelLg',
  'labelMd',
  'labelSm',
]);

function titleCaseChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return toUiLabel(String(child));
    }
    if (isValidElement(child)) {
      const element = child as ReactElement<{ children?: ReactNode }>;
      if (element.props.children == null) {
        return child;
      }
      return cloneElement(element, {
        children: titleCaseChildren(element.props.children),
      });
    }
    return child;
  });
}

export function AppText({
  variant = 'bodyMd',
  color = colors.onSurface,
  languageOverride,
  weightOverride,
  raw = false,
  style,
  children,
  ...props
}: AppTextProps) {
  useWindowDimensions();
  const { language } = useLocalization();
  const locale = languageOverride ?? language;
  const token = typography(variant, locale);
  const { fontWeight: _ignoredWeight, ...tokenWithoutWeight } = token;
  const fontStyle: TextStyle = {
    ...tokenWithoutWeight,
    color,
    fontFamily: fontFamilyFor(
      weightOverride ?? weightTokenFor(variant),
      locale,
      fontRoleFor(variant),
    ),
  };

  const content =
    !raw && TITLE_CASE_VARIANTS.has(variant)
      ? titleCaseChildren(children)
      : children;

  return (
    <Text
      {...props}
      allowFontScaling={props.allowFontScaling ?? true}
      style={[fontStyle, style]}
    >
      {content}
    </Text>
  );
}
