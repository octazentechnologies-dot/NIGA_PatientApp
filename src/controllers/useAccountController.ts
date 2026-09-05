import { useState } from 'react';

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
}: {
  onLogOut: () => void;
}): AccountViewModel {
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
    appVersionLabel: `${t('brandName')} v1.0.0 • ${t('byline')}`,
    onEditProfile: () => undefined,
    onOpenRow: () => undefined,
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
