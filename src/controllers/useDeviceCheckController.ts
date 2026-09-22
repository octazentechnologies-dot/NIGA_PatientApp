import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ConsultModeChoice = 'video' | 'audio';
export type NetworkQuality = 'good' | 'weak';

export type DeviceCheckViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  doctorName: string;
  subtitle: string;
  cameraBlocked: boolean;
  cameraFacing: 'front' | 'back';
  networkQuality: NetworkQuality;
  networkMbpsLabel: string;
  mbpsLabel: string;
  consultMode: ConsultModeChoice;
  micLabel: string;
  speakerLabel: string;
  tipLabel: string;
  audioRecommended: boolean;
  speakerTesting: boolean;
  onBack: () => void;
  onToggleDemoWeak: () => void;
  onFlipCamera: () => void;
  onToggleCameraFacing: () => void;
  onPlaySpeakerTest: () => void;
  onOpenSettings: () => void;
  onSelectMode: (mode: ConsultModeChoice) => void;
  onJoinWaitingRoom: () => void;
  onSkipCheck: () => void;
};

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

/** Prototype network mock — swap for a real measurement later. */
function mockNetworkCheck(): { quality: NetworkQuality; mbps: number; cameraBlocked: boolean } {
  return { quality: 'good', mbps: 4.2, cameraBlocked: false };
}

export function useDeviceCheckController({
  appointment,
  onBack,
  onFinished,
  /** Force the weak-network / camera-blocked layout (for design QA). */
  forceWeakNetwork = false,
}: {
  appointment: BookedAppointment | null;
  onBack: () => void;
  onFinished: (
    mode: ConsultModeChoice,
    diagnostics: { networkQuality: NetworkQuality; mbps: number },
  ) => void;
  forceWeakNetwork?: boolean;
}): DeviceCheckViewModel {
  const { language, t } = useLocalization();
  const initialMode: ConsultModeChoice =
    appointment?.mode === 'audio' ? 'audio' : 'video';

  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [consultMode, setConsultMode] = useState<ConsultModeChoice>(initialMode);
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('good');
  const [mbps, setMbps] = useState(4.2);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [speakerTesting, setSpeakerTesting] = useState(false);
  const [forceWeak, setForceWeak] = useState(forceWeakNetwork);

  useEffect(() => {
    setForceWeak(forceWeakNetwork);
  }, [forceWeakNetwork]);

  useEffect(() => {
    if (forceWeak) {
      setNetworkQuality('weak');
      setMbps(0.4);
      setCameraBlocked(true);
      setConsultMode('audio');
      return;
    }
    const result = mockNetworkCheck();
    setNetworkQuality(result.quality);
    setMbps(result.mbps);
    setCameraBlocked(result.cameraBlocked);
    if (result.quality === 'weak') {
      setConsultMode('audio');
    } else {
      setConsultMode(initialMode);
    }
  }, [forceWeak, appointment?.id, initialMode]);

  const doctorName = appointment
    ? t(appointment.doctorNameKey)
    : t('searchResultAnjaliName');
  const timeLine = appointment?.timeLine ?? '6:30 PM';
  const dateLine = appointment?.dateLine ?? '';

  const subtitle = useMemo(() => {
    const base = t('deviceCheckSubtitle')
      .replace('{name}', doctorName)
      .replace('{time}', timeLine);
    if (dateLine && networkQuality === 'good') {
      return `${base}. ${t('deviceCheckDate').replace('{date}', dateLine)}`;
    }
    return base;
  }, [t, doctorName, timeLine, dateLine, networkQuality]);

  const networkMbpsLabel = localizeDigits(
    networkQuality === 'good'
      ? t('deviceCheckNetGoodDetail').replace('{mbps}', mbps.toFixed(1))
      : t('deviceCheckNetWeakDetail').replace('{mbps}', mbps.toFixed(1)),
    language,
  );
  const mbpsLabel = localizeDigits(mbps.toFixed(1), language);

  const tipLabel =
    networkQuality === 'weak'
      ? t('deviceCheckWeakTip')
      : t('deviceCheckGoodTip');

  return {
    language,
    t,
    doctorName,
    subtitle,
    cameraBlocked,
    cameraFacing,
    networkQuality,
    networkMbpsLabel,
    mbpsLabel,
    consultMode,
    micLabel:
      networkQuality === 'weak'
        ? t('deviceCheckMicDefault')
        : t('deviceCheckMicSpeak'),
    speakerLabel:
      networkQuality === 'weak'
        ? t('deviceCheckSpeakerDefault')
        : t('deviceCheckSpeakerTap'),
    tipLabel,
    audioRecommended: networkQuality === 'weak',
    speakerTesting,
    onBack,
    onToggleDemoWeak: () => setForceWeak((prev) => !prev),
    onFlipCamera: () => setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front')),
    onToggleCameraFacing: () => setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front')),
    onPlaySpeakerTest: () => {
      setSpeakerTesting(true);
      setTimeout(() => setSpeakerTesting(false), 1200);
    },
    onOpenSettings: () => {
      void Linking.openSettings();
    },
    onSelectMode: setConsultMode,
    onJoinWaitingRoom: () =>
      onFinished(consultMode, { networkQuality, mbps }),
    onSkipCheck: () => onFinished(consultMode, { networkQuality, mbps }),
  };
}
