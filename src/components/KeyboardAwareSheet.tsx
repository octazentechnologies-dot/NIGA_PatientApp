import {
  type PropsWithChildren,
  type ReactNode,
  useMemo,
} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { sheetBottomPadding } from '../utilities/sheetInset';
import { useKeyboardHeight } from '../utilities/useKeyboardHeight';

type Props = PropsWithChildren<{
  /** Called when the dimmed backdrop is pressed. */
  onDismiss?: () => void;
  /**
   * Max fraction of the window the sheet may occupy when the keyboard is closed.
   * Default 0.5 (half screen). Use ~0.92 for tall filter / form sheets.
   */
  maxHeightFraction?: number;
  /** Extra bottom padding inside the sheet (before keyboard offset). */
  bottomPad?: number;
  /** Optional styles on the white sheet card. */
  style?: StyleProp<ViewStyle>;
  /** When false, tapping the backdrop does nothing. */
  dismissOnBackdrop?: boolean;
  /** Rendered above the sheet list (title row, search, etc. stay pinned). */
  header?: ReactNode;
}>;

/**
 * Bottom sheet body that stays above the soft keyboard inside RN Modal.
 * Uses keyboard height margin on both platforms (Modal ignores window resize).
 */
export function KeyboardAwareSheet({
  children,
  onDismiss,
  maxHeightFraction = 0.5,
  bottomPad = spacing.md,
  style,
  dismissOnBackdrop = true,
  header,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const windowHeight = Dimensions.get('window').height;

  const sheetMaxHeight = useMemo(() => {
    const closedCap = Math.round(windowHeight * maxHeightFraction);
    if (keyboardHeight <= 0) {
      return closedCap;
    }
    // Leave a little room above the keyboard so the sheet never clips the status bar.
    const openCap = Math.max(
      220,
      windowHeight - keyboardHeight - Math.max(insets.top, spacing.md),
    );
    return Math.min(closedCap, openCap);
  }, [insets.top, keyboardHeight, maxHeightFraction, windowHeight]);

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.scrim}
        onPress={dismissOnBackdrop ? onDismiss : undefined}
        accessibilityRole={dismissOnBackdrop ? 'button' : undefined}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoid}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              height: sheetMaxHeight,
              marginBottom: keyboardHeight > 0 ? keyboardHeight : 0,
              paddingBottom: sheetBottomPadding(insets, bottomPad),
            },
            style,
          ]}
        >
          <View style={styles.handle} />
          {header}
          <View style={styles.body}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  avoid: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.xs,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
});
