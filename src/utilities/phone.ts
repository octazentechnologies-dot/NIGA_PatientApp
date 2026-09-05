export function formatIndianMobileDisplay(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    return `+91 ${digits}`.trim();
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
