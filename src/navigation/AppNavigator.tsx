import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SlideStrip } from '../components/SlideStrip';
import { StatusBarBleed } from '../components/StatusBarBleed';
import { useHardwareBackHandler } from '../hooks/useHardwareBackHandler';
import { usePushNotificationLifecycle } from '../hooks/usePushNotificationLifecycle';
import {
  clearAuthCredentials,
  getAccessToken,
  getAuthUserData,
  getBookingSessionId,
  hasLanguageSelectionCompleted,
  hasOnboardingCompleted,
  saveAccessToken,
  saveAuthUserData,
  setLanguageSelectionCompleted,
  setOnboardingCompleted,
} from '../services/secureStorage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { performLogout, resetAuthenticatedSession } from '../store/session';
import {
  clearAuthState,
  markAuthInitialized,
  setAuthenticated,
  setAuthUser,
  setBookingSession,
  setSessionEndedMessage,
  type AuthUser,
} from '../store/slices/authSlice';
import type { TranslationKey } from '../localization/types';
import { accountApi } from '../store/api/new/accountApi';
import { newBaseApi } from '../store/api/new/newBaseApi';
import { patientProfileApi } from '../store/api/new/patientProfileApi';
import { isJwtExpiringWithin, parseJwtClaims } from '../utilities/jwt';
import { useCompleteProfileController } from '../controllers/useCompleteProfileController';
import { useConsentController } from '../controllers/useConsentController';
import { useFamilyMembersController } from '../controllers/useFamilyMembersController';
import { useFirstLaunchController } from '../controllers/useFirstLaunchController';
import { useHomeController } from '../controllers/useHomeController';
import { useOnboardingController } from '../controllers/useOnboardingController';
import { useOtpVerificationController } from '../controllers/useOtpVerificationController';
import { useSearchDoctorsController } from '../controllers/useSearchDoctorsController';
import { useSearchResultsController } from '../controllers/useSearchResultsController';
import { useDoctorProfileController } from '../controllers/useDoctorProfileController';
import { useBookAppointmentController } from '../controllers/useBookAppointmentController';
import { useBookingPaymentController } from '../controllers/useBookingPaymentController';
import { useBookingReviewController } from '../controllers/useBookingReviewController';
import { useAppointmentDetailController } from '../controllers/useAppointmentDetailController';
import { useDeviceCheckController } from '../controllers/useDeviceCheckController';
import { usePhoneSetupController } from '../controllers/usePhoneSetupController';
import { useJoinFailedController } from '../controllers/useJoinFailedController';
import { useConsultationChatController } from '../controllers/useConsultationChatController';
import { useConsultationCompleteController } from '../controllers/useConsultationCompleteController';
import { useRateConsultationController } from '../controllers/useRateConsultationController';
import { useWaitingRoomController } from '../controllers/useWaitingRoomController';
import { useVideoCallController } from '../controllers/useVideoCallController';
import { usePaymentStatusController } from '../controllers/usePaymentStatusController';
import { useConsultNowController } from '../controllers/useConsultNowController';
import { useFollowUpPlanController } from '../controllers/useFollowUpPlanController';
import { useHealthTipController } from '../controllers/useHealthTipController';
import { useSignInController } from '../controllers/useSignInController';
import { useSplashController } from '../controllers/useSplashController';
import { useSymptomDiaryController } from '../controllers/useSymptomDiaryController';
import { useCliniSightProgressController } from '../controllers/useCliniSightProgressController';
import { useHealthInsightsController } from '../controllers/useHealthInsightsController';
import { useRemindersCentreController } from '../controllers/useRemindersCentreController';
import { useMedicineCheckoutController } from '../controllers/useMedicineCheckoutController';
import { useOrderMedicinesController } from '../controllers/useOrderMedicinesController';
import { useOrderTrackingController } from '../controllers/useOrderTrackingController';
import { useOrderDetailsController } from '../controllers/useOrderDetailsController';
import { usePaymentsController } from '../controllers/usePaymentsController';
import { useConsentCentreController } from '../controllers/useConsentCentreController';
import { useMyReviewsController } from '../controllers/useMyReviewsController';
import { useAppealReviewController } from '../controllers/useAppealReviewController';
import { useHelpCentreController } from '../controllers/useHelpCentreController';
import { useRaiseTicketController } from '../controllers/useRaiseTicketController';
import { useBookWithHelpController } from '../controllers/useBookWithHelpController';
import { useLegalDocumentController } from '../controllers/useLegalDocumentController';
import { useNotificationsController } from '../controllers/useNotificationsController';
import { useNotificationSettingsController } from '../controllers/useNotificationSettingsController';
import { colors } from '../theme/colors';
import { useAndroidStatusBarBackground } from '../utilities/useAndroidPageStatusBar';
import { CompleteProfileView } from '../views/CompleteProfileView';
import { ConsentView } from '../views/ConsentView';
import { FamilyMembersView } from '../views/FamilyMembersView';
import { FirstLaunchView } from '../views/FirstLaunchView';
import { FollowUpPlanView } from '../views/FollowUpPlanView';
import { HomeView } from '../views/HomeView';
import { SymptomDiaryView } from '../views/SymptomDiaryView';
import { CliniSightProgressView } from '../views/CliniSightProgressView';
import { HealthInsightsView } from '../views/HealthInsightsView';
import { HealthRecordsView } from '../views/HealthRecordsView';
import { MyAppointmentsView } from '../views/MyAppointmentsView';
import { AppointmentRequestsView } from '../views/AppointmentRequestsView';
import { useAppointmentRequestsController } from '../controllers/useAppointmentRequestsController';
import { useMyAppointmentsController } from '../controllers/useMyAppointmentsController';
import { RemindersCentreView } from '../views/RemindersCentreView';
import { MedicineCheckoutView } from '../views/MedicineCheckoutView';
import { OrderMedicinesView } from '../views/OrderMedicinesView';
import { OrderTrackingView } from '../views/OrderTrackingView';
import { OrderDetailsView } from '../views/OrderDetailsView';
import { PaymentsView } from '../views/PaymentsView';
import { ConsentCentreView } from '../views/ConsentCentreView';
import { MyReviewsView } from '../views/MyReviewsView';
import { AppealReviewView } from '../views/AppealReviewView';
import { HelpCentreView } from '../views/HelpCentreView';
import { RaiseTicketView } from '../views/RaiseTicketView';
import { BookWithHelpView } from '../views/BookWithHelpView';
import { LegalDocumentView } from '../views/LegalDocumentView';
import { NotificationsView } from '../views/NotificationsView';
import { NotificationSettingsView } from '../views/NotificationSettingsView';
import { OnboardingSlideView } from '../views/OnboardingSlideView';
import { OtpVerificationView } from '../views/OtpVerificationView';
import { SearchDoctorsView } from '../views/SearchDoctorsView';
import { SearchResultsView } from '../views/SearchResultsView';
import { DoctorProfileView } from '../views/DoctorProfileView';
import { BookAppointmentView } from '../views/BookAppointmentView';
import { BookingPaymentView } from '../views/BookingPaymentView';
import { BookingReviewView } from '../views/BookingReviewView';
import { ConsultNowView } from '../views/ConsultNowView';
import { ConsultNowSearchingView } from '../views/ConsultNowSearchingView';
import { AppointmentDetailView } from '../views/AppointmentDetailView';
import { ClinicAppointmentView } from '../views/ClinicAppointmentView';
import { ClinicCheckInView } from '../views/ClinicCheckInView';
import { CancelledConfirmationView } from '../views/CancelledConfirmationView';
import { DeviceCheckView } from '../views/DeviceCheckView';
import { PhoneSetupView } from '../views/PhoneSetupView';
import { JoinFailedView } from '../views/JoinFailedView';
import { ConsultationChatView } from '../views/ConsultationChatView';
import { ConsultationCompleteView } from '../views/ConsultationCompleteView';
import { RateConsultationView } from '../views/RateConsultationView';
import { WaitingRoomView } from '../views/WaitingRoomView';
import { VideoCallView } from '../views/VideoCallView';
import { RescheduleAppointmentView } from '../views/RescheduleAppointmentView';
import { PaymentStatusView } from '../views/PaymentStatusView';
import { HealthTipArticleView } from '../views/HealthTipArticleView';
import { SignInView } from '../views/SignInView';
import { SplashView } from '../views/SplashView';

