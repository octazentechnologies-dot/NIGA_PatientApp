import { newBaseApi } from './newBaseApi';

export type ApiFamilyMember = {
  familyMemberId?: number;
  ownerPatientId?: number;
  memberPatientId?: number;
  id?: number | string;
  patientId?: number;
  relationId?: number;
  relation?: string;
  relationName?: string;
  patientName?: string;
  fullName?: string;
  name?: string;
  mobileNo?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  email?: string;
  relationship?: string;
  relationshipType?: string;
  gender?: number | string;
  genderId?: number;
  dateOfBirth?: string;
  age?: number;
  status?: string;
  isAuthorized?: boolean;
  canManage?: boolean;
  [key: string]: unknown;
};

export type GetFamilyResponse = {
  success: boolean;
  ownerPatientId?: number;
  ownerPatientName?: string;
  isActingAsCaregiver?: boolean;
  data: ApiFamilyMember[];
};

export type ApiRelation = {
  relationId: number;
  relationName: string;
  sortOrder: number;
};

export type GetRelationsResponse = {
  success: boolean;
  data: ApiRelation[];
};

export type CreateFamilyMemberRequest = {
  ownerPatientId: number;
  relationId: number;
  relation: string;
  patientName: string;
  mobileNo: string;
  email: string;
  dateOfBirth: string;
  gender: number;
  age: number;
  existingMemberPatientId: number;
};

export type CreateFamilyMemberData = {
  familyMemberId?: number;
  ownerPatientId?: number;
  memberPatientId?: number;
  relationId?: number;
  relation?: string;
  patientName?: string;
  mobileNo?: string;
  email?: string;
};

export type CreateFamilyMemberResponse = {
  success?: boolean;
  message?: string;
  errorMessage?: string;
  data?: CreateFamilyMemberData;
  [key: string]: unknown;
};

export type UpdateFamilyMemberRequest = {
  relationId: number;
  relation: string;
  patientName: string;
  mobileNo: string;
  email: string;
  dateOfBirth: string;
  gender: number;
  age: number;
};

export type UpdateFamilyMemberParams = {
  id: number | string;
  body: UpdateFamilyMemberRequest;
};

export type UpdateFamilyMemberResponse = {
  success?: boolean;
  message?: string;
  errorMessage?: string;
  data?: unknown;
  [key: string]: unknown;
};

export type DeleteFamilyMemberResponse = {
  success?: boolean;
  message?: string;
  errorMessage?: string;
  data?: unknown;
  [key: string]: unknown;
} | void;

export type CaregiverMeData = {
  ownerPatientId: number;
  ownerPatientName: string;
  otpDestination: string;
  linked: boolean;
  isActingAsCaregiver: boolean;
};

export type CaregiverLookupData = {
  caregiverUserId: number;
  displayName: string;
  contact: string;
};

export type CaregiverAuthorization = {
  caregiverAuthorizationId: number;
  patientId: number;
  patientName: string;
  caregiverUserId: number;
  caregiverName: string;
  caregiverContact: string;
  grantedAt: string;
  revokedAt?: string | null;
  scope: string;
  isActive: boolean;
};

export type GrantCaregiverRequest = {
  caregiverContact: string;
  scope?: string;
  otpChallengeId: number;
  otpCode: string;
};

export type RevokeCaregiverRequest = {
  caregiverAuthorizationId: number;
};

/**
 * Family Members Screen — GET api/Family
 * Add Family Member Relations — GET api/Family/Relations
 * Create Family Member — POST api/Family
 * Get Family Member — GET api/Family/{id}
 * Update Family Member — PUT api/Family/{id}
 * Delete Family Member — DELETE api/Family/{id}
 * Caregiver Endpoints — E9-E13
 * Method: GET/POST/PUT/DELETE, Auth: Bearer Token, Base: newBaseApi (devapi2).
 */
export const familyApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getFamily: build.query<GetFamilyResponse, void>({
      query: () => 'api/Family',
      providesTags: ['Family'],
    }),
    getFamilyMember: build.query<
      { success: boolean; data: ApiFamilyMember },
      number | string
    >({
      query: (id) => `api/Family/${id}`,
      providesTags: ['Family'],
    }),
    getRelations: build.query<ApiRelation[], void>({
      query: () => 'api/Family/Relations',
      transformResponse: (response: GetRelationsResponse) => {
        if (response && Array.isArray(response.data)) {
          return [...response.data].sort((a, b) => a.sortOrder - b.sortOrder);
        }
        return [];
      },
    }),
    createFamilyMember: build.mutation<
      CreateFamilyMemberResponse,
      CreateFamilyMemberRequest
    >({
      query: (body) => ({
        url: 'api/Family',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Family'],
    }),
    updateFamilyMember: build.mutation<
      UpdateFamilyMemberResponse,
      UpdateFamilyMemberParams
    >({
      query: ({ id, body }) => ({
        url: `api/Family/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Family'],
    }),
    deleteFamilyMember: build.mutation<
      DeleteFamilyMemberResponse,
      number | string
    >({
      query: (id) => ({
        url: `api/Family/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Family'],
    }),
    getCaregiverMe: build.query<{ success: boolean; data: CaregiverMeData }, void>({
      query: () => 'api/Caregiver/Me',
    }),
    lookupCaregiver: build.query<{ success: boolean; data: CaregiverLookupData }, string>({
      query: (contact) => `api/Caregiver/Lookup?contact=${encodeURIComponent(contact)}`,
    }),
    grantCaregiver: build.mutation<
      { success: boolean; message?: string; data?: CaregiverAuthorization },
      GrantCaregiverRequest
    >({
      query: (body) => ({
        url: 'api/Caregiver/Grant',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Family'],
    }),
    revokeCaregiver: build.mutation<
      { success: boolean; message?: string; data?: CaregiverAuthorization },
      RevokeCaregiverRequest
    >({
      query: (body) => ({
        url: 'api/Caregiver/Revoke',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Family'],
    }),
    listCaregiversMine: build.query<
      { success: boolean; data: CaregiverAuthorization[] },
      void
    >({
      query: () => 'api/Caregiver/ListMine',
    }),
    listCaregiversActingFor: build.query<
      { success: boolean; data: CaregiverAuthorization[] },
      void
    >({
      query: () => 'api/Caregiver/ListActingFor',
    }),
  }),
});

export const {
  useGetFamilyQuery,
  useGetFamilyMemberQuery,
  useGetRelationsQuery,
  useCreateFamilyMemberMutation,
  useUpdateFamilyMemberMutation,
  useDeleteFamilyMemberMutation,
  useGetCaregiverMeQuery,
  useLazyLookupCaregiverQuery,
  useGrantCaregiverMutation,
  useRevokeCaregiverMutation,
  useListCaregiversMineQuery,
  useListCaregiversActingForQuery,
} = familyApi;




