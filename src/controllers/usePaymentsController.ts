import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetPaymentsHistoryQuery,
  type PaymentHistoryItem,
} from '../store/api/new/paymentsApi';
import { useAppSelector } from '../store/hooks';

export type PaymentFilter =
  | 'all'
  | 'consultations'
  | 'carelink'
  | 'medicines'
  | 'refunds';

export type PaymentKind = 'consultation' | 'medicines' | 'carelink';

export type PaymentStatus = 'paid' | 'refunded';

export type PaymentItem = {
  id: string;
  kind: PaymentKind;
  titleKey: TranslationKey;
  amountLabel: string;
  metaKey: TranslationKey;
  status: PaymentStatus;
  noteKey?: TranslationKey;
  monthKey: TranslationKey;
};

export type RefundStep = {
  labelKey: TranslationKey;
  dateKey: TranslationKey;
  detailKey?: TranslationKey;
  done: boolean;
};

export type PaymentsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  hasPayments: boolean;
  filter: PaymentFilter;
  filters: { id: PaymentFilter; labelKey: TranslationKey }[];
  summaryCards: { labelKey: TranslationKey; value: string; hintKey?: TranslationKey }[];
  monthLabel: string;
  payments: PaymentItem[];
  refundOpen: boolean;
  refundTitle: string;
  refundDate: string;
  refundAmount: string;
  refundSteps: RefundStep[];
  refundTotal: string;
  refundMethod: string;
  bankReference: string;
  onBack: () => void;
  onDownload: () => void;
  onHelp: () => void;
  onSelectFilter: (id: PaymentFilter) => void;
  onOpenPayment: (id: string) => void;
  onCloseRefund: () => void;
  onCopyReference: () => void;
  onContactSupport: () => void;
  onBookConsultation: () => void;
  onToggleEmptyDemo: () => void;
};

const FILTERS: PaymentsViewModel['filters'] = [
  { id: 'all', labelKey: 'payHistFilterAll' },
  { id: 'consultations', labelKey: 'payHistFilterConsultations' },
  { id: 'carelink', labelKey: 'payHistFilterCareLink' },
  { id: 'medicines', labelKey: 'payHistFilterMedicines' },
  { id: 'refunds', labelKey: 'payHistFilterRefunds' },
];

export function usePaymentsController({
  onBack,
  onBookConsultation,
}: {
  onBack: () => void;
  onBookConsultation?: () => void;
}): PaymentsViewModel {
  const { language, t } = useLocalization();
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [refundOpen, setRefundOpen] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: historyResponse,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useGetPaymentsHistoryQuery(undefined, {
    skip: !isAuthenticated,
  });

  const serverPayments: PaymentItem[] = useMemo(() => {
    if (!historyResponse?.data || !Array.isArray(historyResponse.data)) {
      return [];
    }
    return historyResponse.data.map((order: PaymentHistoryItem) => {
      const isMedicine = order.stream === 'MEDICINE';
      const isRefunded =
        order.status === 'REFUNDED' || order.status === 'REFUND_PENDING';
      const dateStr = order.createdAt ? order.createdAt.slice(0, 10) : '';
      const methodStr = order.method || 'Online';
      const amountLabel =
        order.amount == null ? '' : `₹${order.amount}`;
      return {
        id: String(order.paymentOrderId),
        kind: (isMedicine ? 'medicines' : 'consultation') as PaymentKind,
        titleKey: (isMedicine
          ? 'payHistItemMeds'
          : 'payHistItemConsult') as TranslationKey,
        amountLabel,
        metaKey: `${dateStr} · ${methodStr} · #${order.paymentOrderId}` as TranslationKey,
        status: (isRefunded ? 'refunded' : 'paid') as PaymentStatus,
        noteKey: isRefunded ? ('payHistNoteRefund' as TranslationKey) : undefined,
        monthKey: 'payHistMonthAug2026' as TranslationKey,
      };
    });
  }, [historyResponse]);

  const hasPayments = serverPayments.length > 0;

  const payments = useMemo(() => {
    return serverPayments.filter((item) => {
      switch (filter) {
        case 'consultations':
          return item.kind === 'consultation' && item.status === 'paid';
        case 'carelink':
          return item.kind === 'carelink';
        case 'medicines':
          return item.kind === 'medicines';
        case 'refunds':
          return item.status === 'refunded';
        default:
          return true;
      }
    });
  }, [filter, serverPayments]);

  return {
    language,
    t,
    hasPayments,
    filter,
    filters: FILTERS,
    summaryCards: [],
    monthLabel: '',
    payments,
    refundOpen,
    refundTitle: '',
    refundDate: '',
    refundAmount: '',
    refundSteps: [],
    refundTotal: '',
    refundMethod: '',
    bankReference: '',
    onBack,
    onDownload: () => undefined,
    onHelp: () => undefined,
    onSelectFilter: setFilter,
    onOpenPayment: (id) => {
      const row = serverPayments.find((item) => item.id === id);
      if (row?.status === 'refunded') {
        setRefundOpen(true);
      }
    },
    onCloseRefund: () => setRefundOpen(false),
    onCopyReference: () => undefined,
    onContactSupport: () => undefined,
    onBookConsultation: () => onBookConsultation?.(),
    onToggleEmptyDemo: () => {
      // Demo empty toggle removed — empty state follows API (M-053).
      if (isHistoryError) {
        void refetchHistory();
      }
    },
  };
}
