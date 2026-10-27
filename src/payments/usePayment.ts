import { useCallback, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

import {
  useVerifyPaymentMutation,
  type ConsultPaymentOrderData,
} from '../store/api/new/paymentsApi';
import { mapPaymentError } from './errorMap';
import {
  ONLINE_PAYMENT_UNAVAILABLE,
  resolveRazorpayKeyId,
} from './getKeyId';
import { isZeroAmountOrder } from './amount';
import {
  clearPendingPayment,
  maskPaymentId,
  savePendingPayment,
} from './pendingPaymentStore';
import { useRazorpayCheckout } from './useRazorpayCheckout';
import type {
  PaymentFlowState,
  PaymentPrefill,
  ServerCheckoutOrder,
} from './types';

const POLL_MS = 3000;
const POLL_MAX_MS = 60_000;

export type CreateOrderResult = {
  gatewayReady?: boolean | null;
  keyId?: string | null;
  message?: string;
  data: {
    paymentOrderId: number;
    amount?: number | null;
    currency?: string | null;
    gatewayOrderId?: string | null;
    status?: string | null;
  };
};

export type UsePaymentOptions = {
  flow: 'consult' | 'medicine';
  appConfigKeyId: string | null;
  prefill?: PaymentPrefill;
  description?: string;
  /** Create the server order. Must not invent amount. */
  createOrder: () => Promise<CreateOrderResult>;
  patientAppId?: number | null;
  medicineOrderId?: number | null;
  onConfirmed?: (order: ConsultPaymentOrderData) => void;
  /** Fired when Verify poll times out — pending SecureStore kept for resume. */
  onPendingConfirmation?: (paymentOrderId: number) => void;
  /**
   * After Checkout SUCCESS (before Verify poll).
   * Prefer `POST /Payments/Bookings/UpdatePayment`. Return `{ paid: true }` when
   * `data.paymentStatus === 'PAID'` so the flow can skip Verify polling.
   */
  onCheckoutSuccess?: (checkout: {
    paymentId: string;
    orderId: string;
    signature: string;
    paymentOrderId: number;
  }) => Promise<void | { paid?: boolean; method?: string | null }>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logDev(message: string, detail?: Record<string, string>): void {
  if (__DEV__) {
    console.log(`[payments] ${message}`, detail ?? '');
  }
}

function toServerOrder(
  created: CreateOrderResult,
  appConfigKeyId: string | null,
): ServerCheckoutOrder | { blocked: string } {
  const keyId = resolveRazorpayKeyId(created.keyId, appConfigKeyId);
  const gatewayOrderId = created.data.gatewayOrderId?.trim() || null;
  const amount = created.data.amount;
  // Block only when the server says not ready, or Checkout fields are missing.
  if (created.gatewayReady === false || !keyId || !gatewayOrderId) {
    return { blocked: ONLINE_PAYMENT_UNAVAILABLE };
  }
  if (isZeroAmountOrder(amount)) {
    return {
      blocked:
        'No online payment is required for this order. Refresh your booking status.',
    };
  }
  return {
    paymentOrderId: created.data.paymentOrderId,
    amount: Number(amount),
    currency: created.data.currency || 'INR',
    gatewayOrderId,
    keyId,
    gatewayReady: true,
  };
}

/**
 * Orchestrates create-order → Checkout → verify/poll.
 * Never marks paid from Checkout success alone.
 */
export function usePayment(options: UsePaymentOptions) {
  const {
    flow,
    appConfigKeyId,
    prefill,
    description,
    createOrder,
    patientAppId,
    medicineOrderId,
    onConfirmed,
    onPendingConfirmation,
    onCheckoutSuccess,
  } = options;

  const { openCheckout } = useRazorpayCheckout();
  // TODO(PAYMENT): phase2 — keep Gateway verify + poll; do not trust client success alone (BE-P01…P06).
  const [verifyPayment] = useVerifyPaymentMutation();
  const [state, setState] = useState<PaymentFlowState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<number | null>(null);
  const inFlight = useRef(false);
  const onConfirmedRef = useRef(onConfirmed);
  const onPendingRef = useRef(onPendingConfirmation);
  const onCheckoutSuccessRef = useRef(onCheckoutSuccess);
  onConfirmedRef.current = onConfirmed;
  onPendingRef.current = onPendingConfirmation;
  onCheckoutSuccessRef.current = onCheckoutSuccess;

  const reset = useCallback(() => {
    inFlight.current = false;
    setState('IDLE');
    setErrorMessage(null);
    setPaymentOrderId(null);
  }, []);

  const pollUntilCaptured = useCallback(
    async (
      orderId: number,
      checkout?: {
        paymentId?: string;
        orderId?: string;
        signature?: string;
      },
    ) => {
      const started = Date.now();
      while (Date.now() - started < POLL_MAX_MS) {
        try {
          const res = await verifyPayment({
            paymentOrderId: orderId,
            gatewayPaymentId: checkout?.paymentId,
            razorpay_payment_id: checkout?.paymentId,
            razorpay_order_id: checkout?.orderId,
            razorpay_signature: checkout?.signature,
          }).unwrap();
          const status = (res.data?.status || '').toUpperCase();
          if (status === 'CAPTURED' || status === 'PAID' || status === 'SUCCESS') {
            await clearPendingPayment();
            setState('CONFIRMED');
            onConfirmedRef.current?.(res.data);
            return;
          }
          if (status === 'FAILED') {
            await clearPendingPayment();
            setState('FAILED');
            setErrorMessage(mapPaymentError('GATEWAY_ERROR', res.message));
            return;
          }
        } catch (err) {
          const e = err as { status?: number; data?: { code?: string; message?: string } };
          if (e?.status === 409 || e?.data?.code === 'NOT_CAPTURED') {
            // Webhook not yet applied — keep polling.
          } else if (e?.data?.code === 'HOLD_EXPIRED') {
            await clearPendingPayment();
            setState('FAILED');
            setErrorMessage(mapPaymentError('HOLD_EXPIRED', e.data.message));
            return;
          } else {
            logDev('verify poll error', {
              code: String(e?.data?.code ?? e?.status ?? ''),
            });
          }
        }
        await sleep(POLL_MS);
      }
      // Keep SecureStore pending so Check status / app resume can re-poll.
      setState('PENDING_CONFIRMATION');
      setErrorMessage(
        'Payment received, confirming… Check this screen again in a minute, or open Support if it stays pending.',
      );
      onPendingRef.current?.(orderId);
    },
    [verifyPayment],
  );

  const resumePending = useCallback(
    async (orderId?: number) => {
      const id = orderId ?? paymentOrderId;
      if (id == null || inFlight.current) {
        return;
      }
      inFlight.current = true;
      setPaymentOrderId(id);
      setState('VERIFYING');
      setErrorMessage(null);
      try {
        await pollUntilCaptured(id);
      } finally {
        inFlight.current = false;
      }
    },
    [paymentOrderId, pollUntilCaptured],
  );

  const startPayment = useCallback(async () => {
    if (inFlight.current || (state !== 'IDLE' && state !== 'FAILED' && state !== 'CANCELLED' && state !== 'BLOCKED')) {
      return;
    }
    inFlight.current = true;
    setErrorMessage(null);

    const net = await NetInfo.fetch();
    if (net.isConnected === false) {
      setState('BLOCKED');
      setErrorMessage('You are offline. Connect to the internet to pay.');
      inFlight.current = false;
      return;
    }

    let orderPatientAppId: number | null = patientAppId ?? null;
    try {
      setState('CREATING_ORDER');
      const created = await createOrder();
      orderPatientAppId =
        (created.data as { patientAppId?: number | null })?.patientAppId ??
        patientAppId ??
        null;
      const mapped = toServerOrder(created, appConfigKeyId);
      if ('blocked' in mapped) {
        setState('BLOCKED');
        setErrorMessage(mapped.blocked);
        return;
      }

      setPaymentOrderId(mapped.paymentOrderId);
      await savePendingPayment({
        paymentOrderId: mapped.paymentOrderId,
        flow,
        patientAppId: orderPatientAppId,
        medicineOrderId: medicineOrderId ?? null,
        savedAt: new Date().toISOString(),
      });

      setState('OPENING_CHECKOUT');
      const checkout = await openCheckout(mapped, prefill, description);

      if (checkout.type === 'CANCELLED') {
        // User closed Checkout without paying — drop pending so resume won't re-poll unpaid.
        await clearPendingPayment();
        setState('CANCELLED');
        setErrorMessage(null);
        return;
      }
      if (checkout.type === 'NETWORK_ERROR') {
        // Payment may have succeeded offline — treat as pending confirmation.
        setState('PENDING_CONFIRMATION');
        setErrorMessage(mapPaymentError('NETWORK_ERROR'));
        onPendingRef.current?.(mapped.paymentOrderId);
        return;
      }
      if (checkout.type === 'FAILED') {
        await clearPendingPayment();
        setState('FAILED');
        setErrorMessage(checkout.description);
        return;
      }

      // Checkout SUCCESS — UpdatePayment (preferred), then Verify poll if not yet PAID.
      // Never mark paid from Checkout alone.
      logDev('checkout ok → UpdatePayment + verify', {
        paymentOrderId: maskPaymentId(mapped.paymentOrderId),
        paymentId: maskPaymentId(checkout.paymentId),
      });
      let alreadyPaid = false;
      let paidMethod: string | null | undefined;
      if (onCheckoutSuccessRef.current) {
        const attachResult = await onCheckoutSuccessRef.current({
          paymentId: checkout.paymentId,
          orderId: checkout.orderId,
          signature: checkout.signature,
          paymentOrderId: mapped.paymentOrderId,
        });
        alreadyPaid = Boolean(attachResult?.paid);
        paidMethod = attachResult?.method;
      }
      if (alreadyPaid) {
        await clearPendingPayment();
        setState('CONFIRMED');
        onConfirmedRef.current?.({
          paymentOrderId: mapped.paymentOrderId,
          stream: 'CONSULT',
          patientAppId: orderPatientAppId ?? patientAppId ?? 0,
          medicineOrderId: medicineOrderId ?? null,
          doctorId: 0,
          patientId: 0,
          amount: mapped.amount,
          currency: mapped.currency,
          status: 'CAPTURED',
          method: paidMethod ?? null,
          gatewayOrderId: checkout.orderId,
          gatewayPaymentId: checkout.paymentId,
        });
        return;
      }
      setState('VERIFYING');
      await pollUntilCaptured(mapped.paymentOrderId, {
        paymentId: checkout.paymentId,
        orderId: checkout.orderId,
        signature: checkout.signature,
      });
    } catch (err) {
      const e = err as { data?: { code?: string; message?: string }; status?: number; message?: string };
      setState('FAILED');
      const mappedMsg =
        mapPaymentError(e?.data?.code, e?.data?.message) ||
        e?.message ||
        'Payment could not be started.';
      console.log('🚨 [usePayment] Payment error caught:', mappedMsg, err);
      setErrorMessage(mappedMsg);
    } finally {
      inFlight.current = false;
    }
  }, [
    appConfigKeyId,
    createOrder,
    description,
    flow,
    medicineOrderId,
    openCheckout,
    patientAppId,
    pollUntilCaptured,
    prefill,
    state,
  ]);

  const canPay =
    state === 'IDLE' ||
    state === 'FAILED' ||
    state === 'CANCELLED' ||
    state === 'BLOCKED';

  return {
    state,
    errorMessage,
    paymentOrderId,
    canPay,
    busy: !canPay && state !== 'CONFIRMED' && state !== 'PENDING_CONFIRMATION',
    startPayment,
    resumePending,
    reset,
  };
}
