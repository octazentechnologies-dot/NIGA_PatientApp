import { useCallback, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import {
  useAcceptMedicineQuoteMutation,
  useCreateMedicineOrderMutation,
  useGetMedicineOrdersQuery,
  useGetRefillsQuery,
  useGrantMedicineConsentMutation,
} from '../store/api/new/medicinesApi';
import { useGetPrescriptionsListQuery } from '../store/api/new/recordsApi';
import { useAppSelector } from '../store/hooks';
import {
  formatQuoteAmount,
  medicineOrderStage,
  type MedicineOrderNextAction,
  type MedicineOrderStageKey,
  type OrderMedicinesLaunch,
} from '../utilities/medicineOrderStage';

export type MedicinesMemberId = string;

export type PastOrderFilter = 'all' | 'delivered' | 'cancelled' | 'refunded';

export type PastOrderStatus = 'delivered' | 'cancelled' | 'refunded';

export type OrderableRx = {
  id: string;
  patientAppId: number | null;
  title: string;
  doctorLine: string;
  badgeKey: TranslationKey;
  expired: boolean;
  canOrder: boolean;
};

export type PastOrder = {
  id: string;
  orderLabel: string;
  dateLabel: string;
  status: PastOrderStatus;
  statusKey: TranslationKey;
  medsLine: string;
  pharmacy: string;
  priceLabel: string;
  priceStruck?: boolean;
  refundNote?: boolean;
  canReorder?: boolean;
};

export type OpenMedicineOrder = {
  id: string;
  orderLabel: string;
  statusKey: TranslationKey;
  action: MedicineOrderNextAction;
  quoteLabel: string;
  pharmacy: string;
  progressFilled: number;
  progressTotal: number;
};

export type RefillBanner = {
  id: string;
  erxSnapshotId: number | null;
  patientAppId: number | null;
  title: string;
  subtitle: string;
};

const STAGE_LABEL: Record<MedicineOrderStageKey, TranslationKey> = {
  awaiting_quote: 'medsAwaitingQuote',
  quote_received: 'medsQuoteReceived',
  awaiting_payment: 'medsAwaitingPayment',
  in_process: 'medsInProcess',
  out_for_delivery: 'medsOutForDelivery',
  delivered: 'medsStatusDelivered',
  cancelled: 'medsCancelled',
};

export type MedicinesViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  hasOrders: boolean;
  memberId: MedicinesMemberId;
  members: { id: MedicinesMemberId; labelKey: TranslationKey }[];
  pastFilter: PastOrderFilter;
  pastFilters: { id: PastOrderFilter; labelKey: TranslationKey }[];
  openOrders: OpenMedicineOrder[];
  activeOrderId: string;
  activeStatusLine: string;
  activeProgressFilled: number;
  activeProgressTotal: number;
  arrivingBy: string;
  fulfilledBy: string;
  orderableRx: OrderableRx[];
  pastOrders: PastOrder[];
  pendingRefills: RefillBanner[];
  approvedRefills: RefillBanner[];
  actionNote: string | null;
  onSelectMember: (id: MedicinesMemberId) => void;
  onSelectPastFilter: (id: PastOrderFilter) => void;
  onTrackOrder: (orderId?: string) => void;
  onOrderRx: (rx: OrderableRx) => void;
  onBookFollowUp: () => void;
  onReorder: (id: string) => void;
  onOpenPastOrder: (id: string) => void;
  onAcceptQuote: (id: string) => void;
  onPayOrder: (id: string) => void;
  onStartRefill: (refill: RefillBanner) => void;
  onOpenHelp: () => void;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onSeePrescriptions: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
};

const MEMBERS: MedicinesViewModel['members'] = [
  { id: 'everyone', labelKey: 'medsMemberEveryone' },
  { id: 'self', labelKey: 'medsMemberMyself' },
];

const PAST_FILTERS: MedicinesViewModel['pastFilters'] = [
  { id: 'all', labelKey: 'medsFilterAll' },
  { id: 'delivered', labelKey: 'medsFilterDelivered' },
  { id: 'cancelled', labelKey: 'medsFilterCancelled' },
  { id: 'refunded', labelKey: 'medsFilterRefunded' },
];

