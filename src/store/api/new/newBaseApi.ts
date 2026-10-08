import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_CONFIG } from '../../../config/apiConfig';
import { prepareAuthHeaders } from '../prepareAuthHeaders';

/**
 * devapi2. Do not add endpoints in this file.
 * One screen, one file: `injectEndpoints` in `src/store/api/new/<screen>Api.ts`.
 * Import that file from `src/store/index.ts` so the cache is registered.
 */
export const newBaseApi = createApi({
  reducerPath: 'newApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.new.baseUrl,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['Consents', 'Doctors', 'Family', 'PatientProfile'],
  endpoints: () => ({}),
});
