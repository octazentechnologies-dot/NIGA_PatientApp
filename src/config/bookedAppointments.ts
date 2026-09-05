import type { TranslationKey } from '../localization/types';

export type AppointmentRequestStatus = 'waiting_acceptance';

export type BookedAppointment = {
  id: string;
  doctorId: string;
  doctorNameKey: TranslationKey;
  doctorInitials: string;
  experienceKey: TranslationKey;
  whenLabel: string;
  modeConsultLabel: string;
  patientLabel: string;
  feeLabel: string;
  paymentId: string;
  status: AppointmentRequestStatus;
};

export const SEED_PAYMENT_ID = 'PAY-9F2K41B';
export const SEED_ATTEMPT_ID = 'ATT-4471';
