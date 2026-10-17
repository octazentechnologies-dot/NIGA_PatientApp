import { useEffect, useMemo, useState } from 'react';

import type { DoctorProfileSeed } from '../config/doctorProfiles';
import type { PatientDocument } from '../config/patientDocuments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetDocumentsQuery } from '../store/api/new/recordsApi';
import { useAppSelector } from '../store/hooks';

export type BookingReviewDraft = {
  profile: DoctorProfileSeed;
  shortCredsKey: TranslationKey;
  whenLabel: string;
  modeConsultLabel: string;
  patientLabel: string;
  doctorFeeLabel: string;
  platformFeeLabel: string;
  taxesLabel: string;
  totalLabel: string;
};

export type BookingReviewViewModel = BookingReviewDraft & {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  reason: string;
  attached: boolean;
  attachedLabel: string;
  libraryDocuments: PatientDocument[];
  selectedLibraryId: string | null;
  /** Real documentId from GET /api/Patient/Documents. Booking body has no documentIds field. */
  selectedDocumentId: number | null;
  uploadOpen: boolean;
  selectSheetOpen: boolean;
  shareRecords: boolean;
  reminders: boolean;
  policyOpen: boolean;
  emergencyOpen: boolean;
  onBack: () => void;
  onChangeWhen: () => void;
  onChangeMode: () => void;
  onChangePatient: () => void;
  onChangeReason: (value: string) => void;
  onPressAttach: () => void;
  onRemoveAttach: () => void;
  onCloseSelectSheet: () => void;
  onSelectExistingDocument: (id: string) => void;
  onUploadNewFromSheet: () => void;
  onCloseUpload: () => void;
  onUploadSaved: (files: PatientDocument[]) => void;
  onToggleShareRecords: () => void;
  onToggleReminders: () => void;
  onTogglePolicy: () => void;
  onToggleEmergency: () => void;
  onProceedPay: () => void;
};

export function useBookingReviewController({
  draft,
  active,
  onBack,
  onProceedPay,
}: {
  draft: BookingReviewDraft;
  active: boolean;
  onBack: () => void;
  onProceedPay: () => void;
}): BookingReviewViewModel {
  const { language, t } = useLocalization();
  const [reason, setReason] = useState('');
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: documentsResponse } = useGetDocumentsQuery(undefined, {
    skip: !isAuthenticated || !active,
  });
  const [extraDocuments, setExtraDocuments] = useState<PatientDocument[]>([]);
  const [attachedId, setAttachedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectSheetOpen, setSelectSheetOpen] = useState(false);
  const [shareRecords, setShareRecords] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(true);

  useEffect(() => {
    if (!active) {
      setReason('');
      setExtraDocuments([]);
      setAttachedId(null);
      setUploadOpen(false);
      setSelectSheetOpen(false);
      setShareRecords(true);
      setReminders(false);
      setPolicyOpen(true);
      setEmergencyOpen(true);
    }
  }, [active, draft.profile.id]);

  const libraryDocuments = useMemo(() => {
    const fromApi: PatientDocument[] = (documentsResponse?.data ?? [])
      .filter((doc) => Number.isFinite(doc.documentId) && doc.documentId > 0)
      .map((doc) => ({
        id: String(doc.documentId),
        name: doc.fileName?.trim() || `Document ${doc.documentId}`,
        sizeLabel: doc.size
          ? `${Math.max(1, Math.round(doc.size / 1024))} KB`
          : '',
        kind: doc.mime?.startsWith('image/') ? ('image' as const) : ('pdf' as const),
        status: 'ready' as const,
      }));
    const known = new Set(fromApi.map((doc) => doc.id));
    return [...fromApi, ...extraDocuments.filter((doc) => !known.has(doc.id))];
  }, [documentsResponse?.data, extraDocuments]);

  const attachedDoc = useMemo(
    () => libraryDocuments.find((doc) => doc.id === attachedId) ?? null,
    [libraryDocuments, attachedId],
  );
  const selectedDocumentId = attachedDoc ? Number(attachedDoc.id) : null;

  return {
    language,
    t,
    ...draft,
    reason,
    attached: Boolean(attachedDoc),
    attachedLabel: attachedDoc?.name ?? t('reviewAttachFile'),
    libraryDocuments,
    selectedLibraryId: attachedId,
    // blocked: booking POST has no documentIds — keep the numeric id for when the contract adds it.
    selectedDocumentId:
      selectedDocumentId != null &&
      Number.isFinite(selectedDocumentId) &&
      selectedDocumentId > 0
        ? selectedDocumentId
        : null,
    uploadOpen,
    selectSheetOpen,
    shareRecords,
    reminders,
    policyOpen,
    emergencyOpen,
    onBack,
    onChangeWhen: onBack,
    onChangeMode: onBack,
    onChangePatient: onBack,
    onChangeReason: setReason,
    onPressAttach: () => {
      if (attachedId) {
        setAttachedId(null);
        return;
      }
      if (libraryDocuments.length > 0) {
        setSelectSheetOpen(true);
        return;
      }
      setUploadOpen(true);
    },
    onRemoveAttach: () => setAttachedId(null),
    onCloseSelectSheet: () => setSelectSheetOpen(false),
    onSelectExistingDocument: (id) => {
      setAttachedId(id);
      setSelectSheetOpen(false);
    },
    onUploadNewFromSheet: () => {
      setSelectSheetOpen(false);
      setUploadOpen(true);
    },
    onCloseUpload: () => setUploadOpen(false),
    onUploadSaved: (files) => {
      setExtraDocuments((prev) => {
        const next = [...prev];
        files.forEach((file) => {
          if (!next.some((item) => item.id === file.id)) {
            next.push({ ...file, status: 'ready', progress: 1 });
          }
        });
        return next;
      });
      const first = files[0];
      if (first) {
        setAttachedId(first.id);
      }
      setUploadOpen(false);
    },
    onToggleShareRecords: () => setShareRecords((current) => !current),
    onToggleReminders: () => setReminders((current) => !current),
    onTogglePolicy: () => setPolicyOpen((current) => !current),
    onToggleEmergency: () => setEmergencyOpen((current) => !current),
    onProceedPay,
  };
}
