import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_CONFIG } from '../../../config/apiConfig';
import { prepareAuthHeaders } from '../prepareAuthHeaders';

/** devapi1. Endpoints are added only when a contract is provided. */
export const legacyBaseApi = createApi({
  reducerPath: 'legacyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.legacy.baseUrl,
    prepareHeaders: prepareAuthHeaders,
  }),
  endpoints: () => ({}),
});
