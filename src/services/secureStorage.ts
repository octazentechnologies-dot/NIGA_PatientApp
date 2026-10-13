import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

async function saveSecret(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function readSecret(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function deleteSecret(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export function saveAccessToken(token: string): Promise<void> {
  return saveSecret(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): Promise<string | null> {
  return readSecret(ACCESS_TOKEN_KEY);
}

export function deleteAccessToken(): Promise<void> {
  return deleteSecret(ACCESS_TOKEN_KEY);
}

export function saveRefreshToken(token: string): Promise<void> {
  return saveSecret(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): Promise<string | null> {
  return readSecret(REFRESH_TOKEN_KEY);
}

export function deleteRefreshToken(): Promise<void> {
  return deleteSecret(REFRESH_TOKEN_KEY);
}

const AUTH_USER_KEY = 'auth.userData';

export function saveAuthUserData(user: unknown): Promise<void> {
  if (user) {
    return saveSecret(AUTH_USER_KEY, JSON.stringify(user));
  }
  return deleteSecret(AUTH_USER_KEY);
}

export async function getAuthUserData<T = unknown>(): Promise<T | null> {
  const raw = await readSecret(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function deleteAuthUserData(): Promise<void> {
  return deleteSecret(AUTH_USER_KEY);
}

const BOOKING_SESSION_ID_KEY = 'auth.bookingSessionId';

export function saveBookingSessionId(id: number): Promise<void> {
  return saveSecret(BOOKING_SESSION_ID_KEY, String(id));
}

export async function getBookingSessionId(): Promise<number | null> {
  const raw = await readSecret(BOOKING_SESSION_ID_KEY);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function deleteBookingSessionId(): Promise<void> {
  return deleteSecret(BOOKING_SESSION_ID_KEY);
}

export async function clearAuthCredentials(): Promise<void> {
  await Promise.all([
    deleteAccessToken(),
    deleteRefreshToken(),
    deleteAuthUserData(),
    deleteBookingSessionId(),
  ]);
}

const LANGUAGE_SELECTED_KEY = 'app.hasSelectedLanguage';
const ONBOARDING_COMPLETED_KEY = 'app.hasCompletedOnboarding';
const SELECTED_LANGUAGE_KEY = 'app.selectedLanguage';

export function setLanguageSelectionCompleted(): Promise<void> {
  return saveSecret(LANGUAGE_SELECTED_KEY, 'true');
}

export async function hasLanguageSelectionCompleted(): Promise<boolean> {
  const val = await readSecret(LANGUAGE_SELECTED_KEY);
  return val === 'true';
}

export function setOnboardingCompleted(): Promise<void> {
  return saveSecret(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function hasOnboardingCompleted(): Promise<boolean> {
  const val = await readSecret(ONBOARDING_COMPLETED_KEY);
  return val === 'true';
}

export function saveSelectedLanguage(lang: string): Promise<void> {
  return saveSecret(SELECTED_LANGUAGE_KEY, lang);
}

export async function getSelectedLanguage(): Promise<string | null> {
  return readSecret(SELECTED_LANGUAGE_KEY);
}

