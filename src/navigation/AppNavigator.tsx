import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SlideStrip } from '../components/SlideStrip';
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
import { usePaymentStatusController } from '../controllers/usePaymentStatusController';
import { useHealthTipController } from '../controllers/useHealthTipController';
import { useSignInController } from '../controllers/useSignInController';
import { useSplashController } from '../controllers/useSplashController';
import { colors } from '../theme/colors';
import { CompleteProfileView } from '../views/CompleteProfileView';
import { ConsentView } from '../views/ConsentView';
import { FamilyMembersView } from '../views/FamilyMembersView';
import { FirstLaunchView } from '../views/FirstLaunchView';
import { HomeView } from '../views/HomeView';
import { OnboardingSlideView } from '../views/OnboardingSlideView';
import { OtpVerificationView } from '../views/OtpVerificationView';
import { SearchDoctorsView } from '../views/SearchDoctorsView';
import { SearchResultsView } from '../views/SearchResultsView';
import { DoctorProfileView } from '../views/DoctorProfileView';
import { BookAppointmentView } from '../views/BookAppointmentView';
import { BookingPaymentView } from '../views/BookingPaymentView';
import { BookingReviewView } from '../views/BookingReviewView';
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
      slotTimeLabel: booking.slotTimeLabel,
      modeConsultLabel: booking.modeConsultLabel,
      patientLabel: booking.patientLabel,
      totalLabel: booking.feeLabel,
      holdSeconds: payment.holdSeconds,
    },
  });
  const healthTip = useHealthTipController({
    tipId: home.healthTipId ?? 'eczema-children',
    onBack: home.onCloseHealthTip,
    onOpenRelated: home.onOpenHealthTip,
    onFindDoctor: home.onFindDoctorFromTip,
  });

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

  if (step === 'splash') {
    return <SplashRoute onFinished={finishSplash} />;
  }

  return (
    <View style={styles.stage}>
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
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
