import NetInfo from '@react-native-community/netinfo';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState, type AppStateStatus } from 'react-native';

import { legacyBaseApi } from './api/legacy/legacyBaseApi';
import { newBaseApi } from './api/new/newBaseApi';
import './api/new/firstLaunchApi';
import './api/new/signInApi';
import './api/new/otpVerificationApi';
import './api/new/completeProfileApi';
import './api/new/consentApi';
import './api/new/doctorsApi';
import './api/new/familyApi';
import './api/new/patientProfileApi';
import './api/new/accountApi';
import './api/new/privacyConsentApi';
import './api/new/homeApi';
import './api/new/patientDashboardApi';
import './api/new/bookingApi';
import './api/new/paymentsApi';
import './api/new/visitsApi';
import './api/new/devicesApi';
import './api/new/recordsApi';
import './api/new/symptomDiaryApi';
import './api/new/teleApi';
import './api/new/medicinesApi';
import './api/new/notificationsApi';
import './api/new/supportApi';
import './api/new/appConfigApi';
import './api/new/remindersApi';
import './api/new/appointmentRequestsApi';
import './api/new/addressesApi';
import { authReducer } from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [legacyBaseApi.reducerPath]: legacyBaseApi.reducer,
    [newBaseApi.reducerPath]: newBaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      legacyBaseApi.middleware,
      newBaseApi.middleware,
    ),
});

/**
 * React Native has no window focus events — wire AppState + NetInfo so
 * refetchOnFocus / refetchOnReconnect actually run for live queries.
 * Custom handler receives RTKQ action creators; we dispatch them.
 */
setupListeners(store.dispatch, (dispatch, actions) => {
  const onAppState = (status: AppStateStatus) => {
    if (status === 'active') {
      dispatch(actions.onFocus());
    } else if (status === 'background' || status === 'inactive') {
      dispatch(actions.onFocusLost());
    }
  };
  const appSub = AppState.addEventListener('change', onAppState);

  const netSub = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      dispatch(actions.onOnline());
    } else {
      dispatch(actions.onOffline());
    }
  });

  return () => {
    appSub.remove();
    netSub();
  };
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
