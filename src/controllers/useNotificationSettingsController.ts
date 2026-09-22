import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type NotifChannel = 'push' | 'sms' | 'inApp' | 'email';

export type NotifPrefRowId =
  | 'appointmentReminders'
  | 'joinAlerts'
  | 'prescriptionFollowUp'
  | 'selfCare'
  | 'marketing';

export type NotifReminderId = '24h' | '2h' | '30m' | '10m';

export type NotificationSettingsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  prefs: Record<NotifPrefRowId, Record<NotifChannel, boolean>>;
  reminders: Record<NotifReminderId, boolean>;
  quietHoursOn: boolean;
  quietHoursLabel: string;
  onBack: () => void;
  onOpenNotifications: () => void;
  onTogglePref: (row: NotifPrefRowId, channel: NotifChannel) => void;
  onToggleReminder: (id: NotifReminderId) => void;
  onToggleQuietHours: (value: boolean) => void;
};

const DEFAULT_PREFS: NotificationSettingsViewModel['prefs'] = {
  appointmentReminders: { push: true, sms: true, inApp: true, email: false },
  joinAlerts: { push: true, sms: true, inApp: false, email: false },
  prescriptionFollowUp: { push: true, sms: false, inApp: true, email: true },
  selfCare: { push: true, sms: false, inApp: false, email: false },
  marketing: { push: false, sms: false, inApp: false, email: false },
};

export function useNotificationSettingsController({
  onBack,
  onOpenNotifications,
}: {
  onBack: () => void;
  onOpenNotifications?: () => void;
}): NotificationSettingsViewModel {
  const { language, t } = useLocalization();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [reminders, setReminders] = useState<Record<NotifReminderId, boolean>>({
    '24h': true,
    '2h': true,
    '30m': true,
    '10m': true,
  });
  const [quietHoursOn, setQuietHoursOn] = useState(true);

  return {
    language,
    t,
    prefs,
    reminders,
    quietHoursOn,
    quietHoursLabel: t('notifSettingsQuietRange'),
    onBack,
    onOpenNotifications: () => onOpenNotifications?.(),
    onTogglePref: (row, channel) => {
      setPrefs((prev) => ({
        ...prev,
        [row]: { ...prev[row], [channel]: !prev[row][channel] },
      }));
    },
    onToggleReminder: (id) => {
      setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    onToggleQuietHours: setQuietHoursOn,
  };
}
