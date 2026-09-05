import { useState } from 'react';

import { INDIAN_STATES } from '../config/indianStates';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type GenderOption = 'female' | 'male' | 'other';
export type PreferredLanguageOption = 'mr' | 'en' | 'hi';

export type CompleteProfileViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderOption | null;
  preferredLanguage: PreferredLanguageOption | null;
  cityTaluka: string;
  address: string;
  stateId: string | null;
  stateLabel: string;
  alternateMobile: string;
  email: string;
  referredBy: string;
  pincode: string;
  preferAudio: boolean;
  needLargeText: boolean;
  needCallAssistance: boolean;
  languagePickerOpen: boolean;
  statePickerOpen: boolean;
  datePickerOpen: boolean;
  datePickerValue: Date;
  preferredLanguageLabel: string;
  onChangeFullName: (value: string) => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onConfirmDateOfBirth: (date: Date) => void;
  onSelectGender: (value: GenderOption) => void;
  onOpenLanguagePicker: () => void;
  onCloseLanguagePicker: () => void;
  onSelectPreferredLanguage: (value: PreferredLanguageOption) => void;
  onChangeCityTaluka: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onOpenStatePicker: () => void;
  onCloseStatePicker: () => void;
  onSelectState: (stateId: string) => void;
  onChangeAlternateMobile: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeReferredBy: (value: string) => void;
  onChangePincode: (value: string) => void;
  onTogglePreferAudio: () => void;
  onToggleNeedLargeText: () => void;
  onToggleNeedCallAssistance: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
};

function parseDateOfBirth(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDateOfBirth(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function defaultBirthDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  return date;
}

export function useCompleteProfileController({
  onBack,
  onContinue,
  onSkip,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}): CompleteProfileViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [preferredLanguage, setPreferredLanguage] =
    useState<PreferredLanguageOption | null>(null);
  const [cityTaluka, setCityTaluka] = useState('');
  const [address, setAddress] = useState('');
  const [stateId, setStateId] = useState<string | null>(null);
  const [alternateMobile, setAlternateMobile] = useState('');
  const [email, setEmail] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferAudio, setPreferAudio] = useState(false);
  const [needLargeText, setNeedLargeText] = useState(false);
  const [needCallAssistance, setNeedCallAssistance] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [statePickerOpen, setStatePickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const preferredLanguageLabel =
    preferredLanguage === 'mr'
      ? t('languageNameMarathi')
      : preferredLanguage === 'en'
        ? t('languageNameEnglish')
        : preferredLanguage === 'hi'
          ? t('languageHindi')
          : '';

  const selectedState = INDIAN_STATES.find((state) => state.id === stateId);
  const stateLabel = selectedState
    ? language === 'mr'
      ? selectedState.mr
      : selectedState.en
    : '';

  return {
    language,
    t,
    fullName,
    dateOfBirth,
    gender,
    preferredLanguage,
    cityTaluka,
    address,
    stateId,
    stateLabel,
    alternateMobile,
    email,
    referredBy,
    pincode,
    preferAudio,
    needLargeText,
    needCallAssistance,
    languagePickerOpen,
    statePickerOpen,
    datePickerOpen,
    datePickerValue: parseDateOfBirth(dateOfBirth) ?? defaultBirthDate(),
    preferredLanguageLabel,
    onChangeFullName: setFullName,
    onOpenDatePicker: () => setDatePickerOpen(true),
    onCloseDatePicker: () => setDatePickerOpen(false),
    onConfirmDateOfBirth: (date) => {
      setDateOfBirth(formatDateOfBirth(date));
      setDatePickerOpen(false);
    },
    onSelectGender: setGender,
    onOpenLanguagePicker: () => setLanguagePickerOpen(true),
    onCloseLanguagePicker: () => setLanguagePickerOpen(false),
    onSelectPreferredLanguage: (value) => {
      setPreferredLanguage(value);
      setLanguagePickerOpen(false);
    },
    onChangeCityTaluka: setCityTaluka,
    onChangeAddress: setAddress,
    onOpenStatePicker: () => setStatePickerOpen(true),
    onCloseStatePicker: () => setStatePickerOpen(false),
    onSelectState: (id) => {
      setStateId(id);
      setStatePickerOpen(false);
    },
    onChangeAlternateMobile: (value) =>
      setAlternateMobile(value.replace(/\D/g, '').slice(0, 10)),
    onChangeEmail: setEmail,
    onChangeReferredBy: setReferredBy,
    onChangePincode: (value) =>
      setPincode(value.replace(/\D/g, '').slice(0, 6)),
    onTogglePreferAudio: () => setPreferAudio((current) => !current),
    onToggleNeedLargeText: () => setNeedLargeText((current) => !current),
    onToggleNeedCallAssistance: () =>
      setNeedCallAssistance((current) => !current),
    onSelectLanguage: setLanguage,
    onContinue,
    onSkip,
    onBack,
  };
}
