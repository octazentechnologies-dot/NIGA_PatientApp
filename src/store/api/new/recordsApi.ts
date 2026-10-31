import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { API_BASE_URL } from '../../../config/apiConfig';
import { newBaseApi } from './newBaseApi';

export type TimelineAppointment = {
  kind: string;
  at: string;
  refId: number;
  title: string;
};

export type TimelinePrescription = {
  erxSnapshotId: number;
  patientAppId: number;
  patientId: number;
  doctorId: number;
  status: string;
  signedAt: string;
};

export type PatientTimelineData = {
  appointments: TimelineAppointment[];
  prescriptions: TimelinePrescription[];
};

export type GetTimelineResponse = {
  success: boolean;
  data: PatientTimelineData;
};

export type ConsultationNoteData = {
  text: string;
  at: string;
};

export type GetConsultationNoteResponse = {
  success: boolean;
  data?: ConsultationNoteData;
  code?: string;
  message?: string;
};

export type ErxItem = {
  remedyCode: string;
  remedyName: string;
  potencyCode: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export type ErxPrescriptionData = {
  erxSnapshotId: number;
  patientAppId: number;
  status: string;
  signedAt: string;
  items: ErxItem[];
  notesIncluded: boolean;
};

export type GetPrescriptionResponse = {
  success: boolean;
  data?: ErxPrescriptionData;
  code?: string;
  message?: string;
};

export type ApiPrescriptionListItem = {
  erxSnapshotId: number;
  patientAppId: number;
  patientId?: number;
  doctorId?: number;
  doctorName?: string;
  patientName?: string;
  itemCount?: number;
  status: string;
  signedAt: string;
  items?: ErxItem[];
  notesIncluded?: boolean;
};

export type GetPrescriptionsListResponse = {
  success: boolean;
  data: ApiPrescriptionListItem[];
  message?: string;
};

export type ApiPatientDocument = {
  documentId: number;
  fileName: string;
  mime: string;
  size?: number;
  createdAt?: string;
  createdBy?: number;
  downloadUrl?: string;
  path?: string;
};

export type GetDocumentsResponse = {
  success: boolean;
  data: ApiPatientDocument[];
};

export type GetDocumentByIdResponse = {
  success: boolean;
  data?: ApiPatientDocument;
  code?: string;
  message?: string;
};

export type UploadDocumentResponse = {
  success: boolean;
  data?: ApiPatientDocument;
  code?: string;
  message?: string;
};

export type DeleteDocumentResponse = {
  success: boolean;
  message?: string;
};

export type ApiFollowUpTask = {
  followUpTaskId: number;
  title: string;
  dueDate: string;
  status: string;
  patientId: number;
  doctorId: number;
};

export type GetFollowUpsResponse = {
  success: boolean;
  data: ApiFollowUpTask[];
};

export type CreateFollowUpRequest = {
  patientAppId: number;
  title: string;
  dueDate?: string;
  doctorId?: number;
};

export type CreateFollowUpResponse = {
  success: boolean;
  data?: ApiFollowUpTask;
  message?: string;
  code?: string;
};

export type CompleteFollowUpResponse = {
  success: boolean;
  data?: {
    taskId: number;
    status: string;
  };
  message?: string;
};

export type ErxPdfMetaResponse = {
  success: boolean;
  data?: {
    erxSnapshotId: number;
    pdfUrl: string | null;
    expiresAt: string | null;
  };
  message?: string;
  code?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function pickStr(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function pickNum(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

function unwrapRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [];
  if (Array.isArray(root.data)) return root.data;
  const data = asRecord(root.data);
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.prescriptions)) return data.prescriptions;
  if (Array.isArray(data?.Prescriptions)) return data.Prescriptions;
  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.Items)) return root.Items;
  if (Array.isArray(root.prescriptions)) return root.prescriptions;
  if (Array.isArray(root.Prescriptions)) return root.Prescriptions;
  return [];
}

function normalizeErxItem(raw: unknown): ErxItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const remedyCode = pickStr(row, 'remedyCode', 'RemedyCode');
  const remedyName = pickStr(row, 'remedyName', 'RemedyName', 'name', 'Name');
  const potencyCode = pickStr(row, 'potencyCode', 'PotencyCode', 'potency', 'Potency');
  const dose = pickStr(row, 'dose', 'Dose');
  const frequency = pickStr(row, 'frequency', 'Frequency');
  const duration = pickStr(row, 'duration', 'Duration');
  const instructions = pickStr(row, 'instructions', 'Instructions');
  if (!remedyName && !remedyCode && !potencyCode && !dose && !frequency) return null;
  return {
    remedyCode,
    remedyName: remedyName || remedyCode,
    potencyCode,
    dose,
    frequency,
    duration,
    instructions,
  };
}

