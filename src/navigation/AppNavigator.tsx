import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SlideStrip } from '../components/SlideStrip';
import { StatusBarBleed } from '../components/StatusBarBleed';
import { usePushNotificationLifecycle } from '../hooks/usePushNotificationLifecycle';
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
import { RemindersCentreView } from '../views/RemindersCentreView';
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
  | 'familyMembers'
  | 'home';

const SLIDE_STEPS = [
  'firstLaunch',
  'onboarding',
  'signIn',
  'otp',
  'completeProfile',
  'consent',
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
  onOtpRequested: (mobileNumber: string) => void;
}) {
  const signIn = useSignInController({ onBack, onOtpRequested });
  return <SignInView {...signIn} />;
}

function OtpRoute({
  mobileNumber,
  active,
  onBack,
  onVerified,
}: {
  mobileNumber: string;
  active: boolean;
  onBack: () => void;
  onVerified: () => void;
}) {
  const otp = useOtpVerificationController({
    mobileNumber,
    active,
    onBack,
    onVerified,
  });
  return <OtpVerificationView {...otp} />;
}

function CompleteProfileRoute({
  onBack,
  onContinue,
  onSkip,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const profile = useCompleteProfileController({ onBack, onContinue, onSkip });
  return <CompleteProfileView {...profile} />;
}

function ConsentRoute({
  onBack,
  onFinished,
}: {
  onBack: () => void;
  onFinished: () => void;
}) {
  const consent = useConsentController({
    onBack,
    onAgree: onFinished,
    onManageLater: onFinished,
  });
  return <ConsentView {...consent} />;
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

  usePushNotificationLifecycle({
    authenticated: true,
    navigation: notificationNavigation,
  });

  const search = useSearchDoctorsController({
    active: home.searchOpen && !home.resultsOpen,
    onBack: home.onCloseSearch,
    onSubmitSearch: home.onOpenResults,
    onOpenDoctor: home.onOpenDoctorProfile,
  });
  const results = useSearchResultsController({
    query: home.resultsQuery,
    active: home.resultsOpen,
    searchNonce: home.searchNonce,
    onBack: home.onCloseResults,
    onOpenSearch: home.onReopenSearch,
    onOpenDoctor: home.onOpenDoctorProfile,
  });
  const profile = useDoctorProfileController({
    doctorId: home.profileDoctorId ?? 'anjali',
    onBack: home.onCloseDoctorProfile,
    onBook: home.onOpenBooking,
  });
  const booking = useBookAppointmentController({
    doctorId: home.profileDoctorId ?? 'anjali',
    active: home.bookingOpen,
    onBack: home.onCloseBooking,
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
    onPay: (method, upiId) => {
      if (method === 'addCard' || (method === 'upi' && !upiId.trim())) {
        booking.onOpenPaymentStatus('failed');
        return;
      }
      booking.onOpenPaymentStatus('pending');
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
    onCloseSuccess: home.onFinishBookingFlow,
    onRetry: booking.onClosePaymentStatus,
    onChooseMethod: booking.onClosePaymentStatus,
    onChooseSlot: booking.onChooseOtherSlot,
    onConfirmPending: () => booking.onOpenPaymentStatus('success'),
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
      holdSeconds: payment.holdSeconds,
    },
  });
  const selectedAppointment =
    home.appointments.find((item) => item.id === home.selectedAppointmentId) ?? null;
  const appointmentDetail = useAppointmentDetailController({
    appointment: selectedAppointment,
    onBack: home.onCloseAppointment,
    onRemoveAppointment: home.onRemoveAppointment,
    onUpdateAppointment: home.onUpdateAppointment,
    onBookAnotherConsultation: home.onBookAnotherConsultation,
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
    onBack: home.onCloseConsentCentre,
  });
  const myReviews = useMyReviewsController({
    onBack: home.onCloseMyReviews,
    onRatePending: () => undefined,
    onAppeal: () => home.onOpenAppealReview(),
  });
  const appealReview = useAppealReviewController({
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
    onPlaceOrder: home.onPlaceMedicineOrder,
  });
  const orderTracking = useOrderTrackingController({
    onBack: home.onCloseOrderTracking,
  });
  const orderDetails = useOrderDetailsController({
    orderId: home.orderDetailsId ?? 'hm-3922',
    onBack: home.onCloseOrderDetails,
    onReorder: () => {
      home.onCloseOrderDetails();
      home.onOpenOrderMedicines();
    },
  });
  const consultNow = useConsultNowController({
    active: home.consultNowOpen,
    onBack: home.onCloseConsultNow,
    onBookEarliest: home.onOpenResults,
  });
  const consultPayment = useBookingPaymentController({
    active: home.consultNowOpen && consultNow.paymentOpen,
    onBack: consultNow.onClosePayment,
    onPay: (method, upiId) => {
      if (method === 'addCard' || (method === 'upi' && !upiId.trim())) {
        consultNow.onOpenPaymentStatus('failed');
        return;
      }
      consultNow.onOpenPaymentStatus('pending');
    },
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
    onRetry: consultNow.onClosePaymentStatus,
    onChooseMethod: consultNow.onClosePaymentStatus,
    onChooseSlot: consultNow.onClosePayment,
    onConfirmPending: () => consultNow.onOpenPaymentStatus('success'),
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
      holdSeconds: consultPayment.holdSeconds,
    },
  });
  const healthTip = useHealthTipController({
    tipId: home.healthTipId ?? 'eczema-children',
    onBack: home.onCloseHealthTip,
    onOpenRelated: home.onOpenHealthTip,
    onFindDoctor: home.onFindDoctorFromTip,
  });

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
            doctorName={appointmentDetail.doctorName}
            onBack={appointmentDetail.onCloseCheckIn}
            onConfirmCheckIn={appointmentDetail.onConfirmCheckIn}
            onTellClinic={appointmentDetail.onTellClinicLate}
            onSelectDemoState={appointmentDetail.onSelectCheckInDemoState}
          />
        );
      }
      return <ClinicAppointmentView {...appointmentDetail} />;
    }
    return <AppointmentDetailView {...appointmentDetail} />;
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

  if (home.myAppointmentsOpen) {
    return (
      <MyAppointmentsView
        appointments={home.appointments}
        onBack={home.onCloseMyAppointments}
        onOpenAppointment={home.onOpenAppointment}
        onBookNew={() => {
          home.onCloseMyAppointments();
          home.onSelectTab('doctors');
          home.onOpenSearch();
        }}
      />
    );
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

  return <HomeView {...home} />;
}

