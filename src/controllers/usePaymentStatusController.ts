import { useEffect, useRef } from 'react';

import { formatHoldTime } from '../config/bookingPayment';
import type { ConsultMode } from '../config/appointmentSlots';
import {
  makeBookingId,
  SEED_REASON_KEY,
} from '../config/bookedAppointments';
import type { BookedAppointment } from '../config/bookedAppointments';
import type { PaymentStatus } from './useBookAppointmentController';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { maskPaymentId } from '../payments';

export type PaymentStatusDraft = {
  status: PaymentStatus;
  doctorId: string;
  doctorName: string;
  doctorInitials: string;
  experienceKey: TranslationKey | '';
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
  /** Server paymentOrderId — never a seed literal. */
  paymentOrderId: number | null;
  /** Visit id from hold — aligns local row with Visits refetch. */
  patientAppId?: number | null;
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
    // Optimistic local row only until Visits refetch (CAPTURED invalidates Visits).
    // Use patientAppId as id so the server list replaces this row instead of duplicating.
    if (!active || draft.status !== 'success' || confirmed.current) {
      return;
    }
    confirmed.current = true;
    const paymentId =
      draft.paymentOrderId != null ? String(draft.paymentOrderId) : '';
    const visitId =
      draft.patientAppId != null
        ? String(draft.patientAppId)
        : `${draft.doctorId}-${draft.whenLabel}-${draft.patientLabel}`;
    onConfirmBooking({
      id: visitId,
      bookingId:
        draft.patientAppId != null
          ? `APT-${draft.patientAppId}`
          : makeBookingId(),
      doctorId: draft.doctorId,
      doctorNameKey: '' as TranslationKey,
      doctorInitials: draft.doctorInitials,
      credentialsKey: '' as TranslationKey,
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
      paymentId,
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

  const paymentLabel =
    draft.paymentOrderId != null
      ? maskPaymentId(draft.paymentOrderId)
      : '—';

  return {
    language,
    t,
    status: draft.status,
    doctorName: draft.doctorName,
    doctorInitials: draft.doctorInitials,
    specialtyLine: draft.experienceKey
      ? `${t('payStatusHomeopath')} · ${t(draft.experienceKey)}`
      : t('payStatusHomeopath'),
    whenLabel: draft.whenLabel,
    modeConsultLabel: draft.modeConsultLabel,
    patientLabel: draft.patientLabel,
    successMeta: t('payStatusSuccessMeta')
      .replace('{amount}', draft.totalLabel)
      .replace('{id}', paymentLabel),
    attemptId: paymentLabel,
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
