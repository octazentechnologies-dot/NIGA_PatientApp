import { useEffect, useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type CallConnectionOverlay = 'none' | 'reconnecting' | 'doctorDisconnected';

export type VideoCallViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  doctorName: string;
  doctorShortName: string;
  doctorInitials: string;
  durationLabel: string;
  micOn: boolean;
  cameraOn: boolean;
  audioOnly: boolean;
  speaking: boolean;
  chatUnread: number;
  toastVisible: boolean;
  toastMessage: string;
  connectionOverlay: CallConnectionOverlay;
  reconnectAttempt: number;
  reconnectMaxAttempts: number;
  reconnectElapsedLabel: string;
  doctorWaitLabel: string;
  doctorWaitProgress: number;
  recordingConsentOpen: boolean;
  recordingConsentChecked: boolean;
  recordingActive: boolean;
  recordingElapsedLabel: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSwitchAudioOnly: () => void;
  onTryVideoAgain: () => void;
  onOpenChat: () => void;
  onAttach: () => void;
  onFlipCamera: () => void;
  onEndCall: () => void;
  onBack: () => void;
  /** Demo: tap signal to simulate patient connection loss. */
  onSimulatePatientDisconnect: () => void;
  /** Demo: long-press signal to simulate doctor disconnect. */
  onSimulateDoctorDisconnect: () => void;
  /** Demo: long-press doctor chip to request recording consent. */
  onSimulateRecordingRequest: () => void;
  onToggleRecordingConsent: () => void;
  onAllowRecording: () => void;
  onDeclineRecording: () => void;
  onStopRecording: () => void;
  onSwitchToAudioFromReconnect: () => void;
  onEndFromReconnect: () => void;
  onWaitForDoctor: () => void;
  onRescheduleFromDoctorDisconnect: () => void;
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

function formatClock(totalSec: number, language: AppLanguage): string {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return localizeDigits(`${pad2(mins)}:${pad2(secs)}`, language);
}

const RECONNECT_MAX = 5;
/** Prototype: doctor asks to record shortly after call starts. */
const DEMO_RECORDING_CONSENT_AFTER_MS = 5_000;
/** Prototype: auto-show patient reconnect once after this delay. */
const DEMO_PATIENT_DISCONNECT_AFTER_MS = 28_000;
/** Prototype: doctor auto-rejoins after this wait. */
const DEMO_DOCTOR_REJOIN_AFTER_SEC = 50;
const DOCTOR_WAIT_BUDGET_SEC = 5 * 60;

export function useVideoCallController({
  appointment,
  active,
  onEndCall,
  onReschedule,
}: {
  appointment: BookedAppointment | null;
  active: boolean;
  onEndCall: (durationSeconds: number) => void;
  onReschedule: () => void;
}): VideoCallViewModel {
  const { language, t } = useLocalization();
  const [elapsedSec, setElapsedSec] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [audioOnly, setAudioOnly] = useState(false);
  const [speaking, setSpeaking] = useState(true);
  const [chatUnread] = useState(2);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [connectionOverlay, setConnectionOverlay] =
    useState<CallConnectionOverlay>('none');
  const [reconnectAttempt, setReconnectAttempt] = useState(1);
  const [reconnectElapsedSec, setReconnectElapsedSec] = useState(0);
  const [doctorWaitSec, setDoctorWaitSec] = useState(0);
  const [patientDisconnectShown, setPatientDisconnectShown] = useState(false);
  const [recordingConsentOpen, setRecordingConsentOpen] = useState(false);
  const [recordingConsentChecked, setRecordingConsentChecked] = useState(false);
  const [recordingConsentShown, setRecordingConsentShown] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordingElapsedSec, setRecordingElapsedSec] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedSec(0);
      setMicOn(true);
      setCameraOn(true);
      setAudioOnly(false);
      setSpeaking(true);
      setToastVisible(false);
      setToastMessage('');
      setConnectionOverlay('none');
      setReconnectAttempt(1);
      setReconnectElapsedSec(0);
      setDoctorWaitSec(0);
      setPatientDisconnectShown(false);
      setRecordingConsentOpen(false);
      setRecordingConsentChecked(false);
      setRecordingConsentShown(false);
      setRecordingActive(false);
      setRecordingElapsedSec(0);
      return;
    }

    setElapsedSec(8 * 60 + 12);
    setToastMessage(t('videoCallScreenShareToast'));
    setToastVisible(true);
    const toastTimer = setTimeout(() => setToastVisible(false), 4000);
    const tick = setInterval(() => setElapsedSec((prev) => prev + 1), 1000);
    const speakTick = setInterval(() => setSpeaking((prev) => !prev), 2800);

    return () => {
      clearTimeout(toastTimer);
      clearInterval(tick);
      clearInterval(speakTick);
    };
  }, [active, t]);

  // Demo: doctor requests recording consent.
  useEffect(() => {
    if (
      !active ||
      recordingConsentShown ||
      recordingConsentOpen ||
      recordingActive ||
      connectionOverlay !== 'none'
    ) {
      return;
    }
    const timer = setTimeout(() => {
      setRecordingConsentShown(true);
      setRecordingConsentOpen(true);
      setRecordingConsentChecked(false);
    }, DEMO_RECORDING_CONSENT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [
    active,
    recordingConsentShown,
    recordingConsentOpen,
    recordingActive,
    connectionOverlay,
  ]);

  useEffect(() => {
    if (!recordingActive) {
      return;
    }
    const tick = setInterval(() => {
      setRecordingElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [recordingActive]);

  // Demo: patient connection issue once during video call.
  useEffect(() => {
    if (
      !active ||
      audioOnly ||
      patientDisconnectShown ||
      connectionOverlay !== 'none' ||
      recordingConsentOpen
    ) {
      return;
    }
    const timer = setTimeout(() => {
      setPatientDisconnectShown(true);
      setConnectionOverlay('reconnecting');
      setReconnectAttempt(2);
      setReconnectElapsedSec(11);
    }, DEMO_PATIENT_DISCONNECT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [
    active,
    audioOnly,
    patientDisconnectShown,
    connectionOverlay,
    recordingConsentOpen,
  ]);
  // Reconnecting elapsed + attempt bump.
  useEffect(() => {
    if (connectionOverlay !== 'reconnecting') {
      return;
    }
    const tick = setInterval(() => {
      setReconnectElapsedSec((prev) => prev + 1);
    }, 1000);
    const attemptTick = setInterval(() => {
      setReconnectAttempt((prev) => (prev >= RECONNECT_MAX ? prev : prev + 1));
    }, 8000);
    return () => {
      clearInterval(tick);
      clearInterval(attemptTick);
    };
  }, [connectionOverlay]);

  // Doctor disconnected wait + auto-rejoin.
  useEffect(() => {
    if (connectionOverlay !== 'doctorDisconnected') {
      return;
    }
    const tick = setInterval(() => {
      setDoctorWaitSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [connectionOverlay]);

  useEffect(() => {
    if (
      connectionOverlay === 'doctorDisconnected' &&
      doctorWaitSec >= DEMO_DOCTOR_REJOIN_AFTER_SEC
    ) {
      setConnectionOverlay('none');
      setDoctorWaitSec(0);
    }
  }, [connectionOverlay, doctorWaitSec]);

  const doctorName = appointment
    ? t(appointment.doctorNameKey)
    : t('searchResultAnjaliName');
  const doctorShortName =
    doctorName.replace(/^Dr\.\s*/i, '').split(/\s+/)[0] || doctorName;
  const doctorInitials = appointment?.doctorInitials ?? 'AD';
  const durationLabel = formatClock(elapsedSec, language);
  const reconnectElapsedLabel = formatClock(reconnectElapsedSec, language);
  const doctorWaitLabel = formatClock(doctorWaitSec, language);
  const doctorWaitProgress = Math.min(1, doctorWaitSec / DOCTOR_WAIT_BUDGET_SEC);
  const recordingElapsedLabel = formatClock(recordingElapsedSec, language);

  const enterAudioOnly = () => {
    setAudioOnly(true);
    setCameraOn(false);
    setConnectionOverlay('none');
  };

  return {
    language,
    t,
    doctorName,
    doctorShortName,
    doctorInitials,
    durationLabel,
    micOn,
    cameraOn: audioOnly ? false : cameraOn,
    audioOnly,
    speaking,
    chatUnread,
    toastVisible,
    toastMessage,
    connectionOverlay,
    reconnectAttempt,
    reconnectMaxAttempts: RECONNECT_MAX,
    reconnectElapsedLabel,
    doctorWaitLabel,
    doctorWaitProgress,
    recordingConsentOpen,
    recordingConsentChecked,
    recordingActive,
    recordingElapsedLabel,
    onToggleMic: () => setMicOn((prev) => !prev),
    onToggleCamera: () => {
      if (audioOnly) {
        return;
      }
      setCameraOn((prev) => !prev);
    },
    onSwitchAudioOnly: () => {
      if (audioOnly) {
        setAudioOnly(false);
        setCameraOn(true);
        return;
      }
      enterAudioOnly();
      setToastMessage(t('videoCallAudioOnlyToast'));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    },
    onTryVideoAgain: () => {
      setAudioOnly(false);
      setCameraOn(true);
    },
    onOpenChat: () => undefined,
    onAttach: () => undefined,
    onFlipCamera: () => undefined,
    onEndCall: () => onEndCall(elapsedSec),
    onBack: () => onEndCall(elapsedSec),
    onSimulatePatientDisconnect: () => {
      if (connectionOverlay !== 'none' || recordingConsentOpen) {
        return;
      }
      setPatientDisconnectShown(true);
      setConnectionOverlay('reconnecting');
      setReconnectAttempt(2);
      setReconnectElapsedSec(0);
    },
    onSimulateDoctorDisconnect: () => {
      if (audioOnly || recordingConsentOpen) {
        return;
      }
      setDoctorWaitSec(38);
      setConnectionOverlay('doctorDisconnected');
    },
    onSimulateRecordingRequest: () => {
      if (recordingActive || recordingConsentOpen || connectionOverlay !== 'none') {
        return;
      }
      setRecordingConsentShown(true);
      setRecordingConsentChecked(false);
      setRecordingConsentOpen(true);
    },
    onToggleRecordingConsent: () =>
      setRecordingConsentChecked((prev) => !prev),
    onAllowRecording: () => {
      if (!recordingConsentChecked) {
        return;
      }
      setRecordingConsentOpen(false);
      setRecordingActive(true);
      setRecordingElapsedSec(0);
    },
    onDeclineRecording: () => {
      setRecordingConsentOpen(false);
      setRecordingConsentChecked(false);
    },
    onStopRecording: () => {
      setRecordingActive(false);
      setRecordingElapsedSec(0);
      setToastMessage(t('recordStoppedToast'));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    },
    onSwitchToAudioFromReconnect: () => {
      enterAudioOnly();
    },
    onEndFromReconnect: () => {
      setConnectionOverlay('none');
      onEndCall(elapsedSec);
    },
    onWaitForDoctor: () => {
      // Stay on the doctor-disconnected sheet until auto-rejoin.
    },
    onRescheduleFromDoctorDisconnect: () => {
      setConnectionOverlay('none');
      onReschedule();
    },
  };
}
