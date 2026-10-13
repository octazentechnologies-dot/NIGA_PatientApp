import { useEffect, useMemo, useState } from 'react';

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

const PAYMENTS: PaymentItem[] = [
  {
    id: 'apt-88214',
    kind: 'consultation',
    titleKey: 'payHistItemConsultAnjali',
    amountLabel: '₹600',
    metaKey: 'payHistMetaConsultAnjali',
    status: 'paid',
    monthKey: 'payHistMonthAug2026',
  },
  {
    id: 'hm-4821',
    kind: 'medicines',
    titleKey: 'payHistItemMeds',
    amountLabel: '₹310',
    metaKey: 'payHistMetaMeds',
    status: 'paid',
    noteKey: 'payHistNoteMeds',
    monthKey: 'payHistMonthAug2026',
  },
  {
    id: 'cl-9921',
    kind: 'carelink',
    titleKey: 'payHistItemCareLink',
    amountLabel: '₹900',
    metaKey: 'payHistMetaCareLink',
    status: 'paid',
    noteKey: 'payHistNoteCareLink',
    monthKey: 'payHistMonthAug2026',
  },
  {
    id: 'apt-8772',
    kind: 'consultation',
    titleKey: 'payHistItemConsultPawar',
    amountLabel: '₹550',
    metaKey: 'payHistMetaConsultPawar',
    status: 'refunded',
    noteKey: 'payHistNoteRefund',
    monthKey: 'payHistMonthAug2026',
  },
];

const REFUND_STEPS: RefundStep[] = [
  {
    labelKey: 'payRefundStepInitiated',
    dateKey: 'payRefundDate24',
    done: true,
  },
  {
    labelKey: 'payRefundStepGateway',
    dateKey: 'payRefundDate25',
    done: true,
  },
  {
    labelKey: 'payRefundStepCredited',
    dateKey: 'payRefundDate26',
    detailKey: 'payRefundStepCreditedDetail',
    done: true,
  },
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
  const [demoToggle, setDemoToggle] = useState<boolean | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: historyResponse } = useGetPaymentsHistoryQuery(undefined, {
    skip: !isAuthenticated,
  });

  const serverPayments: PaymentItem[] = useMemo(() => {
    if (!isAuthenticated) {
      return PAYMENTS;
    }
    if (!historyResponse?.data || !Array.isArray(historyResponse.data)) {
      return [];
    }
    return historyResponse.data.map((order: PaymentHistoryItem) => {
      const isMedicine = order.stream === 'MEDICINE';
      const isRefunded =
        order.status === 'REFUNDED' || order.status === 'REFUND_PENDING';
      const dateStr = order.createdAt ? order.createdAt.slice(0, 10) : '';
      const methodStr = order.method || 'Online';
      return {
        id: String(order.paymentOrderId),
        kind: (isMedicine ? 'medicines' : 'consultation') as PaymentKind,
        titleKey: (isMedicine
          ? 'payHistItemMeds'
          : 'payHistItemConsult') as TranslationKey,
        amountLabel: `₹${order.amount}`,
        metaKey: `${dateStr} · ${methodStr} · #${order.paymentOrderId}` as TranslationKey,
        status: (isRefunded ? 'refunded' : 'paid') as PaymentStatus,
        noteKey: isRefunded ? ('payHistNoteRefund' as TranslationKey) : undefined,
        monthKey: 'payHistMonthAug2026' as TranslationKey,
      };
    });
  }, [historyResponse, isAuthenticated]);

  const hasPayments = useMemo(() => {
    if (demoToggle !== null) {
      return demoToggle;
    }
    if (historyResponse?.data) {
      return historyResponse.data.length > 0;
    }
    return true;
  }, [demoToggle, historyResponse]);

  const payments = useMemo(() => {
    if (!hasPayments) {
      return [];
    }
    const source =
      historyResponse?.data && historyResponse.data.length > 0
        ? serverPayments
        : PAYMENTS;

    return source.filter((item) => {
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
  }, [filter, hasPayments, historyResponse?.data, serverPayments]);

  return {
    language,
    t,
    hasPayments,
    filter,
    filters: FILTERS,
    summaryCards: [
      {
        labelKey: 'payHistRefundedMonth',
        value: '₹550',
      },
      {
        labelKey: 'payHistSavedMethods',
        value: '2',
      },
    ],
    monthLabel: t('payHistMonthAug2026'),
    payments,
    refundOpen,
    refundTitle: t('payHistItemConsultPawar'),
    refundDate: t('payRefundConsultDate'),
    refundAmount: '₹550',
    refundSteps: REFUND_STEPS,
    refundTotal: '₹550',
    refundMethod: t('payRefundMethod'),
    bankReference: 'RRN 449021771834',
    onBack,
    onDownload: () => undefined,
    onHelp: () => undefined,
    onSelectFilter: setFilter,
    onOpenPayment: (id) => {
      if (id === 'apt-8772') {
        setRefundOpen(true);
      }
    },
    onCloseRefund: () => setRefundOpen(false),
    onCopyReference: () => undefined,
    onContactSupport: () => undefined,
    onBookConsultation: () => onBookConsultation?.(),
    onToggleEmptyDemo: () => {
      setRefundOpen(false);
      setDemoToggle((prev) => (prev === null ? false : !prev));
      setFilter('all');
    },
  };
}
