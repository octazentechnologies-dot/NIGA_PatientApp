import { useMemo, useState } from 'react';

import { mapAppointmentRequestStatus } from '../constants/statusMaps';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useCancelAppointmentRequestMutation,
  useGetAppointmentRequestsQuery,
  useRespondAppointmentRequestMutation,
  type AppointmentRequestItem,
} from '../store/api/new/appointmentRequestsApi';
import { useAppSelector } from '../store/hooks';
import { messageFromUnknownError } from '../utilities/apiResponse';

export type RequestFilter =
  | 'all'
  | 'PENDING'
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EXPIRED';

export type AppointmentRequestRow = {
  id: number;
  doctorName: string;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  whenLabel: string;
  proposedLabel: string;
  reason: string;
  consultMode: string;
  canRespond: boolean;
  canCancel: boolean;
  patientAppId: number | null;
};

export type AppointmentRequestsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  filter: RequestFilter;
  filters: { id: RequestFilter; label: string }[];
  rows: AppointmentRequestRow[];
  loading: boolean;
  isError: boolean;
  isEmpty: boolean;
  busyId: number | null;
  notice: string | null;
  canLoadMore: boolean;
  onBack: () => void;
  onSelectFilter: (id: RequestFilter) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onCancel: (id: number) => void;
  onOpenVisit: (patientAppId: number) => void;
};

function mapRow(item: AppointmentRequestItem): AppointmentRequestRow {
  const visual = mapAppointmentRequestStatus(item.status);
  const when = [item.requestedDate, item.requestedTime].filter(Boolean).join(' · ');
  const proposed =
    item.status?.toUpperCase() === 'PROPOSED' &&
    (item.proposedDate || item.proposedTime)
      ? [item.proposedDate, item.proposedTime].filter(Boolean).join(' · ')
      : '';
  const status = (item.status || '').toUpperCase();
  return {
    id: item.appointmentRequestId,
    doctorName: item.doctorName || 'Doctor',
    statusLabel: visual.label,
    statusColor: visual.color,
    statusBg: visual.background,
    whenLabel: when,
    proposedLabel: proposed,
    reason: item.reason?.trim() || '',
    consultMode: item.consultMode || '',
    canRespond: status === 'PROPOSED',
    canCancel: status === 'PENDING' || status === 'PROPOSED',
    patientAppId: item.patientAppId ?? null,
  };
}

export function useAppointmentRequestsController({
  onBack,
  onOpenVisit,
}: {
  onBack: () => void;
  onOpenVisit?: (patientAppId: number) => void;
}): AppointmentRequestsViewModel {
  const { language, t } = useLocalization();
  const [filter, setFilter] = useState<RequestFilter>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pageSize = 20;

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const params = {
    status: filter === 'all' ? undefined : filter,
    pageNumber,
    pageSize,
  };
  const { data, isLoading, isFetching, isError, refetch } =
    useGetAppointmentRequestsQuery(params, { skip: !isAuthenticated });
  const [respond] = useRespondAppointmentRequestMutation();
  const [cancel] = useCancelAppointmentRequestMutation();

  const rows = useMemo(
    () => (data?.items ?? []).map(mapRow),
    [data?.items],
  );

  const runRespond = async (id: number, action: 'ACCEPT' | 'DECLINE') => {
    if (busyId != null) return;
    setBusyId(id);
    setNotice(null);
    try {
      const res = await respond({ id, body: { action } }).unwrap();
      if (action === 'ACCEPT' && res.data?.patientAppId) {
        onOpenVisit?.(res.data.patientAppId);
      } else {
        setNotice(res.message || (action === 'ACCEPT' ? 'Accepted.' : 'Declined.'));
      }
      void refetch();
    } catch (err) {
      setNotice(messageFromUnknownError(err));
      void refetch();
    } finally {
      setBusyId(null);
    }
  };

  return {
    language,
    t,
    filter,
    filters: [
      { id: 'all', label: 'All' },
      { id: 'PENDING', label: 'Pending' },
      { id: 'PROPOSED', label: 'Proposed' },
      { id: 'ACCEPTED', label: 'Accepted' },
      { id: 'DECLINED', label: 'Declined' },
      { id: 'CANCELLED', label: 'Cancelled' },
      { id: 'EXPIRED', label: 'Expired' },
    ],
    rows,
    loading: isAuthenticated && (isLoading || isFetching),
    isError: isAuthenticated && isError,
    isEmpty: !isLoading && !isError && rows.length === 0,
    busyId,
    notice,
    canLoadMore: Boolean(data) && rows.length < (data?.totalRecords ?? 0),
    onBack,
    onSelectFilter: (id) => {
      setFilter(id);
      setPageNumber(1);
      setNotice(null);
    },
    onRetry: () => {
      void refetch();
    },
    onLoadMore: () => {
      if (isFetching) return;
      setPageNumber((p) => p + 1);
    },
    onAccept: (id) => {
      void runRespond(id, 'ACCEPT');
    },
    onDecline: (id) => {
      void runRespond(id, 'DECLINE');
    },
    onCancel: (id) => {
      if (busyId != null) return;
      setBusyId(id);
      setNotice(null);
      void cancel(id)
        .unwrap()
        .then((res) => {
          setNotice(res.message || 'Request cancelled.');
          void refetch();
        })
        .catch((err: unknown) => {
          setNotice(messageFromUnknownError(err));
          void refetch();
        })
        .finally(() => setBusyId(null));
    },
    onOpenVisit: (patientAppId) => onOpenVisit?.(patientAppId),
  };
}
