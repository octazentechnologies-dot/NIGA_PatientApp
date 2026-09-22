import { useState } from 'react';

import { appReleaseNotes, appVersionLabel } from '../config/release';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type AccountViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  profileName: string;
  profileInitials: string;
  profilePhone: string;
  astroEnabled: boolean;
  lowDataMode: boolean;
  languagePickerOpen: boolean;
  languageValue: string;
  appVersionLabel: string;
  appReleaseNotes: string;
  onEditProfile: () => void;
  onOpenRow: (id: string) => void;
  onToggleAstro: () => void;
  onToggleLowData: () => void;
  onOpenLanguagePicker: () => void;
  onCloseLanguagePicker: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onLogOut: () => void;
  onDeleteAccount: () => void;
};

export function useAccountController({
  onLogOut,
  onOpenHealthInsights,
  onOpenReminders,
  onOpenEditProfile,
  onOpenFamilyMembers,
  onOpenAppointments,
  onOpenPrescriptions,
  onOpenHealthRecords,
  onOpenPayments,
  onOpenConsentCentre,
  onOpenNotificationSettings,
  onOpenMyReviews,
  onOpenHelpCentre,
  onOpenBookWithHelp,
  onOpenLegalDoc,
}: {
  onLogOut: () => void;
  onOpenHealthInsights?: () => void;
  onOpenReminders?: () => void;
  onOpenEditProfile?: () => void;
  onOpenFamilyMembers?: () => void;
  onOpenAppointments?: () => void;
  onOpenPrescriptions?: () => void;
  onOpenHealthRecords?: () => void;
  onOpenPayments?: () => void;
  onOpenConsentCentre?: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenMyReviews?: () => void;
  onOpenHelpCentre?: () => void;
  onOpenBookWithHelp?: () => void;
  onOpenLegalDoc?: (doc: 'terms' | 'privacy' | 'about') => void;
} = { onLogOut: () => undefined }): AccountViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [astroEnabled, setAstroEnabled] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(true);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  return {
    language,
    t,
    profileName: 'Pranav Kulkarni',
    profileInitials: 'PK',
    profilePhone: '+91 98765 43210',
    astroEnabled,
    lowDataMode,
    languagePickerOpen,
    languageValue: language === 'mr' ? t('marathi') : t('english'),
    appVersionLabel: appVersionLabel(t('brandName'), t('byline')),
    appReleaseNotes: appReleaseNotes(),
    onEditProfile: () => onOpenEditProfile?.(),
    onOpenRow: (id) => {
      if (id === 'reviews') {
        onOpenMyReviews?.();
      }
      if (id === 'help') {
        onOpenHelpCentre?.();
      }
      if (id === 'book-help') {
        onOpenBookWithHelp?.();
      }
      if (id === 'terms') {
        onOpenLegalDoc?.('terms');
      }
      if (id === 'privacy') {
        onOpenLegalDoc?.('privacy');
      }
      if (id === 'about') {
        onOpenLegalDoc?.('about');
      }
      if (id === 'insights') {
        onOpenHealthInsights?.();
      }
      if (id === 'reminders') {
        onOpenReminders?.();
      }
      if (id === 'family') {
        onOpenFamilyMembers?.();
      }
      if (id === 'appointments') {
        onOpenAppointments?.();
      }
      if (id === 'prescriptions') {
        onOpenPrescriptions?.();
      }
      if (id === 'records') {
        onOpenHealthRecords?.();
      }
      if (id === 'receipts') {
        onOpenPayments?.();
      }
      if (id === 'consent') {
        onOpenConsentCentre?.();
      }
      if (id === 'notifications') {
        onOpenNotificationSettings?.();
      }
    },
    onToggleAstro: () => setAstroEnabled((value) => !value),
    onToggleLowData: () => setLowDataMode((value) => !value),
    onOpenLanguagePicker: () => setLanguagePickerOpen(true),
    onCloseLanguagePicker: () => setLanguagePickerOpen(false),
    onSelectLanguage: (next) => {
      setLanguage(next);
      setLanguagePickerOpen(false);
    },
    onLogOut,
    onDeleteAccount: () => undefined,
  };
}
