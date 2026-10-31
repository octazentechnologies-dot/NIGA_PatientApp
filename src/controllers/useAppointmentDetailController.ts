import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus, Linking, Share } from 'react-native';

import {
  MONTH_KEYS,
  WEEKDAY_KEYS,
  buildDaysForMonth,
  formatRupees,
  todayStart,
  type BookingDay,
  type TimeSlot,
} from '../config/appointmentSlots';
import type { BookedAppointment } from '../config/bookedAppointments';
import {
  appointmentStartIso,
  formatCountdown,
  JOIN_GRACE_MS,
  NEAR_START_MS,
  slotStartIso,
} from '../config/bookedAppointments';
import type { PatientDocument } from '../config/patientDocuments';
import { API_BASE_URL } from '../config/apiConfig';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { ConsultModeChoice, NetworkQuality } from './useDeviceCheckController';
import { attemptJoinWaitingRoom } from './useJoinFailedController';
import { useGetDoctorSlotsQuery } from '../store/api/new/doctorsApi';
import {
  useGetDocumentsQuery,
  useGetPrescriptionByAppointmentQuery,
  useGetPrescriptionQuery,
  useGetPrescriptionsListQuery,
} from '../store/api/new/recordsApi';
import { useReportRunningLateMutation } from '../store/api/new/teleApi';
import {
  useCancelAppointmentMutation,
  useCheckInVisitMutation,
  useGetVisitDetailQuery,
  useRescheduleAppointmentMutation,
  useSwitchVisitToTeleMutation,
} from '../store/api/new/visitsApi';
import { useAppConfig } from '../providers/AppConfigProvider';
import {
  useCreateConsultOrderMutation,
  useUpdateBookingPaymentMutation,
} from '../store/api/new/paymentsApi';
import { useGetPatientProfileQuery } from '../store/api/new/patientProfileApi';
import { useAppSelector } from '../store/hooks';
import { usePayment } from '../payments';
import { messageFromUnknownError } from '../utilities/apiResponse';
import { formatMoney } from '../utilities/formatters';

function isPaymentSettled(
  paymentStatus?: string | null,
  isPaidFlag?: boolean,
): boolean {
  if (isPaidFlag === true) {
    return true;
  }
  const status = (paymentStatus || '').toUpperCase();
  return status === 'PAID' || status === 'CAPTURED';
}

export type AppointmentPhase = 'confirmed' | 'upcoming' | 'live' | 'ended';

export type ClinicCheckInState = 'early' | 'ready' | 'waiting';

export type CancelReason =
  | 'found_another'
  | 'no_longer_needed'
  | 'cost'
  | 'timing'
  | 'mistake'
  | 'other';

export type RescheduleReason =
  | 'not_available'
  | 'feeling_better'
  | 'network'
  | 'doctor_req'
  | 'other';

export const CANCEL_REASONS: {
  id: CancelReason;
  labelKey: TranslationKey;
}[] = [
    { id: 'found_another', labelKey: 'cancelReasonFoundAnother' },
    { id: 'no_longer_needed', labelKey: 'cancelReasonNoLongerNeeded' },
    { id: 'cost', labelKey: 'cancelReasonCost' },
    { id: 'timing', labelKey: 'cancelReasonTiming' },
    { id: 'mistake', labelKey: 'cancelReasonMistake' },
    { id: 'other', labelKey: 'cancelReasonOther' },
  ];

export const RESCHEDULE_REASONS: {
  id: RescheduleReason;
  labelKey: TranslationKey;
}[] = [
    { id: 'not_available', labelKey: 'rescheduleReasonUnavailable' },
    { id: 'feeling_better', labelKey: 'rescheduleReasonFeelingBetter' },
    { id: 'network', labelKey: 'rescheduleReasonNetwork' },
    { id: 'doctor_req', labelKey: 'rescheduleReasonDoctor' },
    { id: 'other', labelKey: 'rescheduleReasonOther' },
  ];

