import { useCallback, useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { getAccessToken } from '../services/secureStorage';
import {
  resolvePatientDocumentUrl,
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
  useGetFollowUpsQuery,
  useGetPrescriptionsListQuery,
  useGetTimelineQuery,
  type ApiPrescriptionListItem,
} from '../store/api/new/recordsApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useAppSelector } from '../store/hooks';
import {
  useInvalidateOnActive,
  type LiveQueryTag,
} from '../utilities/rtkScreenFreshness';
import { getApiBodyMessage, getApiErrorMessage } from '../utilities/toast';

const RECORDS_LIVE_TAGS: readonly LiveQueryTag[] = [
  'Timeline',
  'Documents',
  'Prescriptions',
  'FollowUps',
];

function sanitizeDocumentFileName(
  name: string | null | undefined,
  documentId: number,
  mime?: string | null,
): string {
  const fallback = `document-${documentId}`;
  const cleaned = String(name || '')
    .trim()
    .replace(/[^\w.\-()+\s]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
  let base = cleaned || fallback;
  if (!/\.[a-z0-9]{2,5}$/i.test(base)) {
    const lower = String(mime || '').toLowerCase();
    if (lower.includes('pdf')) base = `${base}.pdf`;
    else if (lower.includes('png')) base = `${base}.png`;
    else if (lower.includes('jpeg') || lower.includes('jpg')) base = `${base}.jpg`;
    else if (lower.includes('webp')) base = `${base}.webp`;
  }
  return base;
}

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
  /** Prefer over titleKey when set (API-built display string). */
  titleText?: string;
  /** Prefer over metaKey when set (API-built display string). */
  metaText?: string;
  /** Optional description / note body (API document description). */
  descriptionText?: string;
  badgeKey?: TranslationKey;
  noteKey?: TranslationKey;
  /** Visit id for Erx / consultation note APIs. */
  patientAppId?: number | null;
  /** Signed prescription snapshot used to start a medicine order. */
  erxSnapshotId?: number | null;
  /** Source timestamp used to group the timeline by month. */
  occurredAt?: string | null;
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

function withDrPrefix(name: string): string {
  const cleaned = name.trim().replace(/^Dr\.?\s*/i, '');
  return cleaned ? `Dr. ${cleaned}` : '';
}

/** "Anjali Deshmukh" → "Dr. A. Deshmukh" (matches Records prescription meta). */
function shortDoctorLabel(name: string): string {
  const cleaned = name.trim().replace(/^Dr\.?\s*/i, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return `Dr. ${parts[0]}`;
  const first = parts[0];
  const last = parts[parts.length - 1];
  const initial = first.charAt(0).toUpperCase();
  return `Dr. ${initial}. ${last}`;
}

function mapAppointmentTypeLabel(
  raw: string | null | undefined,
  t: (key: TranslationKey) => string,
): string {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return '';
  if (
    value === 'tele' ||
    value === 'video' ||
    value === 'televideo' ||
    value === 'teleconsult'
  ) {
    return t('recordsTypeVideo');
  }
  if (
    value === 'inclinic' ||
    value === 'in_clinic' ||
    value === 'clinic' ||
    value === 'in-person' ||
    value === 'inperson'
  ) {
    return t('recordsTypeClinic');
  }
  if (value === 'audio') return t('recordsTypeAudio');
  if (value === 'chat') return t('recordsTypeChat');
  return String(raw).trim();
}

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
  /** True on first paint while timeline/documents have no cached data yet. */
  isLoading: boolean;
  isPendingMember: boolean;
  fabOpen: boolean;
  consultationRecordOpen: boolean;
  prescriptionOpen: boolean;
  /** Visit id for open prescription / note — null when unknown. */
  activePatientAppId: number | null;
  /** Snapshot id for open prescription — null when unknown. */
  activeErxSnapshotId: number | null;
  /** Patient id of the selected family member — undefined for self/all. */
  activePatientId: number | undefined;
  uploadDocumentOpen: boolean;
  confirmDeleteDocId: number | null;
  confirmDeleteDocName: string;
  isDeletingDocument: boolean;
  isDownloadingDocument: boolean;
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
  onOrderPrescription: (itemId: string) => void;
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
  active = true,
  onOpenFollowUpPlan,
  onOpenNotifications,
  onAddMember,
  onOpenOrderMedicines,
  initialFilter = 'all',
}: {
  /** Keep-alive tab / overlay visibility — invalidate mutable tags on enter. */
  active?: boolean;
  onOpenFollowUpPlan?: () => void;
  onOpenNotifications?: () => void;
  onAddMember?: () => void;
  onOpenOrderMedicines?: (launch: {
    erxSnapshotId: number;
    patientAppId: number | null;
  }) => void;
  initialFilter?: RecordsFilterId;
} = {}): HealthRecordsViewModel {
  const { language, t, setLanguage } = useLocalization();
  const [selectedMemberId, setSelectedMemberId] = useState<RecordsMemberId>(
    initialFilter === 'prescriptions' ? 'all' : 'self',
  );
  const [selectedFilter, setSelectedFilter] =
    useState<RecordsFilterId>(initialFilter);
  const [fabOpen, setFabOpen] = useState(false);
  const [consultationRecordOpen, setConsultationRecordOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [activePatientAppId, setActivePatientAppId] = useState<number | null>(
    null,
  );
  const [activeErxSnapshotId, setActiveErxSnapshotId] = useState<number | null>(
    null,
  );
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<number | null>(null);
  const [confirmDeleteDocName, setConfirmDeleteDocName] = useState<string>('');
  const [isDownloadingDocument, setIsDownloadingDocument] = useState(false);
  const documentDownloadBusyRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'error' | 'success'>('error');

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const patientId = useAppSelector((state) => state.auth.patientId);

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
    const list: RecordsMember[] = [];
    if (familyResponse?.data && familyResponse.data.length > 0) {
      list.push({
        id: 'all',
        label: t('recordsFilterAll') || 'All',
        initials: 'ALL',
      });
    }
    list.push({
      id: 'self',
      label: t('recordsMyself'),
      initials: memberInitials(selfName, 'ME'),
    });
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
        const memberId = String(m.patientId ?? m.memberPatientId ?? m.familyMemberId ?? m.id);
        list.push({
          id: memberId,
          label,
          initials: memberInitials(fullName || label),
        });
      }
    }
    return list;
  }, [authUser, familyResponse?.data, isAuthenticated, t]);

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? members[0];
  const isPendingMember = Boolean(selectedMember?.pending);

  const targetPatientId = useMemo(() => {
    if (selectedMemberId === 'all') return undefined;
    if (selectedMemberId === 'self') {
      return patientId != null && patientId > 0 ? patientId : undefined;
    }
    const num = Number(selectedMemberId);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  }, [selectedMemberId, patientId]);

  const scopedPatient =
    targetPatientId != null && targetPatientId > 0 ? { patientId: targetPatientId } : undefined;

  /**
   * Documents list is scoped to the selected person only.
   * Self / All → omit patientId (API returns logged-in self).
   * Family member → GET ?patientId={member}.
   */
  const documentsQueryArg = useMemo(() => {
    if (selectedMemberId === 'self' || selectedMemberId === 'all') {
      return undefined;
    }
    if (targetPatientId != null && targetPatientId > 0) {
      return { patientId: targetPatientId };
    }
    return undefined;
  }, [selectedMemberId, targetPatientId]);

  const {
    data: timelineResponse,
    isLoading: timelineLoading,
  } = useGetTimelineQuery(scopedPatient, {
    skip: !isAuthenticated || !active,
    // Mutable clinical lists — refetch on remount / arg change (see rtkScreenFreshness).
    refetchOnMountOrArgChange: true,
  });
  const {
    data: documentsResponse,
    isLoading: documentsLoading,
  } = useGetDocumentsQuery(documentsQueryArg, {
    skip: !isAuthenticated || !active,
    refetchOnMountOrArgChange: true,
  });
  const { data: followUpsResponse } = useGetFollowUpsQuery(undefined, {
    skip: !isAuthenticated || !active,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: prescriptionsListResponse,
    isLoading: prescriptionsLoading,
  } = useGetPrescriptionsListQuery(scopedPatient ?? undefined, {
    skip: !isAuthenticated || !active,
    refetchOnMountOrArgChange: true,
  });

  useInvalidateOnActive(active && isAuthenticated, RECORDS_LIVE_TAGS);

  const [deleteDocument, { isLoading: isDeletingDocument }] = useDeleteDocumentMutation();

  const isLoading =
    isAuthenticated &&
    (timelineLoading || documentsLoading || prescriptionsLoading) &&
    timelineResponse == null &&
    documentsResponse == null &&
    prescriptionsListResponse == null;

  const rawItems = useMemo<RecordsTimelineItem[]>(() => {
    if (!isAuthenticated) {
      return [];
    }

    const serverItems: RecordsTimelineItem[] = [];
    const locale = language === 'mr' ? 'mr-IN' : 'en-IN';
    const formatWhen = (value: string | null | undefined, withYear = false) => {
      if (!value) return '';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '';
      return parsed.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        ...(withYear ? { year: 'numeric' as const } : {}),
      });
    };

    const matchesMember = (itemPatientId?: number | null, itemPatientName?: string | null) => {
      if (selectedMemberId === 'all') return true;
      if (selectedMemberId === 'self') {
        if (targetPatientId && itemPatientId) {
          return Number(itemPatientId) === Number(targetPatientId);
        }
        if (itemPatientName && authUser?.patientName) {
          return itemPatientName.toLowerCase() === authUser.patientName.toLowerCase();
        }
        return true;
      }
      if (targetPatientId && itemPatientId) {
        return Number(itemPatientId) === Number(targetPatientId);
      }
      if (itemPatientName && selectedMember?.label) {
        return itemPatientName.toLowerCase().includes(selectedMember.label.toLowerCase());
      }
      return false;
    };

    const buildRxCard = (args: {
      snapshotId: number;
      aptId: number;
      doctorName?: string | null;
      remedyCount?: number | null;
      itemCount?: number | null;
      isExpired?: boolean | null;
      expiresAt?: string | null;
      status: string;
      signedAt: string;
    }): RecordsTimelineItem => {
      const status = String(args.status || '').toUpperCase();
      const isSigned = status === 'SIGNED';
      const isExpired = Boolean(args.isExpired);
      const count = Number(args.remedyCount ?? args.itemCount ?? 0);
      const doctorFull = withDrPrefix(String(args.doctorName || '').trim());
      const doctorShort =
        shortDoctorLabel(String(args.doctorName || '').trim()) || doctorFull;
      const dateStr = formatWhen(args.signedAt);
      const expiresStr = formatWhen(args.expiresAt);

      const titleText =
        count > 0
          ? t('recordsRxMedicinesTitle').replace('{count}', String(count))
          : t('recordsPrescription');

      const metaParts: string[] = [];
      if (dateStr) metaParts.push(dateStr);
      if (isSigned && doctorShort) {
        metaParts.push(
          t('recordsRxSignedBy').replace('{name}', doctorShort),
        );
      } else if (doctorShort) {
        metaParts.push(doctorShort);
      } else if (status) {
        metaParts.push(status);
      }
      if (expiresStr) {
        metaParts.push(
          isExpired
            ? t('recordsRxExpiredOn').replace('{date}', expiresStr)
            : t('recordsRxExpires').replace('{date}', expiresStr),
        );
      }

      return {
        id: `erx-${args.snapshotId || args.aptId}`,
        kind: 'prescription',
        titleKey: 'recordsPrescription',
        metaKey: 'recordsRxMeta',
        titleText,
        metaText: metaParts.join(' · ') || t('recordsRxMeta'),
        // Keep the simple Active/Expired pill card (not the demo status-strip layout).
        badgeKey: isExpired
          ? 'recordsRxExpired'
          : isSigned
            ? 'recordsRxActive'
            : undefined,
        rxStatus: isExpired ? undefined : isSigned ? 'active' : undefined,
        patientAppId: args.aptId || null,
        erxSnapshotId: args.snapshotId || null,
        occurredAt: args.signedAt || null,
      };
    };

    // 1. Consultations (Timeline appointments)
    const timelineData = timelineResponse?.data as Record<string, unknown> | undefined;
    const appointments = (timelineData?.appointments ?? timelineData?.Appointments) as unknown[];
    if (Array.isArray(appointments)) {
      for (const rawApp of appointments) {
        const app = rawApp as Record<string, unknown>;
        const refId = Number(app.refId ?? app.RefId ?? app.patientAppId ?? app.PatientAppId);
        const at = String(app.at ?? app.At ?? app.appointmentDate ?? app.AppointmentDate ?? '');
        const title = String(app.title ?? app.Title ?? app.status ?? app.Status ?? '');
        const doctorName = String(
          app.doctorName ?? app.DoctorName ?? '',
        ).trim();
        const appointmentType = String(
          app.appointmentType ?? app.AppointmentType ?? '',
        ).trim();
        const consultationCompleted = Boolean(
          app.consultationCompleted ?? app.ConsultationCompleted,
        );
        const prescriptionSigned = Boolean(
          app.prescriptionSigned ?? app.PrescriptionSigned,
        );
        const doctorLabel = withDrPrefix(doctorName);
        const titleText = doctorLabel
          ? t('recordsConsultWithDoctor').replace('{name}', doctorLabel)
          : t('recordsConsultation');
        const typeLabel = mapAppointmentTypeLabel(appointmentType, t);
        const dateStr = formatWhen(at);
        const metaParts = [dateStr, typeLabel].filter(Boolean);
        const showNoteSigned =
          prescriptionSigned ||
          (consultationCompleted && title.toUpperCase() === 'COMPLETED');

        serverItems.push({
          id: `app-${refId}`,
          kind: 'consultation',
          titleKey: 'recordsConsultation',
          metaKey: 'recordsConsultMeta',
          titleText,
          metaText: metaParts.join(' · ') || t('recordsConsultMeta'),
          badgeKey: showNoteSigned ? 'recordsNoteSigned' : undefined,
          patientAppId: refId,
          occurredAt: at || null,
        });
      }
    }

    // 2. Prescriptions — Timeline first (richer fields), then Erx/History for gaps
    const seenSnapshots = new Set<number>();
    const seenAptIds = new Set<number>();

    const rxFromTimeline = (timelineData?.prescriptions ?? timelineData?.Prescriptions) as unknown[];
    if (Array.isArray(rxFromTimeline)) {
      for (const rawRx of rxFromTimeline) {
        const rx = rawRx as Record<string, unknown>;
        const snapshotId = Number(rx.erxSnapshotId ?? rx.ErxSnapshotId);
        const aptId = Number(rx.patientAppId ?? rx.PatientAppId);
        const pId = Number(rx.patientId ?? rx.PatientId);
        if (pId > 0 && !matchesMember(pId, null)) continue;
        if (snapshotId > 0 && seenSnapshots.has(snapshotId)) continue;
        if (aptId > 0 && seenAptIds.has(aptId)) continue;
        if (snapshotId > 0) seenSnapshots.add(snapshotId);
        if (aptId > 0) seenAptIds.add(aptId);

        serverItems.push(
          buildRxCard({
            snapshotId,
            aptId,
            doctorName: String(rx.doctorName ?? rx.DoctorName ?? ''),
            remedyCount: Number(rx.remedyCount ?? rx.RemedyCount ?? 0) || null,
            isExpired: Boolean(rx.isExpired ?? rx.IsExpired),
            expiresAt: String(rx.expiresAt ?? rx.ExpiresAt ?? '') || null,
            status: String(rx.status ?? rx.Status ?? ''),
            signedAt: String(rx.signedAt ?? rx.SignedAt ?? ''),
          }),
        );
      }
    }

    const rxFromList = prescriptionsListResponse?.data ?? [];
    if (Array.isArray(rxFromList)) {
      for (const rx of rxFromList) {
        if (!matchesMember(rx.patientId, null)) continue;
        const snapshotId = Number(rx.erxSnapshotId);
        const aptId = Number(rx.patientAppId);
        if (snapshotId > 0 && seenSnapshots.has(snapshotId)) continue;
        if (aptId > 0 && seenAptIds.has(aptId)) continue;
        if (snapshotId > 0) seenSnapshots.add(snapshotId);
        if (aptId > 0) seenAptIds.add(aptId);

        const itemCount =
          rx.itemCount ??
          (Array.isArray(rx.items) ? rx.items.length : null);

        serverItems.push(
          buildRxCard({
            snapshotId,
            aptId,
            doctorName: rx.doctorName,
            itemCount,
            status: rx.status,
            signedAt: rx.signedAt,
          }),
        );
      }
    }

    // 3. Documents (already scoped by GET patientId — do not mix members)
    const docs = documentsResponse?.data;
    if (Array.isArray(docs)) {
      const typeLabel = (raw: string | null | undefined): string => {
        const value = String(raw || '').trim();
        const key = value.toLowerCase();
        if (key === 'report') return t('uploadDocTypeReport');
        if (key === 'labreport' || key === 'lab') return t('uploadDocTypeLabReport');
        if (key === 'prescription' || key === 'priscription' || key === 'rx') {
          return t('uploadDocTypePrescription');
        }
        if (key === 'invoice') return t('uploadDocTypeInvoice');
        if (key === 'other' || !value) return t('uploadDocTypeOther');
        return value;
      };

      for (const doc of docs) {
        if (
          selectedMemberId !== 'all' &&
          doc.patientId != null &&
          !matchesMember(doc.patientId, null)
        ) {
          continue;
        }
        const title = (doc.fileName || '').trim();
        const uploaded = doc.uploadedAt || doc.createdAt || '';
        const dateStr = uploaded ? formatWhen(uploaded) : '';
        const typeStr = typeLabel(doc.documentType);
        const metaParts = [
          typeStr,
          dateStr
            ? t('recordsDocUploaded').replace('{date}', dateStr)
            : '',
        ].filter(Boolean);
        const description = String(doc.description || '').trim();
        serverItems.push({
          id: `doc-${doc.documentId}`,
          kind: 'document',
          titleKey: 'recordsDocTitle',
          metaKey: 'recordsDocMeta',
          titleText: title || undefined,
          metaText: metaParts.join(' · ') || undefined,
          descriptionText: description || undefined,
          documentId: doc.documentId,
          occurredAt: uploaded || null,
        });
      }
    }

    // 4. Follow-up tasks
    const followUps = followUpsResponse?.data;
    if (Array.isArray(followUps)) {
      for (const task of followUps) {
        if (!matchesMember(task.patientId, null)) continue;
        const isDone = task.status === 'DONE';
        const dateStr = task.dueDate ? formatWhen(task.dueDate) : '';
        serverItems.push({
          id: `task-${task.followUpTaskId}`,
          kind: 'followup',
          titleKey: (task.title || 'Follow-Up Task') as TranslationKey,
          metaKey: (dateStr ? `Due: ${dateStr}` : 'recordsFollowUpMeta') as TranslationKey,
          badgeKey: isDone ? 'followUpBadgeOnTrack' : 'followUpBadgePending',
          occurredAt: task.dueDate || null,
        });
      }
    }

    serverItems.sort((a, b) => {
      const aTime = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
      const bTime = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });

    return serverItems;
  }, [
    isAuthenticated,
    selectedMemberId,
    targetPatientId,
    selectedMember?.label,
    authUser?.patientName,
    timelineResponse?.data,
    prescriptionsListResponse?.data,
    documentsResponse?.data,
    followUpsResponse?.data,
    language,
    t,
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
      const deleted = await deleteDocument(confirmDeleteDocId).unwrap();
      if (!getApiBodyMessage(deleted)) {
        setToastMessage('Document deleted successfully.');
        setToastVariant('success');
      }
      setConfirmDeleteDocId(null);
      setConfirmDeleteDocName('');
    } catch (err: unknown) {
      console.warn('[deleteDocument] Failed:', err);
      if (!getApiErrorMessage(err)) {
        setToastMessage('Could not delete document.');
        setToastVariant('error');
      }
    }
  };

  const onCancelDeleteDocument = () => {
    setConfirmDeleteDocId(null);
    setConfirmDeleteDocName('');
  };

  const onViewDocument = useCallback(
    async (documentId: number) => {
      if (!Number.isFinite(documentId) || documentId <= 0) return;
      if (documentDownloadBusyRef.current) return;
      documentDownloadBusyRef.current = true;
      setIsDownloadingDocument(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setToastMessage('Sign in to download documents.');
          setToastVariant('error');
          return;
        }

        const meta = documentsResponse?.data?.find(
          (doc) => Number(doc.documentId) === Number(documentId),
        );
        const fileName = sanitizeDocumentFileName(
          meta?.fileName,
          documentId,
          meta?.mime,
        );
        const url = resolvePatientDocumentUrl(documentId);

        const dir = new Directory(Paths.cache, 'patient-docs');
        if (!dir.exists) {
          dir.create();
        }
        const destination = new File(dir, fileName);
        // Auth-required binary — same idea as Erx PDF, but Documents has no
        // ticketed public URL yet, so download with Bearer into cache then share.
        const downloaded = await File.downloadFileAsync(url, destination, {
          headers: { Authorization: `Bearer ${token}` },
          idempotent: true,
        });

        await Share.share({
          url: downloaded.uri,
          message: fileName,
          title: fileName,
        });
      } catch (err) {
        console.warn('[onViewDocument] Failed:', err);
        if (!getApiErrorMessage(err)) {
          setToastMessage('Could not download document. Please try again.');
          setToastVariant('error');
        }
      } finally {
        documentDownloadBusyRef.current = false;
        setIsDownloadingDocument(false);
      }
    },
    [documentsResponse?.data],
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
    isLoading,
    isPendingMember,
    fabOpen,
    consultationRecordOpen,
    prescriptionOpen,
    activePatientAppId,
    activeErxSnapshotId,
    activePatientId: targetPatientId,
    uploadDocumentOpen,
    confirmDeleteDocId,
    confirmDeleteDocName,
    isDeletingDocument,
    isDownloadingDocument,
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
      const firstRx = items.find((i) => i.kind === 'prescription' && (i.patientAppId || i.erxSnapshotId));
      setActivePatientAppId(firstRx?.patientAppId ?? null);
      setActiveErxSnapshotId(firstRx?.erxSnapshotId ?? null);
      setPrescriptionOpen(true);
    },
    onClosePrescription: () => {
      setPrescriptionOpen(false);
      setActivePatientAppId(null);
      setActiveErxSnapshotId(null);
    },
    onOrderPrescription: (itemId) => {
      const row = items.find((i) => i.id === itemId);
      const erxSnapshotId = Number(row?.erxSnapshotId);
      if (!Number.isFinite(erxSnapshotId) || erxSnapshotId <= 0) return;
      onOpenOrderMedicines?.({
        erxSnapshotId,
        patientAppId:
          row?.patientAppId != null && row.patientAppId > 0
            ? row.patientAppId
            : null,
      });
    },
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
      setActiveErxSnapshotId(row?.erxSnapshotId ?? null);
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
