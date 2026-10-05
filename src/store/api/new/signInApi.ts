import { newBaseApi } from './newBaseApi';

export type RequestOtpRequest = {
  mobile: string;
};

export type RequestOtpSuccessResponse = {
  success: true;
  otpChallengeId: number;
  expiresAt: string;
  destinationMasked: string;
  devCode?: string;
  isUserRegistered?: boolean;
};

export type RequestOtpErrorResponse = {
  success: false;
  errorMessage?: string;
  message?: string;
};

export type RequestOtpResponse =
  | RequestOtpSuccessResponse
  | RequestOtpErrorResponse;

/** SignInView — POST api/PatientAuth/RequestOtp. Auth not required. */
export const signInApi = newBaseApi.injectEndpoints({
  endpoints: (build) => ({
    requestOtp: build.mutation<RequestOtpResponse, RequestOtpRequest>({
      query: (body) => ({
        url: 'api/PatientAuth/RequestOtp',
        method: 'POST',
        body,
        params: body,
      }),
    }),
  }),
});

export const { useRequestOtpMutation } = signInApi;
