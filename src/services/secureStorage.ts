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

export async function clearAuthCredentials(): Promise<void> {
  await Promise.all([deleteAccessToken(), deleteRefreshToken()]);
}