export function AppNavigator() {
  const [step, setStep] = useState<AppStep>('splash');
  const [mobileNumber, setMobileNumber] = useState('');
  const finishSplash = useCallback(() => setStep('firstLaunch'), []);
  const finishFirstLaunch = useCallback(() => setStep('onboarding'), []);
  const finishOnboarding = useCallback(() => setStep('signIn'), []);
  const backFromSignIn = useCallback(() => setStep('onboarding'), []);
  const openOtp = useCallback((number: string) => {
    setMobileNumber(number);
    setStep('otp');
  }, []);
  const backFromOtp = useCallback(() => setStep('signIn'), []);
  const openCompleteProfile = useCallback(() => setStep('completeProfile'), []);
  const backFromProfile = useCallback(() => setStep('otp'), []);
  const openConsent = useCallback(() => setStep('consent'), []);
  const backFromConsent = useCallback(() => setStep('completeProfile'), []);
  const openFamilyMembers = useCallback(() => setStep('familyMembers'), []);
  const backFromFamilyMembers = useCallback(() => setStep('consent'), []);
  const openHome = useCallback(() => setStep('home'), []);
  const slideIndex = useMemo(
    () => Math.max(0, SLIDE_STEPS.indexOf(step as (typeof SLIDE_STEPS)[number])),
    [step],
  );

  // Splash → onboarding: page (#F5F6F7). Auth/profile funnel: white header.
  // Home keeps no absolute bleed — screen headers (and video) paint themselves.
  const pageStatusBar =
    step === 'splash' || step === 'firstLaunch' || step === 'onboarding';
  const headerStatusBar =
    step === 'signIn' ||
    step === 'otp' ||
    step === 'completeProfile' ||
    step === 'consent' ||
    step === 'familyMembers';
  const statusBarCanvas = pageStatusBar ? colors.page : colors.card;

  useAndroidStatusBarBackground(
    pageStatusBar || headerStatusBar ? statusBarCanvas : colors.page,
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
      {pageStatusBar || headerStatusBar ? (
        <StatusBarBleed color={statusBarCanvas} />
      ) : null}
      <SlideStrip index={slideIndex}>
        <FirstLaunchRoute onContinue={finishFirstLaunch} />
        <OnboardingRoute onFinished={finishOnboarding} />
        <SignInRoute onBack={backFromSignIn} onOtpRequested={openOtp} />
        <OtpRoute
          mobileNumber={mobileNumber}
          active={step === 'otp'}
          onBack={backFromOtp}
          onVerified={openCompleteProfile}
        />
        <CompleteProfileRoute
          onBack={backFromProfile}
          onContinue={openConsent}
          onSkip={openConsent}
        />
        <ConsentRoute onBack={backFromConsent} onFinished={openFamilyMembers} />
        <FamilyMembersRoute
          onBack={backFromFamilyMembers}
          onContinue={openHome}
          onSkip={openHome}
        />
        <HomeRoute onLogOut={() => setStep('signIn')} />
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
