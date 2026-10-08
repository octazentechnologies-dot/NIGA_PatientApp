import { useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  type CreatePatientRequest,
  useCreatePatientMutation,
  useGetCitiesByDistrictQuery,
  useGetCountriesQuery,
  useGetDistrictsByStateQuery,
  useGetGendersQuery,
  useGetStatesByCountryQuery,
} from '../store/api/new/completeProfileApi';
import {
  type PatientProfileData,
  type UpdatePatientProfileRequest,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
} from '../store/api/new/patientProfileApi';
import { saveAccessToken, saveAuthUserData } from '../services/secureStorage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  type DetectedGeoLocation,
  setAuthUser,
  setDetectedLocation,
} from '../store/slices/authSlice';

function normalizeLocationString(val: string | null | undefined): string {
  if (!val) {
    return '';
  }
  return val
    .toLowerCase()
    .replace(/\b(state|province|district|division|city|region|of)\b/gi, '')
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
  isContinueDisabled: boolean;
  isSubmitting: boolean;
  isProfileLoading?: boolean;
  toastVisible?: boolean;
  toastMessage?: string;
  toastVariant?: 'success' | 'error';
  showSkip?: boolean;
  mobileNumber: string;
  countryCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderOption | null;
  selectedGenderId: number | null;
  genderLabel: string;
  genders: { id: number; name: string }[];
  isGendersLoading: boolean;
  genderPickerOpen: boolean;
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
  onOpenGenderPicker: () => void;
  onCloseGenderPicker: () => void;
  onSelectGender: (id: number) => void;
  onOpenLanguagePicker: () => void;
  onCloseLanguagePicker: () => void;
  onSelectPreferredLanguage: (value: PreferredLanguageOption) => void;
  onOpenCountryPicker: () => void;
  onCloseCountryPicker: () => void;
  onSelectCountry: (id: number) => void;
  onOpenStatePicker: () => void;
  onCloseStatePicker: () => void;
  onSelectState: (id: number) => void;
  onOpenDistrictPicker: () => void;
  onCloseDistrictPicker: () => void;
  onSelectDistrict: (id: number) => void;
  onOpenCityPicker: () => void;
  onCloseCityPicker: () => void;
  onSelectCity: (id: number) => void;
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

function parseApiDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

function parseDateOfBirth(input: string): Date | null {
  if (!input) {
    return null;
  }
  const parts = input.split('/');
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);
    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      day < 1 ||
      day > 31 ||
      month < 0 ||
      month > 11 ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return null;
    }
    const date = new Date(year, month, day);
    return date.getDate() === day &&
      date.getMonth() === month &&
      date.getFullYear() === year
      ? date
      : null;
  }
  return parseApiDate(input);
}

