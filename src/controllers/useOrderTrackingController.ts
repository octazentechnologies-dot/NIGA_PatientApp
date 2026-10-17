import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetMedicineOrderTrackingQuery } from '../store/api/new/medicinesApi';
import { useAppSelector } from '../store/hooks';
import { formatMoney } from '../utilities/formatters';

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
  onSupport: () => void;
  onCallPartner: () => void;
  onChatPartner: () => void;
  onReschedule: () => void;
  onSwitchPickup: () => void;
  onDownloadInvoice: () => void;
  onSelectRating: (value: number) => void;
  onSetStatus: (status: OrderTrackingStatus) => void;
};

function mapStatus(serverStatus: string | undefined): OrderTrackingStatus {
  if (serverStatus === 'DELIVERED') return 'delivered';
  if (serverStatus === 'DISPATCHED') return 'out_for_delivery';
  if (serverStatus === 'REJECTED') return 'failed';
  return 'verifying';
}

export function useOrderTrackingController({
  orderId,
  onBack,
}: {
  orderId: string;
  onBack: () => void;
}): OrderTrackingViewModel {
  const { language, t } = useLocalization();
  const [status, setStatus] = useState<OrderTrackingStatus>('verifying');
  const [rating, setRating] = useState(0);

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
    if (data?.status) {
      setStatus(mapStatus(data.status));
    }
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
  const totalLabel = formatMoney(data?.quoteAmount ?? null, currency) ?? '';

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
    isError: hasValidId && isError && !notFound,
    notFound: !hasValidId || notFound,
    onRetry: () => {
      void refetch();
    },
    onBack,
    onSupport: () => undefined,
    onCallPartner: () => undefined,
    onChatPartner: () => undefined,
    onReschedule: () => undefined,
    onSwitchPickup: () => undefined,
    onDownloadInvoice: () => undefined,
    onSelectRating: setRating,
    onSetStatus: setStatus,
  };
}

export function trackingStepIndex(status: OrderTrackingStatus): number {
  if (status === 'delivered') return 4;
  if (status === 'out_for_delivery') return 3;
  if (status === 'failed') return 1;
  return 2;
}
