import { useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import {
  resolveBookingMembers,
  type BookingMember,
} from '../config/appointmentSlots';
import type { PatientDocument } from '../config/patientDocuments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import {
  useUploadDocumentMutation,
  type PatientDocumentType,
} from '../store/api/new/recordsApi';
import { useAppSelector } from '../store/hooks';
import { getApiErrorMessage } from '../utilities/toast';

function formatDocDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDocDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** UI ids map 1:1 to API `documentType` values. */
export type UploadDocTypeId = PatientDocumentType;

export type UploadVisibility = 'doctors' | 'private';

export type UploadDocumentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: string;
  memberLabel: string;
  members: BookingMember[];
  memberPickerOpen: boolean;
  files: PatientDocument[];
  readyCount: number;
  canSave: boolean;
  saving: boolean;
  docType: UploadDocTypeId | null;
  docTypeLabel: string;
  docTypePickerOpen: boolean;
  docDate: string;
  datePickerOpen: boolean;
  datePickerValue: Date;
  notes: string;
  visibility: UploadVisibility;
  toastMessage: string | null;
  toastVariant: 'error' | 'success';
  onDismissToast: () => void;
  onClose: () => void;
  onHelp: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: string) => void;
  onAddMember: () => void;
  onTakePhoto: () => void;
  onPickGallery: () => void;
  onPickFile: () => void;
  onCancelUpload: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onOpenDocTypePicker: () => void;
  onCloseDocTypePicker: () => void;
  onSelectDocType: (id: UploadDocTypeId) => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onConfirmDocDate: (date: Date) => void;
  onChangeNotes: (value: string) => void;
  onSelectVisibility: (value: UploadVisibility) => void;
  onCancel: () => void;
  onSave: () => void;
};

const DOC_TYPE_KEYS: Record<UploadDocTypeId, TranslationKey> = {
  Report: 'uploadDocTypeReport',
  LabReport: 'uploadDocTypeLabReport',
  Prescription: 'uploadDocTypePrescription',
  Invoice: 'uploadDocTypeInvoice',
  Other: 'uploadDocTypeOther',
};

type LocalFile = PatientDocument & {
  uri: string;
  mimeType: string;
};

