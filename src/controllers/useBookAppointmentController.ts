import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BOOKING_MEMBERS,
  DEFAULT_MEMBER_ID,
  DEFAULT_SLOT_ID,
  MONTH_KEYS,
  PLATFORM_FEE_RUPEES,
  TAX_RUPEES,
  WEEKDAY_KEYS,
  buildDaysForMonth,
  consultFeeRupees,
  firstSelectableDay,
  formatRupees,
  resolveBookingMembers,
  todayStart,
  upcomingMonths,
  type BookingDay,
  type BookingMember,
  type BookingMonthOption,
  type ConsultMode,
  type TimeSlot,
} from '../config/appointmentSlots';
import { formatBookedOn, slotStartIso } from '../config/bookedAppointments';
import { getDoctorProfile, type DoctorProfileSeed } from '../config/doctorProfiles';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import { useGetDoctorByIdQuery, useGetDoctorFeesQuery } from '../store/api/new/doctorsApi';
import { useJoinWaitlistMutation } from '../store/api/new/bookingApi';

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
  platformFeeLabel: string;
  taxesLabel: string;
  onBack: () => void;
  onCloseReview: () => void;
  onOpenPayment: () => void;
  onClosePayment: () => void;
  onOpenPaymentStatus: (status: PaymentStatus) => void;
  onClosePaymentStatus: () => void;
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
  active = true,
  onBack,
  onAddMember,
}: {
  doctorId: string;
  active?: boolean;
  onBack: () => void;
  onAddMember?: () => void;
}): BookAppointmentViewModel {
  const { language, t } = useLocalization();
  const isNumeric = !isNaN(Number(doctorId));
  const { data: doctorDetailResponse } = useGetDoctorByIdQuery(doctorId, {
    skip: !isNumeric,
  });
  const baseProfile = useMemo(() => getDoctorProfile(doctorId), [doctorId]);
  const profile = useMemo(() => {
    if (!doctorDetailResponse?.data) return baseProfile;
    const doc = doctorDetailResponse.data;
    const docName = doc.displayName || 'Doctor';
    const initials = docName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || baseProfile.initials;

    return {
      ...baseProfile,
      id: String(doc.doctorId),
      nameKey: docName as TranslationKey,
      credentialsKey: (doc.qualification || t(baseProfile.credentialsKey)) as TranslationKey,
      initials,
      verified: doc.isVerified ?? baseProfile.verified,
      feeKey: doc.consultFeeTele ? (`₹${doc.consultFeeTele}` as TranslationKey) : baseProfile.feeKey,
      clinicFeeKey: doc.consultFeeInClinic ? (`₹${doc.consultFeeInClinic}` as TranslationKey) : baseProfile.clinicFeeKey,
    };
  }, [baseProfile, doctorDetailResponse?.data, t]);
  const today = todayStart();
  const monthOptions = useMemo(() => upcomingMonths(12), []);
  const [memberId, setMemberId] = useState(DEFAULT_MEMBER_ID);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [mode, setMode] = useState<ConsultMode>('video');
  const [visibleMonth, setVisibleMonth] = useState<BookingMonthOption>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const days = useMemo(
    () => buildDaysForMonth(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year],
  );
  const [dayId, setDayId] = useState(
    () => firstSelectableDay(buildDaysForMonth(today.getFullYear(), today.getMonth()))?.id ?? '',
  );
  const [slotId, setSlotId] = useState<string | null>(DEFAULT_SLOT_ID);

  useEffect(() => {
    setMemberId(DEFAULT_MEMBER_ID);
    setMode('video');
    setMemberPickerOpen(false);
    setMonthPickerOpen(false);
    setReviewOpen(false);
    setPaymentOpen(false);
    setPaymentStatus(null);
    const nextMonth = { year: today.getFullYear(), month: today.getMonth() };
    setVisibleMonth(nextMonth);
    const nextDays = buildDaysForMonth(nextMonth.year, nextMonth.month);
    const first = firstSelectableDay(nextDays);
    setDayId(first?.id ?? '');
    setSlotId(first ? firstOpenSlot(first) : null);
  }, [doctorId]);

  useEffect(() => {
    if (!active) {
      setReviewOpen(false);
      setPaymentOpen(false);
      setPaymentStatus(null);
    }
  }, [active]);

  const isNumericDoctorId = !isNaN(Number(doctorId));
  const { data: doctorFeesResponse } = useGetDoctorFeesQuery(doctorId, {
    skip: !isNumericDoctorId,
  });

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const authMobile = useAppSelector((state) => state.auth.mobile);
  const [joinWaitlistMutation] = useJoinWaitlistMutation();
  const [waitlistJoined, setWaitlistJoined] = useState(false);

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

  const members = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily),
    [patientFullName, apiFamily],
  );

  const selectedDay =
    days.find((day) => day.id === dayId) ?? firstSelectableDay(days) ?? days[0];

  const handleJoinWaitlist = useCallback(async () => {
    if (waitlistJoined) return;
    const docIdNum = Number(profile.id) || 104;
    const phone =
      authUser?.mobile ||
      authUser?.mobileNo ||
      authMobile ||
      '9876500011';
    const patientName =
      authUser?.patientName ||
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
      'Patient';

    try {
      await joinWaitlistMutation({
        doctorId: docIdNum,
        patientId: authUser?.patientId,
        requestedDate: selectedDay?.id || dayId || '',
        consultMode: mode === 'clinic' ? 'InClinic' : 'Tele',
        contactName: patientName,
        contactMobile: phone,
      }).unwrap();
      setWaitlistJoined(true);
    } catch (err) {
      console.warn('[POST api/Waitlist/Join] Failed to join waitlist:', err);
    }
  }, [
    waitlistJoined,
    profile.id,
    authUser,
    authMobile,
    selectedDay?.id,
    dayId,
    mode,
    joinWaitlistMutation,
  ]);

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const isFull = selectedDay?.status === 'full';
  const realFee = doctorFeesResponse?.data;
  const feeLabel = realFee
    ? formatRupees(mode === 'clinic' ? realFee.inClinicFee : realFee.teleFee, language)
    : t(mode === 'clinic' ? profile.clinicFeeKey : profile.feeKey);
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
  const totalRupees = consultFeeRupees(profile.id, mode);
  const doctorFeeRupees = Math.max(0, totalRupees - PLATFORM_FEE_RUPEES - TAX_RUPEES);
  const canContinue = Boolean(selectedSlot) && !isFull;
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
      ? `${weekdayLabel(selectedDay, t)} ${selectedDay.day} ${
          language === 'en'
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
    whenLabel,
    dateLine: daySummary,
    timeLine,
    startsAt,
    bookedOnLabel,
    slotTimeLabel,
    paymentSummaryLine,
    modeConsultLabel,
    patientLabel,
    doctorFeeLabel: formatRupees(doctorFeeRupees, language),
    platformFeeLabel: formatRupees(PLATFORM_FEE_RUPEES, language),
    taxesLabel: formatRupees(TAX_RUPEES, language),
    onBack,
    onCloseReview: () => {
      setPaymentStatus(null);
      setPaymentOpen(false);
      setReviewOpen(false);
    },
    onOpenPayment: () => setPaymentOpen(true),
    onClosePayment: () => {
      setPaymentStatus(null);
      setPaymentOpen(false);
    },
    onOpenPaymentStatus: (status) => setPaymentStatus(status),
    onClosePaymentStatus: () => setPaymentStatus(null),
    onChooseOtherSlot: () => {
      setPaymentStatus(null);
      setPaymentOpen(false);
      setReviewOpen(false);
    },
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
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
  };
}
