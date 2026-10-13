import { newBaseApi } from './newBaseApi';

export type PublicDoctor = {
  doctorId: number;
  displayName: string;
  qualification: string | null;
  city: string;
  clinicName: string;
  consultFeeInClinic: number;
  consultFeeTele: number;
  isOnline: boolean;
  verified: boolean;
  isVerified: boolean;
  photoPath: string | null;
  rankingSummary: string;
  rankingReasons: string[];
  averageRating: number | null;
  reviewCount: number;
};

export type GetDoctorsResponse = {
  success: boolean;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  data: PublicDoctor[];
};

export type SearchDoctorsParams = {
  q?: string;
  city?: string;
  isOnline?: boolean;
  teleOnly?: boolean;
  minFee?: number;
  maxFee?: number;
  pageNumber?: number;
  pageSize?: number;
};

export type DoctorProfileDetail = PublicDoctor & {
  workingHoursNote?: string;
  verificationStatus?: string;
};

export type DoctorDetailResponse = {
  success: boolean;
  data: DoctorProfileDetail;
  message?: string;
};

export type DoctorRankingData = {
  doctorId: number;
  summary: string;
  reasons: string[];
};

export type DoctorRankingResponse = {
  success: boolean;
  data: DoctorRankingData;
};

export type DoctorFeeData = {
  doctorId: number;
  inClinicFee: number;
  teleFee: number;
  instantSurcharge: number;
  currency: string;
  payAtClinicEnabled: boolean;
  isVerified: boolean;
  source: string;
};

export type DoctorFeeResponse = {
  success: boolean;
  data: DoctorFeeData;
};

export type DoctorReviewItem = {
  reviewId: number;
  rating: number;
  text: string;
  at: string;
};

export type DoctorReviewsResponse = {
  success: boolean;
  data: DoctorReviewItem[];
  averageRating: number | null;
  reviewCount: number;
};

export type DoctorSlotItem = {
  time: string;
  label: string;
  status: 'available' | 'booked' | 'break' | 'past';
};

export type DoctorSlotsData = {
  doctorId: number;
  appointmentDate: string;
  hasSchedule: boolean;
  intervalMinutes: number;
  slots: DoctorSlotItem[];
};

export type DoctorSlotsResponse = {
  success: boolean;
  data: DoctorSlotsData;
  message?: string;
};

export type DoctorTeleAvailabilityData = {
  doctorId: number;
  isOnline: boolean;
  lastHeartbeat?: string;
};

export type DoctorTeleAvailabilityResponse = {
  success: boolean;
  data: DoctorTeleAvailabilityData;
};

/**
 * Doctor Discovery & Detail Endpoints:
 * - G1: GET /api/Public/Doctors
 * - G2: GET /api/Public/Doctors/{doctorId}
 * - G3: GET /api/Public/Doctors/{doctorId}/Ranking
 * - G4: GET /api/Public/Doctors/{doctorId}/Slots?date=yyyy-MM-dd
 * - G5: GET /api/Fees/Public/{doctorId}
 * - G6: GET /api/Reviews/Doctor/{doctorId}
 * - G7: GET /api/Tele/Availability/{doctorId}
 */
export const doctorsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getDoctors: build.query<PublicDoctor[], SearchDoctorsParams | void>({
      query: (params) => ({
        url: 'api/Public/Doctors',
        params: params || undefined,
      }),
      providesTags: ['Doctors'],
      transformResponse: (response: GetDoctorsResponse) => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
    }),
    getDoctorById: build.query<DoctorDetailResponse, number | string>({
      query: (doctorId) => `api/Public/Doctors/${doctorId}`,
      providesTags: ['Doctors'],
    }),
    getDoctorRanking: build.query<DoctorRankingResponse, number | string>({
      query: (doctorId) => `api/Public/Doctors/${doctorId}/Ranking`,
    }),
    getDoctorSlots: build.query<
      DoctorSlotsResponse,
      { doctorId: number | string; date: string }
    >({
      query: ({ doctorId, date }) => ({
        url: `api/Public/Doctors/${doctorId}/Slots`,
        params: { date },
      }),
    }),
    getDoctorFees: build.query<DoctorFeeResponse, number | string>({
      query: (doctorId) => `api/Fees/Public/${doctorId}`,
    }),
    getDoctorReviews: build.query<DoctorReviewsResponse, number | string>({
      query: (doctorId) => `api/Reviews/Doctor/${doctorId}`,
    }),
    getDoctorTeleAvailability: build.query<
      DoctorTeleAvailabilityResponse,
      number | string
    >({
      query: (doctorId) => `api/Tele/Availability/${doctorId}`,
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorRankingQuery,
  useGetDoctorSlotsQuery,
  useGetDoctorFeesQuery,
  useGetDoctorReviewsQuery,
  useGetDoctorTeleAvailabilityQuery,
} = doctorsApi;
