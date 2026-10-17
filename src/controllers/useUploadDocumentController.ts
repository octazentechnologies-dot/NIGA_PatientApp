import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
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
  notes: string;
  visibility: UploadVisibility;
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
  onOpenFileMenu: (id: string) => void;
  onOpenDocTypePicker: () => void;
  onCloseDocTypePicker: () => void;
  onSelectDocType: (id: UploadDocTypeId) => void;
  onChangeDocDate: (value: string) => void;
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
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<UploadVisibility>('doctors');

  useEffect(() => {
    if (!active) {
      setMemberId('self');
      setMemberPickerOpen(false);
      setFiles([]);
      setDocType(null);
      setDocTypePickerOpen(false);
      setDocDate('');
      setNotes('');
      setVisibility('doctors');
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
      Alert.alert(t('genericError'), 'Camera permission is required.');
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
      Alert.alert(t('genericError'), 'Photo library permission is required.');
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
    notes,
    visibility,
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
    onOpenFileMenu: (_id: string) => undefined,
    onOpenDocTypePicker: () => setDocTypePickerOpen(true),
    onCloseDocTypePicker: () => setDocTypePickerOpen(false),
    onSelectDocType: (next) => {
      setDocType(next);
      setDocTypePickerOpen(false);
    },
    onChangeDocDate: setDocDate,
    onChangeNotes: setNotes,
    onSelectVisibility: setVisibility,
    onCancel: onClose,
    onSave: async () => {
      const ready = files.filter((file) => file.status === 'ready');
      if (ready.length === 0 || saving) {
        return;
      }
      if (!isAuthenticated) {
        Alert.alert(t('genericError'), 'Sign in to upload documents.');
        return;
      }
      const uploaded: PatientDocument[] = [];
      for (const file of ready) {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          } as unknown as Blob);
          if (docType) {
            formData.append('docType', docType);
          }
          if (notes.trim()) {
            formData.append('notes', notes.trim());
          }
          await uploadDocumentApi(formData).unwrap();
          uploaded.push(file);
        } catch (err) {
          console.warn('[uploadDocumentApi] Failed:', err);
          Alert.alert(t('genericError'), 'Upload failed. Please try again.');
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
