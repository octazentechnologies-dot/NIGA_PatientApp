import { colors } from '../theme/colors';
import type { TranslationKey } from '../localization/types';

/**
 * Patient-facing visit status display. Does not change stored API values.
 *
 * WAITING before check-in → Booked (UNPAID) / Confirmed (PAID).
 * WAITING after check-in → Checked in.
 * Prefer `lifecycleStatus` when the API sends it.
 */

export type VisitLifecycleStatus =
  | 'upcoming'
  | 'overdue_grace'
  | 'expired'
  | 'open'
  | string;

export type PatientVisitDisplayInput = {
  status?: string | null;
  paymentStatus?: string | null;
  isPaid?: boolean | null;
  /** Clinic check-in completed (API EARLY/READY/WALK-IN, or WAITING with queue / local check-in). */
  checkedIn?: boolean;
  lifecycleStatus?: VisitLifecycleStatus | null;
  /** Visit detail / list flag from New-API (`isExpired`). */
  isExpired?: boolean | null;
  /** When false due to limit/expiry, UI disables reschedule. */
  canReschedule?: boolean | null;
};

export type PatientVisitDisplay = {
  labelKey: TranslationKey;
  /** Fallback English if a key is missing in older builds — prefer t(labelKey). */
  labelFallback: string;
  color: string;
  background: string;
  borderColor: string;
  badgeType: 'upcoming' | 'waiting' | 'completed' | 'cancelled' | 'neutral' | 'missed';
  lifecycle: 'upcoming' | 'overdue_grace' | 'expired' | 'open' | 'terminal';
  showRescheduleCta: boolean;
  showBookNewCta: boolean;
};

const PRIMARY_BORDER = '#C5E7F9';
const WARN_BORDER = '#F6DCB1';
const SUCCESS_BORDER = '#C6E7D6';
const ERROR_BORDER = '#F5D0CC';

function isPaidPayment(
  paymentStatus?: string | null,
  isPaid?: boolean | null,
): boolean {
  if (isPaid === true) return true;
  const p = (paymentStatus || '').trim().toUpperCase();
  return p === 'PAID' || p === 'CAPTURED' || p === 'SUCCESS';
}

/** True when stored status (or queue) means the patient has checked in at clinic. */
export function isClinicCheckedInStatus(
  status?: string | null,
  queuePosition?: number | null,
): boolean {
  const s = (status || '').trim().toUpperCase();
  if (s === 'EARLY' || s === 'READY' || s === 'WALK-IN') return true;
  if (s === 'WAITING' && queuePosition != null && Number(queuePosition) > 0) {
    return true;
  }
  return false;
}

function resolveLifecycle(
  input: PatientVisitDisplayInput,
  statusKey: string,
): PatientVisitDisplay['lifecycle'] {
  const raw = (input.lifecycleStatus || '').trim().toLowerCase();
  if (
    raw === 'upcoming' ||
    raw === 'overdue_grace' ||
    raw === 'expired' ||
    raw === 'open'
  ) {
    return raw;
  }
  if (statusKey === 'CANCELLED' || statusKey === 'CANCELED' || statusKey === 'DECLINED') {
    return 'terminal';
  }
  if (statusKey === 'COMPLETED' || statusKey === 'COMPLETE' || statusKey === 'CLOSED') {
    return 'terminal';
  }
  if (statusKey === 'EXPIRED') {
    return 'expired';
  }
  if (statusKey === 'OVERDUE' || statusKey === 'NOT ARRIVED') {
    return 'overdue_grace';
  }
  if (input.isExpired === true) {
    // Past slot: grace if API still allows reschedule; else expired.
    if (input.canReschedule === true) return 'overdue_grace';
    if (input.canReschedule === false) return 'expired';
    return 'expired';
  }
  if (statusKey === 'REMAINING') return 'open';
  return 'upcoming';
}

function chip(
  labelKey: TranslationKey,
  labelFallback: string,
  color: string,
  background: string,
  borderColor: string,
  badgeType: PatientVisitDisplay['badgeType'],
  lifecycle: PatientVisitDisplay['lifecycle'],
  showRescheduleCta = false,
  showBookNewCta = false,
): PatientVisitDisplay {
  return {
    labelKey,
    labelFallback,
    color,
    background,
    borderColor,
    badgeType,
    lifecycle,
    showRescheduleCta,
    showBookNewCta,
  };
}

/**
 * Map stored visit status (+ payment / check-in / lifecycle) → patient label + chrome.
 */
