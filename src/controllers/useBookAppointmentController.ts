import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  DEFAULT_SLOT_ID,
  MONTH_KEYS,
  WEEKDAY_KEYS,
  buildDaysForMonth,
  firstSelectableDay,
  formatRupees,
  resolveBookingMembers,
  todayStart,
  upcomingMonths,
  type BookingDay,
  type BookingMember,
  type BookingMonthOption,
  type ConsultMode,
  type DayStatus,
  type TimeSlot,
} from '../config/appointmentSlots';
import { formatBookedOn, slotStartIso } from '../config/bookedAppointments';
import type { DoctorProfileSeed } from '../config/doctorProfiles';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedMemberId } from '../store/slices/authSlice';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import {
  useGetDoctorByIdQuery,
  useGetDoctorFeesQuery,
  useGetDoctorSlotsQuery,
} from '../store/api/new/doctorsApi';
import {
  useBookAsFamilyMutation,
  useCreateBookingMutation,
  useGetTermsPolicyQuery,
  type BookAsFamilyRequest,
  type CreateBookingRequest,
} from '../store/api/new/bookingApi';
import { useCancelAppointmentMutation } from '../store/api/new/visitsApi';
import { useCreateAppointmentRequestMutation } from '../store/api/new/appointmentRequestsApi';
import { createIdempotencyKey } from '../utilities/idempotency';
import { formatMoney } from '../utilities/formatters';
import { extractErrorMessage } from '../store/api/new/newBaseApi';
import { clearPendingPayment } from '../payments';

export type PaymentStatus = 'success' | 'failed' | 'pending';

export type BookAppointmentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  profile: DoctorProfileSeed;
  shortCredsKey: TranslationKey;
  member: BookingMember;
  members: BookingMember[];
  memberPickerOpen: boolean;
  monthPickerOpen: boolean;
  mode: ConsultMode;
  days: BookingDay[];
  selectedDay: BookingDay | undefined;
  selectedSlotId: string | null;
  monthLabel: string;
  monthOptions: BookingMonthOption[];
  selectedMonth: BookingMonthOption;
  feeLabel: string;
  summaryLine: string;
  waitlistTitle: string;
  waitlistSummary: string;
  isFull: boolean;
  canContinue: boolean;
  reviewOpen: boolean;
  paymentOpen: boolean;
  paymentStatus: PaymentStatus | null;
  whenLabel: string;
  dateLine: string;
  timeLine: string;
  startsAt: string;
  bookedOnLabel: string;
  slotTimeLabel: string;
  paymentSummaryLine: string;
  modeConsultLabel: string;
  patientLabel: string;
  doctorFeeLabel: string;
  /** Empty when platformFee is null — UI must hide the row. */
  platformFeeLabel: string;
  taxesLabel: string;
  slotsLoading: boolean;
  slotsEmpty: boolean;
  bookingError: string | null;
  holdExpiresAt: string | null;
  /** From booking create — required for ConsultOrders. */
  patientAppId: number | null;
  bookingToken: string | null;
  /** True when consult mode is InClinic — show Pay at Clinic on payment screen. */
  isInClinicMode: boolean;
  /** Server payment order id after Checkout confirm (never a seed). */
  lastPaymentOrderId: number | null;
  bookingInFlight: boolean;
  onBack: () => void;
  onCloseReview: () => void;
  /** Navigate to Payment only — does not call Bookings / BookAs. */
  onOpenPayment: () => void;
  onClosePayment: () => void;
  /**
   * Create / update slot booking with payAtClinic + optional Razorpay ids.
   * Called from Payment: Pay at Clinic (direct) or after Razorpay success (online).
   */
  onSubmitBooking: (payment: {
    payAtClinic: boolean;
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
  }) => Promise<{
    patientAppId: number;
    bookingToken: string;
    holdExpiresAt?: string;
    consultFee?: number;
  }>;
  paymentFailureReason: string | null;
  onOpenPaymentStatus: (status: PaymentStatus, reason?: string | null) => void;
  onClosePaymentStatus: () => void;
  onPaymentConfirmed: (paymentOrderId: number) => void;
  onPaymentPending: (paymentOrderId: number) => void;
  onChooseOtherSlot: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: string) => void;
  onOpenMonthPicker: () => void;
  onCloseMonthPicker: () => void;
  onSelectMonth: (option: BookingMonthOption) => void;
  onSelectMode: (mode: ConsultMode) => void;
  onSelectDay: (id: string) => void;
  onSelectSlot: (id: string) => void;
  onContinue: () => void;
  onJoinWaitlist: () => void;
  onAddMember: () => void;
  onResetBooking: () => void;
  onCancelHold: (reasonText?: string) => Promise<void>;
};

