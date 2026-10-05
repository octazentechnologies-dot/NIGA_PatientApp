import { useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetCitiesByDistrictQuery,
  useGetCountriesQuery,
  useGetDistrictsByStateQuery,
  useGetStatesByCountryQuery,
} from '../store/api/new/completeProfileApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  type DetectedGeoLocation,
  setDetectedLocation,
} from '../store/slices/authSlice';

function normalizeLocationString(val: string | null | undefined): string {
  if (!val) {
    return '';
  }
  return val
    .toLowerCase()
    .replace(/\b(state|province|district|division|city|region|of)\b/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

function isLocationMatch(
  apiName: string | null | undefined,
  detectedName: string | null | undefined,
): boolean {
  if (!apiName || !detectedName) {
    return false;
  }
  const normApi = normalizeLocationString(apiName);
  const normDet = normalizeLocationString(detectedName);
  if (!normApi || !normDet) {
    return false;
  }
  if (normApi === normDet) {
    return true;
  }
  if (normApi.length >= 4 && normDet.length >= 4) {
    if (normApi.includes(normDet) || normDet.includes(normApi)) {
      return true;
    }
  }
  return false;
}

export type GenderOption = 'female' | 'male' | 'other';
export type PreferredLanguageOption = 'mr' | 'en' | 'hi';

export type CompleteProfileViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  mode: 'onboarding' | 'edit';
  screenTitle: string;
  primaryActionLabel: string;
  showSkip: boolean;
  mobileNumber: string;
  countryCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderOption | null;
  preferredLanguage: PreferredLanguageOption | null;
  cityTaluka: string;
  address: string;
  stateId: string | null;
  selectedCountryId: number | null;
  countryLabel: string;
  selectedStateId: number | null;
  stateLabel: string;
  selectedDistrictId: number | null;
  districtLabel: string;
  selectedCityId: number | null;
  cityLabel: string;
  countries: { id: number; name: string }[];
  states: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  cities: { id: number; name: string }[];
  isCountriesLoading: boolean;
  isStatesLoading: boolean;
  isDistrictsLoading: boolean;
  isCitiesLoading: boolean;
  canSelectState: boolean;
  canSelectDistrict: boolean;
  canSelectCity: boolean;
  countryPickerOpen: boolean;
  statePickerOpen: boolean;
  districtPickerOpen: boolean;
  cityPickerOpen: boolean;
  email: string;
  referredBy: string;
  pincode: string;
  preferAudio: boolean;
  needLargeText: boolean;
  needCallAssistance: boolean;
  languagePickerOpen: boolean;
  datePickerOpen: boolean;
  datePickerValue: Date;
  preferredLanguageLabel: string;
  onChangeFullName: (value: string) => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onConfirmDateOfBirth: (date: Date) => void;
  onSelectGender: (value: GenderOption) => void;
  onOpenLanguagePicker: () => void;
  onCloseLanguagePicker: () => void;
  onSelectPreferredLanguage: (value: PreferredLanguageOption) => void;
  onOpenCountryPicker: () => void;
  onCloseCountryPicker: () => void;
  onSelectCountry: (countryId: number) => void;
  onOpenStatePicker: () => void;
  onCloseStatePicker: () => void;
  onSelectState: (stateId: number) => void;
  onOpenDistrictPicker: () => void;
  onCloseDistrictPicker: () => void;
  onSelectDistrict: (districtId: number) => void;
  onOpenCityPicker: () => void;
  onCloseCityPicker: () => void;
  onSelectCity: (cityId: number) => void;
  onChangeCityTaluka: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeReferredBy: (value: string) => void;
  onChangePincode: (value: string) => void;
  onTogglePreferAudio: () => void;
  onToggleNeedLargeText: () => void;
  onToggleNeedCallAssistance: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
};

function parseDateOfBirth(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDateOfBirth(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function defaultBirthDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  return date;
}

export function useCompleteProfileController({
  onBack,
  onContinue,
  onSkip,
  mode = 'onboarding',
  initialMobileNumber,
  initialCountryCode,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  mode?: 'onboarding' | 'edit';
  initialMobileNumber?: string;
  initialCountryCode?: string;
}): CompleteProfileViewModel {
  const { language, setLanguage, t } = useLocalization();
  const dispatch = useAppDispatch();
  const reduxMobile = useAppSelector((state) => state.auth.mobile);
  const reduxCountryCode = useAppSelector((state) => state.auth.countryCode);
  const reduxDetectedLocation = useAppSelector(
    (state) => state.auth.detectedLocation,
  );

  const isEdit = mode === 'edit';
  const resolvedMobileNumber =
    (initialMobileNumber && initialMobileNumber.trim().length > 0
      ? initialMobileNumber.trim()
      : reduxMobile?.trim()) ||
    (isEdit ? '9028898963' : '');

  const resolvedCountryCode =
    (initialCountryCode && initialCountryCode.trim().length > 0
      ? initialCountryCode.trim()
      : reduxCountryCode?.trim()) || '+91';

  const [mobileNumber, setMobileNumber] = useState(resolvedMobileNumber);
  const [countryCode, setCountryCode] = useState(resolvedCountryCode);

  useEffect(() => {
    if (resolvedMobileNumber) {
      setMobileNumber(resolvedMobileNumber);
    }
  }, [resolvedMobileNumber]);

  useEffect(() => {
    if (resolvedCountryCode) {
      setCountryCode(resolvedCountryCode);
    }
  }, [resolvedCountryCode]);
  const [fullName, setFullName] = useState(isEdit ? 'Pranav Kulkarni' : '');
  const [dateOfBirth, setDateOfBirth] = useState(isEdit ? '14/03/1992' : '');
  const [gender, setGender] = useState<GenderOption | null>(isEdit ? 'male' : null);
  const [preferredLanguage, setPreferredLanguage] =
    useState<PreferredLanguageOption | null>(isEdit ? 'en' : null);
  const [cityTaluka, setCityTaluka] = useState(isEdit ? 'Pune' : '');
  const [address, setAddress] = useState(isEdit ? 'Kothrud, Pune' : '');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  const [detectedGeoLocation, setDetectedGeoLocation] =
    useState<DetectedGeoLocation | null>(reduxDetectedLocation ?? null);

  const hasAttemptedLocationRef = useRef(false);
  const userSelectedCountryRef = useRef(false);
  const userSelectedStateRef = useRef(false);
  const userSelectedDistrictRef = useRef(false);
  const userSelectedCityRef = useRef(false);
  const autoFilledCountryRef = useRef(false);
  const autoFilledStateRef = useRef(false);
  const autoFilledDistrictRef = useRef(false);
  const autoFilledCityRef = useRef(false);

  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [statePickerOpen, setStatePickerOpen] = useState(false);
  const [districtPickerOpen, setDistrictPickerOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  const { data: countriesResponse, isLoading: isCountriesLoading } =
    useGetCountriesQuery();
  const countries = useMemo(
    () =>
      (countriesResponse?.data ?? []).map((c) => ({
        id: c.countryId,
        name: c.countryName ?? '',
      })),
    [countriesResponse],
  );

  const { data: statesResponse, isLoading: isStatesLoading } =
    useGetStatesByCountryQuery(selectedCountryId as number, {
      skip: !selectedCountryId,
    });
  const states = useMemo(
    () =>
      (statesResponse?.data ?? []).map((s) => ({
        id: s.stateId,
        name: s.stateName ?? '',
      })),
    [statesResponse],
  );

  const { data: districtsResponse, isLoading: isDistrictsLoading } =
    useGetDistrictsByStateQuery(selectedStateId as number, {
      skip: !selectedStateId,
    });
  const districts = useMemo(
    () =>
      (districtsResponse?.data ?? []).map((d) => ({
        id: d.districtId,
        name: d.districtName ?? '',
      })),
    [districtsResponse],
  );

  const { data: citiesResponse, isLoading: isCitiesLoading } =
    useGetCitiesByDistrictQuery(selectedDistrictId as number, {
      skip: !selectedDistrictId,
    });
  const cities = useMemo(
    () =>
      (citiesResponse?.data ?? []).map((c) => ({
        id: c.cityId,
        name: c.cityName ?? '',
      })),
    [citiesResponse],
  );

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);
  const countryLabel = selectedCountry?.name ?? '';

  const selectedState = states.find((s) => s.id === selectedStateId);
  const stateLabel = selectedState?.name ?? '';

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);
  const districtLabel = selectedDistrict?.name ?? '';

  const selectedCity = cities.find((c) => c.id === selectedCityId);
  const cityLabel = selectedCity?.name ?? '';

  const canSelectState = Boolean(selectedCountryId);
  const canSelectDistrict = Boolean(selectedStateId);
  const canSelectCity = Boolean(selectedDistrictId);

  // Safe background device location detection or reuse
  useEffect(() => {
    // If location was already detected during Login, reuse it directly!
    if (reduxDetectedLocation) {
      setDetectedGeoLocation(reduxDetectedLocation);
      return;
    }

    if (hasAttemptedLocationRef.current) {
      return;
    }
    hasAttemptedLocationRef.current = true;

    let isMounted = true;

    async function detectDeviceLocation() {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const res = await Location.requestForegroundPermissionsAsync();
          status = res.status;
        }
        if (status !== 'granted' || !isMounted) {
          return;
        }

        let position = await Location.getLastKnownPositionAsync({});
        if (!position) {
          position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
        if (!isMounted || !position) {
          return;
        }

        const addresses = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (!isMounted || !addresses || addresses.length === 0) {
          return;
        }

        const address = addresses[0];
        const detected: DetectedGeoLocation = {
          countryName: address.country ?? null,
          isoCountryCode: address.isoCountryCode ?? null,
          region: address.region ?? null,
          subregion: address.subregion ?? null,
          district: address.district ?? null,
          city: address.city ?? null,
        };
        setDetectedGeoLocation(detected);
        dispatch(setDetectedLocation(detected));
      } catch {
        // Fallback gracefully without blocking UI or logging sensitive location data
      }
    }

    void detectDeviceLocation();

    return () => {
      isMounted = false;
    };
  }, [dispatch, reduxDetectedLocation]);

  // 1. Auto-match Country when Countries API returns and detectedGeoLocation is available
  useEffect(() => {
    if (
      !detectedGeoLocation ||
      autoFilledCountryRef.current ||
      userSelectedCountryRef.current ||
      selectedCountryId !== null ||
      !countriesResponse?.data ||
      countriesResponse.data.length === 0
    ) {
      return;
    }

    const detectedIso = detectedGeoLocation.isoCountryCode?.trim().toUpperCase();
    const detectedName = detectedGeoLocation.countryName?.trim().toLowerCase();

    const matchedCountry = countriesResponse.data.find((c) => {
      if (detectedIso) {
        if (
          c.iso2Code?.trim().toUpperCase() === detectedIso ||
          c.iso3Code?.trim().toUpperCase() === detectedIso
        ) {
          return true;
        }
      }
      if (detectedName && c.countryName?.trim().toLowerCase() === detectedName) {
        return true;
      }
      return isLocationMatch(c.countryName, detectedGeoLocation.countryName);
    });

    if (matchedCountry) {
      autoFilledCountryRef.current = true;
      setSelectedCountryId(matchedCountry.countryId);
    }
  }, [countriesResponse, detectedGeoLocation, selectedCountryId]);

  // 2. Auto-match State when States API returns and country was auto-filled
  useEffect(() => {
    if (
      !detectedGeoLocation?.region ||
      !autoFilledCountryRef.current ||
      autoFilledStateRef.current ||
      userSelectedStateRef.current ||
      selectedStateId !== null ||
      !selectedCountryId ||
      !statesResponse?.data ||
      statesResponse.data.length === 0
    ) {
      return;
    }

    const detectedRegion = detectedGeoLocation.region?.trim().toLowerCase();

    const matchedState = statesResponse.data.find((s) => {
      if (detectedRegion && s.stateName?.trim().toLowerCase() === detectedRegion) {
        return true;
      }
      return isLocationMatch(s.stateName, detectedGeoLocation.region);
    });

    if (matchedState) {
      autoFilledStateRef.current = true;
      setSelectedStateId(matchedState.stateId);
    }
  }, [detectedGeoLocation, selectedCountryId, selectedStateId, statesResponse]);

  // 3. Auto-match District when Districts API returns and state was auto-filled
  useEffect(() => {
    if (
      !detectedGeoLocation ||
      !autoFilledStateRef.current ||
      autoFilledDistrictRef.current ||
      userSelectedDistrictRef.current ||
      selectedDistrictId !== null ||
      !selectedStateId ||
      !districtsResponse?.data ||
      districtsResponse.data.length === 0
    ) {
      return;
    }

    const detDistrict = detectedGeoLocation.district?.trim().toLowerCase();
    const detSubregion = detectedGeoLocation.subregion?.trim().toLowerCase();
    const detCity = detectedGeoLocation.city?.trim().toLowerCase();

    const matchedDistrict = districtsResponse.data.find((d) => {
      const apiName = d.districtName?.trim().toLowerCase();
      if (detDistrict && apiName === detDistrict) return true;
      if (detSubregion && apiName === detSubregion) return true;
      if (detCity && apiName === detCity) return true;
      return (
        isLocationMatch(d.districtName, detectedGeoLocation.district) ||
        isLocationMatch(d.districtName, detectedGeoLocation.subregion) ||
        isLocationMatch(d.districtName, detectedGeoLocation.city)
      );
    });

    if (matchedDistrict) {
      autoFilledDistrictRef.current = true;
      setSelectedDistrictId(matchedDistrict.districtId);
    }
  }, [
    detectedGeoLocation,
    districtsResponse,
    selectedDistrictId,
    selectedStateId,
  ]);

  // 4. Auto-match City when Cities API returns and district was auto-filled
  useEffect(() => {
    if (
      !detectedGeoLocation?.city ||
      !autoFilledDistrictRef.current ||
      autoFilledCityRef.current ||
      userSelectedCityRef.current ||
      selectedCityId !== null ||
      !selectedDistrictId ||
      !citiesResponse?.data ||
      citiesResponse.data.length === 0
    ) {
      return;
    }

    const detCity = detectedGeoLocation.city?.trim().toLowerCase();

    const matchedCity = citiesResponse.data.find((c) => {
      if (detCity && c.cityName?.trim().toLowerCase() === detCity) {
        return true;
      }
      return isLocationMatch(c.cityName, detectedGeoLocation.city);
    });

    if (matchedCity) {
      autoFilledCityRef.current = true;
      setSelectedCityId(matchedCity.cityId);
    }
  }, [citiesResponse, detectedGeoLocation, selectedCityId, selectedDistrictId]);

  const [email, setEmail] = useState(isEdit ? 'pranav@example.com' : '');
  const [referredBy, setReferredBy] = useState(isEdit ? '' : '');
  const [pincode, setPincode] = useState(isEdit ? '411038' : '');
  const [preferAudio, setPreferAudio] = useState(false);
  const [needLargeText, setNeedLargeText] = useState(false);
  const [needCallAssistance, setNeedCallAssistance] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const preferredLanguageLabel =
    preferredLanguage === 'mr'
      ? t('languageNameMarathi')
      : preferredLanguage === 'en'
        ? t('languageNameEnglish')
        : preferredLanguage === 'hi'
          ? t('languageHindi')
          : '';

  return {
    language,
    t,
    mode,
    screenTitle: isEdit ? t('accountEditProfile') : t('profileTitle'),
    primaryActionLabel: isEdit ? t('profileSave') : t('continue'),
    showSkip: !isEdit,
    mobileNumber: mobileNumber || resolvedMobileNumber,
    countryCode: countryCode || resolvedCountryCode,
    fullName,
    dateOfBirth,
    gender,
    preferredLanguage,
    cityTaluka: cityLabel || cityTaluka,
    address,
    stateId: selectedStateId != null ? String(selectedStateId) : null,
    selectedCountryId,
    countryLabel,
    selectedStateId,
    stateLabel,
    selectedDistrictId,
    districtLabel,
    selectedCityId,
    cityLabel,
    countries,
    states,
    districts,
    cities,
    isCountriesLoading,
    isStatesLoading,
    isDistrictsLoading,
    isCitiesLoading,
    canSelectState,
    canSelectDistrict,
    canSelectCity,
    countryPickerOpen,
    statePickerOpen,
    districtPickerOpen,
    cityPickerOpen,
    email,
    referredBy,
    pincode,
    preferAudio,
    needLargeText,
    needCallAssistance,
    languagePickerOpen,
    datePickerOpen,
    datePickerValue: parseDateOfBirth(dateOfBirth) ?? defaultBirthDate(),
    preferredLanguageLabel,
    onChangeFullName: setFullName,
    onOpenDatePicker: () => setDatePickerOpen(true),
    onCloseDatePicker: () => setDatePickerOpen(false),
    onConfirmDateOfBirth: (date) => {
      setDateOfBirth(formatDateOfBirth(date));
      setDatePickerOpen(false);
    },
    onSelectGender: setGender,
    onOpenLanguagePicker: () => setLanguagePickerOpen(true),
    onCloseLanguagePicker: () => setLanguagePickerOpen(false),
    onSelectPreferredLanguage: (value) => {
      setPreferredLanguage(value);
      setLanguagePickerOpen(false);
    },
    onOpenCountryPicker: () => setCountryPickerOpen(true),
    onCloseCountryPicker: () => setCountryPickerOpen(false),
    onSelectCountry: (id: number) => {
      userSelectedCountryRef.current = true;
      autoFilledCountryRef.current = false;
      autoFilledStateRef.current = false;
      autoFilledDistrictRef.current = false;
      autoFilledCityRef.current = false;
      setSelectedCountryId(id);
      setSelectedStateId(null);
      setSelectedDistrictId(null);
      setSelectedCityId(null);
      setCountryPickerOpen(false);
    },
    onOpenStatePicker: () => {
      if (selectedCountryId) {
        setStatePickerOpen(true);
      }
    },
    onCloseStatePicker: () => setStatePickerOpen(false),
    onSelectState: (id: number) => {
      userSelectedStateRef.current = true;
      autoFilledStateRef.current = false;
      autoFilledDistrictRef.current = false;
      autoFilledCityRef.current = false;
      setSelectedStateId(id);
      setSelectedDistrictId(null);
      setSelectedCityId(null);
      setStatePickerOpen(false);
    },
    onOpenDistrictPicker: () => {
      if (selectedStateId) {
        setDistrictPickerOpen(true);
      }
    },
    onCloseDistrictPicker: () => setDistrictPickerOpen(false),
    onSelectDistrict: (id: number) => {
      userSelectedDistrictRef.current = true;
      autoFilledDistrictRef.current = false;
      autoFilledCityRef.current = false;
      setSelectedDistrictId(id);
      setSelectedCityId(null);
      setDistrictPickerOpen(false);
    },
    onOpenCityPicker: () => {
      if (selectedDistrictId) {
        setCityPickerOpen(true);
      }
    },
    onCloseCityPicker: () => setCityPickerOpen(false),
    onSelectCity: (id: number) => {
      userSelectedCityRef.current = true;
      autoFilledCityRef.current = false;
      setSelectedCityId(id);
      setCityPickerOpen(false);
    },
    onChangeCityTaluka: setCityTaluka,
    onChangeAddress: setAddress,
    onChangeEmail: setEmail,
    onChangeReferredBy: setReferredBy,
    onChangePincode: (value) =>
      setPincode(value.replace(/\D/g, '').slice(0, 6)),
    onTogglePreferAudio: () => setPreferAudio((current) => !current),
    onToggleNeedLargeText: () => setNeedLargeText((current) => !current),
    onToggleNeedCallAssistance: () =>
      setNeedCallAssistance((current) => !current),
    onSelectLanguage: setLanguage,
    onContinue,
    onSkip,
    onBack,
  };
}
