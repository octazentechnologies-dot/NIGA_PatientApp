import { Platform } from 'react-native';

import { apiRequest } from '../api/client';
import { logNotifications, maskPushToken } from './log';
import type {
  PushPlatform,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  UnregisterDeviceRequest,
} from './types';

/**
 * Backend contract (base URL already includes `/api`):
 *   POST   notifications/register-device
 *   DELETE notifications/unregister-device
 *
 * Backend work still pending — calls fail soft so login/home still work.
 */

function platform(): PushPlatform {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export async function registerDeviceToken(
  pushToken: string,
  authHeaders?: Record<string, string>,
): Promise<boolean> {
  const body: RegisterDeviceRequest = {
    pushToken,
    platform: platform(),
  };

  try {
    await apiRequest<RegisterDeviceResponse>('notifications/register-device', {
      method: 'POST',
      body,
      headers: authHeaders,
    });
    logNotifications('Device registered', maskPushToken(pushToken));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    logNotifications('Device registration failed', message);
    return false;
  }
}

export async function unregisterDeviceToken(
  pushToken: string,
  authHeaders?: Record<string, string>,
): Promise<boolean> {
  const body: UnregisterDeviceRequest = {
    pushToken,
    platform: platform(),
  };

  try {
    await apiRequest<unknown>('notifications/unregister-device', {
      method: 'DELETE',
      body,
      headers: authHeaders,
    });
    logNotifications('Device unregistered', maskPushToken(pushToken));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    logNotifications('Device unregister failed (backend may be pending)', message);
    return false;
  }
}
