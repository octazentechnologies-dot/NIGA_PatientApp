import { newBaseApi } from './newBaseApi';

export type RefreshTokenRequest = {
  token?: string;
};

export type RefreshTokenResponse = {
  success: boolean;
  message?: string;
  token?: string;
  expiresAt?: string;
  user?: {
    userId: number;
    userName: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    roleId?: number;
    doctorId?: number | null;
  };
};

export type LogoutResponse = {
  success: boolean;
  message?: string;
};

/**
 * Account API:
 * - POST /api/Account/RefreshToken (A3)
 * - POST /api/Account/Logout (A4)
 */
export const accountApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    refreshToken: build.mutation<RefreshTokenResponse, RefreshTokenRequest | void>({
      query: (body) => ({
        url: 'api/Account/RefreshToken',
        method: 'POST',
        body: body || {},
      }),
    }),
    logout: build.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'api/Account/Logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useRefreshTokenMutation, useLogoutMutation } = accountApi;
