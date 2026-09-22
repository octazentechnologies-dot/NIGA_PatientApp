import { useEffect } from 'react';

import {
  attachNotificationListeners,
  registerAuthenticatedDeviceForPush,
  setNotificationNavigationHandlers,
  unregisterAuthenticatedDevicePush,
} from '../services/notifications';
import type { NotificationNavigationHandlers } from '../services/notifications';

type Options = {
  /** True when the user has completed auth and is on the home shell. */
  authenticated: boolean;
  navigation: NotificationNavigationHandlers | null;
};

/**
 * Root-level push lifecycle: listeners once, register when authenticated,
 * unregister when leaving authenticated session (logout / unmount).
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
    void registerAuthenticatedDeviceForPush();
    return () => {
      void unregisterAuthenticatedDevicePush();
    };
  }, [authenticated]);
}
