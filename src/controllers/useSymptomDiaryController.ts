import { useMemo, useState } from 'react';

import {
  BOOKING_MEMBERS,
  type BookingMember,
} from '../config/appointmentSlots';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type DiarySeverity = 'none' | 'mild' | 'moderate' | 'severe' | 'verySevere';

export type DiarySymptomId =
  | 'itching'
  | 'redness'
  | 'dryness'
  | 'burning'
  | 'swelling'
  | 'sleep';

export type DiarySleep = 'good' | 'disturbed' | 'poor' | 'none';

export type DiaryAppetite = 'normal' | 'reduced' | 'increased';

export type DiaryDayId = '20' | '21' | '22' | '23' | '24' | '25' | '26';

export type DiaryListEntry = {
  id: string;
  dayId: DiaryDayId;
  sectionKey: TranslationKey;
  severity: DiarySeverity;
  noteKey?: TranslationKey;
  noteText?: string;
  hasPhotos?: boolean;
};

export type SymptomDiaryViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: string;
  memberLabel: string;
  members: BookingMember[];
  memberPickerOpen: boolean;
  calendarOpen: boolean;
  calendarValue: Date;
  calendarMinimumDate: Date;
  calendarMaximumDate: Date;
  selectedDayId: DiaryDayId;
  days: { id: DiaryDayId; weekdayKey: TranslationKey; dateLabel: string }[];
  entriesForDay: DiaryListEntry[];
  isEmptyDay: boolean;
  entryOpen: boolean;
  entryDateLabel: string;
  severity: DiarySeverity;
  symptoms: DiarySymptomId[];
  sleep: DiarySleep;
  appetite: DiaryAppetite;
  notes: string;
  notesMr: boolean;
  photoAdded: boolean;
  onBack: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: string) => void;
  onAddMember: () => void;
  onOpenCalendar: () => void;
  onCloseCalendar: () => void;
  onConfirmCalendarDate: (date: Date) => void;
  onSelectDay: (id: DiaryDayId) => void;
  onOpenEntry: () => void;
  onCloseEntry: () => void;
  onSaveEntryHeader: () => void;
  onSelectSeverity: (value: DiarySeverity) => void;
  onToggleSymptom: (id: DiarySymptomId) => void;
  onSelectSleep: (value: DiarySleep) => void;
  onSelectAppetite: (value: DiaryAppetite) => void;
  onChangeNotes: (value: string) => void;
  onToggleNotesLanguage: () => void;
  onAddPhoto: () => void;
  onRemovePhoto: () => void;
  onSaveEntry: () => void;
};

/** Seeded week shown in the day strip (Aug 2026). */
const DIARY_YEAR = 2026;
const DIARY_MONTH = 7; // August (0-indexed)

const DAYS: SymptomDiaryViewModel['days'] = [
  { id: '20', weekdayKey: 'diaryWeekdayTue', dateLabel: '20' },
  { id: '21', weekdayKey: 'diaryWeekdayWed', dateLabel: '21' },
  { id: '22', weekdayKey: 'diaryWeekdayThu', dateLabel: '22' },
  { id: '23', weekdayKey: 'diaryWeekdayFri', dateLabel: '23' },
  { id: '24', weekdayKey: 'diaryWeekdaySat', dateLabel: '24' },
  { id: '25', weekdayKey: 'diaryWeekdaySun', dateLabel: '25' },
  { id: '26', weekdayKey: 'diaryWeekdayMon', dateLabel: '26' },
];

const SEEDED_ENTRIES: DiaryListEntry[] = [
  {
    id: 'e-26',
    dayId: '26',
    sectionKey: 'diarySectionToday',
    severity: 'mild',
    noteKey: 'diaryEntryMildNote',
    hasPhotos: true,
  },
  {
    id: 'e-25',
    dayId: '25',
    sectionKey: 'diarySectionYesterday',
    severity: 'moderate',
    noteKey: 'diaryEntryModerateNote',
  },
];

function dayIdFromDate(date: Date): DiaryDayId | null {
  if (date.getFullYear() !== DIARY_YEAR || date.getMonth() !== DIARY_MONTH) {
    return null;
  }
  const day = String(date.getDate()) as DiaryDayId;
  return DAYS.some((item) => item.id === day) ? day : null;
}

function dateFromDayId(dayId: DiaryDayId): Date {
  return new Date(DIARY_YEAR, DIARY_MONTH, Number(dayId));
}

