import { newBaseApi } from './newBaseApi';

export type ConsentItem = {
  consentTypeId: number;
  code: string;
  title: string;
  description: string;
  consentRecordId: number | null;
  granted: boolean;
  grantedAt: string | null;
  withdrawnAt: string | null;
  manageLink: string | null;
};

export type GetConsentsResponse = {
  success: boolean;
  data: ConsentItem[];
};

export type GrantConsentResponse = {
  success: boolean;
  data: {
    consentRecordId: number;
    grantedAt: string;
  };
};

export type WithdrawConsentResponse = {
  success: boolean;
  message: string;
};

export type DataRequestPayload = {
  requestType: 'EXPORT' | 'DELETE' | string;
};

export type DataRequestResponse = {
  success: boolean;
  message?: string;
  data?: {
    type: string;
    status: string;
  };
};

export type DataRequestHistoryItem = {
  dataRequestId?: number;
  type?: string;
  requestType?: string;
  status: string;
  createdAt?: string | null;
  completedAt?: string | null;
};

export type DataRequestsListResponse = {
  success: boolean;
  data: DataRequestHistoryItem[];
};

/**
 * Consent Screen APIs:
 * - D3: GET api/Patient/Consents
 * - D4: POST api/Patient/Consents/Types/{consentTypeId}/Grant
 * - D5: POST api/Patient/Consents/{consentRecordId}/Withdraw
 * - D6: POST api/Patient/DataRequests
 * - BE-018: GET api/Patient/DataRequests
 * Caregiver: use Caregiver/Grant — never Grant consent when Code == "Caregiver".
 */
export const consentApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getConsents: build.query<ConsentItem[], void>({
      query: () => 'api/Patient/Consents',
      transformResponse: (response: GetConsentsResponse) => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ consentTypeId }) => ({
                type: 'Consents' as const,
                id: consentTypeId,
              })),
              { type: 'Consents', id: 'LIST' },
            ]
          : [{ type: 'Consents', id: 'LIST' }],
    }),
    grantConsent: build.mutation<GrantConsentResponse, number>({
      query: (consentTypeId) => ({
        url: `api/Patient/Consents/Types/${consentTypeId}/Grant`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Consents', id: 'LIST' }],
    }),
    withdrawConsent: build.mutation<WithdrawConsentResponse, number>({
      query: (consentRecordId) => ({
        url: `api/Patient/Consents/${consentRecordId}/Withdraw`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Consents', id: 'LIST' }],
    }),
    getDataRequests: build.query<DataRequestHistoryItem[], void>({
      query: () => 'api/Patient/DataRequests',
      transformResponse: (
        response: DataRequestsListResponse | DataRequestHistoryItem[],
      ) => {
        if (Array.isArray(response)) {
          return response;
        }
        return Array.isArray(response?.data) ? response.data : [];
      },
      providesTags: ['DataRequests'],
    }),
    createDataRequest: build.mutation<DataRequestResponse, DataRequestPayload>({
      query: (body) => ({
        url: 'api/Patient/DataRequests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DataRequests'],
    }),
  }),
});

export const {
  useGetConsentsQuery,
  useGrantConsentMutation,
  useWithdrawConsentMutation,
  useGetDataRequestsQuery,
  useCreateDataRequestMutation,
} = consentApi;
