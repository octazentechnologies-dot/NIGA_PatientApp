/** Server-created order fields needed to open Razorpay Checkout. */
export type ServerCheckoutOrder = {
  paymentOrderId: number;
  /** Amount in rupees (API unit). Convert to paise only at the Checkout boundary. */
  amount: number;
  currency: string;
  gatewayOrderId: string;
  keyId: string;
  gatewayReady: boolean;
};

export type CheckoutSuccess = {
  type: 'SUCCESS';
  paymentId: string;
  orderId: string;
  signature: string;
};

export type CheckoutCancelled = { type: 'CANCELLED' };

export type CheckoutFailed = {
  type: 'FAILED';
  code: string;
  description: string;
};

export type CheckoutNetworkError = { type: 'NETWORK_ERROR' };

export type CheckoutResult =
  | CheckoutSuccess
  | CheckoutCancelled
  | CheckoutFailed
  | CheckoutNetworkError;

export type PaymentFlowState =
  | 'IDLE'
  | 'CREATING_ORDER'
  | 'OPENING_CHECKOUT'
  | 'VERIFYING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PENDING_CONFIRMATION'
  | 'BLOCKED';

export type PaymentPrefill = {
  name?: string | null;
  email?: string | null;
  contact?: string | null;
};

export type PendingPaymentRecord = {
  paymentOrderId: number;
  flow: 'consult' | 'medicine';
  patientAppId?: number | null;
  medicineOrderId?: number | null;
  savedAt: string;
  /** After Checkout SUCCESS — used to resume Verify without re-opening Razorpay. */
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
};
