import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  type NotificationPreferences,
} from '../store/api/new/notificationsApi';

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

const OFFSET_MAP: Record<NotifReminderId, number> = {
  '24h': 1440,
  '2h': 120,
  '30m': 30,
  '10m': 10,
};

function parseOffsets(raw: string | null | undefined): Record<NotifReminderId, boolean> {
  const mins = new Set(
    (raw || '')
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((n) => !Number.isNaN(n)),
  );
  return {
    '24h': mins.has(OFFSET_MAP['24h']),
    '2h': mins.has(OFFSET_MAP['2h']),
    '30m': mins.has(OFFSET_MAP['30m']),
    '10m': mins.has(OFFSET_MAP['10m']),
  };
}

function encodeOffsets(reminders: Record<NotifReminderId, boolean>): string | null {
  const parts = (Object.keys(OFFSET_MAP) as NotifReminderId[])
    .filter((id) => reminders[id])
    .map((id) => String(OFFSET_MAP[id]));
  return parts.length > 0 ? parts.join(',') : null;
}

function prefsFromApi(
  api: NotificationPreferences | undefined,
): NotificationSettingsViewModel['prefs'] {
  const push = api?.pushEnabled ?? true;
  const sms = api?.smsEnabled ?? false;
  const email = api?.emailEnabled ?? false;
  const appointments = api?.appointments ?? true;
  const prescriptions = api?.prescriptions ?? true;
  const medicines = api?.medicines ?? true;
  const marketing = api?.marketing ?? false;
  return {
    appointmentReminders: {
      push: push && appointments,
      sms: sms && appointments,
      inApp: appointments,
      email: email && appointments,
    },
    joinAlerts: {
      push,
      sms,
      inApp: true,
      email: false,
    },
    prescriptionFollowUp: {
      push: push && prescriptions,
      sms: sms && prescriptions,
      inApp: prescriptions,
      email: email && prescriptions,
    },
    selfCare: {
      push: push && medicines,
      sms: false,
      inApp: medicines,
      email: false,
    },
    marketing: {
      push: push && marketing,
      sms: sms && marketing,
      inApp: false,
      email: email && marketing,
    },
  };
}

function apiFromUi(
  prefs: NotificationSettingsViewModel['prefs'],
  quietHoursOn: boolean,
  reminders: Record<NotifReminderId, boolean>,
  previous?: NotificationPreferences,
): NotificationPreferences {
  const anyPush = Object.values(prefs).some((row) => row.push);
  const anySms = Object.values(prefs).some((row) => row.sms);
  const anyEmail = Object.values(prefs).some((row) => row.email);
  return {
    pushEnabled: anyPush,
    smsEnabled: anySms,
    emailEnabled: anyEmail,
    quietStart: previous?.quietStart ?? null,
    quietEnd: previous?.quietEnd ?? null,
    appointments: prefs.appointmentReminders.push || prefs.appointmentReminders.sms,
    prescriptions:
      prefs.prescriptionFollowUp.push || prefs.prescriptionFollowUp.inApp,
    medicines: prefs.selfCare.push || prefs.selfCare.inApp,
    marketing: prefs.marketing.push || prefs.marketing.sms || prefs.marketing.email,
    quietHoursEnabled: quietHoursOn,
    reminderOffsets: encodeOffsets(reminders),
  };
}

export function useNotificationSettingsController({
  onBack,
  onOpenNotifications,
}: {
  onBack: () => void;
  onOpenNotifications?: () => void;
}): NotificationSettingsViewModel {
  const { language, t } = useLocalization();
  const { data: apiPrefs } = useGetNotificationPreferencesQuery();
  const [updatePrefs, { isLoading: isSaving }] =
    useUpdateNotificationPreferencesMutation();

  const [prefs, setPrefs] = useState(() => prefsFromApi(undefined));
  const [reminders, setReminders] = useState<Record<NotifReminderId, boolean>>({
    '24h': false,
    '2h': false,
    '30m': false,
    '10m': false,
  });
  const [quietHoursOn, setQuietHoursOn] = useState(false);

  useEffect(() => {
    if (!apiPrefs) return;
    setPrefs(prefsFromApi(apiPrefs));
    setReminders(parseOffsets(apiPrefs.reminderOffsets));
    setQuietHoursOn(Boolean(apiPrefs.quietHoursEnabled));
  }, [apiPrefs]);

  const quietHoursValid = useMemo(() => {
    const start = apiPrefs?.quietStart;
    const end = apiPrefs?.quietEnd;
    if (!quietHoursOn) return true;
    if (!start || !end) return false;
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    return hhmm.test(start) && hhmm.test(end);
  }, [apiPrefs?.quietEnd, apiPrefs?.quietStart, quietHoursOn]);

  const quietHoursLabel = useMemo(() => {
    if (apiPrefs?.quietStart && apiPrefs?.quietEnd && quietHoursValid) {
      return `${apiPrefs.quietStart} – ${apiPrefs.quietEnd}`;
    }
    return t('notifSettingsQuietRange');
  }, [apiPrefs?.quietEnd, apiPrefs?.quietStart, quietHoursValid, t]);

  const persist = (
    nextPrefs: NotificationSettingsViewModel['prefs'],
    nextQuiet: boolean,
    nextReminders: Record<NotifReminderId, boolean>,
  ) => {
    if (isSaving) return;
    if (nextQuiet) {
      const start = apiPrefs?.quietStart;
      const end = apiPrefs?.quietEnd;
      const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!start || !end || !hhmm.test(start) || !hhmm.test(end)) {
        return;
      }
    }
    void updatePrefs(apiFromUi(nextPrefs, nextQuiet, nextReminders, apiPrefs)).catch(
      () => undefined,
    );
  };

  return {
    language,
    t,
    prefs,
    reminders,
    quietHoursOn,
    quietHoursLabel,
    onBack,
    onOpenNotifications: () => onOpenNotifications?.(),
    onTogglePref: (row, channel) => {
      setPrefs((prev) => {
        const next = {
          ...prev,
          [row]: { ...prev[row], [channel]: !prev[row][channel] },
        };
        persist(next, quietHoursOn, reminders);
        return next;
      });
    },
    onToggleReminder: (id) => {
      setReminders((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        persist(prefs, quietHoursOn, next);
        return next;
      });
    },
    onToggleQuietHours: (value) => {
      setQuietHoursOn(value);
      persist(prefs, value, reminders);
    },
  };
}
