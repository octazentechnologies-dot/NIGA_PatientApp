import { useEffect, useRef } from 'react';

import { formatHoldTime } from '../config/bookingPayment';
import type { ConsultMode } from '../config/appointmentSlots';
import {
  makeBookingId,
  SEED_ATTEMPT_ID,
  SEED_PAYMENT_ID,
  SEED_REASON_KEY,
} from '../config/bookedAppointments';
import type { BookedAppointment } from '../config/bookedAppointments';
import type { PaymentStatus } from './useBookAppointmentController';
import { getDoctorProfile } from '../config/doctorProfiles';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type PaymentStatusDraft = {
  status: PaymentStatus;
  doctorId: string;
  doctorName: string;
  doctorInitials: string;
  experienceKey: TranslationKey;
  whenLabel: string;
  dateLine: string;
  timeLine: string;
  startsAt: string;
  bookedOnLabel: string;
  mode: ConsultMode;
  slotTimeLabel: string;
  modeConsultLabel: string;
  patientLabel: string;
  totalLabel: string;
  holdSeconds: number;
};

export type PaymentStatusViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  status: PaymentStatus;
  doctorName: string;
  doctorInitials: string;
  specialtyLine: string;
  whenLabel: string;
  modeConsultLabel: string;
  patientLabel: string;
  successMeta: string;
  attemptId: string;
  holdMoreLabel: string;
  onClose: () => void;
  onViewAppointment: () => void;
  onAddCalendar: () => void;
  onDownloadReceipt: () => void;
  onRetry: () => void;
  onChooseMethod: () => void;
  onChooseSlot: () => void;
  onCheckStatus: () => void;
  onContactSupport: () => void;
};

export function usePaymentStatusController({
  draft,
  active,
  onConfirmBooking,
  onCloseSuccess,
  onRetry,
  onChooseMethod,
  onChooseSlot,
  onConfirmPending,
}: {
  draft: PaymentStatusDraft;
  active: boolean;
  onConfirmBooking: (item: BookedAppointment) => void;
  onCloseSuccess: () => void;
  onRetry: () => void;
  onChooseMethod: () => void;
  onChooseSlot: () => void;
  onConfirmPending: () => void;
}): PaymentStatusViewModel {
  const { language, t } = useLocalization();
  const confirmed = useRef(false);

  useEffect(() => {
    if (!active) {
      confirmed.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (!active || draft.status !== 'success' || confirmed.current) {
      return;
    }
    confirmed.current = true;
    const profile = getDoctorProfile(draft.doctorId);
    onConfirmBooking({
      id: `${draft.doctorId}-${draft.whenLabel}-${draft.patientLabel}`,
      bookingId: makeBookingId(),
      doctorId: draft.doctorId,
      doctorNameKey: profile.nameKey,
      doctorInitials: draft.doctorInitials,
      credentialsKey: profile.credentialsKey,
      experienceKey: draft.experienceKey,
      whenLabel: draft.whenLabel,
      dateLine: draft.dateLine,
      timeLine: draft.timeLine,
      startsAt: draft.startsAt,
      bookedOnLabel: draft.bookedOnLabel,
      mode: draft.mode,
      modeConsultLabel: draft.modeConsultLabel,
      patientLabel: draft.patientLabel,
      feeLabel: draft.totalLabel,
      paymentId: SEED_PAYMENT_ID,
      reasonKey: SEED_REASON_KEY,
      status: 'waiting_acceptance',
      ...(draft.mode === 'chat'
        ? {
            chatClosesAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            linkedConsultationLabel: draft.dateLine,
          }
        : {}),
    });
  }, [active, draft, onConfirmBooking]);

  return {
    language,
    t,
    status: draft.status,
    doctorName: draft.doctorName,
    doctorInitials: draft.doctorInitials,
    specialtyLine: `${t('payStatusHomeopath')} · ${t(draft.experienceKey)}`,
    whenLabel: draft.whenLabel,
    modeConsultLabel: draft.modeConsultLabel,
    patientLabel: draft.patientLabel,
    successMeta: t('payStatusSuccessMeta')
      .replace('{amount}', draft.totalLabel)
      .replace('{id}', SEED_PAYMENT_ID),
    attemptId: SEED_ATTEMPT_ID,
    holdMoreLabel: t('payStatusHoldMore')
      .replace('{slot}', draft.slotTimeLabel)
      .replace('{time}', formatHoldTime(draft.holdSeconds)),
    onClose: onCloseSuccess,
    onViewAppointment: onCloseSuccess,
    onAddCalendar: () => undefined,
    onDownloadReceipt: () => undefined,
    onRetry,
    onChooseMethod,
    onChooseSlot,
    onCheckStatus: onConfirmPending,
    onContactSupport: () => undefined,
  };
}
