import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import {
  useGetFamilyQuery,
  useGetRelationsQuery,
  useCreateFamilyMemberMutation,
  useUpdateFamilyMemberMutation,
  useDeleteFamilyMemberMutation,
  type ApiFamilyMember,
  type ApiRelation,
  type CreateFamilyMemberRequest,
  type UpdateFamilyMemberRequest,
} from '../store/api/new/familyApi';
import {
  useGetGendersQuery,
  type GenderMaster,
} from '../store/api/new/completeProfileApi';
import type {
  FamilyMember,
  FamilyMemberStatus,
  FamilyRelationship,
  FamilySelf,
  GenderOption,
} from '../models/family';
import {
  ageFromDate,
  defaultBirthDate,
  formatDateOfBirth,
  initialsFromName,
  maskDateOfBirth,
  parseDateOfBirth,
} from '../utilities/dateOfBirth';
import { getRelationDisplayName } from '../utilities/familyHelpers';

const RELATIONSHIPS: FamilyRelationship[] = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'other',
];

const SEED_MEMBERS: FamilyMember[] = [];

export type FamilyMembersViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  variant: 'onboarding' | 'account';
  sheetMode: 'add' | 'edit';
  self: FamilySelf;
  selfMeta: string;
  members: FamilyMember[];
  memberMeta: (member: FamilyMember) => string;
  statusLabel: (member: FamilyMember) => string;
  relationshipLabel: (relationship: FamilyRelationship) => string;
  addSheetOpen: boolean;
  helpOpen: boolean;
  datePickerOpen: boolean;
  datePickerValue: Date;
  relationshipPickerOpen: boolean;
  memberMenuId: string | null;
  fullName: string;
  dateOfBirth: string;
  gender: GenderOption | null;
  relationship: FamilyRelationship | null;
  mobileNumber: string;
  authorizedToManage: boolean;
  canSubmit: boolean;
  onOpenAddSheet: () => void;
  onCloseAddSheet: () => void;
  onOpenHelp: () => void;
  onCloseHelp: () => void;
  onChangeFullName: (value: string) => void;
  onChangeDateOfBirth: (value: string) => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onConfirmDateOfBirth: (date: Date) => void;
  genderPickerOpen: boolean;
  onOpenGenderPicker: () => void;
  onCloseGenderPicker: () => void;
  onSelectGender: (value: GenderOption | number) => void;
  onOpenRelationshipPicker: () => void;
  onCloseRelationshipPicker: () => void;
  onSelectRelationship: (value: FamilyRelationship) => void;
  apiRelations: ApiRelation[];
  selectedRelationId: number | null;
  selectedRelationName: string;
  onSelectRelation: (relation: ApiRelation) => void;
  apiGenders: GenderMaster[];
  selectedGenderId: number | null;
  isRelationsLoading: boolean;
  isGendersLoading: boolean;
  isCreatingMember: boolean;
  isDeletingMember: boolean;
  onChangeMobileNumber: (value: string) => void;
  onToggleAuthorizedToManage: () => void;
  onSubmitMember: () => void;
  onOpenMemberMenu: (memberId: string) => void;
  onCloseMemberMenu: () => void;
  onEditMember: (memberId?: string) => void;
  onRemoveMember: (memberId?: string) => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
  relationships: FamilyRelationship[];
  isFamilyLoading: boolean;
  isFamilyError: boolean;
  refetchFamily: () => void;
};

function relationshipKey(
  relationship: FamilyRelationship,
): TranslationKey {
  switch (relationship) {
    case 'spouse':
      return 'relationshipSpouse';
    case 'child':
      return 'relationshipChild';
    case 'parent':
      return 'relationshipParent';
    case 'sibling':
      return 'relationshipSibling';
    case 'other':
      return 'relationshipOther';
  }
}

function genderKey(gender: GenderOption): TranslationKey {
  switch (gender) {
    case 'female':
      return 'genderFemale';
    case 'male':
      return 'genderMale';
    case 'other':
      return 'genderOther';
  }
}

function statusKey(status: FamilyMember['status']): TranslationKey {
  switch (status) {
    case 'guardian':
      return 'familyGuardianBadge';
    case 'pending':
      return 'familyPendingBadge';
    case 'authorized':
      return 'familyAuthorizedBadge';
  }
}