function formatDateOfBirth(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateToYMD(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function defaultBirthDate(): Date {
  return new Date(2000, 0, 1);
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
  const authUser = useAppSelector((state) => state.auth.user);
  const reduxMobile = useAppSelector((state) => state.auth.mobile);
  const reduxCountryCode = useAppSelector((state) => state.auth.countryCode);
  const reduxDetectedLocation = useAppSelector(
    (state) => state.auth.detectedLocation,
  );

  const isEdit = mode === 'edit';
  const resolvedMobileNumber =
    (initialMobileNumber && initialMobileNumber.trim().length > 0
      ? initialMobileNumber.trim()
      : reduxMobile?.trim() || authUser?.mobile || authUser?.mobileNo || '') || '';

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

  const initialFullName = isEdit
    ? authUser?.patientName ||
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
      ''
    : '';

  const [fullName, setFullName] = useState(initialFullName);
  const [dateOfBirth, setDateOfBirth] = useState(
    isEdit && authUser?.dateOfBirth ? authUser.dateOfBirth : '',
  );
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(
    isEdit && authUser?.gender != null ? authUser.gender : null,
  );
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [preferredLanguage, setPreferredLanguage] =
    useState<PreferredLanguageOption | null>(isEdit ? 'en' : null);
  const [cityTaluka, setCityTaluka] = useState(
    isEdit && authUser?.cityId != null ? String(authUser.cityId) : '',
  );
  const [address, setAddress] = useState(
    isEdit && (authUser?.addressLine1 || authUser?.address)
      ? (authUser.addressLine1 || authUser.address || '')
      : '',
  );
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    isEdit && authUser?.countryId != null ? authUser.countryId : null,
  );
  const [selectedStateId, setSelectedStateId] = useState<number | null>(
    isEdit && authUser?.stateId != null ? authUser.stateId : null,
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    isEdit && authUser?.districtId != null ? authUser.districtId : null,
  );
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    isEdit && authUser?.cityId != null ? authUser.cityId : null,
  );

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

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const [createPatient, { isLoading: isCreatingPatient }] =
    useCreatePatientMutation();
  const [updatePatientProfile, { isLoading: isUpdatingProfile }] =
    useUpdatePatientProfileMutation();

  const isSubmitting = isEdit ? isUpdatingProfile : isCreatingPatient;

  const {
    data: profileQueryResponse,
    isLoading: isProfileQueryLoading,
    isFetching: isProfileQueryFetching,
    error: profileQueryError,
  } = useGetPatientProfileQuery(undefined, {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });

  const [profileData, setProfileData] = useState<PatientProfileData | null>(null);
  const hasLoadedProfileRef = useRef(false);

  const isProfileLoading =
    isEdit && (isProfileQueryLoading || (isProfileQueryFetching && !hasLoadedProfileRef.current));

  useEffect(() => {
    if (!isEdit || !profileQueryResponse?.data) {
      return;
    }
    const data = profileQueryResponse.data;
    hasLoadedProfileRef.current = true;
    setProfileData(data);

    const name =
      data.patientName?.trim() ||
      [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
    if (name) {
      setFullName(name);
    }
    if (data.dateOfBirth) {
      const parsed = parseApiDate(data.dateOfBirth);
      if (parsed) {
        setDateOfBirth(formatDateOfBirth(parsed));
      }
    }
    if (data.gender != null) {
      setSelectedGenderId(data.gender);
    }
    if (data.email) {
      setEmail(data.email);
    }
    if (data.mobileNo) {
      setMobileNumber(data.mobileNo);
    }
    if (data.preferredLanguageId != null) {
      if (data.preferredLanguageId === 1) {
        setPreferredLanguage('en');
      } else if (data.preferredLanguageId === 2) {
        setPreferredLanguage('mr');
      } else if (data.preferredLanguageId === 3) {
        setPreferredLanguage('hi');
      }
    }
  }, [isEdit, profileQueryResponse]);

  useEffect(() => {
    if (isEdit && profileQueryError && !hasLoadedProfileRef.current) {
      let errorMsg =
        language === 'mr'
          ? 'माहिती लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.'
          : 'Failed to load profile. Please try again.';
      if (
        typeof profileQueryError === 'object' &&
        profileQueryError !== null &&
        'data' in profileQueryError &&
        typeof (profileQueryError as { data: unknown }).data === 'object' &&
        (profileQueryError as { data: unknown }).data !== null
      ) {
        const d = (profileQueryError as { data: { message?: string; errorMessage?: string } }).data;
        if (d.message) errorMsg = d.message;
        else if (d.errorMessage) errorMsg = d.errorMessage;
      }
      showToast(errorMsg, 'error');
    }
  }, [isEdit, profileQueryError, language]);
  const { data: gendersResponse, isLoading: isGendersLoading } =
    useGetGendersQuery();
  const genders = useMemo(
    () =>
      (gendersResponse ?? []).map((g) => {
        let name = g.genderName ?? '';
        if (language === 'mr') {
          const lower = name.toLowerCase();
          if (lower === 'male') name = t('genderMale');
          else if (lower === 'female') name = t('genderFemale');
          else if (lower === 'other') name = t('genderOther');
          else if (lower === 'unknown') name = t('genderUnknown');
        }
        return {
          id: g.genderId,
          name,
        };
      }),
    [gendersResponse, language, t],
  );

  const selectedGenderObj = genders.find((g) => g.id === selectedGenderId);
  const genderLabel = selectedGenderObj?.name ?? '';

  const gender: GenderOption | null =
    selectedGenderId === 0
      ? 'male'
      : selectedGenderId === 1
        ? 'female'
        : selectedGenderId === 2
          ? 'other'
          : null;

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

  const [email, setEmail] = useState(
    isEdit && authUser?.email ? authUser.email : '',
  );
  const [referredBy, setReferredBy] = useState('');
  const [pincode, setPincode] = useState(
    isEdit && authUser?.pinCodeId != null ? String(authUser.pinCodeId) : '',
  );
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

  const isContinueDisabled =
    !fullName.trim() ||
    !dateOfBirth.trim() ||
    !parseDateOfBirth(dateOfBirth) ||
    isSubmitting;

  const handleContinue = async () => {
    if (isContinueDisabled || isSubmitting) {
      return;
    }

    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      showToast(
        language === 'mr' ? 'कृपया पूर्ण नाव प्रविष्ट करा' : 'Please enter full name',
        'error',
      );
      return;
    }

    const dobDate = parseDateOfBirth(dateOfBirth);
    if (!dobDate) {
      showToast(
        language === 'mr'
          ? 'कृपया वैध जन्मतारीख प्रविष्ट करा'
          : 'Please enter a valid date of birth',
        'error',
      );
      return;
    }

    const cleanMobile = (mobileNumber || resolvedMobileNumber).trim();
    if (!cleanMobile) {
      showToast(
        language === 'mr' ? 'कृपया मोबाईल नंबर प्रविष्ट करा' : 'Please enter mobile number',
        'error',
      );
      return;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showToast(
        language === 'mr'
          ? 'कृपया वैध ईमेल प्रविष्ट करा'
          : 'Please enter a valid email address',
        'error',
      );
      return;
    }

    if (isEdit) {
      const nameParts = trimmedFullName.split(/\s+/);
      const firstName = nameParts[0] || trimmedFullName;
      const lastName =
        nameParts.length > 1
          ? nameParts.slice(1).join(' ')
          : profileData?.lastName || '';
      const patientName = trimmedFullName;
      const age = calculateAge(dobDate);

      const reqPatientId =
        profileData?.userId ??
        profileData?.patientId ??
        authUser?.userId ??
        authUser?.patientId ??
        0;

      const putPayload: UpdatePatientProfileRequest = {
        firstName,
        lastName,
        patientName,
        dateOfBirth: dobDate.toISOString(),
        gender: selectedGenderId ?? profileData?.gender ?? 0,
        age,
        mobileNo: cleanMobile,
        email: trimmedEmail,
        preferredLanguageId:
          preferredLanguage === 'en'
            ? 1
            : preferredLanguage === 'mr'
              ? 2
              : preferredLanguage === 'hi'
                ? 3
                : profileData?.preferredLanguageId ?? null,
        welcomeVersionSeen: profileData?.welcomeVersionSeen ?? '1.0',
        patientId: reqPatientId,
      };

      try {
        const updateRes = await updatePatientProfile(putPayload).unwrap();
        const resData = updateRes.data;
        if (resData) {
          setProfileData(resData);
          const updatedUser = {
            ...authUser,
            userId: resData.userId,
            patientId: resData.patientId,
            firstName: resData.firstName,
            lastName: resData.lastName,
            patientName: resData.patientName,
            mobile: resData.mobileNo,
            mobileNo: resData.mobileNo,
            email: resData.email,
            dateOfBirth: resData.dateOfBirth,
            gender: resData.gender,
          };
          await saveAuthUserData(updatedUser);
          dispatch(
            setAuthUser({
              user: updatedUser,
              patientId: resData.patientId,
              userId: resData.userId,
              mobile: resData.mobileNo,
            }),
          );
        }

        showToast(
          language === 'mr'
            ? 'प्रोफाइल यशस्वीरित्या अपडेट केली'
            : 'Profile updated successfully',
          'success',
        );

        setTimeout(() => {
          onContinue();
        }, 1200);
      } catch (err: unknown) {
        let errorMsg =
          language === 'mr'
            ? 'प्रोफाइल अपडेट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.'
            : 'Failed to update profile. Please try again.';
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err &&
          typeof (err as { data: unknown }).data === 'object' &&
          (err as { data: unknown }).data !== null
        ) {
          const dataObj = (err as { data: { message?: string; errorMessage?: string } }).data;
          if (dataObj.message) {
            errorMsg = dataObj.message;
          } else if (dataObj.errorMessage) {
            errorMsg = dataObj.errorMessage;
          }
        }
        showToast(errorMsg, 'error');
      }
      return;
    }

    const patientPayload: CreatePatientRequest = {
      entityType: 'PatientMobile',
      patientID: authUser?.patientId ?? 0,
      patientName: trimmedFullName,
      mobileNo: cleanMobile,
      email: trimmedEmail,
      dateOfBirth: formatDateToYMD(dobDate),
      gender: selectedGenderId ?? 0,
      addressLine1: address.trim(),
      countryId: selectedCountryId ?? 0,
      stateId: selectedStateId ?? 0,
      isWhatsAppOptIn: false,
    };

    console.log('[api/patient] Request Payload:', JSON.stringify(patientPayload, null, 2));

    try {
      const response = await createPatient(patientPayload).unwrap();
      console.log('[api/patient] Response:', JSON.stringify(response, null, 2));

      const userToSave = {
        patientId: response.patientID,
        userId: response.userId,
        patientName: response.patientName ?? trimmedFullName,
        mobile: response.mobileNo ?? cleanMobile,
        email: response.email ?? trimmedEmail,
        addressLine1: response.addressLine1 ?? address.trim(),
        dateOfBirth:
          response.dateOfBirth ??
          formatDateToYMD(dobDate),
        gender: response.gender ?? selectedGenderId ?? undefined,
        countryId: response.countryId ?? selectedCountryId ?? undefined,
        stateId: response.stateId ?? selectedStateId ?? undefined,
        districtId: response.districtId ?? selectedDistrictId ?? undefined,
        cityId: response.cityId ?? selectedCityId ?? undefined,
        pinCodeId:
          response.pinCodeId ?? (pincode ? pincode.trim() : undefined),
      };

      // Save token & user in SecureStore for persistent session
      if (response.token) {
        await saveAccessToken(response.token);
      }
      await saveAuthUserData(userToSave);

      // Save user and token in Redux for future API calls
      dispatch(
        setAuthUser({
          user: userToSave,
          token: response.token ?? undefined,
          patientId: response.patientID,
          userId: response.userId,
          mobile: response.mobileNo ?? cleanMobile,
        }),
      );

      // Navigate to next screen
      onContinue();
    } catch (error) {
      console.error('[api/patient] Error:', error);
      showToast(
        language === 'mr'
          ? 'नोंदणी करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.'
          : 'Failed to create patient profile. Please try again.',
        'error',
      );
    }
  };

  return {
    language,
    t,
    mode,
    screenTitle: isEdit ? t('accountEditProfile') : t('profileTitle'),
    primaryActionLabel: isEdit ? t('profileSave') : t('continue'),
    isContinueDisabled,
    isSubmitting,
    isProfileLoading,
    toastVisible,
    toastMessage,
    toastVariant,
    showSkip: false,
    mobileNumber: mobileNumber || resolvedMobileNumber,
    countryCode: countryCode || resolvedCountryCode,
    fullName,
    dateOfBirth,
    gender,
    selectedGenderId,
    genderLabel,
    genders,
    isGendersLoading,
    genderPickerOpen,
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
    onOpenGenderPicker: () => setGenderPickerOpen(true),
    onCloseGenderPicker: () => setGenderPickerOpen(false),
    onSelectGender: (id: number) => {
      setSelectedGenderId(id);
      setGenderPickerOpen(false);
    },
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
    onContinue: handleContinue,
    onSkip,
    onBack,
  };
}
