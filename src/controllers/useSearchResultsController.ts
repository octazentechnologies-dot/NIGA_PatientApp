import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type {
  DoctorAvailabilitySlot,
  DoctorConsultMode,
  DoctorFilterLanguage,
  DoctorFilters,
  DoctorSearchResult,
} from '../models/search';
import {
  DEFAULT_DOCTOR_FILTERS,
  EMPTY_DOCTOR_FILTERS,
} from '../models/search';

const STOP_WORDS = new Set(['in', 'or', 'the', 'a', 'an', 'dr', 'dr.', 'of']);
const CURRENT_CITY_ID = 'solapur';

const RESULTS: DoctorSearchResult[] = [
  {
    id: 'anjali',
    initials: 'AD',
    nameKey: 'searchResultAnjaliName',
    credentialsKey: 'searchResultAnjaliCredentials',
    registrationKey: 'searchResultAnjaliReg',
    experienceKey: 'searchResultAnjaliExperience',
    rating: '4.6',
    reviewsKey: 'searchResultAnjaliReviews',
    feeKey: 'searchResultAnjaliFee',
    fee: 600,
    availabilityKey: 'searchResultAnjaliWhen',
    availabilitySoon: true,
    availabilitySlots: ['now', 'today'],
    languageKeys: ['searchLangMarathi', 'searchLangEnglish'],
    consultLanguages: ['mr', 'en'],
    modes: ['video', 'clinic'],
    careNeedIds: ['skin'],
    gender: 'female',
    cityId: 'solapur',
    recognizedQualification: true,
    focusCertified: true,
    keywords: 'anjali deshmukh skin solapur eczema acne homeopathy doctor',
    verified: true,
    certifiedKey: 'searchCertifiedBanner',
  },
  {
    id: 'rajesh',
    initials: 'RP',
    nameKey: 'searchResultRajeshName',
    credentialsKey: 'searchResultRajeshCredentials',
    experienceKey: 'searchResultRajeshExperience',
    rating: '4.2',
    reviewsKey: 'searchResultRajeshReviews',
    feeKey: 'searchResultRajeshFee',
    fee: 400,
    availabilityKey: 'searchResultRajeshWhen',
    availabilitySoon: false,
    availabilitySlots: ['tomorrow'],
    languageKeys: ['searchLangMarathi', 'searchLangHindi'],
    consultLanguages: ['mr', 'hi'],
    modes: ['video'],
    careNeedIds: ['pain', 'lifestyle'],
    gender: 'male',
    cityId: 'pune',
    recognizedQualification: true,
    focusCertified: false,
    keywords: 'rajesh patil pune homeopathy doctor joints',
    verified: true,
  },
  {
    id: 'sunita',
    initials: 'SS',
    nameKey: 'searchResultSunitaName',
    credentialsKey: 'searchResultSunitaCredentials',
    experienceKey: 'searchResultSunitaExperience',
    rating: '4.8',
    reviewsKey: 'searchResultSunitaReviews',
    feeKey: 'searchResultSunitaFee',
    fee: 800,
    availabilityKey: 'searchResultSunitaWhen',
    availabilitySoon: true,
    availabilitySlots: ['now', 'today'],
    languageKeys: ['searchLangEnglish', 'searchLangHindi'],
    consultLanguages: ['en', 'hi'],
    modes: ['video'],
    careNeedIds: ['skin'],
    gender: 'female',
    cityId: 'mumbai',
    recognizedQualification: true,
    focusCertified: false,
    keywords: 'sunita sharma mumbai dermatology skin doctor',
    verified: false,
    sponsored: true,
  },
];

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function matchesQuery(
  doctor: DoctorSearchResult,
  query: string,
  t: (key: TranslationKey) => string,
): boolean {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  if (tokens.length === 0) {
    return true;
  }

  const haystack = [
    doctor.keywords,
    t(doctor.nameKey),
    t(doctor.credentialsKey),
    t(doctor.experienceKey),
    doctor.certifiedKey ? t(doctor.certifiedKey) : '',
  ]
    .join(' ')
    .toLowerCase();

  return tokens.some((token) => haystack.includes(token));
}

