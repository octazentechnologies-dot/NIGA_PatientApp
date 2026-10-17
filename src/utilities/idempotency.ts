/**
 * Idempotency-Key for POST Bookings and POST AppointmentRequests (BE-027).
 * Same key for retries of the same attempt; new key after form edits or a new attempt.
 */
export function createIdempotencyKey(prefix: string): string {
  const rand =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `${prefix}-${rand}`.slice(0, 80);
}
