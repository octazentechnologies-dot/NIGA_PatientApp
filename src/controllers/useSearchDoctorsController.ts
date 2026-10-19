import { useEffect, useMemo, useRef, useState } from 'react';

import { CARE_CATEGORIES } from '../config/careCategories';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { CareNeed, NearbyDoctor, SearchCity } from '../models/search';
import {
  useGetDoctorFilterOptionsQuery,
  useGetDoctorsQuery,
} from '../store/api/new/doctorsApi';
import { useGetCareCategoriesQuery } from '../store/api/new/homeApi';
import { useAppSelector } from '../store/hooks';
import {
  isSpeechRecognitionAvailable,
  speechRecognition,
} from '../utilities/speechRecognition';

const INITIAL_RECENTS: TranslationKey[] = [];

export type SearchDoctorsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  query: string;
  recents: TranslationKey[];
  careNeeds: CareNeed[];
  doctors: NearbyDoctor[];
  doctorsLoading: boolean;
  cities: SearchCity[];
  selectedCityId: string;
  selectedCityLabel: string;
  cityPickerOpen: boolean;
  listening: boolean;
  voiceErrorKey: TranslationKey | null;
  onChangeQuery: (value: string) => void;
  onSelectRecent: (key: TranslationKey) => void;
  onRemoveRecent: (key: TranslationKey) => void;
  onSelectCareNeed: (need: CareNeed) => void;
  onOpenCityPicker: () => void;
  onCloseCityPicker: () => void;
  onSelectCity: (cityId: string) => void;
  onVoiceSearch: () => void;
  onSeeAvailability: () => void;
  onOpenDoctor: (doctorId: string) => void;
  onSubmitSearch: () => void;
  onBack: () => void;
};

