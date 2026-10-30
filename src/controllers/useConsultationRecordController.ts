import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetConsultationNoteQuery } from '../store/api/new/recordsApi';
import { useGetVisitDetailQuery } from '../store/api/new/visitsApi';
import { useGetConsultationSummaryQuery } from '../store/api/new/teleApi';
import { useAppSelector } from '../store/hooks';

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
  toastMessage: string | null;
  toastVariant: 'error' | 'success';
  onDismissToast: () => void;
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
  const [openNoteIds, setOpenNoteIds] = useState<Record<string, boolean>>({
    complaint: true,
    assessment: true,
    generalities: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'error' | 'success'>('error');

  const authUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const id =
    patientAppId != null && String(patientAppId).length > 0
      ? patientAppId
      : null;

  const {
    data: noteResponse,
    isLoading: isLoadingNote,
    isError: isErrorNote,
    refetch: refetchNote,
  } = useGetConsultationNoteQuery(id as number | string, {
    skip: id == null || !isAuthenticated,
  });

  const {
    data: visitResponse,
    isLoading: isLoadingVisit,
    refetch: refetchVisit,
  } = useGetVisitDetailQuery(id as number | string, {
    skip: id == null || !isAuthenticated,
  });

  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useGetConsultationSummaryQuery(id as number | string, {
    skip: id == null || !isAuthenticated,
  });

  const noteText = noteResponse?.data?.text?.trim() || null;
  const noteAt = noteResponse?.data?.at?.trim() || null;

  const visitData = visitResponse?.data;
  const summaries = summaryResponse?.data ?? [];
  const teleSummaryText =
    summaries.length > 0
      ? summaries
          .map((s) => s.text?.trim())
          .filter(Boolean)
          .join('\n\n')
      : null;

  const reasonText = visitData?.reasonText?.trim() || null;

  const notes = useMemo(() => {
    const list: ConsultationRecordViewModel['notes'] = [];

    if (reasonText) {
      list.push({
        id: 'complaint',
        titleKey: 'consultRecordNoteComplaint' as TranslationKey,
        bodyKey: reasonText as TranslationKey,
        open: openNoteIds.complaint ?? true,
      });
    }

    if (noteText) {
      list.push({
        id: 'assessment',
        titleKey: 'consultRecordClinicalNotes' as TranslationKey,
        bodyKey: noteText as TranslationKey,
        open: openNoteIds.assessment ?? true,
      });
    }

    if (teleSummaryText) {
      list.push({
        id: 'generalities',
        titleKey: 'completeSummaryNote' as TranslationKey,
        bodyKey: teleSummaryText as TranslationKey,
        open: openNoteIds.generalities ?? true,
      });
    }

    // Fallback if none exist
    if (list.length === 0 && (noteText || teleSummaryText || reasonText)) {
      list.push({
        id: 'complaint',
        titleKey: 'consultRecordNoteComplaint' as TranslationKey,
        bodyKey: (noteText || teleSummaryText || reasonText || '') as TranslationKey,
        open: true,
      });
    }

    return list;
  }, [reasonText, noteText, teleSummaryText, openNoteIds]);

  const doctorName = visitData?.doctorName
    ? `Dr. ${visitData.doctorName.replace(/^Dr\.?\s*/i, '')}`
    : '';
  const credentials =
    visitData?.clinicName || visitData?.visitType || 'Homeopathy Consultation';
  const regNo = visitData?.clinicCity || '';

  const patientLine =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const dateStr = visitData?.appointmentDate
    ? new Date(visitData.appointmentDate).toLocaleDateString(
        language === 'mr' ? 'mr-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' },
      )
    : noteAt
      ? new Date(noteAt).toLocaleDateString(
          language === 'mr' ? 'mr-IN' : 'en-IN',
          { day: 'numeric', month: 'short', year: 'numeric' },
        )
      : '';

  const consultMode =
    visitData?.consultMode || (visitData?.isTele ? 'Tele' : 'In-Clinic');
  const consultLine = [dateStr, visitData?.appointmentTime, consultMode]
    .filter(Boolean)
    .join(' · ');

  const signedBanner =
    visitData?.status === 'COMPLETED'
      ? 'Consultation Completed & Signed'
      : noteAt
        ? `Signed on ${dateStr}`
        : 'Consultation Note';

  const loading = id != null && (isLoadingNote || isLoadingVisit || isLoadingSummary);
  const isError = id != null && isErrorNote && !visitData && summaries.length === 0;
  const isEmpty = id == null || (!loading && !isError && notes.length === 0);

  return {
    language,
    t,
    signedBanner,
    doctorName,
    credentials,
    regNo,
    patientLine,
    consultLine,
    recordId: id != null ? `#APP-${id}` : '',
    versionStripLabel: dateStr ? `Recorded ${dateStr}` : '',
    noteText,
    loading,
    isError,
    isEmpty,
    toastMessage,
    toastVariant,
    onDismissToast: () => setToastMessage(null),
    notes,
    versions: [],
    versionHistoryOpen,
    selectedVersionId,
    onBack,
    onShare: () => {
      setToastMessage('Sharing consultation record is not supported yet.');
      setToastVariant('error');
    },
    onDownload: () => {
      setToastMessage('Downloading consultation note is not supported yet.');
      setToastVariant('error');
    },
    onToggleNote: (noteId) => {
      setOpenNoteIds((prev) => ({
        ...prev,
        [noteId]: !prev[noteId],
      }));
    },
    onOpenVersionHistory: () => setVersionHistoryOpen(true),
    onCloseVersionHistory: () => setVersionHistoryOpen(false),
    onSelectVersion: (next) => {
      setSelectedVersionId(next);
      setVersionHistoryOpen(false);
    },
    onOpenPrescription: () => onOpenPrescription?.(),
    onOpenFollowUp: () => onOpenFollowUp?.(),
    onRetry: () => {
      void refetchNote();
      void refetchVisit();
      void refetchSummary();
    },
  };
}
