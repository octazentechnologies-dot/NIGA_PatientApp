import { Platform } from 'react-native';

import { getDeviceId, saveDeviceId } from '../secureStorage';
import type { DeviceType } from '../../store/api/new/devicesApi';

function createUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Stable per-install id so FCM token refresh updates the same DevicePushToken row.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getDeviceId();
  if (existing && existing.trim().length > 0) {
    return existing.trim();
  }
  const next = `${Platform.OS}-${createUuid()}`;
  await saveDeviceId(next);
  return next;
}

export function resolveDeviceType(): DeviceType {
  return Platform.OS === 'ios' ? 'iOS' : 'Android';
}
