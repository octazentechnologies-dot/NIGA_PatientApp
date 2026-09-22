import { useMemo, useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { ConsultModeChoice, NetworkQuality } from './useDeviceCheckController';

export type JoinFailedViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  bookingIdLabel: string;
  internetStatusLabel: string;
  internetWeak: boolean;
  joining: boolean;
  onBack: () => void;
  onTryAgain: () => void;
  onJoinAudio: () => void;
  onAskDoctorCall: () => void;
  onGetHelp: () => void;
};

export type JoinAttemptResult = 'waitingRoom' | 'joinFailed';

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

/**
 * Prototype join gate.
 * - Audio always proceeds to waiting room.
 * - Weak video always fails.
 * - First good-network video attempt fails once (connection issue); retries succeed.
 */
export function attemptJoinWaitingRoom(
  mode: ConsultModeChoice,
  networkQuality: NetworkQuality,
  options?: { isRetry?: boolean },
): JoinAttemptResult {
  if (mode === 'audio') {
    return 'waitingRoom';
  }
  if (networkQuality === 'weak') {
    return 'joinFailed';
  }
  if (!options?.isRetry) {
    return 'joinFailed';
  }
  return 'waitingRoom';
}

export function useJoinFailedController({
  appointment,
  networkQuality,
  mbps,
  onBack,
  onTryAgain,
  onJoinAudio,
  onAskDoctorCall,
  onGetHelp,
}: {
  appointment: BookedAppointment | null;
  networkQuality: NetworkQuality;
  mbps: number;
  onBack: () => void;
  onTryAgain: () => void;
  onJoinAudio: () => void;
  onAskDoctorCall: () => void;
  onGetHelp?: () => void;
}): JoinFailedViewModel {
  const { language, t } = useLocalization();
  const [joining, setJoining] = useState(false);

  const bookingId = appointment?.bookingId ?? 'APT-2026-88214';
  const mbpsLabel = localizeDigits(mbps.toFixed(1), language);
  const internetWeak = networkQuality === 'weak' || mbps < 1;

  const internetStatusLabel = useMemo(() => {
    if (internetWeak) {
      return t('joinFailedInternetWeak').replace('{mbps}', mbpsLabel);
    }
    return t('joinFailedStatusOk');
  }, [internetWeak, mbpsLabel, t]);

  const runThen = (action: () => void) => {
    if (joining) {
      return;
    }
    setJoining(true);
    setTimeout(() => {
      setJoining(false);
      action();
    }, 700);
  };

  return {
    language,
    t,
    bookingIdLabel: t('joinFailedBookingId').replace('{id}', bookingId),
    internetStatusLabel,
    internetWeak,
    joining,
    onBack,
    onTryAgain: () => runThen(onTryAgain),
    onJoinAudio: () => runThen(onJoinAudio),
    onAskDoctorCall,
    onGetHelp: onGetHelp ?? (() => undefined),
  };
}
