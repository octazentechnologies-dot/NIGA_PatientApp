import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { ConsultMode } from '../config/appointmentSlots';
import {
  appointmentStartIso,
  type AppointmentRequestStatus,
  type BookedAppointment,
} from '../config/bookedAppointments';
import { mapVisitStatus } from '../constants/statusMaps';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import { useAppSelector } from '../store/hooks';
import {
  useGetPatientVisitsQuery,
  type PatientVisitItem,
} from '../store/api/new/visitsApi';
import { formatDate, formatTime, resolveApiUrl } from '../utilities/formatters';
import { unwrapListOrPage } from '../utilities/paged';

export type VisitStatusFilter =
  | 'all'
  | 'NOT ARRIVED'
  | 'WAITING'
  | 'E-CONSULT'
  | 'COMPLETED'
  | 'CANCELLED';

export type MyAppointmentRow = BookedAppointment & {
  visitStatusLabel: string;
  visitStatusColor: string;
  visitStatusBg: string;
  visitStatusBorder?: string;
  visitBadgeType?: 'upcoming' | 'waiting' | 'completed' | 'cancelled' | 'neutral';
  doctorPhotoUrl?: string | null;
  doctorSpecialization?: string;
};

export type MyAppointmentsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  appointments: MyAppointmentRow[];
  statusFilter: VisitStatusFilter;
  statusFilters: { id: VisitStatusFilter; label: string }[];
  fromDate: string;
  toDate: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  isEmpty: boolean;
  canLoadMore: boolean;
  onBack: () => void;
  onOpenAppointment: (id: string) => void;
  onBookNew: () => void;
  onOpenRequests?: () => void;
  onSelectStatusFilter: (id: VisitStatusFilter) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onRetry: () => void;
};

const PAGE_SIZE = 20;

