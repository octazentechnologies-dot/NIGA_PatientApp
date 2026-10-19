import { useKeyboardHeight } from './useKeyboardHeight';

/** True while the soft keyboard is visible. */
export function useKeyboardOpen() {
  return useKeyboardHeight() > 0;
}
