import { createSlice } from '@reduxjs/toolkit';

/**
 * Client auth flags only. Tokens stay in SecureStore.
 * `user` stays null until an auth response contract exists.
 */
export type AuthUser = {
  mobile?: string;
  bookingSessionId?: number;
} | null;

export type DetectedGeoLocation = {
  countryName: string | null;
  isoCountryCode: string | null;
  region: string | null;
  subregion: string | null;
  district: string | null;
  city: string | null;
};

type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  bookingSessionId: number | null;
  mobile: string | null;
  countryCode: string | null;
  countryId: number | null;
  detectedLocation: DetectedGeoLocation | null;
  user: AuthUser;
};

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  bookingSessionId: null,
  mobile: null,
  countryCode: null,
  countryId: null,
  detectedLocation: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    markAuthInitialized(state) {
      state.isInitialized = true;
    },
    setAuthenticated(state, action: { payload: boolean }) {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        state.bookingSessionId = null;
        state.mobile = null;
      }
    },
    setAuthMobile(
      state,
      action: {
        payload: {
          mobile: string;
          countryCode?: string;
          countryId?: number;
        };
      },
    ) {
      state.mobile = action.payload.mobile;
      if (action.payload.countryCode !== undefined) {
        state.countryCode = action.payload.countryCode;
      }
      if (action.payload.countryId !== undefined) {
        state.countryId = action.payload.countryId;
      }
    },
    setDetectedLocation(
      state,
      action: { payload: DetectedGeoLocation | null },
    ) {
      state.detectedLocation = action.payload;
    },
    setBookingSession(
      state,
      action: {
        payload: {
          bookingSessionId: number;
          mobile: string;
          countryCode?: string;
        };
      },
    ) {
      state.bookingSessionId = action.payload.bookingSessionId;
      state.mobile = action.payload.mobile;
      if (action.payload.countryCode) {
        state.countryCode = action.payload.countryCode;
      }
      state.user = {
        mobile: action.payload.mobile,
        bookingSessionId: action.payload.bookingSessionId,
      };
    },
    clearAuthState() {
      return initialState;
    },
  },
});

export const {
  markAuthInitialized,
  setAuthenticated,
  setAuthMobile,
  setDetectedLocation,
  setBookingSession,
  clearAuthState,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

