import type { AppDispatch } from './index';
import { legacyBaseApi } from './api/legacy/legacyBaseApi';
import { newBaseApi } from './api/new/newBaseApi';
import { accountApi } from './api/new/accountApi';
import { clearAuthState } from './slices/authSlice';
import { clearAuthCredentials } from '../services/secureStorage';
import { unregisterAuthenticatedDevicePush } from '../services/notifications';
import { clearPendingPayment } from '../payments';

/**
 * Clears in-memory RTK cache, auth state, and SecureStore credentials.
 */
export async function resetAuthenticatedSession(
  dispatch: AppDispatch,
): Promise<void> {
  dispatch(legacyBaseApi.util.resetApiState());
  dispatch(newBaseApi.util.resetApiState());
  dispatch(clearAuthState());
  await Promise.all([
    clearAuthCredentials(),
    clearPendingPayment().catch(() => undefined),
  ]);
}

/**
 * Executes server logout flow (§5.7):
 * 1. Unregisters push notifications (fails soft).
 * 2. Calls POST /api/Account/Logout to revoke token on backend (fails soft).
 * 3. Clears all local credentials, Redux auth, and RTK caches.
 */
export async function performLogout(dispatch: AppDispatch): Promise<void> {
  try {
    // 1. Unregister push notification token
    await unregisterAuthenticatedDevicePush().catch(() => undefined);
  } catch {
    // Fails soft
  }

  try {
    // 2. Call server logout endpoint
    await dispatch(accountApi.endpoints.logout.initiate()).unwrap().catch(() => undefined);
  } catch {
    // Fails soft - server revocation is best-effort
  }

  // 3. Clear local session credentials
  await resetAuthenticatedSession(dispatch);
}
