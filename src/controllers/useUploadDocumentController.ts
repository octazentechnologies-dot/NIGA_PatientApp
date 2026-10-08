import { useEffect, useMemo, useState } from 'react';

import {
  BOOKING_MEMBERS,
  resolveBookingMembers,
  type BookingMember,
} from '../config/appointmentSlots';
import type { PatientDocument } from '../config/patientDocuments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
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

function makeUploadingFile(kind: PatientDocument['kind'], name: string): PatientDocument {
  return {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    sizeLabel: kind === 'pdf' ? '1.1 MB' : '820 KB',
    kind,
    status: 'uploading',
    progress: 0.15,
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
  const [memberId, setMemberId] = useState<UploadMemberId>('aarav');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [files, setFiles] = useState<PatientDocument[]>([]);
  const [docType, setDocType] = useState<UploadDocTypeId | null>(null);
  const [docTypePickerOpen, setDocTypePickerOpen] = useState(false);
  const [docDate, setDocDate] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<UploadVisibility>('doctors');

  useEffect(() => {
    if (!active) {
      setMemberId('aarav');
      setMemberPickerOpen(false);
      setFiles([]);
      setDocType(null);
      setDocTypePickerOpen(false);
      setDocDate('');
      setNotes('');
      setVisibility('doctors');
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }
    const uploading = files.filter((file) => file.status === 'uploading');
    if (uploading.length === 0) {
      return;
    }
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.status !== 'uploading') {
            return file;
          }
          const next = Math.min(1, (file.progress ?? 0) + 0.2);
          if (next >= 1) {
            return { ...file, status: 'ready', progress: 1 };
          }
          return { ...file, progress: next };
        }),
      );
    }, 400);
    return () => clearInterval(timer);
  }, [active, files]);

  const readyCount = useMemo(
    () => files.filter((file) => file.status === 'ready').length,
    [files],
  );

  const addDemoFile = (kind: PatientDocument['kind']) => {
    const name =
      kind === 'pdf'
        ? 'blood_report_aug.pdf'
        : kind === 'image'
          ? 'rash_arm.jpg'
          : 'capture.jpg';
    setFiles((prev) => {
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, makeUploadingFile(kind === 'pdf' ? 'pdf' : 'image', name)];
    });
  };

  const authUser = useAppSelector((state) => state.auth.user);
  const patientFullName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const { data: familyResponse } = useGetFamilyQuery();
  const apiFamily = familyResponse?.data;

  const members = useMemo(
    () => resolveBookingMembers(patientFullName, undefined, apiFamily),
    [patientFullName, apiFamily],
  );

  const member =
    members.find((item) => item.id === memberId) ?? members[0];
  const memberLabel = member.name;

  return {
    language,
    t,
    memberId,
    memberLabel,
    members,
    memberPickerOpen,
    files,
    readyCount,
    canSave: readyCount > 0,
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
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onAddMember: () => {
      setMemberPickerOpen(false);
    },
    onTakePhoto: () => addDemoFile('image'),
    onPickGallery: () => addDemoFile('image'),
    onPickFile: () => addDemoFile('pdf'),
    onCancelUpload: (id) => {
      setFiles((prev) => prev.filter((file) => file.id !== id));
    },
    onOpenFileMenu: (_id: string) => undefined,
    onOpenDocTypePicker: () => setDocTypePickerOpen(true),
    onCloseDocTypePicker: () => setDocTypePickerOpen(false),
    onSelectDocType: (id) => {
      setDocType(id);
      setDocTypePickerOpen(false);
    },
    onChangeDocDate: setDocDate,
    onChangeNotes: setNotes,
    onSelectVisibility: setVisibility,
    onCancel: onClose,
    onSave: () => {
      const ready = files.filter((file) => file.status === 'ready');
      if (ready.length === 0) {
        return;
      }
      onSaved(ready);
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
