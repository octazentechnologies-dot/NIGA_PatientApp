import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type ApiAppNotification,
  type NotificationType,
} from '../store/api/new/notificationsApi';
import { useAppSelector } from '../store/hooks';
import {
  resolveNotificationDeepLink,
  type DeepLinkTarget,
} from '../utilities/deepLink';

export type NotifFilter =
  | 'all'
  | 'appointments'
  | 'prescriptions'
  | 'medicines'
  | 'other';

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
  deepLink: string | null;
  joinAction?: boolean;
};

export type NotificationsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  filter: NotifFilter;
  filters: { id: NotifFilter; labelKey: TranslationKey }[];
  groups: { id: NotifGroup; labelKey: TranslationKey; items: NotificationItem[] }[];
  revealedId: string | null;
  loading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onBack: () => void;
  onMarkAllRead: () => void;
  onSelectFilter: (id: NotifFilter) => void;
  onOpenItem: (id: string) => void;
  onJoin: (id: string) => void;
  onReveal: (id: string | null) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
  unreadCount: number;
};

const FILTERS: NotificationsViewModel['filters'] = [
  { id: 'all', labelKey: 'notifFilterAll' },
  { id: 'appointments', labelKey: 'notifFilterAppointments' },
  { id: 'prescriptions', labelKey: 'notifFilterPrescriptions' },
  { id: 'medicines', labelKey: 'notifFilterMedicines' },
];

function filterFromType(
  type: NotificationType | null | undefined,
): Exclude<NotifFilter, 'all'> {
  const key = (type || '').toUpperCase();
  if (key === 'APPOINTMENT' || key === 'PAYMENT' || key === 'SYSTEM') {
    return 'appointments';
  }
  if (key === 'PRESCRIPTION') {
    return 'prescriptions';
  }
  if (key === 'MEDICINE') {
    return 'medicines';
  }
  // null / MARKETING / unknown → other (shown under all)
  return 'other';
}

function groupFor(createdAt: string): NotifGroup {
  const day = createdAt?.slice(0, 10);
  if (!day) {
    return 'earlier';
  }
  const today = new Date();
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (day === ymd(today)) {
    return 'today';
  }
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  if (day === ymd(y)) {
    return 'yesterday';
  }
  return 'earlier';
}

function mapRow(item: ApiAppNotification): NotificationItem {
  return {
    id: String(item.appNotificationId),
    filter: filterFromType(item.type),
    group: groupFor(item.createdAt || ''),
    titleKey: (item.title || '') as TranslationKey,
    bodyKey: (item.body || '') as TranslationKey,
    timeKey: '' as TranslationKey,
    tone: 'clinical',
    unread: !item.isRead,
    deepLink: item.deepLink ?? null,
  };
}

export function useNotificationsController({
  onBack,
  onJoinConsultation,
  onNavigateDeepLink,
}: {
  onBack: () => void;
  onJoinConsultation?: () => void;
  onNavigateDeepLink?: (target: DeepLinkTarget) => void;
}): NotificationsViewModel {
  const { language, t } = useLocalization();
  const [filter, setFilter] = useState<NotifFilter>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [accumulated, setAccumulated] = useState<NotificationItem[]>([]);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const pageSize = 20;

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: notifResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNotificationsQuery(
    { pageNumber, pageSize },
    { skip: !isAuthenticated },
  );
  const { data: unreadFromApi, refetch: refetchUnread } =
    useGetUnreadNotificationCountQuery(undefined, {
      skip: !isAuthenticated,
    });
  const [markNotificationReadApi] = useMarkNotificationReadMutation();
  const [markAllReadApi] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!notifResponse?.items) {
      return;
    }
    const mapped = notifResponse.items.map(mapRow);
    setAccumulated((prev) => {
      if (pageNumber <= 1) {
        if (
          prev.length === mapped.length &&
          prev.every((row, index) => row.id === mapped[index]?.id)
        ) {
          return prev;
        }
        return mapped;
      }
      const seen = new Set(prev.map((p) => p.id));
      const appended = mapped.filter((m) => !seen.has(m.id));
      if (appended.length === 0) {
        return prev;
      }
      return [...prev, ...appended];
    });
  }, [notifResponse, pageNumber]);

  const items = accumulated;

  const groups = useMemo(() => {
    const filtered =
      filter === 'all'
        ? items
        : filter === 'other'
          ? items.filter((item) => item.filter === 'other')
          : items.filter((item) => item.filter === filter);
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

  const unreadCount =
    typeof unreadFromApi === 'number'
      ? unreadFromApi
      : items.filter((item) => item.unread).length;
  const loading = isAuthenticated && (isLoading || isFetching);
  const canLoadMore =
    Boolean(notifResponse) &&
    accumulated.length < (notifResponse?.totalRecords ?? 0);

  const markRead = (id: string) => {
    setAccumulated((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
    setRevealedId(null);
    if (!isAuthenticated) return;
    const numId = Number(id);
    if (!Number.isNaN(numId) && numId > 0) {
      void markNotificationReadApi({
        appNotificationId: numId,
        isRead: true,
      })
        .unwrap()
        .then(() => {
          void refetchUnread();
        })
        .catch(() => undefined);
    }
  };

  return {
    language,
    t,
    filter,
    filters: FILTERS,
    groups,
    revealedId,
    loading,
    isError: isAuthenticated && isError,
    isEmpty: !loading && !isError && items.length === 0,
    onBack,
    onMarkAllRead: () => {
      setAccumulated((prev) => prev.map((item) => ({ ...item, unread: false })));
      setRevealedId(null);
      if (!isAuthenticated) return;
      void markAllReadApi()
        .unwrap()
        .then(() => {
          void refetchUnread();
        })
        .catch(() => undefined);
    },
    onSelectFilter: (id) => {
      setFilter(id);
    },
    onOpenItem: (id) => {
      const row = items.find((i) => i.id === id);
      markRead(id);
      const target = resolveNotificationDeepLink(row?.deepLink);
      if (target && target.kind !== 'unknown') {
        onNavigateDeepLink?.(target);
      }
    },
    onJoin: () => onJoinConsultation?.(),
    onReveal: setRevealedId,
    onMarkRead: markRead,
    onDelete: (id) => {
      setAccumulated((prev) => prev.filter((item) => item.id !== id));
      setRevealedId(null);
    },
    onRetry: () => {
      setPageNumber(1);
      void refetch();
      void refetchUnread();
    },
    onLoadMore: () => {
      if (!canLoadMore || isFetching) return;
      setPageNumber((p) => p + 1);
    },
    canLoadMore,
    unreadCount,
  };
}
