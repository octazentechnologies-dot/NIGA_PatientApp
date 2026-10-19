import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MONTH_KEYS,
  formatRupees,
  resolveBookingMembers,
  type BookingMember,
  type ConsultMode,
} from '../config/appointmentSlots';
import { formatMoney } from '../utilities/formatters';
import { formatBookedOn } from '../config/bookedAppointments';
import {
  CONSULT_NOW_LANGUAGES,
  CONSULT_NOW_MODES,
  CONSULT_NOW_NEEDS,
  CONSULT_NOW_OFFER_SECONDS,
  formatOfferClock,
  nextWidenLanguage,
  type ConsultNowGender,
  type ConsultNowLanguage,
  type ConsultNowMode,
  type ConsultNowNeed,
  type ConsultNowNeedId,
} from '../config/consultNow';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetDoctorFilterOptionsQuery } from '../store/api/new/doctorsApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import {
  useCancelInstantConsultMutation,
  useGetInstantConsultStatusQuery,
  useRequestInstantConsultMutation,
} from '../store/api/new/teleApi';
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
  visibleCities: { id: string; nameKey?: TranslationKey; label?: string }[];
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
  offeredExperienceKey: TranslationKey | '';
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
  onAddMember,
}: {
  active: boolean;
  onBack: () => void;
  onBookEarliest: (query: string) => void;
  onAddMember?: () => void;
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
  const [instantRequestId, setInstantRequestId] = useState<number | null>(null);
  const [offerSeconds, setOfferSeconds] = useState(CONSULT_NOW_OFFER_SECONDS);
  const [feeDetailsOpen, setFeeDetailsOpen] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [requestInstant] = useRequestInstantConsultMutation();
  const [cancelInstant] = useCancelInstantConsultMutation();

  const resetSearch = useCallback(() => {
    setSearchingOpen(false);
    setMatchState('searching');
    setInstantRequestId(null);
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

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const authMobile = useAppSelector((state) => state.auth.mobile);

  const { data: filterOptions } = useGetDoctorFilterOptionsQuery(undefined, {
    skip: !active,
  });

  const { data: instantStatusResponse } = useGetInstantConsultStatusQuery(
    instantRequestId as number,
    {
      skip: instantRequestId == null || !searchingOpen,
      pollingInterval: searchingOpen ? 2500 : 0,
    },
  );
  const instantPoll = instantStatusResponse?.data;

  useEffect(() => {
    if (!searchingOpen || !instantPoll) return;
    const status = String(instantPoll.status || '').toUpperCase();
    if (status === 'OFFERED' || status === 'ACCEPTED') {
      setMatchState('offer');
      setOfferSeconds(CONSULT_NOW_OFFER_SECONDS);
      return;
    }
    if (status === 'NO_DOCTOR' || status === 'UNAVAILABLE' || status === 'CANCELLED') {
      setMatchState('none');
    }
  }, [instantPoll, searchingOpen]);

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
    if (instantRequestId != null) {
      void cancelInstant(instantRequestId)
        .unwrap()
        .catch(() => undefined);
    }
    setFeeDetailsOpen(false);
    setMatchState('none');
    setInstantRequestId(null);
  }, [cancelInstant, instantRequestId]);

  useEffect(() => {
    if (matchState === 'offer' && offerSeconds === 0 && !paymentOpen) {
      onDeclineOffer();
    }
  }, [matchState, offerSeconds, onDeclineOffer, paymentOpen]);

  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const homeDashboardData = homeDashboardResponse?.data;

  const patientFullName =
    homeDashboardData?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });
  const apiFamily = familyResponse?.data;

  const members = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily),
    [patientFullName, apiFamily],
  );

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const selectedNeed =
    CONSULT_NOW_NEEDS.find((item) => item.id === selectedNeedId) ?? CONSULT_NOW_NEEDS[0];
  // BE-011 — fees only from Instant poll; never invent PLATFORM_FEE.
  // TODO(PAYMENT): Pay still deferred (BE-P01 ConsultOrders + Verify).
  const currency = instantPoll?.currency ?? 'INR';
  const doctorFeeLabel = formatMoney(instantPoll?.consultFee ?? null, currency) ?? '';
  const platformFeeLabel =
    formatMoney(instantPoll?.platformFee ?? null, currency) ?? '';
  const taxesLabel = '';
  const totalLabel =
    formatMoney(instantPoll?.totalPayable ?? null, currency) ?? '';
  const feeLabel = totalLabel || doctorFeeLabel;
  void formatRupees;
  const selectedMemberLabel = member.self
    ? t('bookMyself')
    : member.relationshipName
      ? `${member.name} (${member.relationshipName})`
      : member.name;
  const apiCities = useMemo(
    () =>
      (filterOptions?.cities ?? []).map((city) => {
        const label = city.trim();
        return { id: label.toLowerCase(), label };
      }).filter((c) => c.label.length > 0),
    [filterOptions?.cities],
  );
  const visibleCities = useMemo(() => {
    const needle = locationQuery.trim().toLowerCase();
    if (!needle) return apiCities;
    return apiCities.filter((city) => city.label.toLowerCase().includes(needle));
  }, [apiCities, locationQuery]);

  const offerDoctorName = (instantPoll?.doctorName || '').trim();
  const offerDoctorId =
    instantPoll?.doctorId != null ? String(instantPoll.doctorId) : '';
  const offerInitials = offerDoctorName
    ? offerDoctorName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DR';
  const offerLanguageId = selectedLanguages[0] ?? 'mr';
  const modeLabel = t(
    CONSULT_NOW_MODES.find((item) => item.id === mode)?.labelKey ?? 'searchModeVideo',
  );
  const today = new Date();
  const instantDateLine = formatBookedOn(today, language, t(MONTH_KEYS[today.getMonth()]));
  const instantTimeLine = t('searchingNow');
  const instantWhenLabel = `${instantDateLine} · ${instantTimeLine}`;
  const instantPatientLabel = member.self
    ? member.name
    : member.relationshipName
      ? `${member.name} (${member.relationshipName}${member.age ? `, ${member.age} yrs` : ''})`
      : member.metaKey
        ? `${member.name} (${t(member.metaKey).replace(' • ', ', ')})`
        : member.name;
  const instantModeConsultLabel = t(modeConsultKey(mode));
  const widenLanguage = nextWidenLanguage(selectedLanguages);
  const bookingMode: ConsultMode =
    mode === 'audio' ? 'audio' : mode === 'chat' ? 'chat' : 'video';

  const offer: ConsultNowOfferVm | null =
    matchState === 'offer' && offerDoctorId
      ? {
          doctorId: offerDoctorId,
          doctorName: offerDoctorName || 'Doctor',
          initials: offerInitials,
          credentialsLine: '',
          ratingLabel: '',
          languageLabel: t(languageLabelKey(offerLanguageId)),
          modeLabel,
          feeLabel: feeLabel,
          acceptLabel: feeLabel
            ? t('offerAcceptPay').replace('{amount}', feeLabel)
            : t('offerAcceptPay').replace('{amount}', ''),
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
    availableLabel: t('consultNowAvailable').replace('{count}', ''),
    waitLabel: t('consultNowWait')
      .replace('{min}', '')
      .replace('{max}', ''),
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
    queueLabel:
      instantPoll?.queuePosition != null
        ? t('searchingQueue').replace(
            '{position}',
            String(instantPoll.queuePosition),
          )
        : '',
    queueWaitLabel: '',
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
    paymentSummaryLine: offerDoctorName
      ? t('payConsultWith')
          .replace('{name}', offerDoctorName)
          .replace('{when}', instantWhenLabel)
      : '',
    doctorFeeLabel,
    platformFeeLabel,
    taxesLabel,
    totalLabel,
    instantWhenLabel,
    instantDateLine,
    instantTimeLine,
    instantStartsAt: today.toISOString(),
    instantBookedOn: instantDateLine,
    instantModeConsultLabel,
    instantPatientLabel,
    offeredDoctorId: offerDoctorId,
    offeredDoctorInitials: offerInitials,
    offeredExperienceKey: '' as TranslationKey | '',
    bookingMode,
    onBack,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onAddMember: () => {
      setMemberPickerOpen(false);
      onAddMember?.();
    },
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
      setCallbackRequested(false);
      setSearchingOpen(true);
      setMatchState('searching');
      const contactName = (patientFullName || member.name || '').trim() || 'Patient';
      const contactMobile = (authMobile || authUser?.mobile || authUser?.mobileNo || '')
        .replace(/\D/g, '')
        .slice(-10);
      if (contactMobile.length < 10) {
        setMatchState('none');
        return;
      }
      void requestInstant({ contactName, contactMobile })
        .unwrap()
        .then((res) => {
          const id = res.instantConsultRequestId;
          if (id != null) {
            setInstantRequestId(id);
            if (String(res.status).toUpperCase() === 'OFFERED') {
              setMatchState('offer');
            }
          } else {
            setMatchState('none');
          }
        })
        .catch(() => {
          setMatchState('none');
        });
    },
    onCancelSearch: () => {
      if (instantRequestId != null) {
        void cancelInstant(instantRequestId)
          .unwrap()
          .catch(() => undefined);
      }
      onCancelSearch();
    },
    onAcceptOffer: () => {
      if (!offer) {
        return;
      }
      setFeeDetailsOpen(false);
      // Instant consult fees / patientAppId land with B-011 — do not open a broken pay sheet.
      // Guide users to book a scheduled slot until Instant ConsultOrders is available.
      setPaymentStatus(null);
      setPaymentOpen(false);
      onBookEarliest(t(selectedNeed.titleKey));
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
      const contactName = (patientFullName || member.name || '').trim() || 'Patient';
      const contactMobile = (authMobile || authUser?.mobile || authUser?.mobileNo || '')
        .replace(/\D/g, '')
        .slice(-10);
      if (contactMobile.length >= 10) {
        void requestInstant({ contactName, contactMobile })
          .unwrap()
          .then((res) => {
            if (res.instantConsultRequestId != null) {
              setInstantRequestId(res.instantConsultRequestId);
            }
          })
          .catch(() => setMatchState('none'));
      }
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
