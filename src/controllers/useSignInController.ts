import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export type SignInViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  mobileNumber: string;
  errorMessage: string | null;
  agreedToWhatsApp: boolean;
  canSendOtp: boolean;
  onChangeMobileNumber: (value: string) => void;
  onToggleWhatsAppConsent: () => void;
  onSendOtp: () => void;
  onCallHelpline: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onBack: () => void;
};

export function useSignInController({
  onBack,
  onOtpRequested,
}: {
  onBack: () => void;
  onOtpRequested: (mobileNumber: string) => void;
}): SignInViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreedToWhatsApp, setAgreedToWhatsApp] = useState(false);

  return {
    language,
    t,
    mobileNumber,
    errorMessage,
    agreedToWhatsApp,
    canSendOtp: mobileNumber.length === 10 && agreedToWhatsApp,
    onChangeMobileNumber: (value) => {
      setMobileNumber(value.replace(/\D/g, '').slice(0, 10));
      setErrorMessage(null);
    },
    onToggleWhatsAppConsent: () => {
      setAgreedToWhatsApp((current) => !current);
      setErrorMessage(null);
    },
    onSendOtp: () => {
      if (!INDIAN_MOBILE.test(mobileNumber)) {
        setErrorMessage(t('invalidMobile'));
        return;
      }
      if (!agreedToWhatsApp) {
        setErrorMessage(t('whatsappConsentRequired'));
        return;
      }
      onOtpRequested(mobileNumber);
    },
    onCallHelpline: () => undefined,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
