import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_CONFIG } from '../../../config/apiConfig';
import {
  clearAuthCredentials,
  getAccessToken,
  saveAccessToken,
} from '../../../services/secureStorage';
import {
  clearAuthState,
  setAuthUser,
  setSessionEndedMessage,
} from '../../slices/authSlice';
import { prepareAuthHeaders } from '../prepareAuthHeaders';

/**
 * Single-flight promise so parallel 401 responses do not trigger conflicting refreshes.
 */
let refreshPromise: Promise<string | null> | null = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.new.baseUrl,
  timeout: API_CONFIG.requestTimeoutMs,
  prepareHeaders: prepareAuthHeaders,
});

/**
 * Custom base query implementing:
 * 1. 20-second timeout.
 * 2. Synchronized 401 -> POST /api/Account/RefreshToken -> single retry.
 * 3. Graceful session termination and cache clearing on refresh failure.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthRoute =
      url.includes('Account/RefreshToken') ||
      url.includes('Account/Logout') ||
      url.includes('PatientAuth/RequestOtp') ||
      url.includes('PatientAuth/VerifyOtp');

    if (!isAuthRoute) {
      // No stored token → not a logged-in session (first install / already signed out).
      // Do not treat anonymous 401s as "session ended".
      const existingToken = await getAccessToken();
      if (!existingToken) {
        return result;
      }

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const currentToken = await getAccessToken();
            if (!currentToken) {
              return null;
            }

            const refreshResult = await rawBaseQuery(
              {
                url: 'api/Account/RefreshToken',
                method: 'POST',
                body: { token: currentToken },
                headers: {
                  Authorization: `Bearer ${currentToken}`,
                },
              },
              api,
              extraOptions,
            );

            if (refreshResult.data) {
              const data = refreshResult.data as {
                success?: boolean;
                token?: string;
              };
              if (data.token) {
                await saveAccessToken(data.token);
                const currentState = api.getState() as {
                  auth: { user: Parameters<typeof setAuthUser>[0]['user'] };
                };
                api.dispatch(
                  setAuthUser({
                    user: currentState?.auth?.user ?? null,
                    token: data.token,
                  }),
                );
                return data.token;
              }
            }
            return null;
          } catch {
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise;
      if (newToken) {
        // Retry the original request once with the refreshed token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Had a token but refresh failed — real session end
        api.dispatch(
          setSessionEndedMessage(
            'Your session has ended. Please sign in again.',
          ),
        );
        api.dispatch(clearAuthState());
        await clearAuthCredentials();
      }
    }
  }

  return result;
};

/**
 * Standard error extractor supporting validation errors, simple errors, and server error IDs.
 */
export function extractErrorMessage(
  data: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }
    if (typeof obj.errorMessage === 'string' && obj.errorMessage.trim()) {
      return obj.errorMessage;
    }
    if (obj.errors && typeof obj.errors === 'object') {
      const errorValues = Object.values(obj.errors as Record<string, unknown>);
      if (errorValues.length > 0) {
        const first = errorValues[0];
        if (
          Array.isArray(first) &&
          first.length > 0 &&
          typeof first[0] === 'string'
        ) {
          return first[0];
        }
        if (typeof first === 'string') {
          return first;
        }
      }
    }
  }
  return fallback;
}

/**
 * Primary RTK Query API for New API endpoints.
 * Inject feature endpoints via `newBaseApi.injectEndpoints`.
 */
export const newBaseApi = createApi({
  reducerPath: 'newApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Consents',
    'Doctors',
    'DoctorProfile',
    'Slots',
    'Bookings',
    'Family',
    'PatientProfile',
    'Profile',
    'Visits',
    'VisitDetail',
    'Appointments',
    'AppointmentRequests',
    'Timeline',
    'Prescriptions',
    'Documents',
    'Notifications',
    'NotificationPrefs',
    'Diary',
    'FollowUps',
    'Progress',
    'Reviews',
    'Reminders',
    'Orders',
    'PharmacySellers',
    'Articles',
    'AppConfig',
    'Tele',
    'Support',
    'Payments',
    'Addresses',
    'DataRequests',
  ],
  endpoints: () => ({}),
});