export type AppointmentDetailViewModel = {
  id: string;
  isCompleted: boolean;
  isCancelled: boolean;
  hasPrescription: boolean;
  erxSnapshotId: number | null;
  /** Patient id of the visit — used to scope prescription fetches for family members. */
  visitPatientId: number | null;
  prescriptionOpen: boolean;
  onOpenPrescription: () => void;
  onClosePrescription: () => void;
  onAddPrescription: () => void;
  onOrderMedicines?: (launch?: import('../utilities/medicineOrderStage').OrderMedicinesLaunch) => void;
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  doctorName: string;
  doctorInitials: string;
  credentials: string;
  verified: boolean;
  dateLine: string;
  timeLine: string;
  whenLabel: string;
  bookedOnLabel: string;
  bookingId: string;
  patientLabel: string;
  mode: BookedAppointment['mode'];
  modeConsultLabel: string;
  modeIcon: 'videocam-outline' | 'call-outline' | 'business-outline' | 'chatbubble-outline';
  reason: string;
  feeLabel: string;
  paymentId: string;
  isClinic: boolean;
  isChat: boolean;
  showJoin: boolean;
  showOpenChat: boolean;
  canJoin: boolean;
  phase: AppointmentPhase;
  bannerLabel: string;
  countdown: string;
  consultWithLabel: string;
  visitWhenLabel: string;
  cancelSheetOpen: boolean;
  cancelReason: CancelReason | null;
  cancelNote: string;
  canConfirmCancel: boolean;
  refundTitle: string;
  refundBody: string;
  refundPercent: number;
  cancelledOpen: boolean;
  cancelledWhenLabel: string;
  refundInitiatedLabel: string;
  refundExpectedLabel: string;
  rescheduleOpen: boolean;
  rescheduleDays: BookingDay[];
  selectedRescheduleDay: BookingDay | undefined;
  selectedRescheduleSlotId: string | null;
  busySlotId: string;
  rescheduleReason: RescheduleReason | null;
  rescheduleReasonOpen: boolean;
  rescheduleNote: string;
  currentAppointmentLine: string;
  currentShortWhen: string;
  nextShortWhen: string;
  reschedulePolicy: string;
  rescheduleReasonLabel: string;
  rescheduleError: string | null;
  canConfirmReschedule: boolean;
  onBack: () => void;
  onJoin: () => void;
  deviceCheckOpen: boolean;
  waitingRoomOpen: boolean;
  videoCallOpen: boolean;
  consultationCompleteOpen: boolean;
  rateConsultationOpen: boolean;
  completedDurationMinutes: number;
  consultationChatOpen: boolean;
  joinFailedOpen: boolean;
  waitingRoomMode: 'video' | 'audio';
  joinNetworkQuality: NetworkQuality;
  joinMbps: number;
  onCloseDeviceCheck: () => void;
  onFinishDeviceCheck: (
    mode: ConsultModeChoice,
    diagnostics: { networkQuality: NetworkQuality; mbps: number },
  ) => void;
  onCloseJoinFailed: () => void;
  onRetryJoin: () => void;
  onJoinAudioFromFailed: () => void;
  onAskDoctorCallFromFailed: () => void;
  onCloseWaitingRoom: () => void;
  onEndVideoCall: (
    durationSeconds?: number,
    options?: { showComplete?: boolean },
  ) => void;
  onCloseConsultationComplete: () => void;
  onOpenRateConsultation: () => void;
  onCloseRateConsultation: () => void;
  onFinishRateConsultation: () => void;
  onCloseConsultationChat: () => void;
  onStartVideoFromChat: () => void;
  attachedDocuments: PatientDocument[];
  libraryDocuments: PatientDocument[];
  selectedLibraryId: string | null;
  uploadOpen: boolean;
  selectSheetOpen: boolean;
  onAddDocuments: () => void;
  onCloseSelectSheet: () => void;
  onSelectExistingDocument: (id: string) => void;
  onUploadNewFromSheet: () => void;
  onCloseUpload: () => void;
  onUploadSaved: (files: PatientDocument[]) => void;
  onRemoveDocument: (id: string) => void;
  onDownloadReceipt: () => void;
  onChangeTime: () => void;
  onCancel: () => void;
  onCloseCancelSheet: () => void;
  onSelectCancelReason: (reason: CancelReason) => void;
  onChangeCancelNote: (value: string) => void;
  onConfirmCancel: () => void;
  onCloseCancelled: () => void;
  onBookAnother: () => void;
  onViewRefund: () => void;
  onCloseReschedule: () => void;
  onSelectRescheduleDay: (id: string) => void;
  onSelectRescheduleSlot: (id: string) => void;
  onOpenRescheduleReason: () => void;
  onCloseRescheduleReason: () => void;
  onSelectRescheduleReason: (reason: RescheduleReason) => void;
  onChangeRescheduleNote: (value: string) => void;
  onConfirmReschedule: () => void;
  onGetHelp: () => void;
  clinicCheckInOpen: boolean;
  clinicCheckInState: ClinicCheckInState;
  isCheckedIn: boolean;
  checkInError: string | null;
  clinicName: string;
  clinicAddress: string;
  clinicDistanceLabel: string;
  clinicTravelNote: string;
  clinicFeeAmount: string;
  clinicBannerLabel: string;
  clinicPhone: string | null;
  clinicMapLink: string | null;
  addressCopied: boolean;
  checkedInAtLabel: string;
  queuePosition: number | null;
  waitMinutes: number | null;
  checkInBusy: boolean;
  /** Unpaid clinic visit — show Pay now with doctor fee. */
  showPayNow: boolean;
  payNowLabel: string;
  payNowBusy: boolean;
  payNowError: string | null;
  isVisitPaid: boolean;
  onPayNow: () => void;
  onOpenCheckIn: () => void;
  onCloseCheckIn: () => void;
  onConfirmCheckIn: () => void;
  onTellClinicLate: () => void;
  /** Null when API does not send readyAt — hide in UI. */
  readyAtLabel: string | null;
  onCopyAddress: () => void;
  onDirections: () => void;
  onCallClinic: () => void;
  onSwitchOnline: () => void;
};

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

function minutesUntil(ms: number): number {
  return Math.max(1, Math.ceil(ms / 60000));
}

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

