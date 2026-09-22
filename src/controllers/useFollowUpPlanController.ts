import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type FeelingId = 'improved' | 'same' | 'worse' | 'returned';

export type FollowUpTaskId =
  | 'sulphur'
  | 'diary'
  | 'avoid'
  | 'photo'
  | 'book';

export type FollowUpTaskBadgeTone = 'success' | 'danger' | 'warn' | 'neutral';

export type FollowUpTask = {
  id: FollowUpTaskId;
  titleKey: TranslationKey;
  metaKey: TranslationKey;
  badgeKey?: TranslationKey;
  badgeTone?: FollowUpTaskBadgeTone;
  done: boolean;
  uploadAction?: boolean;
};

export type FollowUpPlanViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  doctorPlanLine: string;
  createdLine: string;
  patientLine: string;
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
  onToggleTask: (id: FollowUpTaskId) => void;
  onUploadPhoto: () => void;
  prescriptionOpen: boolean;
  consultationNoteOpen: boolean;
  onOpenPrescription: () => void;
  onClosePrescription: () => void;
  onOpenConsultationNote: () => void;
  onCloseConsultationNote: () => void;
  onOpenDiary: () => void;
};

const INITIAL_TASKS: FollowUpTask[] = [
  {
    id: 'sulphur',
    titleKey: 'followUpTaskSulphur',
    metaKey: 'followUpTaskSulphurMeta',
    badgeKey: 'followUpBadgeOnTrack',
    badgeTone: 'success',
    done: true,
  },
  {
    id: 'diary',
    titleKey: 'followUpTaskDiary',
    metaKey: 'followUpTaskDiaryMeta',
    badgeKey: 'followUpBadgeMissed',
    badgeTone: 'danger',
    done: true,
  },
  {
    id: 'avoid',
    titleKey: 'followUpTaskAvoid',
    metaKey: 'followUpTaskAvoidMeta',
    done: true,
  },
  {
    id: 'photo',
    titleKey: 'followUpTaskPhoto',
    metaKey: 'followUpTaskPhotoMeta',
    badgeKey: 'followUpBadgePending',
    badgeTone: 'warn',
    done: false,
    uploadAction: true,
  },
  {
    id: 'book',
    titleKey: 'followUpTaskBook',
    metaKey: 'followUpTaskBookMeta',
    badgeKey: 'followUpBadgePending',
    badgeTone: 'warn',
    done: false,
  },
];

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
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [consultationNoteOpen, setConsultationNoteOpen] = useState(false);

  const doneCount = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks],
  );
  const totalCount = tasks.length;

  return {
    language,
    t,
    doctorPlanLine: t('followUpPlanBy').replace(
      '{name}',
      t('searchResultAnjaliName'),
    ),
    createdLine: t('followUpCreated'),
    patientLine: t('followUpForPatient'),
    doneCount,
    totalCount,
    progress: totalCount === 0 ? 0 : doneCount / totalCount,
    nextReviewDate: t('followUpNextReviewDate'),
    nextReviewIn: t('followUpNextReviewIn'),
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
    onToggleTask: (id) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      );
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
