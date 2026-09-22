import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ClinicalNoteId =
  | 'complaint'
  | 'history'
  | 'generalities'
  | 'particulars'
  | 'assessment';

export type RecordVersion = {
  id: 1 | 2;
  label: string;
  dateKey: TranslationKey;
  noteKey?: TranslationKey;
  current: boolean;
};

export type ConsultationRecordViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  signedBanner: string;
  doctorName: string;
  credentials: string;
  regNo: string;
  patientLine: string;
  consultLine: string;
  recordId: string;
  versionStripLabel: string;
  notes: {
    id: ClinicalNoteId;
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    open: boolean;
  }[];
  versions: RecordVersion[];
  versionHistoryOpen: boolean;
  selectedVersionId: 1 | 2;
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  onToggleNote: (id: ClinicalNoteId) => void;
  onOpenVersionHistory: () => void;
  onCloseVersionHistory: () => void;
  onSelectVersion: (id: 1 | 2) => void;
  onOpenPrescription: () => void;
  onOpenFollowUp: () => void;
};

const DEFAULT_OPEN: ClinicalNoteId[] = ['complaint', 'history', 'generalities'];

export function useConsultationRecordController({
  onBack,
  onOpenPrescription,
  onOpenFollowUp,
}: {
  onBack: () => void;
  onOpenPrescription?: () => void;
  onOpenFollowUp?: () => void;
}): ConsultationRecordViewModel {
  const { language, t } = useLocalization();
  const [openNotes, setOpenNotes] = useState<ClinicalNoteId[]>(DEFAULT_OPEN);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<1 | 2>(1);

  const notes = useMemo(
    () =>
      (
        [
          {
            id: 'complaint' as const,
            titleKey: 'consultRecordNoteComplaint' as const,
            bodyKey: 'consultRecordNoteComplaintBody' as const,
          },
          {
            id: 'history' as const,
            titleKey: 'consultRecordNoteHistory' as const,
            bodyKey: 'consultRecordNoteHistoryBody' as const,
          },
          {
            id: 'generalities' as const,
            titleKey: 'consultRecordNoteGeneralities' as const,
            bodyKey: 'consultRecordNoteGeneralitiesBody' as const,
          },
          {
            id: 'particulars' as const,
            titleKey: 'consultRecordNoteParticulars' as const,
            bodyKey: 'consultRecordNoteParticularsBody' as const,
          },
          {
            id: 'assessment' as const,
            titleKey: 'consultRecordNoteAssessment' as const,
            bodyKey: 'consultRecordNoteAssessmentBody' as const,
          },
        ] as const
      ).map((note) => ({
        ...note,
        open: openNotes.includes(note.id),
      })),
    [openNotes],
  );

  const versions: RecordVersion[] = [
    {
      id: 2,
      label: 'v2',
      dateKey: 'consultRecordVersion2Date',
      noteKey: 'consultRecordVersion2Note',
      current: true,
    },
    {
      id: 1,
      label: 'v1',
      dateKey: 'consultRecordVersion1Date',
      current: false,
    },
  ];

  const versionStripLabel =
    selectedVersionId === 1
      ? t('consultRecordVersionStripV1')
      : t('consultRecordVersionStripV2');

  return {
    language,
    t,
    signedBanner: t('consultRecordSigned'),
    doctorName: t('searchResultAnjaliName'),
    credentials: t('consultRecordCredentials'),
    regNo: t('consultRecordReg'),
    patientLine: t('consultRecordPatient'),
    consultLine: t('consultRecordConsultMeta'),
    recordId: t('consultRecordId'),
    versionStripLabel,
    notes,
    versions,
    versionHistoryOpen,
    selectedVersionId,
    onBack,
    onShare: () => undefined,
    onDownload: () => undefined,
    onToggleNote: (id) => {
      setOpenNotes((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    },
    onOpenVersionHistory: () => setVersionHistoryOpen(true),
    onCloseVersionHistory: () => setVersionHistoryOpen(false),
    onSelectVersion: (id) => {
      setSelectedVersionId(id);
      setVersionHistoryOpen(false);
    },
    onOpenPrescription: () => onOpenPrescription?.(),
    onOpenFollowUp: () => onOpenFollowUp?.(),
  };
}
