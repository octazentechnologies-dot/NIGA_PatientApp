import { newBaseApi } from './newBaseApi';

export type Country = {
  countryId: number;
  countryName: string;
  countryCode: string;
  iso2Code: string;
  iso3Code: string;
};

export type State = {
  stateId: number;
  stateName: string;
  countryId: number;
};

export type District = {
  districtId: number;
  districtName: string;
  stateId: number;
};

export type City = {
  cityId: number;
  cityName: string;
  districtId: number;
};

export type LocationApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errorMessage?: string;
};

export type CreatePatientRequest = {
  entityType: 'PatientMobile';
  patientID: number;
  patientName: string;
  mobileNo: string;
  email: string;
  dateOfBirth: string;
  gender: number;
  addressLine1: string;
  countryId: number;
  stateId: number;
  isWhatsAppOptIn: boolean;
};

export type CreatePatientResponse = {
  doctorID?: number | null;
  patientID: number;
  patientName?: string | null;
  address?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  landmark?: string | null;
  stateId?: number | null;
  countryId?: number | null;
  districtId?: number | null;
  cityId?: number | null;
  pinCodeId?: number | null;
  mobileNo?: string | null;
  email?: string | null;
  mail?: string | null;
  phoneNo?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  enteredBy?: string | null;
  enteredDate?: string | null;
  changedBy?: string | null;
  changedDate?: string | null;
  userId: number;
  deleteStatus?: boolean | null;
  dateodFirstVisit?: string | null;
  refBy?: string | null;
  message?: string | null;
  token?: string | null;
  isUserAlreadyRegistered?: boolean | null;
  caseId?: number | null;
  age?: number | null;
  isWhatsAppOptIn?: boolean | null;
  whatsAppOptInDate?: string | null;
  lastVisitAt?: string | null;
  entityType?: string | null;
  loggedInUser?: number | null;
  diagnosisIds?: string | null;
  chiefComplaintIds?: string | null;
  errorMessage?: string;
  success?: boolean;
};

export type GenderMaster = {
  genderId: number;
  genderName: string;
  enteredBy?: string | null;
  enteredDate?: string | null;
  changedBy?: string | null;
  changedDate?: string | null;
  deleteStatus?: boolean;
};

export type GetGendersResponse = GenderMaster[] | { data: GenderMaster[] };

/**
 * CompleteProfileView — Address location cascading APIs, Gender Master API & Create Patient API.
 * Base: newBaseApi (devapi2). Auth not required.
 */
export const completeProfileApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    getGenders: build.query<GenderMaster[], void>({
      query: () => 'api/mastersAPI/GetGenders',
      transformResponse: (response: GetGendersResponse) => {
        if (Array.isArray(response)) {
          return response;
        }
        if (
          response &&
          Array.isArray((response as { data: GenderMaster[] }).data)
        ) {
          return (response as { data: GenderMaster[] }).data;
        }
        return [];
      },
    }),
    getCountries: build.query<LocationApiResponse<Country[]>, void>({
      query: () => 'api/UserAddressLocation/Countries',
    }),
    getStatesByCountry: build.query<LocationApiResponse<State[]>, number>({
      query: (countryId) => `api/UserAddressLocation/States/ByCountry/${countryId}`,
    }),
    getDistrictsByState: build.query<LocationApiResponse<District[]>, number>({
      query: (stateId) => `api/UserAddressLocation/Districts/ByState/${stateId}`,
    }),
    getCitiesByDistrict: build.query<LocationApiResponse<City[]>, number>({
      query: (districtId) => `api/UserAddressLocation/Cities/ByDistrict/${districtId}`,
    }),
    createPatient: build.mutation<CreatePatientResponse, CreatePatientRequest>({
      query: (body) => ({
        url: 'api/patient/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetGendersQuery,
  useGetCountriesQuery,
  useGetStatesByCountryQuery,
  useGetDistrictsByStateQuery,
  useGetCitiesByDistrictQuery,
  useCreatePatientMutation,
} = completeProfileApi;
