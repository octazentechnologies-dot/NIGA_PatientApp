import { createSlice } from '@reduxjs/toolkit';

/**
 * Client auth flags only. Tokens stay in SecureStore.
 * `user` stays null until an auth response contract exists.
 */
export type AuthUser = null;

type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
};

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
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
      }
    },
    clearAuthState() {
      return initialState;
    },
  },
});

export const { markAuthInitialized, setAuthenticated, clearAuthState } =
  authSlice.actions;

export const authReducer = authSlice.reducer;
