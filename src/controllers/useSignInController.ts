import { useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  type Country,
  useGetCountriesQuery,
} from '../store/api/new/completeProfileApi';
import {
  extractDevOtp,
  useRequestOtpMutation,
} from '../store/api/new/signInApi';
import { extractErrorMessage } from '../store/api/new/newBaseApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  type DetectedGeoLocation,
  clearSessionEndedMessage,
  setAuthMobile,
  setDetectedLocation,
} from '../store/slices/authSlice';

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

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

export type SignInViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  mobileNumber: string;
  errorMessage: string | null;
  agreedToWhatsApp: boolean;
  canSendOtp: boolean;
  devOtp: string | null;
  selectedCountryCode: string;
  selectedCountryId: number | null;
  selectedCountryName: string | null;
  selectedIso2Code: string | null;
  isCountryPickerOpen: boolean;
  countries: Country[];
  isCountriesLoading: boolean;
  onChangeMobileNumber: (value: string) => void;
  onToggleWhatsAppConsent: () => void;
  onOpenCountryPicker: () => void;
  onCloseCountryPicker: () => void;
  onSelectCountry: (country: Country) => void;
  onSendOtp: () => void;
  onCallHelpline: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onBack: () => void;
};

export function useSignInController({
  onBack,
  onOtpRequested,
}: {
  onBack: () => void;
  onOtpRequested: (
    mobileNumber: string,
    devCode?: string,
    isUserRegistered?: boolean,
    countryCode?: string,
  ) => void;
}): SignInViewModel {
  const { language, setLanguage, t } = useLocalization();
  const dispatch = useAppDispatch();
  const reduxDetectedLocation = useAppSelector(
    (state) => state.auth.detectedLocation,
  );
  const sessionEndedMessage = useAppSelector(
    (state) => state.auth.sessionEndedMessage,
  );

  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sessionEndedMessage) {
      setErrorMessage(sessionEndedMessage);
      dispatch(clearSessionEndedMessage());
    }
  }, [sessionEndedMessage, dispatch]);
  const [agreedToWhatsApp, setAgreedToWhatsApp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [requestOtp, { isLoading }] = useRequestOtpMutation();

  const { data: countriesResponse, isLoading: isCountriesLoading } =
    useGetCountriesQuery();
  const countries = useMemo(
    () => countriesResponse?.data ?? [],
    [countriesResponse],
  );

  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(
    null,
  );
  const [selectedIso2Code, setSelectedIso2Code] = useState<string | null>(null);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

  const hasAttemptedLocationRef = useRef(false);
  const userSelectedCountryRef = useRef(false);

  // Background location detection on mount
  useEffect(() => {
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
        dispatch(setDetectedLocation(detected));
      } catch {
        // Fallback gracefully without blocking login or logging sensitive data
      }
    }

    void detectDeviceLocation();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Match detected country with Countries API response
  useEffect(() => {
    if (
      userSelectedCountryRef.current ||
      !reduxDetectedLocation ||
      !countriesResponse?.data ||
      countriesResponse.data.length === 0
    ) {
      return;
    }

    const detectedIso =
      reduxDetectedLocation.isoCountryCode?.trim().toUpperCase();
    const detectedName =
      reduxDetectedLocation.countryName?.trim().toLowerCase();

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
      return isLocationMatch(c.countryName, reduxDetectedLocation.countryName);
    });

    if (matchedCountry) {
      setSelectedCountryCode(matchedCountry.countryCode);
      setSelectedCountryId(matchedCountry.countryId);
      setSelectedCountryName(matchedCountry.countryName);
      setSelectedIso2Code(matchedCountry.iso2Code);
    }
  }, [countriesResponse, reduxDetectedLocation]);

  const isIndian = selectedCountryCode === '+91';
  const isValidMobile = isIndian
    ? INDIAN_MOBILE.test(mobileNumber)
    : mobileNumber.length >= 7 && mobileNumber.length <= 15;

  return {
    language,
    t,
    mobileNumber,
    errorMessage,
    agreedToWhatsApp,
    canSendOtp: isValidMobile && agreedToWhatsApp && !isLoading,
    devOtp,
    selectedCountryCode,
    selectedCountryId,
    selectedCountryName,
    selectedIso2Code,
    isCountryPickerOpen,
    countries,
    isCountriesLoading,
    onChangeMobileNumber: (value) => {
      const maxDigits = isIndian ? 10 : 15;
      setMobileNumber(value.replace(/\D/g, '').slice(0, maxDigits));
      setErrorMessage(null);
      setDevOtp(null);
    },
    onToggleWhatsAppConsent: () => {
      setAgreedToWhatsApp((current) => !current);
      setErrorMessage(null);
    },
    onOpenCountryPicker: () => setIsCountryPickerOpen(true),
    onCloseCountryPicker: () => setIsCountryPickerOpen(false),
    onSelectCountry: (country: Country) => {
      userSelectedCountryRef.current = true;
      setSelectedCountryCode(country.countryCode);
      setSelectedCountryId(country.countryId);
      setSelectedCountryName(country.countryName);
      setSelectedIso2Code(country.iso2Code);
      setIsCountryPickerOpen(false);
      setErrorMessage(null);
    },
    onSendOtp: async () => {
      if (!isValidMobile) {
        setErrorMessage(t('invalidMobile'));
        return;
      }
      if (!agreedToWhatsApp) {
        setErrorMessage(t('whatsappConsentRequired'));
        return;
      }
      try {
        dispatch(
          setAuthMobile({
            mobile: mobileNumber,
            countryCode: selectedCountryCode,
            countryId: selectedCountryId ?? undefined,
          }),
        );
        const response = await requestOtp({ mobile: mobileNumber }).unwrap();
        if (response.success) {
          // Show API-returned OTP until SMS is integrated (also on EAS APKs;
          // gating on __DEV__ hid it in preview/release builds).
          const safeDevCode = extractDevOtp(response);
          if (safeDevCode) {
            setDevOtp(safeDevCode);
          }
          const isRegistered =
            response.isUserRegistered ?? response.isUserAlreadyRegistered;
          onOtpRequested(
            mobileNumber,
            safeDevCode,
            isRegistered,
            selectedCountryCode,
          );
        } else {
          setErrorMessage(
            extractErrorMessage(response, t('invalidMobile')),
          );
        }
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          (err as { status?: number }).status === 429
        ) {
          setErrorMessage('Too many OTP requests. Please wait a moment before trying again.');
          return;
        }
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err
        ) {
          const data = (err as { data: unknown }).data;
          setErrorMessage(extractErrorMessage(data, t('invalidMobile')));
        } else {
          setErrorMessage(t('invalidMobile'));
        }
      }
    },
    onCallHelpline: () => undefined,
    onSelectLanguage: setLanguage,
    onBack,
  };
}

