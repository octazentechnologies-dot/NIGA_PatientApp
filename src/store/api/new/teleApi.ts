import { newBaseApi } from './newBaseApi';

export type InstantConsultRequest = {
  patientId?: number;
  contactName: string;
  contactMobile: string;
};

export type InstantConsultInitialResponse = {
  success: boolean;
  instantConsultRequestId: number;
  queuePosition: number;
  status: 'OPEN' | 'OFFERED' | 'NO_DOCTOR' | 'ACCEPTED' | 'CANCELLED';
  doctorId?: number;
  message?: string;
};

export type InstantConsultPollData = {
  instantConsultRequestId: number;
  status: 'OPEN' | 'NO_DOCTOR' | 'OFFERED' | 'ACCEPTED' | 'CANCELLED' | 'SEARCHING' | 'UNAVAILABLE' | string;
  queuePosition: number;
  contactName: string;
  createdAt: string;
  doctorId?: number;
  doctorName?: string;
  offerStatus?: string;
  offeredAt?: string;
  canCancel: boolean;
  message?: string;
  /** BE-011 — rupees from server; hide null; never invent platform fee. */
  consultFee?: number | null;
  currency?: string | null;
  platformFee?: number | null;
  totalPayable?: number | null;
};

export type GetInstantConsultStatusResponse = {
  success: boolean;
  data: InstantConsultPollData;
};

export type CancelInstantConsultResponse = {
  success: boolean;
  instantConsultRequestId: number;
  status: 'CANCELLED';
  message: string;
};

export type DeviceCheckResponse = {
  success: boolean;
  camera: string;
  microphone: string;
  speaker: string;
  connection: string;
  vendor: string;
};

export type TeleSessionData = {
  teleSessionId: number;
  patientAppId: number;
  doctorId: number;
  patientId: number;
  roomId: string;
  status: 'Waiting' | 'Active' | 'Ended';
  recordAllowed: boolean;
};

export type GetTeleSessionResponse = {
  success: boolean;
  data: TeleSessionData;
};

export type TeleTokenResponse = {
  success: boolean;
  vendor: string;
  isStub: boolean;
  clients: string[];
  teleSessionId: number;
  roomId: string;
  token: string;
  expiresAt: string;
  clientConfig: Record<string, string>;
  recordAllowed: boolean;
  status: string;
};

export type JoinFailureRequest = {
  code:
    | 'DEVICE_DENIED'
    | 'NETWORK_ERROR'
    | 'TOKEN_FAILED'
    | 'VENDOR_ERROR'
    | 'BROWSER_UNSUPPORTED'
    | 'JOIN_FAILED'
    | string;
};

export type JoinFailureResponse = {
  success: boolean;
  code: string;
  message: string;
  retry: boolean;
  rejoin: boolean;
  supportPath?: string;
  allowedCodes?: string[];
};

export type RecordingConsentRequest = {
  teleSessionId: number;
  accepted: boolean;
};

export type RecordingConsentResponse = {
  success: boolean;
  teleSessionId: number;
  accepted: boolean;
  byRole: string;
  recordAllowed: boolean;
};

export type SendChatMessageRequest = {
  sessionId: number;
  body: string;
};

export type SendChatMessageResponse = {
  success: boolean;
};

export type TeleChatMessage = {
  teleChatMessageId: number;
  sessionId: number;
  patientAppId: number;
  senderRole: 'Patient' | 'Doctor' | string;
  body: string;
  at: string;
};

export type GetChatMessagesResponse = {
  success: boolean;
  data: TeleChatMessage[];
};

export type ConsultationSummaryItem = {
  consultationSummaryId: number;
  patientAppId: number;
  doctorId: number;
  text: string;
  at: string;
};

export type GetConsultationSummaryResponse = {
  success: boolean;
  data: ConsultationSummaryItem[];
};

/**
 * Teleconsultation API:
 * - I1: POST /api/Tele/Instant
 * - I2: GET /api/Tele/Instant/{instantConsultRequestId}
 * - I3: POST /api/Tele/Instant/{instantConsultRequestId}/Cancel
 * - I4: GET /api/Tele/DeviceCheck
 * - I5: GET /api/Tele/Sessions/{teleSessionId}
 * - I6: POST /api/Tele/Sessions/{teleSessionId}/Token
 * - I7: POST /api/Tele/Sessions/{teleSessionId}/Rejoin
 * - I8: POST /api/Tele/Sessions/{teleSessionId}/JoinFailure
 * - I9: POST /api/Tele/Consent
 * - I10: POST /api/Tele/Chat
 * - I11: GET /api/Tele/Chat/{teleSessionId}
 * - I12: GET /api/Tele/Summary/{patientAppId}
 */
