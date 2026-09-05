import { useEffect, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { formatIndianMobileDisplay } from '../utilities/phone';

const RESEND_SECONDS = 45;

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export type OtpVerificationViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  formattedMobile: string;
  code: string;
  canVerify: boolean;
  autoFocus: boolean;
  canResend: boolean;
  resendCountdown: string;
  onChangeCode: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onWhatsApp: () => void;
  onContactHelpline: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onBack: () => void;
};

export function useOtpVerificationController({
  mobileNumber,
  active,
  onBack,
  onVerified,
}: {
  mobileNumber: string;
  active: boolean;
  onBack: () => void;
  onVerified: () => void;
}): OtpVerificationViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (active) {
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
    }
  }, [active, mobileNumber]);

  useEffect(() => {
    if (!active || secondsLeft <= 0) {
      return;
    }
    const timeout = setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [active, secondsLeft]);

  return {
    language,
    t,
    formattedMobile: formatIndianMobileDisplay(mobileNumber),
    code,
    canVerify: code.length === 6,
    autoFocus: active,
    canResend: secondsLeft === 0,
    resendCountdown: formatCountdown(secondsLeft),
    onChangeCode: setCode,
    onVerify: () => {
      if (code.length === 6) {
        onVerified();
      }
    },
    onResend: () => {
      if (secondsLeft > 0) {
        return;
      }
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
    },
    onWhatsApp: () => undefined,
    onContactHelpline: () => undefined,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
