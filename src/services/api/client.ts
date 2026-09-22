import { AppConfig } from '../../config/env';
import { ApiError, type ApiRequestOptions } from '../../models/api';

function joinUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AppConfig.requestTimeoutMs,
  );

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    const response = await fetch(joinUrl(AppConfig.apiBaseUrl, path), {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    const raw = await response.text();
    let parsed: unknown = null;
    if (raw.length > 0) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }
    }

    if (!response.ok) {
      throw new ApiError(
        typeof parsed === 'object' &&
          parsed !== null &&
          'message' in parsed &&
          typeof parsed.message === 'string'
          ? parsed.message
          : `Request failed (${response.status})`,
        response.status,
        parsed,
      );
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out');
    }

    throw new ApiError('Network request failed');
  } finally {
    clearTimeout(timeout);
  }
}
