export type MedicineOrderStageKey =
  | 'awaiting_quote'
  | 'quote_received'
  | 'awaiting_payment'
  | 'in_process'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type MedicineOrderNextAction = 'accept' | 'pay' | null;

export type OrderMedicinesLaunch = {
  erxSnapshotId?: number | null;
  patientAppId?: number | null;
  refillRequestId?: number | null;
};

export function medicineOrderStage(rawStatus: string | null | undefined): {
  key: MedicineOrderStageKey;
  action: MedicineOrderNextAction;
  step: number;
} {
  const status = String(rawStatus || '').toUpperCase();
  if (/CANCEL|REJECT/.test(status)) {
    return { key: 'cancelled', action: null, step: -1 };
  }
  if (/DELIVER|COMPLETE/.test(status)) {
    return { key: 'delivered', action: null, step: 4 };
  }
  if (/DISPATCH|OUT_FOR/.test(status)) {
    return { key: 'out_for_delivery', action: null, step: 3 };
  }
  if (status === 'QUOTED_ACCEPTED') {
    return { key: 'awaiting_payment', action: 'pay', step: 1 };
  }
  if (status === 'QUOTED') {
    return { key: 'quote_received', action: 'accept', step: 1 };
  }
  if (/PAID|COD|CONFIRM|PROCESS|READY|PACK/.test(status)) {
    return { key: 'in_process', action: null, step: 2 };
  }
  return { key: 'awaiting_quote', action: null, step: 1 };
}

/** Null, missing, or non-positive quotes stay hidden. Never format them as ₹0. */
export function formatQuoteAmount(
  amount: number | null | undefined,
  currency?: string | null,
): string | null {
  const value = Number(amount);
  if (amount == null || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  const prefix = !currency || currency === 'INR' ? '₹' : `${currency} `;
  return `${prefix}${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
