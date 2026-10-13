import { newBaseApi } from './newBaseApi';

export type PrivacyConsentStatusData = {
  required: boolean;
  granted: boolean;
  status: string; // 'Valid' | 'None' | 'Withdrawn' | 'NoticeChanged' | 'GuardianRequired' | 'MajorityReached'
  patientId: number;
  isMinor: boolean;
  guardianRequired: boolean;
  reconsentRequired: boolean;
  grantedForMinor: boolean;
  guardianName: string | null;
  consentRecordId: number | null;
  grantedAt: string | null;
  withdrawnAt: string | null;
  grantedNoticeVersion: string | null;
  currentNoticeVersion: string | null;
  missingType?: boolean;
};

export type PrivacyStatusResponse = {
  success: boolean;
  data: PrivacyConsentStatusData;
};

export type ConsentNoticeData = {
  consentNoticeId: number;
  consentTypeCode: string;
  version: string;
  language: string;
  title: string;
  body: string;
  bodySha256: string;
  effectiveFrom: string;
  requiresReconsent: boolean;
  isCurrent: boolean;
};

export type ConsentNoticeResponse = {
  success: boolean;
  data: ConsentNoticeData;
};

export type GrantPrivacyRequest = {
  noticeVersion?: string;
  noticeLanguage?: string;
};

export type GrantPrivacyData = {
  consentRecordId: number;
  consentTypeCode: string;
  consentTypeName: string | null;
  subjectType: string;
  subjectId: number;
  grantedAt: string;
  withdrawnAt: string | null;
  isActive: boolean;
  noticeVersion: string;
  noticeLanguage: string;
  alreadyGranted?: boolean;
};

export type GrantPrivacyResponse = {
  success: boolean;
  data: GrantPrivacyData;
};

/**
 * Privacy Consent Gate Endpoints:
 * - D1: GET /api/Consent/PrivacyStatus
 * - D1b: GET /api/Consent/Notice/{consentTypeCode}
 * - D2: POST /api/Consent/GrantPrivacy
 */
export const privacyConsentApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getPrivacyStatus: build.query<PrivacyStatusResponse, { patientId?: number } | void>({
      query: (params) => ({
        url: 'api/Consent/PrivacyStatus',
        params: params?.patientId ? { patientId: params.patientId } : undefined,
      }),
      providesTags: ['Consents'],
    }),
    getConsentNotice: build.query<ConsentNoticeResponse, { consentTypeCode: string; language?: string }>({
      query: ({ consentTypeCode, language = 'en' }) => ({
        url: `api/Consent/Notice/${consentTypeCode}`,
        params: { language },
      }),
    }),
    grantPrivacyConsent: build.mutation<GrantPrivacyResponse, GrantPrivacyRequest | void>({
      query: (body) => ({
        url: 'api/Consent/GrantPrivacy',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: ['Consents'],
    }),
  }),
});

export const {
  useGetPrivacyStatusQuery,
  useGetConsentNoticeQuery,
  useGrantPrivacyConsentMutation,
} = privacyConsentApi;
