import { newBaseApi } from './newBaseApi';

export type DeviceType = 'Android' | 'iOS' | 'Website';

/**
 * FCM register body — POST /api/Device/Register
 * @see docs/backend/FCM-Mobile-API.md
 */
export type RegisterDeviceRequest = {
  token: string;
  userId?: number;
  deviceType: DeviceType;
  deviceId: string;
};

export type RegisterDeviceResponse = {
  success: boolean;
  data?: {
    devicePushTokenId: number;
    userId: number;
    deviceType: string;
    deviceId: string;
    updatedAt: string;
  };
  message?: string;
};

/** Alias body — same as RegisterDeviceRequest (POST /api/Devices/Register). */
export type RegisterDevicesRequest = RegisterDeviceRequest;
export type RegisterDevicesResponse = RegisterDeviceResponse;

/** Prefer devicePushTokenId when known; otherwise token. */
export type UnregisterDeviceRequest =
  | { devicePushTokenId: number; token?: never }
  | { token: string; devicePushTokenId?: never };

export type UnregisterDeviceResponse = {
  success: boolean;
  message?: string;
};

/**
 * Push Device Registration Endpoints (docs/backend/FCM-Mobile-API.md):
 * - POST /api/Device/Register (preferred)
 * - POST /api/Devices/Register (alias)
 * - POST /api/Device/Unregister
 *
 * Patient contract uses deviceType Android|iOS|Website — not Doctor BE-016 FCM|APNs.
 */
export const devicesApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    registerDevice: build.mutation<RegisterDeviceResponse, RegisterDeviceRequest>({
      query: (body) => ({
        url: 'api/Device/Register',
        method: 'POST',
        body,
      }),
    }),
    registerDevices: build.mutation<RegisterDevicesResponse, RegisterDevicesRequest>({
      query: (body) => ({
        url: 'api/Devices/Register',
        method: 'POST',
        body,
      }),
    }),
    unregisterDevice: build.mutation<UnregisterDeviceResponse, UnregisterDeviceRequest>({
      query: (body) => ({
        url: 'api/Device/Unregister',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useRegisterDeviceMutation,
  useRegisterDevicesMutation,
  useUnregisterDeviceMutation,
} = devicesApi;
