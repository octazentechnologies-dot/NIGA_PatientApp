import { newBaseApi } from './newBaseApi';

export type HomeNextAppointment = {
  patientAppId: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string; // 'NOT ARRIVED' | 'WAITING' | 'WALK-IN' | 'E-CONSULT' | 'REMAINING' | 'COMPLETED' | 'CANCELLED'
  doctorId: number;
  doctorName: string;
  visitType?: string;
  consultMode?: string;
  isTele?: boolean;
  paymentStatus?: string;
  paymentMethod?: string;
  payAtClinicAllowed?: boolean;
  consultFee?: number | null;
  currency?: string | null;
  bookingToken?: string;
  queuePosition?: number | null;
  cancelReasonCode?: string | null;
  bookingChannel?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
};

export type HomeDashboardData = {
  patientId: number | null;
  patientName: string | null;
  familyCount: number;
  caregiverCount: number;
  upcomingAppointments: number;
  nextAppointments: HomeNextAppointment[];
};

export type HomeDashboardResponse = {
  success: boolean;
  data: HomeDashboardData;
  message?: string;
};

export type CareCategory = {
  id: number;
  name: string;
  description: string;
};

export type CareCategoriesResponse = {
  success: boolean;
  data: CareCategory[];
};

export type HealthArticleSummary = {
  blogId: number;
  blogHead: string;
  blogSubHead?: string;
  blogDate?: string;
  blogImage1?: string | null;
  blogImage2?: string | null;
  bodyUrl?: string;
};

export type HealthArticlesResponse = {
  success: boolean;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  data: HealthArticleSummary[];
};

export type HealthArticleDetail = {
  blogId: number;
  blogHead: string;
  blogSubHead?: string;
  blogDate?: string;
  blogImage1?: string | null;
  blogImage2?: string | null;
  body: string;
};

export type HealthArticleDetailResponse = {
  success: boolean;
  data: HealthArticleDetail;
  message?: string;
};

/**
 * Home API Endpoints:
 * - F1: GET /api/MobilePatient/Home (alias /api/PatientPortal/Home)
 * - F2: GET /api/PatientPortal/CareCategories
 * - F3: GET /api/Public/Articles
 * - F4: GET /api/Public/Articles/{id}
 */
export const homeApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getHomeDashboard: build.query<HomeDashboardResponse, void>({
      query: () => 'api/PatientPortal/Home',
      providesTags: ['Visits'],
    }),
    getCareCategories: build.query<CareCategoriesResponse, void>({
      query: () => 'api/PatientPortal/CareCategories',
      providesTags: ['Articles'],
    }),
    getArticles: build.query<
      HealthArticlesResponse,
      { pageNumber?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: 'api/Public/Articles',
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
        },
      }),
      providesTags: ['Articles'],
    }),
    getArticleById: build.query<HealthArticleDetailResponse, number | string>({
      query: (blogId) => `api/Public/Articles/${blogId}`,
      providesTags: (_r, _e, blogId) => [{ type: 'Articles', id: String(blogId) }],
    }),
  }),
});

export const {
  useGetHomeDashboardQuery,
  useGetCareCategoriesQuery,
  useGetArticlesQuery,
  useGetArticleByIdQuery,
} = homeApi;
