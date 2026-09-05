import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type FirstLaunchViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  onSelectLanguage: (language: AppLanguage) => void;
  onContinue: () => void;
};

export function useFirstLaunchController(
  onContinue: () => void,
): FirstLaunchViewModel {
  const { language, setLanguage, t } = useLocalization();

  return {
    language,
    t,
    onSelectLanguage: setLanguage,
    onContinue,
  };
}
