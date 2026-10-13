import Constants from 'expo-constants';

const configuredBaseUrl: string =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://devmaigrationapi.homeocentrum.com/';

const normalizedBaseUrl = configuredBaseUrl.endsWith('/')
  ? configuredBaseUrl
  : `${configuredBaseUrl}/`;

/**
 * API configuration for the Patient Mobile App.
 * Uses devmaigrationapi.homeocentrum.com as the primary backend host.
 */
export const API_CONFIG = {
  environment: __DEV__ ? 'development' : 'production',
  legacy: {
    baseUrl: 'https://devapi1.homeocentrum.com/',
  },
  new: {
    baseUrl: normalizedBaseUrl,
  },
  requestTimeoutMs: 20000,
} as const;

export type ApiTarget = keyof Pick<typeof API_CONFIG, 'legacy' | 'new'>;

