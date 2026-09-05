import { useMemo, type PropsWithChildren } from 'react';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useKeyboardOpen } from '../utilities/useKeyboardOpen';

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
