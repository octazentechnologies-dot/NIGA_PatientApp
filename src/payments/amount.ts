/**
 * API amounts are in rupees (G12). Razorpay Checkout expects paise.
 * Convert only at the Checkout boundary — never when displaying money.
 */
export function rupeesToPaise(amountRupees: number): number {
  if (!Number.isFinite(amountRupees) || amountRupees < 0) {
    return 0;
  }
  return Math.round(amountRupees * 100);
}

/** True when the server order needs no Checkout (zero fee). */
export function isZeroAmountOrder(amountRupees: number | null | undefined): boolean {
  return amountRupees == null || Number(amountRupees) === 0;
}
