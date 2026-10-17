import { newBaseApi } from './newBaseApi';

/**
 * §1 App config — no token required.
 * `GET /api/Public/AppConfig`
 */
export type AppConfigData = {
  razorpayKeyId: string | null;
  siteUrl: string | null;
  supportPhone: string | null;
  supportWhatsApp: string | null;
  supportEmail: string | null;
};

export type AppConfigResponse = {
  success: boolean;
  data: AppConfigData;
};

export const appConfigApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAppConfig: build.query<AppConfigData, void>({
      query: () => 'api/Public/AppConfig',
      transformResponse: (response: AppConfigResponse | AppConfigData) => {
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          response.data
        ) {
          return response.data;
        }
        return response as AppConfigData;
      },
      providesTags: ['AppConfig'],
    }),
  }),
});

export const { useGetAppConfigQuery, useLazyGetAppConfigQuery } = appConfigApi;
