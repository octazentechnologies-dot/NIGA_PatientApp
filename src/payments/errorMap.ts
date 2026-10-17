/**
 * Map Razorpay / gateway error codes to user-safe copy.
 * Never surface signatures, tokens, or full payloads.
 */
const KNOWN: Record<string, string> = {
  BAD_REQUEST_ERROR: 'That payment could not be started. Please try again.',
  GATEWAY_ERROR: 'The payment service had a problem. Please try again.',
  NETWORK_ERROR: 'Check your connection and try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled.',
  HOLD_EXPIRED: 'Your slot hold has expired. Please book again.',
  NOT_CAPTURED: 'Payment received — confirming with the server…',
  FEE_NOT_CONFIGURED: 'A fee is not set for this visit. Contact support.',
  AMOUNT_MISMATCH: 'The payment amount changed. Please try again.',
  PAY_AT_CLINIC_DISABLED: 'Pay at clinic is not available for this visit.',
};

const GENERIC =
  'We could not complete the payment. You can try again or contact support.';

export function mapPaymentError(
  code: string | null | undefined,
  description?: string | null,
): string {
  const key = (code || '').trim().toUpperCase();
  if (key && KNOWN[key]) {
    return KNOWN[key];
  }
  const desc = description?.trim();
  // Razorpay sometimes returns a short user-safe description.
  if (desc && desc.length <= 120 && !/signature|secret|token/i.test(desc)) {
    return desc;
  }
  return GENERIC;
}
