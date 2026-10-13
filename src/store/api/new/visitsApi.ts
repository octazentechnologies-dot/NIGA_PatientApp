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
  teleSessionId?: number | null;
  sessionStatus?: string | null;
  chatCount?: number;
  hasSummary?: boolean;
};

export type PatientVisitsResponse = {
  success: boolean;
  data: PatientVisitItem[];
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
  doctorPhotoUrl?: string | null;
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
    getPatientVisits: build.query<PatientVisitsResponse, { patientId?: number } | void>({
      query: (params) => ({
        url: 'api/Patient/Visits',
        params: params?.patientId ? { patientId: params.patientId } : undefined,
      }),
      providesTags: ['Visits'],
    }),
    getVisitDetail: build.query<VisitDetailResponse, number | string>({
      query: (patientAppId) => `api/Patient/Visits/${patientAppId}`,
      providesTags: ['Visits'],
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
  useGetAppointmentChangeLogQuery,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
  useGetRefundPolicyQuery,
} = visitsApi;
