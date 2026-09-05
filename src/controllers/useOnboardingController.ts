import { useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import { images } from '../config/images';
import { useLocalization } from '../localization/i18n';
import type { TranslationKey } from '../localization/types';

export type OnboardingSlideContent = {
  image: ImageSourcePropType;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
};

export const ONBOARDING_SLIDES: OnboardingSlideContent[] = [
  {
    image: images.onboardingSlide1,
    titleKey: 'onboardingSlide1Title',
    bodyKey: 'onboardingSlide1Body',
  },
  {
    image: images.onboardingSlide2,
    titleKey: 'onboardingSlide2Title',
    bodyKey: 'onboardingSlide2Body',
  },
  {
    image: images.onboardingSlide3,
    titleKey: 'onboardingSlide3Title',
    bodyKey: 'onboardingSlide3Body',
  },
];

export type OnboardingViewModel = {
  t: (key: TranslationKey) => string;
  slides: OnboardingSlideContent[];
  pageCount: number;
  activePageIndex: number;
  onSkip: () => void;
  onGetStarted: () => void;
  onHaveAccount: () => void;
};

export function useOnboardingController({
  onSkip,
  onFinished,
  onHaveAccount,
}: {
  onSkip: () => void;
  onFinished: () => void;
  onHaveAccount: () => void;
}): OnboardingViewModel {
  const { t } = useLocalization();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const lastIndex = ONBOARDING_SLIDES.length - 1;

  return {
    t,
    slides: ONBOARDING_SLIDES,
    pageCount: ONBOARDING_SLIDES.length,
    activePageIndex,
    onSkip,
    onGetStarted: () => {
      if (activePageIndex < lastIndex) {
        setActivePageIndex((index) => index + 1);
        return;
      }
      onFinished();
    },
    onHaveAccount,
  };
}
