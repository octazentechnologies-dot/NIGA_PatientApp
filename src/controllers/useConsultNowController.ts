import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BOOKING_MEMBERS,
  MONTH_KEYS,
  PLATFORM_FEE_RUPEES,
  TAX_RUPEES,
  formatRupees,
  resolveBookingMembers,
  type BookingMember,
  type ConsultMode,
} from '../config/appointmentSlots';
import { formatBookedOn } from '../config/bookedAppointments';
import {
  CONSULT_NOW_AVAILABLE_DOCTORS,
  CONSULT_NOW_CITIES,
  CONSULT_NOW_FEE_RUPEES,
  CONSULT_NOW_LANGUAGES,
  CONSULT_NOW_MAX_DECLINES,
  CONSULT_NOW_MODES,
  CONSULT_NOW_NEEDS,
  CONSULT_NOW_OFFER_SECONDS,
  CONSULT_NOW_SEARCH_MS,
  CONSULT_NOW_WAIT_MAX,
  CONSULT_NOW_WAIT_MIN,
  formatConsultDigits,
  formatOfferClock,
  matchingConsultNowOffers,
  nextWidenLanguage,
  type ConsultNowGender,
  type ConsultNowLanguage,
  type ConsultNowMode,
  type ConsultNowNeed,
  type ConsultNowNeedId,
  type ConsultNowOfferSeed,
} from '../config/consultNow';
import { getDoctorProfile } from '../config/doctorProfiles';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import type { PaymentStatus } from './useBookAppointmentController';

export type ConsultNowMatchState = 'searching' | 'offer' | 'none';

export type ConsultNowOfferVm = {
  doctorId: string;
  doctorName: string;
  initials: string;
  credentialsLine: string;
  ratingLabel: string;
  languageLabel: string;
  modeLabel: string;
  feeLabel: string;
  acceptLabel: string;
  acceptInLabel: string;
  clockLabel: string;
};

export type ConsultNowViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  availableLabel: string;
  waitLabel: string;
  members: BookingMember[];
  member: BookingMember;
  selectedMemberLabel: string;
  memberPickerOpen: boolean;
  needs: ConsultNowNeed[];
  selectedNeedId: ConsultNowNeedId;
  languages: typeof CONSULT_NOW_LANGUAGES;
  selectedLanguages: ConsultNowLanguage[];
  modes: typeof CONSULT_NOW_MODES;
  mode: ConsultNowMode;
  genders: ConsultNowGender[];
  recognizedQualification: boolean;
  focusCertified: boolean;
  locationQuery: string;
  visibleCities: typeof CONSULT_NOW_CITIES;
  selectedCityIds: string[];
  useCurrentLocation: boolean;
  note: string;
  feeLabel: string;
  canFindDoctor: boolean;
  searchingOpen: boolean;
  matchState: ConsultNowMatchState;
  searchSummary: string;
  queueLabel: string;
  queueWaitLabel: string;
  offer: ConsultNowOfferVm | null;
  feeDetailsOpen: boolean;
  callbackRequested: boolean;
  noDoctorLanguageLabel: string;
  noDoctorNeedLabel: string;
  widenLanguage: ConsultNowLanguage | null;
  widenTitle: string;
  earliestSlotLabel: string;
  paymentOpen: boolean;
  paymentStatus: PaymentStatus | null;
  paymentSummaryLine: string;
  doctorFeeLabel: string;
  platformFeeLabel: string;
  taxesLabel: string;
  totalLabel: string;
  instantWhenLabel: string;
  instantDateLine: string;
  instantTimeLine: string;
  instantStartsAt: string;
  instantBookedOn: string;
  instantModeConsultLabel: string;
  instantPatientLabel: string;
  offeredDoctorId: string;
  offeredDoctorInitials: string;
  offeredExperienceKey: TranslationKey;
  bookingMode: ConsultMode;
  onBack: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: string) => void;
  onAddMember: () => void;
  onSelectNeed: (id: ConsultNowNeedId) => void;
  onToggleLanguage: (id: ConsultNowLanguage) => void;
  onSelectMode: (mode: ConsultNowMode) => void;
  onToggleGender: (gender: ConsultNowGender) => void;
  onToggleRecognized: () => void;
  onToggleFocusCert: () => void;
  onChangeLocationQuery: (value: string) => void;
  onToggleCity: (cityId: string) => void;
  onToggleCurrentLocation: () => void;
  onChangeNote: (value: string) => void;
  onFindDoctor: () => void;
  onCancelSearch: () => void;
  onAcceptOffer: () => void;
  onDeclineOffer: () => void;
  onWidenSearch: () => void;
  onBookEarliest: () => void;
  onRequestCallback: () => void;
  onOpenFeeDetails: () => void;
  onCloseFeeDetails: () => void;
  onClosePayment: () => void;
  onOpenPaymentStatus: (status: PaymentStatus) => void;
  onClosePaymentStatus: () => void;
  onFinishInstantPay: () => void;
};

