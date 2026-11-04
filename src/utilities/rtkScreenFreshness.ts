import { useEffect, useRef } from 'react';

import { newBaseApi } from '../store/api/new/newBaseApi';
import { useAppDispatch } from '../store/hooks';

/**
 * Live-query policy (PatientApp ADR — no polling):
 *
 * - **Mutable** user-visible lists/details (Slots, Visits, Timeline, Orders,
 *   Doctors browse, DoctorProfile, Prescriptions…):
 *   `refetchOnMountOrArgChange: true` **and/or** `useInvalidateOnActive` on
 *   the screen’s `active` rising edge. Prefer tag invalidation on enter over
 *   long TTLs. Slots are per `{doctorId,date}` — one day never refreshes another.
 * - **Semi-static** (fees, filter options, account profile): `30` / `60` OK.
 * - **Always** rely on store `setupListeners` (`refetchOnFocus` /
 *   `refetchOnReconnect`). Never `setInterval` for freshness.
 *
 * Tags listed here are the ones screens should invalidate on activate.
 */
export type LiveQueryTag =
  | 'Slots'
  | 'Visits'
  | 'VisitDetail'
  | 'Doctors'
  | 'DoctorProfile'
  | 'Timeline'
  | 'Prescriptions'
  | 'Documents'
  | 'Orders'
  | 'FollowUps'
  | 'Family'
  | 'Bookings'
  | 'Notifications'
  | 'AppointmentRequests';

/**
 * Live-query hygiene for PatientApp overlays (no React Navigation focus).
 *
 * On the rising edge of `active`, invalidate mutable RTK tags so subscribed
 * queries refetch. Never polls — event-driven only.
 */
export function useInvalidateOnActive(
  active: boolean,
  tags: readonly LiveQueryTag[],
): void {
  const dispatch = useAppDispatch();
  const wasActiveRef = useRef(false);
  const tagsKey = tags.join('|');

  useEffect(() => {
    if (!active) {
      wasActiveRef.current = false;
      return;
    }
    if (wasActiveRef.current) {
      return;
    }
    wasActiveRef.current = true;
    if (tags.length === 0) {
      return;
    }
    dispatch(newBaseApi.util.invalidateTags([...tags]));
  }, [active, dispatch, tags, tagsKey]);
}

/**
 * On rising edge of `active`, call `refetch` after the query has subscribed
 * (`skip` flipped false). Avoids the race where invalidate runs before the
 * hook is listening.
 */
export function useRefetchOnActive(
  active: boolean,
  refetch: (() => unknown) | undefined,
  enabled = true,
): void {
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (!active) {
      wasActiveRef.current = false;
      return;
    }
    if (wasActiveRef.current || !enabled || !refetch) {
      return;
    }
    wasActiveRef.current = true;
    const id = requestAnimationFrame(() => {
      void Promise.resolve(refetch()).catch(() => undefined);
    });
    return () => cancelAnimationFrame(id);
  }, [active, enabled, refetch]);
}
