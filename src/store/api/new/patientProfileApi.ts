import { newBaseApi } from './newBaseApi';

export interface PatientProfileData {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  patientId: number;
  patientName: string;
  dateOfBirth: string;
  gender: number;
  age: number;
  preferredLanguageId: number | null;
  welcomeVersionSeen: string | null;
}

export interface PatientProfileResponse {
  success: boolean;
  data: PatientProfileData;
  message?: string;
  errorMessage?: string;
}

export interface UpdatePatientProfileRequest {
  firstName: string;
  lastName: string;
  patientName: string;
  dateOfBirth: string;
  gender: number;
  age: number;
  mobileNo: string;
  email: string;
  preferredLanguageId: number | null;
  welcomeVersionSeen: string | null;
  patientId: number;
}

export interface UpdatePatientProfileResponse {
  success: boolean;
  data: PatientProfileData;
  message?: string;
  errorMessage?: string;
}

/**
 * Patient Profile API
 * GET /api/PatientProfile/Me - Fetch logged in patient's profile
 * PUT /api/PatientProfile/Me - Update logged in patient's profile
 * Auth: Bearer Token, Base: newBaseApi (devapi2)
 */
export const patientProfileApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    getPatientProfile: build.query<PatientProfileResponse, void>({
      query: () => 'api/PatientProfile/Me',
      providesTags: ['PatientProfile'],
    }),
    updatePatientProfile: build.mutation<
      UpdatePatientProfileResponse,
      UpdatePatientProfileRequest
    >({
      query: (body) => ({
        url: 'api/PatientProfile/Me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PatientProfile'],
    }),
  }),
});

export const {
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
} = patientProfileApi;
