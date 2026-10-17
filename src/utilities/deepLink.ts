/**
 * Allow-list deep links from notifications (BE-006).
 * Unknown / absolute http(s) outside our app schemes → ignore (stay on list).
 */
const ALLOWED_PREFIXES = [
  'homeo://',
  'hellohomeo://',
  '/appointments',
  '/visits',
  '/prescriptions',
  '/medicines',
  '/orders',
  '/notifications',
  '/reminders',
  '/account',
  '/caregiver',
  '/help',
  '/reviews',
];

export type DeepLinkTarget =
  | { kind: 'appointments' }
  | { kind: 'visits'; patientAppId?: number }
  | { kind: 'prescriptions' }
  | { kind: 'medicines' }
  | { kind: 'orders'; medicineOrderId?: number }
  | { kind: 'reminders' }
  | { kind: 'account' }
  | { kind: 'caregiver' }
  | { kind: 'help' }
  | { kind: 'reviews' }
  | { kind: 'unknown' };

export function resolveNotificationDeepLink(
  deepLink: string | null | undefined,
): DeepLinkTarget | null {
  if (deepLink == null) {
    return null;
  }
  const raw = deepLink.trim();
  if (!raw) {
    return null;
  }
  // Reject open web URLs — never open arbitrary https.
  if (/^https?:\/\//i.test(raw)) {
    return { kind: 'unknown' };
  }
  const allowed = ALLOWED_PREFIXES.some(
    (p) => raw === p || raw.startsWith(p) || raw.startsWith(p.replace(/^\//, '')),
  );
  if (!allowed && !raw.startsWith('/')) {
    return { kind: 'unknown' };
  }
  const path = raw.replace(/^(homeo|hellohomeo):\/\//i, '/').replace(/^\//, '');
  const [head, idPart] = path.split(/[/?]/);
  const id = idPart && /^\d+$/.test(idPart) ? Number(idPart) : undefined;
  switch (head.toLowerCase()) {
    case 'appointments':
    case 'appointment':
      return { kind: 'appointments' };
    case 'visits':
    case 'visit':
      return { kind: 'visits', patientAppId: id };
    case 'prescriptions':
    case 'prescription':
    case 'erx':
      return { kind: 'prescriptions' };
    case 'medicines':
    case 'medicine':
      return { kind: 'medicines' };
    case 'orders':
    case 'order':
      return { kind: 'orders', medicineOrderId: id };
    case 'reminders':
      return { kind: 'reminders' };
    case 'account':
      return { kind: 'account' };
    case 'caregiver':
      return { kind: 'caregiver' };
    case 'help':
      return { kind: 'help' };
    case 'reviews':
      return { kind: 'reviews' };
    default:
      return { kind: 'unknown' };
  }
}
