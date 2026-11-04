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
  /** Additive list enrichment (PAT-MED-OD-API) — optional. */
  pharmacyName?: string | null;
  deliveredAt?: string | null;
  deliveryFee?: number | null;
  paymentOrderId?: number | null;
};

/** Shared enrichment shape for Tracking + History (additive). */
export type MedicineOrderEnrichment = {
  deliveredAt?: string | null;
  subtotalMedicines?: number | null;
  deliveryFee?: number | null;
  totalPaid?: number | null;
  currency?: string | null;
  payMode?: string | null;
  paymentReference?: string | null;
  paymentOrderId?: number | null;
  erxSnapshotId?: number | null;
  rxLabel?: string | null;
  doctorName?: string | null;
  pharmacyPartnerId?: number | null;
  pharmacyName?: string | null;
  pharmacyArea?: string | null;
  pharmacyLicenceNumber?: string | null;
  pharmacyLicensed?: boolean | null;
  pharmacyContactMasked?: string | null;
  invoiceId?: number | null;
  invoiceNumber?: string | null;
  invoicePdfAvailable?: boolean | null;
  canRequestRefill?: boolean | null;
};

export type MedicineInvoiceData = {
  invoiceId: number;
  number: string;
  series?: string | null;
  stream?: string | null;
  paymentOrderId: number;
  gstBreakup?: string | null;
  pdfPath?: string | null;
  secureDocumentId?: number | null;
  createdAt?: string | null;
};

export type MedicineInvoiceResponse = {
  success: boolean;
  data?: MedicineInvoiceData;
  message?: string;
};

export type GetMedicineOrdersResponse = {
  success: boolean;
  data: ApiMedicineOrder[];
};

export type CreateMedicineOrderRequest = {
  erxSnapshotId: number;
  /** Omit when the patient chose auto-route. */
  pharmacyPartnerId?: number;
  /** Optional delivery address. Not required to create the order. */
  addressId?: number | null;
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
  /** Public Razorpay Key ID. Null when gateway is not ready. */
  keyId?: string | null;
  message?: string;
  data?: {
    paymentOrderId: number;
    /** Amount in rupees (API unit). */
    amount?: number;
    currency?: string;
    status?: string;
    /** Razorpay order_id — required to open Checkout. */
    gatewayOrderId?: string | null;
  };
};

export type TrackingEvent = {
  status: string;
  detail?: string | null;
  label?: string | null;
  at: string;
};

export type TrackingItem = {
  remedyCode?: string | null;
  remedyName: string;
  potencyCode?: string | null;
  quantityLabel?: string | null;
  /** Optional line price when BE stores it; null → hide. */
  lineAmount?: number | null;
};

/**
 * Tracking payload for Order Details.
 * Extra keys are additive (PAT-MED-OD-API); older servers omit them — treat as null.
 */
export type MedicineOrderTrackingData = MedicineOrderEnrichment & {
  medicineOrderId: number;
  status: string;
  /** Null money → hide; never invent ₹0. */
  quoteAmount?: number | null;
  /** Always arrays per BE-028. */
  items?: TrackingItem[];
  lines?: TrackingItem[];
  events: TrackingEvent[];
};

export type MedicineOrderHistoryRow = MedicineOrderEnrichment & {
  medicineOrderId: number;
  status: string;
  quoteAmount?: number | null;
  quoteNote?: string | null;
  createdAt?: string | null;
  items?: TrackingItem[];
  events?: TrackingEvent[];
};

export type GetMedicineOrderHistoryResponse = {
  success: boolean;
  data: MedicineOrderHistoryRow[];
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
 * K8 refill Start Order body. ErxSnapshotId is resolved server-side from the
 * RefillRequest row — never send erxSnapshotId on this endpoint (it is not on
 * MedicineRefillOrderRequest and would reintroduce [Range(1..)] bind failures).
 */
export type RefillMedicineOrderRequest = {
  refillRequestId: number;
  /** Omit for auto-route. */
  pharmacyPartnerId?: number;
  /** Optional delivery address (same optional field as createMedicineOrder). */
  addressId?: number | null;
};

export type ReviewMedicineOrderRequest = {
  medicineOrderId: number;
  rating: number;
  comment?: string | null;
};

export type ReviewMedicineOrderResponse = {
  success: boolean;
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
 *       body { pharmacyPartnerId?, addressId? } — never erxSnapshotId
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
      providesTags: ['PharmacySellers'],
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
    getMedicineOrderHistory: build.query<GetMedicineOrderHistoryResponse, void>(
      {
        query: () => 'api/Patient/MedicineOrders/History',
        providesTags: ['Orders'],
      },
    ),
    getMedicineInvoiceByPayment: build.query<
      MedicineInvoiceResponse,
      number | string
    >({
      query: (paymentOrderId) => `api/Invoices/ByPayment/${paymentOrderId}`,
    }),
    createMedicineInvoiceByPayment: build.mutation<
      MedicineInvoiceResponse,
      number | string
    >({
      query: (paymentOrderId) => ({
        url: `api/Invoices/ByPayment/${paymentOrderId}`,
        method: 'POST',
      }),
    }),
    refillMedicineOrder: build.mutation<
      CreateMedicineOrderResponse,
      RefillMedicineOrderRequest
    >({
      query: ({ refillRequestId, pharmacyPartnerId, addressId }) => {
        const body: {
          pharmacyPartnerId?: number;
          addressId?: number;
        } = {};
        if (pharmacyPartnerId != null && pharmacyPartnerId > 0) {
          body.pharmacyPartnerId = pharmacyPartnerId;
        }
        if (addressId != null && addressId > 0) {
          body.addressId = addressId;
        }
        return {
          url: `api/MedicineOrders/Refill/${refillRequestId}`,
          method: 'POST',
          body,
        };
      },
      // Orders list gains the new active order; Refills may flip APPROVED → ORDERED.
      invalidatesTags: ['Orders'],
    }),
    reviewMedicineOrder: build.mutation<
      ReviewMedicineOrderResponse,
      ReviewMedicineOrderRequest
    >({
      query: ({ medicineOrderId, rating, comment }) => ({
        url: `api/MedicineOrders/${medicineOrderId}/Review`,
        method: 'POST',
        body: { rating, comment: comment ?? null },
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
  useGetMedicineOrderHistoryQuery,
  useLazyGetMedicineInvoiceByPaymentQuery,
  useCreateMedicineInvoiceByPaymentMutation,
  useRefillMedicineOrderMutation,
  useReviewMedicineOrderMutation,
  useGetRefillsQuery,
  useRequestRefillMutation,
} = medicinesApi;
