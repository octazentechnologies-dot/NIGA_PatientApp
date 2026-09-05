import { getLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { en } from './en';
import { mr } from './mr';
import type { AppLanguage, TranslationKey, TranslationMap } from './types';

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
  const [language, setLanguage] = useState<AppLanguage>(deviceLanguage);

  const t = useCallback(
    (key: TranslationKey) => dictionaries[language][key],
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t],
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
