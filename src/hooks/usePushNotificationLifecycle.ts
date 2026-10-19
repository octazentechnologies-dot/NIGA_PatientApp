import { useEffect } from 'react';

import {
  attachNotificationListeners,
  registerAuthenticatedDeviceForPush,
  setNotificationNavigationHandlers,
} from '../services/notifications';
import type { NotificationNavigationHandlers } from '../services/notifications';

type Options = {
  /** True when the user has completed auth and is on the home shell. */
  authenticated: boolean;
  navigation: NotificationNavigationHandlers | null;
};

/**
 * Root-level push lifecycle: listeners once, register when authenticated.
 * Unregister is handled by `performLogout` (Device/Unregister + Account/Logout).
 */
export function usePushNotificationLifecycle({
  authenticated,
  navigation,
}: Options): void {
  useEffect(() => {
    const cleanup = attachNotificationListeners();
    return cleanup;
  }, []);

  useEffect(() => {
    setNotificationNavigationHandlers(navigation);
    return () => setNotificationNavigationHandlers(null);
  }, [navigation]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }
    // Register when session is live. Unregister only via performLogout
    // (Account/Logout clears all tokens; Device/Unregister is optional).
    void registerAuthenticatedDeviceForPush();
  }, [authenticated]);
}
