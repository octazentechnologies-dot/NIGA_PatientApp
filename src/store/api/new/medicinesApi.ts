import { newBaseApi } from './newBaseApi';

export type ApiMedicineOrder = {
  medicineOrderId: number;
  erxSnapshotId: number;
  patientId: number;
  pharmacyPartnerId: number;
  status:
    | 'OFFERED'
    | 'ACCEPTED'
    | 'QUOTED'
    | 'QUOTED_ACCEPTED'
    | 'PAID'
    | 'COD_PENDING'
    | 'READY'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'REJECTED'
    | string;
  consentGranted: boolean;
  quoteAmount?: number | null;
  payMode?: 'ONLINE' | 'COD' | null;
};

export type GetMedicineOrdersResponse = {
  success: boolean;
  data: ApiMedicineOrder[];
};

export type CreateMedicineOrderRequest = {
  erxSnapshotId: number;
  pharmacyPartnerId: number;
};

export type CreateMedicineOrderResponse = {
  success: boolean;
  data?: {
    medicineOrderId: number;
    status: string;
    namesRevealed: boolean;
  };
  message?: string;
};

export type ApiPharmacyPartner = {
  pharmacyPartnerId: number;
  name: string;
  area: string;
  status: string;
};

export type GetPharmacySellersResponse = {
  success: boolean;
  data: ApiPharmacyPartner[];
};

export type MedicineOrderConsentResponse = {
  success: boolean;
  message?: string;
};

export type AcceptQuoteResponse = {
  success: boolean;
  data?: {
    orderId: number;
    status: string;
  };
};

export type PayMedicineOrderRequest = {
  medicineOrderId: number;
  payMode: 'ONLINE' | 'COD';
  idempotencyKey: string;
};

export type PayMedicineOrderResponse = {
  success: boolean;
  gatewayReady?: boolean;
  message?: string;
  data?: {
    paymentOrderId: number;
    amount?: number;
    currency?: string;
    status?: string;
  };
};

export type TrackingEvent = {
  status: string;
  detail?: string | null;
  at: string;
};

export type TrackingItem = {
  remedyCode: string;
  remedyName: string;
};

export type MedicineOrderTrackingData = {
  medicineOrderId: number;
  status: string;
  items: TrackingItem[];
  events: TrackingEvent[];
};

export type GetMedicineOrderTrackingResponse = {
  success: boolean;
  data: MedicineOrderTrackingData;
};

export type ApiRefillItem = {
  refillRequestId: number;
  erxSnapshotId: number;
  patientId: number;
  doctorId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  reason?: string | null;
  createdAt: string;
  decidedAt?: string | null;
  patientName: string;
  doctorName: string;
  patientAppId: number;
};

export type GetRefillsResponse = {
  success: boolean;
  data: ApiRefillItem[];
};

export type RequestRefillRequest = {
  erxSnapshotId: number;
};

export type RequestRefillResponse = {
  success: boolean;
  data?: {
    refillRequestId: number;
    status: string;
  };
  message?: string;
};

/**
 * Medicines & Pharmacy API:
 * - K1: GET /api/Patient/MedicineOrders
 * - K2: POST /api/MedicineOrders
 * - K3: GET /api/Pharmacy/Sellers?area=...
 * - K4: POST /api/MedicineOrders/{medicineOrderId}/Consent
 * - K5: POST /api/MedicineOrders/{medicineOrderId}/AcceptQuote
 * - K6: POST /api/Payments/MedicineOrders
 * - K7: GET /api/MedicineOrders/{medicineOrderId}/Tracking
 * - K8: POST /api/MedicineOrders/Refill/{refillRequestId}
 * - K9: GET /api/Erx/Refills
 * - K10: POST /api/Erx/Refills
 */
export const medicinesApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getMedicineOrders: build.query<GetMedicineOrdersResponse, void>({
      query: () => 'api/Patient/MedicineOrders',
      providesTags: ['Orders'],
    }),
    createMedicineOrder: build.mutation<
      CreateMedicineOrderResponse,
      CreateMedicineOrderRequest
    >({
      query: (body) => ({
        url: 'api/MedicineOrders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
    getPharmacySellers: build.query<GetPharmacySellersResponse, string | void>({
      query: (area) =>
        area
          ? `api/Pharmacy/Sellers?area=${encodeURIComponent(area)}`
          : 'api/Pharmacy/Sellers',
    }),
    grantMedicineConsent: build.mutation<
      MedicineOrderConsentResponse,
      number | string
    >({
      query: (medicineOrderId) => ({
        url: `api/MedicineOrders/${medicineOrderId}/Consent`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders'],
    }),
    acceptMedicineQuote: build.mutation<
      AcceptQuoteResponse,
      number | string
    >({
      query: (medicineOrderId) => ({
        url: `api/MedicineOrders/${medicineOrderId}/AcceptQuote`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders'],
    }),
    payMedicineOrder: build.mutation<
      PayMedicineOrderResponse,
      PayMedicineOrderRequest
    >({
      query: (body) => ({
        url: 'api/Payments/MedicineOrders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
    getMedicineOrderTracking: build.query<
      GetMedicineOrderTrackingResponse,
      number | string
    >({
      query: (medicineOrderId) =>
        `api/MedicineOrders/${medicineOrderId}/Tracking`,
      providesTags: ['Orders'],
    }),
    refillMedicineOrder: build.mutation<
      CreateMedicineOrderResponse,
      number | string
    >({
      query: (refillRequestId) => ({
        url: `api/MedicineOrders/Refill/${refillRequestId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders'],
    }),
    getRefills: build.query<GetRefillsResponse, void>({
      query: () => 'api/Erx/Refills',
      providesTags: ['Orders'],
    }),
    requestRefill: build.mutation<
      RequestRefillResponse,
      RequestRefillRequest
    >({
      query: (body) => ({
        url: 'api/Erx/Refills',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetMedicineOrdersQuery,
  useCreateMedicineOrderMutation,
  useGetPharmacySellersQuery,
  useLazyGetPharmacySellersQuery,
  useGrantMedicineConsentMutation,
  useAcceptMedicineQuoteMutation,
  usePayMedicineOrderMutation,
  useGetMedicineOrderTrackingQuery,
  useRefillMedicineOrderMutation,
  useGetRefillsQuery,
  useRequestRefillMutation,
} = medicinesApi;
