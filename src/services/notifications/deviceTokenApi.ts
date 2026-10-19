import { devicesApi } from '../../store/api/new/devicesApi';
import { store } from '../../store';
import {
  getAccessToken,
  getAuthUserData,
  getDevicePushTokenId,
  getNativePushToken,
  saveDevicePushTokenId,
  saveNativePushToken,
  deleteDevicePushTokenId,
  deleteNativePushToken,
} from '../secureStorage';
import { getOrCreateDeviceId, resolveDeviceType } from './deviceId';
import { logNotifications, maskPushToken } from './log';

type AuthUserForPush = {
  userId?: number;
};

export type RegisterDeviceTokenOptions = {
  /** Prefer when JWT was just saved and Redux may lag. */
  accessToken?: string;
  /** Prefer when userId is known from VerifyOtp / CreatePatient response. */
  userId?: number;
};

const MIN_TOKEN_LEN = 8;
const MAX_TOKEN_LEN = 512;

/**
 * POST /api/Device/Register — FCM-Mobile-API.md
 * Body: { token, userId?, deviceType, deviceId }
 */
export async function registerDeviceToken(
  pushToken: string,
  options?: RegisterDeviceTokenOptions,
): Promise<boolean> {
  const token = pushToken.trim();
  if (token.length < MIN_TOKEN_LEN || token.length > MAX_TOKEN_LEN) {
    logNotifications('Device registration skipped — invalid token length');
    return false;
  }

  const accessToken = options?.accessToken ?? (await getAccessToken());
  if (!accessToken) {
    logNotifications('Device registration skipped — no access token');
    return false;
  }

  let userId = options?.userId;
  if (userId == null) {
    const saved = await getAuthUserData<AuthUserForPush>();
    if (typeof saved?.userId === 'number' && Number.isFinite(saved.userId)) {
      userId = saved.userId;
    } else {
      const fromStore = store.getState().auth.userId;
      if (typeof fromStore === 'number' && Number.isFinite(fromStore)) {
        userId = fromStore;
      }
    }
  }

  const deviceId = await getOrCreateDeviceId();
  const deviceType = resolveDeviceType();

  try {
    const result = await store
      .dispatch(
        devicesApi.endpoints.registerDevice.initiate({
          token,
          userId,
          deviceType,
          deviceId,
        }),
      )
      .unwrap();

    if (result?.success === false) {
      logNotifications(
        'Device registration rejected',
        result.message ?? 'success=false',
      );
      return false;
    }

    const pushId = result?.data?.devicePushTokenId;
    if (typeof pushId === 'number' && Number.isFinite(pushId)) {
      await saveDevicePushTokenId(pushId);
    }
    await saveNativePushToken(token);

    logNotifications('Device registered via New API', maskPushToken(token));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    logNotifications('Device registration failed', message);
    return false;
  }
}

/**
 * POST /api/Device/Unregister — by devicePushTokenId (preferred) or token.
 * @see FCM-Mobile-API.md §3
 */
export async function unregisterDeviceToken(
  pushToken?: string,
): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    logNotifications('Device unregister skipped — no access token');
    await deleteDevicePushTokenId();
    await deleteNativePushToken();
    return false;
  }

  const storedId = await getDevicePushTokenId();
  const token =
    pushToken?.trim() || (await getNativePushToken())?.trim() || null;

  if (storedId == null && !token) {
    return true;
  }

  try {
    const body =
      storedId != null
        ? { devicePushTokenId: storedId }
        : { token: token as string };

    await store
      .dispatch(devicesApi.endpoints.unregisterDevice.initiate(body))
      .unwrap();
    logNotifications(
      'Device unregistered via New API',
      storedId != null ? `id=${storedId}` : maskPushToken(token ?? ''),
    );
    await deleteDevicePushTokenId();
    await deleteNativePushToken();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    logNotifications('Device unregister failed', message);
    await deleteDevicePushTokenId();
    await deleteNativePushToken();
    return false;
  }
}
