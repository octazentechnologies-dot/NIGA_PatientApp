import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import { showAppToast } from '../utilities/toast';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useAcceptMedicineQuoteMutation,
  useGetMedicineOrderTrackingQuery,
  useReviewMedicineOrderMutation,
} from '../store/api/new/medicinesApi';
import { useAppSelector } from '../store/hooks';
import {
  formatQuoteAmount,
  medicineOrderStage,
  type MedicineOrderNextAction,
} from '../utilities/medicineOrderStage';

export type OrderTrackingStatus =
  | 'verifying'
  | 'out_for_delivery'
  | 'failed'
  | 'delivered';

export type TrackingStepId =
  | 'placed'
  | 'packed'
  | 'verified'
  | 'out'
  | 'home';

export type TrackingTimelineEvent = {
  id: string;
  at: string;
  status: string;
  label: string;
};

export type TrackingLineVm = {
  id: string;
  remedyName: string;
  potencyCode: string | null;
  quantityLabel: string | null;
};

export type OrderTrackingViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  orderId: string;
  status: OrderTrackingStatus;
  otpDigits: string[];
  partnerName: string;
  partnerRating: string;
  distanceAway: string;
  arrivingBy: string;
  deliveredAt: string;
  rating: number;
  medicineLine: string;
  medicinePrice: string;
  deliveryFee: string;
  totalLabel: string;
  timeline: TrackingTimelineEvent[];
  lines: TrackingLineVm[];
  isLoading: boolean;
  isError: boolean;
  notFound: boolean;
  onRetry: () => void;
  onBack: () => void;
  onOpenDetails: () => void;
  onSupport: () => void;
  onCallPartner: () => void;
  onChatPartner: () => void;
  onReschedule: () => void;
  onSwitchPickup: () => void;
  onDownloadInvoice: () => void;
  onSelectRating: (value: number) => void;
  onSetStatus: (status: OrderTrackingStatus) => void;
  stageLabel: string;
  nextAction: MedicineOrderNextAction;
  quoteLabel: string;
  reviewComment: string;
  actionBusy: boolean;
  onChangeReviewComment: (value: string) => void;
  onAcceptQuote: () => void;
  onPay: () => void;
  onSubmitReview: () => void;
};

const STAGE_LABEL_KEY = {
  awaiting_quote: 'trackAwaitingQuoteTitle',
  quote_received: 'trackQuoteReceivedTitle',
  awaiting_payment: 'trackAwaitingPayTitle',
  in_process: 'medsInProcess',
  out_for_delivery: 'medsOutForDelivery',
  delivered: 'medsStatusDelivered',
  cancelled: 'medsCancelled',
} as const;

export function trackingEventIcon(
  status: string,
): 'checkmark' | 'cube-outline' | 'checkmark-done-outline' | 'bicycle-outline' | 'home-outline' | 'cash-outline' | 'close' {
  const value = status.toUpperCase();
  if (/CANCEL|REJECT/.test(value)) return 'close';
  if (/DELIVER|COMPLETE/.test(value)) return 'home-outline';
  if (/DISPATCH|OUT_FOR/.test(value)) return 'bicycle-outline';
  if (/READY|PACK/.test(value)) return 'cube-outline';
  if (/QUOTED_ACCEPTED|ACCEPT|OTP|VERIFY|CONSENT/.test(value)) return 'checkmark-done-outline';
  if (/QUOTE|COD|PAID|PAY/.test(value)) return 'cash-outline';
  return 'checkmark';
}

