import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  DEFAULT_PAY_METHOD,
  PAY_BANKS,
  PAY_WALLETS,
  type PayMethodId,
  type PayOption,
} from '../config/bookingPayment';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppConfig } from '../providers/AppConfigProvider';
import {
  clearPendingPayment,
  readPendingPayment,
  usePayment,
  type PaymentFlowState,
} from '../payments';
import {
  useCreateConsultOrderMutation,
  useUpdateBookingPaymentMutation,
} from '../store/api/new/paymentsApi';
import { useGetPatientProfileQuery } from '../store/api/new/patientProfileApi';
import { extractErrorMessage } from '../store/api/new/newBaseApi';
import { useAppSelector } from '../store/hooks';

export type BookingPaymentDraft = {
  paymentSummaryLine: string;
  doctorFeeLabel: string;
  platformFeeLabel: string;
  taxesLabel: string;
  totalLabel: string;
};

export type SubmitBookingPaymentResult = {
  patientAppId: number;
  bookingToken: string;
  holdExpiresAt?: string;
  consultFee?: number;
};

export type BookingPaymentViewModel = BookingPaymentDraft & {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
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
  /** Show only when consult mode is InClinic. */
  showPayAtClinic: boolean;
  paymentOrderId: number | null;
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
  resumePendingPayment: (paymentOrderId?: number) => void;
  reset: () => void;
};