const VISIT_STATUS_FILTERS: { id: VisitStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'NOT ARRIVED', label: 'Upcoming' },
  { id: 'WAITING', label: 'Waiting' },
  { id: 'E-CONSULT', label: 'E-consult' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

function consultModeFromVisit(item: PatientVisitItem): ConsultMode {
  if (item.isTele || item.consultMode === 'Tele') {
    return 'video';
  }
  const mode = (item.consultMode || '').toLowerCase();
  if (mode.includes('chat')) return 'chat';
  if (mode.includes('audio')) return 'audio';
  return 'clinic';
}

function mapVisitToRow(
  item: PatientVisitItem,
  defaultPatientLabel: string,
): MyAppointmentRow {
  const mode = consultModeFromVisit(item);
  const docName = item.doctorName || 'Doctor';
  const initials = docName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const datePart = item.appointmentDate
    ? item.appointmentDate.slice(0, 10)
    : '';
  const formattedDate = formatDate(datePart) ?? datePart;
  const formattedTime = formatTime(item.appointmentTime) ?? item.appointmentTime ?? '';
  const whenLabel = [formattedDate, formattedTime].filter(Boolean).join(' · ');
  const visual = mapVisitStatus(item.status);
  const statusUpper = (item.status || '').toUpperCase();
  const aptStatus: AppointmentRequestStatus =
    statusUpper === 'NOT ARRIVED' ||
      statusUpper === 'WAITING' ||
      statusUpper === 'E-CONSULT' ||
      statusUpper === 'REMAINING' ||
      statusUpper === 'WALK-IN'
      ? 'confirmed'
      : 'waiting_acceptance';

  const itemPatientName =
    item.patientName ||
    item.patientFullName ||
    (item as { patient?: string }).patient ||
    '';
  const resolvedPatientLabel = itemPatientName || defaultPatientLabel;

  return {
    id: String(item.patientAppId),
    bookingId: `APT-${item.patientAppId}`,
    doctorId: String(item.doctorId),
    doctorNameKey: docName as TranslationKey,
    doctorInitials: initials || 'DR',
    credentialsKey: '' as TranslationKey,
    experienceKey: '' as TranslationKey,
    whenLabel,
    dateLine: formattedDate,
    timeLine: formattedTime,
    startsAt: appointmentStartIso(item.appointmentDate, item.appointmentTime),
    bookedOnLabel: formattedDate,
    mode,
    modeConsultLabel:
      mode === 'video'
        ? 'Video Consultation'
        : mode === 'chat'
          ? 'Chat Consultation'
          : mode === 'audio'
            ? 'Audio Consultation'
            : 'In Clinic',
    patientLabel: resolvedPatientLabel,
    feeLabel: '',
    paymentId: '',
    reasonKey: '' as TranslationKey,
    status: aptStatus,
    visitStatus: item.status,
    visitStatusLabel: visual.label,
    visitStatusColor: visual.color,
    visitStatusBg: visual.background,
    visitStatusBorder: visual.borderColor,
    visitBadgeType: visual.badgeType,
    doctorPhotoUrl: item.doctorPhotoUrl ? resolveApiUrl(item.doctorPhotoUrl) : null,
    doctorSpecialization: item.doctorSpecialization || item.specialization || '',
  };
}

export function useMyAppointmentsController({
  active = true,
  onBack,
  onOpenAppointment,
  onBookNew,
  onOpenRequests,
}: {
  active?: boolean;
  onBack: () => void;
  onOpenAppointment: (id: string) => void;
  onBookNew: () => void;
  onOpenRequests?: () => void;
}): MyAppointmentsViewModel {
  const { language, t } = useLocalization();
  const [statusFilter, setStatusFilter] = useState<VisitStatusFilter>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [accumulated, setAccumulated] = useState<MyAppointmentRow[]>([]);

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const homePatientName = homeDashboardResponse?.data?.patientName;
  const patientLabel =
    homePatientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const queryParams = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
      fromDate: fromDate.trim() || undefined,
      toDate: toDate.trim() || undefined,
      pageNumber,
      pageSize: PAGE_SIZE,
    }),
    [statusFilter, fromDate, toDate, pageNumber],
  );

  const {
    data: visitsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPatientVisitsQuery(queryParams, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Re-fetch immediately whenever screen becomes active (navigated to)
  const wasActiveRef = useRef(active);
  useEffect(() => {
    if (active && !wasActiveRef.current && isAuthenticated) {
      setPageNumber(1);
      void refetch();
    }
    wasActiveRef.current = active;
  }, [active, isAuthenticated, refetch]);

  // Re-fetch when mobile app returns to foreground from background/web
  useEffect(() => {
    if (!active || !isAuthenticated) {
      return;
    }

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        void refetch();
      }
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => {
      sub.remove();
    };
  }, [active, isAuthenticated, refetch]);

  const pageItems = useMemo(() => {
    const { items, page } = unwrapListOrPage<PatientVisitItem>(visitsResponse);
    return { items, page };
  }, [visitsResponse]);

  useEffect(() => {
    const filtered = pageItems.items.filter((item) => {
      const payStatus = (
        (item as { paymentStatus?: string }).paymentStatus || ''
      ).toUpperCase();
      if (
        payStatus === 'FAILED' ||
        payStatus === 'CANCELLED' ||
        payStatus === 'UNPAID'
      ) {
        return false;
      }
      // Online payments (Tele or InClinic) MUST be PAID/CAPTURED to appear as confirmed bookings.
      const isOnlineTele = Boolean(item.isTele || item.consultMode === 'Tele');
      const isPayAtClinic = Boolean(
        !isOnlineTele &&
        ((item as { payAtClinicAllowed?: boolean }).payAtClinicAllowed === true ||
          payStatus === 'PAY_AT_CLINIC'),
      );
      if (payStatus === 'PENDING' && !isPayAtClinic) {
        return false;
      }
      return true;
    });
    const mapped = filtered.map((row) => mapVisitToRow(row, patientLabel));
    setAccumulated((prev) => {
      if (pageNumber <= 1) {
        if (
          prev.length === mapped.length &&
          prev.every(
            (row, index) =>
              row.id === mapped[index]?.id &&
              row.visitStatus === mapped[index]?.visitStatus &&
              row.visitStatusLabel === mapped[index]?.visitStatusLabel &&
              row.visitBadgeType === mapped[index]?.visitBadgeType &&
              row.whenLabel === mapped[index]?.whenLabel &&
              row.patientLabel === mapped[index]?.patientLabel,
          )
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
  }, [pageItems, pageNumber, patientLabel]);

  const resetFilters = useCallback(() => {
    setPageNumber(1);
    setAccumulated([]);
  }, []);

  const isLoadingFirst =
    isAuthenticated && (isLoading || (isFetching && pageNumber === 1 && accumulated.length === 0));
  const isRefreshing = isAuthenticated && isFetching && pageNumber === 1 && accumulated.length > 0;

  return {
    language,
    t,
    appointments: accumulated,
    statusFilter,
    statusFilters: VISIT_STATUS_FILTERS,
    fromDate,
    toDate,
    isLoading: isLoadingFirst,
    isRefreshing,
    isError: isAuthenticated && isError,
    isEmpty: !isLoadingFirst && !isError && accumulated.length === 0,
    canLoadMore:
      pageItems.page != null &&
      accumulated.length < pageItems.page.totalRecords,
    onBack,
    onOpenAppointment,
    onBookNew,
    onOpenRequests,
    onSelectStatusFilter: (id) => {
      setStatusFilter(id);
      resetFilters();
    },
    onFromDateChange: (value) => {
      setFromDate(value);
      resetFilters();
    },
    onToDateChange: (value) => {
      setToDate(value);
      resetFilters();
    },
    onLoadMore: () => {
      if (isFetching) return;
      const total = pageItems.page?.totalRecords;
      if (total != null && accumulated.length >= total) return;
      setPageNumber((p) => p + 1);
    },
    onRefresh: () => {
      setPageNumber(1);
      void refetch();
    },
    onRetry: () => {
      setPageNumber(1);
      void refetch();
    },
  };
}
