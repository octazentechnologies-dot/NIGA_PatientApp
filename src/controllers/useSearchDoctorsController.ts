import { useEffect, useMemo, useRef, useState } from 'react';

import { CARE_CATEGORIES } from '../config/careCategories';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { CareNeed, NearbyDoctor, SearchCity } from '../models/search';
import { useGetDoctorFilterOptionsQuery } from '../store/api/new/doctorsApi';
import {
  isSpeechRecognitionAvailable,
  speechRecognition,
} from '../utilities/speechRecognition';

const CARE_NEEDS: CareNeed[] = CARE_CATEGORIES.map((category, index) => ({
  id: category.id,
  image: category.image,
  titleKey: category.titleKey,
  hintKey: category.hintKey,
  wide: index === CARE_CATEGORIES.length - 1 && CARE_CATEGORIES.length % 2 === 1,
}));

/** Nearby list removed — wait for search results from Public/Doctors. */
const DOCTORS: NearbyDoctor[] = [];

const INITIAL_RECENTS: TranslationKey[] = [];

export type SearchDoctorsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  query: string;
  recents: TranslationKey[];
  careNeeds: CareNeed[];
  doctors: NearbyDoctor[];
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
  onSelectLanguage: (language: AppLanguage) => void;
  onVoiceSearch: () => void;
  onSeeAvailability: () => void;
  onOpenDoctor: (doctorId: string) => void;
  onSubmitSearch: () => void;
  onBack: () => void;
};

export function useSearchDoctorsController({
  active,
  onBack,
  onSubmitSearch,
  onOpenDoctor,
}: {
  active: boolean;
  onBack: () => void;
  onSubmitSearch: (query: string) => void;
  onOpenDoctor: (doctorId: string) => void;
}): SearchDoctorsViewModel {
  const { language, setLanguage, t } = useLocalization();
  const closingRef = useRef(false);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<TranslationKey[]>(INITIAL_RECENTS);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceErrorKey, setVoiceErrorKey] = useState<TranslationKey | null>(
    null,
  );

  const { data: filterOptions } = useGetDoctorFilterOptionsQuery(undefined, {
    skip: !active,
  });
  const cities = useMemo<SearchCity[]>(() => {
    const out: SearchCity[] = [];
    for (const city of filterOptions?.cities ?? []) {
      const label = city.trim();
      if (!label) continue;
      out.push({ id: label.toLowerCase(), label });
    }
    return out;
  }, [filterOptions?.cities]);

  useEffect(() => {
    if (!selectedCityId && cities[0]) {
      setSelectedCityId(cities[0].id);
    }
  }, [cities, selectedCityId]);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? cities[0],
    [cities, selectedCityId],
  );

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
    careNeeds: CARE_NEEDS,
    doctors: DOCTORS,
    cities,
    selectedCityId,
    selectedCityLabel: selectedCity?.label || selectedCity?.nameKey
      ? selectedCity.label || t(selectedCity.nameKey!)
      : '',
    cityPickerOpen,
    listening,
    voiceErrorKey,
    onChangeQuery: setQuery,
    onSelectRecent: (key) => setQuery(t(key)),
    onRemoveRecent: (key) =>
      setRecents((current) => current.filter((item) => item !== key)),
    onSelectCareNeed: (need) => setQuery(t(need.titleKey)),
    onOpenCityPicker: () => setCityPickerOpen(true),
    onCloseCityPicker: () => setCityPickerOpen(false),
    onSelectCity: (cityId) => {
      setSelectedCityId(cityId);
      setCityPickerOpen(false);
    },
    onSelectLanguage: setLanguage,
    onVoiceSearch,
    onSeeAvailability: () => undefined,
    onOpenDoctor,
    onSubmitSearch: () => {
      if (closingRef.current) {
        return;
      }
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      stopVoiceSearch();
      onSubmitSearch(trimmed);
    },
    onBack: () => {
      closingRef.current = true;
      stopVoiceSearch();
      onBack();
    },
  };
}
