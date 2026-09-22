import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ensureAndroidNotificationChannels } from './channels';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from './deviceTokenApi';
import { logNotifications } from './log';
import {
  parseNotificationPayload,
  queueOrDispatchNotificationNavigation,
} from './notificationNavigation';
import type { PushPlatform, PushRegistrationResult } from './types';
import type { NotificationListenerCleanup } from './notificationService';

let handlerConfigured = false;
let lastRegisteredToken: string | null = null;
let registrationInFlight: Promise<PushRegistrationResult> | null = null;

function resolveEasProjectId(): string | undefined {
  const fromExpoConfig = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof fromExpoConfig === 'string' && fromExpoConfig.length > 0) {
    return fromExpoConfig;
  }
  const fromEasConfig = Constants.easConfig?.projectId;
  if (typeof fromEasConfig === 'string' && fromEasConfig.length > 0) {
    return fromEasConfig;
  }
  return undefined;
}

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

export async function obtainExpoPushToken(): Promise<PushRegistrationResult> {
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

    logNotifications('Permission granted');

    const projectId = resolveEasProjectId();
    if (!projectId) {
      logNotifications('Missing EAS projectId');
      return {
        ok: false,
        status: 'missing_project_id',
        reason: 'EAS projectId missing from app config',
      };
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenResponse.data;
    logNotifications('Push token obtained', pushToken);

    return {
      ok: true,
      status: 'granted',
      pushToken,
      platform: currentPlatform(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token error';
    logNotifications('Token generation failed', message);
    return {
      ok: false,
      status: 'error',
      reason: message,
    };
  }
}

export async function registerAuthenticatedDeviceForPush(
  authHeaders?: Record<string, string>,
): Promise<PushRegistrationResult> {
  if (registrationInFlight) {
    return registrationInFlight;
  }

  registrationInFlight = (async () => {
    const result = await obtainExpoPushToken();
    if (!result.ok || !result.pushToken) {
      return result;
    }

    if (lastRegisteredToken === result.pushToken) {
      logNotifications('Token already registered this session');
      return result;
    }

    const registered = await registerDeviceToken(result.pushToken, authHeaders);
    if (registered) {
      lastRegisteredToken = result.pushToken;
    }
    return result;
  })();

  try {
    return await registrationInFlight;
  } finally {
    registrationInFlight = null;
  }
}

export async function unregisterAuthenticatedDevicePush(
  authHeaders?: Record<string, string>,
): Promise<void> {
  const token = lastRegisteredToken;
  if (!token) {
    return;
  }
  await unregisterDeviceToken(token, authHeaders);
  lastRegisteredToken = null;
}

export function getLastRegisteredPushToken(): string | null {
  return lastRegisteredToken;
}

export function attachNotificationListeners(): NotificationListenerCleanup {
  const received = Notifications.addNotificationReceivedListener((notification) => {
    const data = parseNotificationPayload(notification);
    logNotifications('Notification received', data?.type ?? 'untyped');
  });

  const response = Notifications.addNotificationResponseReceivedListener(
    (event) => {
      const data = parseNotificationPayload(event.notification);
      logNotifications('Notification tapped', data?.type ?? 'untyped');
      if (data) {
        queueOrDispatchNotificationNavigation(data);
      }
    },
  );

  try {
    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) {
      const data = parseNotificationPayload(last.notification);
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
  };
}
