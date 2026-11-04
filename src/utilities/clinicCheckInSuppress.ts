/**
 * Session-scoped suppress for clinic "checked in" UI after reschedule.
 * The API currently preserves WAITING/WALK-IN across RescheduleAppointment;
 * the patient app must not treat that leftover status as a fresh check-in.
 */
const suppressedPatientAppIds = new Set<string>();

export function markClinicCheckInSuppressed(
  patientAppId: string | number,
): void {
  suppressedPatientAppIds.add(String(patientAppId));
}

export function clearClinicCheckInSuppress(
  patientAppId: string | number,
): void {
  suppressedPatientAppIds.delete(String(patientAppId));
}

export function isClinicCheckInSuppressed(
  patientAppId: string | number,
): boolean {
  return suppressedPatientAppIds.has(String(patientAppId));
}
