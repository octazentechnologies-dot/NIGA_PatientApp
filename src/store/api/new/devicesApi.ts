import { newBaseApi } from './newBaseApi';

export type RegisterDevicesRequest = {
  platform: 'android' | 'ios' | 'web';
  token: string;
};

export type RegisterDevicesResponse = {
  success: boolean;
  platform?: string;
  message?: string;
};

export type RegisterDeviceRequest = {
  platform: 'FCM' | 'APNs';
  token: string;
  deviceId?: string;
};

export type RegisterDeviceResponse = {
  success: boolean;
  data?: {
    devicePushTokenId: number;
    platform: string;
    deviceId: string;
    updatedAt: string;
  };
  message?: string;
};

export type UnregisterDeviceRequest = {
  token: string;
};

export type UnregisterDeviceResponse = {
  success: boolean;
  message?: string;
};

/**
 * Push Device Registration Endpoints:
 * - M1: POST /api/Devices/Register (used by push sender)
 * - M2: POST /api/Device/Register (device registry)
 * - M3: POST /api/Device/Unregister (device unregister)
 */
export const devicesApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    registerDevices: build.mutation<RegisterDevicesResponse, RegisterDevicesRequest>({
      query: (body) => ({
        url: 'api/Devices/Register',
        method: 'POST',
        body,
      }),
    }),
    registerDevice: build.mutation<RegisterDeviceResponse, RegisterDeviceRequest>({
      query: (body) => ({
        url: 'api/Device/Register',
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
  useRegisterDevicesMutation,
  useRegisterDeviceMutation,
  useUnregisterDeviceMutation,
} = devicesApi;
