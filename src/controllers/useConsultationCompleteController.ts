import { useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

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

  const doctorName = appointment
    ? t(appointment.doctorNameKey)
    : t('searchResultAnjaliName');
  const credentials = appointment
    ? t(appointment.credentialsKey)
    : t('searchResultAnjaliCredentials');
  const mins = localizeDigits(String(Math.max(1, durationMinutes)), language);
  const modeLabel = appointment?.modeConsultLabel ?? t('reviewVideoConsult');
  const whenBase = appointment?.whenLabel ?? 'Today, 11 Sep 2026 · 6:00 PM IST';
  const whenLine = `${whenBase} · ${modeLabel}`;
  const patientName =
    appointment?.patientLabel?.split('(')[0]?.trim() ?? 'Aarav Kulkarni';

  const openPrescription = () => setPrescriptionOpen(true);

  return {
    language,
    t,
    completedBanner: t('completeBanner').replace('{minutes}', mins),
    doctorName,
    credentials,
    whenLine,
    patientChip: t('completePatient').replace('{name}', patientName),
    discussed: t('completeDiscussedBody'),
    advice: t('completeAdviceBody'),
    nextFollowUp: t('completeFollowUpBody'),
    summaryNote: t('completeSummaryNote').replace('{name}', doctorName),
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
  };
}
