import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';

import type { AppLanguage, TranslationKey } from '../localization/types';
import { padTime } from './bookedAppointments';
import { CARE_CATEGORIES } from './careCategories';

export type ConsultNowNeedId = (typeof CARE_CATEGORIES)[number]['id'];

export type ConsultNowLanguage = 'mr' | 'en' | 'hi';
export type ConsultNowMode = 'video' | 'audio' | 'chat';
export type ConsultNowGender = 'male' | 'female';

export type ConsultNowNeed = {
  id: ConsultNowNeedId;
  image: ImageSourcePropType;
  titleKey: TranslationKey;
  hintKey: TranslationKey;
  wide?: boolean;
};

export const CONSULT_NOW_NEEDS: ConsultNowNeed[] = CARE_CATEGORIES.map(
  (category, index) => ({
    id: category.id,
    image: category.image,
    titleKey: category.titleKey,
    hintKey: category.hintKey,
    wide: index === CARE_CATEGORIES.length - 1 && CARE_CATEGORIES.length % 2 === 1,
  }),
);

export const CONSULT_NOW_LANGUAGES: {
  id: ConsultNowLanguage;
  labelKey: TranslationKey;
  languageOverride?: 'en' | 'mr';
}[] = [
  { id: 'mr', labelKey: 'searchLangMarathi', languageOverride: 'mr' },
  { id: 'en', labelKey: 'searchLangEnglish', languageOverride: 'en' },
  { id: 'hi', labelKey: 'searchLangHindi' },
];

export const CONSULT_NOW_MODES: {
  id: ConsultNowMode;
  icon: ComponentProps<typeof Ionicons>['name'];
  labelKey: TranslationKey;
}[] = [
  { id: 'video', icon: 'videocam-outline', labelKey: 'searchModeVideo' },
  { id: 'audio', icon: 'call-outline', labelKey: 'filterModeAudio' },
  { id: 'chat', icon: 'chatbubble-outline', labelKey: 'filterModeChat' },
];

export const CONSULT_NOW_CITIES: {
  id: string;
  nameKey: TranslationKey;
}[] = [
  { id: 'pune', nameKey: 'searchCityPune' },
  { id: 'mumbai', nameKey: 'searchCityMumbai' },
];

export const CONSULT_NOW_AVAILABLE_DOCTORS = 14;
export const CONSULT_NOW_WAIT_MIN = 4;
export const CONSULT_NOW_WAIT_MAX = 8;
export const CONSULT_NOW_FEE_RUPEES: Record<ConsultNowMode, number> = {
  video: 600,
  audio: 600,
  chat: 400,
};

export type ConsultNowOfferSeed = {
  doctorId: string;
  languages: ConsultNowLanguage[];
  gender: ConsultNowGender;
  feeRupees: number;
  rating: string;
  reviewCount: number;
  years: number;
};

export const CONSULT_NOW_OFFERS: ConsultNowOfferSeed[] = [
  {
    doctorId: 'rajesh',
    languages: ['mr', 'hi'],
    gender: 'male',
    feeRupees: 550,
    rating: '4.5',
    reviewCount: 86,
    years: 9,
  },
  {
    doctorId: 'anjali',
    languages: ['mr', 'en'],
    gender: 'female',
    feeRupees: 600,
    rating: '4.6',
    reviewCount: 212,
    years: 12,
  },
  {
    doctorId: 'sunita',
    languages: ['en', 'hi'],
    gender: 'female',
    feeRupees: 800,
    rating: '4.8',
    reviewCount: 540,
    years: 15,
  },
];

export const CONSULT_NOW_SEARCH_MS = 2800;
export const CONSULT_NOW_OFFER_SECONDS = 108;
export const CONSULT_NOW_MAX_DECLINES = 2;

export function formatConsultDigits(
  value: string | number,
  language: AppLanguage,
): string {
  const raw = String(value);
  if (language !== 'mr') {
    return raw;
  }
  return raw.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

export function formatOfferClock(seconds: number, language: AppLanguage): string {
  const safe = Math.max(0, seconds);
  return formatConsultDigits(
    `${padTime(Math.floor(safe / 60))}:${padTime(safe % 60)}`,
    language,
  );
}

export function matchingConsultNowOffers({
  languages,
  genders,
  declinedIds,
}: {
  languages: ConsultNowLanguage[];
  genders: ConsultNowGender[];
  declinedIds: string[];
}): ConsultNowOfferSeed[] {
  return CONSULT_NOW_OFFERS.filter((offer) => {
    if (declinedIds.includes(offer.doctorId)) {
      return false;
    }
    if (!offer.languages.some((item) => languages.includes(item))) {
      return false;
    }
    if (genders.length > 0 && !genders.includes(offer.gender)) {
      return false;
    }
    return true;
  });
}

export function nextWidenLanguage(
  selected: ConsultNowLanguage[],
): ConsultNowLanguage | null {
  return (['en', 'hi', 'mr'] as ConsultNowLanguage[]).find(
    (item) => !selected.includes(item),
  ) ?? null;
}
