import { Platform } from 'react-native';

import { API_CONFIG } from '../../config/apiConfig';
import { getAccessToken } from '../secureStorage';
import { logNotifications, maskPushToken } from './log';

/**
 * Backend Push Notification Device Registry:
 * - M1: POST /api/Devices/Register { platform: 'android' | 'ios', token }
 * - M2: POST /api/Device/Register { platform: 'FCM' | 'APNs', token }
 * - M3: POST /api/Device/Unregister { token }
 * Auth: Bearer token (patient)
 */
export async function registerDeviceToken(
  pushToken: string,
  authHeaders?: Record<string, string>,
): Promise<boolean> {
  const token =
    authHeaders?.Authorization || authHeaders?.authorization
      ? undefined
      : await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = API_CONFIG.new.baseUrl.replace(/\/+$/, '');

  try {
    // M1: POST /api/Devices/Register
    const m1Platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await fetch(`${base}/api/Devices/Register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform: m1Platform, token: pushToken }),
    }).catch(() => undefined);

    // M2: POST /api/Device/Register
    const m2Platform = Platform.OS === 'ios' ? 'APNs' : 'FCM';
    await fetch(`${base}/api/Device/Register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform: m2Platform, token: pushToken }),
    }).catch(() => undefined);

    logNotifications('Device registered via New API', maskPushToken(pushToken));
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
  const token =
    authHeaders?.Authorization || authHeaders?.authorization
      ? undefined
      : await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = API_CONFIG.new.baseUrl.replace(/\/+$/, '');

  try {
    // M3: POST /api/Device/Unregister
    await fetch(`${base}/api/Device/Unregister`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token: pushToken }),
    }).catch(() => undefined);

    logNotifications('Device unregistered via New API', maskPushToken(pushToken));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    logNotifications('Device unregister failed', message);
    return false;
  }
}
