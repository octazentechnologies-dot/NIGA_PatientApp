import { useEffect, useState } from 'react';

import {
  DEFAULT_PAY_METHOD,
  PAY_BANKS,
  PAY_WALLETS,
  SLOT_HOLD_SECONDS,
  formatHoldTime,
  type PayMethodId,
  type PayOption,
} from '../config/bookingPayment';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type BookingPaymentDraft = {
  paymentSummaryLine: string;
  doctorFeeLabel: string;
  platformFeeLabel: string;
  taxesLabel: string;
  totalLabel: string;
};

export type BookingPaymentViewModel = BookingPaymentDraft & {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  holdLabel: string;
  holdSeconds: number;
  holdExpired: boolean;
  breakdownOpen: boolean;
  method: PayMethodId;
  upiId: string;
  banks: PayOption[];
  wallets: PayOption[];
  selectedBankId: string | null;
  selectedWalletId: string | null;
  bankPickerOpen: boolean;
  walletPickerOpen: boolean;
  selectedBankLabel: string;
  selectedWalletLabel: string;
  payLabel: string;
  onBack: () => void;
  onToggleBreakdown: () => void;
  onSelectMethod: (id: PayMethodId) => void;
  onChangeUpiId: (value: string) => void;
  onOpenBankPicker: () => void;
  onCloseBankPicker: () => void;
  onSelectBank: (id: string) => void;
  onOpenWalletPicker: () => void;
  onCloseWalletPicker: () => void;
  onSelectWallet: (id: string) => void;
  onAddCard: () => void;
  onPay: () => void;
};

export function useBookingPaymentController({
  draft,
  active,
  onBack,
  onPay,
}: {
  draft: BookingPaymentDraft;
  active: boolean;
  onBack: () => void;
  onPay: (method: PayMethodId, upiId: string) => void;
}): BookingPaymentViewModel {
  const { language, t } = useLocalization();
  const [secondsLeft, setSecondsLeft] = useState(SLOT_HOLD_SECONDS);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [method, setMethod] = useState<PayMethodId>(DEFAULT_PAY_METHOD);
  const [upiId, setUpiId] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      setSecondsLeft(SLOT_HOLD_SECONDS);
      setBreakdownOpen(false);
      setMethod(DEFAULT_PAY_METHOD);
      setUpiId('');
      setSelectedBankId(null);
      setSelectedWalletId(null);
      setBankPickerOpen(false);
      setWalletPickerOpen(false);
      return;
    }
    setSecondsLeft(SLOT_HOLD_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [active]);

  const selectedBank = PAY_BANKS.find((item) => item.id === selectedBankId);
  const selectedWallet = PAY_WALLETS.find((item) => item.id === selectedWalletId);

  return {
    language,
    t,
    ...draft,
    holdLabel: t('paySlotHeld').replace('{time}', formatHoldTime(secondsLeft)),
    holdSeconds: secondsLeft,
    holdExpired: secondsLeft <= 0,
    breakdownOpen,
    method,
    upiId,
    banks: PAY_BANKS,
    wallets: PAY_WALLETS,
    selectedBankId,
    selectedWalletId,
    bankPickerOpen,
    walletPickerOpen,
    selectedBankLabel: selectedBank ? t(selectedBank.nameKey) : t('paySelectBank'),
    selectedWalletLabel: selectedWallet ? t(selectedWallet.nameKey) : t('payWallets'),
    payLabel: t('payCta').replace('{amount}', draft.totalLabel),
    onBack,
    onToggleBreakdown: () => setBreakdownOpen((current) => !current),
    onSelectMethod: (id) => {
      setMethod(id);
      setBankPickerOpen(false);
      setWalletPickerOpen(false);
    },
    onChangeUpiId: setUpiId,
    onOpenBankPicker: () => {
      setMethod('netbanking');
      setBankPickerOpen(true);
    },
    onCloseBankPicker: () => setBankPickerOpen(false),
    onSelectBank: (id) => {
      setSelectedBankId(id);
      setMethod('netbanking');
      setBankPickerOpen(false);
    },
    onOpenWalletPicker: () => {
      setMethod('wallet');
      setWalletPickerOpen(true);
    },
    onCloseWalletPicker: () => setWalletPickerOpen(false),
    onSelectWallet: (id) => {
      setSelectedWalletId(id);
      setMethod('wallet');
      setWalletPickerOpen(false);
    },
    onAddCard: () => setMethod('addCard'),
    onPay: () => onPay(method, upiId),
  };
}
