import type { Notification } from 'expo-notifications';

import { logNotifications } from './log';
import type {
  NotificationNavigationHandlers,
  PushNotificationData,
  PushNotificationType,
} from './types';

const KNOWN_TYPES: ReadonlySet<PushNotificationType> = new Set([
  'appointment_confirmed',
  'appointment_reminder',
  'appointment_cancelled',
  'consultation_ready',
  'consultation_started',
  'new_message',
  'prescription_ready',
  'medical_update',
]);

let handlers: NotificationNavigationHandlers | null = null;
let pending: PushNotificationData | null = null;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function parsePushNotificationData(
  raw: unknown,
): PushNotificationData | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const type = record.type;
  if (typeof type !== 'string' || !KNOWN_TYPES.has(type as PushNotificationType)) {
    logNotifications('Unknown or missing notification type');
    return null;
  }

  const data: PushNotificationData = {
    type: type as PushNotificationType,
  };

  if (isNonEmptyString(record.appointmentId)) {
    data.appointmentId = record.appointmentId.trim();
  }
  if (isNonEmptyString(record.consultationId)) {
    data.consultationId = record.consultationId.trim();
  }
  if (isNonEmptyString(record.messageId)) {
    data.messageId = record.messageId.trim();
  }

  return data;
}

export function parseNotificationPayload(
  notification: Notification,
): PushNotificationData | null {
  return parsePushNotificationData(notification.request.content.data);
}

export function setNotificationNavigationHandlers(
  next: NotificationNavigationHandlers | null,
): void {
  handlers = next;
  if (handlers && pending) {
    const queued = pending;
    pending = null;
    dispatchNotificationNavigation(queued);
  }
}

export function queueOrDispatchNotificationNavigation(
  data: PushNotificationData,
): void {
  if (!handlers) {
    pending = data;
    logNotifications('Navigation queued until home is ready', data.type);
    return;
  }
  dispatchNotificationNavigation(data);
}

function dispatchNotificationNavigation(data: PushNotificationData): void {
  if (!handlers) {
    pending = data;
    return;
  }

  logNotifications('Navigating from notification', data.type);

  switch (data.type) {
    case 'appointment_confirmed':
    case 'appointment_reminder':
    case 'appointment_cancelled':
    case 'consultation_ready':
    case 'consultation_started':
    case 'new_message': {
      // TODO: consultation_ready / new_message could deep-open WaitingRoom / Chat
      // once home/appointment controllers expose those entry points from outside.
      if (data.appointmentId) {
        handlers.openAppointment(data.appointmentId);
      } else {
        handlers.openMyAppointments();
      }
      return;
    }
    case 'prescription_ready':
      handlers.openPrescriptions();
      return;
    case 'medical_update':
      handlers.openHealthRecords();
      return;
    default:
      handlers.openNotificationsInbox();
  }
}
