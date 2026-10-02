import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetLanguagesQuery,
  type LanguageMaster,
} from '../store/api/new/firstLaunchApi';

export type FirstLaunchLanguage = {
  id: number;
  name: string;
  description: string;
  code: AppLanguage | null;
};

export type FirstLaunchViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  languages: FirstLaunchLanguage[];
  selectedLanguageId: number | null;
  onSelectLanguage: (id: number) => void;
  onContinue: () => void;
};

const FALLBACK: LanguageMaster[] = [
  {
    languageId: 1,
    languageName: 'English',
    description: 'English Language',
    isDeleted: false,
  },
  {
    languageId: 2,
    languageName: 'Marathi',
    description: 'Marathi Language',
    isDeleted: false,
  },
];

function appLanguageFor(name: string): AppLanguage | null {
  const key = name.trim().toLowerCase();
  if (key === 'english') {
    return 'en';
  }
  if (key === 'marathi') {
    return 'mr';
  }
  return null;
}

function toChoices(rows: LanguageMaster[]): FirstLaunchLanguage[] {
  return rows
    .filter((row) => !row.isDeleted && Number.isFinite(row.languageId))
    .map((row) => ({
      id: row.languageId,
      name: row.languageName.trim(),
      description: row.description.trim(),
      code: appLanguageFor(row.languageName),
    }));
}

export function useFirstLaunchController(
  onContinue: () => void,
): FirstLaunchViewModel {
  const { language, setLanguage, t } = useLocalization();
  const { data, isError } = useGetLanguagesQuery();
  const languages = useMemo(() => {
    const rows = !isError && Array.isArray(data) && data.length > 0 ? data : FALLBACK;
    return toChoices(rows);
  }, [data, isError]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setSelectedLanguageId((current) => {
      if (current != null && languages.some((item) => item.id === current)) {
        return current;
      }
      return (
        languages.find((item) => item.code === language)?.id ??
        languages[0]?.id ??
        null
      );
    });
  }, [languages, language]);

  return {
    language,
    t,
    languages,
    selectedLanguageId,
    onSelectLanguage: (id) => {
      const choice = languages.find((item) => item.id === id);
      if (!choice) {
        return;
      }
      setSelectedLanguageId(id);
      if (choice.code) {
        setLanguage(choice.code);
      }
    },
    onContinue,
  };
}
