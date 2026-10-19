import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
  useGetTimelineQuery,
} from '../store/api/new/recordsApi';
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

const SELF_ITEMS: RecordsTimelineItem[] = [
  {
    id: 'c1',
    kind: 'consultation',
    titleKey: 'recordsConsultTitle',
    metaKey: 'recordsConsultMeta',
    badgeKey: 'recordsNoteSigned',
  },
  {
    id: 'p1',
    kind: 'prescription',
    titleKey: 'recordsRxTitle',
    metaKey: 'recordsRxMeta',
    badgeKey: 'recordsRxActive',
    rxStatus: 'active',
  },
  {
    id: 'p-expired',
    kind: 'prescription',
    titleKey: 'rxStatusExpiredTitle',
    metaKey: 'rxStatusExpiredId',
    badgeKey: 'rxStatusExpiredBadge',
    rxStatus: 'expired',
    rxStripKey: 'rxStatusExpiredStrip',
    rxField1LabelKey: 'rxStatusPrescriberLabel',
    rxField1ValueKey: 'rxStatusPrescriber',
    rxField2LabelKey: 'rxStatusDosageLabel',
    rxField2ValueKey: 'rxStatusExpiredDosage',
  },
  {
    id: 'p-cancelled',
    kind: 'prescription',
    titleKey: 'rxStatusCancelledTitle',
    metaKey: 'rxStatusCancelledId',
    badgeKey: 'rxStatusCancelledBadge',
    rxStatus: 'cancelled',
    rxStripKey: 'rxStatusCancelledStrip',
    rxField1LabelKey: 'rxStatusPrescriberLabel',
    rxField1ValueKey: 'rxStatusPrescriber',
    rxField2LabelKey: 'rxStatusReasonLabel',
    rxField2ValueKey: 'rxStatusCancelledReason',
    rxField2Alert: true,
    rxFooterKey: 'rxStatusCancelledFooter',
  },
  {
    id: 'p-superseded',
    kind: 'prescription',
    titleKey: 'rxStatusSupersededTitle',
    metaKey: 'rxStatusSupersededId',
    badgeKey: 'rxStatusSupersededBadge',
    rxStatus: 'superseded',
    rxStripKey: 'rxStatusSupersededStrip',
    rxField1LabelKey: 'rxStatusPrescriberLabel',
    rxField1ValueKey: 'rxStatusPrescriber',
    rxField2LabelKey: 'rxStatusIssuedLabel',
    rxField2ValueKey: 'rxStatusSupersededIssued',
  },
  {
    id: 'd1',
    kind: 'document',
    titleKey: 'recordsDocTitle',
    metaKey: 'recordsDocMeta',
    noteKey: 'recordsDocNote',
  },
  {
    id: 'f1',
    kind: 'followup',
    titleKey: 'recordsFollowUpTitle',
    metaKey: 'recordsFollowUpMeta',
  },
  {
    id: 'r1',
    kind: 'referral',
    titleKey: 'recordsReferralTitle',
    metaKey: 'recordsReferralMeta',
  },
  {
    id: 'y1',
    kind: 'diary',
    titleKey: 'recordsDiaryTitle',
    metaKey: 'recordsDiaryMeta',
  },
];

const AARAV_ITEMS: RecordsTimelineItem[] = [
  SELF_ITEMS[0],
  SELF_ITEMS[1],
  SELF_ITEMS[5],
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

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: timelineResponse } = useGetTimelineQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: documentsResponse } = useGetDocumentsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [deleteDocument] = useDeleteDocumentMutation();
  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });

  const members = useMemo<RecordsMember[]>(() => {
    if (!isAuthenticated) {
      return [
        { id: 'self', label: t('recordsMyself'), initials: 'PK' },
        { id: 'aarav', label: t('recordsAarav'), initials: 'AK' },
        { id: 'meera', label: t('recordsMeera'), initials: 'MK' },
        {
          id: 'sunita',
          label: t('recordsSunitaPending'),
          initials: 'SK',
          pending: true,
        },
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
    if (!isAuthenticated) {
      if (selectedMemberId === 'meera' || selectedMemberId === 'sunita') {
        return [];
      }
      if (selectedMemberId === 'aarav') {
        return AARAV_ITEMS;
      }
      return SELF_ITEMS;
    }

    if (selectedMemberId !== 'self') {
      return [];
    }

    const serverItems: RecordsTimelineItem[] = [];

    const appointments = timelineResponse?.data?.appointments;
    if (Array.isArray(appointments)) {
      for (const app of appointments) {
        serverItems.push({
          id: `app-${app.refId}`,
          kind: 'consultation',
          titleKey: 'recordsConsultTitle',
          metaKey: 'recordsConsultMeta',
          badgeKey: app.title === 'COMPLETED' ? 'recordsNoteSigned' : undefined,
          patientAppId: app.refId,
        });
      }
    }

    const prescriptions = timelineResponse?.data?.prescriptions;
    if (Array.isArray(prescriptions)) {
      for (const rx of prescriptions) {
        const isSigned = rx.status === 'SIGNED';
        serverItems.push({
          id: `erx-${rx.erxSnapshotId}`,
          kind: 'prescription',
          titleKey: 'recordsRxTitle',
          metaKey: 'recordsRxMeta',
          badgeKey: isSigned ? 'recordsRxActive' : undefined,
          rxStatus: isSigned ? 'active' : 'expired',
          patientAppId: rx.patientAppId,
        });
      }
    }

    const docs = documentsResponse?.data;
    if (Array.isArray(docs)) {
      for (const doc of docs) {
        const title = (doc.fileName || '').trim();
        serverItems.push({
          id: `doc-${doc.documentId}`,
          kind: 'document',
          titleKey: (title || 'recordsDocTitle') as TranslationKey,
          metaKey: (doc.mime || doc.createdAt || 'recordsDocMeta') as TranslationKey,
          documentId: doc.documentId,
        });
      }
    }

    return serverItems;
  }, [
    isAuthenticated,
    selectedMemberId,
    timelineResponse,
    documentsResponse,
  ]);

  const items = useMemo(
    () => filterItems(rawItems, selectedFilter),
    [rawItems, selectedFilter],
  );

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
    onDeleteDocument: (itemId) => {
      const row = items.find((i) => i.id === itemId);
      const id = row?.documentId;
      if (id == null || !Number.isFinite(Number(id))) return;
      void deleteDocument(id).unwrap().catch(() => undefined);
    },
  };
}
