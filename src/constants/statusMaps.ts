import { colors } from '../theme/colors';
import {
  mapPatientVisitDisplay,
  type PatientVisitDisplayInput,
} from '../utilities/patientVisitDisplay';

export type StatusVisual = {
  label: string;
  color: string;
  background: string;
  borderColor?: string;
  badgeType?: 'upcoming' | 'waiting' | 'completed' | 'cancelled' | 'neutral' | 'missed';
  labelKey?: string;
};

const NEUTRAL: StatusVisual = {
  label: '',
  color: colors.onSurfaceVariant,
  background: colors.surfaceContainerHigh,
  borderColor: colors.outlineVariant,
  badgeType: 'neutral',
};

function chip(
  label: string,
  color: string,
  background: string,
  borderColor?: string,
  badgeType: StatusVisual['badgeType'] = 'neutral',
): StatusVisual {
  return { label, color, background, borderColor, badgeType };
}

/**
 * Appointment / visit status → label + colours.
 * Prefer {@link mapVisitStatusDisplay} when payment / check-in / lifecycle are known.
 */
export function mapVisitStatus(status: string | null | undefined): StatusVisual {
  return mapVisitStatusDisplay({ status });
}

/** Full patient display mapping (payment + check-in + lifecycle). */
export function mapVisitStatusDisplay(
  input: PatientVisitDisplayInput,
): StatusVisual {
  const mapped = mapPatientVisitDisplay(input);
  return {
    label: mapped.labelFallback,
    labelKey: mapped.labelKey,
    color: mapped.color,
    background: mapped.background,
    borderColor: mapped.borderColor,
    badgeType: mapped.badgeType,
  };
}

export function mapPaymentStatus(status: string | null | undefined): StatusVisual {
  const raw = (status ?? '').trim();
  const key = raw.toUpperCase();
  const table: Record<string, StatusVisual> = {
    PENDING: chip('Pending', '#276F93', colors.secondaryContainer),
    CAPTURED: chip('Paid', colors.primary, colors.primaryFixed),
    PAID: chip('Paid', colors.primary, colors.primaryFixed),
    FAILED: chip('Failed', colors.error, colors.errorContainer),
    REFUNDED: chip('Refunded', colors.onSurfaceVariant, colors.surfaceContainerHigh),
  };
  return table[key] ?? { ...NEUTRAL, label: raw || 'Unknown' };
}

export function mapReviewStatus(status: string | null | undefined): StatusVisual {
  const raw = (status ?? '').trim();
  const key = raw.toUpperCase();
  const table: Record<string, StatusVisual> = {
    APPROVED: chip('Approved', colors.primary, colors.primaryFixed),
    PENDING: chip('Pending', '#276F93', colors.secondaryContainer),
    APPEALED: chip('Appealed', '#276F93', colors.secondaryContainer),
    REJECTED: chip('Rejected', colors.error, colors.errorContainer),
  };
  return table[key] ?? { ...NEUTRAL, label: raw || 'Unknown' };
}

/** BE-017 appealStatus — null means no appeal yet. */
export function mapAppealStatus(status: string | null | undefined): StatusVisual {
  if (status == null || !String(status).trim()) {
    return { ...NEUTRAL, label: '' };
  }
  const raw = String(status).trim();
  const key = raw.toUpperCase();
  const table: Record<string, StatusVisual> = {
    OPEN: chip('Appeal open', '#276F93', colors.secondaryContainer),
    UPHELD: chip('Appeal upheld', colors.primary, colors.primaryFixed),
    REJECTED: chip('Appeal rejected', colors.error, colors.errorContainer),
  };
  return table[key] ?? { ...NEUTRAL, label: raw };
}

export function mapCheckInStatus(status: string | null | undefined): StatusVisual {
  const raw = (status ?? '').trim();
  const key = raw.toUpperCase();
  const table: Record<string, StatusVisual> = {
    EARLY: chip('Arrived early', colors.primary, colors.primaryFixed),
    WAITING: chip('Checked in', '#276F93', colors.secondaryContainer),
    READY: chip('Ready for doctor', colors.primary, colors.primaryFixed),
  };
  return table[key] ?? { ...NEUTRAL, label: raw || 'Unknown' };
}

/** BE-005 appointment request statuses. */
export function mapAppointmentRequestStatus(
  status: string | null | undefined,
): StatusVisual {
  const raw = (status ?? '').trim();
  const key = raw.toUpperCase();
  const table: Record<string, StatusVisual> = {
    PENDING: chip('Waiting for doctor', '#276F93', colors.secondaryContainer),
    ACCEPTED: chip('Accepted', colors.primary, colors.primaryFixed),
    DECLINED: chip('Declined', colors.error, colors.errorContainer),
    PROPOSED: chip('New time proposed', '#276F93', colors.secondaryContainer),
    CANCELLED: chip('Cancelled', colors.error, colors.errorContainer),
    EXPIRED: chip('Expired', colors.onSurfaceVariant, colors.surfaceContainerHigh),
  };
  return table[key] ?? { ...NEUTRAL, label: raw || 'Unknown' };
}

export type ReminderKind = 'MEDICINE' | 'FOLLOW_UP' | 'SELF_CARE' | string;

export function mapReminderKind(kind: string | null | undefined): StatusVisual {
  const raw = (kind ?? '').trim();
  const key = raw.toUpperCase();
  const table: Record<string, StatusVisual> = {
    MEDICINE: chip('Medicine', colors.primary, colors.primaryFixed),
    FOLLOW_UP: chip('Follow-up', '#276F93', colors.secondaryContainer),
    SELF_CARE: chip('Self-care', colors.onSurfaceVariant, colors.surfaceContainerHigh),
  };
  return table[key] ?? { ...NEUTRAL, label: raw || 'Reminder' };
}

/** Allowed check-in statuses for the CheckIn API. */
export const CHECK_IN_STATUSES = ['EARLY', 'WAITING', 'READY'] as const;
export type CheckInStatus = (typeof CHECK_IN_STATUSES)[number];
