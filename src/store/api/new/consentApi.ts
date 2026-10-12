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

/**
 * Consent Screen APIs:
 * - GET api/Patient/Consents
 * - POST api/Patient/Consents/Types/{consentTypeId}/Grant
 * - POST api/Patient/Consents/{consentRecordId}/Withdraw
 * Base: newBaseApi (devapi2). Auth required (Bearer Token via prepareAuthHeaders).
 */
export const consentApi = newBaseApi.injectEndpoints({
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
  }),
});

export const {
  useGetConsentsQuery,
  useGrantConsentMutation,
  useWithdrawConsentMutation,
} = consentApi;