function clockLabel(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function weekdayKey(date: Date): TranslationKey {
  return WEEKDAY_KEYS[date.getDay()];
}

function monthShort(
  date: Date,
  t: (key: TranslationKey) => string,
  language: AppLanguage,
): string {
  const monthName = t(MONTH_KEYS[date.getMonth()]);
  return language === 'en' ? monthName.slice(0, 3) : monthName;
}

function compactDate(
  date: Date,
  t: (key: TranslationKey) => string,
  language: AppLanguage,
): string {
  return `${date.getDate()} ${monthShort(date, t, language)}`;
}

/** Future dates only. Slot grids come from GET Slots — no Saturday/full heuristics. */
function futureRescheduleDays(): BookingDay[] {
  const today = todayStart();
  const current = buildDaysForMonth(today.getFullYear(), today.getMonth());
  const next =
    today.getMonth() === 11
      ? buildDaysForMonth(today.getFullYear() + 1, 0)
      : buildDaysForMonth(today.getFullYear(), today.getMonth() + 1);
  return [...current, ...next]
    .filter((day) => day.status !== 'past')
    .slice(0, 14)
    .map((day) => ({
      ...day,
      status: 'open',
      morning: [],
      afternoon: [],
      evening: [],
    }));
}

function applyApiSlots(
  day: BookingDay,
  apiSlots: { time: string; label: string; status: string }[],
): BookingDay {
  const mapped: TimeSlot[] = apiSlots
    .filter((slot) => slot.status !== 'break' && slot.status !== 'past')
    .map((slot) => {
      const time = (slot.time || '').slice(0, 5);
      return {
        id: time,
        labelKey: (slot.label || time) as TranslationKey,
        booked: slot.status !== 'available',
      };
    })
    .filter((slot) => /^\d{2}:\d{2}$/.test(slot.id));
  const morning = mapped.filter((slot) => Number(slot.id.split(':')[0]) < 12);
  const afternoon = mapped.filter((slot) => {
    const hour = Number(slot.id.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  const evening = mapped.filter((slot) => Number(slot.id.split(':')[0]) >= 17);
  return { ...day, status: 'open', morning, afternoon, evening };
}

function findSlot(day: BookingDay | undefined, slotId: string | null): TimeSlot | undefined {
  if (!day || !slotId) {
    return undefined;
  }
  return [...day.morning, ...day.afternoon, ...day.evening].find(
    (slot) => slot.id === slotId,
  );
}

const FALLBACK_APPOINTMENT: BookedAppointment = {
  id: '',
  bookingId: '',
  doctorId: '',
  doctorNameKey: '' as TranslationKey,
  doctorInitials: 'DR',
  credentialsKey: '' as TranslationKey,
  experienceKey: '' as TranslationKey,
  whenLabel: '',
  dateLine: '',
  timeLine: '',
  startsAt: new Date(0).toISOString(),
  bookedOnLabel: '',
  mode: 'video',
  modeConsultLabel: '',
  patientLabel: '',
  feeLabel: '',
  paymentId: '',
  reasonKey: '' as TranslationKey,
  status: 'confirmed',
};

export function useAppointmentDetailController({
  appointment,
  onBack,
  onRemoveAppointment,
  onUpdateAppointment,
  onBookAnotherConsultation,
  onOrderMedicines,
}: {
  appointment: BookedAppointment | null;
  onBack: () => void;
  onRemoveAppointment: (id: string) => void;
  onUpdateAppointment: (id: string, patch: Partial<BookedAppointment>) => void;
  onBookAnotherConsultation: () => void;
  onOrderMedicines?: (launch?: import('../utilities/medicineOrderStage').OrderMedicinesLaunch) => void;
}): AppointmentDetailViewModel {
  const { language, t } = useLocalization();
  const appConfig = useAppConfig();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const authMobile = useAppSelector((s) => s.auth.mobile);
  const [cancelledSnapshot, setCancelledSnapshot] = useState<BookedAppointment | null>(
    null,
  );
  const item = cancelledSnapshot ?? appointment ?? FALLBACK_APPOINTMENT;
  const isNumericId = !isNaN(Number(item.id));
  const {
    data: serverVisitDetailResponse,
    error: serverVisitDetailError,
    refetch: refetchVisitDetail,
  } = useGetVisitDetailQuery(item.id, {
    skip: !isNumericId,
    refetchOnMountOrArgChange: true,
  });
  const rawVisitData = serverVisitDetailResponse?.data;
  const visitDetail = useMemo(() => {
    if (!rawVisitData) return undefined;
    if (Array.isArray(rawVisitData)) {
      return (
        rawVisitData.find((v) => String(v.patientAppId) === String(item.id)) ??
        rawVisitData[0]
      );
    }
    if (String(rawVisitData.patientAppId) === String(item.id)) {
      return rawVisitData;
    }
    return undefined;
  }, [rawVisitData, item.id]);
  useEffect(() => {
    if (serverVisitDetailResponse) {
      console.log('📋 [VisitDetail] API:', `GET ${API_BASE_URL}api/Patient/Visits/${item.id}`);
      console.log('📋 [VisitDetail] Request Payload / Params:', { patientAppId: item.id });
      console.log(
        '📋 [VisitDetail] Server response for visit',
        item.id,
        ':',
        JSON.stringify(serverVisitDetailResponse, null, 2),
      );
    } else if (serverVisitDetailError) {
      console.log('❌ [VisitDetail] API:', `GET ${API_BASE_URL}api/Patient/Visits/${item.id}`);
      console.log('❌ [VisitDetail] Request Payload / Params:', { patientAppId: item.id });
      console.log('❌ [VisitDetail] Server error for visit', item.id, ':', serverVisitDetailError);
    }
  }, [serverVisitDetailResponse, serverVisitDetailError, item.id]);

  // Re-fetch visit detail when returning to foreground
  useEffect(() => {
    if (!isAuthenticated || !isNumericId) return;
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void refetchVisitDetail();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, isNumericId, refetchVisitDetail]);
  const [cancelAppointmentMutation] = useCancelAppointmentMutation();
  const [rescheduleAppointmentMutation] = useRescheduleAppointmentMutation();
  const [checkInVisit, { isLoading: checkInBusy }] = useCheckInVisitMutation();
  const [switchVisitToTele] = useSwitchVisitToTeleMutation();
  const [reportRunningLate] = useReportRunningLateMutation();
  const [createConsultOrder] = useCreateConsultOrderMutation();
  const [updateBookingPayment] = useUpdateBookingPaymentMutation();
  const { data: profileResponse } = useGetPatientProfileQuery(undefined, {
    skip: !isAuthenticated || !isNumericId,
  });
  const profile = profileResponse?.data;
  const [localPaidOverride, setLocalPaidOverride] = useState(false);
  const [payNowError, setPayNowError] = useState<string | null>(null);

  const patientAppIdNum = isNumericId ? Number(item.id) : null;
  const patientAppIdRef = useRef(patientAppIdNum);
  patientAppIdRef.current = patientAppIdNum;
  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;

  const payPrefill = useMemo(
    () => ({
      name:
        profile?.patientName ||
        authUser?.patientName ||
        [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
        null,
      email: profile?.email || authUser?.email || null,
      contact:
        profile?.mobileNo ||
        authUser?.mobile ||
        authUser?.mobileNo ||
        authMobile ||
        null,
    }),
    [authMobile, authUser, profile],
  );

  const payLater = usePayment({
    flow: 'consult',
    appConfigKeyId: appConfig.razorpayKeyId,
    prefill: payPrefill,
    description: 'Clinic consultation',
    patientAppId: patientAppIdNum,
    createOrder: async () => {
      const patientAppId = patientAppIdRef.current;
      if (patientAppId == null) {
        throw new Error('Missing appointment id for payment.');
      }
      const idempotencyKey = `pa-${patientAppId}-paylater-${Date.now()}`;
      const res = await createConsultOrder({
        patientAppId,
        bookingToken: item.bookingId || undefined,
        payAtClinic: false,
        idempotencyKey,
      }).unwrap();
      return {
        gatewayReady: res.gatewayReady,
        keyId: res.keyId,
        message: res.message,
        data: res.data,
      };
    },
    onCheckoutSuccess: async (checkout) => {
      const patientAppId = patientAppIdRef.current;
      const userId =
        typeof authUserRef.current?.userId === 'number'
          ? authUserRef.current.userId
          : undefined;
      if (patientAppId == null || userId == null) {
        return undefined;
      }
      try {
        const res = await updateBookingPayment({
          userId,
          patientAppId,
          razorpay_order_id: checkout.orderId,
          razorpay_payment_id: checkout.paymentId,
          paymentOrderId: checkout.paymentOrderId,
        }).unwrap();
        const paid =
          (res.data?.paymentStatus || '').toUpperCase() === 'PAID';
        return { paid, method: res.data?.method ?? null };
      } catch {
        return undefined;
      }
    },
    onConfirmed: () => {
      setLocalPaidOverride(true);
      setPayNowError(null);
      onUpdateAppointment(item.id, {
        paymentStatus: 'PAID',
      });
      void refetchVisitDetail();
    },
    onPendingConfirmation: () => {
      setPayNowError(t('aptPayNowPending'));
    },
  });


  useEffect(() => {
    if (payLater.state === 'FAILED' && payLater.errorMessage) {
      setPayNowError(payLater.errorMessage);
    }
  }, [payLater.errorMessage, payLater.state]);
  const startMs = useMemo(() => {
    if (visitDetail?.appointmentDate && visitDetail?.appointmentTime) {
      return new Date(appointmentStartIso(visitDetail.appointmentDate, visitDetail.appointmentTime)).getTime();
    }
    return new Date(item.startsAt).getTime();
  }, [item.startsAt, visitDetail?.appointmentDate, visitDetail?.appointmentTime]);
  const [now, setNow] = useState(() => Date.now());
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReason | null>(null);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelledOpen, setCancelledOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDayId, setRescheduleDayId] = useState(
    () => futureRescheduleDays()[0]?.id ?? '',
  );
  const [rescheduleSlotId, setRescheduleSlotId] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState<RescheduleReason | null>(
    null,
  );
  const [rescheduleReasonOpen, setRescheduleReasonOpen] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [deviceCheckOpen, setDeviceCheckOpen] = useState(false);
  const [waitingRoomOpen, setWaitingRoomOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [consultationCompleteOpen, setConsultationCompleteOpen] = useState(false);
  const [rateConsultationOpen, setRateConsultationOpen] = useState(false);
  const [completedDurationMinutes, setCompletedDurationMinutes] = useState(22);
  const [joinFailedOpen, setJoinFailedOpen] = useState(false);
  const [consultationChatOpen, setConsultationChatOpen] = useState(false);
  const [waitingRoomMode, setWaitingRoomMode] = useState<'video' | 'audio'>('video');
  const [joinNetworkQuality, setJoinNetworkQuality] = useState<NetworkQuality>('good');
  const [joinMbps, setJoinMbps] = useState(4.2);
  const [joinDisplayMbps, setJoinDisplayMbps] = useState(0.3);
  const [videoJoinRetried, setVideoJoinRetried] = useState(false);
  const { data: documentsResponse } = useGetDocumentsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [extraDocuments, setExtraDocuments] = useState<PatientDocument[]>([]);
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectSheetOpen, setSelectSheetOpen] = useState(false);
  const [clinicCheckInOpen, setClinicCheckInOpen] = useState(false);
  const [clinicCheckInState, setClinicCheckInState] =
    useState<ClinicCheckInState>('ready');
  const [addressCopied, setAddressCopied] = useState(false);
  const [checkedInAtLabel, setCheckedInAtLabel] = useState('');
  const [readyAtLabel, setReadyAtLabel] = useState<string | null>(null);
  const [checkInQueuePosition, setCheckInQueuePosition] = useState<number | null>(
    null,
  );
  const [checkInWaitMinutes, setCheckInWaitMinutes] = useState<number | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset all appointment-specific states when switching appointments
  useEffect(() => {
    if (appointment?.id && cancelledSnapshot && cancelledSnapshot.id !== appointment.id) {
      setCancelledSnapshot(null);
    }
    setLocalPaidOverride(false);
    setPayNowError(null);
    setCheckInError(null);
    setClinicCheckInOpen(false);

    const initialStatus = (item.visitStatus || '').toUpperCase();
    if (initialStatus === 'WAITING' || initialStatus === 'WALK-IN') {
      setClinicCheckInState('waiting');
    } else {
      setClinicCheckInState('ready');
    }

    setCheckedInAtLabel('');
    setCheckInQueuePosition(null);
    setCheckInWaitMinutes(null);
    setReadyAtLabel(null);
    setPrescriptionOpen(false);
    setCancelSheetOpen(false);
    setCancelReason(null);
    setCancelNote('');
    setCancelledOpen(false);
    setRescheduleOpen(false);
    setRescheduleReasonOpen(false);
    setRescheduleSlotId(null);
    setRescheduleReason(null);
    setRescheduleNote('');
    setRescheduleError(null);
    payLater.reset();
  }, [item.id, item.visitStatus, appointment?.id]);

  useEffect(() => {
    if (!visitDetail) return;
    if (String(visitDetail.patientAppId) !== String(item.id)) return;
    const status = (visitDetail.status || '').toUpperCase();
    console.log('🔍 [VisitDetail Sync] status:', status, 'patientAppId:', visitDetail.patientAppId);
    if (status === 'WAITING' || status === 'WALK-IN') {
      setClinicCheckInState('waiting');
      if (visitDetail.queuePosition != null) {
        setCheckInQueuePosition(Number(visitDetail.queuePosition));
      }
    } else {
      setClinicCheckInState('ready');
      setCheckInQueuePosition(null);
      setCheckInWaitMinutes(null);
      setCheckedInAtLabel('');
    }
  }, [visitDetail, item.id]);

  useEffect(() => {
    if (!waitingRoomOpen || videoCallOpen) {
      return;
    }
    const timer = setTimeout(() => {
      setWaitingRoomOpen(false);
      setVideoCallOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [waitingRoomOpen, videoCallOpen]);

  const remainingMs = startMs - now;
  const isClinic =
    visitDetail
      ? !visitDetail.isTele &&
      (visitDetail.consultMode || '').toLowerCase() !== 'chat' &&
      (visitDetail.consultMode || '').toLowerCase() !== 'audio'
      : item.mode === 'clinic';
  const isChat = item.mode === 'chat';
  const isRemoteConsult = item.mode === 'video' || item.mode === 'audio';
  const rawStatus = (visitDetail?.status || item.visitStatus || '').trim();
  const visitStatus = rawStatus.toUpperCase();
  const isCompleted = visitStatus === 'COMPLETED';
  const isCancelled = visitStatus === 'CANCELLED';

  const authPatientId = useAppSelector(
    (s) => s.auth.patientId ?? s.auth.user?.patientId,
  );
  const visitPatientId = visitDetail?.patientId;
  const isFamilyMember = Boolean(
    visitPatientId &&
    authPatientId &&
    Number(visitPatientId) !== Number(authPatientId),
  );

  const prescriptionListArg = useMemo(
    () =>
      isFamilyMember && visitPatientId != null && Number(visitPatientId) > 0
        ? { patientId: Number(visitPatientId) }
        : undefined,
    [isFamilyMember, visitPatientId],
  );
  const { data: prescriptionListResponse } = useGetPrescriptionsListQuery(
    prescriptionListArg,
    {
      skip: !isCompleted,
    },
  );
  const historyRx = useMemo(() => {
    const list = prescriptionListResponse?.data;
    if (!Array.isArray(list) || !isNumericId) return null;
    return (
      list.find((p) => Number(p.patientAppId) === Number(item.id)) ?? null
    );
  }, [prescriptionListResponse?.data, isNumericId, item.id]);

  const { data: prescriptionByAptResponse } =
    useGetPrescriptionByAppointmentQuery(item.id, {
      skip: !isNumericId || !isCompleted || isFamilyMember,
    });
  const { data: prescriptionPatientResponse } = useGetPrescriptionQuery(
    item.id,
    {
      skip:
        !isNumericId ||
        !isCompleted ||
        isFamilyMember ||
        Boolean(prescriptionByAptResponse?.data),
    },
  );
  const prescriptionData =
    prescriptionByAptResponse?.data ?? prescriptionPatientResponse?.data;
  const erxSnapshotId =
    visitDetail?.erxSnapshotId ??
    historyRx?.erxSnapshotId ??
    prescriptionData?.erxSnapshotId ??
    null;
  const hasPrescription =
    isCompleted &&
    Boolean(
      (erxSnapshotId != null && Number(erxSnapshotId) > 0) ||
      visitDetail?.erxSigned ||
      Boolean(visitDetail?.erxPdfUrl) ||
      historyRx != null ||
      (Array.isArray(prescriptionData?.items) &&
        prescriptionData.items.length > 0),
    );
  const isCheckedIn =
    !isCompleted &&
    !isCancelled &&
    isClinic &&
    (clinicCheckInState === 'waiting' ||
      visitStatus === 'WAITING' ||
      visitStatus === 'WALK-IN');
  const phase: AppointmentPhase =
    isCompleted || isCancelled
      ? 'ended'
      : isClinic || isChat
        ? 'confirmed'
        : remainingMs <= -JOIN_GRACE_MS
          ? 'ended'
          : remainingMs <= 0
            ? 'live'
            : remainingMs <= NEAR_START_MS
              ? 'upcoming'
              : 'confirmed';

  const bannerLabel =
    phase === 'upcoming'
      ? t('aptBannerStartsIn').replace('{minutes}', String(minutesUntil(remainingMs)))
      : phase === 'live'
        ? t('aptBannerLive')
        : phase === 'ended'
          ? t('aptBannerEnded')
          : isClinic
            ? t('aptBannerClinic')
            : t('aptBannerConfirmed');

  const startDate = new Date(item.startsAt);
  const fee =
    visitDetail?.consultFee != null
      ? Number(visitDetail.consultFee)
      : item.consultFee != null
        ? Number(item.consultFee)
        : null;
  const resolvedPaymentStatus =
    visitDetail?.paymentStatus ?? item.paymentStatus ?? null;
  const visitIsPaid =
    localPaidOverride ||
    isPaymentSettled(resolvedPaymentStatus, visitDetail?.isPaid);
  // Unpaid clinic visits (incl. pay-at-clinic holds): Pay now using doctor fee.
  // Hide when paymentStatus / isPaid says already paid (Home or visit detail).
  const showPayNow =
    isClinic &&
    !isCompleted &&
    !isCancelled &&
    !visitIsPaid &&
    phase !== 'ended' &&
    fee != null &&
    fee > 0 &&
    (visitDetail?.actions?.canPay !== false);
  const refundPercent =
    remainingMs <= 0 ? 0 : remainingMs > FOUR_HOURS_MS ? 100 : 50;
  const refundAmount =
    fee != null
      ? formatRupees(Math.round((fee * refundPercent) / 100), language)
      : '';
  const refundTitle =
    refundPercent === 100
      ? t('cancelRefundFullTitle').replace('{amount}', refundAmount)
      : refundPercent === 50
        ? t('cancelRefundHalfTitle').replace('{amount}', refundAmount)
        : t('cancelRefundNoneTitle');
  const refundBody =
    refundPercent === 100
      ? t('cancelRefundFullBody')
      : refundPercent === 50
        ? t('cancelRefundHalfBody')
        : t('cancelRefundNoneBody');

  const calendarRescheduleDays = useMemo(() => futureRescheduleDays(), []);
  const slotDoctorId = visitDetail?.doctorId;
  const { data: rescheduleSlotsResponse } = useGetDoctorSlotsQuery(
    { doctorId: slotDoctorId ?? 0, date: rescheduleDayId },
    {
      skip:
        !rescheduleOpen ||
        slotDoctorId == null ||
        slotDoctorId <= 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDayId),
    },
  );
  const rescheduleDays = useMemo(() => {
    const apiSlots = rescheduleSlotsResponse?.data?.slots;
    return calendarRescheduleDays.map((day) =>
      day.id === rescheduleDayId && apiSlots ? applyApiSlots(day, apiSlots) : day,
    );
  }, [
    calendarRescheduleDays,
    rescheduleDayId,
    rescheduleSlotsResponse?.data?.slots,
  ]);

  useEffect(() => {
    if (!rescheduleOpen) {
      return;
    }
    const slots = rescheduleSlotsResponse?.data?.slots ?? [];
    const available = slots.find((slot) => slot.status === 'available');
    const time = available?.time?.slice(0, 5) ?? null;
    setRescheduleSlotId(time && /^\d{2}:\d{2}$/.test(time) ? time : null);
  }, [rescheduleDayId, rescheduleOpen, rescheduleSlotsResponse?.data?.slots]);

  const selectedRescheduleDay =
    rescheduleDays.find((day) => day.id === rescheduleDayId) ?? rescheduleDays[0];
  const selectedRescheduleSlot = findSlot(selectedRescheduleDay, rescheduleSlotId);
  const currentSlotId = `${String(startDate.getHours()).padStart(2, '0')}:${String(
    startDate.getMinutes(),
  ).padStart(2, '0')}`;
  const currentTime = clockLabel(startDate);
  const currentAppointmentLine = `${t(weekdayKey(startDate))}, ${compactDate(
    startDate,
    t,
    language,
  )} · ${currentTime} · ${item.modeConsultLabel}`;
  const currentShortWhen = `${currentTime} ${t(weekdayKey(startDate))}`;
  const nextShortWhen = selectedRescheduleDay && selectedRescheduleSlot
    ? `${t(selectedRescheduleSlot.labelKey)} ${t(
      WEEKDAY_KEYS[selectedRescheduleDay.weekdayIndex],
    )}`
    : '';
  const deadline = new Date(startMs - NEAR_START_MS);
  const deadlineLabel = `${localizeDigits(clockLabel(deadline), language)}${deadline.toDateString() === new Date().toDateString()
    ? language === 'en'
      ? ' today'
      : ''
    : `, ${compactDate(deadline, t, language)}`
    }`;
  const rescheduleReasonLabel = rescheduleReason
    ? t(
      RESCHEDULE_REASONS.find((row) => row.id === rescheduleReason)?.labelKey ??
      'rescheduleReasonPlaceholder',
    )
    : '';
  const canConfirmReschedule = Boolean(
    selectedRescheduleDay &&
    selectedRescheduleDay.status === 'open' &&
    selectedRescheduleSlot &&
    !selectedRescheduleSlot.booked &&
    rescheduleReason &&
    (rescheduleReason !== 'other' || rescheduleNote.trim()) &&
    !rescheduleSubmitting,
  );

  const resetCancelForm = () => {
    setCancelReason(null);
    setCancelNote('');
  };

  const resetRescheduleForm = () => {
    const firstOpen = rescheduleDays.find((day) => day.status === 'open');
    setRescheduleDayId(firstOpen?.id ?? rescheduleDays[0]?.id ?? '');
    setRescheduleSlotId(null);
    setRescheduleReason(null);
    setRescheduleReasonOpen(false);
    setRescheduleNote('');
    setRescheduleError(null);
  };

  const libraryDocuments = useMemo(() => {
    const fromApi: PatientDocument[] = (documentsResponse?.data ?? [])
      .filter((doc) => Number.isFinite(doc.documentId) && doc.documentId > 0)
      .map((doc) => ({
        id: String(doc.documentId),
        name: doc.fileName?.trim() || `Document ${doc.documentId}`,
        sizeLabel: doc.size
          ? `${Math.max(1, Math.round(doc.size / 1024))} KB`
          : '',
        kind: doc.mime?.startsWith('image/') ? ('image' as const) : ('pdf' as const),
        status: 'ready' as const,
      }));
    const known = new Set(fromApi.map((doc) => doc.id));
    return [...fromApi, ...extraDocuments.filter((doc) => !known.has(doc.id))];
  }, [documentsResponse?.data, extraDocuments]);

  const attachedDocuments = useMemo(
    () =>
      libraryDocuments.filter((doc) => attachedIds.includes(doc.id)),
    [libraryDocuments, attachedIds],
  );

  const visitFeeLabel =
    formatMoney(
      fee,
      visitDetail?.currency ?? item.currency ?? null,
    ) || '';
  // platformFee: hide when null — available for UI rows via visitDetail
  void formatMoney(visitDetail?.platformFee ?? null, visitDetail?.currency);
  const payNowLabel = visitFeeLabel
    ? t('aptPayNowWithFee').replace('{amount}', visitFeeLabel)
    : t('aptPayNow');
  const onPayNow = useCallback(() => {
    if (!showPayNow || payLater.busy || !payLater.canPay) {
      return;
    }
    setPayNowError(null);
    void payLater.startPayment();
  }, [payLater, showPayNow]);
  const clinicName = visitDetail?.clinicName?.trim() || '';
  const clinicAddress = [
    visitDetail?.clinicAddressLine?.trim(),
    visitDetail?.clinicCity?.trim(),
  ]
    .filter(Boolean)
    .join(', ');
  const clinicPhone = visitDetail?.clinicPhone?.trim() || null;
  const clinicMapLink = visitDetail?.clinicMapLink?.trim() || null;
  const queuePosition =
    checkInQueuePosition ??
    (visitDetail?.queuePosition != null ? visitDetail.queuePosition : null);

  return {
    id: item.id,
    isCompleted,
    isCancelled,
    hasPrescription,
    erxSnapshotId: erxSnapshotId != null ? Number(erxSnapshotId) : null,
    visitPatientId: visitPatientId != null ? Number(visitPatientId) : null,
    prescriptionOpen,
    onOpenPrescription: () => setPrescriptionOpen(true),
    onClosePrescription: () => setPrescriptionOpen(false),
    onOrderMedicines,
    onAddPrescription: () => {
      if (libraryDocuments.length > 0) {
        setSelectSheetOpen(true);
        return;
      }
      setUploadOpen(true);
    },
    language,
    t,
    doctorName: visitDetail?.doctorName?.trim() || t(item.doctorNameKey),
    doctorInitials: item.doctorInitials,
    credentials: t(item.credentialsKey),
    verified: true,
    dateLine: item.dateLine,
    timeLine: item.timeLine,
    whenLabel: item.whenLabel,
    bookedOnLabel: item.bookedOnLabel,
    bookingId: item.bookingId,
    patientLabel: item.patientLabel,
    mode: item.mode,
    modeConsultLabel: item.modeConsultLabel,
    modeIcon:
      item.mode === 'audio'
        ? 'call-outline'
        : item.mode === 'clinic'
          ? 'business-outline'
          : item.mode === 'chat'
            ? 'chatbubble-outline'
            : 'videocam-outline',
    reason: visitDetail?.reasonText?.trim() || t(item.reasonKey),
    feeLabel: visitFeeLabel
      ? visitIsPaid
        ? t('aptPaidAmount').replace('{amount}', visitFeeLabel)
        : visitFeeLabel
      : '',
    paymentId: item.paymentId,
    isClinic,
    isChat,
    showJoin: isRemoteConsult && phase !== 'ended',
    showOpenChat: isChat && phase !== 'ended',
    canJoin: isRemoteConsult && phase !== 'ended',
    phase,
    bannerLabel,
    countdown: formatCountdown(Math.ceil(remainingMs / 1000), language),
    consultWithLabel: t('aptConsultWith')
      .replace('{name}', t(item.doctorNameKey))
      .replace('{mode}', item.modeConsultLabel),
    visitWhenLabel: t('aptVisitWhen').replace('{when}', item.whenLabel),
    cancelSheetOpen,
    cancelReason,
    cancelNote,
    canConfirmCancel: Boolean(cancelReason),
    refundTitle,
    refundBody,
    refundPercent,
    cancelledOpen,
    cancelledWhenLabel: `${compactDate(startDate, t, language)}, ${currentTime}`,
    refundInitiatedLabel: compactDate(new Date(), t, language),
    refundExpectedLabel: t('cancelledExpectedBy').replace(
      '{date}',
      compactDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), t, language),
    ),
    rescheduleOpen,
    rescheduleDays,
    selectedRescheduleDay,
    selectedRescheduleSlotId: rescheduleSlotId,
    busySlotId: currentSlotId,
    rescheduleReason,
    rescheduleReasonOpen,
    rescheduleNote,
    currentAppointmentLine,
    currentShortWhen,
    nextShortWhen,
    reschedulePolicy: t('reschedulePolicy').replace('{deadline}', deadlineLabel),
    rescheduleReasonLabel,
    rescheduleError,
    canConfirmReschedule,
    onBack,
    onJoin: () => {
      if (isChat) {
        setConsultationChatOpen(true);
        return;
      }
      if (!(isRemoteConsult && phase !== 'ended')) {
        return;
      }
      setVideoJoinRetried(false);
      setJoinFailedOpen(false);
      setDeviceCheckOpen(true);
    },
    deviceCheckOpen,
    waitingRoomOpen,
    videoCallOpen,
    consultationCompleteOpen,
    rateConsultationOpen,
    completedDurationMinutes,
    consultationChatOpen,
    joinFailedOpen,
    waitingRoomMode,
    joinNetworkQuality,
    joinMbps: joinDisplayMbps,
    onCloseDeviceCheck: () => setDeviceCheckOpen(false),
    onFinishDeviceCheck: (mode, diagnostics) => {
      setWaitingRoomMode(mode);
      setJoinNetworkQuality(diagnostics.networkQuality);
      setJoinMbps(diagnostics.mbps);
      setDeviceCheckOpen(false);

      const result = attemptJoinWaitingRoom(mode, diagnostics.networkQuality, {
        isRetry: videoJoinRetried,
      });

      if (result === 'joinFailed') {
        setJoinDisplayMbps(
          diagnostics.networkQuality === 'weak' ? diagnostics.mbps : 0.3,
        );
        setJoinFailedOpen(true);
        return;
      }

      setJoinFailedOpen(false);
      setWaitingRoomOpen(true);
    },
    onCloseJoinFailed: () => {
      setJoinFailedOpen(false);
      setDeviceCheckOpen(true);
    },
    onRetryJoin: () => {
      setVideoJoinRetried(true);
      const result = attemptJoinWaitingRoom(waitingRoomMode, joinNetworkQuality, {
        isRetry: true,
      });
      if (result === 'joinFailed') {
        setJoinDisplayMbps(joinNetworkQuality === 'weak' ? joinMbps : 0.3);
        return;
      }
      setJoinFailedOpen(false);
      setWaitingRoomOpen(true);
    },
    onJoinAudioFromFailed: () => {
      setWaitingRoomMode('audio');
      setJoinFailedOpen(false);
      setWaitingRoomOpen(true);
    },
    onAskDoctorCallFromFailed: () => {
      setJoinFailedOpen(false);
      setDeviceCheckOpen(false);
      setWaitingRoomOpen(false);
      setVideoCallOpen(false);
    },
    onCloseWaitingRoom: () => {
      setWaitingRoomOpen(false);
      setVideoCallOpen(false);
    },
    onEndVideoCall: (durationSeconds = 22 * 60, options) => {
      setCompletedDurationMinutes(Math.max(1, Math.round(durationSeconds / 60)));
      setVideoCallOpen(false);
      setWaitingRoomOpen(false);
      setDeviceCheckOpen(false);
      setJoinFailedOpen(false);
      if (options?.showComplete === false) {
        return;
      }
      setRateConsultationOpen(true);
    },
    onCloseConsultationComplete: () => setConsultationCompleteOpen(false),
    onOpenRateConsultation: () => {
      setConsultationCompleteOpen(false);
      setRateConsultationOpen(true);
    },
    onCloseRateConsultation: () => {
      setRateConsultationOpen(false);
      setConsultationCompleteOpen(true);
    },
    onFinishRateConsultation: () => {
      setRateConsultationOpen(false);
      setConsultationCompleteOpen(true);
    },
    onCloseConsultationChat: () => setConsultationChatOpen(false),
    onStartVideoFromChat: () => {
      setConsultationChatOpen(false);
      setVideoJoinRetried(false);
      setJoinFailedOpen(false);
      setDeviceCheckOpen(true);
    },
    attachedDocuments,
    libraryDocuments,
    selectedLibraryId: attachedIds[0] ?? null,
    uploadOpen,
    selectSheetOpen,
    onAddDocuments: () => {
      if (libraryDocuments.length > 0) {
        setSelectSheetOpen(true);
        return;
      }
      setUploadOpen(true);
    },
    onCloseSelectSheet: () => setSelectSheetOpen(false),
    onSelectExistingDocument: (id) => {
      setAttachedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setSelectSheetOpen(false);
    },
    onUploadNewFromSheet: () => {
      setSelectSheetOpen(false);
      setUploadOpen(true);
    },
    onCloseUpload: () => setUploadOpen(false),
    onUploadSaved: (files) => {
      setExtraDocuments((prev) => {
        const next = [...prev];
        files.forEach((file) => {
          if (!next.some((item) => item.id === file.id)) {
            next.push({ ...file, status: 'ready', progress: 1 });
          }
        });
        return next;
      });
      setAttachedIds((prev) => {
        const next = [...prev];
        files.forEach((file) => {
          if (!next.includes(file.id)) {
            next.push(file.id);
          }
        });
        return next;
      });
      setUploadOpen(false);
    },
    onRemoveDocument: (id) => {
      setAttachedIds((prev) => prev.filter((item) => item !== id));
    },
    onDownloadReceipt: () => undefined,
    onChangeTime: () => {
      resetRescheduleForm();
      setRescheduleOpen(true);
    },
    onCancel: () => {
      resetCancelForm();
      setCancelSheetOpen(true);
    },
    onCloseCancelSheet: () => {
      setCancelSheetOpen(false);
      resetCancelForm();
    },
    onSelectCancelReason: setCancelReason,
    onChangeCancelNote: setCancelNote,
    onConfirmCancel: () => {
      if (!cancelReason) {
        return;
      }
      setCancelledSnapshot(item);
      setCancelSheetOpen(false);
      setCancelledOpen(true);
      if (isNumericId) {
        const reasonCode =
          cancelReason === 'other'
            ? 'Other'
            : cancelReason === 'found_another'
              ? 'Duplicate'
              : 'PatientRequest';
        void cancelAppointmentMutation({
          patientAppId: Number(item.id),
          reasonCode,
          reasonText: cancelNote.trim() || undefined,
        });
      }
      if (item.id) {
        onRemoveAppointment(item.id);
      }
    },
    onCloseCancelled: () => {
      setCancelledOpen(false);
      setCancelledSnapshot(null);
      onBack();
    },
    onBookAnother: () => {
      setCancelledOpen(false);
      setCancelledSnapshot(null);
      onBookAnotherConsultation();
    },
    onViewRefund: () => undefined,
    onCloseReschedule: () => {
      setRescheduleOpen(false);
      resetRescheduleForm();
    },
    onSelectRescheduleDay: (id) => {
      const day = calendarRescheduleDays.find((row) => row.id === id);
      if (!day || day.status === 'past') {
        return;
      }
      setRescheduleError(null);
      setRescheduleDayId(id);
      setRescheduleSlotId(null);
    },
    onSelectRescheduleSlot: setRescheduleSlotId,
    onOpenRescheduleReason: () => setRescheduleReasonOpen(true),
    onCloseRescheduleReason: () => setRescheduleReasonOpen(false),
    onSelectRescheduleReason: (value) => {
      setRescheduleReason(value);
      setRescheduleReasonOpen(false);
      if (value !== 'other') {
        setRescheduleNote('');
      }
    },
    onChangeRescheduleNote: setRescheduleNote,
    onConfirmReschedule: () => {
      if (
        rescheduleSubmitting ||
        !canConfirmReschedule ||
        !selectedRescheduleDay ||
        !selectedRescheduleSlot ||
        selectedRescheduleDay.status === 'past'
      ) {
        return;
      }
      const appointmentTime = selectedRescheduleSlot.id.slice(0, 5);
      if (!/^\d{2}:\d{2}$/.test(appointmentTime) || !isNumericId) {
        setRescheduleError('Choose an available time from the schedule.');
        return;
      }
      const weekday = t(WEEKDAY_KEYS[selectedRescheduleDay.weekdayIndex]);
      const monthName = t(MONTH_KEYS[selectedRescheduleDay.month]);
      const month = language === 'en' ? monthName.slice(0, 3) : monthName;
      const daySummary = `${weekday}, ${selectedRescheduleDay.day} ${month} ${selectedRescheduleDay.year}`;
      const slotTimeLabel = t(selectedRescheduleSlot.labelKey);
      const timeLine = `${slotTimeLabel} IST`;
      const whenLabel = `${daySummary} · ${timeLine}`;
      const newStartsAt = slotStartIso(
        selectedRescheduleDay.year,
        selectedRescheduleDay.month,
        selectedRescheduleDay.day,
        selectedRescheduleSlot.id,
      );
      const appointmentDate = selectedRescheduleDay.id;

      setRescheduleSubmitting(true);
      setRescheduleError(null);
      void rescheduleAppointmentMutation({
        patientAppId: Number(item.id),
        appointmentDate,
        appointmentTime,
        reason: rescheduleNote.trim() || undefined,
      })
        .unwrap()
        .then(() => {
          onUpdateAppointment(item.id, {
            whenLabel,
            dateLine: daySummary,
            timeLine,
            startsAt: newStartsAt,
          });
          setRescheduleOpen(false);
          resetRescheduleForm();
        })
        .catch((err: unknown) => {
          setRescheduleError(messageFromUnknownError(err));
        })
        .finally(() => {
          setRescheduleSubmitting(false);
        });
    },
    onGetHelp: () => undefined,
    clinicCheckInOpen,
    clinicCheckInState,
    isCheckedIn,
    checkInError,
    clinicName,
    clinicAddress,
    clinicDistanceLabel: '',
    clinicTravelNote: '',
    clinicFeeAmount: visitFeeLabel,
    clinicBannerLabel: t('clinicAptBanner').replace('{when}', item.whenLabel),
    clinicPhone,
    clinicMapLink,
    addressCopied,
    checkedInAtLabel,
    queuePosition,
    waitMinutes: checkInWaitMinutes,
    checkInBusy,
    showPayNow,
    payNowLabel,
    payNowBusy: payLater.busy || payLater.state === 'CREATING_ORDER',
    payNowError,
    isVisitPaid: visitIsPaid,
    onPayNow,
    onOpenCheckIn: () => {
      setClinicCheckInState(clinicCheckInState === 'waiting' ? 'waiting' : 'ready');
      setClinicCheckInOpen(true);
    },
    onCloseCheckIn: () => setClinicCheckInOpen(false),
    onConfirmCheckIn: () => {
      console.log(' [Check-In] Request triggered:', {
        patientAppId: Number(item.id),
        status: 'WAITING',
        url: `api/Patient/Visits/${item.id}/CheckIn`,
      });
      if (!isNumericId || checkInBusy) {
        console.warn(' [Check-In] Aborted: isNumericId =', isNumericId, 'checkInBusy =', checkInBusy);
        return;
      }
      setCheckInError(null);
      void checkInVisit({ patientAppId: Number(item.id), status: 'WAITING' })
        .unwrap()
        .then((res) => {
          console.log(' [Check-In] API Success Response:', JSON.stringify(res, null, 2));
          setCheckedInAtLabel(clockLabel(new Date()));
          setClinicCheckInState('waiting');
          if (res.data?.queuePosition != null) {
            setCheckInQueuePosition(res.data.queuePosition);
          }
          if (res.data?.estimatedWaitMinutes != null) {
            setCheckInWaitMinutes(res.data.estimatedWaitMinutes);
          }
          setReadyAtLabel(res.data?.readyAt?.trim() || null);
        })
        .catch((err: unknown) => {
          console.log('❌ [Check-In] API Error Response:', JSON.stringify(err, null, 2));
          console.error('❌ [Check-In] API Error Raw:', err);
          setCheckInError(messageFromUnknownError(err));
        });
    },
    onTellClinicLate: () => {
      const teleSessionId = visitDetail?.teleSessionId;
      if (teleSessionId == null) return;
      void reportRunningLate({ teleSessionId, minutes: 10 })
        .unwrap()
        .catch(() => undefined);
    },
    readyAtLabel,
    onCopyAddress: () => {
      const message = [clinicName, clinicAddress].filter(Boolean).join('\n');
      if (!message) return;
      void Share.share({ message });
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    },
    onDirections: () => {
      if (clinicMapLink) {
        void Linking.openURL(clinicMapLink);
        return;
      }
      if (clinicAddress) {
        void Linking.openURL(
          `https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`,
        );
      }
    },
    onCallClinic: () => {
      if (!clinicPhone) return;
      const digits = clinicPhone.replace(/[^\d+]/g, '');
      if (digits) void Linking.openURL(`tel:${digits}`);
    },
    onSwitchOnline: () => {
      if (!isNumericId) return;
      void switchVisitToTele({ patientAppId: Number(item.id) })
        .unwrap()
        .then(() => {
          onUpdateAppointment(item.id, { mode: 'video' });
        })
        .catch(() => undefined);
    },
  };
}
