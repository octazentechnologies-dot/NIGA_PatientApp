/**
 * Safe JWT parser and token expiration utility for React Native.
 * Decodes the JWT payload without requiring native crypto libraries.
 */

function decodeBase64(input: string): string {
  if (typeof globalThis.atob === 'function') {
    try {
      return globalThis.atob(input);
    } catch {
      // Fall through to manual decoder if atob fails
    }
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = '';
  let i = 0;
  const clean = input.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < clean.length) {
    const enc1 = chars.indexOf(clean.charAt(i++));
    const enc2 = chars.indexOf(clean.charAt(i++));
    const enc3 = chars.indexOf(clean.charAt(i++));
    const enc4 = chars.indexOf(clean.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    str += String.fromCharCode(chr1);
    if (enc3 !== 64 && enc3 !== -1) {
      str += String.fromCharCode(chr2);
    }
    if (enc4 !== 64 && enc4 !== -1) {
      str += String.fromCharCode(chr3);
    }
  }
  return str;
}

export type DecodedJwtPayload = {
  nameid?: string | number | (string | number)[];
  unique_name?: string;
  role?: string;
  RoleName?: string;
  RoleId?: string | number;
  jti?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  [key: string]: unknown;
};

export function parseJwtPayload(token: string): DecodedJwtPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeBase64(base64);
    return JSON.parse(jsonStr) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

export function parseJwtClaims(token: string): {
  userId?: number;
  mobile?: string;
  role?: string;
  exp?: number;
} | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const rawUserId = Array.isArray(payload.nameid)
    ? payload.nameid[0]
    : payload.nameid;
  const userId = rawUserId !== undefined && rawUserId !== null ? Number(rawUserId) : undefined;
  const mobile = payload.unique_name ? String(payload.unique_name) : undefined;
  const role = payload.role ? String(payload.role) : payload.RoleName ? String(payload.RoleName) : undefined;
  const exp = typeof payload.exp === 'number' ? payload.exp : undefined;

  return {
    userId: Number.isFinite(userId) ? userId : undefined,
    mobile,
    role,
    exp,
  };
}

/**
 * Checks if the JWT is expired or will expire within toleranceSeconds.
 */
export function isJwtExpired(token: string, toleranceSeconds = 60): boolean {
  const claims = parseJwtClaims(token);
  if (!claims?.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return claims.exp <= nowSeconds + toleranceSeconds;
}

/**
 * Checks if the JWT expires within the given window (default: 24 hours).
 * Used for proactive token refresh before expiry.
 */
export function isJwtExpiringWithin(token: string, windowSeconds = 24 * 3600): boolean {
  const claims = parseJwtClaims(token);
  if (!claims?.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return claims.exp - nowSeconds < windowSeconds;
}
