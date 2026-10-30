import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  attachNotificationListeners,
  registerAuthenticatedDeviceForPush,
  requestNotificationInboxRefresh,
  setNotificationInboxRefreshHandler,
  setNotificationNavigationHandlers,
} from '../services/notifications';
import type { NotificationNavigationHandlers } from '../services/notifications';

type Options = {
  /** True when the user has completed auth and is on the home shell. */
  authenticated: boolean;
  navigation: NotificationNavigationHandlers | null;
  /**
   * Invalidate/refetch Notifications inbox + unread count.
   * - callback — register while authenticated
   * - `null` — clear
   * - omit / `undefined` — do not touch
   */
  onInboxRefresh?: (() => void) | null;
};

/**
 * Root-level push lifecycle: listeners once, register when authenticated,
 * refresh inbox on push receive/tap + AppState foreground.
 * Unregister is handled by `performLogout` (Device/Unregister + Account/Logout).
 */
export function usePushNotificationLifecycle({
  authenticated,
  navigation,
  onInboxRefresh,
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
    if (onInboxRefresh === undefined) {
      return;
    }
    setNotificationInboxRefreshHandler(onInboxRefresh);
    return () => {
      if (onInboxRefresh != null) {
        setNotificationInboxRefreshHandler(null);
      }
    };
  }, [onInboxRefresh]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        // Background delivers may skip the receive listener until resume.
        requestNotificationInboxRefresh('app-foreground');
      }
    };

    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      sub.remove();
    };
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }
    // Register when session is live. Unregister only via performLogout
    // (Account/Logout clears all tokens; Device/Unregister is optional).
    void registerAuthenticatedDeviceForPush();
  }, [authenticated]);
}
