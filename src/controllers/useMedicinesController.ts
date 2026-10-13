import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetMedicineOrdersQuery } from '../store/api/new/medicinesApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useAppSelector } from '../store/hooks';

export type MedicinesMemberId = string;

export type PastOrderFilter = 'all' | 'delivered' | 'cancelled' | 'refunded';

export type PastOrderStatus = 'delivered' | 'cancelled' | 'refunded';

export type OrderableRx = {
  id: string;
  title: string;
  doctorLine: string;
  badgeKey: TranslationKey;
  expired: boolean;
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

export type MedicinesViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  hasOrders: boolean;
  memberId: MedicinesMemberId;
  members: { id: MedicinesMemberId; labelKey: TranslationKey }[];
  pastFilter: PastOrderFilter;
  pastFilters: { id: PastOrderFilter; labelKey: TranslationKey }[];
  activeOrderId: string;
  activeStatusLine: string;
  activeProgressFilled: number;
  activeProgressTotal: number;
  arrivingBy: string;
  fulfilledBy: string;
  orderableRx: OrderableRx[];
  pastOrders: PastOrder[];
  onSelectMember: (id: MedicinesMemberId) => void;
  onSelectPastFilter: (id: PastOrderFilter) => void;
  onTrackOrder: () => void;
  onOrderRx: (id: string) => void;
  onBookFollowUp: () => void;
  onReorder: (id: string) => void;
  onOpenPastOrder: (id: string) => void;
  onOpenHelp: () => void;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onSeePrescriptions: () => void;
};

const MEMBERS: MedicinesViewModel['members'] = [
  { id: 'everyone', labelKey: 'medsMemberEveryone' },
  { id: 'self', labelKey: 'medsMemberMyself' },
  { id: 'aarav', labelKey: 'medsMemberAarav' },
  { id: 'meera', labelKey: 'medsMemberMeera' },
];

const PAST_FILTERS: MedicinesViewModel['pastFilters'] = [
  { id: 'all', labelKey: 'medsFilterAll' },
  { id: 'delivered', labelKey: 'medsFilterDelivered' },
  { id: 'cancelled', labelKey: 'medsFilterCancelled' },
  { id: 'refunded', labelKey: 'medsFilterRefunded' },
];

const RX: OrderableRx[] = [];

const PAST: PastOrder[] = [];

export function useMedicinesController({
  onBookFollowUp,
  onSeePrescriptions,
  onTrackOrder,
  onOrderRx,
  onOpenPastOrder,
  onOpenNotifications,
  forceHasOrders,
}: {
  onBookFollowUp?: () => void;
  onSeePrescriptions?: () => void;
  onTrackOrder?: () => void;
  onOrderRx?: (id: string) => void;
  onOpenPastOrder?: (id: string) => void;
  onOpenNotifications?: () => void;
  /** After Place Order — keep the active order card visible. */
  forceHasOrders?: boolean;
} = {}): MedicinesViewModel {
  const { language, t, setLanguage } = useLocalization();
  const [memberId, setMemberId] = useState<MedicinesMemberId>('everyone');
  const [pastFilter, setPastFilter] = useState<PastOrderFilter>('all');

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: ordersResponse } = useGetMedicineOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });

  const activeOrder = useMemo(() => {
    if (!isAuthenticated || !ordersResponse?.data) return null;
    return (
      ordersResponse.data.find(
        (o) => o.status !== 'DELIVERED' && o.status !== 'REJECTED',
      ) ?? null
    );
  }, [isAuthenticated, ordersResponse?.data]);

  const pastOrders = useMemo(() => {
    if (isAuthenticated && ordersResponse?.data) {
      const serverOrders: PastOrder[] = ordersResponse.data.map((order) => {
        const isDelivered = order.status === 'DELIVERED';
        const isCancelled = order.status === 'REJECTED';
        const status: PastOrderStatus = isDelivered ? 'delivered' : isCancelled ? 'cancelled' : 'delivered';
        return {
          id: String(order.medicineOrderId),
          orderLabel: `Order #HM-${order.medicineOrderId}`,
          dateLabel: 'Recent',
          status,
          statusKey: isDelivered ? 'medsStatusDelivered' : isCancelled ? 'medsStatusCancelledByYou' : 'medsStatusDelivered',
          medsLine: `eRx #${order.erxSnapshotId}`,
          pharmacy: `Partner #${order.pharmacyPartnerId}`,
          priceLabel: order.quoteAmount != null ? `₹${order.quoteAmount.toFixed(2)}` : '₹0.00',
        };
      });
      if (pastFilter === 'all') {
        return serverOrders;
      }
      return serverOrders.filter((order) => order.status === pastFilter);
    }
    if (pastFilter === 'all') {
      return PAST;
    }
    return PAST.filter((order) => order.status === pastFilter);
  }, [isAuthenticated, ordersResponse, pastFilter]);

  const members = useMemo(() => {
    if (!isAuthenticated) return MEMBERS;
    const base: { id: MedicinesMemberId; labelKey: TranslationKey }[] = [
      { id: 'everyone', labelKey: 'medsMemberEveryone' },
      { id: 'self', labelKey: 'medsMemberMyself' },
    ];
    if (familyResponse?.data) {
      for (const m of familyResponse.data) {
        base.push({
          id: String(m.familyMemberId),
          labelKey: (m.fullName || m.relation) as TranslationKey,
        });
      }
    }
    return base;
  }, [isAuthenticated, familyResponse?.data]);

  const hasOrders = isAuthenticated
    ? Boolean(forceHasOrders || (ordersResponse?.data && ordersResponse.data.length > 0) || activeOrder)
    : forceHasOrders || memberId !== 'meera';

  const activeOrderId = isAuthenticated
    ? (activeOrder ? `#HM-${activeOrder.medicineOrderId}` : '')
    : '#HM-4821';
  const activeStatusLine = isAuthenticated
    ? (activeOrder ? activeOrder.status : '')
    : t('medsActiveStatusOut');
  const fulfilledBy = isAuthenticated
    ? (activeOrder
      ? (activeOrder.pharmacyPartnerId ? `Partner #${activeOrder.pharmacyPartnerId}` : 'Partner Pharmacy')
      : '')
    : t('medsFulfilledBy').replace('{name}', 'Harmony Homeopathics');
  const arrivingBy = isAuthenticated
    ? (activeOrder ? 'Expected in 2-3 Days' : '')
    : t('medsArrivingBy').replace('{time}', '8:45 PM');

  const orderableRx = isAuthenticated ? [] : RX;

  return {
    language,
    t,
    hasOrders,
    memberId,
    members,
    pastFilter,
    pastFilters: PAST_FILTERS,
    activeOrderId,
    activeStatusLine,
    activeProgressFilled: 4,
    activeProgressTotal: 5,
    arrivingBy,
    fulfilledBy,
    orderableRx,
    pastOrders,
    onSelectMember: setMemberId,
    onSelectPastFilter: setPastFilter,
    onTrackOrder: () => onTrackOrder?.(),
    onOrderRx: (id) => onOrderRx?.(id),
    onBookFollowUp: () => onBookFollowUp?.(),
    onReorder: () => undefined,
    onOpenPastOrder: (id) => onOpenPastOrder?.(id),
    onOpenHelp: () => undefined,
    onOpenSupport: () => undefined,
    onOpenNotifications: () => onOpenNotifications?.(),
    onSelectLanguage: setLanguage,
    onSeePrescriptions: () => onSeePrescriptions?.(),
  };
}