export function useOrderTrackingController({
  orderId,
  onBack,
  onOpenDetails,
  onPayOrder,
}: {
  orderId: string;
  onBack: () => void;
  onOpenDetails?: () => void;
  onPayOrder?: (orderId: number) => void;
}): OrderTrackingViewModel {
  const { language, t } = useLocalization();
  const [status, setStatus] = useState<OrderTrackingStatus>('verifying');
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [acceptQuote, { isLoading: acceptBusy }] = useAcceptMedicineQuoteMutation();
  const [submitReview, { isLoading: reviewBusy }] = useReviewMedicineOrderMutation();

  const numericOrderId = Number(String(orderId).replace(/\D/g, ''));
  const hasValidId = Number.isFinite(numericOrderId) && numericOrderId > 0;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: trackingResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMedicineOrderTrackingQuery(numericOrderId, {
    skip: !isAuthenticated || !hasValidId,
    pollingInterval: 5000,
  });

  const data = trackingResponse?.data;

  useEffect(() => {
    if (!data?.status) return;
    const next = medicineOrderStage(data.status);
    if (next.key === 'delivered') setStatus('delivered');
    else if (next.key === 'out_for_delivery') setStatus('out_for_delivery');
    else if (next.key === 'cancelled') setStatus('failed');
    else setStatus('verifying');
  }, [data?.status]);

  const timeline = useMemo<TrackingTimelineEvent[]>(() => {
    const events = Array.isArray(data?.events) ? data.events : [];
    return events.map((ev, index) => ({
      id: `ev-${index}-${ev.at}`,
      at: ev.at || '',
      status: ev.status || '',
      label: (ev.label || ev.detail || ev.status || '').trim(),
    }));
  }, [data?.events]);

  const lines = useMemo<TrackingLineVm[]>(() => {
    const rows = Array.isArray(data?.lines)
      ? data.lines
      : Array.isArray(data?.items)
        ? data.items
        : [];
    return rows.map((row, index) => ({
      id: `line-${index}`,
      remedyName: (row.remedyName || '').trim() || 'Medicine',
      potencyCode: row.potencyCode?.trim() || null,
      quantityLabel: row.quantityLabel?.trim() || null,
    }));
  }, [data?.items, data?.lines]);

  const medicineLine = lines
    .map((line) =>
      [line.remedyName, line.potencyCode, line.quantityLabel]
        .filter(Boolean)
        .join(' · '),
    )
    .filter(Boolean)
    .join('; ');

  const currency = data?.currency ?? 'INR';
  const quoteLabel = formatQuoteAmount(data?.quoteAmount, currency) ?? '';
  const totalLabel = quoteLabel;
  const stage = medicineOrderStage(data?.status);

  const apiOrderId = data?.medicineOrderId;
  const displayOrderId =
    apiOrderId != null
      ? `#HM-${apiOrderId}`
      : hasValidId
        ? `#HM-${numericOrderId}`
        : '';

  const errStatus =
    error && typeof error === 'object' && 'status' in error
      ? Number((error as { status?: number }).status)
      : undefined;
  const notFound = errStatus === 404;

  return {
    language,
    t,
    orderId: displayOrderId,
    status,
    otpDigits: [],
    partnerName: '',
    partnerRating: '',
    distanceAway: '',
    arrivingBy: '',
    deliveredAt: status === 'delivered' ? (timeline[timeline.length - 1]?.at ?? '') : '',
    rating,
    medicineLine,
    medicinePrice: '',
    deliveryFee: '',
    totalLabel,
    timeline,
    lines,
    isLoading: hasValidId && isLoading,
    isError: hasValidId && isError && !notFound && !data,
    notFound: !data && (!hasValidId || notFound),
    onRetry: () => {
      void refetch();
    },
    onBack,
    onOpenDetails: () => onOpenDetails?.(),
    onSupport: () => undefined,
    onCallPartner: () => undefined,
    onChatPartner: () => undefined,
    onReschedule: () => undefined,
    onSwitchPickup: () => undefined,
    onDownloadInvoice: () => undefined,
    onSelectRating: setRating,
    onSetStatus: setStatus,
    stageLabel: t(STAGE_LABEL_KEY[stage.key]),
    nextAction: stage.action,
    quoteLabel,
    reviewComment,
    actionBusy: acceptBusy || reviewBusy,
    onChangeReviewComment: setReviewComment,
    onAcceptQuote: () => {
      if (!hasValidId) return;
      void acceptQuote(numericOrderId).unwrap().catch(() => undefined);
    },
    onPay: () => {
      if (!hasValidId || !quoteLabel) return;
      onPayOrder?.(numericOrderId);
    },
    onSubmitReview: () => {
      if (!hasValidId || rating < 1) return;
      void submitReview({
        medicineOrderId: numericOrderId,
        rating,
        comment: reviewComment.trim() || null,
      })
        .unwrap()
        .then((payload) => {
          const message = payload?.message?.trim();
          if (!message) {
            showAppToast({ type: 'success', message: t('trackReviewSaved') });
          }
        })
        .catch(() => undefined);
    },
  };
}

export function trackingStepIndex(status: OrderTrackingStatus): number {
  if (status === 'delivered') return 4;
  if (status === 'out_for_delivery') return 3;
  if (status === 'failed') return 1;
  return 2;
}
