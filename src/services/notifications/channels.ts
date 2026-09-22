import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import {
  CHANNEL_APPOINTMENTS,
  CHANNEL_CONSULTATIONS,
  CHANNEL_DEFAULT,
} from './channelIds';
import { logNotifications } from './log';

export {
  CHANNEL_APPOINTMENTS,
  CHANNEL_CONSULTATIONS,
  CHANNEL_DEFAULT,
} from './channelIds';

/**
 * Create Android channels before requesting a push token (Android 13+).
 * Appointments/consultations use HIGH — not MAX for every category.
 * Only loaded from notificationService.impl (never from Expo Go path).
 */
export async function ensureAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_DEFAULT, {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2A7BA3',
  });

  await Notifications.setNotificationChannelAsync(CHANNEL_APPOINTMENTS, {
    name: 'Appointments',
    description: 'Appointment confirmations, reminders, and cancellations',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2A7BA3',
  });

  await Notifications.setNotificationChannelAsync(CHANNEL_CONSULTATIONS, {
    name: 'Consultations',
    description: 'Consultation ready and live-session alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2A7BA3',
  });

  logNotifications('Android channels ready');
}
