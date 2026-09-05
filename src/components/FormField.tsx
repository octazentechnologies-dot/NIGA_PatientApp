import { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type KeyboardTypeOptions,
} from 'react-native';

import type { AppLanguage } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { layout, spacing } from '../theme/spacing';
import { fontFamilyFor } from '../utilities/fonts';
import { scaleFont } from '../utilities/scale';
import { AppText } from './AppText';

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  language: AppLanguage;
  hint?: string;
  hintIcon?: ReactNode;
  rightIcon?: ReactNode;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'tel' | 'name' | 'off' | 'postal-code' | 'street-address';
  onChangeText?: (value: string) => void;
  onPress?: () => void;
};

export function FormField({
  label,
  value,
  placeholder,
  language,
  hint,
  hintIcon,
  rightIcon,
  keyboardType,
  maxLength,
  multiline = false,
  autoCapitalize,
  autoComplete,
  onChangeText,
  onPress,
}: FormFieldProps) {
  useWindowDimensions();
  const input = (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.outline}
      keyboardType={keyboardType}
      maxLength={maxLength}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      textAlignVertical={multiline ? 'top' : 'center'}
      editable={!onPress}
      pointerEvents={onPress ? 'none' : 'auto'}
      style={[
        styles.input,
        {
          fontFamily: fontFamilyFor('400', language, 'sans'),
          fontSize: scaleFont(15),
          lineHeight: scaleFont(22),
        },
        rightIcon ? styles.inputWithIcon : null,
        multiline ? styles.multiline : null,
      ]}
    />
  );

  return (
    <View style={styles.wrap}>
      <AppText variant="labelSm" color={colors.onSurface}>
        {label}
      </AppText>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          {input}
          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </Pressable>
      ) : (
        <View>
          {input}
          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </View>
      )}
      {hint ? (
        <View style={styles.hintRow}>
          {hintIcon}
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            style={styles.hint}
          >
            {hint}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    minHeight: layout.buttonHeight,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  multiline: {
    minHeight: 96,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  rightIcon: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  hint: {
    flex: 1,
  },
});
