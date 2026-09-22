import { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import type { AppLanguage } from '../localization/types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { fontFamilyFor } from '../utilities/fonts';
import { AppText } from './AppText';

const OTP_LENGTH = 6;

type OtpCodeFieldProps = {
  value: string;
  language: AppLanguage;
  autoFocus?: boolean;
  accessibilityLabel: string;
  onChange: (value: string) => void;
};

export function OtpCodeField({
  value,
  language,
  autoFocus = false,
  accessibilityLabel,
  onChange,
}: OtpCodeFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const boxSize = Math.min(48, Math.floor((width - 80) / OTP_LENGTH - 8));

  useEffect(() => {
    if (!autoFocus) {
      inputRef.current?.blur();
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 360);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.wrap}>
      <View style={styles.row} pointerEvents="none">
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const digit = value[index] ?? '';
          const isActive = autoFocus && index === Math.min(value.length, OTP_LENGTH - 1);
          return (
            <View
              key={index}
              style={[
                styles.box,
                { width: boxSize, height: Math.max(56, boxSize + 8) },
                isActive && styles.boxActive,
              ]}
            >
              <AppText
                variant="titleMd"
                languageOverride="en"
                color="#000000"
              >
                {digit}
              </AppText>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        caretHidden
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.hiddenInput,
          { fontFamily: fontFamilyFor('600', language, 'sans') },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: colors.onSurface,
  },
});