function matchesFilters(
  doctor: DoctorSearchResult,
  filters: DoctorFilters,
): boolean {
  if (
    filters.careNeedIds.length > 0 &&
    !filters.careNeedIds.some((id) => doctor.careNeedIds.includes(id))
  ) {
    return false;
  }

  if (
    filters.modes.length > 0 &&
    !filters.modes.some((mode) => doctor.modes.includes(mode))
  ) {
    return false;
  }

  const availability = filters.availability.filter((slot) => slot !== 'date');
  if (
    availability.length > 0 &&
    !availability.some((slot) => doctor.availabilitySlots.includes(slot))
  ) {
    return false;
  }

  if (doctor.fee < filters.feeMin || doctor.fee > filters.feeMax) {
    return false;
  }

  if (
    filters.languages.length > 0 &&
    !filters.languages.some((language) =>
      doctor.consultLanguages.includes(language),
    )
  ) {
    return false;
  }

  if (
    filters.genders.length > 0 &&
    !filters.genders.includes(doctor.gender)
  ) {
    return false;
  }

  if (filters.recognizedQualification && !doctor.recognizedQualification) {
    return false;
  }

  if (filters.focusCertified && !doctor.focusCertified) {
    return false;
  }

  const cityIds = filters.useCurrentLocation
    ? [...filters.cityIds, CURRENT_CITY_ID]
    : filters.cityIds;
  if (cityIds.length > 0 && !cityIds.includes(doctor.cityId)) {
    return false;
  }

  return true;
}

function filterDoctors(
  query: string,
  filters: DoctorFilters,
  t: (key: TranslationKey) => string,
): DoctorSearchResult[] {
  return RESULTS.filter(
    (doctor) => matchesQuery(doctor, query, t) && matchesFilters(doctor, filters),
  );
}

function countActiveFilters(filters: DoctorFilters): number {
  return (
    filters.careNeedIds.length +
    filters.modes.length +
    filters.availability.length +
    filters.languages.length +
    filters.genders.length +
    filters.cityIds.length +
    (filters.useCurrentLocation ? 1 : 0) +
    (filters.recognizedQualification ? 1 : 0) +
    (filters.focusCertified ? 1 : 0) +
    (filters.feeMin !== EMPTY_DOCTOR_FILTERS.feeMin ||
    filters.feeMax !== EMPTY_DOCTOR_FILTERS.feeMax
      ? 1
      : 0)
  );
}

export type SearchResultsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  query: string;
  loading: boolean;
  results: DoctorSearchResult[];
  filterCount: number;
  videoFilterOn: boolean;
  marathiFilterOn: boolean;
  specialtyFilterOn: boolean;
  availabilityFilterOn: boolean;
  languageFilterOn: boolean;
  whyOrderOpen: boolean;
  filtersOpen: boolean;
  filterDraft: DoctorFilters;
  matchingCount: number;
  datePickerOpen: boolean;
  customDate: Date;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenFilters: () => void;
  onCloseFilters: () => void;
  onResetFilters: () => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  onToggleCareNeed: (id: string) => void;
  onToggleMode: (mode: DoctorConsultMode) => void;
  onToggleAvailabilitySlot: (slot: DoctorAvailabilitySlot) => void;
  onChangeFeeRange: (low: number, high: number) => void;
  onToggleFilterLanguage: (language: DoctorFilterLanguage) => void;
  onToggleGender: (gender: 'male' | 'female') => void;
  onToggleRecognized: () => void;
  onToggleFocusCert: () => void;
  onChangeLocationQuery: (value: string) => void;
  onToggleCity: (cityId: string) => void;
  onToggleCurrentLocation: () => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onSelectCustomDate: (date: Date) => void;
  onOpenSort: () => void;
  onRemoveVideoFilter: () => void;
  onRemoveMarathiFilter: () => void;
  onRemoveSpecialtyFilter: () => void;
  onRemoveAvailabilityFilter: () => void;
  onRemoveLanguageFilter: () => void;
  onOpenWhyOrder: () => void;
  onCloseWhyOrder: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onBook: (doctorId: string) => void;
  onBookAssistance: () => void;
};

