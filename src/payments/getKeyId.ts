/**
 * Resolve the public Razorpay Key ID.
 * Prefer the order response `keyId`, then AppConfig `razorpayKeyId`.
 * Never fall back to a hardcoded key.
 */
export function resolveRazorpayKeyId(
  orderKeyId: string | null | undefined,
  appConfigKeyId: string | null | undefined,
): string | null {
  const fromOrder = orderKeyId?.trim();
  if (fromOrder) {
    return fromOrder;
  }
  const fromConfig = appConfigKeyId?.trim();
  if (fromConfig) {
    return fromConfig;
  }
  return null;
}

export const ONLINE_PAYMENT_UNAVAILABLE =
  'Online payment is not available right now.';