export function mapPatientVisitDisplay(
  input: PatientVisitDisplayInput,
): PatientVisitDisplay {
  const statusKey = (input.status || '').trim().toUpperCase();
  const lifecycle = resolveLifecycle(input, statusKey);
  const paid = isPaidPayment(input.paymentStatus, input.isPaid);
  const checkedIn = Boolean(input.checkedIn);

  if (lifecycle === 'expired' || statusKey === 'EXPIRED') {
    return chip(
      'visitLabelExpired',
      'Expired — book new visit',
      colors.onSurfaceVariant,
      colors.surfaceContainerHigh,
      colors.outlineVariant,
      'missed',
      'expired',
      false,
      true,
    );
  }

  if (lifecycle === 'overdue_grace' || statusKey === 'OVERDUE' || statusKey === 'NOT ARRIVED') {
    const canReschedule = input.canReschedule !== false;
    return chip(
      'visitLabelMissedGrace',
      'Missed — reschedule within grace',
      colors.warning,
      colors.warningContainer,
      WARN_BORDER,
      'missed',
      'overdue_grace',
      canReschedule,
      !canReschedule,
    );
  }

  if (statusKey === 'CANCELLED' || statusKey === 'CANCELED' || statusKey === 'DECLINED') {
    return chip(
      'visitLabelCancelled',
      'Cancelled',
      colors.error,
      colors.errorContainer,
      ERROR_BORDER,
      'cancelled',
      'terminal',
    );
  }

  if (statusKey === 'COMPLETED' || statusKey === 'COMPLETE' || statusKey === 'CLOSED') {
    return chip(
      'visitLabelCompleted',
      'Completed',
      colors.success,
      colors.successContainer,
      SUCCESS_BORDER,
      'completed',
      'terminal',
    );
  }

  if (statusKey === 'EARLY') {
    return chip(
      'visitLabelArrivedEarly',
      'Arrived early',
      colors.primary,
      colors.primaryContainer,
      PRIMARY_BORDER,
      'waiting',
      lifecycle === 'open' ? 'open' : 'upcoming',
    );
  }

  if (statusKey === 'READY') {
    return chip(
      'visitLabelReady',
      'Ready for doctor',
      colors.primary,
      colors.primaryFixed,
      PRIMARY_BORDER,
      'waiting',
      'open',
    );
  }

  if (statusKey === 'WALK-IN') {
    return chip(
      'visitLabelAtClinic',
      'At clinic',
      colors.warning,
      colors.warningContainer,
      WARN_BORDER,
      'waiting',
      'open',
    );
  }

  if (statusKey === 'E-CONSULT') {
    return chip(
      'visitLabelTele',
      'Tele consultation',
      colors.primary,
      colors.primaryContainer,
      PRIMARY_BORDER,
      'upcoming',
      lifecycle === 'open' ? 'open' : 'upcoming',
    );
  }

  if (statusKey === 'REMAINING') {
    return chip(
      'visitLabelInProgress',
      'In progress',
      colors.primary,
      colors.primaryContainer,
      PRIMARY_BORDER,
      'waiting',
      'open',
    );
  }

  if (statusKey === 'WAITING') {
    if (checkedIn) {
      return chip(
        'visitLabelCheckedIn',
        'Checked in',
        colors.warning,
        colors.warningContainer,
        WARN_BORDER,
        'waiting',
        lifecycle === 'open' ? 'open' : 'upcoming',
      );
    }
    if (paid) {
      return chip(
        'visitLabelConfirmed',
        'Confirmed',
        colors.primary,
        colors.primaryContainer,
        PRIMARY_BORDER,
        'upcoming',
        'upcoming',
      );
    }
    return chip(
      'visitLabelBooked',
      'Booked',
      colors.primary,
      colors.primaryContainer,
      PRIMARY_BORDER,
      'upcoming',
      'upcoming',
    );
  }

  // Legacy / alternate upcoming labels
  if (statusKey === 'CONFIRMED' || statusKey === 'ACCEPTED' || statusKey === 'UPCOMING') {
    return chip(
      paid ? 'visitLabelConfirmed' : 'visitLabelBooked',
      paid ? 'Confirmed' : 'Booked',
      colors.primary,
      colors.primaryContainer,
      PRIMARY_BORDER,
      'upcoming',
      'upcoming',
    );
  }

  if (statusKey === 'PENDING') {
    return chip(
      'visitLabelBooked',
      'Booked',
      colors.warning,
      colors.warningContainer,
      WARN_BORDER,
      'waiting',
      'upcoming',
    );
  }

  const raw = (input.status || '').trim();
  return chip(
    'visitLabelUnknown',
    raw || 'Unknown',
    colors.onSurfaceVariant,
    colors.surfaceContainerHigh,
    colors.outlineVariant,
    'neutral',
    lifecycle === 'open' ? 'open' : 'upcoming',
  );
}
