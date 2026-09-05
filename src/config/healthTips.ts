import type { ImageSourcePropType } from 'react-native';

import type { TranslationKey } from '../localization/types';
import { images } from './images';

export type HealthTipBlock =
  | { type: 'heading'; key: TranslationKey }
  | { type: 'paragraph'; key: TranslationKey }
  | { type: 'quote'; key: TranslationKey }
  | { type: 'checks'; keys: TranslationKey[] };

export type HealthTipSeed = {
  id: string;
  hero: ImageSourcePropType;
  categoryKey: TranslationKey;
  searchQueryKey: TranslationKey;
  readMins: number;
  titleKey: TranslationKey;
  excerptKey: TranslationKey;
  authorNameKey: TranslationKey;
  authorCredsKey: TranslationKey;
  reviewerKey: TranslationKey;
  publishedKey: TranslationKey;
  reviewNotesKey: TranslationKey;
  findDoctorKey: TranslationKey;
  body: HealthTipBlock[];
  careTipKeys: TranslationKey[];
  relatedIds: string[];
};

export const HEALTH_TIPS: HealthTipSeed[] = [
  {
    id: 'eczema-children',
    hero: images.healthTipHero,
    categoryKey: 'searchCareSkin',
    searchQueryKey: 'searchCareSkin',
    readMins: 5,
    titleKey: 'tipEczemaTitle',
    excerptKey: 'tipEczemaExcerpt',
    authorNameKey: 'searchResultAnjaliName',
    authorCredsKey: 'tipEczemaAuthorCreds',
    reviewerKey: 'tipEczemaReviewer',
    publishedKey: 'tipEczemaPublished',
    reviewNotesKey: 'tipEczemaReviewNotes',
    findDoctorKey: 'tipFindSkinDoctor',
    body: [
      { type: 'heading', key: 'tipEczemaH1' },
      { type: 'paragraph', key: 'tipEczemaP1' },
      { type: 'quote', key: 'tipEczemaQuote' },
      {
        type: 'checks',
        keys: ['tipEczemaCheck1', 'tipEczemaCheck2', 'tipEczemaCheck3'],
      },
      { type: 'heading', key: 'tipEczemaH2' },
      { type: 'paragraph', key: 'tipEczemaP2' },
    ],
    careTipKeys: ['tipEczemaCare1', 'tipEczemaCare2', 'tipEczemaCare3', 'tipEczemaCare4'],
    relatedIds: ['childhood-allergies', 'immunity-homeopathy'],
  },
  {
    id: 'childhood-allergies',
    hero: images.categoryAllergy,
    categoryKey: 'tipCatRespiratory',
    searchQueryKey: 'searchCareAllergy',
    readMins: 4,
    titleKey: 'tipAllergyTitle',
    excerptKey: 'tipAllergyExcerpt',
    authorNameKey: 'searchResultAnjaliName',
    authorCredsKey: 'tipEczemaAuthorCreds',
    reviewerKey: 'tipEczemaReviewer',
    publishedKey: 'tipAllergyPublished',
    reviewNotesKey: 'tipAllergyReviewNotes',
    findDoctorKey: 'tipFindAllergyDoctor',
    body: [
      { type: 'heading', key: 'tipAllergyH1' },
      { type: 'paragraph', key: 'tipAllergyP1' },
      { type: 'quote', key: 'tipAllergyQuote' },
      { type: 'heading', key: 'tipAllergyH2' },
      { type: 'paragraph', key: 'tipAllergyP2' },
    ],
    careTipKeys: ['tipAllergyCare1', 'tipAllergyCare2', 'tipAllergyCare3'],
    relatedIds: ['eczema-children', 'immunity-homeopathy'],
  },
  {
    id: 'immunity-homeopathy',
    hero: images.categoryChildCare,
    categoryKey: 'tipCatWellness',
    searchQueryKey: 'searchCareLifestyle',
    readMins: 4,
    titleKey: 'homeTipTitle',
    excerptKey: 'homeTipExcerpt',
    authorNameKey: 'searchResultAnjaliName',
    authorCredsKey: 'tipEczemaAuthorCreds',
    reviewerKey: 'tipImmunityReviewer',
    publishedKey: 'tipImmunityPublished',
    reviewNotesKey: 'tipImmunityReviewNotes',
    findDoctorKey: 'tipFindLifestyleDoctor',
    body: [
      { type: 'heading', key: 'tipImmunityH1' },
      { type: 'paragraph', key: 'tipImmunityP1' },
      { type: 'quote', key: 'tipImmunityQuote' },
      { type: 'paragraph', key: 'tipImmunityP2' },
    ],
    careTipKeys: ['tipImmunityCare1', 'tipImmunityCare2', 'tipImmunityCare3'],
    relatedIds: ['eczema-children', 'childhood-allergies'],
  },
];

export const HOME_HEALTH_TIP_IDS = [
  'eczema-children',
  'childhood-allergies',
  'immunity-homeopathy',
] as const;

export function getHealthTip(id: string): HealthTipSeed {
  return HEALTH_TIPS.find((tip) => tip.id === id) ?? HEALTH_TIPS[0];
}

export function getHomeHealthTips(): HealthTipSeed[] {
  return HOME_HEALTH_TIP_IDS.map((id) => getHealthTip(id));
}
