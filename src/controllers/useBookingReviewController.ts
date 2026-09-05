import { useEffect, useState } from 'react';

import type { DoctorProfileSeed } from '../config/doctorProfiles';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type BookingReviewDraft = {
  profile: DoctorProfileSeed;
  shortCredsKey: TranslationKey;
  whenLabel: string;
  modeConsultLabel: string;
  patientLabel: string;
  doctorFeeLabel: string;
  platformFeeLabel: string;
  taxesLabel: string;
  totalLabel: string;
};

export type BookingReviewViewModel = BookingReviewDraft & {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  reason: string;
  attached: boolean;
  shareRecords: boolean;
  reminders: boolean;
  policyOpen: boolean;
  emergencyOpen: boolean;
  onBack: () => void;
  onChangeWhen: () => void;
  onChangeMode: () => void;
  onChangePatient: () => void;
  onChangeReason: (value: string) => void;
  onToggleAttach: () => void;
  onToggleShareRecords: () => void;
  onToggleReminders: () => void;
  onTogglePolicy: () => void;
  onToggleEmergency: () => void;
  onProceedPay: () => void;
};

export function useBookingReviewController({
  draft,
  active,
  onBack,
  onProceedPay,
}: {
  draft: BookingReviewDraft;
  active: boolean;
  onBack: () => void;
  onProceedPay: () => void;
}): BookingReviewViewModel {
  const { language, t } = useLocalization();
  const [reason, setReason] = useState('');
  const [attached, setAttached] = useState(false);
  const [shareRecords, setShareRecords] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(true);

  useEffect(() => {
    if (!active) {
      setReason('');
      setAttached(false);
      setShareRecords(true);
      setReminders(false);
      setPolicyOpen(true);
      setEmergencyOpen(true);
    }
  }, [active, draft.profile.id]);

  return {
    language,
    t,
    ...draft,
    reason,
    attached,
    shareRecords,
    reminders,
    policyOpen,
    emergencyOpen,
    onBack,
    onChangeWhen: onBack,
    onChangeMode: onBack,
    onChangePatient: onBack,
    onChangeReason: setReason,
    onToggleAttach: () => setAttached((current) => !current),
    onToggleShareRecords: () => setShareRecords((current) => !current),
    onToggleReminders: () => setReminders((current) => !current),
    onTogglePolicy: () => setPolicyOpen((current) => !current),
    onToggleEmergency: () => setEmergencyOpen((current) => !current),
    onProceedPay,
  };
}
