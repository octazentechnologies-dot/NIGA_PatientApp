import { isExpoGo } from './environment';
import { logNotifications } from './log';
import type { PushRegistrationResult } from './types';

export type NotificationListenerCleanup = () => void;

type NotificationServiceImpl = typeof import('./notificationService.impl');

function loadImpl(): NotificationServiceImpl | null {
  if (isExpoGo()) {
    return null;
  }
  // Lazy require so Expo Go never evaluates expo-notifications (SDK 53+
  // throws on Android when that module's auto-registration side effect runs).
  return require('./notificationService.impl') as NotificationServiceImpl;
}

/**
 * Call once at app startup (before UI mounts listeners).
 * No-op in Expo Go — remote push was removed from Expo Go on Android (SDK 53+).
 */
export function configureForegroundNotificationHandler(): void {
  const impl = loadImpl();
  if (!impl) {
    logNotifications('Skipping foreground handler — Expo Go');
    return;
  }
  impl.configureForegroundNotificationHandler();
}

export async function obtainExpoPushToken(): Promise<PushRegistrationResult> {
  const impl = loadImpl();
  if (!impl) {
    return {
      ok: false,
      status: 'unavailable',
      reason:
        'Push requires a development or preview build (not supported in Expo Go)',
    };
  }
  return impl.obtainExpoPushToken();
}

export async function registerAuthenticatedDeviceForPush(
  authHeaders?: Record<string, string>,
): Promise<PushRegistrationResult> {
  const impl = loadImpl();
  if (!impl) {
    return {
      ok: false,
      status: 'unavailable',
      reason:
        'Push requires a development or preview build (not supported in Expo Go)',
    };
  }
  return impl.registerAuthenticatedDeviceForPush(authHeaders);
}

export async function unregisterAuthenticatedDevicePush(
  authHeaders?: Record<string, string>,
): Promise<void> {
  const impl = loadImpl();
  if (!impl) {
    return;
  }
  await impl.unregisterAuthenticatedDevicePush(authHeaders);
}

export function getLastRegisteredPushToken(): string | null {
  const impl = loadImpl();
  return impl?.getLastRegisteredPushToken() ?? null;
}

export function attachNotificationListeners(): NotificationListenerCleanup {
  const impl = loadImpl();
  if (!impl) {
    logNotifications('Skipping listeners — Expo Go');
    return () => undefined;
  }
  return impl.attachNotificationListeners();
}
