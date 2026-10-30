import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ensureAndroidNotificationChannels } from './channels';
import {
  registerDeviceToken,
  unregisterDeviceToken,
  type RegisterDeviceTokenOptions,
} from './deviceTokenApi';
import { logNotifications, maskPushToken } from './log';
import {
  parseNotificationPayload,
  queueOrDispatchNotificationNavigation,
  requestNotificationInboxRefresh,
} from './notificationNavigation';
import type { PushPlatform, PushRegistrationResult } from './types';
import type { NotificationListenerCleanup } from './notificationService';

let handlerConfigured = false;
let lastRegisteredToken: string | null = null;
let registrationInFlight: Promise<PushRegistrationResult> | null = null;

const MIN_TOKEN_LEN = 8;
const MAX_TOKEN_LEN = 512;

function currentPlatform(): PushPlatform {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export function configureForegroundNotificationHandler(): void {
  if (handlerConfigured) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerConfigured = true;
  logNotifications('Foreground handler configured');
}

/**
 * Permission + channels + **native** FCM/APNs token (not Expo push token).
 * Backend FCM sender cannot deliver to `ExponentPushToken[…]`.
 */
export async function obtainNativeDevicePushToken(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      status: 'unavailable',
      reason: 'Push notifications are not supported on web',
    };
  }

  if (!Device.isDevice) {
    logNotifications('Simulator/emulator — push token unavailable');
    return {
      ok: false,
      status: 'unavailable',
      reason: 'Physical device required for push notifications',
    };
  }

  try {
    await ensureAndroidNotificationChannels();

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') {
      logNotifications('Permission denied');
      return {
        ok: false,
        status: 'denied',
        reason: 'Notification permission denied',
      };
    }

    logNotifications('Permission granted — requesting native device push token');
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const pushToken =
      typeof tokenResponse.data === 'string'
        ? tokenResponse.data.trim()
        : String(tokenResponse.data ?? '').trim();

    if (!pushToken || pushToken.length < MIN_TOKEN_LEN) {
      return {
        ok: false,
        status: 'error',
        reason: 'Native push token missing or too short',
      };
    }

    if (pushToken.length > MAX_TOKEN_LEN) {
      return {
        ok: false,
        status: 'error',
        reason: 'Native push token exceeds 512 characters',
      };
    }

    if (pushToken.startsWith('ExponentPushToken')) {
      return {
        ok: false,
        status: 'error',
        reason: 'Received Expo push token; native FCM/APNs token required',
      };
    }

    logNotifications('Native push token obtained', maskPushToken(pushToken));

    return {
      ok: true,
      status: 'granted',
      pushToken,
      platform: currentPlatform(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token error';
    logNotifications('Native token generation failed', message);
    return {
      ok: false,
      status: 'error',
      reason: message,
    };
  }
}

/** @deprecated Prefer obtainNativeDevicePushToken — kept for call-site compatibility. */
export async function obtainExpoPushToken(): Promise<PushRegistrationResult> {
  return obtainNativeDevicePushToken();
}

export async function registerAuthenticatedDeviceForPush(
  options?: RegisterDeviceTokenOptions,
): Promise<PushRegistrationResult> {
  if (registrationInFlight) {
    return registrationInFlight;
  }

  registrationInFlight = (async () => {
    logNotifications('Starting authenticated push registration');
    const result = await obtainNativeDevicePushToken();
    if (!result.ok || !result.pushToken) {
      logNotifications(
        'Push registration skipped',
        result.reason ?? result.status,
      );
      return result;
    }

    if (lastRegisteredToken === result.pushToken) {
      logNotifications('Token already registered this session');
      return result;
    }

    const registered = await registerDeviceToken(result.pushToken, options);
    if (registered) {
      lastRegisteredToken = result.pushToken;
      logNotifications('Backend Device/Register complete');
    } else {
      logNotifications('Backend Device/Register failed');
    }
    return result;
  })();

  try {
    return await registrationInFlight;
  } finally {
    registrationInFlight = null;
  }
}

export async function unregisterAuthenticatedDevicePush(): Promise<void> {
  // Prefer in-memory token; deviceTokenApi also reads SecureStore id/token.
  const token = lastRegisteredToken ?? undefined;
  await unregisterDeviceToken(token);
  lastRegisteredToken = null;
}

export function getLastRegisteredPushToken(): string | null {
  return lastRegisteredToken;
}

export function attachNotificationListeners(): NotificationListenerCleanup {
  const received = Notifications.addNotificationReceivedListener((notification) => {
    const data = parseNotificationPayload(notification);
    logNotifications('Notification received', data?.type ?? 'untyped');
    // OS push ≠ inbox row; refetch so bell + Notifications list stay current.
    requestNotificationInboxRefresh('notification-received');
  });

  const response = Notifications.addNotificationResponseReceivedListener(
    (event) => {
      const data = parseNotificationPayload(event.notification);
      logNotifications('Notification tapped', data?.type ?? 'untyped');
      requestNotificationInboxRefresh('notification-tapped');
      if (data) {
        queueOrDispatchNotificationNavigation(data);
      }
    },
  );

  const tokenSub = Notifications.addPushTokenListener((token) => {
    const value = typeof token?.data === 'string' ? token.data.trim() : '';
    if (!value) return;
    logNotifications('Native push token refreshed');
    lastRegisteredToken = null;
    void registerAuthenticatedDeviceForPush().then((result) => {
      if (!result.ok) {
        logNotifications(
          'Token-refresh re-register failed',
          result.reason ?? result.status,
        );
      }
    });
  });

  try {
    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) {
      const data = parseNotificationPayload(last.notification);
      requestNotificationInboxRefresh('cold-start-response');
      if (data) {
        logNotifications('Cold-start notification response', data.type);
        queueOrDispatchNotificationNavigation(data);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'cold-start error';
    logNotifications('Cold-start response check failed', message);
  }

  return () => {
    received.remove();
    response.remove();
    tokenSub.remove();
  };
}
