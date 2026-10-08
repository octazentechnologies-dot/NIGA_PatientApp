export type GenderOption = 'female' | 'male' | 'other';

export type FamilyRelationship =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'other';

export type FamilyMemberStatus = 'guardian' | 'pending' | 'authorized';

export type FamilyMember = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: GenderOption;
  relationship: FamilyRelationship;
  status: FamilyMemberStatus;
  relationName?: string;
  relationId?: number;
  genderId?: number;
  mobileNo?: string;
  memberPatientId?: number;
  dateOfBirth?: string;
  familyMemberId?: number;
};

export type FamilySelf = {
  name: string;
  initials: string;
  age: number;
  gender: GenderOption;
};
