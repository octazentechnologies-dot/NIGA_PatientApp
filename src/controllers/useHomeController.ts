import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAccountController, type AccountViewModel } from './useAccountController';
import type { HelpTopicId } from './useHelpCentreController';
import type { LegalDocId } from './useLegalDocumentController';
import {
  type AppointmentRequestStatus,
  type BookedAppointment,
  createSeedFollowUpChat,
  JOIN_GRACE_MS,
} from '../config/bookedAppointments';
import {
  BOOKING_MEMBERS,
  type BookingMember,
  type ConsultMode,
  resolveBookingMembers,
} from '../config/appointmentSlots';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  DEFAULT_DOCTOR_FILTERS,
  EMPTY_DOCTOR_FILTERS,
  type DoctorAvailabilitySlot,
  type DoctorConsultMode,
  type DoctorFilterLanguage,
  type DoctorFilters,
} from '../models/search';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedMemberId as setReduxSelectedMemberId } from '../store/slices/authSlice';
import {
  useGetDoctorFilterOptionsQuery,
  useGetDoctorsQuery,
  type PublicDoctor,
} from '../store/api/new/doctorsApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import {
  useGetArticlesQuery,
  useGetCareCategoriesQuery,
  useGetHomeDashboardQuery,
} from '../store/api/new/homeApi';
import { useGetPatientVisitsQuery } from '../store/api/new/visitsApi';
import {
  formatDate,
  formatTime,
  resolveApiUrl,
} from '../utilities/formatters';

export type HomeCareCategoryItem = {
  id: string;
  name: string;
};

export type HomeArticleItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
};

export type HomeTab =
  | 'home'
  | 'doctors'
  | 'records'
  | 'medicines'
  | 'account';

/** Criteria applied on the Doctors tab via Search Doctors / care need / city. */
export type DoctorsTabSearch = {
  q?: string;
  city?: string;
  careCategoryId?: number;
};

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function countDoctorsTabFilters(
  search: DoctorsTabSearch,
  filters: DoctorFilters,
): number {
  let count = 0;
  if (search.q?.trim()) count += 1;
  if (search.city?.trim() || filters.cityIds.length > 0) count += 1;
  if (
    (search.careCategoryId != null && search.careCategoryId > 0) ||
    (filters.careCategoryId != null && filters.careCategoryId > 0)
  ) {
    count += 1;
  }
  count += filters.careNeedIds.length;
  count += filters.modes.length;
  count += filters.availability.length;
  count += filters.languages.length;
  count += filters.genders.length;
  if (filters.useCurrentLocation) count += 1;
  if (filters.recognizedQualification) count += 1;
  if (filters.focusCertified) count += 1;
  if (
    filters.feeMin !== EMPTY_DOCTOR_FILTERS.feeMin ||
    filters.feeMax !== EMPTY_DOCTOR_FILTERS.feeMax
  ) {
    count += 1;
  }
  return count;
}

function filtersFromDoctorsSearch(search: DoctorsTabSearch): DoctorFilters {
  const city = search.city?.trim();
  return {
    ...DEFAULT_DOCTOR_FILTERS,
    cityIds: city ? [city.toLowerCase()] : [],
    careCategoryId: search.careCategoryId ?? null,
  };
}

/** Stable empty fallback — inline `[]` in render deps causes max update depth. */
const EMPTY_VISITS: unknown[] = [];
const EMPTY_PUBLIC_DOCTORS: PublicDoctor[] = [];
const EMPTY_DOCTORS_TAB_SEARCH: DoctorsTabSearch = {};

