import type { ImageSourcePropType } from 'react-native';

import type { TranslationKey } from '../localization/types';
import { images } from './images';

export type CareCategory = {
  id: string;
  image: ImageSourcePropType;
  homeLabelKey: TranslationKey;
  titleKey: TranslationKey;
  hintKey: TranslationKey;
};

export const CARE_CATEGORIES: CareCategory[] = [
  {
    id: 'skin',
    image: images.categorySkin,
    homeLabelKey: 'homeCatSkin',
    titleKey: 'searchCareSkin',
    hintKey: 'searchCareSkinHint',
  },
  {
    id: 'allergy',
    image: images.categoryAllergy,
    homeLabelKey: 'homeCatAllergy',
    titleKey: 'searchCareAllergy',
    hintKey: 'searchCareAllergyHint',
  },
  {
    id: 'digestive',
    image: images.categoryDigestion,
    homeLabelKey: 'homeCatDigestion',
    titleKey: 'searchCareDigestive',
    hintKey: 'searchCareDigestiveHint',
  },
  {
    id: 'women',
    image: images.categoryWomensHealth,
    homeLabelKey: 'homeCatWomensHealth',
    titleKey: 'searchCareWomen',
    hintKey: 'searchCareWomenHint',
  },
  {
    id: 'child',
    image: images.categoryChildCare,
    homeLabelKey: 'homeCatChildCare',
    titleKey: 'searchCareChild',
    hintKey: 'searchCareChildHint',
  },
];
