import Constants from 'expo-constants';

/** Single New API origin for every patient-app HTTP call. */
export const API_BASE_URL = 'https://devapi.homeocentrum.com/';

const configuredBaseUrl: string =
  Constants.expoConfig?.extra?.apiBaseUrl || API_BASE_URL;

const normalizedBaseUrl = configuredBaseUrl.endsWith('/')
  ? configuredBaseUrl
  : `${configuredBaseUrl}/`;

/**
 * API configuration for the Patient Mobile App.
 * One host only: https://devapi.homeocentrum.com/
 */
export const API_CONFIG = {
  environment: __DEV__ ? 'development' : 'production',
  /** @deprecated Same origin as `new` — kept so legacyBaseApi still resolves. */
  legacy: {
    baseUrl: normalizedBaseUrl,
  },
  new: {
    baseUrl: normalizedBaseUrl,
  },
  requestTimeoutMs: 20000,
} as const;

export type ApiTarget = keyof Pick<typeof API_CONFIG, 'legacy' | 'new'>;
