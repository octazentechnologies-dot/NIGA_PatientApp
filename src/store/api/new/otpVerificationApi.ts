import { newBaseApi } from './newBaseApi';

export type VerifyOtpRequest = {
  mobile: string;
  code: string;
};

export type VerifyOtpSuccessResponse = {
  success: true;
  bookingSessionId: number;
  mobile: string;
  isUserRegistered?: boolean;
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