function shortCredsFor(id: string): TranslationKey {
  if (id === 'rajesh') {
    return 'bookRajeshShortCreds';
  }
  if (id === 'sunita') {
    return 'bookSunitaShortCreds';
  }
  return 'bookAnjaliShortCreds';
}

function modeConsultKey(mode: ConsultNowMode): TranslationKey {
  if (mode === 'audio') {
    return 'reviewAudioConsult';
  }
  if (mode === 'chat') {
    return 'reviewChatConsult';
  }
  return 'reviewVideoConsult';
}

function languageLabelKey(id: ConsultNowLanguage): TranslationKey {
  return (
    CONSULT_NOW_LANGUAGES.find((item) => item.id === id)?.labelKey ??
    'searchLangMarathi'
  );
}

function widenTitleKey(id: ConsultNowLanguage): TranslationKey {
  if (id === 'hi') {
    return 'noDoctorWidenHi';
  }
  if (id === 'mr') {
    return 'noDoctorWidenMr';
  }
  return 'noDoctorWidenEn';
}

export function useConsultNowController({
  active,
  onBack,
  onBookEarliest,
}: {
  active: boolean;
  onBack: () => void;
  onBookEarliest: (query: string) => void;
}): ConsultNowViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<ConsultNowNeedId>('skin');
  const [selectedLanguages, setSelectedLanguages] = useState<ConsultNowLanguage[]>([
    'mr',
  ]);
  const [mode, setMode] = useState<ConsultNowMode>('video');
  const [genders, setGenders] = useState<ConsultNowGender[]>([]);
  const [recognizedQualification, setRecognizedQualification] = useState(false);
  const [focusCertified, setFocusCertified] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [note, setNote] = useState('');
  const [searchingOpen, setSearchingOpen] = useState(false);
  const [matchState, setMatchState] = useState<ConsultNowMatchState>('searching');
  const [declinedIds, setDeclinedIds] = useState<string[]>([]);
  const [offerSeed, setOfferSeed] = useState<ConsultNowOfferSeed | null>(null);
  const [offerSeconds, setOfferSeconds] = useState(CONSULT_NOW_OFFER_SECONDS);
  const [feeDetailsOpen, setFeeDetailsOpen] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  const resetSearch = useCallback(() => {
    setSearchingOpen(false);
    setMatchState('searching');
    setDeclinedIds([]);
    setOfferSeed(null);
    setOfferSeconds(CONSULT_NOW_OFFER_SECONDS);
    setFeeDetailsOpen(false);
    setCallbackRequested(false);
    setPaymentOpen(false);
    setPaymentStatus(null);
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }
    setMemberId('self');
    setMemberPickerOpen(false);
    setSelectedNeedId('skin');
    setSelectedLanguages(['mr']);
    setMode('video');
    setGenders([]);
    setRecognizedQualification(false);
    setFocusCertified(false);
    setLocationQuery('');
    setSelectedCityIds([]);
    setUseCurrentLocation(false);
    setNote('');
    resetSearch();
  }, [active, resetSearch]);

  const startMatch = useCallback(
    (languages: ConsultNowLanguage[], skipped: string[]) => {
      setSearchingOpen(true);
      setMatchState('searching');
      setOfferSeed(null);
      setFeeDetailsOpen(false);
      setPaymentOpen(false);
      setPaymentStatus(null);
      const matches = matchingConsultNowOffers({
        languages,
        genders,
        declinedIds: skipped,
      });
      const timer = setTimeout(() => {
        if (matches[0]) {
          setOfferSeed(matches[0]);
          setOfferSeconds(CONSULT_NOW_OFFER_SECONDS);
          setMatchState('offer');
          return;
        }
        setMatchState('none');
      }, CONSULT_NOW_SEARCH_MS);
      return () => clearTimeout(timer);
    },
    [genders],
  );

  useEffect(() => {
    if (!searchingOpen || matchState !== 'searching') {
      return;
    }
    return startMatch(selectedLanguages, declinedIds);
  }, [declinedIds, matchState, searchingOpen, selectedLanguages, startMatch]);

  useEffect(() => {
    if (!searchingOpen || matchState !== 'offer' || paymentOpen) {
      return;
    }
    const timer = setInterval(() => {
      setOfferSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [matchState, paymentOpen, searchingOpen]);

  const onDeclineOffer = useCallback(() => {
    if (!offerSeed) {
      setMatchState('none');
      return;
    }
    const nextDeclined = [...declinedIds, offerSeed.doctorId];
    setDeclinedIds(nextDeclined);
    setOfferSeed(null);
    setFeeDetailsOpen(false);
    if (nextDeclined.length >= CONSULT_NOW_MAX_DECLINES) {
      setMatchState('none');
      return;
    }
    const remaining = matchingConsultNowOffers({
      languages: selectedLanguages,
      genders,
      declinedIds: nextDeclined,
    });
    if (!remaining[0]) {
      setMatchState('none');
      return;
    }
    setMatchState('searching');
  }, [declinedIds, genders, offerSeed, selectedLanguages]);

  useEffect(() => {
    if (matchState === 'offer' && offerSeconds === 0 && !paymentOpen) {
      onDeclineOffer();
    }
  }, [matchState, offerSeconds, onDeclineOffer, paymentOpen]);

  useEffect(() => {
    if (paymentStatus !== 'pending') {
      return;
    }
    const timer = setTimeout(() => setPaymentStatus('success'), 2500);
    return () => clearTimeout(timer);
  }, [paymentStatus]);

  const authUser = useAppSelector((state) => state.auth.user);
  const patientFullName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const members = useMemo(
    () => resolveBookingMembers(patientFullName),
    [patientFullName],
  );

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const selectedNeed =
    CONSULT_NOW_NEEDS.find((item) => item.id === selectedNeedId) ?? CONSULT_NOW_NEEDS[0];
  const feeLabel = formatRupees(CONSULT_NOW_FEE_RUPEES[mode], language);
  const selectedMemberLabel = member.self
    ? t('bookMyself')
    : member.name.split(' ')[0];
  const visibleCities = useMemo(() => {
    const needle = locationQuery.trim().toLowerCase();
    if (!needle) {
      return CONSULT_NOW_CITIES;
    }
    return CONSULT_NOW_CITIES.filter((city) =>
      t(city.nameKey).toLowerCase().includes(needle),
    );
  }, [locationQuery, t]);

  const profile = offerSeed ? getDoctorProfile(offerSeed.doctorId) : getDoctorProfile('rajesh');
  const offerLanguageId =
    offerSeed?.languages.find((item) => selectedLanguages.includes(item)) ??
    selectedLanguages[0] ??
    'mr';
  const modeLabel = t(
    CONSULT_NOW_MODES.find((item) => item.id === mode)?.labelKey ?? 'searchModeVideo',
  );
  const totalRupees = offerSeed?.feeRupees ?? CONSULT_NOW_FEE_RUPEES[mode];
  const doctorFeeRupees = Math.max(0, totalRupees - PLATFORM_FEE_RUPEES - TAX_RUPEES);
  const totalLabel = formatRupees(totalRupees, language);
  const today = new Date();
  const instantDateLine = formatBookedOn(today, language, t(MONTH_KEYS[today.getMonth()]));
  const instantTimeLine = t('searchingNow');
  const instantWhenLabel = `${instantDateLine} · ${instantTimeLine}`;
  const instantPatientLabel = member.self
    ? member.name
    : `${member.name} (${member.metaKey ? t(member.metaKey).replace(' • ', ', ') : ''})`;
  const instantModeConsultLabel = t(modeConsultKey(mode));
  const widenLanguage = nextWidenLanguage(selectedLanguages);
  const bookingMode: ConsultMode =
    mode === 'audio' ? 'audio' : mode === 'chat' ? 'chat' : 'video';

  const offer: ConsultNowOfferVm | null = offerSeed
    ? {
        doctorId: offerSeed.doctorId,
        doctorName: t(profile.nameKey),
        initials: profile.initials,
        credentialsLine: `${t(shortCredsFor(profile.id))} · ${t('offerYears').replace(
          '{years}',
          formatConsultDigits(offerSeed.years, language),
        )}`,
        ratingLabel: `${formatConsultDigits(offerSeed.rating, language)} (${formatConsultDigits(
          offerSeed.reviewCount,
          language,
        )})`,
        languageLabel: t(languageLabelKey(offerLanguageId)),
        modeLabel,
        feeLabel: totalLabel,
        acceptLabel: t('offerAcceptPay').replace('{amount}', totalLabel),
        acceptInLabel: t('offerAcceptIn').replace(
          '{time}',
          formatOfferClock(offerSeconds, language),
        ),
        clockLabel: formatOfferClock(offerSeconds, language),
      }
    : null;

  const onCancelSearch = useCallback(() => {
    resetSearch();
  }, [resetSearch]);

  return {
    language,
    t,
    availableLabel: t('consultNowAvailable').replace(
      '{count}',
      language === 'mr' ? '१४' : String(CONSULT_NOW_AVAILABLE_DOCTORS),
    ),
    waitLabel: t('consultNowWait')
      .replace('{min}', language === 'mr' ? '४' : String(CONSULT_NOW_WAIT_MIN))
      .replace('{max}', language === 'mr' ? '८' : String(CONSULT_NOW_WAIT_MAX)),
    members,
    member,
    selectedMemberLabel,
    memberPickerOpen,
    needs: CONSULT_NOW_NEEDS,
    selectedNeedId,
    languages: CONSULT_NOW_LANGUAGES,
    selectedLanguages,
    modes: CONSULT_NOW_MODES,
    mode,
    genders,
    recognizedQualification,
    focusCertified,
    locationQuery,
    visibleCities,
    selectedCityIds,
    useCurrentLocation,
    note,
    feeLabel,
    canFindDoctor: selectedLanguages.length > 0,
    searchingOpen,
    matchState,
    searchSummary: [
      t(selectedNeed.titleKey),
      selectedLanguages.map((id) => t(languageLabelKey(id))).join(', '),
      modeLabel,
    ].join(' · '),
    queueLabel: t('searchingQueue').replace(
      '{position}',
      language === 'mr' ? '२ऱ्या' : '2nd',
    ),
    queueWaitLabel: t('searchingQueueWait').replace(
      '{minutes}',
      language === 'mr' ? '५' : '5',
    ),
    offer,
    feeDetailsOpen,
    callbackRequested,
    noDoctorLanguageLabel: t(languageLabelKey(selectedLanguages[0] ?? 'mr')),
    noDoctorNeedLabel: t(selectedNeed.titleKey),
    widenLanguage,
    widenTitle: widenLanguage ? t(widenTitleKey(widenLanguage)) : '',
    earliestSlotLabel: t('noDoctorBookSlotWhen'),
    paymentOpen,
    paymentStatus,
    paymentSummaryLine: t('payConsultWith')
      .replace('{name}', t(profile.nameKey))
      .replace('{when}', instantWhenLabel),
    doctorFeeLabel: formatRupees(doctorFeeRupees, language),
    platformFeeLabel: formatRupees(PLATFORM_FEE_RUPEES, language),
    taxesLabel: formatRupees(TAX_RUPEES, language),
    totalLabel,
    instantWhenLabel,
    instantDateLine,
    instantTimeLine,
    instantStartsAt: today.toISOString(),
    instantBookedOn: instantDateLine,
    instantModeConsultLabel,
    instantPatientLabel,
    offeredDoctorId: profile.id,
    offeredDoctorInitials: profile.initials,
    offeredExperienceKey: profile.experienceKey,
    bookingMode,
    onBack,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onAddMember: () => undefined,
    onSelectNeed: setSelectedNeedId,
    onToggleLanguage: (id) =>
      setSelectedLanguages((current) => {
        if (current.includes(id)) {
          return current.length === 1 ? current : current.filter((item) => item !== id);
        }
        return [...current, id];
      }),
    onSelectMode: setMode,
    onToggleGender: (gender) =>
      setGenders((current) =>
        current.includes(gender)
          ? current.filter((item) => item !== gender)
          : [...current, gender],
      ),
    onToggleRecognized: () => setRecognizedQualification((current) => !current),
    onToggleFocusCert: () => setFocusCertified((current) => !current),
    onChangeLocationQuery: setLocationQuery,
    onToggleCity: (cityId) =>
      setSelectedCityIds((current) =>
        current.includes(cityId)
          ? current.filter((item) => item !== cityId)
          : [...current, cityId],
      ),
    onToggleCurrentLocation: () => setUseCurrentLocation((current) => !current),
    onChangeNote: setNote,
    onFindDoctor: () => {
      setDeclinedIds([]);
      setCallbackRequested(false);
      setSearchingOpen(true);
      setMatchState('searching');
    },
    onCancelSearch,
    onAcceptOffer: () => {
      if (!offerSeed) {
        return;
      }
      setFeeDetailsOpen(false);
      setPaymentOpen(true);
    },
    onDeclineOffer,
    onWidenSearch: () => {
      if (!widenLanguage) {
        return;
      }
      setSelectedLanguages((current) =>
        current.includes(widenLanguage) ? current : [...current, widenLanguage],
      );
      setCallbackRequested(false);
      setMatchState('searching');
    },
    onBookEarliest: () => onBookEarliest(t(selectedNeed.titleKey)),
    onRequestCallback: () => setCallbackRequested(true),
    onOpenFeeDetails: () => setFeeDetailsOpen(true),
    onCloseFeeDetails: () => setFeeDetailsOpen(false),
    onClosePayment: () => {
      setPaymentStatus(null);
      setPaymentOpen(false);
    },
    onOpenPaymentStatus: (status) => setPaymentStatus(status),
    onClosePaymentStatus: () => setPaymentStatus(null),
    onFinishInstantPay: () => {
      resetSearch();
      onBack();
    },
  };
}
