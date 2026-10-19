import type { ImageSourcePropType } from 'react-native';

import type { TranslationKey } from '../localization/types';

export type CareNeed = {
  id: string;
  /** Optional illustration; letter avatar used when omitted. */
  image?: ImageSourcePropType;
  title: string;
  hint: string;
  wide?: boolean;
  /** Numeric id from CareCategories API when available. */
  careCategoryId?: number;
};

export type NearbyDoctor = {
  id: string;
  name: string;
  initials: string;
  meta: string;
  place: string;
  verified: boolean;
};

export type SearchCity = {
  id: string;
  /** Translation key when using i18n cities; omit when label comes from API. */
  nameKey?: TranslationKey;
  /** BE-009 — raw city string from FilterOptions. */
  label?: string;
};

export type DoctorConsultMode = 'video' | 'audio' | 'chat' | 'clinic';

export type DoctorAvailabilitySlot = 'now' | 'today' | 'tomorrow' | 'date';

export type DoctorFilterLanguage = 'mr' | 'en' | 'hi';

export type DoctorFilters = {
  careNeedIds: string[];
  /** BE-029 — numeric category id from CareCategories; omit when null. */
  careCategoryId?: number | null;
  modes: DoctorConsultMode[];
  availability: DoctorAvailabilitySlot[];
  customDate: string | null;
  feeMin: number;
  feeMax: number;
  languages: DoctorFilterLanguage[];
  genders: Array<'male' | 'female'>;
  recognizedQualification: boolean;
  focusCertified: boolean;
  cityIds: string[];
  useCurrentLocation: boolean;
  locationQuery: string;
};

export const FEE_RANGE_MIN = 200;
export const FEE_RANGE_MAX = 2000;

export const EMPTY_DOCTOR_FILTERS: DoctorFilters = {
  careNeedIds: [],
  careCategoryId: null,
  modes: [],
  availability: [],
  customDate: null,
  feeMin: FEE_RANGE_MIN,
  feeMax: FEE_RANGE_MAX,
  languages: [],
  genders: [],
  recognizedQualification: false,
  focusCertified: false,
  cityIds: [],
  useCurrentLocation: false,
  locationQuery: '',
};

/** Same as empty — do not pre-select video/Marathi (that hid clinic-only doctors). */
export const DEFAULT_DOCTOR_FILTERS: DoctorFilters = {
  ...EMPTY_DOCTOR_FILTERS,
};

export type DoctorSearchResult = {
  id: string;
  initials: string;
  /** Display name from API (also used as translation key for seed rows). */
  nameKey: TranslationKey;
  credentialsKey: TranslationKey;
  registrationKey?: TranslationKey;
  /** Null/omit — yearsExperience is always null per contract. */
  experienceKey?: TranslationKey | null;
  /** Null when reviewCount is 0 / averageRating null. */
  rating: string | null;
  reviewsKey: TranslationKey;
  reviewCount: number;
  /** Preformatted fee label; null → hide fee row. */
  feeLabel: string | null;
  feeKey: TranslationKey;
  fee: number | null;
  availabilityKey: TranslationKey;
  availabilitySoon: boolean;
  availabilitySlots: DoctorAvailabilitySlot[];
  /** Empty — languages not returned by API. */
  languageKeys: TranslationKey[];
  consultLanguages: DoctorFilterLanguage[];
  modes: DoctorConsultMode[];
  careNeedIds: string[];
  gender: 'male' | 'female' | null;
  cityId: string;
  recognizedQualification: boolean;
  focusCertified: boolean;
  keywords: string;
  verified: boolean;
  certifiedKey?: TranslationKey;
  sponsored?: boolean;
  photoUrl?: string | null;
};
