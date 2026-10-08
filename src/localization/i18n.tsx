import { getLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { en } from './en';
import { mr } from './mr';
import type { AppLanguage, TranslationKey, TranslationMap } from './types';

import { getSelectedLanguage, saveSelectedLanguage } from '../services/secureStorage';

const dictionaries: Record<AppLanguage, TranslationMap> = { en, mr };

function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === 'mr' ? 'mr' : 'en';
}

type LocalizationContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(
  null,
);

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>(deviceLanguage);

  useEffect(() => {
    getSelectedLanguage()
      .then((saved) => {
        if (saved === 'en' || saved === 'mr') {
          setLanguageState(saved);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    saveSelectedLanguage(next).catch(() => undefined);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => dictionaries[language][key],
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}