export const teleApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    requestInstantConsult: build.mutation<
      InstantConsultInitialResponse,
      InstantConsultRequest
    >({
      query: (body) => ({
        url: 'api/Tele/Instant',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tele'],
    }),
    getInstantConsultStatus: build.query<
      GetInstantConsultStatusResponse,
      number | string
    >({
      query: (requestId) => `api/Tele/Instant/${requestId}`,
      providesTags: ['Tele'],
    }),
    cancelInstantConsult: build.mutation<
      CancelInstantConsultResponse,
      number | string
    >({
      query: (requestId) => ({
        url: `api/Tele/Instant/${requestId}/Cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Tele'],
    }),
    getDeviceCheck: build.query<DeviceCheckResponse, void>({
      query: () => 'api/Tele/DeviceCheck',
    }),
    getTeleSession: build.query<GetTeleSessionResponse, number | string>({
      query: (teleSessionId) => `api/Tele/Sessions/${teleSessionId}`,
      providesTags: ['Tele'],
    }),
    // TODO(VIDEO-SDK): BE-P07/B-P12 — join only after vendor SDK wired; token may be stub.
    getTeleToken: build.mutation<TeleTokenResponse, number | string>({
      query: (teleSessionId) => ({
        url: `api/Tele/Sessions/${teleSessionId}/Token`,
        method: 'POST',
      }),
    }),
    rejoinTeleSession: build.mutation<TeleTokenResponse, number | string>({
      query: (teleSessionId) => ({
        url: `api/Tele/Sessions/${teleSessionId}/Rejoin`,
        method: 'POST',
      }),
    }),
    reportJoinFailure: build.mutation<
      JoinFailureResponse,
      { teleSessionId: number | string; body: JoinFailureRequest }
    >({
      query: ({ teleSessionId, body }) => ({
        url: `api/Tele/Sessions/${teleSessionId}/JoinFailure`,
        method: 'POST',
        body,
      }),
    }),
    sendRecordingConsent: build.mutation<
      RecordingConsentResponse,
      RecordingConsentRequest
    >({
      query: (body) => ({
        url: 'api/Tele/Consent',
        method: 'POST',
        body,
      }),
    }),
    sendChatMessage: build.mutation<
      SendChatMessageResponse,
      SendChatMessageRequest
    >({
      query: (body) => ({
        url: 'api/Tele/Chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tele'],
    }),
    getChatMessages: build.query<GetChatMessagesResponse, number | string>({
      query: (teleSessionId) => `api/Tele/Chat/${teleSessionId}`,
      providesTags: ['Tele'],
    }),
    getConsultationSummary: build.query<
      GetConsultationSummaryResponse,
      number | string
    >({
      query: (patientAppId) => `api/Tele/Summary/${patientAppId}`,
    }),
    /** Contract §6b — optional minutes; detail may be null. */
    reportRunningLate: build.mutation<
      {
        success: boolean;
        data?: { detail?: string | null };
        message?: string;
        detail?: string | null;
      },
      { teleSessionId: number | string; minutes?: number }
    >({
      query: ({ teleSessionId, minutes }) => ({
        url: `api/Tele/Sessions/${teleSessionId}/RunningLate`,
        method: 'POST',
        body: minutes != null ? { minutes } : {},
      }),
      invalidatesTags: ['Tele', 'VisitDetail'],
    }),
  }),
});

export const {
  useRequestInstantConsultMutation,
  useGetInstantConsultStatusQuery,
  useCancelInstantConsultMutation,
  useGetDeviceCheckQuery,
  useGetTeleSessionQuery,
  useGetTeleTokenMutation,
  useRejoinTeleSessionMutation,
  useReportJoinFailureMutation,
  useSendRecordingConsentMutation,
  useSendChatMessageMutation,
  useGetChatMessagesQuery,
  useGetConsultationSummaryQuery,
  useReportRunningLateMutation,
} = teleApi;
