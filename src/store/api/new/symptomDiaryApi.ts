import { newBaseApi } from './newBaseApi';

export type ApiDiaryEntry = {
  symptomDiaryId: number;
  patientId: number;
  entryDate: string;
  severity: number;
  note?: string;
};

export type GetDiaryResponse = {
  success: boolean;
  data: ApiDiaryEntry[];
};

export type SaveDiaryRequest = {
  entryDate: string;
  severity: number;
  note?: string;
};

export type SaveDiaryResponse = {
  success: boolean;
  message?: string;
};

export type UpdateDiaryParams = {
  symptomDiaryId: number | string;
  body: SaveDiaryRequest;
};

export type ProgressSeriesPoint = {
  date: string;
  severity: number;
};

export type PatientProgressData = {
  visitCount: number;
  series: ProgressSeriesPoint[];
};

export type GetProgressResponse = {
  success: boolean;
  data: PatientProgressData;
};

/**
 * Symptom Diary and Progress API:
 * - J11: GET /api/Patient/Diary
 * - J12: POST /api/Patient/Diary
 * - J13: PUT /api/Patient/Diary/{symptomDiaryId}
 * - J14: DELETE /api/Patient/Diary/{symptomDiaryId}
 * - J15: GET /api/Patient/Progress
 */
export const symptomDiaryApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getDiaryEntries: build.query<GetDiaryResponse, void>({
      query: () => 'api/Patient/Diary',
      providesTags: ['Diary'],
    }),
    createDiaryEntry: build.mutation<SaveDiaryResponse, SaveDiaryRequest>({
      query: (body) => ({
        url: 'api/Patient/Diary',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Diary'],
    }),
    updateDiaryEntry: build.mutation<SaveDiaryResponse, UpdateDiaryParams>({
      query: ({ symptomDiaryId, body }) => ({
        url: `api/Patient/Diary/${symptomDiaryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Diary'],
    }),
    deleteDiaryEntry: build.mutation<SaveDiaryResponse, number | string>({
      query: (symptomDiaryId) => ({
        url: `api/Patient/Diary/${symptomDiaryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Diary'],
    }),
    getProgress: build.query<GetProgressResponse, void>({
      query: () => 'api/Patient/Progress',
      providesTags: ['Diary'],
    }),
  }),
});

export const {
  useGetDiaryEntriesQuery,
  useCreateDiaryEntryMutation,
  useUpdateDiaryEntryMutation,
  useDeleteDiaryEntryMutation,
  useGetProgressQuery,
} = symptomDiaryApi;
