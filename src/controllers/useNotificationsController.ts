import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type NotifFilter = 'all' | 'appointments' | 'prescriptions' | 'medicines';

export type NotifGroup = 'today' | 'yesterday' | 'earlier';

export type NotifTone = 'clinical' | 'money' | 'carelink';

export type NotificationItem = {
  id: string;
  filter: Exclude<NotifFilter, 'all'>;
  group: NotifGroup;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  timeKey: TranslationKey;
  tone: NotifTone;
  unread: boolean;
  joinAction?: boolean;
};

export type NotificationsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  filter: NotifFilter;
  filters: { id: NotifFilter; labelKey: TranslationKey }[];
  groups: { id: NotifGroup; labelKey: TranslationKey; items: NotificationItem[] }[];
  revealedId: string | null;
  onBack: () => void;
  onMarkAllRead: () => void;
  onSelectFilter: (id: NotifFilter) => void;
  onOpenItem: (id: string) => void;
  onJoin: (id: string) => void;
  onReveal: (id: string | null) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
};

const FILTERS: NotificationsViewModel['filters'] = [
  { id: 'all', labelKey: 'notifFilterAll' },
  { id: 'appointments', labelKey: 'notifFilterAppointments' },
  { id: 'prescriptions', labelKey: 'notifFilterPrescriptions' },
  { id: 'medicines', labelKey: 'notifFilterMedicines' },
];

const SEED: NotificationItem[] = [
  {
    id: 'join',
    filter: 'appointments',
    group: 'today',
    titleKey: 'notifJoinTitle',
    bodyKey: 'notifJoinBody',
    timeKey: 'notifTime42m',
    tone: 'clinical',
    unread: true,
    joinAction: true,
  },
  {
    id: 'rx',
    filter: 'prescriptions',
    group: 'today',
    titleKey: 'notifRxTitle',
    bodyKey: 'notifRxBody',
    timeKey: 'notifTime2h',
    tone: 'clinical',
    unread: true,
  },
  {
    id: 'delivery',
    filter: 'medicines',
    group: 'today',
    titleKey: 'notifDeliveryTitle',
    bodyKey: 'notifDeliveryBody',
    timeKey: 'notifTime3h',
    tone: 'clinical',
    unread: true,
  },
  {
    id: 'followup',
    filter: 'appointments',
    group: 'yesterday',
    titleKey: 'notifFollowTitle',
    bodyKey: 'notifFollowBody',
    timeKey: 'notifTime1d',
    tone: 'clinical',
    unread: false,
  },
  {
    id: 'refund',
    filter: 'appointments',
    group: 'earlier',
    titleKey: 'notifRefundTitle',
    bodyKey: 'notifRefundBody',
    timeKey: 'notifTime3d',
    tone: 'money',
    unread: false,
  },
  {
    id: 'carelink',
    filter: 'appointments',
    group: 'earlier',
    titleKey: 'notifCareLinkTitle',
    bodyKey: 'notifCareLinkBody',
    timeKey: 'notifTime5d',
    tone: 'carelink',
    unread: false,
  },
];

export function useNotificationsController({
  onBack,
  onJoinConsultation,
}: {
  onBack: () => void;
  onJoinConsultation?: () => void;
}): NotificationsViewModel {
  const { language, t } = useLocalization();
  const [filter, setFilter] = useState<NotifFilter>('all');
  const [items, setItems] = useState(SEED);
  const [revealedId, setRevealedId] = useState<string | null>('delivery');

  const groups = useMemo(() => {
    const filtered =
      filter === 'all' ? items : items.filter((item) => item.filter === filter);
    const order: NotifGroup[] = ['today', 'yesterday', 'earlier'];
    const labels: Record<NotifGroup, TranslationKey> = {
      today: 'notifGroupToday',
      yesterday: 'notifGroupYesterday',
      earlier: 'notifGroupEarlier',
    };
    return order
      .map((id) => ({
        id,
        labelKey: labels[id],
        items: filtered.filter((item) => item.group === id),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, items]);

  return {
    language,
    t,
    filter,
    filters: FILTERS,
    groups,
    revealedId,
    onBack,
    onMarkAllRead: () => {
      setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
      setRevealedId(null);
    },
    onSelectFilter: setFilter,
    onOpenItem: (id) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      );
      setRevealedId(null);
    },
    onJoin: () => onJoinConsultation?.(),
    onReveal: setRevealedId,
    onMarkRead: (id) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      );
      setRevealedId(null);
    },
    onDelete: (id) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setRevealedId(null);
    },
  };
}
