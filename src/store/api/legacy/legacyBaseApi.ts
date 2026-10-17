import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_CONFIG } from '../../../config/apiConfig';
import { prepareAuthHeaders } from '../prepareAuthHeaders';

/** Same origin as newBaseApi (devapi.homeocentrum.com). Endpoints only when contracted. */
export const legacyBaseApi = createApi({
  reducerPath: 'legacyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.legacy.baseUrl,
    prepareHeaders: prepareAuthHeaders,
  }),
  endpoints: () => ({}),
});
