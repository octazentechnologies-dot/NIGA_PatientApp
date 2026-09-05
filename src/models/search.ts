import type { ImageSourcePropType } from 'react-native';

import type { TranslationKey } from '../localization/types';

export type CareNeed = {
  id: string;
  image: ImageSourcePropType;
  titleKey: TranslationKey;
  hintKey: TranslationKey;
  wide?: boolean;
};

export type NearbyDoctor = {
  id: string;
  nameKey: TranslationKey;
  initials: string;
  metaKey: TranslationKey;
  placeKey: TranslationKey;
  verified: boolean;
};

export type SearchCity = {
  id: string;
  nameKey: TranslationKey;
};

export type DoctorConsultMode = 'video' | 'audio' | 'chat' | 'clinic';

export type DoctorAvailabilitySlot = 'now' | 'today' | 'tomorrow' | 'date';

export type DoctorFilterLanguage = 'mr' | 'en' | 'hi';

export type DoctorFilters = {
  careNeedIds: string[];
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

export const DEFAULT_DOCTOR_FILTERS: DoctorFilters = {
  ...EMPTY_DOCTOR_FILTERS,
  modes: ['video'],
  languages: ['mr'],
};

export type DoctorSearchResult = {
  id: string;
  initials: string;
  nameKey: TranslationKey;
  credentialsKey: TranslationKey;
  registrationKey?: TranslationKey;
  experienceKey: TranslationKey;
  rating: string;
  reviewsKey: TranslationKey;
  feeKey: TranslationKey;
  fee: number;
  availabilityKey: TranslationKey;
  availabilitySoon: boolean;
  availabilitySlots: DoctorAvailabilitySlot[];
  languageKeys: TranslationKey[];
  consultLanguages: DoctorFilterLanguage[];
  modes: DoctorConsultMode[];
  careNeedIds: string[];
  gender: 'male' | 'female';
  cityId: string;
  recognizedQualification: boolean;
  focusCertified: boolean;
  keywords: string;
  verified: boolean;
  certifiedKey?: TranslationKey;
  sponsored?: boolean;
};
