import { newBaseApi } from './newBaseApi';

export type RequestOtpRequest = {
  mobile: string;
};

export type RequestOtpSuccessResponse = {
  success: true;
  otpChallengeId: number;
  expiresAt: string;
  destinationMasked: string;
  /** Returned by non-SMS / staging backends so the app can display the OTP. */
  devCode?: string;
  /** Alternate field names some environments return instead of `devCode`. */
  otpCode?: string;
  code?: string;
  isUserRegistered?: boolean;
  isUserAlreadyRegistered?: boolean;
};

/** On-screen OTP while SMS is not integrated. Prefer whatever the API sent. */
export function extractDevOtp(
  response: Pick<RequestOtpSuccessResponse, 'devCode' | 'otpCode' | 'code'>,
): string | undefined {
  const raw = response.devCode ?? response.otpCode ?? response.code;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return /^\d{4,8}$/.test(trimmed) ? trimmed : undefined;
}

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
  overrideExisting: true,
  endpoints: (build) => ({
    requestOtp: build.mutation<RequestOtpResponse, RequestOtpRequest>({
      query: (body) => ({
        url: 'api/PatientAuth/RequestOtp',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRequestOtpMutation } = signInApi;
