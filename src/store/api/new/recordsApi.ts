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

export type ApiPatientDocument = {
  documentId: number;
  fileName: string;
  mime: string;
  size?: number;
  createdAt?: string;
  createdBy?: number;
  downloadUrl?: string;
};

export type GetDocumentsResponse = {
  success: boolean;
  data: ApiPatientDocument[];
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

export type CompleteFollowUpResponse = {
  success: boolean;
  data?: {
    taskId: number;
    status: string;
  };
  message?: string;
};

/**
 * Health Records & Documents API:
 * - J1: GET /api/Patient/Timeline
 * - J2: GET /api/Patient/Consultations/{patientAppId}/Note
 * - J3: GET /api/Erx/Patient/{patientAppId}
 * - J4: GET /api/Erx/{erxSnapshotId}/Pdf
 * - J5: GET /api/Patient/Documents
 * - J6: POST /api/Patient/Documents (multipart FormData)
 * - J7: GET /api/Patient/Documents/{documentId}
 * - J8: DELETE /api/Patient/Documents/{documentId}
 * - J9: GET /api/Patient/FollowUps
 * - J10: POST /api/Patient/FollowUps/{followUpTaskId}/Complete
 */
export const recordsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getTimeline: build.query<GetTimelineResponse, void>({
      query: () => 'api/Patient/Timeline',
      providesTags: ['Timeline'],
    }),
    getConsultationNote: build.query<
      GetConsultationNoteResponse,
      number | string
    >({
      query: (patientAppId) => `api/Patient/Consultations/${patientAppId}/Note`,
    }),
    getPrescription: build.query<GetPrescriptionResponse, number | string>({
      query: (patientAppId) => `api/Erx/Patient/${patientAppId}`,
      providesTags: ['Prescriptions'],
    }),
    getDocuments: build.query<GetDocumentsResponse, void>({
      query: () => 'api/Patient/Documents',
      providesTags: ['Documents'],
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
  }),
});

export const {
  useGetTimelineQuery,
  useGetConsultationNoteQuery,
  useGetPrescriptionQuery,
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetFollowUpsQuery,
  useCompleteFollowUpMutation,
} = recordsApi;
