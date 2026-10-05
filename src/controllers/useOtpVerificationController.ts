import { useEffect, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useVerifyOtpMutation } from '../store/api/new/otpVerificationApi';
import { useRequestOtpMutation } from '../store/api/new/signInApi';
import { useAppDispatch } from '../store/hooks';
import { setAuthenticated, setBookingSession } from '../store/slices/authSlice';
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
  isVerifying: boolean;
  errorMessage: string | null;
  autoFocus: boolean;
  canResend: boolean;
  resendCountdown: string;
  devOtp: string | null;
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
  initialDevOtp,
  initialIsUserRegistered,
  active,
  onBack,
  onVerified,
}: {
  mobileNumber: string;
  initialDevOtp?: string;
  initialIsUserRegistered?: boolean;
  active: boolean;
  onBack: () => void;
  onVerified: (isRegistered?: boolean) => void;
}): OtpVerificationViewModel {
  const { language, setLanguage, t } = useLocalization();
  const dispatch = useAppDispatch();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(initialDevOtp ?? null);
  const [isUserRegistered, setIsUserRegistered] = useState(
    Boolean(initialIsUserRegistered),
  );
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [requestOtp] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  useEffect(() => {
    if (active) {
      setCode('');
      setErrorMessage(null);
      setSecondsLeft(RESEND_SECONDS);
      if (initialDevOtp) {
        setDevOtp(initialDevOtp);
      }
      if (typeof initialIsUserRegistered === 'boolean') {
        setIsUserRegistered(initialIsUserRegistered);
      }
    }
  }, [active, mobileNumber, initialDevOtp, initialIsUserRegistered]);

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
    canVerify: code.length === 6 && !isVerifying,
    isVerifying,
    errorMessage,
    autoFocus: active,
    canResend: secondsLeft === 0,
    resendCountdown: formatCountdown(secondsLeft),
    devOtp,
    onChangeCode: (value) => {
      setCode(value);
      setErrorMessage(null);
    },
    onVerify: async () => {
      if (code.length !== 6 || isVerifying) {
        return;
      }
      try {
        const response = await verifyOtp({
          mobile: mobileNumber,
          code,
        }).unwrap();

        if (response.success) {
          const registered = response.isUserRegistered ?? isUserRegistered;
          dispatch(
            setBookingSession({
              bookingSessionId: response.bookingSessionId,
              mobile: response.mobile,
            }),
          );
          if (registered) {
            dispatch(setAuthenticated(true));
          }
          setErrorMessage(null);
          onVerified(registered);
        } else {
          setErrorMessage(
            response.message || response.errorMessage || 'Invalid OTP.',
          );
        }
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err &&
          typeof (err as { data?: unknown }).data === 'object' &&
          (err as { data?: Record<string, unknown> }).data !== null
        ) {
          const data = (err as { data: Record<string, unknown> }).data;
          const msg =
            (typeof data.message === 'string' && data.message) ||
            (typeof data.errorMessage === 'string' && data.errorMessage) ||
            'Invalid OTP.';
          setErrorMessage(msg);
        } else {
          setErrorMessage('Invalid OTP.');
        }
      }
    },
    onResend: async () => {
      if (secondsLeft > 0) {
        return;
      }
      setCode('');
      setErrorMessage(null);
      setSecondsLeft(RESEND_SECONDS);
      try {
        const response = await requestOtp({ mobile: mobileNumber }).unwrap();
        if (response.success) {
          if (response.devCode) {
            setDevOtp(response.devCode);
          }
          if (typeof response.isUserRegistered === 'boolean') {
            setIsUserRegistered(response.isUserRegistered);
          }
        }
      } catch {
        // silent fallback for resend
      }
    },
    onWhatsApp: () => undefined,
    onContactHelpline: () => undefined,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
