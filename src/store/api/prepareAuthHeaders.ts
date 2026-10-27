import type { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getAccessToken } from '../../services/secureStorage';

type PrepareHeaders = NonNullable<
  NonNullable<Parameters<typeof fetchBaseQuery>[0]>['prepareHeaders']
>;

/**
 * Attaches a bearer token when one is already in SecureStore.
 * Allows opt-out when 'X-Anonymous' or 'X-Skip-Auth' header is explicitly passed
 * (e.g. for ConsultOrders with bookingToken when booking for family members).
 */
export const prepareAuthHeaders: PrepareHeaders = async (headers) => {
  if (headers.get('X-Anonymous') === 'true' || headers.has('X-Skip-Auth')) {
    headers.delete('X-Anonymous');
    headers.delete('X-Skip-Auth');
    headers.delete('Authorization');
    return headers;
  }
  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

