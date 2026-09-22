/**
 * Minimal routing data for push payloads.
 * Never include PHI, diagnosis, prescription text, JWTs, or secrets.
 */
export type PushNotificationType =
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'consultation_ready'
  | 'consultation_started'
  | 'new_message'
  | 'prescription_ready'
  | 'medical_update';

export type PushNotificationData = {
  type: PushNotificationType;
  /** Local / server appointment id used for deep-link routing. */
  appointmentId?: string;
  /** Optional consultation session id (route when screen wiring exists). */
  consultationId?: string;
  /** Optional message thread id (route when screen wiring exists). */
  messageId?: string;
};

export type PushPlatform = 'android' | 'ios';

export type RegisterDeviceRequest = {
  pushToken: string;
  platform: PushPlatform;
  deviceId?: string;
};

export type RegisterDeviceResponse = {
  success?: boolean;
  message?: string;
};

export type UnregisterDeviceRequest = {
  pushToken: string;
  platform: PushPlatform;
};

export type PushRegistrationStatus =
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'missing_project_id'
  | 'error';

export type PushRegistrationResult = {
  ok: boolean;
  status: PushRegistrationStatus;
  pushToken?: string;
  platform?: PushPlatform;
  /** Safe, non-sensitive reason for logging / UI. */
  reason?: string;
};

export type NotificationNavigationHandlers = {
  openAppointment: (appointmentId: string) => void;
  openMyAppointments: () => void;
  openPrescriptions: () => void;
  openHealthRecords: () => void;
  openNotificationsInbox: () => void;
};
