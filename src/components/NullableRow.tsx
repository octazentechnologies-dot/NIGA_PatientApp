import type { ReactNode } from 'react';

type Props = {
  /** When null/undefined, render nothing. Empty string is treated as missing. */
  value: unknown;
  children: ReactNode;
};

/**
 * Renders children only when `value` is present.
 * Contract rule: `null` means hide the row — never "N/A" or "0".
 */
export function NullableRow({ value, children }: Props) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return <>{children}</>;
}
