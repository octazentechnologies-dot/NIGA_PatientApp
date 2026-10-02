import type { AppDispatch } from './index';
import { legacyBaseApi } from './api/legacy/legacyBaseApi';
import { newBaseApi } from './api/new/newBaseApi';
import { clearAuthState } from './slices/authSlice';
import { clearAuthCredentials } from '../services/secureStorage';

/**
 * Clears in-memory server cache and auth flags, then SecureStore credentials.
 * Not wired to a logout endpoint. Call this when an auth contract exists.
 */
export async function resetAuthenticatedSession(
  dispatch: AppDispatch,
): Promise<void> {
  dispatch(legacyBaseApi.util.resetApiState());
  dispatch(newBaseApi.util.resetApiState());
  dispatch(clearAuthState());
  await clearAuthCredentials();
}
