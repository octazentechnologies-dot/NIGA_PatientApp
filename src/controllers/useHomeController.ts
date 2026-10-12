import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAccountController, type AccountViewModel } from './useAccountController';
import type { HelpTopicId } from './useHelpCentreController';
import type { LegalDocId } from './useLegalDocumentController';
import type { BookedAppointment } from '../config/bookedAppointments';
import { createSeedFollowUpChat } from '../config/bookedAppointments';
import {
  BOOKING_MEMBERS,
  type BookingMember,
  resolveBookingMembers,
} from '../config/appointmentSlots';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import {
  useGetDoctorsQuery,
  type PublicDoctor,
} from '../store/api/new/doctorsApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';

export type HomeTab =
  | 'home'
  | 'doctors'
  | 'records'
  | 'medicines'
  | 'account';

export type HomeMemberOption = BookingMember;

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
  onAddMember: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onJoinConsultation: () => void;
  onFillSymptomDiary: () => void;
  onTrackOrder: () => void;
  orderTrackingOpen: boolean;
  onOpenOrderTracking: () => void;
  onCloseOrderTracking: () => void;
  medicineOrderPlaced: boolean;
  onPlaceMedicineOrder: () => void;
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
  selectedAppointmentId: string | null;
  onOpenAppointment: (id: string) => void;
  onCloseAppointment: () => void;
  onConfirmBooking: (item: BookedAppointment) => void;
  onFinishBookingFlow: () => void;
  onRemoveAppointment: (id: string) => void;
  onUpdateAppointment: (id: string, patch: Partial<BookedAppointment>) => void;
  onBookAnotherConsultation: () => void;
  consultNowOpen: boolean;
  onOpenConsultNow: () => void;
  onCloseConsultNow: () => void;
  followUpPlanAvailable: boolean;
  followUpPlanOpen: boolean;
  onActivateFollowUpPlan: () => void;
  onOpenFollowUpPlan: () => void;
  onCloseFollowUpPlan: () => void;
  symptomDiaryOpen: boolean;
  onOpenSymptomDiary: () => void;
  onCloseSymptomDiary: () => void;
  clinisightProgressOpen: boolean;
  onOpenCliniSightProgress: () => void;
  onCloseCliniSightProgress: () => void;
  healthInsightsOpen: boolean;
  onOpenHealthInsights: () => void;
  onCloseHealthInsights: () => void;
  remindersOpen: boolean;
  onOpenReminders: () => void;
  onCloseReminders: () => void;
  editProfileOpen: boolean;
  onOpenEditProfile: () => void;
  onCloseEditProfile: () => void;
  accountFamilyOpen: boolean;
  onOpenAccountFamily: () => void;
  onCloseAccountFamily: () => void;
  myAppointmentsOpen: boolean;
  onOpenMyAppointments: () => void;
  onCloseMyAppointments: () => void;
  accountRecordsOpen: boolean;
  accountRecordsFilter: 'all' | 'prescriptions';
  onOpenAccountRecords: (filter?: 'all' | 'prescriptions') => void;
  onCloseAccountRecords: () => void;
  paymentsOpen: boolean;
  onOpenPayments: () => void;
  onClosePayments: () => void;
  consentCentreOpen: boolean;
  onOpenConsentCentre: () => void;
  onCloseConsentCentre: () => void;
  myReviewsOpen: boolean;
  onOpenMyReviews: () => void;
  onCloseMyReviews: () => void;
  appealReviewOpen: boolean;
  onOpenAppealReview: (reviewId?: string) => void;
  onCloseAppealReview: () => void;
  helpCentreOpen: boolean;
  onOpenHelpCentre: () => void;
  onCloseHelpCentre: () => void;
  raiseTicketOpen: boolean;
  raiseTicketTopicId: HelpTopicId;
  onOpenRaiseTicket: (topicId: HelpTopicId) => void;
  onCloseRaiseTicket: () => void;
  bookWithHelpOpen: boolean;
  onOpenBookWithHelp: () => void;
  onCloseBookWithHelp: () => void;
  legalDocId: LegalDocId | null;
  onOpenLegalDoc: (doc: LegalDocId) => void;
  onCloseLegalDoc: () => void;
  notificationsOpen: boolean;
  onOpenNotifications: () => void;
  onCloseNotifications: () => void;
  notificationSettingsOpen: boolean;
  onOpenNotificationSettings: () => void;
  onCloseNotificationSettings: () => void;
  orderMedicinesOpen: boolean;
  onOpenOrderMedicines: () => void;
  onCloseOrderMedicines: () => void;
  orderDetailsOpen: boolean;
  orderDetailsId: string | null;
  onOpenOrderDetails: (orderId: string) => void;
  onCloseOrderDetails: () => void;
  publicDoctors: PublicDoctor[];
  isDoctorsLoading: boolean;
  isDoctorsError: boolean;
  refetchDoctors: () => void;
  account: AccountViewModel;
};

