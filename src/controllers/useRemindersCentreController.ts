import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  type PatientReminder,
  useCreateReminderMutation,
  useDeleteReminderMutation,
  useGetRemindersQuery,
  useUpdateReminderMutation,
} from '../store/api/new/remindersApi';
import { useAppSelector } from '../store/hooks';

export type ReminderMemberId = 'aarav' | 'self';

export type ReminderCategoryId =
  | 'medicine'
  | 'diary'
  | 'pain'
  | 'appt'
  | 'water'
  | 'sleep'
  | 'custom';

export type ReminderFrequencyId =
  | 'once'
  | 'daily'
  | 'specific'
  | 'weekly'
  | 'monthly';

export type ReminderSnoozeId = '5' | '10' | '30';

export type ReminderWeekdayId = 'm' | 't' | 'w' | 't2' | 'f' | 's' | 's2';

export type DoctorReminderKind =
  | 'done'
  | 'toggle'
  | 'action'
  | 'nav';

export type DoctorReminderItem = {
  id: string;
  kind: DoctorReminderKind;
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  enabled?: boolean;
  done?: boolean;
};

export type SelfCareReminderItem = {
  id: string;
  kind: 'info' | 'toggle';
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  enabled?: boolean;
};

export type RemindersCentreViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: ReminderMemberId;
  memberLabel: string;
  memberPickerOpen: boolean;
  members: { id: ReminderMemberId; label: string }[];
  isEmpty: boolean;
  todayDone: number;
  todayTotal: number;
  progressLabel: string;
  doctorItems: DoctorReminderItem[];
  selfCareItems: SelfCareReminderItem[];
  quietHoursOn: boolean;
  quietHoursRange: string;
  editorOpen: boolean;
  editorMode: 'add' | 'edit';
  editorCategory: ReminderCategoryId;
  editorTitle: string;
  editorFrequency: ReminderFrequencyId;
  editorDays: ReminderWeekdayId[];
  editorTimes: string[];
  editorNotifyPush: boolean;
  editorNotifySms: boolean;
  editorNotifyWhatsApp: boolean;
  editorSnoozeOn: boolean;
  editorSnooze: ReminderSnoozeId;
  editorNotes: string;
  linkedMedicineName: string;
  linkedRxId: string;
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: ReminderMemberId) => void;
  onToggleDoctorItem: (id: string) => void;
  onToggleSelfCareItem: (id: string) => void;
  onToggleQuietHours: () => void;
  onBookConsultation: () => void;
  onOpenPainPoints: () => void;
  onMarkMedicineDone: (id: string) => void;
  onViewPastReminders: () => void;
  onAddReminder: () => void;
  onEditMedicineReminder: (id: string) => void;
  onCloseEditor: () => void;
  onSelectCategory: (id: ReminderCategoryId) => void;
  onChangeTitle: (value: string) => void;
  onSelectFrequency: (id: ReminderFrequencyId) => void;
  onToggleDay: (id: ReminderWeekdayId) => void;
  onRemoveTime: (time: string) => void;
  onAddTime: () => void;
  onToggleNotifyPush: () => void;
  onToggleNotifySms: () => void;
  onToggleNotifyWhatsApp: () => void;
  onToggleSnooze: () => void;
  onSelectSnooze: (id: ReminderSnoozeId) => void;
  onChangeNotes: (value: string) => void;
  onSaveReminder: () => void;
  onDeleteReminder: (id: string) => void;
  editingReminderId: string | null;
};

const DEFAULT_DAYS: ReminderWeekdayId[] = ['m', 't', 'w', 'f'];

/** Stable empty list — inline `= []` would re-trigger effects every render. */
const EMPTY_REMINDERS: PatientReminder[] = [];

