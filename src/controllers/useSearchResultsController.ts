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
import {
  useGetDoctorFilterOptionsQuery,
  useGetDoctorsQuery,
} from '../store/api/new/doctorsApi';
import { formatMoney, resolveApiUrl } from '../utilities/formatters';

const STOP_WORDS = new Set(['in', 'or', 'the', 'a', 'an', 'dr', 'dr.', 'of']);

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
    doctor.experienceKey ? t(doctor.experienceKey) : '',
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

  if (doctor.fee != null) {
    if (doctor.fee < filters.feeMin || doctor.fee > filters.feeMax) {
      return false;
    }
  }

  // Languages / gender are not on Public/Doctors — skip client inventing them.
  // If filters request languages/genders and we have no data, do not exclude.

  if (filters.recognizedQualification && !doctor.recognizedQualification) {
    return false;
  }

  if (filters.focusCertified && !doctor.focusCertified) {
    return false;
  }

  const cityIds = filters.cityIds;
  if (cityIds.length > 0 && !cityIds.includes(doctor.cityId)) {
    return false;
  }

  return true;
}

function filterDoctors(
  query: string,
  filters: DoctorFilters,
  t: (key: TranslationKey) => string,
  sourceList: DoctorSearchResult[],
): DoctorSearchResult[] {
  return sourceList.filter(
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
  isError: boolean;
  canLoadMore: boolean;
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
  cityOptions: { id: string; label: string }[];
  qualificationOptions: { id: string; label: string }[];
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
  onRetry: () => void;
  onLoadMore: () => void;
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
  const [applied, setApplied] = useState<DoctorFilters>(DEFAULT_DOCTOR_FILTERS);
  const [draft, setDraft] = useState<DoctorFilters>(DEFAULT_DOCTOR_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [whyOrderOpen, setWhyOrderOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [accumulated, setAccumulated] = useState<DoctorSearchResult[]>([]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!active) {
      return;
    }
    setApplied(DEFAULT_DOCTOR_FILTERS);
    setDraft(DEFAULT_DOCTOR_FILTERS);
    setFiltersOpen(false);
    setWhyOrderOpen(false);
    setPageNumber(1);
    setAccumulated([]);
  }, [active, debouncedQuery, searchNonce]);

  const rerunSearch = (next: DoctorFilters) => {
    setApplied(next);
    setDraft(next);
    setFiltersOpen(false);
    setPageNumber(1);
    setAccumulated([]);
  };

  const teleOnly = applied.modes.length === 1 && applied.modes[0] === 'video';
  const cityParam =
    applied.cityIds.length === 1 ? applied.cityIds[0] : undefined;
  const feeFilterActive =
    applied.feeMin !== EMPTY_DOCTOR_FILTERS.feeMin ||
    applied.feeMax !== EMPTY_DOCTOR_FILTERS.feeMax;

  const {
    data: apiDoctors,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDoctorsQuery(
    active
      ? {
          q: debouncedQuery.trim() || undefined,
          city: cityParam,
          teleOnly: teleOnly || undefined,
          isOnline: applied.availability.includes('now') ? true : undefined,
          minFee: feeFilterActive ? applied.feeMin : undefined,
          maxFee: feeFilterActive ? applied.feeMax : undefined,
          // BE-029 — omit or send real category id only; unknown → empty list.
          careCategoryId:
            applied.careCategoryId != null && applied.careCategoryId > 0
              ? applied.careCategoryId
              : undefined,
          sortBy: 'online',
          pageNumber,
          pageSize: 20,
        }
      : undefined,
    { skip: !active },
  );

  // BE-009 — cities / qualifications for chips (not hardcoded).
  const { data: filterOptions } = useGetDoctorFilterOptionsQuery(undefined, {
    skip: !active,
  });
  const cityOptions = useMemo(
    () =>
      (filterOptions?.cities ?? []).map((city) => ({
        id: city.trim().toLowerCase(),
        label: city.trim(),
      })).filter((c) => c.label.length > 0),
    [filterOptions?.cities],
  );
  const qualificationOptions = useMemo(
    () =>
      (filterOptions?.qualifications ?? []).map((q) => ({
        id: q.trim().toLowerCase(),
        label: q.trim(),
      })).filter((q) => q.label.length > 0),
    [filterOptions?.qualifications],
  );

  const pageMapped = useMemo<DoctorSearchResult[]>(() => {
    if (!apiDoctors) {
      return [];
    }
    return apiDoctors.map((doc) => {
      const docName = (doc.displayName || '').trim() || 'Doctor';
      const initials = docName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const preferredFee =
        doc.consultFeeTele != null
          ? doc.consultFeeTele
          : doc.consultFeeInClinic;
      const feeLabel = formatMoney(preferredFee ?? null, 'INR');
      const verified = Boolean(doc.verified ?? doc.isVerified);
      const modes: DoctorConsultMode[] = [];
      if (doc.consultFeeTele != null) {
        modes.push('video');
      }
      if (doc.consultFeeInClinic != null) {
        modes.push('clinic');
      }
      return {
        id: String(doc.doctorId),
        initials: initials || 'DR',
        nameKey: docName as TranslationKey,
        credentialsKey: (doc.qualification || '') as TranslationKey,
        registrationKey: doc.registrationNumber
          ? (doc.registrationNumber as TranslationKey)
          : undefined,
        experienceKey: null,
        rating:
          doc.reviewCount > 0 && doc.averageRating != null
            ? String(doc.averageRating.toFixed(1))
            : null,
        reviewsKey: `${doc.reviewCount}` as TranslationKey,
        reviewCount: doc.reviewCount ?? 0,
        feeLabel,
        feeKey: (feeLabel ?? '') as TranslationKey,
        fee: preferredFee ?? null,
        availabilityKey: (doc.isOnline ? 'Online now' : 'Offline') as TranslationKey,
        availabilitySoon: doc.isOnline,
        availabilitySlots: doc.isOnline
          ? (['now', 'today'] as DoctorAvailabilitySlot[])
          : (['tomorrow'] as DoctorAvailabilitySlot[]),
        languageKeys: [],
        consultLanguages: [],
        modes,
        careNeedIds: [],
        gender: null,
        cityId: (doc.city || '').toLowerCase(),
        recognizedQualification: verified,
        focusCertified: verified,
        keywords:
          `${docName} ${doc.city || ''} ${doc.qualification || ''} ${doc.clinicName || ''}`.toLowerCase(),
        verified,
        photoUrl: resolveApiUrl(doc.photoUrl ?? doc.photoPath ?? null),
      };
    });
  }, [apiDoctors]);

  useEffect(() => {
    if (!pageMapped.length && pageNumber === 1) {
      setAccumulated([]);
      return;
    }
    if (pageNumber === 1) {
      setAccumulated(pageMapped);
      return;
    }
    setAccumulated((prev) => {
      const seen = new Set(prev.map((d) => d.id));
      const next = pageMapped.filter((d) => !seen.has(d.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }, [pageMapped, pageNumber]);

  const combinedDoctors = accumulated;
  const loading = isLoading || (isFetching && pageNumber === 1);
  const canLoadMore =
    Boolean(apiDoctors) && apiDoctors!.length >= 20 && !isFetching;

  const results = useMemo(
    () => filterDoctors(debouncedQuery, applied, t, combinedDoctors),
    [applied, debouncedQuery, t, combinedDoctors],
  );

  const matchingCount = useMemo(
    () => filterDoctors(debouncedQuery, draft, t, combinedDoctors).length,
    [draft, debouncedQuery, t, combinedDoctors],
  );

  const customDate = draft.customDate
    ? new Date(`${draft.customDate}T00:00:00`)
    : new Date();

  return {
    language,
    t,
    query,
    loading,
    isError,
    canLoadMore,
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
    cityOptions,
    qualificationOptions,
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
    onRetry: () => {
      void refetch();
    },
    onLoadMore: () => {
      if (!canLoadMore) return;
      setPageNumber((n) => n + 1);
    },
  };
}
