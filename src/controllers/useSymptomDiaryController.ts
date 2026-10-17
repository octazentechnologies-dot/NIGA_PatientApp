import { useEffect, useMemo, useState } from 'react';

import {
  BOOKING_MEMBERS,
  resolveBookingMembers,
  type BookingMember,
} from '../config/appointmentSlots';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import {
  useCreateDiaryEntryMutation,
  useGetDiaryEntriesQuery,
} from '../store/api/new/symptomDiaryApi';
import { useAppSelector } from '../store/hooks';

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

const WEEKDAY_KEYS: TranslationKey[] = [
  'diaryWeekdaySun',
  'diaryWeekdayMon',
  'diaryWeekdayTue',
  'diaryWeekdayWed',
  'diaryWeekdayThu',
  'diaryWeekdayFri',
  'diaryWeekdaySat',
];

function buildLastSevenDays(anchor: Date): SymptomDiaryViewModel['days'] {
  const days: SymptomDiaryViewModel['days'] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(anchor);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const id = String(d.getDate()) as DiaryDayId;
    days.push({
      id,
      weekdayKey: WEEKDAY_KEYS[d.getDay()] ?? 'diaryWeekdayMon',
      dateLabel: String(d.getDate()),
    });
  }
  return days;
}

function dayIdFromDate(date: Date, days: SymptomDiaryViewModel['days']): DiaryDayId | null {
  const day = String(date.getDate()) as DiaryDayId;
  return days.some((item) => item.id === day) ? day : null;
}

function dateFromDayId(dayId: DiaryDayId, anchor: Date): Date {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  d.setDate(Number(dayId));
  // Prefer matching day within the last-7 window around anchor.
  for (let i = 0; i < 7; i += 1) {
    const candidate = new Date(anchor);
    candidate.setHours(0, 0, 0, 0);
    candidate.setDate(candidate.getDate() - i);
    if (candidate.getDate() === Number(dayId)) {
      return candidate;
    }
  }
  return d;
}

export function useSymptomDiaryController({
  onBack,
  onAddMember,
}: {
  onBack: () => void;
  onAddMember?: () => void;
}): SymptomDiaryViewModel {
  const { language, t } = useLocalization();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const days = useMemo(() => buildLastSevenDays(today), [today]);
  const [memberId, setMemberId] = useState(BOOKING_MEMBERS[0]?.id ?? 'self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<DiaryDayId>(
    () => days[days.length - 1]?.id ?? ('1' as DiaryDayId),
  );
  const [entries, setEntries] = useState<DiaryListEntry[]>([]);
  const [entryOpen, setEntryOpen] = useState(false);
  const [severity, setSeverity] = useState<DiarySeverity>('mild');
  const [symptoms, setSymptoms] = useState<DiarySymptomId[]>(['redness']);
  const [sleep, setSleep] = useState<DiarySleep>('disturbed');
  const [appetite, setAppetite] = useState<DiaryAppetite>('increased');
  const [notes, setNotes] = useState('');
  const [notesMr, setNotesMr] = useState(false);
  const [photoAdded, setPhotoAdded] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const patientFullName =
    homeDashboardResponse?.data?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const { data: diaryResponse } = useGetDiaryEntriesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createDiaryEntryApi] = useCreateDiaryEntryMutation();

  useEffect(() => {
    if (!diaryResponse?.data || !Array.isArray(diaryResponse.data)) {
      setEntries([]);
      return;
    }
    setEntries(
      diaryResponse.data.map((item) => {
        let sev: DiarySeverity = 'none';
        if (item.severity >= 9) sev = 'verySevere';
        else if (item.severity >= 7) sev = 'severe';
        else if (item.severity >= 4) sev = 'moderate';
        else if (item.severity >= 1) sev = 'mild';

        const entryDateObj = new Date(item.entryDate);
        const dayId = String(entryDateObj.getDate()) as DiaryDayId;

        return {
          id: String(item.symptomDiaryId),
          dayId,
          sectionKey: 'diarySectionToday' as TranslationKey,
          severity: sev,
          noteText: item.note || undefined,
          hasPhotos: false,
        };
      }),
    );
  }, [diaryResponse]);

  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });
  const apiFamily = familyResponse?.data;

  const members = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily),
    [patientFullName, apiFamily],
  );

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const memberLabel = member.self
    ? t('bookMyself')
    : member.name.split(' ')[0];

  const calendarMinimumDate = useMemo(
    () => dateFromDayId(days[0].id, today),
    [days, today],
  );
  const calendarMaximumDate = useMemo(
    () => dateFromDayId(days[days.length - 1].id, today),
    [days, today],
  );
  const calendarValue = useMemo(
    () => dateFromDayId(selectedDayId, today),
    [selectedDayId, today],
  );

  const entriesForDay = useMemo(
    () => entries.filter((entry) => entry.dayId === selectedDayId),
    [entries, selectedDayId],
  );

  const selectedMeta = days.find((day) => day.id === selectedDayId);
  const entryDateLabel = t('diaryEntryDate').replace(
    '{date}',
    `${t(selectedMeta?.weekdayKey ?? 'diaryWeekdayMon')}, ${selectedDayId}`,
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
      selectedDayId === days[days.length - 1]?.id
        ? 'diarySectionToday'
        : selectedDayId === days[days.length - 2]?.id
          ? 'diarySectionYesterday'
          : 'diarySectionOther';

    if (isAuthenticated) {
      const numSeverity =
        severity === 'verySevere'
          ? 10
          : severity === 'severe'
            ? 8
            : severity === 'moderate'
              ? 5
              : severity === 'mild'
                ? 2
                : 0;
      const entryDate = dateFromDayId(selectedDayId, today)
        .toISOString()
        .split('T')[0];
      void createDiaryEntryApi({
        entryDate,
        severity: numSeverity,
        note: notes.trim() || undefined,
      })
        .unwrap()
        .then(() => {
          setEntryOpen(false);
        })
        .catch((err) => {
          console.warn('[createDiaryEntryApi] Failed:', err);
        });
      return;
    }

    setEntries((prev) => {
      const withoutDay = prev.filter((entry) => entry.dayId !== selectedDayId);
      return [
        {
          id: `e-${selectedDayId}-${Date.now()}`,
          dayId: selectedDayId,
          sectionKey,
          severity,
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
    members,
    memberPickerOpen,
    calendarOpen,
    calendarValue,
    calendarMinimumDate,
    calendarMaximumDate,
    selectedDayId,
    days,
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
      const next = dayIdFromDate(date, days);
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