export function useBookingPaymentController({
  draft,
  active,
  patientAppId: initialPatientAppId,
  bookingToken: initialBookingToken,
  isInClinicMode = false,
  onBack,
  onSubmitBooking,
  onPaymentConfirmed,
  onPaymentPending,
  onPaymentFailed,
  onPayAtClinicSuccess,
}: {
  draft: BookingPaymentDraft;
  active: boolean;
  patientAppId: number | null;
  bookingToken: string | null;
  /** Consult mode is InClinic — show Pay at Clinic Instead. */
  isInClinicMode?: boolean;
  onBack: () => void;
  onSubmitBooking: (payment: {
    payAtClinic: boolean;
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
  }) => Promise<SubmitBookingPaymentResult>;
  onPaymentConfirmed: (paymentOrderId: number, confirmedPatientAppId?: number) => void;
  onPaymentPending?: (paymentOrderId: number) => void;
  onPaymentFailed?: (message: string) => void;
  onPayAtClinicSuccess?: (result: SubmitBookingPaymentResult) => void;
}): BookingPaymentViewModel {
  const { language, t } = useLocalization();
  const appConfig = useAppConfig();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [method, setMethod] = useState<PayMethodId>(DEFAULT_PAY_METHOD);
  const [upiId, setUpiId] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [clinicBusy, setClinicBusy] = useState(false);
  const [livePatientAppId, setLivePatientAppId] = useState<number | null>(
    initialPatientAppId,
  );
  const [liveBookingToken, setLiveBookingToken] = useState<string | null>(
    initialBookingToken,
  );

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const authMobile = useAppSelector((s) => s.auth.mobile);
  const { data: profileResponse } = useGetPatientProfileQuery(undefined, {
    skip: !isAuthenticated || !active,
  });
  const profile = profileResponse?.data;

  const [createConsultOrder] = useCreateConsultOrderMutation();
  const [updateBookingPayment] = useUpdateBookingPaymentMutation();

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

  const onPaymentPendingRef = useRef(onPaymentPending);
  onPaymentPendingRef.current = onPaymentPending;
  const onSubmitBookingRef = useRef(onSubmitBooking);
  onSubmitBookingRef.current = onSubmitBooking;
  const livePatientAppIdRef = useRef(livePatientAppId);
  livePatientAppIdRef.current = livePatientAppId;
  const liveBookingTokenRef = useRef(liveBookingToken);
  liveBookingTokenRef.current = liveBookingToken;

  const payment = usePayment({
    flow: 'consult',
    appConfigKeyId: appConfig.razorpayKeyId,
    prefill,
    description: draft.paymentSummaryLine || 'Consultation',
    patientAppId: livePatientAppId,
    createOrder: async () => {
      // Ensure a visit exists so ConsultOrders can quote the fee / create gateway order.
      let patientAppId = livePatientAppIdRef.current;
      let bookingToken = liveBookingTokenRef.current;
      if (!patientAppId) {
        const hold = await onSubmitBookingRef.current({
          payAtClinic: false,
          razorpay_order_id: null,
          razorpay_payment_id: null,
        });
        patientAppId = hold.patientAppId;
        bookingToken = hold.bookingToken;
        setLivePatientAppId(hold.patientAppId);
        setLiveBookingToken(hold.bookingToken);
        livePatientAppIdRef.current = hold.patientAppId;
        liveBookingTokenRef.current = hold.bookingToken;
      }

      const idempotencyKey = `pa-${patientAppId}-${Date.now()}`;
      const isRealToken = Boolean(bookingToken && bookingToken.trim().length >= 20);
      if (__DEV__) {
        console.log(
          `💳 [useBookingPaymentController] Initiating ConsultOrders (patientAppId: ${patientAppId}, anonymous: ${isRealToken})`,
        );
      }
      const res = await createConsultOrder({
        patientAppId,
        bookingToken: bookingToken || undefined,
        payAtClinic: false,
        idempotencyKey,
        anonymous: isRealToken,
      }).unwrap();
      return {
        gatewayReady: res.gatewayReady,
        keyId: res.keyId,
        message: res.message,
        data: {
          ...res.data,
          patientAppId,
        },
      };
    },
    onCheckoutSuccess: async (checkout) => {
      // After Razorpay SUCCESS — POST /Payments/Bookings/UpdatePayment (pay later contract).
      // Fail soft: Verify poll still runs if UpdatePayment is not PAID yet.
      const patientAppId = livePatientAppIdRef.current;
      const userId =
        typeof authUser?.userId === 'number' ? authUser.userId : undefined;
      if (patientAppId == null || userId == null) {
        console.warn(
          '[BookingPayment] UpdatePayment skipped — missing patientAppId or userId',
        );
        return undefined;
      }
      try {
        const res = await updateBookingPayment({
          userId,
          patientAppId,
          razorpay_order_id: checkout.orderId,
          razorpay_payment_id: checkout.paymentId,
          paymentOrderId: checkout.paymentOrderId,
        }).unwrap();
        const status = (res.data?.paymentStatus || '').toUpperCase();
        const paid = status === 'PAID' || status === 'CAPTURED' || status === 'SUCCESS';
        return { paid, method: res.data?.method ?? null };
      } catch (attachErr) {
        console.warn(
          '[BookingPayment] UpdatePayment failed — Verify poll will continue:',
          attachErr,
        );
        return undefined;
      }
    },
    onConfirmed: (order) => {
      const confirmedPatientAppId =
        order.patientAppId || livePatientAppIdRef.current || undefined;
      onPaymentConfirmed(order.paymentOrderId, confirmedPatientAppId);
    },
    onPendingConfirmation: (orderId) => {
      onPaymentPendingRef.current?.(orderId);
    },
  });

  const { reset: resetPayment, resumePending } = payment;
  const resumedForSession = useRef<number | null>(null);
  const failedNotifiedRef = useRef(false);
  const prevActiveRef = useRef(active);

  useEffect(() => {
    if (!active) {
      if (prevActiveRef.current) {
        setBreakdownOpen(false);
        setMethod(DEFAULT_PAY_METHOD);
        setUpiId('');
        setSelectedBankId(null);
        setSelectedWalletId(null);
        setBankPickerOpen(false);
        setWalletPickerOpen(false);
        setLocalError(null);
        setClinicBusy(false);
        setLivePatientAppId(null);
        setLiveBookingToken(null);
        livePatientAppIdRef.current = null;
        liveBookingTokenRef.current = null;
        failedNotifiedRef.current = false;
        resetPayment();
        resumedForSession.current = null;
      }
      prevActiveRef.current = active;
      return;
    }
    // Starting or resuming active payment view
    if (!prevActiveRef.current) {
      resetPayment();
      resumedForSession.current = null;
      setBreakdownOpen(false);
      setLocalError(null);
      setClinicBusy(false);
      failedNotifiedRef.current = false;
    }
    prevActiveRef.current = active;
    setLivePatientAppId(initialPatientAppId);
    setLiveBookingToken(initialBookingToken);
    livePatientAppIdRef.current = initialPatientAppId;
    liveBookingTokenRef.current = initialBookingToken;
  }, [active, initialBookingToken, initialPatientAppId, resetPayment]);

  useEffect(() => {
    if (!active || livePatientAppId == null) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const pending = await readPendingPayment();
      if (cancelled || !pending) {
        return;
      }
      // Stale or unlinked pending records must be cleared, never resumed
      const isExpired =
        !pending.savedAt ||
        Date.now() - new Date(pending.savedAt).getTime() > 15 * 60 * 1000;
      if (isExpired || !pending.patientAppId) {
        await clearPendingPayment();
        return;
      }
      if (pending.flow !== 'consult' || pending.patientAppId !== livePatientAppId) {
        return;
      }
      if (resumedForSession.current === pending.paymentOrderId) {
        return;
      }
      resumedForSession.current = pending.paymentOrderId;
      onPaymentPendingRef.current?.(pending.paymentOrderId);
      await resumePending(pending.paymentOrderId);
    })();
    return () => {
      cancelled = true;
    };
  }, [active, livePatientAppId, resumePending]);

  useEffect(() => {
    if (!active) {
      return;
    }
    const onChange = (next: AppStateStatus) => {
      if (next !== 'active') {
        return;
      }
      if (payment.state !== 'PENDING_CONFIRMATION' || payment.paymentOrderId == null) {
        return;
      }
      void resumePending(payment.paymentOrderId);
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [active, payment.paymentOrderId, payment.state, resumePending]);

  useEffect(() => {
    if (payment.state === 'FAILED') {
      const reason = payment.errorMessage || 'Payment failed';
      if (!failedNotifiedRef.current) {
        failedNotifiedRef.current = true;
        onPaymentFailed?.(reason);
      }
    } else {
      failedNotifiedRef.current = false;
    }
  }, [onPaymentFailed, payment.errorMessage, payment.state]);

  const selectedBank = PAY_BANKS.find((item) => item.id === selectedBankId);
  const selectedWallet = PAY_WALLETS.find((item) => item.id === selectedWalletId);

  const onPay = useCallback(() => {
    setLocalError(null);
    void payment.startPayment();
  }, [payment]);

  const onPayAtClinic = useCallback(() => {
    if (!isInClinicMode || clinicBusy) {
      return;
    }
    void (async () => {
      try {
        setClinicBusy(true);
        setLocalError(null);
        const result = await onSubmitBooking({
          payAtClinic: true,
          razorpay_order_id: null,
          razorpay_payment_id: null,
        });
        setLivePatientAppId(result.patientAppId);
        setLiveBookingToken(result.bookingToken);
        // Clear any stale pending payments upon recording clinic pay
        await clearPendingPayment();
        if (onPayAtClinicSuccess) {
          onPayAtClinicSuccess(result);
        } else {
          onPaymentPendingRef.current?.(0);
        }
      } catch (err) {
        const e = err as { data?: unknown };
        setLocalError(
          extractErrorMessage(e?.data ?? err, 'Could not record pay at clinic.'),
        );
      } finally {
        setClinicBusy(false);
      }
    })();
  }, [clinicBusy, isInClinicMode, onPayAtClinicSuccess, onSubmitBooking]);

  const payError = localError || payment.errorMessage;
  const payBusy =
    clinicBusy || payment.busy || payment.state === 'CREATING_ORDER';

  return {
    language,
    t,
    ...draft,
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
    showPayAtClinic: isInClinicMode,
    paymentOrderId: payment.paymentOrderId,
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
    resumePendingPayment: (orderId) => {
      void resumePending(orderId);
    },
    reset: resetPayment,
  };
}
