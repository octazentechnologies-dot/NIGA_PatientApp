import { useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetConsultationSummaryQuery } from '../store/api/new/teleApi';
import { useAppSelector } from '../store/hooks';

export type ConsultationCompleteViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  completedBanner: string;
  doctorName: string;
  credentials: string;
  whenLine: string;
  patientChip: string;
  discussed: string;
  advice: string;
  nextFollowUp: string;
  summaryNote: string;
  followUpPlanMeta: string;
  rating: number;
  prescriptionOpen: boolean;
  onSelectRating: (value: number) => void;
  onViewPrescription: () => void;
  onOpenPrescription: () => void;
  onClosePrescription: () => void;
  onOrderMedicines: () => void;
  onViewFollowUpTasks: () => void;
  onWriteReview: () => void;
  onReportProblem: () => void;
  onOpenSettings: () => void;
  onBackHome: () => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

export function useConsultationCompleteController({
  appointment,
  durationMinutes,
  onBackHome,
  onViewFollowUpTasks,
  onOrderMedicines,
  onWriteReview,
}: {
  appointment: BookedAppointment | null;
  durationMinutes: number;
  onBackHome: () => void;
  onViewFollowUpTasks?: () => void;
  onOrderMedicines?: () => void;
  onWriteReview?: () => void;
}): ConsultationCompleteViewModel {
  const { language, t } = useLocalization();
  const [rating, setRating] = useState(0);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  const doctorName = appointment?.doctorNameKey
    ? t(appointment.doctorNameKey)
    : '';
  const credentials = appointment?.credentialsKey
    ? t(appointment.credentialsKey)
    : '';
  const mins = localizeDigits(String(Math.max(1, durationMinutes)), language);
  const modeLabel = appointment?.modeConsultLabel ?? '';
  const whenBase = appointment?.whenLabel ?? '';
  const whenLine = [whenBase, modeLabel].filter(Boolean).join(' · ');
  const authUser = useAppSelector((state) => state.auth.user);
  const patientName =
    appointment?.patientLabel?.split('(')[0]?.trim() ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const patientAppId =
    appointment?.patientAppId ??
    (appointment as unknown as { appointmentId?: number })?.appointmentId ??
    (appointment?.id && Number.isFinite(Number(appointment.id)) ? Number(appointment.id) : undefined);
  const {
    data: summaryResponse,
    isLoading,
    isError,
    refetch,
  } = useGetConsultationSummaryQuery(patientAppId ?? 0, {
    skip: !isAuthenticated || !patientAppId,
  });
  const realSummaryText = summaryResponse?.data?.[0]?.text?.trim() || '';

  const openPrescription = () => setPrescriptionOpen(true);

  return {
    language,
    t,
    completedBanner: t('completeBanner').replace('{minutes}', mins),
    doctorName,
    credentials,
    whenLine,
    patientChip: patientName
      ? t('completePatient').replace('{name}', patientName)
      : '',
    discussed: '',
    advice: '',
    nextFollowUp: '',
    summaryNote: realSummaryText,
    followUpPlanMeta: t('completeFollowUpMeta'),
    rating,
    prescriptionOpen,
    onSelectRating: setRating,
    onViewPrescription: openPrescription,
    onOpenPrescription: openPrescription,
    onClosePrescription: () => setPrescriptionOpen(false),
    onOrderMedicines: () => onOrderMedicines?.(),
    onViewFollowUpTasks: () => onViewFollowUpTasks?.(),
    onWriteReview: () => onWriteReview?.(),
    onReportProblem: () => undefined,
    onOpenSettings: () => undefined,
    onBackHome,
    isLoading,
    isError,
    onRetry: () => {
      void refetch();
    },
  };
}
