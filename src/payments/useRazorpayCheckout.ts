import { useCallback } from 'react';
import { Platform } from 'react-native';

import { colors } from '../theme/colors';
import { rupeesToPaise } from './amount';
import { mapPaymentError } from './errorMap';
import { maskPaymentId } from './pendingPaymentStore';
import type {
  CheckoutResult,
  PaymentPrefill,
  ServerCheckoutOrder,
} from './types';

function logDev(message: string, detail?: Record<string, string>): void {
  if (__DEV__) {
    console.log(`[payments] ${message}`, detail ?? '');
  }
}

/**
 * Opens Razorpay Checkout for a **server-created** order.
 * Amount is converted to paise only here. Never pass a client-computed price.
 */
export function useRazorpayCheckout() {
  const openCheckout = useCallback(
    async (
      order: ServerCheckoutOrder,
      prefill?: PaymentPrefill,
      description?: string,
    ): Promise<CheckoutResult> => {
      if (!order.gatewayReady || !order.keyId || !order.gatewayOrderId) {
        return {
          type: 'FAILED',
          code: 'GATEWAY',
          description: 'Online payment is not available right now.',
        };
      }
      if (!Number.isFinite(order.amount) || order.amount <= 0) {
        return {
          type: 'FAILED',
          code: 'FEE_NOT_CONFIGURED',
          description: mapPaymentError('FEE_NOT_CONFIGURED'),
        };
      }

      let RazorpayCheckout: typeof import('react-native-razorpay').default;
      try {
        // Native module — requires a custom dev client / prebuild, not Expo Go.
        RazorpayCheckout = (await import('react-native-razorpay')).default;
      } catch {
        return {
          type: 'FAILED',
          code: 'GATEWAY',
          description:
            'Payment requires a development build. Expo Go cannot open Checkout.',
        };
      }

      const options = {
        key: order.keyId,
        amount: rupeesToPaise(order.amount),
        currency: order.currency || 'INR',
        name: 'HelloHomeo',
        description: description || 'Consultation',
        order_id: order.gatewayOrderId,
        prefill: {
          ...(prefill?.name ? { name: prefill.name } : {}),
          ...(prefill?.email ? { email: prefill.email } : {}),
          ...(prefill?.contact ? { contact: prefill.contact } : {}),
        },
        theme: { color: colors.primary },
      };
      console.log("options for razorpay", options)

      logDev('opening checkout', {
        paymentOrderId: maskPaymentId(order.paymentOrderId),
        platform: Platform.OS,
      });

      try {
        const result = await RazorpayCheckout.open(options);
        logDev('checkout success', {
          paymentId: maskPaymentId(result.razorpay_payment_id),
        });
        return {
          type: 'SUCCESS',
          paymentId: result.razorpay_payment_id,
          orderId: result.razorpay_order_id,
          signature: result.razorpay_signature,
        };
      } catch (err) {
        const e = err as {
          code?: number | string;
          description?: string;
          error?: { code?: string; description?: string; reason?: string };
        };
        const code = String(e?.error?.code ?? e?.code ?? '');
        const description =
          e?.error?.description || e?.description || e?.error?.reason || '';
        // Razorpay uses code 0 / 2 for user cancel on many builds.
        if (
          code === '0' ||
          code === '2' ||
          /cancel/i.test(description) ||
          /cancel/i.test(String(e?.error?.reason ?? ''))
        ) {
          logDev('checkout cancelled');
          return { type: 'CANCELLED' };
        }
        if (/network|internet|timeout/i.test(description)) {
          return { type: 'NETWORK_ERROR' };
        }
        logDev('checkout failed', { code: maskPaymentId(code) });
        return {
          type: 'FAILED',
          code: code || 'GATEWAY_ERROR',
          description: mapPaymentError(code, description),
        };
      }
    },
    [],
  );

  return { openCheckout };
}
