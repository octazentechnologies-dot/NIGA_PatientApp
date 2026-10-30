import { useMemo, useState } from 'react';
import { Linking } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  resolvePatientDocumentUrl,
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
  useGetFollowUpsQuery,
  useGetPrescriptionsListQuery,
  useGetTimelineQuery,
} from '../store/api/new/recordsApi';
import {
  type PatientVisitItem,
  useGetPatientVisitsQuery,
} from '../store/api/new/visitsApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useAppSelector } from '../store/hooks';

export type RecordsMemberId = string;

export type RecordsFilterId =
  | 'all'
  | 'consultations'
  | 'prescriptions'
  | 'documents'
  | 'followups'
  | 'carelink';

export type RecordsItemKind =
  | 'consultation'
  | 'prescription'
  | 'document'
  | 'followup'
  | 'referral'
  | 'diary';

export type PrescriptionLifecycleStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'superseded';

export type RecordsMember = {
  id: RecordsMemberId;
  label: string;
  pending?: boolean;
  initials: string;
};

export type RecordsTimelineItem = {
  id: string;
  kind: RecordsItemKind;
  titleKey: TranslationKey;
  metaKey: TranslationKey;
  badgeKey?: TranslationKey;
  noteKey?: TranslationKey;
  /** Visit id for Erx / consultation note APIs. */
  patientAppId?: number | null;
  /** Present for document rows from GET /api/Patient/Documents. */
  documentId?: number | null;
  rxStatus?: PrescriptionLifecycleStatus;
  rxStripKey?: TranslationKey;
  rxField1LabelKey?: TranslationKey;
  rxField1ValueKey?: TranslationKey;
  rxField2LabelKey?: TranslationKey;
  rxField2ValueKey?: TranslationKey;
  rxField2Alert?: boolean;
  rxFooterKey?: TranslationKey;
};

export type HealthRecordsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  members: RecordsMember[];
  selectedMemberId: RecordsMemberId;
  filters: { id: RecordsFilterId; labelKey: TranslationKey }[];
  selectedFilter: RecordsFilterId;
  monthLabel: string;
  items: RecordsTimelineItem[];
  isEmpty: boolean;
  isPendingMember: boolean;
  fabOpen: boolean;
  consultationRecordOpen: boolean;
  prescriptionOpen: boolean;
  /** Visit id for open prescription / note — null when unknown. */
  activePatientAppId: number | null;
  uploadDocumentOpen: boolean;
  confirmDeleteDocId: number | null;
  confirmDeleteDocName: string;
  isDeletingDocument: boolean;
  toastMessage: string | null;
  toastVariant: 'error' | 'success';
  onDismissToast: () => void;
  onSelectMember: (id: RecordsMemberId) => void;
  onSelectFilter: (id: RecordsFilterId) => void;
  onToggleFab: () => void;
  onUploadDocument: () => void;
  onCloseUploadDocument: () => void;
  onUploadDocumentSaved: () => void;
  onAddDiary: () => void;
  onViewPrescription: () => void;
  onClosePrescription: () => void;
  onOrderPrescription: () => void;
  onOpenCalendar: () => void;
  onOpenNotifications: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onAddMember: () => void;
  onOpenFollowUp: () => void;
  onOpenConsultationRecord: (itemId: string) => void;
  onCloseConsultationRecord: () => void;
  onViewLatestPrescription: (itemId: string) => void;
  onViewDocument: (documentId: number) => void;
  onPromptDeleteDocument: (documentId: number, fileName?: string) => void;
  onConfirmDeleteDocument: () => Promise<void>;
  onCancelDeleteDocument: () => void;
  onDeleteDocument: (itemId: string) => void;
};

function memberInitials(name: string, fallback = 'FM'): string {
  const cleaned = name.trim();
  if (!cleaned) return fallback;
  return (
    cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || fallback
  );
}

function memberDisplayName(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return '';
  return cleaned.split(/\s+/)[0] || cleaned;
}

const FILTERS: { id: RecordsFilterId; labelKey: TranslationKey }[] = [
  { id: 'all', labelKey: 'recordsFilterAll' },
  { id: 'consultations', labelKey: 'recordsFilterConsultations' },
  { id: 'prescriptions', labelKey: 'recordsFilterPrescriptions' },
  { id: 'documents', labelKey: 'recordsFilterDocuments' },
  { id: 'followups', labelKey: 'recordsFilterFollowUps' },
  { id: 'carelink', labelKey: 'recordsFilterCareLink' },
];

