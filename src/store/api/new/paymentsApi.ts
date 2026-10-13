import { newBaseApi } from './newBaseApi';

export type CreateConsultOrderRequest = {
  patientAppId: number;
  bookingToken?: string;
  payAtClinic?: boolean;
  idempotencyKey?: string;
  amount?: number;
};

export type ConsultPaymentOrderData = {
  paymentOrderId: number;
  stream: string;
  patientAppId: number;
  medicineOrderId: number | null;
  doctorId: number;
  patientId: number;
  amount: number;
  currency: string;
  status: string; // PENDING | AWAITING_GATEWAY | PAY_AT_CLINIC | CAPTURED | FAILED
  method: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  idempotencyKey?: string;
  correlationId?: string;
  createdAt?: string;
};

export type CreateConsultOrderResponse = {
  success: boolean;
  message: string;
  gatewayReady?: boolean;
  keyId?: string;
  checkoutMethods?: string[];
  data: ConsultPaymentOrderData;
};

export type VerifyPaymentRequest = {
  paymentOrderId: number;
  gatewayPaymentId?: string;
};

export type VerifyPaymentResponse = {
  success: boolean;
  message: string;
  data: ConsultPaymentOrderData;
};

export type AppointmentPaymentSummaryData = {
  patientAppId: number;
  paymentStatus: string;
  paymentMethod?: string;
  orders?: ConsultPaymentOrderData[];
};

export type AppointmentPaymentSummaryResponse = {
  success: boolean;
  data: AppointmentPaymentSummaryData;
};

export type PaymentHistoryItem = {
  paymentOrderId: number;
  stream: 'CONSULT' | 'MEDICINE' | string;
  patientAppId: number | null;
  medicineOrderId: number | null;
  doctorId?: number | null;
  patientId?: number | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  createdAt: string;
};

export type PaymentHistoryResponse = {
  success: boolean;
  data: PaymentHistoryItem[];
};

export type RefundPolicyData = {
  policy: 'FULL' | 'PARTIAL' | 'NONE' | string;
  amount: number;
  reason?: string;
};

export type RefundPolicyResponse = {
  success: boolean;
  data: RefundPolicyData;
};

/**
 * Payment Endpoints:
 * - G12: POST /api/Payments/ConsultOrders
 * - G13: POST /api/Payments/Verify
 * - G14: GET /api/Payments/Appointments/{patientAppId}
 * - G16: GET /api/Patient/Payments (History)
 * - H6: GET /api/Refunds/Policy/{paymentOrderId}
 */
export const paymentsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    createConsultOrder: build.mutation<
      CreateConsultOrderResponse,
      CreateConsultOrderRequest
    >({
      query: (body) => ({
        url: 'api/Payments/ConsultOrders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visits', 'Payments'],
    }),
    verifyPayment: build.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (body) => ({
        url: 'api/Payments/Verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visits', 'Payments'],
    }),
    getAppointmentPaymentSummary: build.query<
      AppointmentPaymentSummaryResponse,
      number | string
    >({
      query: (patientAppId) => `api/Payments/Appointments/${patientAppId}`,
      providesTags: ['Visits'],
    }),
    getPaymentsHistory: build.query<PaymentHistoryResponse, void>({
      query: () => 'api/Patient/Payments',
      providesTags: ['Payments'],
    }),
    getRefundPolicy: build.query<RefundPolicyResponse, number | string>({
      query: (paymentOrderId) => `api/Refunds/Policy/${paymentOrderId}`,
    }),
  }),
});

export const {
  useCreateConsultOrderMutation,
  useVerifyPaymentMutation,
  useGetAppointmentPaymentSummaryQuery,
  useGetPaymentsHistoryQuery,
  useGetRefundPolicyQuery,
} = paymentsApi;
