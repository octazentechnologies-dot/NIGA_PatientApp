import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useCompleteFollowUpMutation,
  useCreateFollowUpMutation,
  useGetFollowUpsQuery,
} from '../store/api/new/recordsApi';
import {
  type PatientVisitItem,
  useGetPatientVisitsQuery,
} from '../store/api/new/visitsApi';
import { useAppSelector } from '../store/hooks';
import { getApiBodyMessage, getApiErrorMessage } from '../utilities/toast';

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
  toastMessage: string | null;
  toastVariant: 'error' | 'success';
  onDismissToast: () => void;
  addTaskModalOpen: boolean;
  isCreatingTask: boolean;
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  onOpenAddTaskModal: () => void;
  onCloseAddTaskModal: () => void;
  onCreateTask: () => Promise<boolean>;
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'error' | 'success'>('error');
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);

  const {
    data: followUpsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetFollowUpsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: visitsResponse } = useGetPatientVisitsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [completeFollowUp] = useCompleteFollowUpMutation();
  const [createFollowUp, { isLoading: isCreatingTask }] = useCreateFollowUpMutation();

  const latestVisit = useMemo(() => {
    const raw = visitsResponse?.data;
    const list: PatientVisitItem[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)
        ? raw.data
        : [];
    if (list.length > 0) {
      return list[0];
    }
    return null;
  }, [visitsResponse?.data]);

  const tasks = useMemo<FollowUpTask[]>(() => {
    const rows = followUpsResponse?.data;
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows.map((item) => ({
      id: String(item.followUpTaskId),
      title: item.title?.trim() || '',
      dueLabel: item.dueDate
        ? new Date(item.dueDate).toLocaleDateString(
            language === 'mr' ? 'mr-IN' : 'en-IN',
            { day: 'numeric', month: 'short', year: 'numeric' },
          )
        : null,
      badgeKey:
        item.status === 'DONE' ? 'followUpBadgeOnTrack' : 'followUpBadgePending',
      badgeTone: item.status === 'DONE' ? 'success' : 'warn',
      done: item.status === 'DONE',
    }));
  }, [followUpsResponse?.data, language]);

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

  const doctorPlanLine = latestVisit?.doctorName
    ? `Plan by Dr. ${latestVisit.doctorName.replace(/^Dr\.?\s*/i, '')}`
    : '';
  const createdLine = latestVisit?.appointmentDate
    ? `Created ${new Date(latestVisit.appointmentDate).toLocaleDateString(
        language === 'mr' ? 'mr-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' },
      )}`
    : '';
  const patientLine =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const onCreateTask = async (): Promise<boolean> => {
    const title = newTaskTitle.trim();
    if (!title) {
      setToastMessage('Task title is required.');
      setToastVariant('error');
      return false;
    }

    const patientAppId = latestVisit?.patientAppId ?? 1;
    try {
      const res = await createFollowUp({
        patientAppId,
        title,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        doctorId: latestVisit?.doctorId,
      }).unwrap();

      if (res.success) {
        if (!getApiBodyMessage(res)) {
          setToastMessage('Follow-up task created successfully.');
          setToastVariant('success');
        }
        setNewTaskTitle('');
        setAddTaskModalOpen(false);
        return true;
      }
      if (!getApiBodyMessage(res)) {
        setToastMessage('Could not create task.');
        setToastVariant('error');
      }
      return false;
    } catch (err: unknown) {
      console.warn('[createFollowUp] Failed:', err);
      if (!getApiErrorMessage(err)) {
        setToastMessage('Could not create follow-up task.');
        setToastVariant('error');
      }
      return false;
    }
  };

  return {
    language,
    t,
    doctorPlanLine,
    createdLine,
    patientLine,
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
    toastMessage,
    toastVariant,
    onDismissToast: () => setToastMessage(null),
    addTaskModalOpen,
    isCreatingTask,
    newTaskTitle,
    setNewTaskTitle,
    onOpenAddTaskModal: () => {
      setNewTaskTitle('');
      setAddTaskModalOpen(true);
    },
    onCloseAddTaskModal: () => setAddTaskModalOpen(false),
    onCreateTask,
    onBack,
    onToggleReminders: () => setRemindersOn((prev) => !prev),
    onBookFollowUp: () => onBookFollowUp?.(),
    onRescheduleReminder: () => undefined,
    onSelectFeeling: setFeeling,
    onChangeNotes: setNotes,
    onRecordResponse: () => {
      setResponseRecorded(true);
      setToastMessage('Response recorded successfully.');
      setToastVariant('success');
    },
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
        const completed = await completeFollowUp(numId).unwrap();
        if (!getApiBodyMessage(completed)) {
          setToastMessage('Follow-up task marked as complete.');
          setToastVariant('success');
        }
      } catch (e: unknown) {
        console.warn('[completeFollowUp] Failed:', e);
        if (!getApiErrorMessage(e)) {
          setToastMessage('Could not complete follow-up task.');
          setToastVariant('error');
        }
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
