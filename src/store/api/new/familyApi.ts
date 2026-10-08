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

/**
 * Family Members Screen — GET api/Family
 * Add Family Member Relations — GET api/Family/Relations
 * Create Family Member — POST api/Family
 * Update Family Member — PUT api/Family/{id}
 * Delete Family Member — DELETE api/Family/{id}
 * Method: GET/POST/PUT/DELETE, Auth: Bearer Token, Base: newBaseApi (devapi2).
 */
export const familyApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    getFamily: build.query<GetFamilyResponse, void>({
      query: () => 'api/Family',
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
  }),
});

export const {
  useGetFamilyQuery,
  useGetRelationsQuery,
  useCreateFamilyMemberMutation,
  useUpdateFamilyMemberMutation,
  useDeleteFamilyMemberMutation,
} = familyApi;