function normalizePrescription(raw: unknown): GetPrescriptionResponse {
  const root = asRecord(raw) ?? {};
  const data = asRecord(root.data) ?? root;
  const itemSource = data.items ?? data.Items ?? data.remedies ?? data.Remedies ?? [];
  const items = (Array.isArray(itemSource) ? itemSource : [])
    .map(normalizeErxItem)
    .filter((item): item is ErxItem => item != null);
  return {
    success: root.success !== false,
    message: pickStr(root, 'message', 'Message') || undefined,
    code: pickStr(root, 'code', 'Code') || undefined,
    data: {
      erxSnapshotId: pickNum(data, 'erxSnapshotId', 'ErxSnapshotId'),
      patientAppId: pickNum(data, 'patientAppId', 'PatientAppId'),
      status: pickStr(data, 'status', 'Status'),
      signedAt: pickStr(data, 'signedAt', 'SignedAt'),
      items,
      notesIncluded: Boolean(data.notesIncluded ?? data.NotesIncluded),
    },
  };
}

function normalizePrescriptionList(payload: unknown): GetPrescriptionsListResponse {
  const data: ApiPrescriptionListItem[] = [];
  const rows = unwrapRows(payload);
  console.log('💊 [normalizePrescriptionList] Unwrapped rows count:', rows.length, 'Payload:', JSON.stringify(payload));
  for (const raw of rows) {
    const row = asRecord(raw);
    if (!row) continue;
    const erxSnapshotId = pickNum(
      row,
      'erxSnapshotId',
      'ErxSnapshotId',
      'erxId',
      'ErxId',
      'snapshotId',
      'SnapshotId',
      'prescriptionId',
      'PrescriptionId',
      'id',
      'Id',
    );
    if (!erxSnapshotId) continue;
    const itemSource = row.items ?? row.Items ?? row.remedies ?? row.Remedies ?? [];
    const doctorName = pickStr(row, 'doctorName', 'DoctorName', 'doctor', 'Doctor');
    const patientId = pickNum(row, 'patientId', 'PatientId');
    const doctorId = pickNum(row, 'doctorId', 'DoctorId');
    const item: ApiPrescriptionListItem = {
      erxSnapshotId,
      patientAppId: pickNum(
        row,
        'patientAppId',
        'PatientAppId',
        'appointmentId',
        'AppointmentId',
      ),
      status: pickStr(row, 'status', 'Status') || 'SIGNED',
      signedAt: pickStr(
        row,
        'signedAt',
        'SignedAt',
        'createdAt',
        'CreatedAt',
        'date',
        'Date',
        'appointmentDate',
        'AppointmentDate',
      ),
      items: (Array.isArray(itemSource) ? itemSource : [])
        .map(normalizeErxItem)
        .filter((entry): entry is ErxItem => entry != null),
    };
    if (patientId) item.patientId = patientId;
    if (doctorId) item.doctorId = doctorId;
    if (doctorName) item.doctorName = doctorName;
    const patientName = pickStr(row, 'patientName', 'PatientName');
    if (patientName) item.patientName = patientName;
    const itemCount = pickNum(row, 'itemCount', 'ItemCount');
    if (itemCount) item.itemCount = itemCount;
    data.push(item);
  }
  return { success: true, data };
}

/**
 * Health Records & Documents API:
 * - J1: GET /api/Patient/Timeline
 * - J2: GET /api/Patient/Consultations/{patientAppId}/Note
 * - Prescriptions List: GET /api/Erx/History (fallback GET /api/Erx/Prescriptions)
 * - J3: GET /api/Erx/ByAppointment/{id} & GET /api/Erx/Patient/{patientAppId}
 * - J4: GET /api/Erx/{erxSnapshotId}/Pdf
 * - J5: GET /api/Patient/Documents
 * - J6: POST /api/Patient/Documents (multipart FormData)
 * - J7: GET /api/Patient/Documents/{documentId}
 * - J8: DELETE /api/Patient/Documents/{documentId}
 * - J9: GET /api/Patient/FollowUps
 * - POST /api/Patient/FollowUps
 * - J10: POST /api/Patient/FollowUps/{followUpTaskId}/Complete
 */