function makeLocalFile(
  kind: PatientDocument['kind'],
  name: string,
  uri: string,
  mimeType: string,
  sizeBytes?: number | null,
): LocalFile {
  const sizeLabel =
    sizeBytes != null && sizeBytes > 0
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : '';
  return {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    sizeLabel,
    kind,
    status: 'ready',
    progress: 1,
    uri,
    mimeType,
  };
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function isAllowedMime(mime: string, name: string): boolean {
  const lower = (mime || '').toLowerCase();
  const file = (name || '').toLowerCase();
  if (
    lower.includes('pdf') ||
    lower.includes('jpeg') ||
    lower.includes('jpg') ||
    lower.includes('png')
  ) {
    return true;
  }
  return (
    file.endsWith('.pdf') ||
    file.endsWith('.jpg') ||
    file.endsWith('.jpeg') ||
    file.endsWith('.png')
  );
}

export function useUploadDocumentController({
  active,
  onClose,
  onSaved,
  initialMemberId,
}: {
  active: boolean;
  onClose: () => void;
  onSaved: (files: PatientDocument[]) => void;
  /** Health-records selected member id (`self` or family patientId string). */
  initialMemberId?: string | null;
}): UploadDocumentViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [docType, setDocType] = useState<UploadDocTypeId | null>(null);
  const [docTypePickerOpen, setDocTypePickerOpen] = useState(false);
  const [docDate, setDocDate] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<UploadVisibility>('doctors');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'error' | 'success'>('error');

  useEffect(() => {
    if (!active) {
      setMemberId('self');
      setMemberPickerOpen(false);
      setFiles([]);
      setDocType(null);
      setDocTypePickerOpen(false);
      setDocDate('');
      setDatePickerOpen(false);
      setNotes('');
      setVisibility('doctors');
      setToastMessage(null);
      return;
    }
    const next =
      initialMemberId &&
      initialMemberId !== 'all' &&
      String(initialMemberId).length > 0
        ? String(initialMemberId)
        : 'self';
    setMemberId(next);
  }, [active, initialMemberId]);

  const readyCount = useMemo(
    () => files.filter((file) => file.status === 'ready').length,
    [files],
  );

  const appendFile = (file: LocalFile) => {
    setFiles((prev) => {
      if (prev.length >= 10) return prev;
      return [...prev, file];
    });
  };

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const authPatientId = useAppSelector((state) => state.auth.patientId);
  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !isAuthenticated,
  });
  const patientFullName =
    homeDashboardResponse?.data?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !isAuthenticated,
  });
  const apiFamily = familyResponse?.data;

  const selfPatientId =
    authPatientId != null && authPatientId > 0
      ? authPatientId
      : authUser?.patientId != null && authUser.patientId > 0
        ? authUser.patientId
        : null;

  const members = useMemo(
    () =>
      resolveBookingMembers(
        patientFullName,
        undefined,
        apiFamily,
        selfPatientId,
      ),
    [patientFullName, apiFamily, selfPatientId],
  );

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const memberLabel = member?.name || t('uploadDocMemberSelf');

  const uploadPatientId = useMemo(() => {
    if (!member || member.self || memberId === 'self') {
      return null;
    }
    const id = Number(member.patientId ?? member.memberPatientId ?? memberId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [member, memberId]);

  const [uploadDocumentApi, { isLoading: saving }] =
    useUploadDocumentMutation();

  const onTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setToastMessage(t('genericError'));
      setToastVariant('error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const name = asset.fileName || `photo_${Date.now()}.jpg`;
    const mime = asset.mimeType || 'image/jpeg';
    if (!isAllowedMime(mime, name)) {
      setToastMessage(t('uploadDocLimits'));
      setToastVariant('error');
      return;
    }
    if (asset.fileSize != null && asset.fileSize > MAX_FILE_BYTES) {
      setToastMessage(t('uploadDocLimits'));
      setToastVariant('error');
      return;
    }
    appendFile(
      makeLocalFile('image', name, asset.uri, mime, asset.fileSize),
    );
  };

  const onPickGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setToastMessage(t('genericError'));
      setToastVariant('error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const name = asset.fileName || `image_${Date.now()}.jpg`;
    const mime = asset.mimeType || 'image/jpeg';
    if (!isAllowedMime(mime, name)) {
      setToastMessage(t('uploadDocLimits'));
      setToastVariant('error');
      return;
    }
    if (asset.fileSize != null && asset.fileSize > MAX_FILE_BYTES) {
      setToastMessage(t('uploadDocLimits'));
      setToastVariant('error');
      return;
    }
    appendFile(
      makeLocalFile('image', name, asset.uri, mime, asset.fileSize),
    );
  };

  const onPickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const name = asset.name || `file_${Date.now()}`;
    const isPdf =
      (asset.mimeType || '').includes('pdf') ||
      name.toLowerCase().endsWith('.pdf');
    const mime =
      asset.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg');
    if (!isAllowedMime(mime, name)) {
      setToastMessage(t('uploadDocLimits'));
      setToastVariant('error');
      return;
    }
    if (asset.size != null && asset.size > MAX_FILE_BYTES) {
      setToastMessage(t('uploadDocLimits'));
      setToastVariant('error');
      return;
    }
    appendFile(
      makeLocalFile(
        isPdf ? 'pdf' : 'image',
        name,
        asset.uri,
        mime,
        asset.size,
      ),
    );
  };

  return {
    language,
    t,
    memberId,
    memberLabel,
    members,
    memberPickerOpen,
    files,
    readyCount,
    canSave: readyCount > 0 && !saving,
    saving,
    docType,
    docTypeLabel: docType ? t(DOC_TYPE_KEYS[docType]) : '',
    docTypePickerOpen,
    docDate,
    datePickerOpen,
    datePickerValue: parseDocDate(docDate) ?? new Date(),
    notes,
    visibility,
    toastMessage,
    toastVariant,
    onDismissToast: () => setToastMessage(null),
    onClose,
    onHelp: () => undefined,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (next) => {
      setMemberId(next);
      setMemberPickerOpen(false);
    },
    onAddMember: () => {
      setMemberPickerOpen(false);
    },
    onTakePhoto: () => {
      void onTakePhoto();
    },
    onPickGallery: () => {
      void onPickGallery();
    },
    onPickFile: () => {
      void onPickFile();
    },
    onCancelUpload: (fileId) => {
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    },
    onRemoveFile: (fileId) => {
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    },
    onOpenDocTypePicker: () => setDocTypePickerOpen(true),
    onCloseDocTypePicker: () => setDocTypePickerOpen(false),
    onSelectDocType: (next) => {
      setDocType(next);
      setDocTypePickerOpen(false);
    },
    onOpenDatePicker: () => setDatePickerOpen(true),
    onCloseDatePicker: () => setDatePickerOpen(false),
    onConfirmDocDate: (date) => {
      setDocDate(formatDocDate(date));
      setDatePickerOpen(false);
    },
    onChangeNotes: setNotes,
    onSelectVisibility: setVisibility,
    onCancel: onClose,
    onSave: async () => {
      const ready = files.filter((file) => file.status === 'ready');
      if (ready.length === 0 || saving) {
        return;
      }
      if (!isAuthenticated) {
        setToastMessage(t('genericError'));
        setToastVariant('error');
        return;
      }
      const uploaded: PatientDocument[] = [];
      const documentType: PatientDocumentType = docType ?? 'Other';
      const description = notes.trim().slice(0, 500) || null;
      for (const file of ready) {
        try {
          // Expo's fetch rejects RN `{ uri, name, type }` FormData parts —
          // use expo-file-system File (Blob with bytes()) instead.
          const fsFile = new File(file.uri);
          await uploadDocumentApi({
            file: fsFile as unknown as Blob,
            fileName: file.name,
            mimeType: file.mimeType,
            patientId: uploadPatientId,
            documentType,
            description,
          }).unwrap();
          uploaded.push(file);
        } catch (err: unknown) {
          console.warn('[uploadDocumentApi] Failed:', err);
          if (!getApiErrorMessage(err)) {
            setToastMessage(t('genericError'));
            setToastVariant('error');
          }
          return;
        }
      }
      onSaved(uploaded);
      onClose();
    },
  };
}

export const UPLOAD_DOC_TYPES: UploadDocTypeId[] = [
  'Report',
  'LabReport',
  'Prescription',
  'Invoice',
  'Other',
];

export { DOC_TYPE_KEYS };
