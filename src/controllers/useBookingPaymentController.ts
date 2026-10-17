import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PAY_METHOD,
  PAY_BANKS,
  PAY_WALLETS,
  formatHoldTime,
  type PayMethodId,
  type PayOption,
} from '../config/bookingPayment';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppConfig } from '../providers/AppConfigProvider';
import { usePayment, type PaymentFlowState } from '../payments';
import { useCreateConsultOrderMutation } from '../store/api/new/paymentsApi';
import { useGetPatientProfileQuery } from '../store/api/new/patientProfileApi';
import { useAppSelector } from '../store/hooks';

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
  /** When true, Razorpay Checkout owns method selection — hide local bank/UPI mocks. */
  usesGatewayCheckout: boolean;
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
  payBusy: boolean;
  payError: string | null;
  paymentState: PaymentFlowState;
  payAtClinicEnabled: boolean;
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
  onPayAtClinic: () => void;
};

function secondsUntil(iso: string | null | undefined): number {
  if (!iso) {
    return 0;
  }
  const end = Date.parse(iso);
  if (!Number.isFinite(end)) {
    return 0;
  }
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
}

export function useBookingPaymentController({
  draft,
  active,
  holdExpiresAt,
  patientAppId,
  bookingToken,
  payAtClinicEnabled = false,
  onBack,
  onPaymentConfirmed,
  onPaymentPending,
  onPaymentFailed,
}: {
  draft: BookingPaymentDraft;
  active: boolean;
  holdExpiresAt: string | null;
  patientAppId: number | null;
  bookingToken: string | null;
  payAtClinicEnabled?: boolean;
  onBack: () => void;
  onPaymentConfirmed: (paymentOrderId: number) => void;
  onPaymentPending?: (paymentOrderId: number) => void;
  onPaymentFailed?: (message: string) => void;
}): BookingPaymentViewModel {
  const { language, t } = useLocalization();
  const appConfig = useAppConfig();
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(holdExpiresAt));
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [method, setMethod] = useState<PayMethodId>(DEFAULT_PAY_METHOD);
  const [upiId, setUpiId] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const authMobile = useAppSelector((s) => s.auth.mobile);
  const { data: profileResponse } = useGetPatientProfileQuery(undefined, {
    skip: !isAuthenticated || !active,
  });
  const profile = profileResponse?.data;

  const [createConsultOrder] = useCreateConsultOrderMutation();

  const prefill = useMemo(
    () => ({
      name:
        profile?.patientName ||
        authUser?.patientName ||
        [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
        null,
      email: profile?.email || authUser?.email || null,
      contact:
        profile?.mobileNo ||
        authUser?.mobile ||
        authUser?.mobileNo ||
        authMobile ||
        null,
    }),
    [authMobile, authUser, profile],
  );

  const payment = usePayment({
    flow: 'consult',
    appConfigKeyId: appConfig.razorpayKeyId,
    prefill,
    description: draft.paymentSummaryLine || 'Consultation',
    patientAppId,
    createOrder: async () => {
      if (!patientAppId) {
        throw { data: { code: 'VALIDATION', message: 'Booking is missing. Please book again.' } };
      }
      const idempotencyKey = `pa-${patientAppId}-${Date.now()}`;
      const res = await createConsultOrder({
        patientAppId,
        bookingToken: bookingToken || undefined,
        payAtClinic: false,
        idempotencyKey,
        // Do not send amount — server quotes from the visit fee.
      }).unwrap();
      return {
        gatewayReady: res.gatewayReady,
        keyId: res.keyId,
        message: res.message,
        data: res.data,
      };
    },
    onConfirmed: (order) => {
      onPaymentConfirmed(order.paymentOrderId);
    },
  });

  const { reset: resetPayment } = payment;

  useEffect(() => {
    if (!active) {
      setBreakdownOpen(false);
      setMethod(DEFAULT_PAY_METHOD);
      setUpiId('');
      setSelectedBankId(null);
      setSelectedWalletId(null);
      setBankPickerOpen(false);
      setWalletPickerOpen(false);
      setLocalError(null);
      resetPayment();
      return;
    }
    setSecondsLeft(secondsUntil(holdExpiresAt));
    const timer = setInterval(() => {
      setSecondsLeft(secondsUntil(holdExpiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [active, holdExpiresAt, resetPayment]);

  useEffect(() => {
    if (payment.state === 'PENDING_CONFIRMATION' && payment.paymentOrderId) {
      onPaymentPending?.(payment.paymentOrderId);
    }
    if (payment.state === 'FAILED' && payment.errorMessage) {
      onPaymentFailed?.(payment.errorMessage);
    }
  }, [
    onPaymentFailed,
    onPaymentPending,
    payment.errorMessage,
    payment.paymentOrderId,
    payment.state,
  ]);

  const holdExpired = secondsLeft <= 0 && Boolean(holdExpiresAt);
  const selectedBank = PAY_BANKS.find((item) => item.id === selectedBankId);
  const selectedWallet = PAY_WALLETS.find((item) => item.id === selectedWalletId);

  const onPay = useCallback(() => {
    setLocalError(null);
    if (holdExpired) {
      setLocalError('Your slot hold has expired. Please choose another time.');
      return;
    }
    if (!patientAppId) {
      setLocalError('Booking is incomplete. Go back and book again.');
      return;
    }
    void payment.startPayment();
  }, [holdExpired, patientAppId, payment]);

  const onPayAtClinic = useCallback(() => {
    if (!payAtClinicEnabled || !patientAppId) {
      return;
    }
    void (async () => {
      try {
        setLocalError(null);
        const idempotencyKey = `pa-clinic-${patientAppId}-${Date.now()}`;
        await createConsultOrder({
          patientAppId,
          bookingToken: bookingToken || undefined,
          payAtClinic: true,
          idempotencyKey,
        }).unwrap();
        // Pay-at-clinic is recorded; visit stays unpaid until reception — treat as pending success path.
        onPaymentPending?.(0);
      } catch (err) {
        const e = err as { data?: { message?: string } };
        setLocalError(e?.data?.message || 'Could not record pay at clinic.');
      }
    })();
  }, [
    bookingToken,
    createConsultOrder,
    onPaymentPending,
    patientAppId,
    payAtClinicEnabled,
  ]);

  const payError = localError || payment.errorMessage;
  const payBusy = payment.busy || payment.state === 'CREATING_ORDER';

  return {
    language,
    t,
    ...draft,
    holdLabel: holdExpiresAt
      ? t('paySlotHeld').replace('{time}', formatHoldTime(secondsLeft))
      : t('paySlotHeld').replace('{time}', '--:--'),
    holdSeconds: secondsLeft,
    holdExpired,
    breakdownOpen,
    usesGatewayCheckout: true,
    method,
    upiId,
    banks: PAY_BANKS,
    wallets: PAY_WALLETS,
    selectedBankId,
    selectedWalletId,
    bankPickerOpen,
    walletPickerOpen,
    selectedBankLabel: selectedBank ? t(selectedBank.nameKey) : t('paySelectBank'),
    selectedWalletLabel: selectedWallet
      ? t(selectedWallet.nameKey)
      : t('payWallets'),
    payLabel: payBusy
      ? t('payCta').replace('{amount}', '…')
      : t('payCta').replace('{amount}', draft.totalLabel || ''),
    payBusy,
    payError,
    paymentState: payment.state,
    payAtClinicEnabled,
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
    onPay,
    onPayAtClinic,
  };
}
