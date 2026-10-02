import { newBaseApi } from './newBaseApi';

export type LanguageMaster = {
  languageId: number;
  languageName: string;
  description: string;
  isDeleted: boolean;
};

/** FirstLaunchView — GET api/mastersAPI/GetLanguages. Auth not required. */
export const firstLaunchApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    getLanguages: build.query<LanguageMaster[], void>({
      query: () => 'api/mastersAPI/GetLanguages',
    }),
  }),
});

export const { useGetLanguagesQuery } = firstLaunchApi;