export function useMedicinesController({
  onBookFollowUp,
  onSeePrescriptions,
  onTrackOrder,
  onOrderRx,
  onOpenPastOrder,
  onOpenNotifications,
  onPayOrder,
  onStartRefillOrder,
  forceHasOrders,
}: {
  onBookFollowUp?: () => void;
  onSeePrescriptions?: () => void;
  onTrackOrder?: (orderId?: string) => void;
  onOrderRx?: (launch: OrderMedicinesLaunch) => void;
  onOpenPastOrder?: (id: string) => void;
  onOpenNotifications?: () => void;
  onPayOrder?: (orderId: number) => void;
  onStartRefillOrder?: (launch: OrderMedicinesLaunch) => void;
  forceHasOrders?: boolean;
} = {}): MedicinesViewModel {
  const { language, t, setLanguage } = useLocalization();
  const [memberId, setMemberId] = useState<MedicinesMemberId>('everyone');
  const [pastFilter, setPastFilter] = useState<PastOrderFilter>('all');
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: ordersResponse, refetch: refetchOrders } = useGetMedicineOrdersQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const { data: refillsResponse, refetch: refetchRefills } = useGetRefillsQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const { data: rxList, refetch: refetchPrescriptions } = useGetPrescriptionsListQuery(
    undefined,
    { skip: !isAuthenticated },
  );
  const { data: familyResponse, refetch: refetchFamily } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [acceptQuote] = useAcceptMedicineQuoteMutation();
  const [createOrder] = useCreateMedicineOrderMutation();
  const [grantConsent] = useGrantMedicineConsentMutation();

  const orders = ordersResponse?.data ?? [];

  const openOrders = useMemo<OpenMedicineOrder[]>(() => {
    return orders
      .filter((order) => {
        const stage = medicineOrderStage(order.status);
        return stage.key !== 'delivered' && stage.key !== 'cancelled';
      })
      .map((order) => {
        const stage = medicineOrderStage(order.status);
        return {
          id: String(order.medicineOrderId),
          orderLabel: `#HM-${order.medicineOrderId}`,
          statusKey: STAGE_LABEL[stage.key],
          action: stage.action,
          quoteLabel: formatQuoteAmount(order.quoteAmount) ?? '',
          pharmacy: t('medsPartnerPharmacy'),
          progressFilled: Math.max(stage.step, 1),
          progressTotal: 4,
        };
      });
  }, [orders, t]);

  const pastOrders = useMemo(() => {
    const rows: PastOrder[] = [];
    for (const order of orders) {
      const stage = medicineOrderStage(order.status);
      if (stage.key !== 'delivered' && stage.key !== 'cancelled') continue;
      const status: PastOrderStatus = stage.key === 'cancelled' ? 'cancelled' : 'delivered';
      rows.push({
        id: String(order.medicineOrderId),
        orderLabel: `Order #HM-${order.medicineOrderId}`,
        dateLabel: t('medsRecent'),
        status,
        statusKey: status === 'cancelled' ? 'medsCancelled' : 'medsStatusDelivered',
        medsLine: order.erxSnapshotId ? `eRx #${order.erxSnapshotId}` : '',
        pharmacy: t('medsPartnerPharmacy'),
        priceLabel: formatQuoteAmount(order.quoteAmount) ?? '',
        canReorder: Number(order.erxSnapshotId) > 0,
      });
    }
    if (pastFilter === 'all') return rows;
    return rows.filter((order) => order.status === pastFilter);
  }, [orders, pastFilter, t]);

  const orderableRx = useMemo<OrderableRx[]>(() => {
    return (rxList?.data ?? [])
      .filter((row) => Number(row.erxSnapshotId) > 0)
      .map((row) => {
        const signed = Boolean(row.signedAt) || /signed|locked/i.test(row.status || '');
        return {
          id: String(row.erxSnapshotId),
          patientAppId: row.patientAppId ?? null,
          title: `eRx #${row.erxSnapshotId}`,
          doctorLine: row.doctorName?.trim() || '',
          badgeKey: signed ? 'medsSignedRx' : 'rxMustSign',
          expired: !signed,
          canOrder: signed,
        };
      });
  }, [rxList?.data]);

  const toRefill = (row: {
    refillRequestId: number;
    erxSnapshotId: number;
    patientAppId: number;
    doctorName: string;
    status: string;
  }): RefillBanner => ({
    id: String(row.refillRequestId),
    erxSnapshotId: Number(row.erxSnapshotId) > 0 ? Number(row.erxSnapshotId) : null,
    patientAppId: row.patientAppId ?? null,
    title: row.erxSnapshotId ? `eRx #${row.erxSnapshotId}` : t('medsRefillApprovedTitle'),
    subtitle: row.doctorName?.trim() || '',
  });

  const pendingRefills = (refillsResponse?.data ?? [])
    .filter((row) => String(row.status).toUpperCase() === 'PENDING')
    .map(toRefill);
  const approvedRefills = (refillsResponse?.data ?? [])
    .filter((row) => String(row.status).toUpperCase() === 'APPROVED')
    .map(toRefill);

  const members = useMemo(() => {
    const base: { id: MedicinesMemberId; labelKey: TranslationKey }[] = [...MEMBERS];
    if (familyResponse?.data) {
      for (const member of familyResponse.data) {
        base.push({
          id: String(member.familyMemberId),
          labelKey: (member.fullName || member.relation) as TranslationKey,
        });
      }
    }
    return base;
  }, [familyResponse?.data]);

  const onRefresh = useCallback(() => {
    if (!isAuthenticated || isRefreshing) return;
    setIsRefreshing(true);
    void Promise.all([
      refetchOrders(),
      refetchRefills(),
      refetchPrescriptions(),
      refetchFamily(),
    ]).finally(() => setIsRefreshing(false));
  }, [
    isAuthenticated,
    isRefreshing,
    refetchFamily,
    refetchOrders,
    refetchPrescriptions,
    refetchRefills,
  ]);

  const firstOpen = openOrders[0];
  const hasOrders =
    forceHasOrders ||
    openOrders.length > 0 ||
    pastOrders.length > 0 ||
    orderableRx.length > 0 ||
    pendingRefills.length > 0 ||
    approvedRefills.length > 0;

  return {
    language,
    t,
    hasOrders,
    memberId,
    members,
    pastFilter,
    pastFilters: PAST_FILTERS,
    openOrders,
    activeOrderId: firstOpen?.orderLabel ?? '',
    activeStatusLine: firstOpen ? t(firstOpen.statusKey) : '',
    activeProgressFilled: firstOpen?.progressFilled ?? 1,
    activeProgressTotal: firstOpen?.progressTotal ?? 4,
    arrivingBy: firstOpen ? t(firstOpen.statusKey) : '',
    fulfilledBy: firstOpen?.pharmacy ?? '',
    orderableRx,
    pastOrders,
    pendingRefills,
    approvedRefills,
    actionNote,
    onSelectMember: setMemberId,
    onSelectPastFilter: setPastFilter,
    onTrackOrder: (orderId) => onTrackOrder?.(orderId),
    onOrderRx: (rx) => {
      if (!rx.canOrder) return;
      onOrderRx?.({
        erxSnapshotId: Number(rx.id),
        patientAppId: rx.patientAppId,
      });
    },
    onBookFollowUp: () => onBookFollowUp?.(),
    onReorder: (id) => {
      const order = orders.find((row) => String(row.medicineOrderId) === id);
      const erxSnapshotId = Number(order?.erxSnapshotId);
      if (!Number.isFinite(erxSnapshotId) || erxSnapshotId <= 0) return;
      void createOrder({ erxSnapshotId })
        .unwrap()
        .then(async (res) => {
          const orderId = res.data?.medicineOrderId;
          if (!orderId) return;
          await grantConsent(orderId).unwrap();
          setActionNote(t('medsReorderPlaced'));
        })
        .catch(() => {
          setActionNote(t('orderMedsMissingSnapshot'));
        });
    },
    onOpenPastOrder: (id) => onOpenPastOrder?.(id),
    onAcceptQuote: (id) => {
      const orderId = Number(id);
      if (!Number.isFinite(orderId) || orderId <= 0) return;
      void acceptQuote(orderId)
        .unwrap()
        .then(() => setActionNote(t('medsAwaitingPayment')))
        .catch(() => undefined);
    },
    onPayOrder: (id) => {
      const orderId = Number(id);
      if (!Number.isFinite(orderId) || orderId <= 0) return;
      onPayOrder?.(orderId);
    },
    onStartRefill: (refill) => {
      onStartRefillOrder?.({
        erxSnapshotId: refill.erxSnapshotId,
        patientAppId: refill.patientAppId,
        refillRequestId: Number(refill.id),
      });
    },
    onOpenHelp: () => undefined,
    onOpenSupport: () => undefined,
    onOpenNotifications: () => onOpenNotifications?.(),
    onSelectLanguage: setLanguage,
    onSeePrescriptions: () => onSeePrescriptions?.(),
    isRefreshing,
    onRefresh,
  };
}