export function useRemindersCentreController({
  onBack,
  onBookConsultation,
}: {
  onBack: () => void;
  onBookConsultation?: () => void;
}): RemindersCentreViewModel {
  const { language, t } = useLocalization();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data } = useGetRemindersQuery(undefined, { skip: !isAuthenticated });
  const apiReminders = data ?? EMPTY_REMINDERS;
  const [createReminder] = useCreateReminderMutation();
  const [updateReminder] = useUpdateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();
  const [memberId, setMemberId] = useState<ReminderMemberId>('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [doctorItems, setDoctorItems] = useState<DoctorReminderItem[]>([]);
  const [selfCareItems, setSelfCareItems] = useState<SelfCareReminderItem[]>([]);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  useEffect(() => {
    // Wait until the query has a defined payload (including empty list).
    if (data === undefined) {
      return;
    }
    setDoctorItems(
      data.map((row) => ({
        id: String(row.patientReminderId),
        kind: row.isDone ? ('done' as const) : ('toggle' as const),
        titleKey: (row.title || '') as TranslationKey,
        detailKey: (row.timeOfDay ||
          row.dueAt ||
          row.kind ||
          '') as TranslationKey,
        enabled: !row.isDone,
        done: row.isDone,
      })),
    );
    // Astro / self-care seeds removed — not returned by Patient/Reminders.
    setSelfCareItems((prev) => (prev.length === 0 ? prev : []));
  }, [data]);
  const [quietHoursOn, setQuietHoursOn] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorCategory, setEditorCategory] =
    useState<ReminderCategoryId>('medicine');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorFrequency, setEditorFrequency] =
    useState<ReminderFrequencyId>('daily');
  const [editorDays, setEditorDays] = useState<ReminderWeekdayId[]>(DEFAULT_DAYS);
  const [editorTimes, setEditorTimes] = useState(['7:00 AM', '2:00 PM']);
  const [editorNotifyPush, setEditorNotifyPush] = useState(true);
  const [editorNotifySms, setEditorNotifySms] = useState(false);
  const [editorNotifyWhatsApp, setEditorNotifyWhatsApp] = useState(true);
  const [editorSnoozeOn, setEditorSnoozeOn] = useState(true);
  const [editorSnooze, setEditorSnooze] = useState<ReminderSnoozeId>('5');
  const [editorNotes, setEditorNotes] = useState('');

  const members = useMemo(
    () => [
      { id: 'self' as const, label: t('remMemberSelf') },
      { id: 'aarav' as const, label: t('remMemberAarav') },
    ],
    [t],
  );

  const memberLabel =
    members.find((item) => item.id === memberId)?.label ?? t('remMemberSelf');

  const isEmpty = doctorItems.length === 0;
  const todayDone = doctorItems.filter((item) => item.done).length;
  const todayTotal = doctorItems.length;

  const openEditor = (mode: 'add' | 'edit', reminderId: string | null = null) => {
    setEditorMode(mode);
    setEditingReminderId(mode === 'edit' ? reminderId : null);
    if (mode === 'edit') {
      const apiRow = apiReminders.find(
        (row) => String(row.patientReminderId) === reminderId,
      );
      setEditorCategory((apiRow?.kind as ReminderCategoryId) || 'medicine');
      setEditorTitle(apiRow?.title ?? t('remEditorTitleDefault'));
      setEditorFrequency('daily');
      setEditorDays(DEFAULT_DAYS);
      setEditorTimes(
        apiRow?.timeOfDay ? [apiRow.timeOfDay] : ['7:00 AM', '2:00 PM'],
      );
      setEditorNotifyPush(apiRow?.notifyPush !== false);
      setEditorNotifySms(false);
      setEditorNotifyWhatsApp(false);
      {
        const snooze = apiRow?.snoozeMinutes;
        if (snooze == null || snooze <= 0) {
          setEditorSnoozeOn(false);
          setEditorSnooze('5');
        } else {
          setEditorSnoozeOn(true);
          const chip: ReminderSnoozeId =
            snooze <= 5 ? '5' : snooze <= 10 ? '10' : '30';
          setEditorSnooze(chip);
        }
      }
      setEditorNotes('');
    } else {
      setEditorCategory('custom');
      setEditorTitle('');
      setEditorFrequency('daily');
      setEditorDays(DEFAULT_DAYS);
      setEditorTimes(['8:00 AM']);
      setEditorNotifyPush(true);
      setEditorNotifySms(false);
      setEditorNotifyWhatsApp(false);
      setEditorSnoozeOn(true);
      setEditorSnooze('5');
      setEditorNotes('');
    }
    setEditorOpen(true);
  };

  return {
    language,
    t,
    memberId,
    memberLabel,
    memberPickerOpen,
    members,
    isEmpty,
    todayDone,
    todayTotal,
    progressLabel: t('remProgressLine')
      .replace('{total}', String(todayTotal))
      .replace('{done}', String(todayDone)),
    doctorItems,
    selfCareItems,
    quietHoursOn,
    quietHoursRange: t('remQuietRange'),
    editorOpen,
    editorMode,
    editorCategory,
    editorTitle,
    editorFrequency,
    editorDays,
    editorTimes,
    editorNotifyPush,
    editorNotifySms,
    editorNotifyWhatsApp,
    editorSnoozeOn,
    editorSnooze,
    editorNotes,
    linkedMedicineName: t('remLinkedMedicine'),
    linkedRxId: t('remLinkedRx'),
    onBack,
    onOpenSettings: () => {
      Alert.alert(t('remSettingsTitle'), t('remSettingsSoon'));
    },
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onToggleDoctorItem: (id) => {
      setDoctorItems((prev) =>
        prev.map((item) =>
          item.id === id && item.kind === 'toggle'
            ? { ...item, enabled: !item.enabled }
            : item,
        ),
      );
    },
    onToggleSelfCareItem: (id) => {
      setSelfCareItems((prev) =>
        prev.map((item) =>
          item.id === id && item.kind === 'toggle'
            ? { ...item, enabled: !item.enabled }
            : item,
        ),
      );
    },
    onToggleQuietHours: () => setQuietHoursOn((prev) => !prev),
    onBookConsultation: () => onBookConsultation?.(),
    onOpenPainPoints: () => undefined,
    onMarkMedicineDone: (id) => {
      const current = doctorItems.find((item) => item.id === id);
      const nextDone = !(current?.done ?? false);
      setDoctorItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, done: nextDone, kind: nextDone ? 'done' : 'toggle', enabled: !nextDone }
            : item,
        ),
      );
      const apiRow = apiReminders.find(
        (row) => String(row.patientReminderId) === id,
      );
      if (apiRow) {
        void updateReminder({
          id: apiRow.patientReminderId,
          body: {
            title: apiRow.title,
            dueAt: apiRow.dueAt,
            kind: apiRow.kind,
            timeOfDay: apiRow.timeOfDay,
            weekdays: apiRow.weekdays,
            memberPatientId: apiRow.memberPatientId,
            snoozeMinutes: apiRow.snoozeMinutes ?? null,
            notifyPush: apiRow.notifyPush ?? true,
            isDone: nextDone,
          },
        })
          .unwrap()
          .catch(() => undefined);
      }
    },
    onViewPastReminders: () => {
      setMemberId('aarav');
    },
    editingReminderId,
    onAddReminder: () => openEditor('add'),
    onEditMedicineReminder: (id: string) => openEditor('edit', id),
    onCloseEditor: () => {
      setEditorOpen(false);
      setEditingReminderId(null);
    },
    onSelectCategory: setEditorCategory,
    onChangeTitle: setEditorTitle,
    onSelectFrequency: setEditorFrequency,
    onToggleDay: (id) => {
      setEditorDays((prev) =>
        prev.includes(id) ? prev.filter((day) => day !== id) : [...prev, id],
      );
    },
    onRemoveTime: (time) => {
      setEditorTimes((prev) => prev.filter((item) => item !== time));
    },
    onAddTime: () => {
      setEditorTimes((prev) =>
        prev.includes('9:00 PM') ? prev : [...prev, '9:00 PM'],
      );
    },
    onToggleNotifyPush: () => setEditorNotifyPush((prev) => !prev),
    onToggleNotifySms: () => setEditorNotifySms((prev) => !prev),
    onToggleNotifyWhatsApp: () => setEditorNotifyWhatsApp((prev) => !prev),
    onToggleSnooze: () => setEditorSnoozeOn((prev) => !prev),
    onSelectSnooze: setEditorSnooze,
    onChangeNotes: setEditorNotes,
    onDeleteReminder: (id) => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) return;
      setDoctorItems((prev) => prev.filter((item) => item.id !== id));
      void deleteReminder(numericId)
        .unwrap()
        .catch(() => undefined)
        .finally(() => {
          setEditorOpen(false);
          setEditingReminderId(null);
        });
    },
    onSaveReminder: () => {
      const title = editorTitle.trim();
      if (!title) {
        setEditorOpen(false);
        setEditingReminderId(null);
        return;
      }
      const due = new Date();
      due.setHours(due.getHours() + 1, 0, 0, 0);
      const existing = editingReminderId
        ? apiReminders.find(
            (row) => String(row.patientReminderId) === editingReminderId,
          )
        : undefined;
      const finish = () => {
        setEditorOpen(false);
        setEditingReminderId(null);
      };
      const snoozeMinutes = editorSnoozeOn
        ? Math.min(1440, Math.max(0, Number(editorSnooze) || 0))
        : null;
      if (existing) {
        void updateReminder({
          id: existing.patientReminderId,
          body: {
            title,
            dueAt: existing.dueAt || due.toISOString(),
            kind: editorCategory,
            timeOfDay: editorTimes[0] ?? null,
            weekdays: editorDays.join(',') || null,
            memberPatientId: existing.memberPatientId,
            snoozeMinutes,
            notifyPush: editorNotifyPush,
            isDone: existing.isDone,
          },
        })
          .unwrap()
          .finally(finish);
        return;
      }
      void createReminder({
        title,
        dueAt: due.toISOString(),
        kind: editorCategory,
        timeOfDay: editorTimes[0] ?? null,
        weekdays: editorDays.join(',') || null,
        snoozeMinutes,
        notifyPush: editorNotifyPush,
        isDone: false,
      })
        .unwrap()
        .finally(finish);
    },
  };
}
