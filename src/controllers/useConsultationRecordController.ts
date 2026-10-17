import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetConsultationNoteQuery } from '../store/api/new/recordsApi';

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
  noteText: string | null;
  loading: boolean;
  isError: boolean;
  isEmpty: boolean;
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
  onRetry: () => void;
};

export function useConsultationRecordController({
  patientAppId,
  onBack,
  onOpenPrescription,
  onOpenFollowUp,
}: {
  patientAppId?: number | string | null;
  onBack: () => void;
  onOpenPrescription?: () => void;
  onOpenFollowUp?: () => void;
}): ConsultationRecordViewModel {
  const { language, t } = useLocalization();
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<1 | 2>(1);
  const id =
    patientAppId != null && String(patientAppId).length > 0
      ? patientAppId
      : null;
  const { data, isLoading, isError, isFetching, refetch } =
    useGetConsultationNoteQuery(id as number | string, {
      skip: id == null,
    });

  const noteText = data?.data?.text?.trim() || null;
  const noteAt = data?.data?.at?.trim() || null;

  const notes = useMemo(() => {
    if (!noteText) return [];
    return [
      {
        id: 'complaint' as const,
        titleKey: 'consultRecordNoteComplaint' as TranslationKey,
        bodyKey: noteText as TranslationKey,
        open: true,
      },
    ];
  }, [noteText]);

  return {
    language,
    t,
    signedBanner: noteAt ? noteAt : '',
    doctorName: '',
    credentials: '',
    regNo: '',
    patientLine: '',
    consultLine: '',
    recordId: id != null ? String(id) : '',
    versionStripLabel: '',
    noteText,
    loading: id != null && (isLoading || isFetching),
    isError: id != null && isError,
    isEmpty: id == null || (!isLoading && !isError && !noteText),
    notes,
    versions: [],
    versionHistoryOpen,
    selectedVersionId,
    onBack,
    onShare: () => undefined,
    onDownload: () => undefined,
    onToggleNote: () => undefined,
    onOpenVersionHistory: () => setVersionHistoryOpen(true),
    onCloseVersionHistory: () => setVersionHistoryOpen(false),
    onSelectVersion: (next) => {
      setSelectedVersionId(next);
      setVersionHistoryOpen(false);
    },
    onOpenPrescription: () => onOpenPrescription?.(),
    onOpenFollowUp: () => onOpenFollowUp?.(),
    onRetry: () => {
      void refetch();
    },
  };
}