function mapApiMemberToFamilyMember(
  item: ApiFamilyMember,
  index: number,
): FamilyMember {
  const name = item.patientName || '';
  const initials = initialsFromName(name);
  const rawRelation = String(
    item.relation ||
    item.relationName ||
    item.relationship ||
    item.relationshipType ||
    '',
  );
  const relStr = rawRelation.toLowerCase();
  let relationship: FamilyRelationship = 'other';
  if (
    relStr.includes('spouse') ||
    relStr.includes('wife') ||
    relStr.includes('husband')
  ) {
    relationship = 'spouse';
  } else if (
    relStr.includes('child') ||
    relStr.includes('son') ||
    relStr.includes('daughter')
  ) {
    relationship = 'child';
  } else if (
    relStr.includes('parent') ||
    relStr.includes('mother') ||
    relStr.includes('father')
  ) {
    relationship = 'parent';
  } else if (
    relStr.includes('sibling') ||
    relStr.includes('brother') ||
    relStr.includes('sister')
  ) {
    relationship = 'sibling';
  }

  let gender: GenderOption = 'other';
  if (
    item.gender === 1 ||
    item.gender === 'female' ||
    item.gender === 'Female'
  ) {
    gender = 'female';
  } else if (
    item.gender === 0 ||
    item.gender === 'male' ||
    item.gender === 'Male'
  ) {
    gender = 'male';
  } else if (
    relStr.includes('mother') ||
    relStr.includes('daughter') ||
    relStr.includes('sister') ||
    relStr.includes('wife') ||
    relStr.includes('aunt')
  ) {
    gender = 'female';
  } else if (
    relStr.includes('father') ||
    relStr.includes('son') ||
    relStr.includes('brother') ||
    relStr.includes('husband') ||
    relStr.includes('uncle')
  ) {
    gender = 'male';
  }

  const age =
    typeof item.age === 'number'
      ? item.age
      : item.dateOfBirth
        ? ageFromDate(new Date(item.dateOfBirth))
        : 0;

  const status: FamilyMemberStatus =
    item.status === 'guardian'
      ? 'guardian'
      : item.status === 'pending'
        ? 'pending'
        : 'authorized';

  return {
    id: String(item.familyMemberId || item.id || `fam_${index}`),
    name,
    initials,
    age: Math.max(0, age),
    gender,
    relationship,
    status,
    relationName: rawRelation || undefined,
    relationId: typeof item.relationId === 'number' ? item.relationId : undefined,
    genderId:
      typeof item.genderId === 'number'
        ? item.genderId
        : typeof item.gender === 'number'
          ? item.gender
          : undefined,
    mobileNo: item.mobileNo || item.mobileNumber || item.phoneNumber || undefined,
    memberPatientId:
      typeof item.memberPatientId === 'number'
        ? item.memberPatientId
        : typeof item.patientId === 'number'
          ? item.patientId
          : undefined,
    dateOfBirth: item.dateOfBirth || undefined,
    familyMemberId:
      typeof item.familyMemberId === 'number'
        ? item.familyMemberId
        : Number(item.id) || undefined,
  };
}

