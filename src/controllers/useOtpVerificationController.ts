import { useEffect, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { extractErrorMessage } from '../store/api/new/newBaseApi';
import { useVerifyOtpMutation } from '../store/api/new/otpVerificationApi';
import { useRequestOtpMutation } from '../store/api/new/signInApi';
import { useAppDispatch } from '../store/hooks';
import {
  saveAccessToken,
  saveAuthUserData,
  saveBookingSessionId,
} from '../services/secureStorage';
import {
  setAuthenticated,
  setAuthUser,
  setBookingSession,
} from '../store/slices/authSlice';
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
          const registered = Boolean(
            response.isUserAlreadyRegistered ??
              response.isUserRegistered ??
              isUserRegistered,
          );

          dispatch(
            setBookingSession({
              bookingSessionId: response.bookingSessionId,
              mobile: response.mobile,
            }),
          );
          if (response.bookingSessionId) {
            await saveBookingSessionId(response.bookingSessionId);
          }

          if (registered && response.token) {
            const userToSave = response.user
              ? {
                  userId: response.user.userId,
                  userName: response.user.userName,
                  firstName: response.user.firstName,
                  lastName: response.user.lastName,
                  email: response.user.email,
                  mobile: response.user.mobileNo ?? response.mobile,
                  mobileNo: response.user.mobileNo ?? response.mobile,
                  role: response.user.role,
                  roleId: response.user.roleId,
                  patientId: response.user.patientId,
                  patientName: response.user.patientName,
                }
              : {
                  mobile: response.mobile,
                  mobileNo: response.mobile,
                };

            await saveAccessToken(response.token);
            await saveAuthUserData(userToSave);

            dispatch(
              setAuthUser({
                user: userToSave,
                token: response.token,
                patientId: response.user?.patientId,
                userId: response.user?.userId,
                mobile: response.user?.mobileNo ?? response.mobile,
              }),
            );
            dispatch(setAuthenticated(true));
          }
          setErrorMessage(null);
          onVerified(registered);
        } else {
          setErrorMessage(
            extractErrorMessage(response, 'Invalid OTP.'),
          );
        }
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          (err as { status?: number }).status === 429
        ) {
          setErrorMessage('OTP locked. Try later.');
          return;
        }
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err
        ) {
          const data = (err as { data: unknown }).data;
          setErrorMessage(extractErrorMessage(data, 'Invalid OTP.'));
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
          const safeDevCode = __DEV__ ? response.devCode : undefined;
          if (safeDevCode) {
            setDevOtp(safeDevCode);
          }
          const reg =
            response.isUserAlreadyRegistered ?? response.isUserRegistered;
          if (typeof reg === 'boolean') {
            setIsUserRegistered(reg);
          }
        } else {
          setErrorMessage(extractErrorMessage(response, 'Failed to resend OTP.'));
        }
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          (err as { status?: number }).status === 429
        ) {
          setErrorMessage('Too many OTP requests. Please wait a moment.');
        }
      }
    },
    onWhatsApp: () => undefined,
    onContactHelpline: () => undefined,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