type AppStep =
  | 'splash'
  | 'firstLaunch'
  | 'onboarding'
  | 'signIn'
  | 'otp'
  | 'completeProfile'
  | 'consent'
  | 'phoneSetup'
  | 'familyMembers'
  | 'home';

const SLIDE_STEPS = [
  'firstLaunch',
  'onboarding',
  'signIn',
  'otp',
  'completeProfile',
  'consent',
  'phoneSetup',
  'familyMembers',
  'home',
] as const;

function SplashRoute({ onFinished }: { onFinished: () => void }) {
  const splash = useSplashController(onFinished);
  return <SplashView {...splash} />;
}

function FirstLaunchRoute({ onContinue }: { onContinue: () => void }) {
  const firstLaunch = useFirstLaunchController(onContinue);
  return <FirstLaunchView {...firstLaunch} />;
}

function OnboardingRoute({ onFinished }: { onFinished: () => void }) {
  const onboarding = useOnboardingController({
    onSkip: onFinished,
    onFinished,
    onHaveAccount: onFinished,
  });
  return <OnboardingSlideView {...onboarding} />;
}

function SignInRoute({
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
}) {
  const signIn = useSignInController({ onBack, onOtpRequested });
  return <SignInView {...signIn} />;
}

function OtpRoute({
  mobileNumber,
  devOtp,
  isUserRegistered,
  active,
  onBack,
  onVerified,
}: {
  mobileNumber: string;
  devOtp?: string;
  isUserRegistered?: boolean;
  active: boolean;
  onBack: () => void;
  onVerified: (isRegistered?: boolean) => void;
}) {
  const otp = useOtpVerificationController({
    mobileNumber,
    initialDevOtp: devOtp,
    initialIsUserRegistered: isUserRegistered,
    active,
    onBack,
    onVerified,
  });
  return <OtpVerificationView {...otp} />;
}

