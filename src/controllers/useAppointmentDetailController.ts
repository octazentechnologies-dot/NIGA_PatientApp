import { useEffect, useMemo, useState } from 'react';
import { Linking, Share } from 'react-native';

import {
  MONTH_KEYS,
  WEEKDAY_KEYS,
  buildDaysForMonth,
  consultFeeRupees,
  formatRupees,
  todayStart,
  type BookingDay,
  type TimeSlot,
} from '../config/appointmentSlots';
import type { BookedAppointment } from '../config/bookedAppointments';
import {
  formatCountdown,
  JOIN_GRACE_MS,
  NEAR_START_MS,
  slotStartIso,
} from '../config/bookedAppointments';
import type { PatientDocument } from '../config/patientDocuments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { ConsultModeChoice, NetworkQuality } from './useDeviceCheckController';
import { attemptJoinWaitingRoom } from './useJoinFailedController';

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
  clinicName: string;
  clinicAddress: string;
  clinicDistanceLabel: string;
  clinicTravelNote: string;
  clinicFeeAmount: string;
  clinicBannerLabel: string;
  addressCopied: boolean;
  checkedInAtLabel: string;
  queuePosition: number;
  waitMinutes: number;
  onOpenCheckIn: () => void;
  onCloseCheckIn: () => void;
  onConfirmCheckIn: () => void;
  onTellClinicLate: () => void;
  onSelectCheckInDemoState: (state: ClinicCheckInState) => void;
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

function upcomingRescheduleDays(): BookingDay[] {
  const today = todayStart();
  const current = buildDaysForMonth(today.getFullYear(), today.getMonth());
  const next =
    today.getMonth() === 11
      ? buildDaysForMonth(today.getFullYear() + 1, 0)
      : buildDaysForMonth(today.getFullYear(), today.getMonth() + 1);
  return [...current, ...next].slice(0, 7);
}

function firstOpenSlot(day: BookingDay, skipId?: string | null): string | null {
  const all = [...day.morning, ...day.afternoon, ...day.evening];
  return (
    all.find((slot) => !slot.booked && slot.id !== skipId)?.id ??
    all.find((slot) => !slot.booked)?.id ??
    null
  );
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
  doctorId: 'anjali',
  doctorNameKey: 'searchResultAnjaliName',
  doctorInitials: 'AD',
  credentialsKey: 'searchResultAnjaliCredentials',
  experienceKey: 'profileAnjaliExp',
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
  reasonKey: 'aptReasonCough',
  status: 'confirmed',
};

