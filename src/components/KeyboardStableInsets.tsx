import { useMemo, type PropsWithChildren } from 'react';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useKeyboardOpen } from '../utilities/useKeyboardOpen';

/**
 * When the keyboard is open, bottom inset is cleared so KeyboardAvoiding /
 * resize mode owns the bottom edge (avoids double gap above the keyboard).
 * When closed, pass through the real system bottom inset unchanged.
 */
export function KeyboardStableInsets({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOpen();
  const value = useMemo(
    () => ({
      ...insets,
      bottom: keyboardOpen ? 0 : insets.bottom,
    }),
    [insets, keyboardOpen],
  );

  return (
    <SafeAreaInsetsContext.Provider value={value}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}
