import { useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import {
  BOOKING_MEMBERS,
  resolveBookingMembers,
  type BookingMember,
} from '../config/appointmentSlots';
import type { PatientDocument } from '../config/patientDocuments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';
import { useUploadDocumentMutation } from '../store/api/new/recordsApi';
import { useAppSelector } from '../store/hooks';

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

export type UploadDocTypeId =
  | 'report'
  | 'prescription'
  | 'photo'
  | 'discharge'
  | 'other';

export type UploadVisibility = 'doctors' | 'private';

export type UploadMemberId = (typeof BOOKING_MEMBERS)[number]['id'];

export type UploadDocumentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: UploadMemberId;
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
  onSelectMember: (id: UploadMemberId) => void;
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
  report: 'uploadDocTypeReport',
  prescription: 'uploadDocTypePrescription',
  photo: 'uploadDocTypePhoto',
  discharge: 'uploadDocTypeDischarge',
  other: 'uploadDocTypeOther',
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

export function useUploadDocumentController({
  active,
  onClose,
  onSaved,
}: {
  active: boolean;
  onClose: () => void;
  onSaved: (files: PatientDocument[]) => void;
}): UploadDocumentViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState<UploadMemberId>('self');
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
    }
  }, [active]);

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

  const members = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily),
    [patientFullName, apiFamily],
  );

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const memberLabel = member.name;

  const [uploadDocumentApi, { isLoading: saving }] =
    useUploadDocumentMutation();

  const onTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setToastMessage('Camera permission is required.');
      setToastVariant('error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    appendFile(
      makeLocalFile(
        'image',
        asset.fileName || `photo_${Date.now()}.jpg`,
        asset.uri,
        asset.mimeType || 'image/jpeg',
        asset.fileSize,
      ),
    );
  };

  const onPickGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setToastMessage('Photo library permission is required.');
      setToastVariant('error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    appendFile(
      makeLocalFile(
        'image',
        asset.fileName || `image_${Date.now()}.jpg`,
        asset.uri,
        asset.mimeType || 'image/jpeg',
        asset.fileSize,
      ),
    );
  };

  const onPickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const isPdf =
      (asset.mimeType || '').includes('pdf') ||
      (asset.name || '').toLowerCase().endsWith('.pdf');
    appendFile(
      makeLocalFile(
        isPdf ? 'pdf' : 'image',
        asset.name || `file_${Date.now()}`,
        asset.uri,
        asset.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg'),
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
        setToastMessage('Sign in to upload documents.');
        setToastVariant('error');
        return;
      }
      const uploaded: PatientDocument[] = [];
      for (const file of ready) {
        try {
          // Expo's fetch rejects RN `{ uri, name, type }` FormData parts —
          // use expo-file-system File (Blob with bytes()) instead.
          const fsFile = new File(file.uri);
          const formData = new FormData();
          formData.append('file', fsFile as unknown as Blob, file.name);
          await uploadDocumentApi(formData).unwrap();
          uploaded.push(file);
        } catch (err: unknown) {
          console.warn('[uploadDocumentApi] Failed:', err);
          const errMsg =
            err && typeof err === 'object' && 'data' in err
              ? (err as { data?: { message?: string } }).data?.message
              : undefined;
          setToastMessage(errMsg || 'Upload failed. Please try again.');
          setToastVariant('error');
          return;
        }
      }
      onSaved(uploaded);
      onClose();
    },
  };
}

export const UPLOAD_DOC_TYPES: UploadDocTypeId[] = [
  'report',
  'prescription',
  'photo',
  'discharge',
  'other',
];

export { DOC_TYPE_KEYS };
