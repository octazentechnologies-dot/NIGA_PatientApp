import { API_CONFIG } from '../config/apiConfig';

/**
 * Format a money amount from the API.
 * - `amount` null/undefined → `null` (caller must hide the row).
 * - `currency` null → neutral display without inventing a currency code.
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string | null {
  if (amount == null || Number.isNaN(Number(amount))) {
    return null;
  }
  const n = Number(amount);
  const digits = Number.isInteger(n) ? String(n) : n.toFixed(2);
  if (currency == null || !String(currency).trim()) {
    return digits;
  }
  const code = String(currency).trim().toUpperCase();
  if (code === 'INR' || code === 'RS' || code === 'RS.') {
    return `₹${digits}`;
  }
  return `${code} ${digits}`;
}

/** Device-local calendar date as `YYYY-MM-DD`. */
export function formatLocalDateYmd(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse API date/time into a Date when possible.
 * Accepts ISO, `YYYY-MM-DD`, `HH:mm`, `HH:mm:ss`.
 */
export function parseApiDateTime(
  value: string | null | undefined,
): Date | null {
  if (value == null || !String(value).trim()) {
    return null;
  }
  const raw = String(value).trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    const [hh, mm, ss] = raw.split(':').map(Number);
    const d = new Date();
    d.setHours(hh, mm, ss ?? 0, 0);
    return d;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function formatDate(
  value: string | Date | null | undefined,
  locale = 'en-IN',
): string | null {
  if (value == null) {
    return null;
  }
  const date = value instanceof Date ? value : parseApiDateTime(String(value));
  if (!date) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return formatLocalDateYmd(date);
  }
}

export function formatTime(
  value: string | Date | null | undefined,
  locale = 'en-IN',
): string | null {
  if (value == null) {
    return null;
  }
  const raw = typeof value === 'string' ? value.trim() : '';
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    const [hh, mm] = raw.split(':');
    const hour = Number(hh);
    const minute = Number(mm);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return null;
    }
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    try {
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(d);
    } catch {
      return `${hh}:${mm}`;
    }
  }
  const date = value instanceof Date ? value : parseApiDateTime(String(value));
  if (!date) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return null;
  }
}

/**
 * Resolve doctor/patient photo URLs from the API.
 * - Absolute `http(s)://…` → as-is
 * - Path starting with `/` → prefix New API origin
 * - null/empty → null (use placeholder in UI)
 */
export function resolveApiUrl(
  pathOrUrl: string | null | undefined,
): string | null {
  if (pathOrUrl == null) {
    return null;
  }
  const value = String(pathOrUrl).trim();
  if (!value) {
    return null;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const origin = API_CONFIG.new.baseUrl.replace(/\/+$/, '');
  if (value.startsWith('/')) {
    return `${origin}${value}`;
  }
  return `${origin}/${value}`;
}
