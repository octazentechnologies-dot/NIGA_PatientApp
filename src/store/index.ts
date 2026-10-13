import { configureStore } from '@reduxjs/toolkit';

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