function filterItems(
  items: RecordsTimelineItem[],
  filter: RecordsFilterId,
): RecordsTimelineItem[] {
  if (filter === 'all') {
    return items;
  }
  if (filter === 'consultations') {
    return items.filter((item) => item.kind === 'consultation');
  }
  if (filter === 'prescriptions') {
    return items.filter((item) => item.kind === 'prescription');
  }
  if (filter === 'documents') {
    return items.filter((item) => item.kind === 'document');
  }
  if (filter === 'followups') {
    return items.filter((item) => item.kind === 'followup' || item.kind === 'diary');
  }
  if (filter === 'carelink') {
    return items.filter((item) => item.kind === 'referral');
  }
  return items;
}

export function useHealthRecordsController({
  onOpenFollowUpPlan,
  onOpenNotifications,
  onAddMember,
  initialFilter = 'all',
}: {
  onOpenFollowUpPlan?: () => void;
  onOpenNotifications?: () => void;
  onAddMember?: () => void;
  initialFilter?: RecordsFilterId;
} = {}): HealthRecordsViewModel {
  const { language, t, setLanguage } = useLocalization();
  const [selectedMemberId, setSelectedMemberId] =
    useState<RecordsMemberId>('self');
  const [selectedFilter, setSelectedFilter] =
    useState<RecordsFilterId>(initialFilter);
  const [fabOpen, setFabOpen] = useState(false);
  const [consultationRecordOpen, setConsultationRecordOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [activePatientAppId, setActivePatientAppId] = useState<number | null>(
    null,
  );
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<number | null>(null);
  const [confirmDeleteDocName, setConfirmDeleteDocName] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'error' | 'success'>('error');

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);

  const { data: timelineResponse } = useGetTimelineQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: prescriptionsListResponse } = useGetPrescriptionsListQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: visitsResponse } = useGetPatientVisitsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: documentsResponse } = useGetDocumentsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: followUpsResponse } = useGetFollowUpsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [deleteDocument, { isLoading: isDeletingDocument }] = useDeleteDocumentMutation();
  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });

  const members = useMemo<RecordsMember[]>(() => {
    if (!isAuthenticated) {
      return [
        { id: 'self', label: t('recordsMyself'), initials: 'ME' },
      ];
    }

    const selfName =
      authUser?.patientName ||
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');
    const list: RecordsMember[] = [
      {
        id: 'self',
        label: t('recordsMyself'),
        initials: memberInitials(selfName, 'ME'),
      },
    ];
    if (familyResponse?.data) {
      for (const m of familyResponse.data) {
        const fullName = (
          m.patientName ||
          m.fullName ||
          m.name ||
          ''
        ).trim();
        const label =
          memberDisplayName(fullName) ||
          (m.relation || m.relationName || m.relationship || '').trim() ||
          'Member';
        list.push({
          id: String(m.familyMemberId ?? m.id ?? m.memberPatientId),
          label,
          initials: memberInitials(fullName || label),
        });
      }
    }
    return list;
  }, [authUser, familyResponse?.data, isAuthenticated, t]);

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? members[0];
  const isPendingMember = Boolean(selectedMember.pending);

  const rawItems = useMemo<RecordsTimelineItem[]>(() => {
    if (!isAuthenticated || selectedMemberId !== 'self') {
      return [];
    }

    const serverItems: RecordsTimelineItem[] = [];

    // 1. Consultations: Prefer visitsApi for rich details; fall back to timeline
    const rawVisits = visitsResponse?.data;
    const visitsList: PatientVisitItem[] = Array.isArray(rawVisits)
      ? rawVisits
      : rawVisits && typeof rawVisits === 'object' && 'data' in rawVisits && Array.isArray(rawVisits.data)
        ? rawVisits.data
        : [];

    if (Array.isArray(visitsList) && visitsList.length > 0) {
      for (const visit of visitsList) {
        const isCompleted = visit.status === 'COMPLETED';
        const docName = (visit.doctorName || '').trim();
        const title = docName ? `Dr. ${docName}` : 'Consultation';
        const dateStr = visit.appointmentDate
          ? new Date(visit.appointmentDate).toLocaleDateString(
              language === 'mr' ? 'mr-IN' : 'en-IN',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )
          : '';
        const mode = visit.consultMode || (visit.isTele ? 'Tele' : 'In-Clinic');
        const meta = [dateStr, visit.appointmentTime, mode]
          .filter(Boolean)
          .join(' · ');

        serverItems.push({
          id: `visit-${visit.patientAppId}`,
          kind: 'consultation',
          titleKey: title as TranslationKey,
          metaKey: (meta || 'Consultation Record') as TranslationKey,
          badgeKey: isCompleted ? 'recordsNoteSigned' : undefined,
          patientAppId: visit.patientAppId,
        });
      }
    } else {
      const appointments = timelineResponse?.data?.appointments;
      if (Array.isArray(appointments)) {
        for (const app of appointments) {
          const dateStr = app.at
            ? new Date(app.at).toLocaleDateString(
                language === 'mr' ? 'mr-IN' : 'en-IN',
                { day: 'numeric', month: 'short', year: 'numeric' },
              )
            : '';
          serverItems.push({
            id: `app-${app.refId}`,
            kind: 'consultation',
            titleKey: 'recordsConsultTitle',
            metaKey: (dateStr || 'recordsConsultMeta') as TranslationKey,
            badgeKey: app.title === 'COMPLETED' ? 'recordsNoteSigned' : undefined,
            patientAppId: app.refId,
          });
        }
      }
    }

    // 2. Prescriptions (GET /api/Erx/Prescriptions with fallback to timeline prescriptions)
    const rxList =
      prescriptionsListResponse?.data &&
      Array.isArray(prescriptionsListResponse.data) &&
      prescriptionsListResponse.data.length > 0
        ? prescriptionsListResponse.data
        : timelineResponse?.data?.prescriptions;

    if (Array.isArray(rxList)) {
      for (const rx of rxList) {
        const isSigned = rx.status === 'SIGNED';
        const dateStr = rx.signedAt
          ? new Date(rx.signedAt).toLocaleDateString(
              language === 'mr' ? 'mr-IN' : 'en-IN',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )
          : '';
        serverItems.push({
          id: `erx-${rx.erxSnapshotId}`,
          kind: 'prescription',
          titleKey: 'recordsRxTitle',
          metaKey: (`eRx #${rx.erxSnapshotId}${dateStr ? ` · ${dateStr}` : ''}`) as TranslationKey,
          badgeKey: isSigned ? 'recordsRxActive' : undefined,
          rxStatus: isSigned ? 'active' : 'expired',
          patientAppId: rx.patientAppId,
        });
      }
    }

    // 3. Documents
    const docs = documentsResponse?.data;
    if (Array.isArray(docs)) {
      for (const doc of docs) {
        const title = (doc.fileName || '').trim();
        const dateStr = doc.createdAt
          ? new Date(doc.createdAt).toLocaleDateString(
              language === 'mr' ? 'mr-IN' : 'en-IN',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )
          : '';
        const meta = [doc.mime, dateStr].filter(Boolean).join(' · ');
        serverItems.push({
          id: `doc-${doc.documentId}`,
          kind: 'document',
          titleKey: (title || 'recordsDocTitle') as TranslationKey,
          metaKey: (meta || 'Document') as TranslationKey,
          documentId: doc.documentId,
        });
      }
    }

    // 4. Follow-up tasks
    const followUps = followUpsResponse?.data;
    if (Array.isArray(followUps)) {
      for (const task of followUps) {
        const isDone = task.status === 'DONE';
        const dateStr = task.dueDate
          ? new Date(task.dueDate).toLocaleDateString(
              language === 'mr' ? 'mr-IN' : 'en-IN',
              { day: 'numeric', month: 'short', year: 'numeric' },
            )
          : '';
        serverItems.push({
          id: `task-${task.followUpTaskId}`,
          kind: 'followup',
          titleKey: (task.title || 'Follow-Up Task') as TranslationKey,
          metaKey: (dateStr ? `Due: ${dateStr}` : 'recordsFollowUpMeta') as TranslationKey,
          badgeKey: isDone ? 'followUpBadgeOnTrack' : 'followUpBadgePending',
        });
      }
    }

    return serverItems;
  }, [
    isAuthenticated,
    selectedMemberId,
    visitsResponse?.data,
    timelineResponse?.data,
    documentsResponse?.data,
    followUpsResponse?.data,
    language,
  ]);

  const items = useMemo(
    () => filterItems(rawItems, selectedFilter),
    [rawItems, selectedFilter],
  );

  const onPromptDeleteDocument = (documentId: number, fileName?: string) => {
    setConfirmDeleteDocId(documentId);
    setConfirmDeleteDocName(fileName || `Document #${documentId}`);
  };

  const onConfirmDeleteDocument = async () => {
    if (confirmDeleteDocId == null) return;
    try {
      await deleteDocument(confirmDeleteDocId).unwrap();
      setToastMessage('Document deleted successfully.');
      setToastVariant('success');
      setConfirmDeleteDocId(null);
      setConfirmDeleteDocName('');
    } catch (err: unknown) {
      console.warn('[deleteDocument] Failed:', err);
      const errMsg =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setToastMessage(errMsg || 'Could not delete document.');
      setToastVariant('error');
    }
  };

  const onCancelDeleteDocument = () => {
    setConfirmDeleteDocId(null);
    setConfirmDeleteDocName('');
  };

  const onViewDocument = async (documentId: number) => {
    try {
      const url = resolvePatientDocumentUrl(documentId);
      await Linking.openURL(url);
    } catch (err) {
      console.warn('[onViewDocument] Failed:', err);
      setToastMessage('Could not open document.');
      setToastVariant('error');
    }
  };

  return {
    language,
    t,
    members,
    selectedMemberId,
    filters: FILTERS,
    selectedFilter,
    monthLabel: t('recordsMonthAug'),
    items,
    isEmpty: !isPendingMember && items.length === 0,
    isPendingMember,
    fabOpen,
    consultationRecordOpen,
    prescriptionOpen,
    activePatientAppId,
    uploadDocumentOpen,
    confirmDeleteDocId,
    confirmDeleteDocName,
    isDeletingDocument,
    toastMessage,
    toastVariant,
    onDismissToast: () => setToastMessage(null),
    onSelectMember: (id) => {
      setSelectedMemberId(id);
      setFabOpen(false);
    },
    onSelectFilter: (id) => {
      setSelectedFilter(id);
      setFabOpen(false);
    },
    onToggleFab: () => setFabOpen((prev) => !prev),
    onUploadDocument: () => {
      setFabOpen(false);
      setUploadDocumentOpen(true);
    },
    onCloseUploadDocument: () => setUploadDocumentOpen(false),
    onUploadDocumentSaved: () => setUploadDocumentOpen(false),
    onAddDiary: () => setFabOpen(false),
    onViewPrescription: () => {
      setFabOpen(false);
      const firstRx = items.find((i) => i.kind === 'prescription' && i.patientAppId);
      setActivePatientAppId(firstRx?.patientAppId ?? null);
      setPrescriptionOpen(true);
    },
    onClosePrescription: () => {
      setPrescriptionOpen(false);
      setActivePatientAppId(null);
    },
    onOrderPrescription: () => undefined,
    onOpenCalendar: () => undefined,
    onOpenNotifications: () => onOpenNotifications?.(),
    onSelectLanguage: setLanguage,
    onAddMember: () => onAddMember?.(),
    onOpenFollowUp: () => {
      setFabOpen(false);
      onOpenFollowUpPlan?.();
    },
    onOpenConsultationRecord: (itemId) => {
      setFabOpen(false);
      const row = items.find((i) => i.id === itemId);
      setActivePatientAppId(row?.patientAppId ?? null);
      setConsultationRecordOpen(true);
    },
    onCloseConsultationRecord: () => {
      setConsultationRecordOpen(false);
      setActivePatientAppId(null);
    },
    onViewLatestPrescription: (itemId) => {
      setFabOpen(false);
      const row = items.find((i) => i.id === itemId);
      setActivePatientAppId(row?.patientAppId ?? null);
      setPrescriptionOpen(true);
    },
    onViewDocument,
    onPromptDeleteDocument,
    onConfirmDeleteDocument,
    onCancelDeleteDocument,
    onDeleteDocument: (itemId) => {
      const row = items.find((i) => i.id === itemId);
      const id = row?.documentId;
      if (id == null || !Number.isFinite(Number(id))) return;
      onPromptDeleteDocument(Number(id), String(row?.titleKey || ''));
    },
  };
}