export function useAppointmentDetailController({
  appointment,
  onBack,
  onRemoveAppointment,
  onUpdateAppointment,
  onBookAnotherConsultation,
}: {
  appointment: BookedAppointment | null;
  onBack: () => void;
  onRemoveAppointment: (id: string) => void;
  onUpdateAppointment: (id: string, patch: Partial<BookedAppointment>) => void;
  onBookAnotherConsultation: () => void;
}): AppointmentDetailViewModel {
  const { language, t } = useLocalization();
  const [cancelledSnapshot, setCancelledSnapshot] = useState<BookedAppointment | null>(
    null,
  );
  const item = cancelledSnapshot ?? appointment ?? FALLBACK_APPOINTMENT;
  const startMs = useMemo(
    () => new Date(item.startsAt).getTime(),
    [item.startsAt],
  );
  const [now, setNow] = useState(() => Date.now());
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReason | null>(null);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelledOpen, setCancelledOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDays] = useState(upcomingRescheduleDays);
  const [rescheduleDayId, setRescheduleDayId] = useState(
    () => rescheduleDays.find((day) => day.status === 'open')?.id ?? rescheduleDays[0]?.id ?? '',
  );
  const [rescheduleSlotId, setRescheduleSlotId] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState<RescheduleReason | null>(
    null,
  );
  const [rescheduleReasonOpen, setRescheduleReasonOpen] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState('');
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
  const [libraryDocuments, setLibraryDocuments] = useState<PatientDocument[]>([]);
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectSheetOpen, setSelectSheetOpen] = useState(false);
  const [clinicCheckInOpen, setClinicCheckInOpen] = useState(false);
  const [clinicCheckInState, setClinicCheckInState] =
    useState<ClinicCheckInState>('ready');
  const [addressCopied, setAddressCopied] = useState(false);
  const [checkedInAtLabel, setCheckedInAtLabel] = useState('10:52 AM');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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
  const isClinic = item.mode === 'clinic';
  const isChat = item.mode === 'chat';
  const isRemoteConsult = item.mode === 'video' || item.mode === 'audio';
  const phase: AppointmentPhase = isClinic || isChat
    ? remainingMs <= -JOIN_GRACE_MS
      ? 'ended'
      : 'confirmed'
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
  const fee = consultFeeRupees(item.doctorId, item.mode);
  const refundPercent =
    remainingMs <= 0 ? 0 : remainingMs > FOUR_HOURS_MS ? 100 : 50;
  const refundAmount = formatRupees(Math.round((fee * refundPercent) / 100), language);
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
  const deadlineLabel = `${localizeDigits(clockLabel(deadline), language)}${
    deadline.toDateString() === new Date().toDateString()
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
      (rescheduleReason !== 'other' || rescheduleNote.trim()),
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
  };

  const attachedDocuments = useMemo(
    () =>
      libraryDocuments.filter((doc) => attachedIds.includes(doc.id)),
    [libraryDocuments, attachedIds],
  );

  return {
    language,
    t,
    doctorName: t(item.doctorNameKey),
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
    reason: t(item.reasonKey),
    feeLabel: t('aptPaidAmount').replace('{amount}', item.feeLabel),
    paymentId: item.paymentId,
    isClinic,
    isChat,
    showJoin: isRemoteConsult && phase !== 'ended',
    showOpenChat: isChat,
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
      setLibraryDocuments((prev) => {
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
      const day = rescheduleDays.find((row) => row.id === id);
      setRescheduleDayId(id);
      setRescheduleSlotId(day ? firstOpenSlot(day, currentSlotId) : null);
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
      if (!canConfirmReschedule || !selectedRescheduleDay || !selectedRescheduleSlot) {
        return;
      }
      const weekday = t(WEEKDAY_KEYS[selectedRescheduleDay.weekdayIndex]);
      const monthName = t(MONTH_KEYS[selectedRescheduleDay.month]);
      const month = language === 'en' ? monthName.slice(0, 3) : monthName;
      const daySummary = `${weekday}, ${selectedRescheduleDay.day} ${month} ${selectedRescheduleDay.year}`;
      const slotTimeLabel = t(selectedRescheduleSlot.labelKey);
      const timeLine = `${slotTimeLabel} IST`;
      const whenLabel = `${daySummary} · ${timeLine}`;
      onUpdateAppointment(item.id, {
        whenLabel,
        dateLine: daySummary,
        timeLine,
        startsAt: slotStartIso(
          selectedRescheduleDay.year,
          selectedRescheduleDay.month,
          selectedRescheduleDay.day,
          selectedRescheduleSlot.id,
        ),
      });
      setRescheduleOpen(false);
      resetRescheduleForm();
    },
    onGetHelp: () => undefined,
    clinicCheckInOpen,
    clinicCheckInState,
    clinicName: t('clinicAptClinicName'),
    clinicAddress: t('clinicAptClinicAddress'),
    clinicDistanceLabel: t('clinicAptDistance'),
    clinicTravelNote: t('clinicAptTravelNote'),
    clinicFeeAmount: item.feeLabel,
    clinicBannerLabel: t('clinicAptBanner').replace('{when}', item.whenLabel),
    addressCopied,
    checkedInAtLabel,
    queuePosition: 2,
    waitMinutes: 15,
    onOpenCheckIn: () => {
      setClinicCheckInState(clinicCheckInState === 'waiting' ? 'waiting' : 'ready');
      setClinicCheckInOpen(true);
    },
    onCloseCheckIn: () => setClinicCheckInOpen(false),
    onConfirmCheckIn: () => {
      setCheckedInAtLabel(clockLabel(new Date()));
      setClinicCheckInState('waiting');
    },
    onTellClinicLate: () => undefined,
    onSelectCheckInDemoState: setClinicCheckInState,
    onCopyAddress: () => {
      void Share.share({ message: t('clinicAptClinicAddress') });
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    },
    onDirections: () => {
      void Linking.openURL(
        'https://maps.google.com/?q=Prabhat+Road+Lane+15+Pune+411004',
      );
    },
    onCallClinic: () => {
      void Linking.openURL('tel:+918001234567');
    },
    onSwitchOnline: () => undefined,
  };
}
