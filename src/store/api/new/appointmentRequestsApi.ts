import { newBaseApi } from './newBaseApi';
import { unwrapListOrPage } from '../../../utilities/paged';

/**
 * BE-005 / B-005 / BE-027 — Appointment requests.
 */
export type AppointmentRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'PROPOSED'
  | 'CANCELLED'
  | 'EXPIRED'
  | string;

export type AppointmentRequestItem = {
  appointmentRequestId: number;
  doctorId: number;
  doctorName: string;
  requestedDate: string;
  requestedTime: string;
  consultMode: string;
  reason: string | null;
  status: AppointmentRequestStatus;
  proposedDate: string | null;
  proposedTime: string | null;
  patientAppId: number | null;
};

export type CreateAppointmentRequestBody = {
  doctorId: number;
  requestedDate: string;
  requestedTime: string;
  consultMode: 'Tele' | 'InClinic';
  reason: string;
};

export type CreateAppointmentRequestArgs = {
  body: CreateAppointmentRequestBody;
  idempotencyKey: string;
};

export type CreateAppointmentRequestResponse = {
  success: boolean;
  data: { status: string; appointmentRequestId?: number };
  message?: string;
};

export type ListAppointmentRequestsParams = {
  status?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type ListAppointmentRequestsResult = {
  success: boolean;
  items: AppointmentRequestItem[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
};

export type RespondAppointmentRequestBody = {
  action: 'ACCEPT' | 'DECLINE';
  message?: string | null;
};

export type RespondAppointmentRequestResponse = {
  success: boolean;
  data: {
    status: string;
    patientAppId: number | null;
  };
  message?: string;
};

export const appointmentRequestsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAppointmentRequests: build.query<
      ListAppointmentRequestsResult,
      ListAppointmentRequestsParams | void
    >({
      query: (params) => ({
        url: 'api/Patient/AppointmentRequests',
        params: params
          ? {
              status: params.status || undefined,
              pageNumber: params.pageNumber,
              pageSize: params.pageSize,
            }
          : undefined,
      }),
      transformResponse: (response: unknown): ListAppointmentRequestsResult => {
        const { items, page } = unwrapListOrPage<AppointmentRequestItem>(response);
        return {
          success: true,
          items,
          totalRecords: page?.totalRecords ?? items.length,
          pageNumber: page?.pageNumber ?? 1,
          pageSize: page?.pageSize ?? (items.length || 20),
        };
      },
      providesTags: ['AppointmentRequests'],
    }),
    createAppointmentRequest: build.mutation<
      CreateAppointmentRequestResponse,
      CreateAppointmentRequestArgs
    >({
      query: ({ body, idempotencyKey }) => ({
        url: 'api/Patient/AppointmentRequests',
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
      invalidatesTags: ['AppointmentRequests'],
    }),
    cancelAppointmentRequest: build.mutation<
      { success: boolean; message?: string },
      number | string
    >({
      query: (id) => ({
        url: `api/Patient/AppointmentRequests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AppointmentRequests', 'Visits', 'Notifications'],
    }),
    respondAppointmentRequest: build.mutation<
      RespondAppointmentRequestResponse,
      { id: number | string; body: RespondAppointmentRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `api/Patient/AppointmentRequests/${id}/Respond`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppointmentRequests', 'Visits', 'Notifications'],
    }),
  }),
});

export const {
  useGetAppointmentRequestsQuery,
  useCreateAppointmentRequestMutation,
  useCancelAppointmentRequestMutation,
  useRespondAppointmentRequestMutation,
} = appointmentRequestsApi;
