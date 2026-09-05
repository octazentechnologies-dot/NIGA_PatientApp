import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type {
  FamilyMember,
  FamilyRelationship,
  FamilySelf,
  GenderOption,
} from '../models/family';
import {
  ageFromDate,
  defaultBirthDate,
  formatDateOfBirth,
  initialsFromName,
  parseDateOfBirth,
} from '../utilities/dateOfBirth';

const RELATIONSHIPS: FamilyRelationship[] = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'other',
];

const SEED_SELF: FamilySelf = {
  name: 'Pranav Kulkarni',
  initials: 'PK',
  age: 34,
  gender: 'male',
};

const SEED_MEMBERS: FamilyMember[] = [
  {
    id: 'aarav',
    name: 'Aarav Kulkarni',
    initials: 'AK',
    age: 6,
    gender: 'male',
    relationship: 'child',
    status: 'guardian',
  },
  {
    id: 'sunita',
    name: 'Sunita Kulkarni',
    initials: 'SK',
    age: 61,
    gender: 'female',
    relationship: 'parent',
    status: 'pending',
  },
  {
    id: 'meera',
    name: 'Meera Kulkarni',
    initials: 'MK',
    age: 31,
    gender: 'female',
    relationship: 'spouse',
    status: 'authorized',
  },
];

export type FamilyMembersViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
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
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  onConfirmDateOfBirth: (date: Date) => void;
  onSelectGender: (value: GenderOption) => void;
  onOpenRelationshipPicker: () => void;
  onCloseRelationshipPicker: () => void;
  onSelectRelationship: (value: FamilyRelationship) => void;
  onChangeMobileNumber: (value: string) => void;
  onToggleAuthorizedToManage: () => void;
  onSubmitMember: () => void;
  onOpenMemberMenu: (memberId: string) => void;
  onCloseMemberMenu: () => void;
  onRemoveMember: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
  relationships: FamilyRelationship[];
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

export function useFamilyMembersController({
  onBack,
  onContinue,
  onSkip,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}): FamilyMembersViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [members, setMembers] = useState<FamilyMember[]>(SEED_MEMBERS);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [relationshipPickerOpen, setRelationshipPickerOpen] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [relationship, setRelationship] = useState<FamilyRelationship | null>(
    null,
  );
  const [mobileNumber, setMobileNumber] = useState('');
  const [authorizedToManage, setAuthorizedToManage] = useState(false);

  const parsedDob = parseDateOfBirth(dateOfBirth);
  const age = parsedDob ? ageFromDate(parsedDob) : null;
  const isAdult = age !== null && age >= 18;

  const canSubmit = Boolean(
    fullName.trim() &&
      parsedDob &&
      gender &&
      relationship &&
      authorizedToManage &&
      (!isAdult || mobileNumber.length === 10),
  );

  const resetForm = () => {
    setFullName('');
    setDateOfBirth('');
    setGender(null);
    setRelationship(null);
    setMobileNumber('');
    setAuthorizedToManage(false);
    setDatePickerOpen(false);
    setRelationshipPickerOpen(false);
  };

  const relationshipLabel = (value: FamilyRelationship) => t(relationshipKey(value));

  const selfMeta = `${SEED_SELF.age} ${t('yearsShort')} · ${t(genderKey(SEED_SELF.gender))}`;

  const memberMeta = (member: FamilyMember) =>
    `${member.age} ${t('yearsShort')} · ${relationshipLabel(member.relationship)}`;

  const statusLabel = (member: FamilyMember) => t(statusKey(member.status));

  return {
    language,
    t,
    self: SEED_SELF,
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
    onOpenAddSheet: () => setAddSheetOpen(true),
    onCloseAddSheet: () => {
      setAddSheetOpen(false);
      resetForm();
    },
    onOpenHelp: () => setHelpOpen(true),
    onCloseHelp: () => setHelpOpen(false),
    onChangeFullName: setFullName,
    onOpenDatePicker: () => setDatePickerOpen(true),
    onCloseDatePicker: () => setDatePickerOpen(false),
    onConfirmDateOfBirth: (date) => {
      setDateOfBirth(formatDateOfBirth(date));
      setDatePickerOpen(false);
    },
    onSelectGender: setGender,
    onOpenRelationshipPicker: () => setRelationshipPickerOpen(true),
    onCloseRelationshipPicker: () => setRelationshipPickerOpen(false),
    onSelectRelationship: (value) => {
      setRelationship(value);
      setRelationshipPickerOpen(false);
    },
    onChangeMobileNumber: (value) =>
      setMobileNumber(value.replace(/\D/g, '').slice(0, 10)),
    onToggleAuthorizedToManage: () =>
      setAuthorizedToManage((current) => !current),
    onSubmitMember: () => {
      if (!canSubmit || !parsedDob || !gender || !relationship || age === null) {
        return;
      }
      const name = fullName.trim();
      setMembers((current) => [
        ...current,
        {
          id: `member-${Date.now()}`,
          name,
          initials: initialsFromName(name),
          age,
          gender,
          relationship,
          status: isAdult ? 'pending' : 'guardian',
        },
      ]);
      setAddSheetOpen(false);
      resetForm();
    },
    onOpenMemberMenu: setMemberMenuId,
    onCloseMemberMenu: () => setMemberMenuId(null),
    onRemoveMember: () => {
      if (!memberMenuId) {
        return;
      }
      setMembers((current) =>
        current.filter((member) => member.id !== memberMenuId),
      );
      setMemberMenuId(null);
    },
    onSelectLanguage: setLanguage,
    onContinue,
    onSkip,
    onBack,
  };
}