function initialsFromName(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function useSearchDoctorsController({
  active,
  onBack,
  onSubmitSearch,
  onOpenDoctor,
  onSeeAvailability,
}: {
  active: boolean;
  onBack: () => void;
  onSubmitSearch: (params: {
    q?: string;
    city?: string;
    careCategoryId?: number;
  }) => void;
  onOpenDoctor: (doctorId: string) => void;
  onSeeAvailability: () => void;
}): SearchDoctorsViewModel {
  const { language, t } = useLocalization();
  const detectedLocation = useAppSelector((s) => s.auth.detectedLocation);
  const closingRef = useRef(false);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<TranslationKey[]>(INITIAL_RECENTS);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceErrorKey, setVoiceErrorKey] = useState<TranslationKey | null>(
    null,
  );
  const locationSeededRef = useRef(false);

  const { data: filterOptions } = useGetDoctorFilterOptionsQuery(undefined, {
    skip: !active,
  });
  const { data: careCategoriesResponse } = useGetCareCategoriesQuery(undefined, {
    skip: !active,
  });

  const cities = useMemo<SearchCity[]>(() => {
    const out: SearchCity[] = [];
    const seen = new Set<string>();
    for (const city of filterOptions?.cities ?? []) {
      const label = city.trim();
      if (!label) continue;
      const id = label.toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, label });
    }
    const detectedCity = detectedLocation?.city?.trim();
    if (detectedCity) {
      const id = detectedCity.toLowerCase();
      if (!seen.has(id)) {
        out.unshift({ id, label: detectedCity });
      }
    }
    return out;
  }, [detectedLocation?.city, filterOptions?.cities]);

  useEffect(() => {
    if (locationSeededRef.current && selectedCityId) {
      return;
    }
    const detectedCity = detectedLocation?.city?.trim();
    if (detectedCity && cities.length > 0) {
      const match =
        cities.find(
          (c) =>
            (c.label || '').toLowerCase() === detectedCity.toLowerCase(),
        ) ??
        cities.find((c) =>
          (c.label || '').toLowerCase().includes(detectedCity.toLowerCase()),
        ) ??
        cities.find((c) =>
          detectedCity.toLowerCase().includes((c.label || '').toLowerCase()),
        );
      if (match) {
        setSelectedCityId(match.id);
        locationSeededRef.current = true;
        return;
      }
    }
    if (!selectedCityId && cities[0]) {
      setSelectedCityId(cities[0].id);
    }
  }, [cities, detectedLocation?.city, selectedCityId]);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? cities[0],
    [cities, selectedCityId],
  );

  const selectedCityLabel = selectedCity?.label?.trim() || '';

  const {
    data: nearbyDoctorsRaw = [],
    isLoading: doctorsLoading,
    isFetching: doctorsFetching,
  } = useGetDoctorsQuery(
    {
      city: selectedCityLabel || undefined,
      pageNumber: 1,
      pageSize: 5,
    },
    { skip: !active || !selectedCityLabel },
  );

  const doctors = useMemo<NearbyDoctor[]>(() => {
    return nearbyDoctorsRaw.slice(0, 5).map((doc) => {
      const name = (doc.displayName || '').trim() || 'Doctor';
      const meta = [doc.qualification, doc.clinicName]
        .map((part) => (part || '').trim())
        .filter(Boolean)
        .join(' · ');
      const place = (doc.city || selectedCityLabel || '').trim();
      return {
        id: String(doc.doctorId),
        name,
        initials: initialsFromName(name),
        meta,
        place,
        verified: Boolean(doc.verified ?? doc.isVerified),
      };
    });
  }, [nearbyDoctorsRaw, selectedCityLabel]);

  const careNeeds = useMemo((): CareNeed[] => {
    const rows = careCategoriesResponse?.data;
    if (Array.isArray(rows) && rows.length > 0) {
      const mapped: CareNeed[] = [];
      rows.forEach((row, index) => {
        const title = (row.name || '').trim();
        if (!title) return;
        const fallback = CARE_CATEGORIES[index % CARE_CATEGORIES.length];
        mapped.push({
          id: String(row.id),
          careCategoryId: row.id,
          image: fallback?.image,
          title,
          hint: (row.description || '').trim(),
          wide: index === rows.length - 1 && rows.length % 2 === 1,
        });
      });
      return mapped;
    }
    return CARE_CATEGORIES.map((category, index) => ({
      id: category.id,
      image: category.image,
      title: t(category.titleKey),
      hint: t(category.hintKey),
      wide:
        index === CARE_CATEGORIES.length - 1 &&
        CARE_CATEGORIES.length % 2 === 1,
    }));
  }, [careCategoriesResponse?.data, t]);

  useEffect(() => {
    if (active) {
      closingRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (!speechRecognition) {
      return undefined;
    }

    const startSub = speechRecognition.addListener('start', () => {
      setListening(true);
      setVoiceErrorKey(null);
    });
    const endSub = speechRecognition.addListener('end', () => {
      setListening(false);
    });
    const resultSub = speechRecognition.addListener('result', (event) => {
      const text = event.results?.[0]?.transcript?.trim();
      if (text) {
        setQuery(text);
      }
    });
    const errorSub = speechRecognition.addListener('error', (event) => {
      setListening(false);
      if (
        event.error === 'aborted' ||
        event.error === 'no-speech' ||
        event.error === 'speech-timeout'
      ) {
        return;
      }
      if (event.error === 'not-allowed') {
        setVoiceErrorKey('searchVoicePermissionDenied');
        return;
      }
      if (event.error === 'language-not-supported') {
        setVoiceErrorKey('searchVoiceLanguageUnsupported');
        return;
      }
      setVoiceErrorKey('searchVoiceUnavailable');
    });

    return () => {
      startSub.remove();
      endSub.remove();
      resultSub.remove();
      errorSub.remove();
      stopVoiceSearch();
    };
  }, []);

  const stopVoiceSearch = () => {
    try {
      speechRecognition?.abort();
    } catch {
      setListening(false);
    }
  };

  const onVoiceSearch = async () => {
    if (!speechRecognition || !isSpeechRecognitionAvailable()) {
      setVoiceErrorKey('searchVoiceUnavailable');
      return;
    }

    if (listening) {
      try {
        speechRecognition.stop();
      } catch {
        setListening(false);
      }
      return;
    }

    setVoiceErrorKey(null);

    try {
      const permission = await speechRecognition.requestPermissionsAsync();
      if (!permission.granted) {
        setVoiceErrorKey('searchVoicePermissionDenied');
        return;
      }

      setListening(true);
      speechRecognition.start({
        lang: language === 'mr' ? 'mr-IN' : 'en-IN',
        interimResults: true,
        continuous: false,
        iosTaskHint: 'search',
      });
    } catch {
      setVoiceErrorKey('searchVoiceUnavailable');
      setListening(false);
    }
  };

  return {
    language,
    t,
    query,
    recents,
    careNeeds,
    doctors,
    doctorsLoading:
      Boolean(selectedCityLabel) && (doctorsLoading || doctorsFetching),
    cities,
    selectedCityId,
    selectedCityLabel,
    cityPickerOpen,
    listening,
    voiceErrorKey,
    onChangeQuery: setQuery,
    onSelectRecent: (key) => setQuery(t(key)),
    onRemoveRecent: (key) =>
      setRecents((current) => current.filter((item) => item !== key)),
    onSelectCareNeed: (need) => {
      const title = need.title.trim();
      if (!title || closingRef.current) return;
      stopVoiceSearch();
      setQuery(title);
      onSubmitSearch({
        q: title,
        careCategoryId: need.careCategoryId,
        city: selectedCityLabel || undefined,
      });
    },
    onOpenCityPicker: () => setCityPickerOpen(true),
    onCloseCityPicker: () => setCityPickerOpen(false),
    onSelectCity: (cityId) => {
      const city = cities.find((c) => c.id === cityId);
      const label = city?.label?.trim() || '';
      setSelectedCityId(cityId);
      setCityPickerOpen(false);
      if (!label || closingRef.current) {
        return;
      }
      stopVoiceSearch();
      onSubmitSearch({
        q: query.trim() || undefined,
        city: label,
      });
    },
    onVoiceSearch,
    onSeeAvailability,
    onOpenDoctor,
    onSubmitSearch: () => {
      if (closingRef.current) {
        return;
      }
      const trimmed = query.trim();
      if (!trimmed && !selectedCityLabel) {
        return;
      }
      stopVoiceSearch();
      onSubmitSearch({
        q: trimmed || undefined,
        city: selectedCityLabel || undefined,
      });
    },
    onBack: () => {
      closingRef.current = true;
      stopVoiceSearch();
      onBack();
    },
  };
}
