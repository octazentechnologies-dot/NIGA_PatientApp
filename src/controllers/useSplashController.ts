import { useEffect } from 'react';

import { useLocalization } from '../localization/i18n';

export const SPLASH_DURATION_MS = 2800;

export type SplashViewModel = {
  brandName: string;
  tagline: string;
  loadingEnglish: string;
  loadingMarathi: string;
};

export function useSplashController(onFinished: () => void): SplashViewModel {
  const { t } = useLocalization();

  useEffect(() => {
    const timer = setTimeout(onFinished, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return {
    brandName: t('brandName'),
    tagline: t('tagline'),
    loadingEnglish: t('splashLoadingEn'),
    loadingMarathi: t('splashLoadingMr'),
  };
}
