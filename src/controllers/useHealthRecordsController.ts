import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type RecordsMemberId = 'self' | 'aarav' | 'meera' | 'sunita';

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
  nameKey: TranslationKey;
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
};

const MEMBERS: RecordsMember[] = [
  { id: 'self', nameKey: 'recordsMyself', initials: 'PK' },
  { id: 'aarav', nameKey: 'recordsAarav', initials: 'AK' },
  { id: 'meera', nameKey: 'recordsMeera', initials: 'MK' },
  {
    id: 'sunita',
    nameKey: 'recordsSunitaPending',
    initials: 'SK',
    pending: true,
  },
];

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
  initialFilter = 'all',
}: {
  onOpenFollowUpPlan?: () => void;
  onOpenNotifications?: () => void;
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
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);

  const selectedMember =
    MEMBERS.find((member) => member.id === selectedMemberId) ?? MEMBERS[0];
  const isPendingMember = Boolean(selectedMember.pending);

  const rawItems = useMemo(() => {
    if (selectedMemberId === 'meera' || selectedMemberId === 'sunita') {
      return [];
    }
    if (selectedMemberId === 'aarav') {
      return AARAV_ITEMS;
    }
    return SELF_ITEMS;
  }, [selectedMemberId]);

  const items = useMemo(
    () => filterItems(rawItems, selectedFilter),
    [rawItems, selectedFilter],
  );

  return {
    language,
    t,
    members: MEMBERS,
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
      setPrescriptionOpen(true);
    },
    onClosePrescription: () => setPrescriptionOpen(false),
    onOrderPrescription: () => undefined,
    onOpenCalendar: () => undefined,
    onOpenNotifications: () => onOpenNotifications?.(),
    onSelectLanguage: setLanguage,
    onAddMember: () => undefined,
    onOpenFollowUp: () => {
      setFabOpen(false);
      onOpenFollowUpPlan?.();
    },
    onOpenConsultationRecord: () => {
      setFabOpen(false);
      setConsultationRecordOpen(true);
    },
    onCloseConsultationRecord: () => setConsultationRecordOpen(false),
    onViewLatestPrescription: () => {
      setFabOpen(false);
      setPrescriptionOpen(true);
    },
  };
}
