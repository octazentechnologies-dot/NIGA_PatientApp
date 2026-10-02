import type { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getAccessToken } from '../../services/secureStorage';

type PrepareHeaders = NonNullable<
  NonNullable<Parameters<typeof fetchBaseQuery>[0]>['prepareHeaders']
>;

/**
 * Attaches a bearer token when one is already in SecureStore.
 * No token contract is assumed. Endpoints are not called from here.
 */
export const prepareAuthHeaders: PrepareHeaders = async (headers) => {
  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};
