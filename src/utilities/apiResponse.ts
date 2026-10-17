/**
 * Shared New API response helpers.
 * Contract: success → `{ success: true, data }`; failure → `{ success: false, code, message }`.
 * HTTP 401 with empty body is handled in `baseQueryWithReauth` — do not parse JSON from it.
 */

export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiFailureEnvelope = {
  success: false;
  code?: string;
  message?: string;
  errorId?: string;
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiFailureEnvelope;

export class ApiClientError extends Error {
  readonly code: string | undefined;
  readonly errorId: string | undefined;
  readonly status: number | undefined;

  constructor(
    message: string,
    options?: { code?: string; errorId?: string; status?: number },
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options?.code;
    this.errorId = options?.errorId;
    this.status = options?.status;
  }
}

export function isApiFailure(value: unknown): value is ApiFailureEnvelope {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return obj.success === false;
}

/**
 * Unwrap `{ success, data }`. Throws ApiClientError when `success === false`.
 * Bare arrays / non-envelope payloads are returned as-is (masters APIs).
 */
export function unwrapApiData<T>(payload: unknown, fallbackMessage?: string): T {
  if (payload == null) {
    throw new ApiClientError(fallbackMessage ?? 'Empty response from server.');
  }

  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.success === false) {
      const message =
        typeof obj.message === 'string' && obj.message.trim()
          ? obj.message
          : fallbackMessage ?? 'Request failed.';
      throw new ApiClientError(message, {
        code: typeof obj.code === 'string' ? obj.code : undefined,
        errorId: typeof obj.errorId === 'string' ? obj.errorId : undefined,
      });
    }
    if ('data' in obj && obj.success === true) {
      return obj.data as T;
    }
    if ('data' in obj && obj.success === undefined) {
      return obj.data as T;
    }
  }

  return payload as T;
}

export function messageFromUnknownError(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }
    const data = obj.data;
    if (data && typeof data === 'object') {
      const nested = data as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message;
      }
    }
  }
  return fallback;
}
