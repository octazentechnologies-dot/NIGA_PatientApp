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

/**
 * Doctors Screen — GET api/Public/Doctors. Auth not required.
 * Base: newBaseApi (devapi2).
 */
export const doctorsApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    getDoctors: build.query<PublicDoctor[], void>({
      query: () => 'api/Public/Doctors',
      providesTags: ['Doctors'],
      transformResponse: (response: GetDoctorsResponse) => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
    }),
  }),
});

export const { useGetDoctorsQuery } = doctorsApi;