export function useHomeController({
  onLogOut,
}: {
  onLogOut: () => void;
} = { onLogOut: () => undefined }): HomeViewModel {
  const { language, setLanguage, t } = useLocalization();
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
  const [appointments, setAppointments] = useState<BookedAppointment[]>(() => [
    createSeedFollowUpChat(),
  ]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(
    null,
  );
  const [consultNowOpen, setConsultNowOpen] = useState(false);
  const [followUpPlanAvailable, setFollowUpPlanAvailable] = useState(false);
  const [followUpPlanOpen, setFollowUpPlanOpen] = useState(false);
  const [symptomDiaryOpen, setSymptomDiaryOpen] = useState(false);
  const [clinisightProgressOpen, setCliniSightProgressOpen] = useState(false);
  const [healthInsightsOpen, setHealthInsightsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [accountFamilyOpen, setAccountFamilyOpen] = useState(false);
  const [myAppointmentsOpen, setMyAppointmentsOpen] = useState(false);
  const [accountRecordsOpen, setAccountRecordsOpen] = useState(false);
  const [accountRecordsFilter, setAccountRecordsFilter] = useState<
    'all' | 'prescriptions'
  >('all');
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [consentCentreOpen, setConsentCentreOpen] = useState(false);
  const [myReviewsOpen, setMyReviewsOpen] = useState(false);
  const [appealReviewOpen, setAppealReviewOpen] = useState(false);
  const [helpCentreOpen, setHelpCentreOpen] = useState(false);
  const [raiseTicketOpen, setRaiseTicketOpen] = useState(false);
  const [raiseTicketTopicId, setRaiseTicketTopicId] =
    useState<HelpTopicId>('medicines');
  const [bookWithHelpOpen, setBookWithHelpOpen] = useState(false);
  const [legalDocId, setLegalDocId] = useState<LegalDocId | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [orderMedicinesOpen, setOrderMedicinesOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [medicineOrderPlaced, setMedicineOrderPlaced] = useState(false);
  const [orderDetailsId, setOrderDetailsId] = useState<string | null>(null);

  const {
    data: publicDoctors = [],
    isLoading: isDoctorsLoading,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useGetDoctorsQuery(undefined);

  useEffect(() => {
    if (isDoctorsError) {
      console.warn('[GET api/Public/Doctors] Request failed');
    }
  }, [isDoctorsError]);

  const closeAccountOverlays = () => {
    setEditProfileOpen(false);
    setAccountFamilyOpen(false);
    setMyAppointmentsOpen(false);
    setAccountRecordsOpen(false);
    setHealthInsightsOpen(false);
    setRemindersOpen(false);
    setCliniSightProgressOpen(false);
    setPaymentsOpen(false);
    setConsentCentreOpen(false);
  };

  const account = useAccountController({
    onLogOut,
    onOpenEditProfile: () => {
      closeAccountOverlays();
      setEditProfileOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onOpenFamilyMembers: () => {
      closeAccountOverlays();
      setAccountFamilyOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenAppointments: () => {
      closeAccountOverlays();
      setMyAppointmentsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenPrescriptions: () => {
      closeAccountOverlays();
      setAccountRecordsFilter('prescriptions');
      setAccountRecordsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenHealthRecords: () => {
      closeAccountOverlays();
      setAccountRecordsFilter('all');
      setAccountRecordsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
    },
    onOpenHealthInsights: () => {
      closeAccountOverlays();
      setHealthInsightsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onOpenReminders: () => {
      closeAccountOverlays();
      setRemindersOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onOpenPayments: () => {
      closeAccountOverlays();
      setPaymentsOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setOrderMedicinesOpen(false);
      setOrderTrackingOpen(false);
    },
    onOpenConsentCentre: () => {
      closeAccountOverlays();
      setConsentCentreOpen(true);
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
      setNotificationsOpen(false);
      setNotificationSettingsOpen(false);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
    },
    onOpenMyReviews: () => {
      setMyReviewsOpen(true);
      setAppealReviewOpen(false);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
      setNotificationSettingsOpen(false);
      closeAccountOverlays();
      setMyReviewsOpen(true);
    },
    onOpenHelpCentre: () => {
      setHelpCentreOpen(true);
      setRaiseTicketOpen(false);
      setBookWithHelpOpen(false);
      setLegalDocId(null);
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
      setNotificationSettingsOpen(false);
      closeAccountOverlays();
      setHelpCentreOpen(true);
    },
    onOpenBookWithHelp: () => {
      setBookWithHelpOpen(true);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setLegalDocId(null);
      setMyReviewsOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
      closeAccountOverlays();
      setBookWithHelpOpen(true);
    },
    onOpenLegalDoc: (doc) => {
      setLegalDocId(doc);
      setBookWithHelpOpen(false);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setMyReviewsOpen(false);
      setConsentCentreOpen(false);
      closeAccountOverlays();
      setLegalDocId(doc);
    },
    onOpenNotificationSettings: () => {
      setNotificationSettingsOpen(true);
      setNotificationsOpen(false);
      setConsentCentreOpen(false);
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
      setBookWithHelpOpen(false);
      setLegalDocId(null);
      setPaymentsOpen(false);
      closeAccountOverlays();
      setNotificationSettingsOpen(true);
    },
  });

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
    setSelectedAppointmentId(null);
    setSelectedTab('doctors');
  }, []);

  const authUser = useAppSelector((state) => state.auth.user);
  const patientFullName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const patientFirstName =
    authUser?.firstName ||
    (authUser?.patientName ? authUser.patientName.split(' ')[0] : '');

  const { data: familyResponse } = useGetFamilyQuery();
  const apiFamily = familyResponse?.data;

  const memberOptions: HomeMemberOption[] = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily),
    [patientFullName, apiFamily],
  );

  const selectedMember =
    memberOptions.find((option) => option.id === selectedMemberId) ??
    memberOptions[0];
  const selectedMemberLabel = selectedMember.self
    ? t('bookMyself')
    : selectedMember.name.split(' ')[0];

  const greeting = patientFirstName
    ? `${t('homeHello')}, ${patientFirstName}`
    : t('homeHello');

  return {
    language,
    t,
    patientFirstName,
    greeting,
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
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
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
      setConsultNowOpen(false);
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
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setHealthInsightsOpen(false);
      setRemindersOpen(false);
      setEditProfileOpen(false);
      setAccountFamilyOpen(false);
      setMyAppointmentsOpen(false);
      setAccountRecordsOpen(false);
      setCliniSightProgressOpen(false);
      setOrderMedicinesOpen(false);
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
    onAddMember: () => {
      setMemberPickerOpen(false);
      closeAccountOverlays();
      setAccountFamilyOpen(true);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onSelectLanguage: setLanguage,
    onOpenNotifications: () => {
      setNotificationsOpen(true);
      setNotificationSettingsOpen(false);
    },
    onJoinConsultation: () => {
      const joinable = appointments.find(
        (item) => item.mode === 'video' || item.mode === 'audio',
      );
      if (joinable) {
        setSelectedAppointmentId(joinable.id);
      }
    },
    onFillSymptomDiary: () => {
      setSymptomDiaryOpen(true);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
    },
    onTrackOrder: () => {
      setOrderTrackingOpen(true);
      setOrderMedicinesOpen(false);
    },
    orderTrackingOpen,
    onOpenOrderTracking: () => {
      setOrderTrackingOpen(true);
      setOrderMedicinesOpen(false);
    },
    onCloseOrderTracking: () => setOrderTrackingOpen(false),
    medicineOrderPlaced,
    onPlaceMedicineOrder: () => {
      setMedicineOrderPlaced(true);
      setOrderMedicinesOpen(false);
      setOrderTrackingOpen(false);
      setSelectedTab('medicines');
      setSelectedMemberId('self');
    },
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
    selectedAppointmentId,
    onOpenAppointment: (id) => {
      setAppointments((current) =>
        current.map((row) =>
          row.id === id && row.status === 'waiting_acceptance'
            ? { ...row, status: 'confirmed' }
            : row,
        ),
      );
      setMyAppointmentsOpen(false);
      setAccountRecordsOpen(false);
      setEditProfileOpen(false);
      setAccountFamilyOpen(false);
      setSelectedAppointmentId(id);
    },
    onCloseAppointment: () => setSelectedAppointmentId(null),
    onConfirmBooking,
    onFinishBookingFlow,
    onRemoveAppointment: (id) => {
      setAppointments((current) => current.filter((row) => row.id !== id));
    },
    onUpdateAppointment: (id, patch) => {
      setAppointments((current) =>
        current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      );
    },
    consultNowOpen,
    onOpenConsultNow: () => {
      setConsultNowOpen(true);
      setSearchOpen(false);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
      setHealthTipId(null);
      setSelectedAppointmentId(null);
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
    },
    onCloseConsultNow: () => setConsultNowOpen(false),
    followUpPlanAvailable,
    followUpPlanOpen,
    onActivateFollowUpPlan: () => setFollowUpPlanAvailable(true),
    onOpenFollowUpPlan: () => {
      setFollowUpPlanAvailable(true);
      setFollowUpPlanOpen(true);
      setSymptomDiaryOpen(false);
      setSelectedAppointmentId(null);
      setConsultNowOpen(false);
      setBookingOpen(false);
      setProfileDoctorId(null);
      setHealthTipId(null);
      setSelectedTab('home');
    },
    onCloseFollowUpPlan: () => {
      setFollowUpPlanOpen(false);
      setSymptomDiaryOpen(false);
    },
    symptomDiaryOpen,
    onOpenSymptomDiary: () => setSymptomDiaryOpen(true),
    onCloseSymptomDiary: () => setSymptomDiaryOpen(false),
    clinisightProgressOpen,
    onOpenCliniSightProgress: () => setCliniSightProgressOpen(true),
    onCloseCliniSightProgress: () => setCliniSightProgressOpen(false),
    healthInsightsOpen,
    onOpenHealthInsights: () => {
      setHealthInsightsOpen(true);
      setCliniSightProgressOpen(false);
    },
    onCloseHealthInsights: () => setHealthInsightsOpen(false),
    remindersOpen,
    onOpenReminders: () => {
      setRemindersOpen(true);
      setHealthInsightsOpen(false);
      setCliniSightProgressOpen(false);
    },
    onCloseReminders: () => setRemindersOpen(false),
    editProfileOpen,
    onOpenEditProfile: () => setEditProfileOpen(true),
    onCloseEditProfile: () => setEditProfileOpen(false),
    accountFamilyOpen,
    onOpenAccountFamily: () => setAccountFamilyOpen(true),
    onCloseAccountFamily: () => setAccountFamilyOpen(false),
    myAppointmentsOpen,
    onOpenMyAppointments: () => setMyAppointmentsOpen(true),
    onCloseMyAppointments: () => setMyAppointmentsOpen(false),
    accountRecordsOpen,
    accountRecordsFilter,
    onOpenAccountRecords: (filter = 'all') => {
      setAccountRecordsFilter(filter);
      setAccountRecordsOpen(true);
    },
    onCloseAccountRecords: () => setAccountRecordsOpen(false),
    paymentsOpen,
    onOpenPayments: () => setPaymentsOpen(true),
    onClosePayments: () => setPaymentsOpen(false),
    consentCentreOpen,
    onOpenConsentCentre: () => setConsentCentreOpen(true),
    onCloseConsentCentre: () => setConsentCentreOpen(false),
    myReviewsOpen,
    onOpenMyReviews: () => {
      setMyReviewsOpen(true);
      setAppealReviewOpen(false);
    },
    onCloseMyReviews: () => {
      setMyReviewsOpen(false);
      setAppealReviewOpen(false);
    },
    appealReviewOpen,
    onOpenAppealReview: () => setAppealReviewOpen(true),
    onCloseAppealReview: () => setAppealReviewOpen(false),
    helpCentreOpen,
    onOpenHelpCentre: () => {
      setHelpCentreOpen(true);
      setRaiseTicketOpen(false);
    },
    onCloseHelpCentre: () => {
      setHelpCentreOpen(false);
      setRaiseTicketOpen(false);
    },
    raiseTicketOpen,
    raiseTicketTopicId,
    onOpenRaiseTicket: (topicId) => {
      setRaiseTicketTopicId(topicId);
      setRaiseTicketOpen(true);
    },
    onCloseRaiseTicket: () => setRaiseTicketOpen(false),
    bookWithHelpOpen,
    onOpenBookWithHelp: () => {
      setBookWithHelpOpen(true);
      setLegalDocId(null);
    },
    onCloseBookWithHelp: () => setBookWithHelpOpen(false),
    legalDocId,
    onOpenLegalDoc: (doc) => {
      setLegalDocId(doc);
      setBookWithHelpOpen(false);
    },
    onCloseLegalDoc: () => setLegalDocId(null),
    notificationsOpen,
    onCloseNotifications: () => setNotificationsOpen(false),
    notificationSettingsOpen,
    onOpenNotificationSettings: () => {
      setNotificationSettingsOpen(true);
      setNotificationsOpen(false);
      setConsentCentreOpen(false);
      setPaymentsOpen(false);
    },
    onCloseNotificationSettings: () => setNotificationSettingsOpen(false),
    orderMedicinesOpen,
    onOpenOrderMedicines: () => {
      setOrderMedicinesOpen(true);
      setSymptomDiaryOpen(false);
      setHealthInsightsOpen(false);
      setRemindersOpen(false);
      setCliniSightProgressOpen(false);
      setFollowUpPlanOpen(false);
    },
    onCloseOrderMedicines: () => setOrderMedicinesOpen(false),
    orderDetailsOpen: Boolean(orderDetailsId),
    orderDetailsId,
    onOpenOrderDetails: (orderId) => {
      setOrderDetailsId(orderId);
      setOrderMedicinesOpen(false);
      setOrderTrackingOpen(false);
    },
    onCloseOrderDetails: () => setOrderDetailsId(null),
    onBookAnotherConsultation: () => {
      setSelectedAppointmentId(null);
      setSelectedTab('doctors');
      setSearchOpen(true);
      setResultsOpen(false);
      setProfileDoctorId(null);
      setBookingOpen(false);
    },
    onFindDoctorFromTip: (query) => {
      setHealthTipId(null);
      setResultsQuery(query);
      setSearchNonce((current) => current + 1);
      setSelectedTab('doctors');
      setSearchOpen(true);
      setResultsOpen(true);
      setProfileDoctorId(null);
    },
    publicDoctors,
    isDoctorsLoading,
    isDoctorsError,
    refetchDoctors,
    account,
  };
}
