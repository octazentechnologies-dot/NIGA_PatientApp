import { newBaseApi } from './newBaseApi';

export type VerifyOtpRequest = {
  mobile: string;
  code: string;
};

export type PatientAuthUser = {
  userId: number;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNo?: string;
  role?: string;
  roleId?: number;
  patientId?: number;
  patientName?: string;
};

export type VerifyOtpSuccessResponse = {
  success: true;
  bookingSessionId: number;
  mobile: string;
  isUserAlreadyRegistered?: boolean;
  isUserRegistered?: boolean;
  token?: string;
  user?: PatientAuthUser;
};

export type VerifyOtpErrorResponse = {
  success: false;
  message?: string;
  errorMessage?: string;
};

export type VerifyOtpResponse =
  | VerifyOtpSuccessResponse
  | VerifyOtpErrorResponse;

/** OtpVerificationView — POST api/PatientAuth/VerifyOtp. Auth not required. */
export const otpVerificationApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    verifyOtp: build.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: 'api/PatientAuth/VerifyOtp',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useVerifyOtpMutation } = otpVerificationApi;
