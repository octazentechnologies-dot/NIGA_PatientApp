import { newBaseApi } from './newBaseApi';

export type PatientVisitItem = {
  patientAppId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string; // 'NOT ARRIVED' | 'WAITING' | 'WALK-IN' | 'E-CONSULT' | 'REMAINING' | 'COMPLETED' | 'CANCELLED'
  consultMode: string;
  isTele: boolean;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  specialization?: string;
  doctorPhotoUrl?: string | null;
  patientId?: number;
  patientName?: string;
  patientFullName?: string;
  /** BE-008 — number for open tele visits; else null. */
  teleSessionId?: number | null;
  sessionStatus?: string | null;
  chatCount?: number;
  hasSummary?: boolean;
};

export type GetPatientVisitsParams = {
  patientId?: number;
  status?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type PatientVisitsResponse = {
  success: boolean;
  data: PatientVisitItem[] | {
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    data: PatientVisitItem[];
  };
  message?: string;
};

export type VisitDetailActions = {
  canPay: boolean;
  canReschedule: boolean;
  canCancel: boolean;
  canJoinTele: boolean;
  canChat: boolean;
  canReview: boolean;
};

export type VisitDetailData = {
  patientAppId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  consultMode: string;
  isTele: boolean;
  visitType: string;
  queuePosition?: number | null;
  doctorId: number;
  doctorName: string;
  clinicName?: string | null;
  clinicCity?: string | null;
  clinicMapLink?: string | null;
  /** Path like `/api/Profile/Photo/{id}` — use `resolveApiUrl`. */
  doctorPhotoUrl?: string | null;
  /** Contract §3 — null when doctor has no fee stored. */
  consultFee?: number | null;
  currency?: string | null;
  /** Null unless CONSULT payment > consultFee. Never invent 90. */
  platformFee?: number | null;
  clinicPhone?: string | null;
  reasonText?: string | null;
  paymentStatus: string;
  paymentMethod?: string | null;
  isPaid: boolean;
  payAtClinicAllowed: boolean;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  teleSessionId?: number | null;
  sessionStatus?: string | null;
  chatCount?: number;
  hasSummary?: boolean;
  erxSnapshotId?: number | null;
  erxSigned?: boolean;
  /** BE-022 — hide when null. */
  followUpDate?: string | null;
  erxPdfUrl?: string | null;
  /** UTC expiry for short-lived ticketed erxPdfUrl (browser open). */
  erxPdfExpiresAt?: string | null;
  /** BE-014 — hide when null. */
  clinicAddressLine?: string | null;
  actions: VisitDetailActions;
};

export type VisitDetailResponse = {
  success: boolean;
  data: VisitDetailData;
  message?: string;
};

export type AppointmentChangeLogItem = {
  appointmentChangeLogId: number;
  patientAppId: number;
  action: string;
  oldValue: string;
  newValue: string;
  byUserId: number;
  byRole: string;
  reason?: string;
  at: string;
};

export type AppointmentChangeLogResponse = {
  success: boolean;
  data: AppointmentChangeLogItem[];
};

export type RescheduleAppointmentRequest = {
  patientAppId: number;
  appointmentDate: string; // yyyy-MM-dd
  appointmentTime: string; // HH:mm
  reason?: string;
};

export type RescheduleAppointmentResponse = {
  statusCode: number;
  message: string;
  appointment?: {
    patientAppId: number;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
  };
};

export type CancelAppointmentRequest = {
  patientAppId: number;
  reasonCode: 'PatientRequest' | 'DoctorUnavailable' | 'Duplicate' | 'Other';
  reasonText?: string;
};

export type CancelAppointmentResponse = {
  statusCode: number;
  message: string;
  appointment?: {
    patientAppId: number;
    status: string;
    cancelReasonCode?: string;
  };
  refundPolicy?: {
    queued: boolean;
    policy: string; // 'FULL' | 'PARTIAL' | 'NONE'
    amount: number;
    refundId?: number | null;
    detail?: string;
  };
};

export type RefundPolicyData = {
  policy: string;
  amount: number;
  reason: string;
};

export type RefundPolicyResponse = {
  success: boolean;
  data: RefundPolicyData;
};

/**
 * Visits Endpoints:
 * - H1: GET /api/Patient/Visits
 * - H2: GET /api/MobilePatient/Visits/{patientAppId} (alias /api/Patient/Visits/{patientAppId})
 * - H3: GET /api/PatientAppointment/ChangeLog/{patientAppId}
 * - H4: POST /api/PatientAppointment/RescheduleAppointment
 * - H5: POST /api/PatientAppointment/CancelAppointment
 * - H6: GET /api/Refunds/Policy/{paymentOrderId}
 */
export const visitsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getPatientVisits: build.query<
      PatientVisitsResponse,
      GetPatientVisitsParams | void
    >({
      query: (params) => ({
        url: 'api/Patient/Visits',
        params: params
          ? {
              patientId: params.patientId,
              status: params.status,
              fromDate: params.fromDate,
              toDate: params.toDate,
              pageNumber: params.pageNumber,
              pageSize: params.pageSize,
            }
          : undefined,
      }),
      providesTags: ['Visits'],
    }),
    getVisitDetail: build.query<VisitDetailResponse, number | string>({
      query: (patientAppId) => `api/Patient/Visits/${patientAppId}`,
      providesTags: (_result, _err, patientAppId) => [
        { type: 'VisitDetail', id: String(patientAppId) },
        'Visits',
      ],
    }),
    checkInVisit: build.mutation<
      {
        success: boolean;
        data: {
          patientAppId: number;
          status: string;
          queuePosition: number | null;
          /** BE-007 — always null until clinic marks ready; never invent ETA. */
          readyAt: string | null;
          estimatedWaitMinutes?: number | null;
        };
        message?: string;
      },
      { patientAppId: number | string; status: 'EARLY' | 'WAITING' | 'READY' }
    >({
      query: ({ patientAppId, status }) => ({
        url: `api/Patient/Visits/${patientAppId}/CheckIn`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { patientAppId }) => [
        { type: 'VisitDetail', id: String(patientAppId) },
        'Visits',
      ],
    }),
    switchVisitToTele: build.mutation<
      {
        success: boolean;
        data: { patientAppId: number; consultMode: string; isTele: boolean };
        message?: string;
      },
      { patientAppId: number }
    >({
      query: ({ patientAppId }) => ({
        url: 'api/PatientAppointment/SwitchToTele',
        method: 'POST',
        body: { patientAppId },
      }),
      invalidatesTags: (_r, _e, { patientAppId }) => [
        { type: 'VisitDetail', id: String(patientAppId) },
        'Visits',
      ],
    }),
    getAppointmentChangeLog: build.query<
      AppointmentChangeLogResponse,
      number | string
    >({
      query: (patientAppId) =>
        `api/PatientAppointment/ChangeLog/${patientAppId}`,
    }),
    rescheduleAppointment: build.mutation<
      RescheduleAppointmentResponse,
      RescheduleAppointmentRequest
    >({
      query: (body) => ({
        url: 'api/PatientAppointment/RescheduleAppointment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visits'],
    }),
    cancelAppointment: build.mutation<
      CancelAppointmentResponse,
      CancelAppointmentRequest
    >({
      query: (body) => ({
        url: 'api/PatientAppointment/CancelAppointment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visits'],
    }),
    getRefundPolicy: build.query<RefundPolicyResponse, number | string>({
      query: (paymentOrderId) => `api/Refunds/Policy/${paymentOrderId}`,
    }),
  }),
});

export const {
  useGetPatientVisitsQuery,
  useGetVisitDetailQuery,
  useCheckInVisitMutation,
  useSwitchVisitToTeleMutation,
  useGetAppointmentChangeLogQuery,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
  useGetRefundPolicyQuery,
} = visitsApi;
