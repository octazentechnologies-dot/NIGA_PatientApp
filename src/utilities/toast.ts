import Toast from 'react-native-toast-message';
import type { FetchArgs } from '@reduxjs/toolkit/query';

type ToastKind = 'success' | 'error' | 'info';

type ShowAppToastArgs = {
  type?: ToastKind;
  message: string;
  title?: string;
};

/** Show a brief toast for API success / failure messages. */
export function showAppToast({
  type = 'error',
  message,
  title,
}: ShowAppToastArgs): void {
  const text = message.trim();
  if (!text) return;
  if (isDuplicate(type, text)) return;

  Toast.show({
    type,
    text1: title?.trim() || undefined,
    text2: text,
    position: 'bottom',
    visibilityTime: 4000,
    bottomOffset: 96,
  });
}

/** Best-effort message from RTK Query / fetchBaseQuery errors. */
export function getApiErrorMessage(error: unknown): string | null {
  if (error == null) return null;

  if (typeof error === 'string') {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof error !== 'object') return null;

  const record = error as {
    data?: unknown;
    error?: unknown;
    message?: unknown;
  };

  const fromData = readMessage(record.data);
  if (fromData) return fromData;

  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error.trim();
  }

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }

  if (
    'status' in record &&
    (record as { status?: unknown }).status === 'FETCH_ERROR'
  ) {
    return 'Network request failed. Check your connection and try again.';
  }

  return null;
}

/** API `code` from a failure body when present (e.g. FORBIDDEN). */
export function getApiErrorCode(error: unknown): string | null {
  if (error == null || typeof error !== 'object') return null;
  const data = (error as { data?: unknown }).data;
  if (data == null || typeof data !== 'object') return null;
  const code = (data as { code?: unknown }).code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
}

/**
 * Show API failure toast. Prefer server `message`; never swallow FORBIDDEN.
 */
export function showApiErrorToast(error: unknown, fallback?: string): void {
  const message = getApiErrorMessage(error) ?? fallback?.trim() ?? null;
  if (!message) return;
  showAppToast({ type: 'error', message });
}

type ApiCallArgs = string | FetchArgs;

type ApiCallResult = {
  data?: unknown;
  error?: unknown;
};

/**
 * Toast the raw API body for every screen that goes through the shared
 * base query. Writes show success or error text. Reads show failures only.
 * Polled GETs stay quiet so a 5s refresh does not repeat the same toast.
 */
export function notifyApiResult(args: ApiCallArgs, result: ApiCallResult): void {
  const url = typeof args === 'string' ? args : args.url;
  const method = (
    typeof args === 'string' ? 'GET' : args.method ?? 'GET'
  ).toUpperCase();

  if (isQuietRoute(url, method)) return;

  if (result.error) {
    const status =
      typeof result.error === 'object' &&
      result.error != null &&
      'status' in result.error
        ? (result.error as { status?: unknown }).status
        : undefined;
    if (status === 401) return;
    const message = getApiErrorMessage(result.error);
    if (message) showAppToast({ type: 'error', message });
    return;
  }

  const message = readMessage(result.data);
  const success = readSuccess(result.data);
  if (success === false) {
    if (message) showAppToast({ type: 'error', message });
    return;
  }

  const isWrite = method !== 'GET' && method !== 'HEAD';
  if (isWrite && message) {
    showAppToast({ type: 'success', message });
  }
}

/** Message already shown by `notifyApiResult`, when the body carries one. */
export function getApiBodyMessage(value: unknown): string | null {
  return readMessage(value);
}

function readMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value == null || typeof value !== 'object') return null;
  const data = value as {
    message?: unknown;
    Message?: unknown;
    errorMessage?: unknown;
    errors?: unknown;
  };
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof data.Message === 'string' && data.Message.trim()) {
    return data.Message.trim();
  }
  if (typeof data.errorMessage === 'string' && data.errorMessage.trim()) {
    return data.errorMessage.trim();
  }
  if (data.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors as Record<string, unknown>)[0];
    if (Array.isArray(first) && typeof first[0] === 'string' && first[0].trim()) {
      return first[0].trim();
    }
    if (typeof first === 'string' && first.trim()) return first.trim();
  }
  return null;
}

function readSuccess(value: unknown): boolean | undefined {
  if (value == null || typeof value !== 'object') return undefined;
  const success = (value as { success?: unknown }).success;
  return typeof success === 'boolean' ? success : undefined;
}

function isQuietRoute(url: string, method: string): boolean {
  if (url.includes('Account/RefreshToken')) return true;
  if (method !== 'GET') return false;
  return (
    /\/Tracking$/i.test(url) ||
    /api\/Tele\/Instant\/\d+$/i.test(url) ||
    /api\/Tele\/Chat\/\d+$/i.test(url) ||
    /api\/Erx\/(ByAppointment|Patient)/i.test(url)
  );
}

let lastToastKey = '';
let lastToastAt = 0;

function isDuplicate(type: string, message: string): boolean {
  const key = `${type}:${message}`;
  const now = Date.now();
  if (key === lastToastKey && now - lastToastAt < 2500) return true;
  lastToastKey = key;
  lastToastAt = now;
  return false;
}