export function useSearchResultsController({
  query,
  active,
  searchNonce,
  onBack,
  onOpenSearch,
  onOpenDoctor,
}: {
  query: string;
  active: boolean;
  searchNonce: number;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenDoctor: (doctorId: string) => void;
}): SearchResultsViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<DoctorFilters>(DEFAULT_DOCTOR_FILTERS);
  const [draft, setDraft] = useState<DoctorFilters>(DEFAULT_DOCTOR_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [whyOrderOpen, setWhyOrderOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    setLoading(true);
    setApplied(DEFAULT_DOCTOR_FILTERS);
    setDraft(DEFAULT_DOCTOR_FILTERS);
    setFiltersOpen(false);
    setWhyOrderOpen(false);
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [active, query, searchNonce]);

  const rerunSearch = (next: DoctorFilters) => {
    setApplied(next);
    setDraft(next);
    setFiltersOpen(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  const results = useMemo(
    () => filterDoctors(query, applied, t),
    [applied, query, t],
  );

  const matchingCount = useMemo(
    () => filterDoctors(query, draft, t).length,
    [draft, query, t],
  );

  const customDate = draft.customDate
    ? new Date(`${draft.customDate}T00:00:00`)
    : new Date();

  return {
    language,
    t,
    query,
    loading,
    results,
    filterCount: countActiveFilters(applied),
    videoFilterOn: applied.modes.includes('video'),
    marathiFilterOn: applied.languages.includes('mr'),
    specialtyFilterOn: applied.careNeedIds.length > 0,
    availabilityFilterOn: applied.availability.length > 0,
    languageFilterOn: applied.languages.length > 0,
    whyOrderOpen,
    filtersOpen,
    filterDraft: draft,
    matchingCount,
    datePickerOpen,
    customDate: Number.isNaN(customDate.getTime()) ? new Date() : customDate,
    onBack,
    onOpenSearch,
    onOpenFilters: () => {
      setDraft(applied);
      setFiltersOpen(true);
    },
    onCloseFilters: () => {
      setFiltersOpen(false);
      setDatePickerOpen(false);
      setDraft(applied);
    },
    onResetFilters: () => setDraft(EMPTY_DOCTOR_FILTERS),
    onClearFilters: () => rerunSearch(EMPTY_DOCTOR_FILTERS),
    onApplyFilters: () => rerunSearch(draft),
    onToggleCareNeed: (id) =>
      setDraft((current) => ({
        ...current,
        careNeedIds: toggleValue(current.careNeedIds, id),
      })),
    onToggleMode: (mode) =>
      setDraft((current) => ({
        ...current,
        modes: toggleValue(current.modes, mode),
      })),
    onToggleAvailabilitySlot: (slot) =>
      setDraft((current) => ({
        ...current,
        availability: toggleValue(current.availability, slot),
      })),
    onChangeFeeRange: (low, high) =>
      setDraft((current) => ({ ...current, feeMin: low, feeMax: high })),
    onToggleFilterLanguage: (next) =>
      setDraft((current) => ({
        ...current,
        languages: toggleValue(current.languages, next),
      })),
    onToggleGender: (gender) =>
      setDraft((current) => ({
        ...current,
        genders: toggleValue(current.genders, gender),
      })),
    onToggleRecognized: () =>
      setDraft((current) => ({
        ...current,
        recognizedQualification: !current.recognizedQualification,
      })),
    onToggleFocusCert: () =>
      setDraft((current) => ({
        ...current,
        focusCertified: !current.focusCertified,
      })),
    onChangeLocationQuery: (value) =>
      setDraft((current) => ({ ...current, locationQuery: value })),
    onToggleCity: (cityId) =>
      setDraft((current) => ({
        ...current,
        cityIds: toggleValue(current.cityIds, cityId),
      })),
    onToggleCurrentLocation: () =>
      setDraft((current) => ({
        ...current,
        useCurrentLocation: !current.useCurrentLocation,
      })),
    onOpenDatePicker: () => setDatePickerOpen(true),
    onCloseDatePicker: () => setDatePickerOpen(false),
    onSelectCustomDate: (date) => {
      const stamp = date.toISOString().slice(0, 10);
      setDraft((current) => ({
        ...current,
        customDate: stamp,
        availability: current.availability.includes('date')
          ? current.availability
          : [...current.availability, 'date'],
      }));
      setDatePickerOpen(false);
    },
    onOpenSort: () => undefined,
    onRemoveVideoFilter: () =>
      setApplied((current) => ({
        ...current,
        modes: current.modes.filter((mode) => mode !== 'video'),
      })),
    onRemoveMarathiFilter: () =>
      setApplied((current) => ({
        ...current,
        languages: current.languages.filter((item) => item !== 'mr'),
      })),
    onRemoveSpecialtyFilter: () =>
      setApplied((current) => ({ ...current, careNeedIds: [] })),
    onRemoveAvailabilityFilter: () =>
      setApplied((current) => ({
        ...current,
        availability: [],
        customDate: null,
      })),
    onRemoveLanguageFilter: () =>
      setApplied((current) => ({ ...current, languages: [] })),
    onOpenWhyOrder: () => setWhyOrderOpen(true),
    onCloseWhyOrder: () => setWhyOrderOpen(false),
    onSelectLanguage: setLanguage,
    onBook: onOpenDoctor,
    onBookAssistance: () => undefined,
  };
}