export const recordsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getTimeline: build.query<GetTimelineResponse, { patientId?: number } | void>({
      query: (params) => ({
        url: 'api/Patient/Timeline',
        params:
          params && params.patientId && params.patientId > 0
            ? { patientId: params.patientId }
            : undefined,
      }),
      providesTags: ['Timeline'],
    }),
    getConsultationNote: build.query<
      GetConsultationNoteResponse,
      number | string
    >({
      query: (patientAppId) => `api/Patient/Consultations/${patientAppId}/Note`,
    }),
    getPrescriptionsList: build.query<GetPrescriptionsListResponse, { patientId?: number } | void>({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        const params =
          arg && 'patientId' in arg && arg.patientId != null && arg.patientId > 0
            ? { patientId: arg.patientId }
            : undefined;
        const history = await baseQuery({ url: 'api/Erx/History', params });
        console.log('💊 [api/Erx/History] response:', JSON.stringify(history, null, 2));
        if (!history.error && history.data) {
          return { data: normalizePrescriptionList(history.data) };
        }
        const legacy = await baseQuery({ url: 'api/Erx/Prescriptions', params });
        console.log('💊 [api/Erx/Prescriptions] response:', JSON.stringify(legacy, null, 2));
        if (!legacy.error && legacy.data) {
          return { data: normalizePrescriptionList(legacy.data) };
        }
        return { error: (history.error ?? legacy.error) as FetchBaseQueryError };
      },
      providesTags: (_result, _err, arg) => {
        const patientId = arg && 'patientId' in arg ? arg.patientId : undefined;
        return patientId
          ? [{ type: 'Prescriptions', id: `patient-${patientId}` }, 'Prescriptions']
          : ['Prescriptions'];
      },
    }),
    getPrescriptionByAppointment: build.query<
      GetPrescriptionResponse,
      number | string
    >({
      query: (appointmentId) => `api/Erx/ByAppointment/${appointmentId}`,
      transformResponse: (response: unknown) => normalizePrescription(response),
      providesTags: ['Prescriptions'],
    }),
    getPrescription: build.query<GetPrescriptionResponse, number | string>({
      query: (patientAppId) => `api/Erx/Patient/${patientAppId}`,
      transformResponse: (response: unknown) => normalizePrescription(response),
      providesTags: ['Prescriptions'],
    }),
    getDocuments: build.query<GetDocumentsResponse, { patientId?: number } | void>({
      query: (params) => ({
        url: 'api/Patient/Documents',
        params:
          params && params.patientId && params.patientId > 0
            ? { patientId: params.patientId }
            : undefined,
      }),
      providesTags: ['Documents'],
    }),
    getDocumentById: build.query<GetDocumentByIdResponse, number | string>({
      query: (documentId) => `api/Patient/Documents/${documentId}`,
      providesTags: (_result, _err, documentId) => [
        { type: 'Documents', id: String(documentId) },
        'Documents',
      ],
    }),
    uploadDocument: build.mutation<UploadDocumentResponse, FormData>({
      query: (formData) => ({
        url: 'api/Patient/Documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Documents', 'Timeline'],
    }),
    deleteDocument: build.mutation<DeleteDocumentResponse, number | string>({
      query: (documentId) => ({
        url: `api/Patient/Documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Documents', 'Timeline'],
    }),
    getFollowUps: build.query<GetFollowUpsResponse, void>({
      query: () => 'api/Patient/FollowUps',
      providesTags: ['FollowUps'],
    }),
    createFollowUp: build.mutation<
      CreateFollowUpResponse,
      CreateFollowUpRequest
    >({
      query: (body) => ({
        url: 'api/Patient/FollowUps',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FollowUps', 'Timeline'],
    }),
    completeFollowUp: build.mutation<
      CompleteFollowUpResponse,
      number | string
    >({
      query: (followUpTaskId) => ({
        url: `api/Patient/FollowUps/${followUpTaskId}/Complete`,
        method: 'POST',
      }),
      invalidatesTags: ['FollowUps', 'Timeline'],
    }),
    /** BE-012 — prefer JSON mode for in-app view/share. */
    getErxPdfMeta: build.query<
      {
        success: boolean;
        data: {
          erxSnapshotId: number;
          pdfUrl: string | null;
          expiresAt: string | null;
        };
      },
      number | string
    >({
      query: (erxSnapshotId) =>
        `api/Erx/${erxSnapshotId}/Pdf?format=json`,
      providesTags: ['Prescriptions'],
    }),
    getErxPdf: build.query<ErxPdfMetaResponse, number | string>({
      query: (erxSnapshotId) => `api/Erx/${erxSnapshotId}/Pdf?format=json`,
      providesTags: ['Prescriptions'],
    }),
  }),
});

/**
 * Resolves absolute URL for downloading or viewing a patient document by ID.
 */
export function resolvePatientDocumentUrl(documentId: number | string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${base}api/Patient/Documents/${documentId}`;
}

/**
 * Resolves absolute URL for downloading or viewing prescription PDF by snapshot ID.
 */
export function resolveErxPdfUrl(erxSnapshotId: number | string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return `${base}api/Erx/${erxSnapshotId}/Pdf`;
}

export const {
  useGetTimelineQuery,
  useLazyGetTimelineQuery,
  useGetConsultationNoteQuery,
  useLazyGetConsultationNoteQuery,
  useGetPrescriptionsListQuery,
  useLazyGetPrescriptionsListQuery,
  useGetPrescriptionByAppointmentQuery,
  useLazyGetPrescriptionByAppointmentQuery,
  useGetPrescriptionQuery,
  useLazyGetPrescriptionQuery,
  useGetDocumentsQuery,
  useLazyGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useLazyGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetFollowUpsQuery,
  useLazyGetFollowUpsQuery,
  useCreateFollowUpMutation,
  useCompleteFollowUpMutation,
  useGetErxPdfMetaQuery,
  useLazyGetErxPdfMetaQuery,
  useGetErxPdfQuery,
  useLazyGetErxPdfQuery,
} = recordsApi;