function shortCredsFor(id: string): TranslationKey {
  if (id === 'rajesh') {
    return 'bookRajeshShortCreds';
  }
  if (id === 'sunita') {
    return 'bookSunitaShortCreds';
  }
  return 'bookAnjaliShortCreds';
}

function firstOpenSlot(day: BookingDay): string | null {
  const all = [...day.morning, ...day.afternoon, ...day.evening];
  return all.find((slot) => slot.id === DEFAULT_SLOT_ID && !slot.booked)?.id
    ?? all.find((slot) => !slot.booked)?.id
    ?? null;
}

function weekdayLabel(day: BookingDay, t: (key: TranslationKey) => string): string {
  return day.isToday ? t('bookToday') : t(WEEKDAY_KEYS[day.weekdayIndex]);
}

function formatDaySummary(
  day: BookingDay,
  t: (key: TranslationKey) => string,
  language: AppLanguage,
): string {
  const weekday = weekdayLabel(day, t);
  const monthName = t(MONTH_KEYS[day.month]);
  const month = language === 'en' ? monthName.slice(0, 3) : monthName;
  return `${weekday}, ${day.day} ${month} ${day.year}`;
}

export function useBookAppointmentController({
  doctorId,
  initialMemberId,
  active = true,
  onBack,
  onAddMember,
  onMemberChange,
}: {
  doctorId: string;
  initialMemberId?: string;
  active?: boolean;
  onBack: () => void;
  onAddMember?: () => void;
  onMemberChange?: (memberId: string) => void;
}): BookAppointmentViewModel {
  const { language, t } = useLocalization();
  const isNumeric = Boolean(doctorId) && /^\d+$/.test(doctorId);
  const { data: doctorDetailResponse } = useGetDoctorByIdQuery(doctorId, {
    skip: !isNumeric || !active,
  });
  const emptyShell = useMemo(
    (): DoctorProfileSeed => ({
      id: doctorId || '0',
      initials: 'DR',
      verified: false,
      nameKey: '' as TranslationKey,
      credentialsKey: '' as TranslationKey,
      experienceKey: '',
      rating: null,
      reviewCount: 0,
      reviewsKey: '' as TranslationKey,
      consultsKey: '',
      aboutKey: '',
      regVerifiedKey: '' as TranslationKey,
      lastVerifiedKey: '',
      nextAvailableKey: '',
      feeKey: '',
      clinicFeeKey: '',
      teleFeeLabel: null,
      clinicFeeLabel: null,
      registrationNumber: null,
      passingUniversity: null,
      photoUrl: null,
      careNeedKeys: [],
      languageKeys: [],
      reviewIds: [],
      credentialsDetail: { qualifications: [] },
    }),
    [doctorId],
  );
  const profile = useMemo(() => {
    if (!isNumeric || !doctorDetailResponse?.data) return emptyShell;
    const doc = doctorDetailResponse.data;
    const docName = (doc.displayName || '').trim() || 'Doctor';
    const initials =
      docName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DR';

    const teleFeeLabel = formatMoney(doc.consultFeeTele, 'INR');
    const clinicFeeLabel = formatMoney(doc.consultFeeInClinic, 'INR');
    const mapped: DoctorProfileSeed = {
      ...emptyShell,
      id: String(doc.doctorId),
      nameKey: docName as TranslationKey,
      credentialsKey: (doc.qualification || '') as TranslationKey,
      initials,
      verified: Boolean(doc.verified ?? doc.isVerified),
      feeKey: (teleFeeLabel || '') as TranslationKey,
      clinicFeeKey: (clinicFeeLabel || '') as TranslationKey,
      teleFeeLabel,
      clinicFeeLabel,
      registrationNumber: doc.registrationNumber?.trim() || null,
      passingUniversity: doc.passingUniversity?.trim() || null,
      photoUrl: doc.photoUrl ?? null,
      experienceKey: '',
      languageKeys: [],
      careNeedKeys: [],
    };
    return mapped;
  }, [emptyShell, doctorDetailResponse?.data, isNumeric]);

  useEffect(() => {
    if (active && !isNumeric) {
      onBack();
    }
  }, [active, isNumeric, onBack]);
  const today = useMemo(() => todayStart(), []);
  const monthOptions = useMemo(() => upcomingMonths(12), []);
  const dispatch = useAppDispatch();
  const reduxSelectedMemberId = useAppSelector(
    (state) => state.auth.selectedMemberId,
  );
  const effectiveInitialMemberId =
    initialMemberId ?? reduxSelectedMemberId ?? 'self';
  const [memberId, setMemberId] = useState(effectiveInitialMemberId);

  useEffect(() => {
    if (active) {
      const targetId = initialMemberId ?? reduxSelectedMemberId ?? 'self';
      setMemberId(targetId);
    }
  }, [active, initialMemberId, reduxSelectedMemberId]);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paymentFailureReason, setPaymentFailureReason] = useState<string | null>(null);
  const [mode, setMode] = useState<ConsultMode>('video');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [patientAppId, setPatientAppId] = useState<number | null>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const [lastPaymentOrderId, setLastPaymentOrderId] = useState<number | null>(
    null,
  );
  const [holdConsultFee, setHoldConsultFee] = useState<number | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<BookingMonthOption>(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const calendarDays = useMemo(
    () => buildDaysForMonth(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year],
  );
  const [dayId, setDayId] = useState(
    () => firstSelectableDay(buildDaysForMonth(today.getFullYear(), today.getMonth()))?.id ?? '',
  );
  const [slotId, setSlotId] = useState<string | null>(null);

  const [cancelAppointmentMutation] = useCancelAppointmentMutation();
  const patientAppIdRef = useRef<number | null>(null);
  patientAppIdRef.current = patientAppId;
  const paymentStatusRef = useRef<PaymentStatus | null>(null);
  paymentStatusRef.current = paymentStatus;

  const onCancelHold = useCallback(
    async (reasonText?: string) => {
      const id = patientAppIdRef.current;
      if (id != null && paymentStatusRef.current !== 'success') {
        try {
          await cancelAppointmentMutation({
            patientAppId: id,
            reasonCode: 'PatientRequest',
            reasonText: reasonText || 'Payment cancelled by user',
          }).unwrap();
        } catch (err) {
          console.warn('[BookAppointment] Cancel hold failed (soft fail):', err);
        }
      }
      void clearPendingPayment();
      setPaymentStatus(null);
      setPaymentOpen(false);
      setReviewOpen(false);
      setPatientAppId(null);
      setBookingToken(null);
      setHoldExpiresAt(null);
      setLastPaymentOrderId(null);
      setHoldConsultFee(null);
      setSlotId(null);
    },
    [cancelAppointmentMutation],
  );

  const onResetBooking = useCallback(() => {
    const id = patientAppIdRef.current;
    if (id != null && paymentStatusRef.current !== 'success') {
      void cancelAppointmentMutation({
        patientAppId: id,
        reasonCode: 'PatientRequest',
        reasonText: 'Booking reset',
      });
    }
    void clearPendingPayment();
    const targetMember = initialMemberId ?? reduxSelectedMemberId ?? 'self';
    setMemberId(targetMember);
    setMode('video');
    setMemberPickerOpen(false);
    setMonthPickerOpen(false);
    setReviewOpen(false);
    setPaymentOpen(false);
    setPaymentStatus(null);
    setPaymentFailureReason(null);
    setBookingError(null);
    setHoldExpiresAt(null);
    setPatientAppId(null);
    setBookingToken(null);
    setLastPaymentOrderId(null);
    setHoldConsultFee(null);
    setSlotId(null);
    setWaitlistJoined(false);
  }, [cancelAppointmentMutation, initialMemberId, reduxSelectedMemberId]);

  const prevDoctorIdRef = useRef(doctorId);
  useEffect(() => {
    if (prevDoctorIdRef.current !== doctorId) {
      prevDoctorIdRef.current = doctorId;
      onResetBooking();
      const now = todayStart();
      const nextMonth = { year: now.getFullYear(), month: now.getMonth() };
      setVisibleMonth(nextMonth);
      const nextDays = buildDaysForMonth(nextMonth.year, nextMonth.month);
      const first = firstSelectableDay(nextDays);
      setDayId(first?.id ?? '');
    }
  }, [doctorId, onResetBooking]);

  const prevActiveRef = useRef(active);
  useEffect(() => {
    if (prevActiveRef.current && !active) {
      onResetBooking();
    }
    prevActiveRef.current = active;
  }, [active, onResetBooking]);

  const isNumericDoctorId = !isNaN(Number(doctorId));
  const { data: doctorFeesResponse } = useGetDoctorFeesQuery(doctorId, {
    skip: !isNumericDoctorId,
  });

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const authPatientId = useAppSelector((state) => state.auth.patientId);
  const authUserId = useAppSelector((state) => state.auth.userId);
  const authMobile = useAppSelector((state) => state.auth.mobile);
  const bookingSessionId = useAppSelector(
    (state) => state.auth.bookingSessionId,
  );
  const { data: termsPolicyResponse } = useGetTermsPolicyQuery();
  const consentPolicyVersion = termsPolicyResponse?.data?.version || '2026.1';
  const [createAppointmentRequest] = useCreateAppointmentRequestMutation();
  const [createBookingMutation, { isLoading: createBookingLoading }] =
    useCreateBookingMutation();
  const [bookAsFamilyMutation, { isLoading: bookAsFamilyLoading }] =
    useBookAsFamilyMutation();
  const bookingInFlight = createBookingLoading || bookAsFamilyLoading;
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const {
    data: slotsResponse,
    isFetching: slotsLoading,
  } = useGetDoctorSlotsQuery(
    { doctorId, date: dayId },
    { skip: !isNumericDoctorId || !dayId || !active },
  );

  const days = useMemo((): BookingDay[] => {
    if (!isNumericDoctorId) {
      // Seed doctor ids — no slots API; show empty slot lists (no fabricated grids).
      return calendarDays.map((day) => ({
        ...day,
        status: (day.status === 'past' || day.status === 'closed'
          ? day.status
          : 'open') as DayStatus,
        morning: [] as TimeSlot[],
        afternoon: [] as TimeSlot[],
        evening: [] as TimeSlot[],
      }));
    }

    return calendarDays.map((day) => {
      const isSelected = day.id === dayId;
      if (!isSelected) {
        return {
          ...day,
          // Drop synthetic full/closed heuristics for API doctors.
          status: (day.status === 'past' ? day.status : 'open') as DayStatus,
          morning: [] as TimeSlot[],
          afternoon: [] as TimeSlot[],
          evening: [] as TimeSlot[],
        };
      }

      const apiSlots = slotsResponse?.data?.slots ?? [];
      const now = new Date();
      const mapped: TimeSlot[] = apiSlots
        .filter((slot) => slot.status !== 'break')
        .map((slot) => {
          const time = (slot.time || '').slice(0, 5);
          const [hh, mm] = time.split(':').map(Number);
          const slotStart = new Date(
            day.year,
            day.month,
            day.day,
            Number.isFinite(hh) ? hh : 0,
            Number.isFinite(mm) ? mm : 0,
            0,
            0,
          );
          const isPastToday =
            day.isToday && slotStart.getTime() <= now.getTime();
          return {
            id: time,
            labelKey: (slot.label || time) as TranslationKey,
            booked: slot.status !== 'available' || isPastToday,
          };
        });

      const morning = mapped.filter((s) => {
        const h = Number(s.id.split(':')[0]);
        return h < 12;
      });
      const afternoon = mapped.filter((s) => {
        const h = Number(s.id.split(':')[0]);
        return h >= 12 && h < 17;
      });
      const evening = mapped.filter((s) => {
        const h = Number(s.id.split(':')[0]);
        return h >= 17;
      });
      const anyOpen = mapped.some((s) => !s.booked);
      const status: DayStatus =
        mapped.length === 0 ? 'open' : anyOpen ? 'open' : 'full';
      return {
        ...day,
        status,
        morning,
        afternoon,
        evening,
      };
    });
  }, [calendarDays, dayId, isNumericDoctorId, slotsResponse?.data?.slots]);

  useEffect(() => {
    if (!slotsResponse?.data?.slots || !dayId) {
      return;
    }
    const selectedDayMeta = calendarDays.find((day) => day.id === dayId);
    const now = new Date();
    const available = slotsResponse.data.slots.find((slot) => {
      if (slot.status !== 'available') {
        return false;
      }
      const time = (slot.time || '').slice(0, 5);
      if (!selectedDayMeta?.isToday) {
        return true;
      }
      const [hh, mm] = time.split(':').map(Number);
      const slotStart = new Date(
        selectedDayMeta.year,
        selectedDayMeta.month,
        selectedDayMeta.day,
        Number.isFinite(hh) ? hh : 0,
        Number.isFinite(mm) ? mm : 0,
        0,
        0,
      );
      return slotStart.getTime() > now.getTime();
    });
    setSlotId(available ? available.time.slice(0, 5) : null);
  }, [calendarDays, dayId, slotsResponse?.data?.slots]);

  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const homeDashboardData = homeDashboardResponse?.data;

  const patientFullName =
    homeDashboardData?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });
  const apiFamily = familyResponse?.data;

  const selfPatientId = authPatientId ?? authUser?.patientId;
  const members = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily, selfPatientId),
    [patientFullName, apiFamily, selfPatientId],
  );

  const selectedDay =
    days.find((day) => day.id === dayId) ?? firstSelectableDay(days) ?? days[0];

  const handleJoinWaitlist = useCallback(async () => {
    if (waitlistJoined) return;
    const docIdNum = Number(profile.id);
    if (!docIdNum) {
      setBookingError('Doctor id is required to ask for a time.');
      return;
    }
    const requestedDate = selectedDay?.id || dayId || '';
    if (!requestedDate) {
      setBookingError('Select a date first.');
      return;
    }
    // Contract §7 — preferred time; use selected slot or midday placeholder.
    const requestedTime = (slotId || '12:00').slice(0, 5);

    const idempotencyKey = createIdempotencyKey('ar');
    try {
      await createAppointmentRequest({
        body: {
          doctorId: docIdNum,
          requestedDate,
          requestedTime,
          consultMode: mode === 'clinic' ? 'InClinic' : 'Tele',
          reason: 'Request for available time',
        },
        idempotencyKey,
      }).unwrap();
      setWaitlistJoined(true);
      setBookingError(null);
    } catch (err) {
      const e = err as { data?: { code?: string; message?: string } };
      if (e?.data?.code === 'IDEMPOTENCY_CONFLICT') {
        setBookingError(
          e.data.message ||
          'That request conflicted with a previous attempt. Please try again.',
        );
      } else {
        setBookingError(extractErrorMessage(err));
      }
    }
  }, [
    waitlistJoined,
    profile.id,
    selectedDay?.id,
    dayId,
    slotId,
    mode,
    createAppointmentRequest,
  ]);

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const isFull = selectedDay?.status === 'full';
  const realFee = doctorFeesResponse?.data;
  const apiConsultFee =
    mode === 'clinic' ? realFee?.inClinicFee : realFee?.teleFee;
  const detailFee =
    mode === 'clinic'
      ? doctorDetailResponse?.data?.consultFeeInClinic
      : doctorDetailResponse?.data?.consultFeeTele;
  const resolvedFee =
    holdConsultFee != null
      ? holdConsultFee
      : apiConsultFee != null
        ? apiConsultFee
        : detailFee != null
          ? detailFee
          : null;
  const feeLabel =
    formatMoney(resolvedFee, realFee?.currency ?? 'INR') ?? '';
  const slotsEmpty =
    isNumericDoctorId &&
    !slotsLoading &&
    Boolean(dayId) &&
    (slotsResponse?.data?.slots?.length ?? 0) === 0;
  const modeLabel = t(
    mode === 'audio'
      ? 'bookAudio'
      : mode === 'clinic'
        ? 'bookClinic'
        : mode === 'chat'
          ? 'bookChat'
          : 'bookVideo',
  );
  const selectedSlot: TimeSlot | undefined = selectedDay
    ? [...selectedDay.morning, ...selectedDay.afternoon, ...selectedDay.evening].find(
      (slot) => slot.id === slotId,
    )
    : undefined;
  const daySummary = selectedDay ? formatDaySummary(selectedDay, t, language) : '';
  const modeConsultLabel = t(
    mode === 'audio'
      ? 'reviewAudioConsult'
      : mode === 'clinic'
        ? 'reviewClinicVisit'
        : mode === 'chat'
          ? 'reviewChatConsult'
          : 'reviewVideoConsult',
  );
  const canContinue =
    Boolean(selectedSlot) &&
    !selectedSlot?.booked &&
    !isFull &&
    !slotsEmpty;

  // Drop selection if it became past / unavailable after slot remap.
  useEffect(() => {
    if (slotId && selectedSlot?.booked) {
      setSlotId(null);
    }
  }, [selectedSlot?.booked, slotId]);
  const doctorFeeLabel = feeLabel;
  // Contract: platformFee only from visit/payment — never invent 90.
  const platformFeeLabel = '';
  const taxesLabel = '';
  const patientLabel = member.self
    ? member.name
    : member.relationshipName
      ? `${member.name} (${member.relationshipName}${member.age ? `, ${member.age} yrs` : ''})`
      : member.metaKey
        ? `${member.name} (${t(member.metaKey).replace(' • ', ', ')})`
        : member.name;
  const slotTimeLabel = selectedSlot ? t(selectedSlot.labelKey) : '';
  const timeLine = slotTimeLabel ? `${slotTimeLabel} IST` : '';
  const whenLabel = selectedSlot ? `${daySummary} · ${timeLine}` : daySummary;
  const startsAt =
    selectedDay && selectedSlot
      ? slotStartIso(selectedDay.year, selectedDay.month, selectedDay.day, selectedSlot.id)
      : new Date().toISOString();
  const bookedOnLabel = formatBookedOn(today, language, t(MONTH_KEYS[today.getMonth()]));
  const shortWhen =
    selectedDay && selectedSlot
      ? `${weekdayLabel(selectedDay, t)} ${selectedDay.day} ${language === 'en'
        ? t(MONTH_KEYS[selectedDay.month]).slice(0, 3)
        : t(MONTH_KEYS[selectedDay.month])
      }, ${t(selectedSlot.labelKey)}`
      : daySummary;
  const paymentSummaryLine = t('payConsultWith')
    .replace('{name}', t(profile.nameKey))
    .replace('{when}', shortWhen);
  const summaryLine = isFull
    ? t('bookWaitlistSummary').replace('{date}', daySummary)
    : selectedSlot
      ? `${daySummary} · ${t(selectedSlot.labelKey)} · ${modeLabel}`
      : daySummary;
  const sameYear = visibleMonth.year === today.getFullYear();
  const monthName = t(MONTH_KEYS[visibleMonth.month]);
  const monthLabel = sameYear ? monthName : `${monthName} ${visibleMonth.year}`;

  return {
    language,
    t,
    profile,
    shortCredsKey: doctorDetailResponse?.data?.qualification
      ? (doctorDetailResponse.data.qualification as TranslationKey)
      : shortCredsFor(profile.id),
    member,
    members,
    memberPickerOpen,
    monthPickerOpen,
    mode,
    days,
    selectedDay,
    selectedSlotId: slotId,
    monthLabel,
    monthOptions,
    selectedMonth: visibleMonth,
    feeLabel,
    summaryLine,
    waitlistTitle: t('bookWaitlistTitle').replace('{date}', daySummary),
    waitlistSummary: t('bookWaitlistSummary').replace('{date}', daySummary),
    isFull,
    canContinue,
    reviewOpen,
    paymentOpen,
    paymentStatus,
    paymentFailureReason,
    whenLabel,
    dateLine: daySummary,
    timeLine,
    startsAt,
    bookedOnLabel,
    slotTimeLabel,
    paymentSummaryLine,
    modeConsultLabel,
    patientLabel,
    doctorFeeLabel,
    platformFeeLabel,
    taxesLabel,
    slotsLoading,
    slotsEmpty,
    bookingError,
    holdExpiresAt,
    patientAppId,
    bookingToken,
    isInClinicMode: mode === 'clinic',
    lastPaymentOrderId,
    bookingInFlight,
    onBack,
    onCloseReview: () => {
      setPaymentStatus(null);
      setPaymentFailureReason(null);
      setPaymentOpen(false);
      setReviewOpen(false);
      setBookingError(null);
    },
    onOpenPayment: () => {
      // Proceed To Pay — navigate only; Bookings / BookAs run from Payment buttons.
      if (!selectedDay || !selectedSlot) {
        return;
      }
      setBookingError(null);
      setLastPaymentOrderId(null);
      setPaymentStatus(null);
      setPaymentFailureReason(null);
      setPaymentOpen(true);
    },
    onSubmitBooking: async (payment) => {
      if (!selectedDay || !selectedSlot) {
        throw new Error('Select a day and time slot first.');
      }
      const docIdNum = Number(profile.id);
      if (!docIdNum) {
        throw new Error('Doctor id is required.');
      }
      const phone = authUser?.mobile || authUser?.mobileNo || authMobile;
      if (!phone) {
        throw new Error('Mobile number is required.');
      }
      const selectedPatientName = member.self
        ? (patientFullName ||
          authUser?.patientName ||
          [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
          member.name ||
          'Patient')
        : (member.name || patientFullName || 'Patient');
      const consultMode: 'InClinic' | 'Tele' = mode === 'clinic' ? 'InClinic' : 'Tele';
      const visitType: 'InClinic' | 'Tele' = consultMode;
      const isTele = consultMode === 'Tele';
      const appointmentDate = selectedDay.id;
      const appointmentTime = selectedSlot.id;
      const effectiveUserId =
        typeof authUser?.userId === 'number'
          ? authUser.userId
          : typeof authUserId === 'number'
            ? authUserId
            : 0;
      const email = authUser?.email || undefined;
      const razorpay_order_id = payment.razorpay_order_id ?? null;
      const razorpay_payment_id = payment.razorpay_payment_id ?? null;

      const applyHold = (data: {
        patientAppId?: number;
        bookingToken?: string;
        holdExpiresAt?: string;
        consultFee?: number;
      } | null | undefined) => {
        setPatientAppId(data?.patientAppId ?? null);
        setBookingToken(data?.bookingToken ?? null);
        setHoldExpiresAt(data?.holdExpiresAt ?? null);
        setHoldConsultFee(
          data?.consultFee != null ? Number(data.consultFee) : null,
        );
      };

      // Strict Self vs. Family Member routing
      const isFamilyMember = !member.self;
      const memberPatientId =
        member.memberPatientId ??
        member.patientId ??
        (Number.isFinite(Number(member.id)) && Number(member.id) > 0 ? Number(member.id) : undefined);

      const isDev =
        typeof __DEV__ !== 'undefined'
          ? __DEV__
          : process.env.NODE_ENV !== 'production';

      const maskSensitive = (obj: Record<string, unknown>) => {
        const masked: Record<string, unknown> = { ...obj };
        if (typeof masked.mobile === 'string') {
          const m = masked.mobile;
          masked.mobile = m.length > 4 ? `${m.slice(0, 2)}******${m.slice(-2)}` : '****';
        }
        if (typeof masked.email === 'string') {
          const e = masked.email;
          const at = e.indexOf('@');
          masked.email = at > 2 ? `${e.slice(0, 2)}***${e.slice(at)}` : '***@***';
        }
        if (typeof masked.razorpay_order_id === 'string' && masked.razorpay_order_id) {
          masked.razorpay_order_id = `${masked.razorpay_order_id.slice(0, 6)}*****`;
        }
        if (typeof masked.razorpay_payment_id === 'string' && masked.razorpay_payment_id) {
          masked.razorpay_payment_id = `${masked.razorpay_payment_id.slice(0, 6)}*****`;
        }
        return masked;
      };

      let data: {
        patientAppId?: number;
        bookingToken?: string;
        holdExpiresAt?: string;
        consultFee?: number;
      } | null | undefined;

      if (isFamilyMember) {
        if (!memberPatientId || memberPatientId <= 0) {
          throw new Error(
            `Cannot book for family member "${member.name}": Missing valid memberPatientId.`,
          );
        }

        const familyPayload: BookAsFamilyRequest = {
          memberPatientId,
          doctorId: docIdNum,
          appointmentDate,
          appointmentTime,
          visitType,
          consultMode,
          isTele,
          userId: effectiveUserId,
          payAtClinic: Boolean(payment.payAtClinic),
          razorpay_order_id,
          razorpay_payment_id,
        };

        const booking = await bookAsFamilyMutation(familyPayload).unwrap();
        data = booking.data;
      } else {
        const selfPayload: CreateBookingRequest = {
          doctorId: docIdNum,
          mobile: phone,
          patientName: selectedPatientName,
          email,
          appointmentDate,
          appointmentTime,
          visitType,
          consultMode,
          isTele,
          bookingSessionId: typeof bookingSessionId === 'number' ? bookingSessionId : 0,
          consentPolicyVersion,
          payAtClinic: Boolean(payment.payAtClinic),
          userId: effectiveUserId,
          razorpay_order_id,
          razorpay_payment_id,
          idempotencyKey: createIdempotencyKey(
            `pa-${docIdNum}-${payment.payAtClinic ? 'clinic' : 'online'}`,
          ),
        };
        const booking = await createBookingMutation(selfPayload).unwrap();
        data = booking.data;
      }

      applyHold(data);

      if (!data?.patientAppId || !data?.bookingToken) {
        throw new Error('Booking response was incomplete.');
      }

      return {
        patientAppId: data.patientAppId,
        bookingToken: data.bookingToken,
        holdExpiresAt: data.holdExpiresAt,
        consultFee:
          data.consultFee != null ? Number(data.consultFee) : undefined,
      };
    },
    onClosePayment: () => {
      void onCancelHold('Payment cancelled by user');
    },
    onOpenPaymentStatus: (status, reason) => {
      setPaymentStatus(status);
      setPaymentFailureReason(reason ?? null);
    },
    onClosePaymentStatus: () => {
      setPaymentStatus(null);
      setPaymentFailureReason(null);
    },
    onPaymentConfirmed: (paymentOrderId) => {
      setLastPaymentOrderId(paymentOrderId);
      setPaymentStatus('success');
    },
    onPaymentPending: (paymentOrderId) => {
      if (paymentOrderId > 0) {
        setLastPaymentOrderId(paymentOrderId);
      }
      setPaymentStatus('pending');
    },
    onChooseOtherSlot: () => {
      void onCancelHold('User selected other slot');
    },
    onCancelHold,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      dispatch(setSelectedMemberId(id));
      onMemberChange?.(id);
      setMemberPickerOpen(false);
    },
    onOpenMonthPicker: () => setMonthPickerOpen(true),
    onCloseMonthPicker: () => setMonthPickerOpen(false),
    onSelectMonth: (option) => {
      setVisibleMonth(option);
      setMonthPickerOpen(false);
      const nextDays = buildDaysForMonth(option.year, option.month);
      const first = firstSelectableDay(nextDays);
      setDayId(first?.id ?? '');
      setSlotId(first && first.status !== 'full' ? firstOpenSlot(first) : null);
    },
    onSelectMode: setMode,
    onSelectDay: (id) => {
      const next = days.find((day) => day.id === id);
      if (!next || next.status === 'closed' || next.status === 'past') {
        return;
      }
      setDayId(id);
      if (next.status === 'full') {
        setSlotId(null);
        return;
      }
      setSlotId(firstOpenSlot(next));
    },
    onSelectSlot: (id) => {
      if (!selectedDay) {
        return;
      }
      const slot = [
        ...selectedDay.morning,
        ...selectedDay.afternoon,
        ...selectedDay.evening,
      ].find((item) => item.id === id);
      if (!slot || slot.booked) {
        return;
      }
      setSlotId(id);
    },
    onContinue: () => {
      if (!canContinue) {
        return;
      }
      setReviewOpen(true);
    },
    onJoinWaitlist: handleJoinWaitlist,
    onAddMember: () => {
      setMemberPickerOpen(false);
      onAddMember?.();
    },
    onResetBooking,
  };
}
