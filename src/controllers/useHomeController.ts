import { useCallback, useState } from 'react';

import { useAccountController, type AccountViewModel } from './useAccountController';
import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type HomeTab =
  | 'home'
  | 'doctors'
  | 'records'
  | 'medicines'
  | 'account';

export type HomeMemberOption = {
  id: string;
  nameKey?: TranslationKey;
  name?: string;
};

export type HomeViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  patientFirstName: string;
  greeting: string;
  searchOpen: boolean;
  resultsOpen: boolean;
  resultsQuery: string;
  searchNonce: number;
  selectedTab: HomeTab;
  selectedMemberId: string;
  memberPickerOpen: boolean;
  memberOptions: HomeMemberOption[];
  selectedMemberLabel: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onOpenResults: (query: string) => void;
  onCloseResults: () => void;
  onReopenSearch: () => void;
  onSelectTab: (tab: HomeTab) => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (memberId: string) => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onOpenNotifications: () => void;
  onJoinConsultation: () => void;
  onFillSymptomDiary: () => void;
  onTrackOrder: () => void;
  onViewAllCategories: () => void;
  profileDoctorId: string | null;
  onOpenDoctorProfile: (doctorId: string) => void;
  onCloseDoctorProfile: () => void;
  bookingOpen: boolean;
  onOpenBooking: () => void;
  onCloseBooking: () => void;
  healthTipId: string | null;
  onOpenHealthTip: (tipId: string) => void;
  onCloseHealthTip: () => void;
  onFindDoctorFromTip: (query: string) => void;
  appointments: BookedAppointment[];
  onConfirmBooking: (item: BookedAppointment) => void;
  onFinishBookingFlow: () => void;
  account: AccountViewModel;
};

const PATIENT_FIRST_NAME = 'Pranav';

export function useHomeController({
  onLogOut,
}: {
  onLogOut: () => void;
} = { onLogOut: () => undefined }): HomeViewModel {
  const { language, setLanguage, t } = useLocalization();
  const account = useAccountController({ onLogOut });
  const [searchOpen, setSearchOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsQuery, setResultsQuery] = useState('');
  const [searchNonce, setSearchNonce] = useState(0);
  const [searchOrigin, setSearchOrigin] = useState<HomeTab>('home');
  const [selectedTab, setSelectedTab] = useState<HomeTab>('home');
  const [profileDoctorId, setProfileDoctorId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [healthTipId, setHealthTipId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);

  const onConfirmBooking = useCallback((item: BookedAppointment) => {
    setAppointments((current) => {
      if (current.some((row) => row.id === item.id)) {
        return current;
      }
      return [item, ...current];
    });
  }, []);

  const onFinishBookingFlow = useCallback(() => {
    setBookingOpen(false);
    setProfileDoctorId(null);
    setSearchOpen(false);
    setResultsOpen(false);
    setHealthTipId(null);
    setSelectedTab('doctors');
  }, []);

  const memberOptions: HomeMemberOption[] = [
    { id: 'self', nameKey: 'homeForMyself' },
    { id: 'aarav', name: 'Aarav' },
  ];

  const selectedMember = memberOptions.find(
    (option) => option.id === selectedMemberId,
  );
  const selectedMemberLabel = selectedMember?.nameKey
    ? t(selectedMember.nameKey)
    : (selectedMember?.name ?? t('homeForMyself'));

  return {
    language,
    t,
    patientFirstName: PATIENT_FIRST_NAME,
    greeting: `${t('homeHello')}, ${PATIENT_FIRST_NAME}`,
    searchOpen,
    resultsOpen,
    resultsQuery,
    searchNonce,
    selectedTab,
    selectedMemberId,
    memberPickerOpen,
    memberOptions,
    selectedMemberLabel,
    onOpenSearch: () => {
      if (!searchOpen && !resultsOpen) {
        setSearchOrigin(selectedTab);
      }
      setResultsOpen(false);
      setSearchOpen(true);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
    },
    onCloseSearch: () => {
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setSelectedTab(searchOrigin);
    },
    onOpenResults: (query) => {
      setResultsQuery(query);
      setSearchNonce((current) => current + 1);
      setSelectedTab('doctors');
      setSearchOpen(true);
      setResultsOpen(true);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
    },
    onCloseResults: () => {
      setResultsOpen(false);
      setSearchOpen(true);
      setProfileDoctorId(null);
    },
    onReopenSearch: () => {
      setResultsOpen(false);
      setSearchOpen(true);
      setProfileDoctorId(null);
    },
    onSelectTab: (tab) => {
      setSelectedTab(tab);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      if (tab !== 'doctors') {
        setResultsOpen(false);
        setSearchOpen(false);
      }
    },
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (memberId) => {
      setSelectedMemberId(memberId);
      setMemberPickerOpen(false);
    },
    onSelectLanguage: setLanguage,
    onOpenNotifications: () => undefined,
    onJoinConsultation: () => undefined,
    onFillSymptomDiary: () => undefined,
    onTrackOrder: () => undefined,
    onViewAllCategories: () => undefined,
    profileDoctorId,
    onOpenDoctorProfile: (doctorId) => {
      setHealthTipId(null);
      setBookingOpen(false);
      setProfileDoctorId(doctorId);
    },
    onCloseDoctorProfile: () => {
      setBookingOpen(false);
      setProfileDoctorId(null);
    },
    bookingOpen,
    onOpenBooking: () => setBookingOpen(true),
    onCloseBooking: () => setBookingOpen(false),
    healthTipId,
    onOpenHealthTip: (tipId) => {
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(tipId);
    },
    onCloseHealthTip: () => setHealthTipId(null),
    appointments,
    onConfirmBooking,
    onFinishBookingFlow,
    onFindDoctorFromTip: (query) => {
      setHealthTipId(null);
      setResultsQuery(query);
      setSearchNonce((current) => current + 1);
      setSelectedTab('doctors');
      setSearchOpen(true);
      setResultsOpen(true);
      setProfileDoctorId(null);
    },
    account,
  };
}
