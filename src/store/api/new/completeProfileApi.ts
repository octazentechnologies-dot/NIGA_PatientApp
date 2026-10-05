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

/**
 * CompleteProfileView — Address location cascading APIs.
 * Base: newBaseApi (devapi2). Auth not required.
 */
export const completeProfileApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
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
  }),
});

export const {
  useGetCountriesQuery,
  useGetStatesByCountryQuery,
  useGetDistrictsByStateQuery,
  useGetCitiesByDistrictQuery,
} = completeProfileApi;
