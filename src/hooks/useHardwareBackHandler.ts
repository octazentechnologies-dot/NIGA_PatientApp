import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android system back / gesture. Return `true` to consume the event
 * (navigate back in-app); `false` to allow default (usually exit app).
 *
 * Subscriptions run newest-first, so a focused screen can override a parent.
 */
export function useHardwareBackHandler(
  handler: (() => boolean) | null | undefined,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled || !handler) {
      return undefined;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [handler, enabled]);
}