export function useSymptomDiaryController({
  onBack,
  onAddMember,
}: {
  onBack: () => void;
  onAddMember?: () => void;
}): SymptomDiaryViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState(BOOKING_MEMBERS[1]?.id ?? 'aarav');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<DiaryDayId>('26');
  const [entries, setEntries] = useState(SEEDED_ENTRIES);
  const [entryOpen, setEntryOpen] = useState(false);
  const [severity, setSeverity] = useState<DiarySeverity>('mild');
  const [symptoms, setSymptoms] = useState<DiarySymptomId[]>(['redness']);
  const [sleep, setSleep] = useState<DiarySleep>('disturbed');
  const [appetite, setAppetite] = useState<DiaryAppetite>('increased');
  const [notes, setNotes] = useState('');
  const [notesMr, setNotesMr] = useState(false);
  const [photoAdded, setPhotoAdded] = useState(false);

  const member =
    BOOKING_MEMBERS.find((item) => item.id === memberId) ?? BOOKING_MEMBERS[1];
  const memberLabel = member.self
    ? t('bookMyself')
    : member.name.split(' ')[0];

  const calendarMinimumDate = useMemo(
    () => dateFromDayId(DAYS[0].id),
    [],
  );
  const calendarMaximumDate = useMemo(
    () => dateFromDayId(DAYS[DAYS.length - 1].id),
    [],
  );
  const calendarValue = useMemo(
    () => dateFromDayId(selectedDayId),
    [selectedDayId],
  );

  const entriesForDay = useMemo(
    () => entries.filter((entry) => entry.dayId === selectedDayId),
    [entries, selectedDayId],
  );

  const entryDateLabel = t('diaryEntryDate').replace(
    '{date}',
    `${t(DAYS.find((day) => day.id === selectedDayId)?.weekdayKey ?? 'diaryWeekdaySat')}, ${selectedDayId} Aug 2026`,
  );

  const resetForm = () => {
    setSeverity('mild');
    setSymptoms(['redness']);
    setSleep('disturbed');
    setAppetite('increased');
    setNotes('');
    setNotesMr(false);
    setPhotoAdded(false);
  };

  const saveCurrentEntry = () => {
    const sectionKey: TranslationKey =
      selectedDayId === '26'
        ? 'diarySectionToday'
        : selectedDayId === '25'
          ? 'diarySectionYesterday'
          : 'diarySectionOther';
    const severityNoteKey: TranslationKey =
      severity === 'mild'
        ? 'diaryEntryMildNote'
        : severity === 'moderate'
          ? 'diaryEntryModerateNote'
          : 'diaryEntryGenericNote';

    setEntries((prev) => {
      const withoutDay = prev.filter((entry) => entry.dayId !== selectedDayId);
      return [
        {
          id: `e-${selectedDayId}-${Date.now()}`,
          dayId: selectedDayId,
          sectionKey,
          severity,
          noteKey: notes.trim() ? undefined : severityNoteKey,
          noteText: notes.trim() || undefined,
          hasPhotos: photoAdded,
        },
        ...withoutDay,
      ];
    });
    setEntryOpen(false);
  };

  return {
    language,
    t,
    memberId,
    memberLabel,
    members: BOOKING_MEMBERS,
    memberPickerOpen,
    calendarOpen,
    calendarValue,
    calendarMinimumDate,
    calendarMaximumDate,
    selectedDayId,
    days: DAYS,
    entriesForDay,
    isEmptyDay: entriesForDay.length === 0,
    entryOpen,
    entryDateLabel,
    severity,
    symptoms,
    sleep,
    appetite,
    notes,
    notesMr,
    photoAdded,
    onBack,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onAddMember: () => {
      setMemberPickerOpen(false);
      onAddMember?.();
    },
    onOpenCalendar: () => setCalendarOpen(true),
    onCloseCalendar: () => setCalendarOpen(false),
    onConfirmCalendarDate: (date) => {
      setCalendarOpen(false);
      const next = dayIdFromDate(date);
      if (next) {
        setSelectedDayId(next);
      }
    },
    onSelectDay: setSelectedDayId,
    onOpenEntry: () => {
      resetForm();
      setEntryOpen(true);
    },
    onCloseEntry: () => setEntryOpen(false),
    onSaveEntryHeader: saveCurrentEntry,
    onSelectSeverity: setSeverity,
    onToggleSymptom: (id) => {
      setSymptoms((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    },
    onSelectSleep: setSleep,
    onSelectAppetite: setAppetite,
    onChangeNotes: setNotes,
    onToggleNotesLanguage: () => setNotesMr((prev) => !prev),
    onAddPhoto: () => setPhotoAdded(true),
    onRemovePhoto: () => setPhotoAdded(false),
    onSaveEntry: saveCurrentEntry,
  };
}

export const DIARY_SYMPTOMS: {
  id: DiarySymptomId;
  labelKey: TranslationKey;
}[] = [
  { id: 'itching', labelKey: 'diarySymptomItching' },
  { id: 'redness', labelKey: 'diarySymptomRedness' },
  { id: 'dryness', labelKey: 'diarySymptomDryness' },
  { id: 'burning', labelKey: 'diarySymptomBurning' },
  { id: 'swelling', labelKey: 'diarySymptomSwelling' },
  { id: 'sleep', labelKey: 'diarySymptomSleep' },
];
