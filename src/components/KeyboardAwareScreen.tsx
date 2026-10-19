import { type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = PropsWithChildren<{
  /** Extra offset under a fixed header (iOS). */
  keyboardVerticalOffset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Disable scroll when the screen manages its own ScrollView. */
  scroll?: boolean;
}>;

/**
 * Full-screen form wrapper — keeps focused inputs above the keyboard.
 * Prefer this for Sign-in / OTP / profile / payment forms outside Modal.
 */
export function KeyboardAwareScreen({
  children,
  keyboardVerticalOffset = 0,
  contentContainerStyle,
  style,
  scroll = true,
}: Props) {
  const avoiding = (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {scroll ? (
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );

  return avoiding;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
