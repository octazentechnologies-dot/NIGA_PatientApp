import { Alert } from 'react-native';
import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

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
};

const DOCTOR_SEED: DoctorReminderItem[] = [
  {
    id: 'med-sulphur',
    kind: 'done',
    titleKey: 'remDoctorMedTitle',
    detailKey: 'remDoctorMedDetail',
    done: true,
  },
  {
    id: 'diary',
    kind: 'toggle',
    titleKey: 'remDoctorDiaryTitle',
    detailKey: 'remDoctorDiaryDetail',
    enabled: false,
  },
  {
    id: 'follow-up',
    kind: 'action',
    titleKey: 'remDoctorFollowTitle',
    detailKey: 'remDoctorFollowDetail',
  },
  {
    id: 'pain',
    kind: 'nav',
    titleKey: 'remDoctorPainTitle',
    detailKey: 'remDoctorPainDetail',
  },
];

const SELF_CARE_SEED: SelfCareReminderItem[] = [
  {
    id: 'window',
    kind: 'info',
    titleKey: 'remAstroWindowTitle',
    detailKey: 'remAstroWindowDetail',
  },
  {
    id: 'dinner',
    kind: 'toggle',
    titleKey: 'remAstroDinnerTitle',
    detailKey: 'remAstroDinnerDetail',
    enabled: true,
  },
];

const DEFAULT_DAYS: ReminderWeekdayId[] = ['m', 't', 'w', 'f'];

export function useRemindersCentreController({
  onBack,
  onBookConsultation,
}: {
  onBack: () => void;
  onBookConsultation?: () => void;
}): RemindersCentreViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState<ReminderMemberId>('aarav');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [doctorItems, setDoctorItems] = useState(DOCTOR_SEED);
  const [selfCareItems, setSelfCareItems] = useState(SELF_CARE_SEED);
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
      { id: 'aarav' as const, label: t('remMemberAarav') },
      { id: 'self' as const, label: t('remMemberSelf') },
    ],
    [t],
  );

  const memberLabel =
    members.find((item) => item.id === memberId)?.label ?? t('remMemberAarav');

  const isEmpty = memberId === 'self';
  const todayDone = 1;
  const todayTotal = 3;

  const openEditor = (mode: 'add' | 'edit') => {
    setEditorMode(mode);
    if (mode === 'edit') {
      setEditorCategory('medicine');
      setEditorTitle(t('remEditorTitleDefault'));
      setEditorFrequency('daily');
      setEditorDays(DEFAULT_DAYS);
      setEditorTimes(['7:00 AM', '2:00 PM']);
      setEditorNotifyPush(true);
      setEditorNotifySms(false);
      setEditorNotifyWhatsApp(true);
      setEditorSnoozeOn(true);
      setEditorSnooze('5');
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
      setDoctorItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, done: !item.done, kind: 'done' } : item,
        ),
      );
    },
    onViewPastReminders: () => {
      setMemberId('aarav');
    },
    onAddReminder: () => openEditor('add'),
    onEditMedicineReminder: (_id: string) => openEditor('edit'),
    onCloseEditor: () => setEditorOpen(false),
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
    onSaveReminder: () => setEditorOpen(false),
  };
}
