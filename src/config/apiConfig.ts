/**
 * Development API hosts. Production URLs are not defined yet.
 * Base URLs are configuration, not secrets. Do not put credentials here.
 */
export const API_CONFIG = {
  environment: 'development',
  legacy: {
    baseUrl: 'https://devapi1.homeocentrum.com/',
  },
  new: {
    baseUrl: 'https://devapi2.homeocentrum.com/',
  },
} as const;

export type ApiTarget = keyof Pick<typeof API_CONFIG, 'legacy' | 'new'>;
