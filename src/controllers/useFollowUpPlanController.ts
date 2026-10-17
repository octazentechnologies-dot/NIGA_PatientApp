import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useCompleteFollowUpMutation,
  useGetFollowUpsQuery,
} from '../store/api/new/recordsApi';
import { useAppSelector } from '../store/hooks';

export type FeelingId = 'improved' | 'same' | 'worse' | 'returned';

export type FollowUpTaskId =
  | 'sulphur'
  | 'diary'
  | 'avoid'
  | 'photo'
  | 'book';

export type FollowUpTaskBadgeTone = 'success' | 'danger' | 'warn' | 'neutral';

export type FollowUpTask = {
  id: string;
  title: string;
  dueLabel: string | null;
  badgeKey?: TranslationKey;
  badgeTone?: FollowUpTaskBadgeTone;
  done: boolean;
};

export type FollowUpPlanViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  doctorPlanLine: string;
  createdLine: string;
  patientLine: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  doneCount: number;
  totalCount: number;
  progress: number;
  nextReviewDate: string;
  nextReviewIn: string;
  feeling: FeelingId;
  notes: string;
  responseRecorded: boolean;
  remindersOn: boolean;
  tasks: FollowUpTask[];
  onBack: () => void;
  onToggleReminders: () => void;
  onBookFollowUp: () => void;
  onRescheduleReminder: () => void;
  onSelectFeeling: (id: FeelingId) => void;
  onChangeNotes: (value: string) => void;
  onRecordResponse: () => void;
  onToggleTask: (id: string) => void;
  onUploadPhoto: () => void;
  prescriptionOpen: boolean;
  consultationNoteOpen: boolean;
  onOpenPrescription: () => void;
  onClosePrescription: () => void;
  onOpenConsultationNote: () => void;
  onCloseConsultationNote: () => void;
  onOpenDiary: () => void;
};

export function useFollowUpPlanController({
  onBack,
  onBookFollowUp,
  onUploadPhoto,
  onOpenDiary,
}: {
  onBack: () => void;
  onBookFollowUp?: () => void;
  onUploadPhoto?: () => void;
  onOpenDiary?: () => void;
}): FollowUpPlanViewModel {
  const { language, t } = useLocalization();
  const [feeling, setFeeling] = useState<FeelingId>('improved');
  const [notes, setNotes] = useState('');
  const [responseRecorded, setResponseRecorded] = useState(false);
  const [remindersOn, setRemindersOn] = useState(true);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [consultationNoteOpen, setConsultationNoteOpen] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: followUpsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetFollowUpsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [completeFollowUp] = useCompleteFollowUpMutation();

  const tasks = useMemo<FollowUpTask[]>(() => {
    const rows = followUpsResponse?.data;
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows.map((item) => ({
      id: String(item.followUpTaskId),
      title: item.title?.trim() || '',
      dueLabel: item.dueDate?.trim() || null,
      badgeKey:
        item.status === 'DONE' ? 'followUpBadgeOnTrack' : 'followUpBadgePending',
      badgeTone: item.status === 'DONE' ? 'success' : 'warn',
      done: item.status === 'DONE',
    }));
  }, [followUpsResponse?.data]);

  const nextDue = useMemo(() => {
    const dates = tasks
      .map((task) => task.dueLabel)
      .filter((value): value is string => Boolean(value))
      .sort();
    return dates[0] ?? '';
  }, [tasks]);

  const doneCount = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks],
  );
  const totalCount = tasks.length;

  return {
    language,
    t,
    doctorPlanLine: '',
    createdLine: '',
    patientLine: '',
    isLoading,
    isError,
    onRetry: () => {
      void refetch();
    },
    doneCount,
    totalCount,
    progress: totalCount === 0 ? 0 : doneCount / totalCount,
    nextReviewDate: nextDue,
    nextReviewIn: '',
    feeling,
    notes,
    responseRecorded,
    remindersOn,
    tasks,
    onBack,
    onToggleReminders: () => setRemindersOn((prev) => !prev),
    onBookFollowUp: () => onBookFollowUp?.(),
    onRescheduleReminder: () => undefined,
    onSelectFeeling: setFeeling,
    onChangeNotes: setNotes,
    onRecordResponse: () => setResponseRecorded(true),
    onToggleTask: async (id) => {
      const task = tasks.find((row) => row.id === id);
      if (!task || task.done || !isAuthenticated) {
        return;
      }
      const numId = Number(id);
      if (!Number.isFinite(numId) || numId <= 0) {
        return;
      }
      try {
        await completeFollowUp(numId).unwrap();
      } catch (e) {
        console.warn('[completeFollowUp] Failed:', e);
      }
    },
    onUploadPhoto: () => onUploadPhoto?.(),
    prescriptionOpen,
    consultationNoteOpen,
    onOpenPrescription: () => setPrescriptionOpen(true),
    onClosePrescription: () => setPrescriptionOpen(false),
    onOpenConsultationNote: () => setConsultationNoteOpen(true),
    onCloseConsultationNote: () => setConsultationNoteOpen(false),
    onOpenDiary: () => onOpenDiary?.(),
  };
}
