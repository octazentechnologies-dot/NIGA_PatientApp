import type { ConsultMode } from './appointmentSlots';
import type { TranslationKey } from '../localization/types';

export type AppointmentRequestStatus = 'waiting_acceptance' | 'confirmed';

export type BookedAppointment = {
  id: string;
  bookingId: string;
  doctorId: string;
  doctorNameKey: TranslationKey;
  doctorInitials: string;
  credentialsKey: TranslationKey;
  experienceKey: TranslationKey;
  whenLabel: string;
  dateLine: string;
  timeLine: string;
  startsAt: string;
  bookedOnLabel: string;
  mode: ConsultMode;
  modeConsultLabel: string;
  patientLabel: string;
  feeLabel: string;
  paymentId: string;
  reasonKey: TranslationKey;
  status: AppointmentRequestStatus;
  /** Follow-up / chat consultation window end (ISO). */
  chatClosesAt?: string;
  /** Linked prior consult date label shown in chat header strip. */
  linkedConsultationLabel?: string;
};

export const SEED_PAYMENT_ID = 'PAY-9F2K41B';
export const SEED_ATTEMPT_ID = 'ATT-4471';
export const SEED_REASON_KEY: TranslationKey = 'aptReasonCough';
export const NEAR_START_MS = 2 * 60 * 60 * 1000;
export const JOIN_GRACE_MS = 30 * 60 * 1000;

export function makeBookingId(now = new Date()): string {
  return `APT-${now.getFullYear()}-${String(now.getTime()).slice(-5)}`;
}

export function slotStartIso(
  year: number,
  month: number,
  day: number,
  slotId: string,
): string {
  const [hours, minutes] = slotId.split(':').map(Number);
  return new Date(year, month, day, hours || 0, minutes || 0, 0, 0).toISOString();
}

export function formatBookedOn(
  date: Date,
  language: 'en' | 'mr',
  monthName: string,
): string {
  const month = language === 'en' ? monthName.slice(0, 3) : monthName;
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

export function padTime(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatCountdown(totalSeconds: number, language: 'en' | 'mr'): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const raw = `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
  if (language !== 'mr') {
    return raw;
  }
  return raw.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

export function createSeedFollowUpChat(
  language: 'en' | 'mr' = 'en',
): BookedAppointment {
  const closes = new Date();
  closes.setDate(closes.getDate() + 5);
  const linked = new Date();
  linked.setDate(linked.getDate() - 14);
  const monthEn = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const closesLabel = `${closes.getDate()} ${monthEn[closes.getMonth()]}`;
  const linkedLabel = `${linked.getDate()} ${monthEn[linked.getMonth()]} ${linked.getFullYear()}`;

  return {
    id: 'seed-followup-chat',
    bookingId: makeBookingId(closes),
    doctorId: 'anjali',
    doctorNameKey: 'searchResultAnjaliName',
    doctorInitials: 'AD',
    credentialsKey: 'searchResultAnjaliCredentials',
    experienceKey: 'searchResultAnjaliExperience',
    whenLabel:
      language === 'en'
        ? `Follow-up chat · closes ${closesLabel}`
        : `फॉलो-अप चॅट · ${closesLabel} रोजी बंद`,
    dateLine: closesLabel,
    timeLine: language === 'en' ? 'Chat' : 'चॅट',
    startsAt: new Date().toISOString(),
    bookedOnLabel: linkedLabel,
    mode: 'chat',
    modeConsultLabel: language === 'en' ? 'Chat Consultation' : 'चॅट सल्ला',
    patientLabel: 'Aarav Kulkarni (8 yrs, Son)',
    feeLabel: '₹400',
    paymentId: SEED_PAYMENT_ID,
    reasonKey: 'aptReasonCough',
    status: 'confirmed',
    chatClosesAt: closes.toISOString(),
    linkedConsultationLabel: linkedLabel,
  };
}
