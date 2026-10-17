import * as SecureStore from 'expo-secure-store';

import type { PendingPaymentRecord } from './types';

const KEY = 'payments.pendingOrder';

/** Store only non-sensitive ids — never signatures or tokens. */
export async function savePendingPayment(
  record: PendingPaymentRecord,
): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(record));
}

export async function readPendingPayment(): Promise<PendingPaymentRecord | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as PendingPaymentRecord;
  } catch {
    return null;
  }
}

export async function clearPendingPayment(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}

export function maskPaymentId(id: string | number | null | undefined): string {
  if (id == null) {
    return '—';
  }
  const s = String(id);
  if (s.length <= 4) {
    return '****';
  }
  return `…${s.slice(-4)}`;
}
