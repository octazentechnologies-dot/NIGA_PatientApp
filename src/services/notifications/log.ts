/**
 * Dev-only notification logs. Never log JWTs, PHI, or full production tokens.
 */
export function logNotifications(message: string, detail?: string): void {
  if (!__DEV__) {
    return;
  }
  if (detail) {
    // console.log(`[Notifications] ${message}`, detail);
    return;
  }
  // console.log(`[Notifications] ${message}`);
}

/** Truncate Expo push tokens for safe debug output. */
export function maskPushToken(token: string): string {
  if (token.length <= 18) {
    return '***';
  }
  return `${token.slice(0, 18)}…`;
}
