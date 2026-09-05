import type { TranslationKey } from '../localization/types';

export type PayMethodId =
  | 'gpay'
  | 'phonepe'
  | 'paytm'
  | 'upi'
  | 'hdfc'
  | 'addCard'
  | 'netbanking'
  | 'wallet';

export type PayOption = {
  id: string;
  nameKey: TranslationKey;
};

export const DEFAULT_PAY_METHOD: PayMethodId = 'gpay';
export const SLOT_HOLD_SECONDS = 10 * 60;

export const PAY_BANKS: PayOption[] = [
  { id: 'hdfc', nameKey: 'payBankHdfc' },
  { id: 'sbi', nameKey: 'payBankSbi' },
  { id: 'icici', nameKey: 'payBankIcici' },
];

export const PAY_WALLETS: PayOption[] = [
  { id: 'amazon', nameKey: 'payWalletAmazon' },
  { id: 'mobikwik', nameKey: 'payWalletMobikwik' },
];

export function formatHoldTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  const pad = (value: number) => (value < 10 ? `0${value}` : String(value));
  return `${pad(minutes)}:${pad(rest)}`;
}