function CompleteProfileRoute({
  mobileNumber,
  countryCode,
  onBack,
  onContinue,
  onSkip,
}: {
  mobileNumber?: string;
  countryCode?: string;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const profile = useCompleteProfileController({
    initialMobileNumber: mobileNumber,
    initialCountryCode: countryCode,
    onBack,
    onContinue,
    onSkip,
  });
  return <CompleteProfileView {...profile} />;
}

function ConsentRoute({
  active,
  onBack,
  onFinished,
}: {
  active: boolean;
  onBack: () => void;
  onFinished: () => void;
}) {
  const consent = useConsentController({
    active,
    onBack,
    onAgree: onFinished,
    onManageLater: onFinished,
  });
  return <ConsentView {...consent} />;
}

function PhoneSetupRoute({
  active,
  onBack,
  onContinue,
}: {
  active: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  const phoneSetup = usePhoneSetupController({ active, onBack, onContinue });
  return <PhoneSetupView {...phoneSetup} />;
}

function FamilyMembersRoute({
  onBack,
  onContinue,
  onSkip,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const family = useFamilyMembersController({ onBack, onContinue, onSkip });
  return <FamilyMembersView {...family} />;
}

function HomeRoute({ onLogOut }: { onLogOut: () => void }) {
  const dispatch = useAppDispatch();
  const home = useHomeController({ onLogOut });
  const homeRef = useRef(home);
  homeRef.current = home;

  const notificationNavigation = useMemo(
    () => ({
      openAppointment: (id: string) => {
        const exists = homeRef.current.appointments.some((item) => item.id === id);
        if (exists) {
          homeRef.current.onOpenAppointment(id);
          return;
        }
        homeRef.current.onOpenMyAppointments();
      },
      openMyAppointments: () => homeRef.current.onOpenMyAppointments(),
      openPrescriptions: () =>
        homeRef.current.onOpenAccountRecords('prescriptions'),
      openHealthRecords: () => homeRef.current.onOpenAccountRecords('all'),
      openNotificationsInbox: () => homeRef.current.onOpenNotifications(),
    }),
    [],
  );

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const refreshNotificationInbox = useCallback(() => {
    dispatch(newBaseApi.util.invalidateTags(['Notifications']));
  }, [dispatch]);

  usePushNotificationLifecycle({
    authenticated: isAuthenticated,
    navigation: notificationNavigation,
    onInboxRefresh: isAuthenticated ? refreshNotificationInbox : null,
  });

  const search = useSearchDoctorsController({
    active: home.searchOpen && !home.resultsOpen,
    onBack: home.onCloseSearch,
    onSubmitSearch: home.onSearchDoctorsTab,
    onOpenDoctor: home.onOpenDoctorProfile,
    onSeeAvailability: () => {
      home.onCloseSearch();
      home.onSelectTab('doctors');
    },
  });

  // Home chrome and stack overlays all use white headers.
  useAndroidStatusBarBackground(colors.card);
  const results = useSearchResultsController({
    query: home.resultsQuery,
    active: home.resultsOpen,
    searchNonce: home.searchNonce,
    onBack: home.onCloseResults,
    onOpenSearch: home.onReopenSearch,
    onOpenDoctor: home.onOpenDoctorProfile,
  });
  const profileDoctorId =
    home.profileDoctorId && /^\d+$/.test(home.profileDoctorId)
      ? home.profileDoctorId
      : '';
  const profile = useDoctorProfileController({
    doctorId: profileDoctorId,
    onBack: home.onCloseDoctorProfile,
    onBook: home.onOpenBooking,
  });
  const booking = useBookAppointmentController({
    doctorId: profileDoctorId,
    initialMemberId: home.selectedMemberId,
    active: home.bookingOpen && Boolean(profileDoctorId),
    onBack: home.onCloseBooking,
    onAddMember: home.onAddMember,
    onMemberChange: home.onSelectMember,
  });
  const review = useBookingReviewController({
    active: home.bookingOpen,
    onBack: booking.onCloseReview,
    onProceedPay: booking.onOpenPayment,
    draft: {
      profile: booking.profile,
      shortCredsKey: booking.shortCredsKey,
      whenLabel: booking.whenLabel,
      modeConsultLabel: booking.modeConsultLabel,
      patientLabel: booking.patientLabel,
      doctorFeeLabel: booking.doctorFeeLabel,
      platformFeeLabel: booking.platformFeeLabel,
      taxesLabel: booking.taxesLabel,
      totalLabel: booking.feeLabel,
    },
  });
  const payment = useBookingPaymentController({
    active: home.bookingOpen && booking.paymentOpen,
    onBack: booking.onClosePayment,
    patientAppId: booking.patientAppId,
    bookingToken: booking.bookingToken,
    isInClinicMode: booking.isInClinicMode,
    onSubmitBooking: booking.onSubmitBooking,
    onPayAtClinicSuccess: (result) => {
      const visitId = String(result.patientAppId);
      home.onConfirmBooking({
        id: visitId,
        bookingId: `APT-${result.patientAppId}`,
        doctorId: booking.profile.id,
        doctorNameKey: '' as TranslationKey,
        doctorInitials: booking.profile.initials,
        credentialsKey: '' as TranslationKey,
        experienceKey: booking.profile.experienceKey,
        whenLabel: booking.whenLabel,
        dateLine: booking.dateLine,
        timeLine: booking.timeLine,
        startsAt: booking.startsAt,
        bookedOnLabel: booking.bookedOnLabel,
        mode: booking.mode,
        modeConsultLabel: booking.modeConsultLabel,
        patientLabel: booking.patientLabel,
        feeLabel: booking.feeLabel,
        paymentId: '',
        reasonKey: 'reasonGeneralFollowUp' as TranslationKey,
        status: 'waiting_acceptance',
      });
      payment.reset();
      booking.onResetBooking();
      home.onFinishBookingFlow('home');
    },
    onPaymentConfirmed: (paymentOrderId, confirmedPatientAppId) => {
      const pId = confirmedPatientAppId ?? booking.patientAppId;
      const visitId =
        pId != null
          ? String(pId)
          : `${booking.profile.id}-${booking.whenLabel}-${booking.patientLabel}`;
      home.onConfirmBooking({
        id: visitId,
        bookingId:
          pId != null
            ? `APT-${pId}`
            : `APT-${Date.now().toString(36).toUpperCase()}`,
        doctorId: booking.profile.id,
        doctorNameKey: '' as TranslationKey,
        doctorInitials: booking.profile.initials,
        credentialsKey: '' as TranslationKey,
        experienceKey: booking.profile.experienceKey,
        whenLabel: booking.whenLabel,
        dateLine: booking.dateLine,
        timeLine: booking.timeLine,
        startsAt: booking.startsAt,
        bookedOnLabel: booking.bookedOnLabel,
        mode: booking.mode,
        modeConsultLabel: booking.modeConsultLabel,
        patientLabel: booking.patientLabel,
        feeLabel: booking.feeLabel,
        paymentId: paymentOrderId ? String(paymentOrderId) : '',
        reasonKey: 'reasonGeneralFollowUp' as TranslationKey,
        status: 'waiting_acceptance',
      });
      payment.reset();
      booking.onResetBooking();
      home.onFinishBookingFlow('home');
    },
    onPaymentPending: (paymentOrderId) => {
      booking.onPaymentPending(paymentOrderId);
    },
    onPaymentFailed: (message) => {
      booking.onOpenPaymentStatus('failed', message);
    },
    draft: {
      paymentSummaryLine: booking.paymentSummaryLine,
      doctorFeeLabel: booking.doctorFeeLabel,
      platformFeeLabel: booking.platformFeeLabel,
      taxesLabel: booking.taxesLabel,
      totalLabel: booking.feeLabel,
    },
  });
  const paymentStatus = usePaymentStatusController({
    active: Boolean(home.bookingOpen && booking.paymentStatus),
    onConfirmBooking: home.onConfirmBooking,
    onCloseSuccess: () => {
      booking.onResetBooking();
      home.onFinishBookingFlow();
    },
    onCloseFailure: () => {
      payment.reset();
      booking.onResetBooking();
      home.onFinishBookingFlow('home');
    },
    onRetry: () => {
      payment.reset();
      booking.onClosePaymentStatus();
    },
    onChooseMethod: () => {
      payment.reset();
      booking.onClosePaymentStatus();
    },
    onChooseSlot: () => {
      payment.reset();
      booking.onChooseOtherSlot();
    },
    // Re-poll Verify — never invent success from the client alone.
    onConfirmPending: () => {
      payment.resumePendingPayment(
        booking.lastPaymentOrderId ?? payment.paymentOrderId ?? undefined,
      );
    },
    draft: {
      status: booking.paymentStatus ?? 'pending',
      doctorId: booking.profile.id,
      doctorName: booking.t(booking.profile.nameKey),
      doctorInitials: booking.profile.initials,
      experienceKey: booking.profile.experienceKey,
      whenLabel: booking.whenLabel,
      dateLine: booking.dateLine,
      timeLine: booking.timeLine,
      startsAt: booking.startsAt,
      bookedOnLabel: booking.bookedOnLabel,
      mode: booking.mode,
      slotTimeLabel: booking.slotTimeLabel,
      modeConsultLabel: booking.modeConsultLabel,
      patientLabel: booking.patientLabel,
      totalLabel: booking.feeLabel,
      holdSeconds: 0,
      paymentOrderId: booking.lastPaymentOrderId ?? payment.paymentOrderId,
      patientAppId: booking.patientAppId,
      failReason: booking.paymentFailureReason ?? payment.payError ?? null,
      errorMessage: booking.paymentFailureReason ?? payment.payError ?? null,
    },
  });
  const myAppointments = useMyAppointmentsController({
    active: home.myAppointmentsOpen && !home.selectedAppointmentId,
    onBack: home.onCloseMyAppointments,
    onOpenAppointment: home.onOpenAppointment,
    onOpenRequests: () => {
      home.onCloseMyAppointments();
      home.onOpenAppointmentRequests();
    },
    onBookNew: () => {
      home.onCloseMyAppointments();
      home.onSelectTab('doctors');
      home.onOpenSearch();
    },
  });
  const selectedAppointment =
    home.appointments.find((item) => item.id === home.selectedAppointmentId) ??
    myAppointments.appointments.find((item) => item.id === home.selectedAppointmentId) ??
    (home.selectedAppointmentId
      ? {
        id: home.selectedAppointmentId,
        bookingId: `APT-${home.selectedAppointmentId}`,
        doctorId: '',
        doctorNameKey: '' as TranslationKey,
        doctorInitials: 'DR',
        credentialsKey: '' as TranslationKey,
        experienceKey: '' as TranslationKey,
        whenLabel: '',
        dateLine: '',
        timeLine: '',
        startsAt: new Date().toISOString(),
        bookedOnLabel: '',
        mode: 'clinic' as const,
        modeConsultLabel: 'Clinic',
        patientLabel: '',
        feeLabel: '',
        paymentId: '',
        reasonKey: '' as TranslationKey,
        status: 'confirmed' as const,
      }
      : null);
  const appointmentDetail = useAppointmentDetailController({
    appointment: selectedAppointment,
    onBack: home.onCloseAppointment,
    onRemoveAppointment: home.onRemoveAppointment,
    onUpdateAppointment: home.onUpdateAppointment,
    onBookAnotherConsultation: home.onBookAnotherConsultation,
    onOrderMedicines: home.onOpenOrderMedicines,
  });
  const deviceCheck = useDeviceCheckController({
    appointment: selectedAppointment,
    onBack: appointmentDetail.onCloseDeviceCheck,
    onFinished: appointmentDetail.onFinishDeviceCheck,
  });
  const joinFailed = useJoinFailedController({
    appointment: selectedAppointment,
    networkQuality: appointmentDetail.joinMbps < 1 ? 'weak' : appointmentDetail.joinNetworkQuality,
    mbps: appointmentDetail.joinMbps,
    onBack: appointmentDetail.onCloseJoinFailed,
    onTryAgain: appointmentDetail.onRetryJoin,
    onJoinAudio: appointmentDetail.onJoinAudioFromFailed,
    onAskDoctorCall: appointmentDetail.onAskDoctorCallFromFailed,
    onGetHelp: appointmentDetail.onGetHelp,
  });
  const consultationChat = useConsultationChatController({
    appointment: selectedAppointment,
    onBack: appointmentDetail.onCloseConsultationChat,
    onBookConsultation: () => {
      appointmentDetail.onCloseConsultationChat();
      home.onCloseAppointment();
      home.onOpenConsultNow();
    },
    onOpenVideo: appointmentDetail.onStartVideoFromChat,
    onViewLinked: appointmentDetail.onCloseConsultationChat,
  });
  const waitingRoom = useWaitingRoomController({
    appointment: selectedAppointment,
    consultMode: appointmentDetail.waitingRoomMode,
    queuePosition: appointmentDetail.queuePosition,
    waitMinutes: appointmentDetail.waitMinutes,
    documentCount: appointmentDetail.attachedDocuments.length,
    onBack: appointmentDetail.onCloseWaitingRoom,
    onLeave: appointmentDetail.onCloseWaitingRoom,
    onReschedule: () => {
      appointmentDetail.onCloseWaitingRoom();
      appointmentDetail.onChangeTime();
    },
  });
  const videoCall = useVideoCallController({
    appointment: selectedAppointment,
    active: appointmentDetail.videoCallOpen,
    onEndCall: (durationSeconds) =>
      appointmentDetail.onEndVideoCall(durationSeconds),
    onReschedule: () => {
      appointmentDetail.onEndVideoCall(undefined, { showComplete: false });
      appointmentDetail.onChangeTime();
    },
  });
  const consultationComplete = useConsultationCompleteController({
    appointment: selectedAppointment,
    durationMinutes: appointmentDetail.completedDurationMinutes,
    onBackHome: () => {
      appointmentDetail.onCloseConsultationComplete();
      home.onActivateFollowUpPlan();
      home.onCloseAppointment();
      home.onSelectTab('home');
    },
    onViewFollowUpTasks: () => {
      appointmentDetail.onCloseConsultationComplete();
      home.onActivateFollowUpPlan();
      home.onCloseAppointment();
      home.onOpenFollowUpPlan();
    },
    onOrderMedicines: () => {
      appointmentDetail.onCloseConsultationComplete();
      home.onCloseAppointment();
      home.onActivateFollowUpPlan();
      home.onOpenOrderMedicines();
    },
    onWriteReview: appointmentDetail.onOpenRateConsultation,
  });
  const rateConsultation = useRateConsultationController({
    appointment: selectedAppointment,
    durationMinutes: appointmentDetail.completedDurationMinutes,
    active: appointmentDetail.rateConsultationOpen,
    onClose: appointmentDetail.onCloseRateConsultation,
    onFinished: appointmentDetail.onFinishRateConsultation,
  });
  const followUpPlan = useFollowUpPlanController({
    onBack: home.onCloseFollowUpPlan,
    onBookFollowUp: () => {
      home.onCloseFollowUpPlan();
      home.onOpenSearch();
    },
    onUploadPhoto: () => undefined,
    onOpenDiary: home.onOpenSymptomDiary,
  });
  const symptomDiary = useSymptomDiaryController({
    onBack: home.onCloseSymptomDiary,
    onAddMember: home.onAddMember,
  });
  const cliniSightProgress = useCliniSightProgressController({
    onBack: home.onCloseCliniSightProgress,
    onAddTodayEntry: home.onOpenSymptomDiary,
  });
  const healthInsights = useHealthInsightsController({
    onBack: home.onCloseHealthInsights,
  });
  const remindersCentre = useRemindersCentreController({
    onBack: home.onCloseReminders,
    onBookConsultation: () => {
      home.onCloseReminders();
      home.onSelectTab('doctors');
      home.onOpenSearch();
    },
  });
  const appointmentRequests = useAppointmentRequestsController({
    onBack: home.onCloseAppointmentRequests,
    onOpenVisit: (patientAppId) => {
      home.onCloseAppointmentRequests();
      home.onCloseMyAppointments();
      home.onOpenAppointment(String(patientAppId));
    },
  });
  const editProfile = useCompleteProfileController({
    mode: 'edit',
    onBack: home.onCloseEditProfile,
    onContinue: home.onCloseEditProfile,
    onSkip: home.onCloseEditProfile,
  });
  const accountFamily = useFamilyMembersController({
    variant: 'account',
    onBack: home.onCloseAccountFamily,
    onContinue: home.onCloseAccountFamily,
    onSkip: home.onCloseAccountFamily,
  });
  const payments = usePaymentsController({
    onBack: home.onClosePayments,
    onBookConsultation: () => {
      home.onClosePayments();
      home.onSelectTab('doctors');
      home.onOpenSearch();
    },
  });
  const consentCentre = useConsentCentreController({
    active: home.consentCentreOpen,
    onBack: home.onCloseConsentCentre,
  });
  const myReviews = useMyReviewsController({
    onBack: home.onCloseMyReviews,
    onRatePending: () => undefined,
    onAppeal: () => home.onOpenAppealReview(),
  });
  const appealReview = useAppealReviewController({
    reviewId: home.appealReviewId,
    onBack: home.onCloseAppealReview,
  });
  const helpCentre = useHelpCentreController({
    onBack: home.onCloseHelpCentre,
    onOpenTopic: (topicId) => home.onOpenRaiseTicket(topicId),
  });
  const raiseTicket = useRaiseTicketController({
    initialTopicId: home.raiseTicketTopicId,
    onBack: home.onCloseRaiseTicket,
  });
  const bookWithHelp = useBookWithHelpController({
    onBack: home.onCloseBookWithHelp,
  });
  const legalDocument = useLegalDocumentController({
    docId: home.legalDocId ?? 'about',
    onBack: home.onCloseLegalDoc,
  });
  const notifications = useNotificationsController({
    onBack: home.onCloseNotifications,
    onJoinConsultation: () => {
      home.onCloseNotifications();
      home.onJoinConsultation();
    },
  });
  const notificationSettings = useNotificationSettingsController({
    onBack: home.onCloseNotificationSettings,
    onOpenNotifications: () => {
      home.onCloseNotificationSettings();
      home.onOpenNotifications();
    },
  });
  const orderMedicines = useOrderMedicinesController({
    onBack: home.onCloseOrderMedicines,
    onPlaced: home.onPlaceMedicineOrder,
    erxSnapshotId: home.orderLaunch?.erxSnapshotId ?? null,
    patientAppId: home.orderLaunch?.patientAppId ?? null,
    refillRequestId: home.orderLaunch?.refillRequestId ?? null,
  });
  const orderTracking = useOrderTrackingController({
    orderId: home.orderDetailsId ?? '',
    onBack: home.onCloseOrderTracking,
    onOpenDetails: home.onOpenTrackedOrderDetails,
    onPayOrder: home.onPayMedicineOrder,
  });
  const medicinePay = useMedicineCheckoutController({
    medicineOrderId: home.payMedicineOrderId,
    onBack: home.onCloseMedicinePay,
    onPaid: () => home.onPlaceMedicineOrder(),
  });
  const orderDetails = useOrderDetailsController({
    orderId: home.orderDetailsId ?? '',
    onBack: home.onCloseOrderDetails,
    onReorder: () => {
      home.onCloseOrderDetails();
      home.onPlaceMedicineOrder();
    },
  });
  const consultNow = useConsultNowController({
    active: home.consultNowOpen,
    onBack: home.onCloseConsultNow,
    onBookEarliest: home.onOpenResults,
    onAddMember: home.onAddMember,
  });
  // Instant consult payment waits on B-011 (fee fields on Tele/Instant). No fake Checkout.
  const consultPayment = useBookingPaymentController({
    active: false,
    onBack: consultNow.onClosePayment,
    patientAppId: null,
    bookingToken: null,
    isInClinicMode: false,
    onSubmitBooking: async () => {
      throw new Error('Instant consult payment is not available yet.');
    },
    onPaymentConfirmed: () => consultNow.onOpenPaymentStatus('success'),
    onPaymentPending: (orderId) => {
      if (orderId > 0) {
        consultNow.onOpenPaymentStatus('pending');
      }
    },
    onPaymentFailed: () => consultNow.onOpenPaymentStatus('failed'),
    draft: {
      paymentSummaryLine: consultNow.paymentSummaryLine,
      doctorFeeLabel: consultNow.doctorFeeLabel,
      platformFeeLabel: consultNow.platformFeeLabel,
      taxesLabel: consultNow.taxesLabel,
      totalLabel: consultNow.totalLabel,
    },
  });
  const consultPaymentStatus = usePaymentStatusController({
    active: Boolean(home.consultNowOpen && consultNow.paymentStatus),
    onConfirmBooking: (item) =>
      home.onConfirmBooking({ ...item, status: 'confirmed' }),
    onCloseSuccess: consultNow.onFinishInstantPay,
    onCloseFailure: () => {
      consultPayment.reset();
      consultNow.onFinishInstantPay();
    },
    onRetry: () => {
      consultPayment.reset();
      consultNow.onClosePaymentStatus();
    },
    onChooseMethod: () => {
      consultPayment.reset();
      consultNow.onClosePaymentStatus();
    },
    onChooseSlot: () => {
      consultPayment.reset();
      consultNow.onClosePayment();
    },
    onConfirmPending: () => {
      consultPayment.resumePendingPayment(consultPayment.paymentOrderId ?? undefined);
    },
    draft: {
      status: consultNow.paymentStatus ?? 'pending',
      doctorId: consultNow.offeredDoctorId,
      doctorName: consultNow.offer?.doctorName ?? consultNow.t('searchResultRajeshName'),
      doctorInitials: consultNow.offeredDoctorInitials,
      experienceKey: consultNow.offeredExperienceKey,
      whenLabel: consultNow.instantWhenLabel,
      dateLine: consultNow.instantDateLine,
      timeLine: consultNow.instantTimeLine,
      startsAt: consultNow.instantStartsAt,
      bookedOnLabel: consultNow.instantBookedOn,
      mode: consultNow.bookingMode,
      slotTimeLabel: consultNow.instantTimeLine,
      modeConsultLabel: consultNow.instantModeConsultLabel,
      patientLabel: consultNow.instantPatientLabel,
      totalLabel: consultNow.totalLabel,
      holdSeconds: 0,
      paymentOrderId: null,
    },
  });
  const healthTip = useHealthTipController({
    tipId: home.healthTipId ?? 'eczema-children',
    onBack: home.onCloseHealthTip,
    onOpenRelated: home.onOpenHealthTip,
    onFindDoctor: home.onFindDoctorFromTip,
  });

  /** Android system back → same as in-app back on the topmost overlay. */
  const onHomeHardwareBack = useCallback((): boolean => {
    if (appointmentDetail.cancelledOpen) {
      appointmentDetail.onCloseCancelled();
      return true;
    }

    if (home.selectedAppointmentId && selectedAppointment) {
      if (appointmentDetail.prescriptionOpen) {
        appointmentDetail.onClosePrescription();
        return true;
      }
      if (appointmentDetail.rateConsultationOpen) {
        appointmentDetail.onCloseRateConsultation();
        return true;
      }
      if (appointmentDetail.consultationCompleteOpen) {
        appointmentDetail.onCloseConsultationComplete();
        return true;
      }
      if (appointmentDetail.videoCallOpen) {
        videoCall.onBack();
        return true;
      }
      if (appointmentDetail.waitingRoomOpen) {
        appointmentDetail.onCloseWaitingRoom();
        return true;
      }
      if (appointmentDetail.joinFailedOpen) {
        appointmentDetail.onCloseJoinFailed();
        return true;
      }
      if (appointmentDetail.deviceCheckOpen) {
        appointmentDetail.onCloseDeviceCheck();
        return true;
      }
      if (appointmentDetail.consultationChatOpen) {
        appointmentDetail.onCloseConsultationChat();
        return true;
      }
      if (appointmentDetail.rescheduleOpen) {
        if (appointmentDetail.rescheduleReasonOpen) {
          appointmentDetail.onCloseRescheduleReason();
          return true;
        }
        appointmentDetail.onCloseReschedule();
        return true;
      }
      if (appointmentDetail.cancelSheetOpen) {
        appointmentDetail.onCloseCancelSheet();
        return true;
      }
      if (appointmentDetail.uploadOpen) {
        appointmentDetail.onCloseUpload();
        return true;
      }
      if (appointmentDetail.selectSheetOpen) {
        appointmentDetail.onCloseSelectSheet();
        return true;
      }
      if (appointmentDetail.clinicCheckInOpen) {
        appointmentDetail.onCloseCheckIn();
        return true;
      }
      appointmentDetail.onBack();
      return true;
    }

    if (home.payMedicineOrderId) {
      medicinePay.onBack();
      return true;
    }
    if (home.orderDetailsOpen) {
      orderDetails.onBack();
      return true;
    }
    if (home.orderTrackingOpen) {
      orderTracking.onBack();
      return true;
    }
    if (home.orderMedicinesOpen) {
      if (orderMedicines.addressPickerOpen) {
        orderMedicines.onCloseAddressPicker();
        return true;
      }
      orderMedicines.onBack();
      return true;
    }

    if (home.symptomDiaryOpen) {
      if (symptomDiary.entryOpen) {
        symptomDiary.onCloseEntry();
        return true;
      }
      if (symptomDiary.memberPickerOpen) {
        symptomDiary.onCloseMemberPicker();
        return true;
      }
      symptomDiary.onBack();
      return true;
    }

    if (home.remindersOpen) {
      remindersCentre.onBack();
      return true;
    }
    if (home.editProfileOpen) {
      home.onCloseEditProfile();
      return true;
    }
    if (home.accountFamilyOpen) {
      home.onCloseAccountFamily();
      return true;
    }
    if (home.appointmentRequestsOpen) {
      appointmentRequests.onBack();
      return true;
    }
    if (home.myAppointmentsOpen) {
      myAppointments.onBack();
      return true;
    }
    if (home.accountRecordsOpen) {
      home.onCloseAccountRecords();
      return true;
    }
    if (home.healthInsightsOpen) {
      healthInsights.onBack();
      return true;
    }
    if (home.clinisightProgressOpen) {
      cliniSightProgress.onBack();
      return true;
    }
    if (home.paymentsOpen) {
      if (payments.refundOpen) {
        payments.onCloseRefund();
        return true;
      }
      payments.onBack();
      return true;
    }
    if (home.consentCentreOpen) {
      consentCentre.onBack();
      return true;
    }
    if (home.appealReviewOpen) {
      appealReview.onBack();
      return true;
    }
    if (home.myReviewsOpen) {
      myReviews.onBack();
      return true;
    }
    if (home.raiseTicketOpen) {
      raiseTicket.onBack();
      return true;
    }
    if (home.helpCentreOpen) {
      helpCentre.onBack();
      return true;
    }
    if (home.bookWithHelpOpen) {
      bookWithHelp.onBack();
      return true;
    }
    if (home.legalDocId) {
      legalDocument.onBack();
      return true;
    }
    if (home.notificationsOpen) {
      notifications.onBack();
      return true;
    }
    if (home.notificationSettingsOpen) {
      notificationSettings.onBack();
      return true;
    }
    if (home.followUpPlanOpen) {
      if (followUpPlan.prescriptionOpen) {
        followUpPlan.onClosePrescription();
        return true;
      }
      if (followUpPlan.consultationNoteOpen) {
        followUpPlan.onCloseConsultationNote();
        return true;
      }
      followUpPlan.onBack();
      return true;
    }

    if (home.consultNowOpen) {
      if (consultNow.paymentStatus === 'failed') {
        consultPayment.reset();
        consultNow.onFinishInstantPay();
        return true;
      }
      if (consultNow.paymentStatus === 'success') {
        consultNow.onFinishInstantPay();
        return true;
      }
      if (consultNow.paymentStatus) {
        consultNow.onClosePaymentStatus();
        return true;
      }
      if (consultNow.paymentOpen) {
        if (consultPayment.bankPickerOpen) {
          consultPayment.onCloseBankPicker();
          return true;
        }
        if (consultPayment.walletPickerOpen) {
          consultPayment.onCloseWalletPicker();
          return true;
        }
        if (consultPayment.breakdownOpen) {
          consultPayment.onToggleBreakdown();
          return true;
        }
        consultNow.onClosePayment();
        return true;
      }
      if (consultNow.searchingOpen) {
        if (consultNow.feeDetailsOpen) {
          consultNow.onCloseFeeDetails();
          return true;
        }
        consultNow.onCancelSearch();
        return true;
      }
      if (consultNow.memberPickerOpen) {
        consultNow.onCloseMemberPicker();
        return true;
      }
      consultNow.onBack();
      return true;
    }

    if (home.healthTipId) {
      healthTip.onBack();
      return true;
    }

    if (home.bookingOpen && home.profileDoctorId) {
      if (booking.paymentStatus === 'failed') {
        payment.reset();
        booking.onResetBooking();
        home.onFinishBookingFlow('home');
        return true;
      }
      if (booking.paymentStatus === 'success') {
        booking.onResetBooking();
        home.onFinishBookingFlow();
        return true;
      }
      if (booking.paymentStatus) {
        booking.onClosePaymentStatus();
        return true;
      }
      if (booking.paymentOpen) {
        if (payment.bankPickerOpen) {
          payment.onCloseBankPicker();
          return true;
        }
        if (payment.walletPickerOpen) {
          payment.onCloseWalletPicker();
          return true;
        }
        if (payment.breakdownOpen) {
          payment.onToggleBreakdown();
          return true;
        }
        booking.onClosePayment();
        return true;
      }
      if (booking.reviewOpen) {
        if (review.selectSheetOpen) {
          review.onCloseSelectSheet();
          return true;
        }
        if (review.uploadOpen) {
          review.onCloseUpload();
          return true;
        }
        booking.onCloseReview();
        return true;
      }
      if (booking.memberPickerOpen) {
        booking.onCloseMemberPicker();
        return true;
      }
      if (booking.monthPickerOpen) {
        booking.onCloseMonthPicker();
        return true;
      }
      booking.onBack();
      return true;
    }

    if (home.profileDoctorId) {
      profile.onBack();
      return true;
    }

    if (home.resultsOpen) {
      if (results.whyOrderOpen) {
        results.onCloseWhyOrder();
        return true;
      }
      if (results.datePickerOpen) {
        results.onCloseDatePicker();
        return true;
      }
      if (results.filtersOpen) {
        results.onCloseFilters();
        return true;
      }
      results.onBack();
      return true;
    }

    if (home.searchOpen) {
      if (search.cityPickerOpen) {
        search.onCloseCityPicker();
        return true;
      }
      search.onBack();
      return true;
    }

    if (home.memberPickerOpen) {
      home.onCloseMemberPicker();
      return true;
    }

    return false;
  }, [
    appealReview,
    appointmentDetail,
    appointmentRequests,
    bookWithHelp,
    booking,
    cliniSightProgress,
    consentCentre,
    consultNow,
    consultPayment,
    followUpPlan,
    healthInsights,
    healthTip,
    helpCentre,
    home,
    legalDocument,
    myAppointments,
    myReviews,
    notificationSettings,
    notifications,
    orderDetails,
    orderMedicines,
    orderTracking,
    payment,
    payments,
    profile,
    raiseTicket,
    remindersCentre,
    results,
    review,
    search,
    selectedAppointment,
    symptomDiary,
    videoCall,
  ]);

  useHardwareBackHandler(onHomeHardwareBack);

  if (appointmentDetail.cancelledOpen) {
    return <CancelledConfirmationView {...appointmentDetail} />;
  }

  if (home.selectedAppointmentId && selectedAppointment) {
    if (appointmentDetail.rateConsultationOpen) {
      return <RateConsultationView {...rateConsultation} />;
    }
    if (appointmentDetail.consultationCompleteOpen) {
      return <ConsultationCompleteView {...consultationComplete} />;
    }
    if (appointmentDetail.videoCallOpen) {
      return <VideoCallView {...videoCall} />;
    }
    if (appointmentDetail.waitingRoomOpen) {
      return <WaitingRoomView {...waitingRoom} />;
    }
    if (appointmentDetail.joinFailedOpen) {
      return <JoinFailedView {...joinFailed} />;
    }
    if (appointmentDetail.deviceCheckOpen) {
      return <DeviceCheckView {...deviceCheck} />;
    }
    if (appointmentDetail.consultationChatOpen) {
      return <ConsultationChatView {...consultationChat} />;
    }
    if (appointmentDetail.rescheduleOpen) {
      return <RescheduleAppointmentView {...appointmentDetail} />;
    }
    if (appointmentDetail.isClinic) {
      if (appointmentDetail.clinicCheckInOpen) {
        return (
          <ClinicCheckInView
            t={appointmentDetail.t}
            clinicName={appointmentDetail.clinicName}
            clinicAddress={appointmentDetail.clinicAddress}
            appointmentWhenLabel={appointmentDetail.whenLabel}
            checkInState={appointmentDetail.clinicCheckInState}
            checkedInAtLabel={appointmentDetail.checkedInAtLabel}
            queuePosition={appointmentDetail.queuePosition}
            waitMinutes={appointmentDetail.waitMinutes}
            readyAtLabel={appointmentDetail.readyAtLabel}
            doctorName={appointmentDetail.doctorName}
            checkInBusy={appointmentDetail.checkInBusy}
            checkInError={appointmentDetail.checkInError}
            onBack={appointmentDetail.onCloseCheckIn}
            onConfirmCheckIn={appointmentDetail.onConfirmCheckIn}
            onTellClinic={appointmentDetail.onTellClinicLate}
          />
        );
      }
      return <ClinicAppointmentView {...appointmentDetail} />;
    }
    return <AppointmentDetailView {...appointmentDetail} />;
  }

  if (home.payMedicineOrderId) {
    return <MedicineCheckoutView {...medicinePay} />;
  }
  if (home.orderDetailsOpen) {
    return <OrderDetailsView {...orderDetails} />;
  }
  if (home.orderTrackingOpen) {
    return <OrderTrackingView {...orderTracking} />;
  }
  if (home.orderMedicinesOpen) {
    return <OrderMedicinesView {...orderMedicines} />;
  }

  if (home.symptomDiaryOpen) {
    return <SymptomDiaryView {...symptomDiary} />;
  }

  if (home.remindersOpen) {
    return <RemindersCentreView {...remindersCentre} />;
  }

  if (home.editProfileOpen) {
    return <CompleteProfileView {...editProfile} />;
  }

  if (home.accountFamilyOpen) {
    return <FamilyMembersView {...accountFamily} />;
  }

  if (home.appointmentRequestsOpen) {
    return <AppointmentRequestsView {...appointmentRequests} />;
  }

  if (home.myAppointmentsOpen) {
    return <MyAppointmentsView {...myAppointments} />;
  }

  if (home.accountRecordsOpen) {
    return (
      <HealthRecordsView
        key={home.accountRecordsFilter}
        onBack={home.onCloseAccountRecords}
        initialFilter={home.accountRecordsFilter}
        titleKey={
          home.accountRecordsFilter === 'prescriptions'
            ? 'accountPrescriptions'
            : 'accountHealthRecords'
        }
        onOpenFollowUpPlan={home.onOpenFollowUpPlan}
        onOpenOrderMedicines={home.onOpenOrderMedicines}
        onAddMember={home.onAddMember}
        notificationCount={notifications.unreadCount}
      />
    );
  }

  if (home.healthInsightsOpen) {
    return <HealthInsightsView {...healthInsights} />;
  }

  if (home.clinisightProgressOpen) {
    return <CliniSightProgressView {...cliniSightProgress} />;
  }

  if (home.paymentsOpen) {
    return <PaymentsView {...payments} />;
  }

  if (home.consentCentreOpen) {
    return <ConsentCentreView {...consentCentre} />;
  }

  if (home.appealReviewOpen) {
    return <AppealReviewView {...appealReview} />;
  }

  if (home.myReviewsOpen) {
    return <MyReviewsView {...myReviews} />;
  }

  if (home.raiseTicketOpen) {
    return <RaiseTicketView {...raiseTicket} />;
  }

  if (home.helpCentreOpen) {
    return <HelpCentreView {...helpCentre} />;
  }

  if (home.bookWithHelpOpen) {
    return <BookWithHelpView {...bookWithHelp} />;
  }

  if (home.legalDocId) {
    return <LegalDocumentView {...legalDocument} />;
  }

  if (home.notificationsOpen) {
    return <NotificationsView {...notifications} />;
  }

  if (home.notificationSettingsOpen) {
    return <NotificationSettingsView {...notificationSettings} />;
  }

  if (home.followUpPlanOpen) {
    return (
      <FollowUpPlanView
        {...followUpPlan}
        onOrderMedicines={home.onOpenOrderMedicines}
      />
    );
  }

  if (home.consultNowOpen) {
    if (consultNow.paymentStatus) {
      return <PaymentStatusView {...consultPaymentStatus} />;
    }
    if (consultNow.paymentOpen) {
      return <BookingPaymentView {...consultPayment} />;
    }
    if (consultNow.searchingOpen) {
      return <ConsultNowSearchingView {...consultNow} />;
    }
    return <ConsultNowView {...consultNow} />;
  }

  if (home.healthTipId) {
    return <HealthTipArticleView {...healthTip} />;
  }

  if (home.bookingOpen && home.profileDoctorId) {
    if (booking.paymentStatus) {
      return <PaymentStatusView {...paymentStatus} />;
    }
    if (booking.paymentOpen) {
      return <BookingPaymentView {...payment} />;
    }
    if (booking.reviewOpen) {
      return <BookingReviewView {...review} />;
    }
    return <BookAppointmentView {...booking} />;
  }

  if (home.profileDoctorId) {
    return <DoctorProfileView {...profile} />;
  }

  if (home.resultsOpen) {
    return (
      <SearchResultsView
        {...results}
        selectedTab={home.selectedTab}
        onSelectTab={home.onSelectTab}
      />
    );
  }

  if (home.searchOpen) {
    return <SearchDoctorsView {...search} />;
  }

  return <HomeView {...home} notificationCount={notifications.unreadCount} />;
}

export function AppNavigator() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<AppStep>('splash');
  const [resolvedTargetStep, setResolvedTargetStep] = useState<AppStep | null>(
    null,
  );
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [sessionNonce, setSessionNonce] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndFlow() {
      try {
        const token = await getAccessToken();
        console.log(token)
        if (token) {
          let activeToken = token;

          // 1. Proactively refresh token if near expiry (< 24 hours)
          if (isJwtExpiringWithin(token, 24 * 3600)) {
            try {
              const refreshRes = await dispatch(
                accountApi.endpoints.refreshToken.initiate(),
              ).unwrap();
              if (refreshRes.token) {
                await saveAccessToken(refreshRes.token);
                activeToken = refreshRes.token;
              }
            } catch {
              // Token cannot be refreshed (expired > 7 days or revoked)
              await resetAuthenticatedSession(dispatch);
              dispatch(
                setSessionEndedMessage(
                  'Your session has ended. Please sign in again.',
                ),
              );
              if (isMounted) {
                setResolvedTargetStep('signIn');
              }
              return;
            }
          }

          // 2. Fetch authoritative primary patient identity from PatientProfile/Me
          try {
            const profileRes = await dispatch(
              patientProfileApi.endpoints.getPatientProfile.initiate(),
            ).unwrap();

            if (profileRes?.data) {
              const p = profileRes.data;
              const userObj: AuthUser = {
                patientId: p.patientId,
                userId: p.userId,
                firstName: p.firstName,
                lastName: p.lastName,
                patientName: p.patientName,
                mobile: p.mobileNo,
                mobileNo: p.mobileNo,
                email: p.email,
                gender: p.gender,
                dateOfBirth: p.dateOfBirth,
              };
              await saveAuthUserData(userObj);
              dispatch(
                setAuthUser({
                  user: userObj,
                  token: activeToken,
                  patientId: p.patientId,
                  userId: p.userId,
                  mobile: p.mobileNo,
                }),
              );
              const savedSessionId = await getBookingSessionId();
              if (savedSessionId) {
                dispatch(
                  setBookingSession({
                    bookingSessionId: savedSessionId,
                    mobile: p.mobileNo,
                  }),
                );
              }
              dispatch(setAuthenticated(true));
              dispatch(markAuthInitialized());
              if (isMounted) {
                setResolvedTargetStep('home');
              }
              return;
            }
          } catch (profileErr: unknown) {
            const status = (profileErr as { status?: number })?.status;
            if (status === 401) {
              await resetAuthenticatedSession(dispatch);
              dispatch(
                setSessionEndedMessage(
                  'Your session has ended. Please sign in again.',
                ),
              );
              if (isMounted) {
                setResolvedTargetStep('signIn');
              }
              return;
            }

            // Offline or transient network failure: restore from SecureStore
            const savedUser = await getAuthUserData<AuthUser>();
            if (savedUser) {
              dispatch(
                setAuthUser({
                  user: savedUser,
                  token: activeToken,
                  patientId: savedUser.patientId,
                  userId: savedUser.userId,
                  mobile: savedUser.mobile || savedUser.mobileNo,
                }),
              );
              dispatch(setAuthenticated(true));
              dispatch(markAuthInitialized());
              if (isMounted) {
                setResolvedTargetStep('home');
              }
              return;
            } else {
              const claims = parseJwtClaims(activeToken);
              const fallbackUser: AuthUser = claims?.mobile
                ? {
                  mobile: claims.mobile,
                  mobileNo: claims.mobile,
                  userId: claims.userId,
                }
                : null;
              dispatch(
                setAuthUser({
                  user: fallbackUser,
                  token: activeToken,
                  userId: claims?.userId,
                  mobile: claims?.mobile,
                }),
              );
              dispatch(setAuthenticated(true));
              dispatch(markAuthInitialized());
              if (isMounted) {
                setResolvedTargetStep('home');
              }
              return;
            }
          }
        }

        const [langDone, onboardingDone] = await Promise.all([
          hasLanguageSelectionCompleted(),
          hasOnboardingCompleted(),
        ]);

        if (!isMounted) {
          return;
        }

        if (!langDone) {
          setResolvedTargetStep('firstLaunch');
        } else if (!onboardingDone) {
          setResolvedTargetStep('onboarding');
        } else {
          setResolvedTargetStep('signIn');
        }
      } catch {
        if (isMounted) {
          setResolvedTargetStep('firstLaunch');
        }
      }
    }

    void checkAuthAndFlow();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const finishSplash = useCallback(() => {
    setIsSplashDone(true);
  }, []);

  useEffect(() => {
    if (isSplashDone && resolvedTargetStep) {
      setStep(resolvedTargetStep);
    }
  }, [isSplashDone, resolvedTargetStep]);

  const finishFirstLaunch = useCallback(async () => {
    await setLanguageSelectionCompleted();
    setStep('onboarding');
  }, []);

  const finishOnboarding = useCallback(async () => {
    await setOnboardingCompleted();
    setStep('signIn');
  }, []);
  const backFromSignIn = useCallback(() => setStep('onboarding'), []);
  const openOtp = useCallback(
    (
      number: string,
      code?: string,
      registered?: boolean,
      selectedCountryCode?: string,
    ) => {
      setMobileNumber(number);
      if (selectedCountryCode) {
        setCountryCode(selectedCountryCode);
      }
      setDevOtp(code);
      setIsUserRegistered(Boolean(registered));
      setStep('otp');
    },
    [],
  );
  const backFromOtp = useCallback(() => setStep('signIn'), []);
  const openCompleteProfile = useCallback(() => setStep('completeProfile'), []);
  const backFromProfile = useCallback(() => setStep('otp'), []);
  const openConsent = useCallback(() => setStep('consent'), []);
  const backFromConsent = useCallback(() => setStep('completeProfile'), []);
  const openPhoneSetup = useCallback(() => setStep('phoneSetup'), []);
  const backFromPhoneSetup = useCallback(() => setStep('consent'), []);
  const openFamilyMembers = useCallback(() => setStep('familyMembers'), []);
  const backFromFamilyMembers = useCallback(() => setStep('phoneSetup'), []);
  const openHome = useCallback(() => setStep('home'), []);
  const handleOtpVerified = useCallback(
    (registeredOverride?: boolean) => {
      const registered = registeredOverride ?? isUserRegistered;
      if (registered) {
        openHome();
      } else {
        openCompleteProfile();
      }
    },
    [isUserRegistered, openHome, openCompleteProfile],
  );
  const handleLogOut = useCallback(async () => {
    await performLogout(dispatch);
    setMobileNumber('');
    setCountryCode('+91');
    setDevOtp(undefined);
    setIsUserRegistered(false);
    setSessionNonce((n) => n + 1);
    setStep('signIn');
  }, [dispatch]);
  const slideIndex = useMemo(
    () => Math.max(0, SLIDE_STEPS.indexOf(step as (typeof SLIDE_STEPS)[number])),
    [step],
  );

  // Splash / first-launch / onboarding: page grey. Every header screen: white.
  const pageStatusBar =
    step === 'splash' || step === 'firstLaunch' || step === 'onboarding';
  const statusBarCanvas = pageStatusBar ? colors.page : colors.card;

  useAndroidStatusBarBackground(statusBarCanvas);

  const onAuthHardwareBack = useCallback((): boolean => {
    if (step === 'otp') {
      backFromOtp();
      return true;
    }
    if (step === 'completeProfile') {
      backFromProfile();
      return true;
    }
    if (step === 'consent') {
      backFromConsent();
      return true;
    }
    if (step === 'phoneSetup') {
      backFromPhoneSetup();
      return true;
    }
    if (step === 'familyMembers') {
      backFromFamilyMembers();
      return true;
    }
    if (step === 'signIn') {
      backFromSignIn();
      return true;
    }
    return false;
  }, [
    backFromConsent,
    backFromFamilyMembers,
    backFromOtp,
    backFromPhoneSetup,
    backFromProfile,
    backFromSignIn,
    step,
  ]);

  useHardwareBackHandler(
    onAuthHardwareBack,
    step !== 'splash' &&
    step !== 'home' &&
    step !== 'firstLaunch' &&
    step !== 'onboarding',
  );

  if (step === 'splash') {
    return (
      <View style={styles.stage}>
        <StatusBarBleed color={colors.page} />
        <SplashRoute onFinished={finishSplash} />
      </View>
    );
  }

  return (
    <View style={styles.stage}>
      {/* Home headers paint their own status strip; absolute bleed would cover video. */}
      {step !== 'home' ? <StatusBarBleed color={statusBarCanvas} /> : null}
      <SlideStrip index={slideIndex}>
        <FirstLaunchRoute onContinue={finishFirstLaunch} />
        <OnboardingRoute onFinished={finishOnboarding} />
        <SignInRoute
          key={`signin-${sessionNonce}`}
          onBack={backFromSignIn}
          onOtpRequested={openOtp}
        />
        <OtpRoute
          key={`otp-${sessionNonce}`}
          mobileNumber={mobileNumber}
          devOtp={devOtp}
          isUserRegistered={isUserRegistered}
          active={step === 'otp'}
          onBack={backFromOtp}
          onVerified={handleOtpVerified}
        />
        <CompleteProfileRoute
          key={`complete-${sessionNonce}-${mobileNumber || 'new'}`}
          mobileNumber={mobileNumber}
          countryCode={countryCode}
          onBack={backFromProfile}
          onContinue={openConsent}
          onSkip={openConsent}
        />
        <ConsentRoute
          key={`consent-${sessionNonce}`}
          active={step === 'consent'}
          onBack={backFromConsent}
          onFinished={openPhoneSetup}
        />
        <PhoneSetupRoute
          key={`phone-${sessionNonce}`}
          active={step === 'phoneSetup'}
          onBack={backFromPhoneSetup}
          onContinue={openFamilyMembers}
        />
        <FamilyMembersRoute
          key={`family-${sessionNonce}`}
          onBack={backFromFamilyMembers}
          onContinue={openHome}
          onSkip={openHome}
        />
        <HomeRoute
          key={`home-${sessionNonce}`}
          onLogOut={handleLogOut}
        />
      </SlideStrip>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: colors.page,
    overflow: 'hidden',
  },
});