export function useFamilyMembersController({
  onBack,
  onContinue,
  onSkip,
  variant = 'onboarding',
}: {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  variant?: 'onboarding' | 'account';
}): FamilyMembersViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [members, setMembers] = useState<FamilyMember[]>(SEED_MEMBERS);
  const {
    data: familyResponse,
    isLoading: isFamilyLoading,
    isError: isFamilyError,
    refetch: refetchFamily,
  } = useGetFamilyQuery();

  const {
    data: apiRelations = [],
    isLoading: isRelationsLoading,
  } = useGetRelationsQuery();

  const {
    data: apiGenders = [],
    isLoading: isGendersLoading,
  } = useGetGendersQuery();

  const [createFamilyMember, { isLoading: isCreatingMember }] =
    useCreateFamilyMemberMutation();
  const [updateFamilyMember, { isLoading: isUpdatingMember }] =
    useUpdateFamilyMemberMutation();
  const [deleteFamilyMember, { isLoading: isDeletingMember }] =
    useDeleteFamilyMemberMutation();
  const isDeletingRef = useRef(false);

  const isSubmittingMember = isCreatingMember || isUpdatingMember;

  useEffect(() => {
    if (familyResponse) {
      if (Array.isArray(familyResponse.data)) {
        setMembers(familyResponse.data.map(mapApiMemberToFamilyMember));
      }
    }
  }, [familyResponse]);

  useEffect(() => {
    if (isFamilyError) {
      console.warn('[GET api/Family] Request failed');
    }
  }, [isFamilyError]);

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [relationshipPickerOpen, setRelationshipPickerOpen] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const [relationship, setRelationship] = useState<FamilyRelationship | null>(
    null,
  );
  const [selectedRelationId, setSelectedRelationId] = useState<number | null>(
    null,
  );
  const [selectedRelationName, setSelectedRelationName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [authorizedToManage, setAuthorizedToManage] = useState(false);

  const parsedDob = parseDateOfBirth(dateOfBirth);
  const age = parsedDob ? ageFromDate(parsedDob) : null;
  const isAdult = age !== null && age >= 18;

  const canSubmit = Boolean(
    !isSubmittingMember &&
    fullName.trim().length > 0 &&
    parsedDob !== null &&
    authorizedToManage &&
    (!mobileNumber.trim() || mobileNumber.trim().length === 10),
  );

  const resetForm = () => {
    setFullName('');
    setDateOfBirth('');
    setGender(null);
    setSelectedGenderId(null);
    setRelationship(null);
    setSelectedRelationId(null);
    setSelectedRelationName('');
    setMobileNumber('');
    setAuthorizedToManage(false);
    setDatePickerOpen(false);
    setGenderPickerOpen(false);
    setRelationshipPickerOpen(false);
  };

  const relationshipLabel = (value: FamilyRelationship) => t(relationshipKey(value));

  const authUser = useAppSelector((state) => state.auth.user);
  const selfName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    familyResponse?.ownerPatientName ||
    '';
  const selfInitials = selfName ? initialsFromName(selfName) : '';

  const selfGender: GenderOption =
    authUser?.gender === 0
      ? 'male'
      : authUser?.gender === 1
        ? 'female'
        : 'other';

  const selfDob = authUser?.dateOfBirth ? new Date(authUser.dateOfBirth) : null;
  const selfAge =
    selfDob && !isNaN(selfDob.getTime()) ? ageFromDate(selfDob) : null;

  const self: FamilySelf = {
    name: selfName,
    initials: selfInitials,
    age: selfAge ?? 0,
    gender: selfGender,
  };

  const selfMeta =
    self.age > 0
      ? `${self.age} ${t('yearsShort')} · ${t(genderKey(self.gender))}`
      : t(genderKey(self.gender));

  const memberMeta = (member: FamilyMember) => {
    const relationStr = member.relationName
      ? getRelationDisplayName(member.relationName, language)
      : relationshipLabel(member.relationship);
    if (member.age > 0) {
      return `${member.age} ${t('yearsShort')} · ${relationStr}`;
    }
    return relationStr;
  };

  const statusLabel = (member: FamilyMember) => t(statusKey(member.status));

  const handleSelectGender = (value: GenderOption | number) => {
    if (typeof value === 'number') {
      setSelectedGenderId(value);
      const match = apiGenders.find((g) => g.genderId === value);
      const lower = (match?.genderName || '').toLowerCase();
      if (lower === 'female' || value === 1) {
        setGender('female');
      } else if (lower === 'male' || value === 0) {
        setGender('male');
      } else {
        setGender('other');
      }
    } else {
      setGender(value);
      const match = apiGenders.find(
        (g) => g.genderName.toLowerCase() === value.toLowerCase(),
      );
      if (match) {
        setSelectedGenderId(match.genderId);
      } else {
        setSelectedGenderId(value === 'male' ? 0 : value === 'female' ? 1 : 2);
      }
    }
    setGenderPickerOpen(false);
  };

  const handleSelectRelation = (rel: ApiRelation) => {
    setSelectedRelationId(rel.relationId);
    setSelectedRelationName(rel.relationName);
    const lower = rel.relationName.toLowerCase();
    if (
      lower.includes('spouse') ||
      lower.includes('wife') ||
      lower.includes('husband')
    ) {
      setRelationship('spouse');
    } else if (
      lower.includes('son') ||
      lower.includes('daughter') ||
      lower.includes('child')
    ) {
      setRelationship('child');
    } else if (
      lower.includes('father') ||
      lower.includes('mother') ||
      lower.includes('parent')
    ) {
      setRelationship('parent');
    } else if (
      lower.includes('brother') ||
      lower.includes('sister') ||
      lower.includes('sibling')
    ) {
      setRelationship('sibling');
    } else {
      setRelationship('other');
    }
    setRelationshipPickerOpen(false);
  };

  const handleSelectRelationship = (value: FamilyRelationship) => {
    setRelationship(value);
    const match = apiRelations.find(
      (r) => r.relationName.toLowerCase() === value.toLowerCase(),
    );
    if (match) {
      setSelectedRelationId(match.relationId);
      setSelectedRelationName(match.relationName);
    } else {
      setSelectedRelationName(t(relationshipKey(value)));
    }
    setRelationshipPickerOpen(false);
  };

  return {
    language,
    t,
    variant,
    sheetMode,
    self,
    selfMeta,
    members,
    memberMeta,
    statusLabel,
    relationshipLabel,
    addSheetOpen,
    helpOpen,
    datePickerOpen,
    datePickerValue: parsedDob ?? defaultBirthDate(),
    relationshipPickerOpen,
    memberMenuId,
    fullName,
    dateOfBirth,
    gender,
    relationship,
    mobileNumber,
    authorizedToManage,
    canSubmit,
    relationships: RELATIONSHIPS,
    apiRelations,
    selectedRelationId,
    selectedRelationName,
    onSelectRelation: handleSelectRelation,
    apiGenders,
    selectedGenderId,
    isRelationsLoading,
    isGendersLoading,
    onOpenAddSheet: () => {
      setSheetMode('add');
      setEditingMemberId(null);
      resetForm();
      setAddSheetOpen(true);
    },
    onCloseAddSheet: () => {
      setAddSheetOpen(false);
      setEditingMemberId(null);
      setSheetMode('add');
      resetForm();
    },
    onOpenHelp: () => setHelpOpen(true),
    onCloseHelp: () => setHelpOpen(false),
    onChangeFullName: setFullName,
    onChangeDateOfBirth: (value) => setDateOfBirth(maskDateOfBirth(value)),
    onOpenDatePicker: () => {
      Keyboard.dismiss();
      setGenderPickerOpen(false);
      setRelationshipPickerOpen(false);
      setDatePickerOpen(true);
    },
    onCloseDatePicker: () => setDatePickerOpen(false),
    onConfirmDateOfBirth: (date) => {
      if (!date) {
        setDatePickerOpen(false);
        return;
      }
      setDateOfBirth(formatDateOfBirth(date));
      setDatePickerOpen(false);
    },
    genderPickerOpen,
    onOpenGenderPicker: () => {
      Keyboard.dismiss();
      setRelationshipPickerOpen(false);
      setDatePickerOpen(false);
      setGenderPickerOpen(true);
    },
    onCloseGenderPicker: () => setGenderPickerOpen(false),
    onSelectGender: handleSelectGender,
    onOpenRelationshipPicker: () => {
      Keyboard.dismiss();
      setGenderPickerOpen(false);
      setDatePickerOpen(false);
      setRelationshipPickerOpen(true);
    },
    onCloseRelationshipPicker: () => setRelationshipPickerOpen(false),
    onSelectRelationship: handleSelectRelationship,
    onChangeMobileNumber: (value) =>
      setMobileNumber(value.replace(/\D/g, '').slice(0, 10)),
    onToggleAuthorizedToManage: () =>
      setAuthorizedToManage((current) => !current),
    onSubmitMember: async () => {
      if (
        !canSubmit ||
        isSubmittingMember ||
        !parsedDob ||
        !authorizedToManage ||
        age === null
      ) {
        return;
      }
      const name = fullName.trim();
      const effectiveGender: GenderOption =
        gender ??
        (selectedGenderId === 0
          ? 'male'
          : selectedGenderId === 1
            ? 'female'
            : 'other');
      const effectiveRelationship: FamilyRelationship =
        relationship ?? 'other';

      const matchedRel = apiRelations.find(
        (r) =>
          r.relationId === selectedRelationId ||
          (selectedRelationName &&
            r.relationName.toLowerCase() ===
            selectedRelationName.toLowerCase()),
      );
      const otherRel = apiRelations.find((r) =>
        r.relationName.toLowerCase().includes('other'),
      );
      const relId =
        selectedRelationId ??
        matchedRel?.relationId ??
        otherRel?.relationId ??
        0;
      const relName =
        selectedRelationName ||
        matchedRel?.relationName ||
        (relationship ? relationshipLabel(relationship) : (otherRel?.relationName || 'Other'));

      const matchedGender = apiGenders.find(
        (g) =>
          g.genderId === selectedGenderId ||
          (gender && g.genderName.toLowerCase() === gender.toLowerCase()),
      );
      const otherGender = apiGenders.find((g) =>
        g.genderName.toLowerCase().includes('other'),
      );
      const gId =
        selectedGenderId ??
        matchedGender?.genderId ??
        (gender === 'male'
          ? 0
          : gender === 'female'
            ? 1
            : (otherGender?.genderId ?? 2));

      const dobIso = new Date(
        Date.UTC(
          parsedDob.getFullYear(),
          parsedDob.getMonth(),
          parsedDob.getDate(),
        ),
      ).toISOString();

      if (sheetMode === 'edit' && editingMemberId) {
        const memberToEdit = members.find((m) => m.id === editingMemberId);
        const targetId =
          memberToEdit?.familyMemberId ??
          (Number(editingMemberId) > 0 ? Number(editingMemberId) : editingMemberId);

        const updatePayload: UpdateFamilyMemberRequest = {
          relationId: relId,
          relation: relName,
          patientName: name,
          mobileNo: mobileNumber.trim(),
          email: '',
          dateOfBirth: dobIso,
          gender: gId,
          age,
        };

        console.log(
          `[UpdateFamilyMember] Request PUT api/Family/${targetId} Payload:`,
          JSON.stringify(updatePayload, null, 2),
        );

        try {
          const res = await updateFamilyMember({
            id: targetId,
            body: updatePayload,
          }).unwrap();
          console.log(
            '[UpdateFamilyMember] Response:',
            JSON.stringify(res, null, 2),
          );
          if (res && res.success === false) {
            const msg =
              res.errorMessage ||
              res.message ||
              t('genericError');
            Alert.alert(language === 'mr' ? 'त्रुटी' : 'Error', msg);
            return;
          }

          refetchFamily();
          setAddSheetOpen(false);
          setEditingMemberId(null);
          setSheetMode('add');
          resetForm();
        } catch (err: unknown) {
          console.error('[UpdateFamilyMember] Error:', err);
          let errorMsg = t('genericError');
          if (
            typeof err === 'object' &&
            err !== null &&
            'data' in err &&
            typeof (err as { data?: unknown }).data === 'object' &&
            (err as { data?: Record<string, unknown> }).data !== null
          ) {
            const data = (err as { data: Record<string, unknown> }).data;
            errorMsg =
              (typeof data.errorMessage === 'string' && data.errorMessage) ||
              (typeof data.message === 'string' && data.message) ||
              errorMsg;
          } else if (err instanceof Error && err.message) {
            errorMsg = err.message;
          }
          Alert.alert(language === 'mr' ? 'त्रुटी' : 'Error', errorMsg);
        }
      } else {
        const authPatientId = authUser?.patientId;
        const effectiveOwnerPatientId =
          authPatientId ?? familyResponse?.ownerPatientId ?? 0;

        const payload: CreateFamilyMemberRequest = {
          ownerPatientId: Number(effectiveOwnerPatientId) || 0,
          relationId: relId,
          relation: relName,
          patientName: name,
          mobileNo: mobileNumber.trim(),
          email: '',
          dateOfBirth: dobIso,
          gender: gId,
          age,
          existingMemberPatientId: 0,
        };

        console.log(
          '[CreateFamilyMember] Request Payload:',
          JSON.stringify(payload, null, 2),
        );

        try {
          const res = await createFamilyMember(payload).unwrap();
          console.log(
            '[CreateFamilyMember] Response:',
            JSON.stringify(res, null, 2),
          );
          if (res && res.success === false) {
            const msg =
              res.errorMessage ||
              res.message ||
              t('genericError');
            Alert.alert(language === 'mr' ? 'त्रुटी' : 'Error', msg);
            return;
          }

          refetchFamily();
          setAddSheetOpen(false);
          setEditingMemberId(null);
          setSheetMode('add');
          resetForm();
        } catch (err: unknown) {
          console.error('[CreateFamilyMember] Error:', err);
          let errorMsg = t('genericError');
          if (
            typeof err === 'object' &&
            err !== null &&
            'data' in err &&
            typeof (err as { data?: unknown }).data === 'object' &&
            (err as { data?: Record<string, unknown> }).data !== null
          ) {
            const data = (err as { data: Record<string, unknown> }).data;
            errorMsg =
              (typeof data.errorMessage === 'string' && data.errorMessage) ||
              (typeof data.message === 'string' && data.message) ||
              errorMsg;
          } else if (err instanceof Error && err.message) {
            errorMsg = err.message;
          }
          Alert.alert(language === 'mr' ? 'त्रुटी' : 'Error', errorMsg);
        }
      }
    },
    onOpenMemberMenu: setMemberMenuId,
    onCloseMemberMenu: () => setMemberMenuId(null),
    onEditMember: (targetMemberId?: string) => {
      const activeId = targetMemberId || memberMenuId;
      if (!activeId) {
        return;
      }
      const member = members.find((item) => item.id === activeId);
      if (!member) {
        return;
      }
      let birthDateToSet: Date;
      if (member.dateOfBirth) {
        birthDateToSet = new Date(member.dateOfBirth);
      } else if (member.age > 0) {
        const approx = new Date();
        approx.setFullYear(approx.getFullYear() - member.age);
        birthDateToSet = approx;
      } else {
        birthDateToSet = new Date();
      }
      setSheetMode('edit');
      setEditingMemberId(member.id);
      setFullName(member.name);
      setDateOfBirth(formatDateOfBirth(birthDateToSet));
      setGender(member.gender);
      if (typeof member.genderId === 'number') {
        setSelectedGenderId(member.genderId);
      } else {
        const matchG = apiGenders.find(
          (g) => g.genderName.toLowerCase() === member.gender,
        );
        setSelectedGenderId(
          matchG
            ? matchG.genderId
            : member.gender === 'male'
              ? 0
              : member.gender === 'female'
                ? 1
                : 2,
        );
      }
      setRelationship(member.relationship);
      if (typeof member.relationId === 'number') {
        setSelectedRelationId(member.relationId);
        setSelectedRelationName(member.relationName || '');
      } else if (member.relationName) {
        setSelectedRelationName(member.relationName);
        const matchR = apiRelations.find(
          (r) =>
            r.relationName.toLowerCase() ===
            (member.relationName || '').toLowerCase(),
        );
        setSelectedRelationId(matchR ? matchR.relationId : null);
      } else {
        const matchR = apiRelations.find(
          (r) => r.relationName.toLowerCase() === member.relationship,
        );
        setSelectedRelationId(matchR ? matchR.relationId : null);
        setSelectedRelationName(
          matchR ? matchR.relationName : member.relationship,
        );
      }
      setMobileNumber(member.mobileNo || '');
      setAuthorizedToManage(true);
      setMemberMenuId(null);
      setAddSheetOpen(true);
    },
    onRemoveMember: async (targetMemberId?: string) => {
      const activeId = targetMemberId || memberMenuId;
      if (!activeId || isDeletingRef.current || isDeletingMember) {
        return;
      }
      const member = members.find((item) => item.id === activeId);
      if (!member) {
        return;
      }
      const targetId =
        member.familyMemberId ??
        (Number(member.id) > 0 ? Number(member.id) : member.id);
      if (!targetId) {
        return;
      }

      setMemberMenuId(null);
      if (isDeletingRef.current) {
        return;
      }
      isDeletingRef.current = true;
      console.log(
        `[DeleteFamilyMember] Request: DELETE api/Family/${targetId}`,
      );
      try {
        const res = await deleteFamilyMember(targetId).unwrap();
        console.log(
          '[DeleteFamilyMember] Response:',
          JSON.stringify(res, null, 2),
        );
        if (res && typeof res === 'object' && res.success === false) {
          const msg =
            res.errorMessage ||
            res.message ||
            t('genericError');
          Alert.alert(language === 'mr' ? 'त्रुटी' : 'Error', msg);
          return;
        }
        setMembers((current) =>
          current.filter((item) => item.id !== member.id),
        );
        refetchFamily();
      } catch (err: unknown) {
        console.error('[DeleteFamilyMember] Error:', err);
        let errorMsg = t('genericError');
        if (
          typeof err === 'object' &&
          err !== null &&
          'data' in err &&
          typeof (err as { data?: unknown }).data === 'object' &&
          (err as { data?: Record<string, unknown> }).data !== null
        ) {
          const data = (err as { data: Record<string, unknown> }).data;
          errorMsg =
            (typeof data.errorMessage === 'string' && data.errorMessage) ||
            (typeof data.message === 'string' && data.message) ||
            errorMsg;
        } else if (err instanceof Error && err.message) {
          errorMsg = err.message;
        }
        Alert.alert(language === 'mr' ? 'त्रुटी' : 'Error', errorMsg);
      } finally {
        isDeletingRef.current = false;
      }
    },
    onSelectLanguage: setLanguage,
    onContinue,
    onSkip,
    onBack,
    isFamilyLoading,
    isFamilyError,
    isCreatingMember: isSubmittingMember,
    isDeletingMember: isDeletingMember || isDeletingRef.current,
    refetchFamily,
  };
}
