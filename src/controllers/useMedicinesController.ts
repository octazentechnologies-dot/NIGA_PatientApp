import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type MedicinesMemberId = 'everyone' | 'self' | 'aarav' | 'meera';

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

const RX: OrderableRx[] = [
  {
    id: 'rx-77410',
    title: 'RX-2026-77410 · 3 medicines',
    doctorLine: 'Dr. Anjali Deshmukh · 26 Aug 2026',
    badgeKey: 'medsValidTill26Sep',
    expired: false,
  },
  {
    id: 'rx-88912',
    title: 'RX-2026-88912 · 1 medicine',
    doctorLine: 'Dr. Rajesh Patel · 15 Aug 2026',
    badgeKey: 'medsValidTill15Sep',
    expired: false,
  },
  {
    id: 'rx-44123',
    title: 'RX-2026-44123 · 2 medicines',
    doctorLine: 'Dr. Anjali Deshmukh · 12 Jul 2026',
    badgeKey: 'medsExpired12Aug',
    expired: true,
  },
];

const PAST: PastOrder[] = [
  {
    id: 'hm-3922',
    orderLabel: 'Order #HM-3922',
    dateLabel: '10 Aug 2026',
    status: 'delivered',
    statusKey: 'medsStatusDelivered',
    medsLine: 'M01, M02, M03',
    pharmacy: 'Shree Homeo Pharmacy',
    priceLabel: '₹310.00',
    canReorder: true,
  },
  {
    id: 'hm-3850',
    orderLabel: 'Order #HM-3850',
    dateLabel: '25 Jul 2026',
    status: 'cancelled',
    statusKey: 'medsStatusCancelledByYou',
    medsLine: 'M04',
    pharmacy: 'Harmony Homeopathics',
    priceLabel: '₹120.00',
    priceStruck: true,
  },
  {
    id: 'hm-3601',
    orderLabel: 'Order #HM-3601',
    dateLabel: '02 Jun 2026',
    status: 'refunded',
    statusKey: 'medsStatusRefunded',
    medsLine: 'M05, M06',
    pharmacy: 'City Central Dispensary',
    priceLabel: '₹280.00',
    refundNote: true,
  },
];

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

  /** Demo: Meera has no orders yet — shows empty state (unless just placed). */
  const hasOrders = forceHasOrders || memberId !== 'meera';

  const pastOrders = useMemo(() => {
    if (pastFilter === 'all') {
      return PAST;
    }
    return PAST.filter((order) => order.status === pastFilter);
  }, [pastFilter]);

  return {
    language,
    t,
    hasOrders,
    memberId,
    members: MEMBERS,
    pastFilter,
    pastFilters: PAST_FILTERS,
    activeOrderId: '#HM-4821',
    activeStatusLine: t('medsActiveStatusOut'),
    activeProgressFilled: 4,
    activeProgressTotal: 5,
    arrivingBy: t('medsArrivingBy').replace('{time}', '8:45 PM'),
    fulfilledBy: t('medsFulfilledBy').replace(
      '{name}',
      'Harmony Homeopathics',
    ),
    orderableRx: RX,
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
