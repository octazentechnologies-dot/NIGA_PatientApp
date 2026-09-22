import { useEffect, useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { ConsultModeChoice } from './useDeviceCheckController';

export type WaitingRoomVariant = 'standard' | 'doctorLate';

export type WaitingRoomViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  variant: WaitingRoomVariant;
  doctorName: string;
  doctorShortName: string;
  doctorInitials: string;
  credentialsLine: string;
  experienceLine: string;
  queuePositionLabel: string;
  etaLabel: string;
  waitTimerLabel: string;
  lateMinutesLabel: string;
  consultMode: ConsultModeChoice;
  muted: boolean;
  cameraOff: boolean;
  weakNetwork: boolean;
  documentCount: number;
  onBack: () => void;
  onLeave: () => void;
  onGetHelp: () => void;
  onReviewQuestions: () => void;
  onReviewDocuments: () => void;
  onReadGuide: () => void;
  onReschedule: () => void;
  onSwitchToAudio: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onOpenChat: () => void;
  onEndCall: () => void;
  onOpenSettings: () => void;
  onToggleDemoLate: () => void;
};

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function shortDoctorName(fullName: string): string {
  const cleaned = fullName.replace(/^Dr\.\s*/i, '').replace(/^डॉ\.\s*/, '');
  const parts = cleaned.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? cleaned;
  if (fullName.startsWith('डॉ.') || fullName.includes('डॉ')) {
    return `डॉ. ${last}`;
  }
  return `Dr. ${last}`;
}

export function useWaitingRoomController({
  appointment,
  consultMode: initialMode,
  onBack,
  onLeave,
  onReschedule,
  forceDoctorLate = false,
}: {
  appointment: BookedAppointment | null;
  consultMode: ConsultModeChoice;
  onBack: () => void;
  onLeave: () => void;
  onReschedule: () => void;
  forceDoctorLate?: boolean;
}): WaitingRoomViewModel {
  const { language, t } = useLocalization();
  const [forceLate, setForceLate] = useState(forceDoctorLate);
  const [elapsedSec, setElapsedSec] = useState(88);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(initialMode === 'audio');
  const [consultMode, setConsultMode] = useState<ConsultModeChoice>(initialMode);
  const [weakNetwork, setWeakNetwork] = useState(forceDoctorLate);

  useEffect(() => {
    setForceLate(forceDoctorLate);
  }, [forceDoctorLate]);

  useEffect(() => {
    if (forceLate) {
      setWeakNetwork(true);
      setCameraOff(true);
      setConsultMode('audio');
    } else {
      setWeakNetwork(false);
      setCameraOff(initialMode === 'audio');
      setConsultMode(initialMode);
    }
  }, [forceLate, initialMode]);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSec((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const doctorName = appointment
    ? t(appointment.doctorNameKey)
    : t('searchResultAnjaliName');
  const doctorShortName = shortDoctorName(doctorName);
  const doctorInitials = appointment?.doctorInitials ?? 'AD';
  const credentialsLine = appointment
    ? t(appointment.credentialsKey)
    : t('searchResultAnjaliCredentials');
  const experienceLine = appointment
    ? t(appointment.experienceKey)
    : t('searchResultAnjaliExperience');

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const waitTimerLabel = localizeDigits(
    t('waitingRoomTimer').replace('{time}', `${pad2(mins)}:${pad2(secs)}`),
    language,
  );

  const queuePositionLabel = localizeDigits(t('waitingRoomQueuePos'), language);
  const etaLabel = localizeDigits(t('waitingRoomEta').replace('{minutes}', '3'), language);
  const lateMinutesLabel = localizeDigits(
    t('waitingRoomLateBanner')
      .replace('{name}', doctorShortName)
      .replace('{minutes}', '10'),
    language,
  );

  const variant: WaitingRoomVariant = forceLate ? 'doctorLate' : 'standard';

  return {
    language,
    t,
    variant,
    doctorName,
    doctorShortName,
    doctorInitials,
    credentialsLine,
    experienceLine,
    queuePositionLabel,
    etaLabel,
    waitTimerLabel,
    lateMinutesLabel,
    consultMode,
    muted,
    cameraOff,
    weakNetwork,
    documentCount: 2,
    onBack,
    onLeave,
    onGetHelp: () => undefined,
    onReviewQuestions: () => undefined,
    onReviewDocuments: () => undefined,
    onReadGuide: () => undefined,
    onReschedule,
    onSwitchToAudio: () => {
      setConsultMode('audio');
      setCameraOff(true);
      setWeakNetwork(false);
    },
    onToggleMute: () => setMuted((prev) => !prev),
    onToggleCamera: () => {
      if (consultMode === 'audio') {
        return;
      }
      setCameraOff((prev) => !prev);
    },
    onOpenChat: () => undefined,
    onEndCall: onLeave,
    onOpenSettings: () => undefined,
    onToggleDemoLate: () => setForceLate((prev) => !prev),
  };
}