/** Sort key from appointment date (YYYY-MM-DD) + time (HH:mm). Ascending = soonest first. */
function appointmentSortMs(
  appointmentDate?: string,
  appointmentTime?: string,
): number {
  const datePart = (appointmentDate || '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return Number.MAX_SAFE_INTEGER;
  }
  let hour = 0;
  let minute = 0;
  const timeRaw = (appointmentTime || '').trim();
  const match = timeRaw.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    hour = Number(match[1]);
    minute = Number(match[2]);
    const isPm = /pm/i.test(timeRaw);
    const isAm = /am/i.test(timeRaw);
    if (isPm && hour < 12) {
      hour += 12;
    } else if (isAm && hour === 12) {
      hour = 0;
    }
  }
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    hour = 0;
    minute = 0;
  }
  const ms = new Date(
    `${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
  ).getTime();
  return Number.isFinite(ms) ? ms : Number.MAX_SAFE_INTEGER;
}

function isPastAppointment(
  appointmentDate?: string,
  appointmentTime?: string,
  graceMs: number = JOIN_GRACE_MS,
): boolean {
  const ms = appointmentSortMs(appointmentDate, appointmentTime);
  if (ms !== Number.MAX_SAFE_INTEGER) {
    return ms + graceMs < Date.now();
  }
  if (appointmentDate) {
    const raw = appointmentDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10))) {
      const d = new Date(raw.slice(0, 10));
      d.setHours(23, 59, 59, 999);
      if (!Number.isNaN(d.getTime())) {
        return d.getTime() < Date.now();
      }
    }
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      return parsed + graceMs < Date.now();
    }
  }
  return false;
}

function isPastBooking(startsAt?: string, graceMs: number = JOIN_GRACE_MS): boolean {
  if (!startsAt) return false;
  const ms = Date.parse(startsAt);
  if (Number.isNaN(ms)) return false;
  return ms + graceMs < Date.now();
}

function sortBookingsByDateTime(
  rows: BookedAppointment[],
): BookedAppointment[] {
  return [...rows].sort((a, b) => {
    const aMs = Date.parse(a.startsAt) || Number.MAX_SAFE_INTEGER;
    const bMs = Date.parse(b.startsAt) || Number.MAX_SAFE_INTEGER;
    if (aMs !== bMs) {
      return aMs - bMs;
    }
    return a.id.localeCompare(b.id);
  });
}

export type HomeMemberOption = BookingMember;

export type HomeViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  patientFirstName: string;
  greeting: string;
  searchOpen: boolean;
  resultsOpen: boolean;
  resultsQuery: string;
  searchNonce: number;
  selectedTab: HomeTab;
  selectedMemberId: string;
  memberPickerOpen: boolean;
  memberOptions: HomeMemberOption[];
  selectedMemberLabel: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onOpenResults: (query: string) => void;
  /** Apply search on Doctors tab (skips Search Results overlay). */
  onSearchDoctorsTab: (params: DoctorsTabSearch) => void;
  onClearDoctorsSearch: () => void;
  onRemoveDoctorsCity: () => void;
  onRemoveDoctorsQuery: () => void;
  doctorsSearch: DoctorsTabSearch;
  doctorsFilterCount: number;
  doctorsFiltersOpen: boolean;
  doctorsFilterDraft: DoctorFilters;
  doctorsFilterMatchingCount: number;
  doctorsDatePickerOpen: boolean;
  doctorsFilterCustomDate: Date;
  doctorsCityOptions: Array<{ id: string; label: string }>;
  doctorsQualificationOptions: Array<{ id: string; label: string }>;
  onOpenDoctorsFilters: () => void;
  onCloseDoctorsFilters: () => void;
  onResetDoctorsFilterDraft: () => void;
  onClearDoctorsFilters: () => void;
  onApplyDoctorsFilters: () => void;
  onToggleDoctorsCareNeed: (id: string) => void;
  onToggleDoctorsMode: (mode: DoctorConsultMode) => void;
  onToggleDoctorsAvailability: (slot: DoctorAvailabilitySlot) => void;
  onChangeDoctorsFeeRange: (low: number, high: number) => void;
  onToggleDoctorsFilterLanguage: (language: DoctorFilterLanguage) => void;
  onToggleDoctorsGender: (gender: 'male' | 'female') => void;
  onToggleDoctorsRecognized: () => void;
  onToggleDoctorsFocusCert: () => void;
  onChangeDoctorsLocationQuery: (value: string) => void;
  onToggleDoctorsCity: (cityId: string) => void;
  onToggleDoctorsCurrentLocation: () => void;
  onOpenDoctorsDatePicker: () => void;
  onCloseDoctorsDatePicker: () => void;
  onSelectDoctorsCustomDate: (date: Date) => void;
  onCloseResults: () => void;
  onReopenSearch: () => void;
  onSelectTab: (tab: HomeTab) => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (memberId: string) => void;
  onAddMember: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onJoinConsultation: (appointmentId?: string) => void;
  onFillSymptomDiary: () => void;
  onTrackOrder: (orderId?: string) => void;
  orderTrackingOpen: boolean;
  onOpenOrderTracking: () => void;
  onCloseOrderTracking: () => void;
  medicineOrderPlaced: boolean;
  onPlaceMedicineOrder: () => void;
  onViewAllCategories: () => void;
  profileDoctorId: string | null;
  onOpenDoctorProfile: (doctorId: string) => void;
  onCloseDoctorProfile: () => void;
  bookingOpen: boolean;
  onOpenBooking: () => void;
  onCloseBooking: () => void;
  healthTipId: string | null;
  onOpenHealthTip: (tipId: string) => void;
  onCloseHealthTip: () => void;
  onFindDoctorFromTip: (query: string) => void;
  appointments: BookedAppointment[];
  /** Toast when a Home booking left the dashboard because it completed. */
  completedMovedToastVisible: boolean;
  onDismissCompletedMovedToast: () => void;
  onOpenMyAppointmentsFromCompletedToast: () => void;
  selectedAppointmentId: string | null;
  onOpenAppointment: (id: string) => void;
  onCloseAppointment: () => void;
  onConfirmBooking: (item: BookedAppointment) => void;
  onFinishBookingFlow: (targetTab?: HomeTab) => void;
  onRemoveAppointment: (id: string) => void;
  onUpdateAppointment: (id: string, patch: Partial<BookedAppointment>) => void;
  onBookAnotherConsultation: () => void;
  consultNowOpen: boolean;
  onOpenConsultNow: () => void;
  onCloseConsultNow: () => void;
  followUpPlanAvailable: boolean;
  followUpPlanOpen: boolean;
  onActivateFollowUpPlan: () => void;
  onOpenFollowUpPlan: () => void;
  onCloseFollowUpPlan: () => void;
  symptomDiaryOpen: boolean;
  onOpenSymptomDiary: () => void;
  onCloseSymptomDiary: () => void;
  clinisightProgressOpen: boolean;
  onOpenCliniSightProgress: () => void;
  onCloseCliniSightProgress: () => void;
  healthInsightsOpen: boolean;
  onOpenHealthInsights: () => void;
  onCloseHealthInsights: () => void;
  remindersOpen: boolean;
  onOpenReminders: () => void;
  onCloseReminders: () => void;
  editProfileOpen: boolean;
  onOpenEditProfile: () => void;
  onCloseEditProfile: () => void;
  accountFamilyOpen: boolean;
  onOpenAccountFamily: () => void;
  onCloseAccountFamily: () => void;
  myAppointmentsOpen: boolean;
  onOpenMyAppointments: () => void;
  onCloseMyAppointments: () => void;
  appointmentRequestsOpen: boolean;
  onOpenAppointmentRequests: () => void;
  onCloseAppointmentRequests: () => void;
  accountRecordsOpen: boolean;
  accountRecordsFilter: 'all' | 'prescriptions';
  onOpenAccountRecords: (filter?: 'all' | 'prescriptions') => void;
  onCloseAccountRecords: () => void;
  paymentsOpen: boolean;
  onOpenPayments: () => void;
  onClosePayments: () => void;
  consentCentreOpen: boolean;
  onOpenConsentCentre: () => void;
  onCloseConsentCentre: () => void;
  myReviewsOpen: boolean;
  onOpenMyReviews: () => void;
  onCloseMyReviews: () => void;
  appealReviewOpen: boolean;
  appealReviewId: string | null;
  onOpenAppealReview: (reviewId?: string) => void;
  onCloseAppealReview: () => void;
  helpCentreOpen: boolean;
  onOpenHelpCentre: () => void;
  onCloseHelpCentre: () => void;
  raiseTicketOpen: boolean;
  raiseTicketTopicId: HelpTopicId;
  onOpenRaiseTicket: (topicId: HelpTopicId) => void;
  onCloseRaiseTicket: () => void;
  bookWithHelpOpen: boolean;
  onOpenBookWithHelp: () => void;
  onCloseBookWithHelp: () => void;
  legalDocId: LegalDocId | null;
  onOpenLegalDoc: (doc: LegalDocId) => void;
  onCloseLegalDoc: () => void;
  notificationsOpen: boolean;
  onOpenNotifications: () => void;
  onCloseNotifications: () => void;
  notificationSettingsOpen: boolean;
  onOpenNotificationSettings: () => void;
  onCloseNotificationSettings: () => void;
  orderMedicinesOpen: boolean;
  orderLaunch: import('../utilities/medicineOrderStage').OrderMedicinesLaunch | null;
  onOpenOrderMedicines: (
    launch?: import('../utilities/medicineOrderStage').OrderMedicinesLaunch,
  ) => void;
  onCloseOrderMedicines: () => void;
  payMedicineOrderId: number | null;
  onPayMedicineOrder: (orderId: number) => void;
  onCloseMedicinePay: () => void;
  orderDetailsOpen: boolean;
  orderDetailsId: string | null;
  onOpenOrderDetails: (orderId: string) => void;
  onOpenTrackedOrderDetails: () => void;
  onCloseOrderDetails: () => void;
  publicDoctors: PublicDoctor[];
  isDoctorsLoading: boolean;
  isDoctorsError: boolean;
  refetchDoctors: () => void;
  careCategories: HomeCareCategoryItem[];
  healthArticles: HomeArticleItem[];
  onSelectCareCategory: (name: string) => void;
  isHomeRefreshing: boolean;
  onRefreshHome: () => Promise<void> | void;
  account: AccountViewModel;
};

export function useHomeController({
  onLogOut,
}: {
  onLogOut: () => void;
} = { onLogOut: () => undefined }): HomeViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [searchOpen, setSearchOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsQuery, setResultsQuery] = useState('');
  const [doctorsSearch, setDoctorsSearch] = useState<DoctorsTabSearch>(
    EMPTY_DOCTORS_TAB_SEARCH,
  );
  const [doctorsFilters, setDoctorsFilters] = useState<DoctorFilters>(
    DEFAULT_DOCTOR_FILTERS,
  );
  const [doctorsFilterDraft, setDoctorsFilterDraft] =
    useState<DoctorFilters>(DEFAULT_DOCTOR_FILTERS);
  const [doctorsFiltersOpen, setDoctorsFiltersOpen] = useState(false);
  const [doctorsDatePickerOpen, setDoctorsDatePickerOpen] = useState(false);
  const [searchNonce, setSearchNonce] = useState(0);
  const [searchOrigin, setSearchOrigin] = useState<HomeTab>('home');
  const dispatch = useAppDispatch();
  const reduxSelectedMemberId = useAppSelector(
    (state) => state.auth.selectedMemberId,
  );
  const [selectedTab, setSelectedTab] = useState<HomeTab>('home');
  const [profileDoctorId, setProfileDoctorId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [healthTipId, setHealthTipId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(
    reduxSelectedMemberId || 'self',
  );
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  useEffect(() => {
    if (reduxSelectedMemberId && reduxSelectedMemberId !== selectedMemberId) {
      setSelectedMemberId(reduxSelectedMemberId);
    }
  }, [reduxSelectedMemberId, selectedMemberId]);
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);

  useEffect(() => {
    console.log(
      '📋 [useHomeController] Current Bookings List (count: ' +
      appointments.length +
      '):',
      JSON.stringify(
        appointments
      ),
    );
  }, [appointments]);
  const [completedMovedToastVisible, setCompletedMovedToastVisible] =
    useState(false);
  const previousDashboardIdsRef = useRef<Set<string> | null>(null);
  const notifiedCompletedIdsRef = useRef<Set<string>>(new Set());
  const completedToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(
    null,
  );
  const [consultNowOpen, setConsultNowOpen] = useState(false);
  const [followUpPlanAvailable, setFollowUpPlanAvailable] = useState(false);
  const [followUpPlanOpen, setFollowUpPlanOpen] = useState(false);
  const [symptomDiaryOpen, setSymptomDiaryOpen] = useState(false);
  const [clinisightProgressOpen, setCliniSightProgressOpen] = useState(false);
  const [healthInsightsOpen, setHealthInsightsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [accountFamilyOpen, setAccountFamilyOpen] = useState(false);
  const [myAppointmentsOpen, setMyAppointmentsOpen] = useState(false);
  const [appointmentRequestsOpen, setAppointmentRequestsOpen] = useState(false);
  const [accountRecordsOpen, setAccountRecordsOpen] = useState(false);
  const [accountRecordsFilter, setAccountRecordsFilter] = useState<
    'all' | 'prescriptions'
  >('all');
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [consentCentreOpen, setConsentCentreOpen] = useState(false);
  const [myReviewsOpen, setMyReviewsOpen] = useState(false);
  const [appealReviewOpen, setAppealReviewOpen] = useState(false);
  const [appealReviewId, setAppealReviewId] = useState<string | null>(null);
  const [helpCentreOpen, setHelpCentreOpen] = useState(false);
  const [raiseTicketOpen, setRaiseTicketOpen] = useState(false);
  const [raiseTicketTopicId, setRaiseTicketTopicId] =
    useState<HelpTopicId>('medicines' as HelpTopicId);
  const [bookWithHelpOpen, setBookWithHelpOpen] = useState(false);
  const [legalDocId, setLegalDocId] = useState<LegalDocId | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [orderMedicinesOpen, setOrderMedicinesOpen] = useState(false);
  const [orderLaunch, setOrderLaunch] = useState<
    import('../utilities/medicineOrderStage').OrderMedicinesLaunch | null
  >(null);
  const [payMedicineOrderId, setPayMedicineOrderId] = useState<number | null>(null);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [orderDetailsVisible, setOrderDetailsVisible] = useState(false);
  const [medicineOrderPlaced, setMedicineOrderPlaced] = useState(false);
  const [orderDetailsId, setOrderDetailsId] = useState<string | null>(null);

  const doctorsQueryArgs = useMemo(() => {
    const q = doctorsSearch.q?.trim() || undefined;
    const cityFromSearch = doctorsSearch.city?.trim() || undefined;
    const cityFromFilters =
      doctorsFilters.cityIds.length === 1
        ? doctorsFilters.cityIds[0]
        : undefined;
    const city = cityFromSearch || cityFromFilters;
    const careCategoryId =
      doctorsSearch.careCategoryId != null && doctorsSearch.careCategoryId > 0
        ? doctorsSearch.careCategoryId
        : doctorsFilters.careCategoryId != null &&
          doctorsFilters.careCategoryId > 0
          ? doctorsFilters.careCategoryId
          : undefined;
    const teleOnly =
      doctorsFilters.modes.length === 1 && doctorsFilters.modes[0] === 'video';
    const feeFilterActive =
      doctorsFilters.feeMin !== EMPTY_DOCTOR_FILTERS.feeMin ||
      doctorsFilters.feeMax !== EMPTY_DOCTOR_FILTERS.feeMax;
    const hasCriteria =
      Boolean(q) ||
      Boolean(city) ||
      careCategoryId != null ||
      teleOnly ||
      doctorsFilters.availability.includes('now') ||
      feeFilterActive;
    if (!hasCriteria) {
      return undefined;
    }
    return {
      q,
      city,
      careCategoryId,
      teleOnly: teleOnly || undefined,
      isOnline: doctorsFilters.availability.includes('now') ? true : undefined,
      minFee: feeFilterActive ? doctorsFilters.feeMin : undefined,
      maxFee: feeFilterActive ? doctorsFilters.feeMax : undefined,
      pageNumber: 1,
      pageSize: 50,
      sortBy: 'online' as const,
    };
  }, [doctorsFilters, doctorsSearch]);

  const doctorsFilterCount = useMemo(
    () => countDoctorsTabFilters(doctorsSearch, doctorsFilters),
    [doctorsFilters, doctorsSearch],
  );

  const {
    data: publicDoctors = EMPTY_PUBLIC_DOCTORS,
    isLoading: isDoctorsLoading,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useGetDoctorsQuery(doctorsQueryArgs);

  const { data: doctorsFilterOptions } = useGetDoctorFilterOptionsQuery(
    undefined,
    { skip: selectedTab !== 'doctors' && !doctorsFiltersOpen },
  );

  const doctorsCityOptions = useMemo(
    () =>
      (doctorsFilterOptions?.cities ?? []).map((city) => ({
        id: city.trim().toLowerCase(),
        label: city.trim(),
      })),
    [doctorsFilterOptions?.cities],
  );

  const doctorsQualificationOptions = useMemo(
    () =>
      (doctorsFilterOptions?.qualifications ?? []).map((name) => ({
        id: name.trim().toLowerCase(),
        label: name.trim(),
      })),
    [doctorsFilterOptions?.qualifications],
  );

  const { data: careCategoriesResponse, refetch: refetchCareCategories } =
    useGetCareCategoriesQuery();
  const { data: articlesResponse, refetch: refetchArticles } =
    useGetArticlesQuery({
      pageNumber: 1,
      pageSize: 10,
    });

  const careCategories = useMemo<HomeCareCategoryItem[]>(() => {
    const rows = careCategoriesResponse?.data;
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row) => ({
        id: String(row.id),
        name: (row.name || '').trim(),
      }))
      .filter((row) => row.name.length > 0);
  }, [careCategoriesResponse?.data]);

  const healthArticles = useMemo<HomeArticleItem[]>(() => {
    const rows = articlesResponse?.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      id: String(row.blogId),
      title: (row.blogHead || '').trim(),
      subtitle: row.blogSubHead?.trim() || null,
      imageUrl: resolveApiUrl(row.blogImage1 ?? null),
    })).filter((row) => row.title.length > 0);
  }, [articlesResponse?.data]);

  useEffect(() => {
    if (isDoctorsError) {
      console.warn('[GET api/Public/Doctors] Request failed');
    }
  }, [isDoctorsError]);

  const closeAccountOverlays = () => {
    setEditProfileOpen(false);
    setAccountFamilyOpen(false);
    setMyAppointmentsOpen(false);
    setAccountRecordsOpen(false);
    setHealthInsightsOpen(false);
    setRemindersOpen(false);
    setCliniSightProgressOpen(false);
    setPaymentsOpen(false);
    setConsentCentreOpen(false);
  };

  const account = useAccountController({
    onLogOut,
    onOpenEditProfile: () => {
      closeAccountOverlays();
      setEditProfileOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onOpenFamilyMembers: () => {
      closeAccountOverlays();
      setAccountFamilyOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenAppointments: () => {
      closeAccountOverlays();
      setMyAppointmentsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenPrescriptions: () => {
      closeAccountOverlays();
      setAccountRecordsFilter('prescriptions');
      setAccountRecordsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenHealthRecords: () => {
      closeAccountOverlays();
      setAccountRecordsFilter('all');
      setAccountRecordsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenHealthInsights: () => {
      closeAccountOverlays();
      setHealthInsightsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onOpenReminders: () => {
      closeAccountOverlays();
      setRemindersOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onOpenPayments: () => {
      closeAccountOverlays();
      setPaymentsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setOrderMedicinesOpen(false);
      setOrderTrackingOpen(false);
    },
    onOpenConsentCentre: () => {
      closeAccountOverlays();
      setConsentCentreOpen(true);
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
      setNotificationsOpen(false);
      setNotificationSettingsOpen(false);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
    },
    onOpenMyReviews: () => {
      setMyReviewsOpen(true);
      setAppealReviewOpen(false);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
      setNotificationSettingsOpen(false);
      closeAccountOverlays();
      setMyReviewsOpen(true);
    },
    onOpenHelpCentre: () => {
      setHelpCentreOpen(true);
      setRaiseTicketOpen(false);
      setBookWithHelpOpen(false);
      setLegalDocId(null);
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
      setNotificationSettingsOpen(false);
      closeAccountOverlays();
      setHelpCentreOpen(true);
    },
    onOpenBookWithHelp: () => {
      setBookWithHelpOpen(true);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setLegalDocId(null);
      setMyReviewsOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
      closeAccountOverlays();
      setBookWithHelpOpen(true);
    },
    onOpenRaiseTicket: (topicId) => {
      closeAccountOverlays();
      setRaiseTicketTopicId(topicId ?? ('medicines' as HelpTopicId));
      setRaiseTicketOpen(true);
    },
    onOpenLegalDoc: (doc) => {
      setLegalDocId(doc);
      setBookWithHelpOpen(false);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setMyReviewsOpen(false);
      setConsentCentreOpen(false);
      closeAccountOverlays();
      setLegalDocId(doc);
    },
    onOpenNotificationSettings: () => {
      setNotificationSettingsOpen(true);
      setNotificationsOpen(false);
      setConsentCentreOpen(false);
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setBookWithHelpOpen(false);
      setLegalDocId(null);
      setPaymentsOpen(false);
      closeAccountOverlays();
      setNotificationSettingsOpen(true);
    },
  });

  const onConfirmBooking = useCallback((item: BookedAppointment) => {
    setAppointments((current) => {
      if (current.some((row) => row.id === item.id)) {
        return current;
      }
      return [item, ...current];
    });
  }, []);

  const onFinishBookingFlow = useCallback((targetTab: HomeTab = 'home') => {
    setBookingOpen(false);
    setProfileDoctorId(null);
    setSearchOpen(false);
    setResultsOpen(false);
    setHealthTipId(null);
    setSelectedAppointmentId(null);
    setMyAppointmentsOpen(false);
    setAppointmentRequestsOpen(false);
    setSelectedTab(targetTab);
  }, []);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const authPatientId = useAppSelector((state) => state.auth.patientId);
  const selfPatientId = authPatientId ?? authUser?.patientId;

  const {
    data: homeDashboardResponse,
    refetch: refetchHomeDashboard,
  } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const homeDashboardData = homeDashboardResponse?.data;

  const patientFullName =
    homeDashboardData?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const patientFirstName =
    authUser?.firstName ||
    (patientFullName ? patientFullName.split(' ')[0] : '');

  const {
    data: familyResponse,
    refetch: refetchFamily,
  } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });
  const apiFamily = familyResponse?.data;

  const {
    data: visitsResponse,
    refetch: refetchVisits,
  } = useGetPatientVisitsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const apiVisitsRaw = visitsResponse?.data;
  const apiVisitsList = Array.isArray(apiVisitsRaw)
    ? apiVisitsRaw
    : apiVisitsRaw &&
      typeof apiVisitsRaw === 'object' &&
      Array.isArray((apiVisitsRaw as { data?: unknown }).data)
      ? (apiVisitsRaw as { data: unknown[] }).data
      : EMPTY_VISITS;

  const [isHomeRefreshing, setIsHomeRefreshing] = useState(false);

  const onRefreshHome = useCallback(async () => {
    setIsHomeRefreshing(true);
    try {
      const refetches: Promise<unknown>[] = [];
      if (isAuthenticated) {
        refetches.push(Promise.resolve(refetchHomeDashboard()));
        refetches.push(Promise.resolve(refetchVisits()));
        refetches.push(Promise.resolve(refetchFamily()));
      }
      refetches.push(Promise.resolve(refetchArticles()));
      refetches.push(Promise.resolve(refetchCareCategories()));
      await Promise.allSettled(refetches);
    } catch {
      // Ignore network errors during pull-to-refresh
    } finally {
      setIsHomeRefreshing(false);
    }
  }, [
    isAuthenticated,
    refetchHomeDashboard,
    refetchVisits,
    refetchFamily,
    refetchArticles,
    refetchCareCategories,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      previousDashboardIdsRef.current = null;
      notifiedCompletedIdsRef.current = new Set();
      setCompletedMovedToastVisible(false);
      return;
    }

    type RawVisit = {
      patientAppId: number;
      doctorId: number;
      doctorName?: string;
      appointmentDate?: string;
      appointmentTime?: string;
      status: string;
      isTele?: boolean;
      consultMode?: string;
      visitType?: string;
      bookingToken?: string;
      patientName?: string;
      teleSessionId?: number | null;
      paymentStatus?: string;
      payAtClinicAllowed?: boolean;
      consultFee?: number | null;
      currency?: string | null;
    };
    const dashboardApps = (homeDashboardData?.nextAppointments ??
      EMPTY_VISITS) as RawVisit[];
    const serverVisits = apiVisitsList as RawVisit[];

    // Combine dashboard + visits; prefer visits when both exist so terminal
    // statuses (COMPLETED / CANCELLED) are not masked by a stale dashboard row.
    const combinedMap = new Map<number, RawVisit>();
    for (const item of dashboardApps) {
      combinedMap.set(item.patientAppId, item);
    }
    for (const item of serverVisits) {
      const existing = combinedMap.get(item.patientAppId);
      if (!existing) {
        combinedMap.set(item.patientAppId, item);
      } else {
        combinedMap.set(item.patientAppId, { ...existing, ...item });
      }
    }

    // Show homeDashboardData?.nextAppointments directly on Home with all filters removed
    const activeList = (
      homeDashboardData?.nextAppointments !== undefined
        ? homeDashboardData.nextAppointments
        : dashboardApps.length > 0
          ? dashboardApps
          : serverVisits
    ) as RawVisit[];

    console.log(
      '🔍 [useHomeController] Active list count (no filters):',
      activeList.length,
      activeList.map((a) => ({
        patientAppId: a.patientAppId,
        doctorName: a.doctorName,
        status: a.status,
        paymentStatus: a.paymentStatus,
        visitType: a.visitType,
      })),
    );

    const locale = language === 'mr' ? 'mr-IN' : 'en-IN';
    const mapped: BookedAppointment[] = activeList.map((a) => {
      const mode: ConsultMode =
        a.isTele || a.visitType === 'Tele' || a.consultMode === 'Tele'
          ? 'video'
          : 'clinic';
      const docName = a.doctorName || 'Doctor';
      const initials = docName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const dateRaw = a.appointmentDate ? a.appointmentDate.slice(0, 10) : '';
      const dateLine = formatDate(dateRaw, locale) ?? dateRaw;
      const timeLine =
        formatTime(a.appointmentTime, locale) ?? a.appointmentTime ?? '';
      const whenLabel = [dateLine, timeLine].filter(Boolean).join(' · ');
      const sortMs = appointmentSortMs(a.appointmentDate, a.appointmentTime);
      const startsAt =
        sortMs === Number.MAX_SAFE_INTEGER
          ? a.appointmentDate || new Date().toISOString()
          : new Date(sortMs).toISOString();

      return {
        id: String(a.patientAppId),
        bookingId: a.bookingToken || `APT-${a.patientAppId}`,
        doctorId: String(a.doctorId),
        doctorNameKey: docName as TranslationKey,
        doctorInitials: initials || 'DR',
        credentialsKey: '' as TranslationKey,
        experienceKey: '' as TranslationKey,
        whenLabel,
        dateLine,
        timeLine,
        startsAt,
        bookedOnLabel: dateLine,
        mode,
        modeConsultLabel:
          (
            {
              video: 'Video',
              audio: 'Audio',
              chat: 'Chat',
              clinic: 'Clinic',
            } as const satisfies Record<ConsultMode, string>
          )[mode],
        patientLabel: a.patientName || patientFullName,
        feeLabel: '', // fee from visit detail; list payload has no consultFee yet — hide blank
        paymentId: a.bookingToken || '',
        reasonKey: '' as TranslationKey,
        status:
          a.status === 'NOT ARRIVED' || a.status === 'WAITING' || a.status === 'E-CONSULT'
            ? ('confirmed' as AppointmentRequestStatus)
            : ('waiting_acceptance' as AppointmentRequestStatus),
        paymentStatus: a.paymentStatus,
        payAtClinicAllowed: a.payAtClinicAllowed,
        consultFee:
          a.consultFee != null && Number.isFinite(Number(a.consultFee))
            ? Number(a.consultFee)
            : null,
        currency: a.currency ?? null,
        teleSessionId: a.teleSessionId ?? null,
        patientAppId: a.patientAppId ?? null,
        visitStatus: a.status,
      };
    });

    const sortedMapped = sortBookingsByDateTime(mapped);
    const nextIds = new Set(sortedMapped.map((row) => row.id));

    if (previousDashboardIdsRef.current) {
      let shouldShowCompletedToast = false;
      for (const prevId of previousDashboardIdsRef.current) {
        if (nextIds.has(prevId)) continue;
        if (notifiedCompletedIdsRef.current.has(prevId)) continue;
        const numericId = Number(prevId);
        const raw =
          (Number.isFinite(numericId)
            ? combinedMap.get(numericId)
            : undefined) ??
          serverVisits.find((v) => String(v.patientAppId) === prevId) ??
          dashboardApps.find((v) => String(v.patientAppId) === prevId);
        if (raw?.status === 'COMPLETED') {
          notifiedCompletedIdsRef.current.add(prevId);
          shouldShowCompletedToast = true;
        }
      }
      if (shouldShowCompletedToast) {
        setCompletedMovedToastVisible(true);
        if (completedToastTimerRef.current) {
          clearTimeout(completedToastTimerRef.current);
        }
        completedToastTimerRef.current = setTimeout(() => {
          setCompletedMovedToastVisible(false);
          completedToastTimerRef.current = null;
        }, 6000);
      }
    }
    previousDashboardIdsRef.current = nextIds;

    setAppointments((current) => {
      // Keep any newly placed bookings from this session that might not yet be in server response
      const clientOnly = current.filter((c) => {
        if (c.id === 'seed-followup-chat') return false;
        if (mapped.some((m) => m.id === c.id)) return false;
        return true;
      });
      const next = sortBookingsByDateTime([...sortedMapped, ...clientOnly]);
      if (
        next.length === current.length &&
        next.every(
          (item, index) =>
            item.id === current[index]?.id &&
            item.status === current[index]?.status &&
            item.whenLabel === current[index]?.whenLabel &&
            item.patientLabel === current[index]?.patientLabel &&
            item.startsAt === current[index]?.startsAt,
        )
      ) {
        return current;
      }
      return next;
    });
  }, [
    homeDashboardData?.nextAppointments,
    apiVisitsList,
    isAuthenticated,
    language,
    patientFullName,
  ]);

  useEffect(() => {
    return () => {
      if (completedToastTimerRef.current) {
        clearTimeout(completedToastTimerRef.current);
      }
    };
  }, []);

  const memberOptions: HomeMemberOption[] = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily, selfPatientId),
    [patientFullName, apiFamily, selfPatientId],
  );

  const selectedMember =
    memberOptions.find((option) => option.id === selectedMemberId) ??
    memberOptions[0];
  const selectedMemberLabel = selectedMember.self
    ? t('bookMyself')
    : selectedMember.name.split(' ')[0];

  const greeting = patientFirstName
    ? `${t('homeHello')}, ${patientFirstName}`
    : t('homeHello');

  return {
    language,
    t,
    patientFirstName,
    greeting,
    searchOpen,
    resultsOpen,
    resultsQuery,
    searchNonce,
    selectedTab,
    selectedMemberId,
    memberPickerOpen,
    memberOptions,
    selectedMemberLabel,
    onOpenSearch: () => {
      if (!searchOpen && !resultsOpen) {
        setSearchOrigin(selectedTab);
      }
      setResultsOpen(false);
      setSearchOpen(true);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
    },
    onCloseSearch: () => {
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setSelectedTab(searchOrigin);
    },
    onOpenResults: (query) => {
      const trimmed = query.trim();
      const nextSearch: DoctorsTabSearch = {
        q: trimmed || undefined,
      };
      setResultsQuery(trimmed);
      setDoctorsSearch(nextSearch);
      setDoctorsFilters(filtersFromDoctorsSearch(nextSearch));
      setDoctorsFilterDraft(filtersFromDoctorsSearch(nextSearch));
      setSearchNonce((current) => current + 1);
      setSelectedTab('doctors');
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setConsultNowOpen(false);
    },
    onSearchDoctorsTab: (params) => {
      const q = params.q?.trim() || undefined;
      const city = params.city?.trim() || undefined;
      const careCategoryId =
        params.careCategoryId != null && params.careCategoryId > 0
          ? params.careCategoryId
          : undefined;
      const nextSearch: DoctorsTabSearch = { q, city, careCategoryId };
      setDoctorsSearch(nextSearch);
      setDoctorsFilters(filtersFromDoctorsSearch(nextSearch));
      setDoctorsFilterDraft(filtersFromDoctorsSearch(nextSearch));
      setResultsQuery(q || city || '');
      setSearchNonce((current) => current + 1);
      setSelectedTab('doctors');
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setConsultNowOpen(false);
    },
    onClearDoctorsSearch: () => {
      setDoctorsSearch(EMPTY_DOCTORS_TAB_SEARCH);
      setDoctorsFilters(DEFAULT_DOCTOR_FILTERS);
      setDoctorsFilterDraft(DEFAULT_DOCTOR_FILTERS);
      setResultsQuery('');
    },
    onRemoveDoctorsCity: () => {
      setDoctorsSearch((current) => ({ ...current, city: undefined }));
      setDoctorsFilters((current) => ({
        ...current,
        cityIds: [],
        useCurrentLocation: false,
      }));
    },
    onRemoveDoctorsQuery: () => {
      setDoctorsSearch((current) => ({
        ...current,
        q: undefined,
        careCategoryId: undefined,
      }));
      setDoctorsFilters((current) => ({
        ...current,
        careCategoryId: null,
        careNeedIds: [],
      }));
      setResultsQuery('');
    },
    doctorsSearch,
    doctorsFilterCount,
    doctorsFiltersOpen,
    doctorsFilterDraft,
    doctorsFilterMatchingCount: publicDoctors.length,
    doctorsDatePickerOpen,
    doctorsFilterCustomDate: doctorsFilterDraft.customDate
      ? new Date(`${doctorsFilterDraft.customDate}T12:00:00`)
      : new Date(),
    doctorsCityOptions,
    doctorsQualificationOptions,
    onOpenDoctorsFilters: () => {
      setDoctorsFilterDraft({
        ...doctorsFilters,
        cityIds: doctorsSearch.city?.trim()
          ? [doctorsSearch.city.trim().toLowerCase()]
          : doctorsFilters.cityIds,
        careCategoryId:
          doctorsSearch.careCategoryId ??
          doctorsFilters.careCategoryId ??
          null,
      });
      setDoctorsFiltersOpen(true);
    },
    onCloseDoctorsFilters: () => {
      setDoctorsFiltersOpen(false);
      setDoctorsDatePickerOpen(false);
      setDoctorsFilterDraft(doctorsFilters);
    },
    onResetDoctorsFilterDraft: () =>
      setDoctorsFilterDraft(EMPTY_DOCTOR_FILTERS),
    onClearDoctorsFilters: () => {
      setDoctorsSearch(EMPTY_DOCTORS_TAB_SEARCH);
      setDoctorsFilters(EMPTY_DOCTOR_FILTERS);
      setDoctorsFilterDraft(EMPTY_DOCTOR_FILTERS);
      setResultsQuery('');
      setDoctorsFiltersOpen(false);
      setDoctorsDatePickerOpen(false);
    },
    onApplyDoctorsFilters: () => {
      const draft = doctorsFilterDraft;
      const cityId = draft.cityIds.length === 1 ? draft.cityIds[0] : undefined;
      const cityLabel =
        doctorsCityOptions.find((c) => c.id === cityId)?.label ||
        (cityId
          ? cityId.replace(/\b\w/g, (ch) => ch.toUpperCase())
          : undefined);
      setDoctorsFilters(draft);
      setDoctorsSearch((current) => ({
        q: current.q,
        city: cityLabel,
        careCategoryId:
          draft.careCategoryId != null && draft.careCategoryId > 0
            ? draft.careCategoryId
            : current.careCategoryId,
      }));
      setDoctorsFiltersOpen(false);
      setDoctorsDatePickerOpen(false);
    },
    onToggleDoctorsCareNeed: (id) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        careNeedIds: toggleValue(current.careNeedIds, id),
      })),
    onToggleDoctorsMode: (mode) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        modes: toggleValue(current.modes, mode),
      })),
    onToggleDoctorsAvailability: (slot) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        availability: toggleValue(current.availability, slot),
      })),
    onChangeDoctorsFeeRange: (low, high) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        feeMin: low,
        feeMax: high,
      })),
    onToggleDoctorsFilterLanguage: (next) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        languages: toggleValue(current.languages, next),
      })),
    onToggleDoctorsGender: (gender) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        genders: toggleValue(current.genders, gender),
      })),
    onToggleDoctorsRecognized: () =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        recognizedQualification: !current.recognizedQualification,
      })),
    onToggleDoctorsFocusCert: () =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        focusCertified: !current.focusCertified,
      })),
    onChangeDoctorsLocationQuery: (value) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        locationQuery: value,
      })),
    onToggleDoctorsCity: (cityId) =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        cityIds: toggleValue(current.cityIds, cityId),
      })),
    onToggleDoctorsCurrentLocation: () =>
      setDoctorsFilterDraft((current) => ({
        ...current,
        useCurrentLocation: !current.useCurrentLocation,
      })),
    onOpenDoctorsDatePicker: () => setDoctorsDatePickerOpen(true),
    onCloseDoctorsDatePicker: () => setDoctorsDatePickerOpen(false),
    onSelectDoctorsCustomDate: (date) => {
      const stamp = date.toISOString().slice(0, 10);
      setDoctorsFilterDraft((current) => ({
        ...current,
        customDate: stamp,
        availability: current.availability.includes('date')
          ? current.availability
          : [...current.availability, 'date'],
      }));
      setDoctorsDatePickerOpen(false);
    },
    onCloseResults: () => {
      setResultsOpen(false);
      setSearchOpen(true);
      setProfileDoctorId(null);
    },
    onReopenSearch: () => {
      setResultsOpen(false);
      setSearchOpen(true);
      setProfileDoctorId(null);
    },
    onSelectTab: (tab) => {
      setSelectedTab(tab);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setHealthInsightsOpen(false);
      setRemindersOpen(false);
      setEditProfileOpen(false);
      setAccountFamilyOpen(false);
      setMyAppointmentsOpen(false);
      setAccountRecordsOpen(false);
      setCliniSightProgressOpen(false);
      setOrderMedicinesOpen(false);
      if (tab !== 'doctors') {
        setResultsOpen(false);
        setSearchOpen(false);
      }
    },
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (memberId) => {
      setSelectedMemberId(memberId);
      dispatch(setReduxSelectedMemberId(memberId));
      setMemberPickerOpen(false);
    },
    onAddMember: () => {
      setMemberPickerOpen(false);
      closeAccountOverlays();
      setAccountFamilyOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onSelectLanguage: setLanguage,
    onOpenNotifications: () => {
      setNotificationsOpen(true);
      setNotificationSettingsOpen(false);
    },
    onJoinConsultation: (appointmentId) => {
      if (appointmentId) {
        const target = appointments.find((item) => item.id === appointmentId);
        if (target && (target.mode === 'video' || target.mode === 'audio')) {
          setSelectedAppointmentId(target.id);
          return;
        }
      }
      const joinable = appointments.find(
        (item) => item.mode === 'video' || item.mode === 'audio',
      );
      if (joinable) {
        setSelectedAppointmentId(joinable.id);
      }
    },
    onFillSymptomDiary: () => {
      setSymptomDiaryOpen(true);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onTrackOrder: (orderId) => {
      if (orderId) setOrderDetailsId(orderId);
      setOrderTrackingOpen(true);
      setOrderDetailsVisible(false);
      setOrderMedicinesOpen(false);
      setPayMedicineOrderId(null);
    },
    orderTrackingOpen,
    onOpenOrderTracking: () => {
      setOrderTrackingOpen(true);
      setOrderMedicinesOpen(false);
    },
    onCloseOrderTracking: () => {
      setOrderTrackingOpen(false);
      setOrderDetailsId(null);
    },
    medicineOrderPlaced,
    onPlaceMedicineOrder: () => {
      setMedicineOrderPlaced(true);
      setOrderMedicinesOpen(false);
      setOrderLaunch(null);
      setOrderTrackingOpen(false);
      setOrderDetailsVisible(false);
      setOrderDetailsId(null);
      setPayMedicineOrderId(null);
      setSelectedTab('medicines');
      setSelectedMemberId('self');
      dispatch(setReduxSelectedMemberId('self'));
    },
    onViewAllCategories: () => {
      setSearchOrigin('home');
      setSearchOpen(true);
    },
    careCategories,
    healthArticles,
    onSelectCareCategory: (name) => {
      const trimmed = name.trim();
      const match = careCategories.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
      );
      const careCategoryId = match?.id ? Number(match.id) : undefined;
      const nextSearch: DoctorsTabSearch = {
        q: trimmed || undefined,
        careCategoryId:
          careCategoryId != null &&
            !Number.isNaN(careCategoryId) &&
            careCategoryId > 0
            ? careCategoryId
            : undefined,
      };
      setDoctorsSearch(nextSearch);
      setDoctorsFilters(filtersFromDoctorsSearch(nextSearch));
      setDoctorsFilterDraft(filtersFromDoctorsSearch(nextSearch));
      setResultsQuery(trimmed);
      setSearchNonce((n) => n + 1);
      setSelectedTab('doctors');
      setSearchOpen(false);
      setResultsOpen(false);
    },
    profileDoctorId,
    onOpenDoctorProfile: (doctorId) => {
      setHealthTipId(null);
      setBookingOpen(false);
      setProfileDoctorId(doctorId);
    },
    onCloseDoctorProfile: () => {
      setBookingOpen(false);
      setProfileDoctorId(null);
    },
    bookingOpen,
    onOpenBooking: () => setBookingOpen(true),
    onCloseBooking: () => setBookingOpen(false),
    healthTipId,
    onOpenHealthTip: (tipId) => {
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(tipId);
    },
    onCloseHealthTip: () => setHealthTipId(null),
    appointments,
    completedMovedToastVisible,
    onDismissCompletedMovedToast: () => {
      setCompletedMovedToastVisible(false);
      if (completedToastTimerRef.current) {
        clearTimeout(completedToastTimerRef.current);
        completedToastTimerRef.current = null;
      }
    },
    onOpenMyAppointmentsFromCompletedToast: () => {
      setCompletedMovedToastVisible(false);
      if (completedToastTimerRef.current) {
        clearTimeout(completedToastTimerRef.current);
        completedToastTimerRef.current = null;
      }
      setSelectedTab('account');
      setMyAppointmentsOpen(true);
    },
    selectedAppointmentId,
    onOpenAppointment: (id) => {
      setAppointments((current) =>
        current.map((row) =>
          row.id === id && row.status === 'waiting_acceptance'
            ? { ...row, status: 'confirmed' }
            : row,
        ),
      );
      setAccountRecordsOpen(false);
      setEditProfileOpen(false);
      setAccountFamilyOpen(false);
      setSelectedAppointmentId(id);
    },
    onCloseAppointment: () => setSelectedAppointmentId(null),
    onConfirmBooking,
    onFinishBookingFlow,
    onRemoveAppointment: (id) => {
      setAppointments((current) => current.filter((row) => row.id !== id));
    },
    onUpdateAppointment: (id, patch) => {
      setAppointments((current) =>
        current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      );
    },
    consultNowOpen,
    onOpenConsultNow: () => {
      setConsultNowOpen(true);
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setSelectedAppointmentId(null);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
    },
    onCloseConsultNow: () => setConsultNowOpen(false),
    followUpPlanAvailable,
    followUpPlanOpen,
    onActivateFollowUpPlan: () => setFollowUpPlanAvailable(true),
    onOpenFollowUpPlan: () => {
      setFollowUpPlanAvailable(true);
      setFollowUpPlanOpen(true);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
      setSelectedTab('home');
    },
    onCloseFollowUpPlan: () => {
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
    },
    symptomDiaryOpen,
    onOpenSymptomDiary: () => setSymptomDiaryOpen(true),
    onCloseSymptomDiary: () => setSymptomDiaryOpen(false),
    clinisightProgressOpen,
    onOpenCliniSightProgress: () => setCliniSightProgressOpen(true),
    onCloseCliniSightProgress: () => setCliniSightProgressOpen(false),
    healthInsightsOpen,
    onOpenHealthInsights: () => {
      setHealthInsightsOpen(true);
      setCliniSightProgressOpen(false);
    },
    onCloseHealthInsights: () => setHealthInsightsOpen(false),
    remindersOpen,
    onOpenReminders: () => {
      setRemindersOpen(true);
      setHealthInsightsOpen(false);
      setCliniSightProgressOpen(false);
    },
    onCloseReminders: () => setRemindersOpen(false),
    editProfileOpen,
    onOpenEditProfile: () => setEditProfileOpen(true),
    onCloseEditProfile: () => setEditProfileOpen(false),
    accountFamilyOpen,
    onOpenAccountFamily: () => setAccountFamilyOpen(true),
    onCloseAccountFamily: () => setAccountFamilyOpen(false),
    myAppointmentsOpen,
    onOpenMyAppointments: () => setMyAppointmentsOpen(true),
    onCloseMyAppointments: () => setMyAppointmentsOpen(false),
    appointmentRequestsOpen,
    onOpenAppointmentRequests: () => setAppointmentRequestsOpen(true),
    onCloseAppointmentRequests: () => setAppointmentRequestsOpen(false),
    accountRecordsOpen,
    accountRecordsFilter,
    onOpenAccountRecords: (filter = 'all') => {
      setAccountRecordsFilter(filter);
      setAccountRecordsOpen(true);
    },
    onCloseAccountRecords: () => setAccountRecordsOpen(false),
    paymentsOpen,
    onOpenPayments: () => setPaymentsOpen(true),
    onClosePayments: () => setPaymentsOpen(false),
    consentCentreOpen,
    onOpenConsentCentre: () => setConsentCentreOpen(true),
    onCloseConsentCentre: () => setConsentCentreOpen(false),
    myReviewsOpen,
    onOpenMyReviews: () => {
      setMyReviewsOpen(true);
      setAppealReviewOpen(false);
    },
    onCloseMyReviews: () => {
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
    },
    appealReviewOpen,
    appealReviewId,
    onOpenAppealReview: (reviewId) => {
      setAppealReviewId(reviewId ?? null);
      setAppealReviewOpen(true);
    },
    onCloseAppealReview: () => {
      setAppealReviewOpen(false);
      setAppealReviewId(null);
    },
    helpCentreOpen,
    onOpenHelpCentre: () => {
      setHelpCentreOpen(true);
      setRaiseTicketOpen(false);
    },
    onCloseHelpCentre: () => {
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
    },
    raiseTicketOpen,
    raiseTicketTopicId,
    onOpenRaiseTicket: (topicId) => {
      setRaiseTicketTopicId(topicId);
      setRaiseTicketOpen(true);
    },
    onCloseRaiseTicket: () => setRaiseTicketOpen(false),
    bookWithHelpOpen,
    onOpenBookWithHelp: () => {
      setBookWithHelpOpen(true);
      setLegalDocId(null);
    },
    onCloseBookWithHelp: () => setBookWithHelpOpen(false),
    legalDocId,
    onOpenLegalDoc: (doc) => {
      setLegalDocId(doc);
      setBookWithHelpOpen(false);
    },
    onCloseLegalDoc: () => setLegalDocId(null),
    notificationsOpen,
    onCloseNotifications: () => setNotificationsOpen(false),
    notificationSettingsOpen,
    onOpenNotificationSettings: () => {
      setNotificationSettingsOpen(true);
      setNotificationsOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
    },
    onCloseNotificationSettings: () => setNotificationSettingsOpen(false),
    orderMedicinesOpen,
    orderLaunch,
    onOpenOrderMedicines: (launch) => {
      setOrderLaunch(launch ?? null);
      setOrderMedicinesOpen(true);
      setPayMedicineOrderId(null);
      setSymptomDiaryOpen(false);
      setHealthInsightsOpen(false);
      setRemindersOpen(false);
      setCliniSightProgressOpen(false);
      setFollowUpPlanOpen(false);
    },
    onCloseOrderMedicines: () => {
      setOrderMedicinesOpen(false);
      setOrderLaunch(null);
    },
    payMedicineOrderId,
    onPayMedicineOrder: (orderId) => {
      setPayMedicineOrderId(orderId);
      setOrderTrackingOpen(false);
    },
    onCloseMedicinePay: () => setPayMedicineOrderId(null),
    orderDetailsOpen: orderDetailsVisible,
    orderDetailsId,
    onOpenOrderDetails: (orderId) => {
      setOrderDetailsId(orderId);
      setOrderDetailsVisible(true);
      setOrderMedicinesOpen(false);
      setOrderTrackingOpen(false);
    },
    onOpenTrackedOrderDetails: () => {
      if (!orderDetailsId) return;
      setOrderDetailsVisible(true);
    },
    onCloseOrderDetails: () => {
      setOrderDetailsVisible(false);
      if (!orderTrackingOpen) setOrderDetailsId(null);
    },
    onBookAnotherConsultation: () => {
      setSelectedAppointmentId(null);
      setSelectedTab('doctors');
      setSearchOpen(true);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
    },
    onFindDoctorFromTip: (query) => {
      const trimmed = query.trim();
      setHealthTipId(null);
      setResultsQuery(trimmed);
      setDoctorsSearch({ q: trimmed || undefined });
      setSearchNonce((current) => current + 1);
      setSelectedTab('doctors');
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
    },
    publicDoctors,
    isDoctorsLoading,
    isDoctorsError,
    refetchDoctors,
    isHomeRefreshing,
    onRefreshHome,
    account,
  };
}
