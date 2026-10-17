# Phase 3 — Screen binding log

Append one section after each screen. Contract: `docs/audit/PatientMobile_Bind_APIs.md`.

## Foundation (Phase 2) — 2026-10-17

**Changed**
- `src/utilities/apiResponse.ts`, `src/utilities/formatters.ts`
- `src/constants/statusMaps.ts`
- `src/components/{LoadingState,EmptyState,ErrorState,NullableRow}.tsx`
- `src/store/api/new/appConfigApi.ts`, `remindersApi.ts`, `appointmentRequestsApi.ts`
- Extended: `visitsApi` (CheckIn, SwitchToTele + fee fields), `teleApi` (RunningLate), `supportApi` (Mine/Appeal), `notificationsApi` (Preferences/MarkAllRead), `doctorsApi` (qualification/sortBy/photo fields), cache tags on `newBaseApi`
- `src/providers/AppConfigProvider.tsx` wired in `App.tsx`
- Contract copy: `docs/audit/PatientMobile_Bind_APIs.md`

**Environment:** `API_CONFIG.new.baseUrl` remains `https://devmaigrationapi.homeocentrum.com/` (Q-ENV-1). Contract asks for `devapi.homeocentrum.com` — not silently switched.

**Remaining gaps:** Screen UIs still use static data until Phase 3 bindings.

---

## 3.2 Support / Help / Contact — 2026-10-17

**Status:** Partial → Dynamic for contact channels  
**Files:** `useBookWithHelpController.ts`, `useHelpCentreController.ts`, `useOfflineModeController.ts`, `HelpCentreView.tsx`, `BookWithHelpView.tsx`, `OfflineModeView.tsx`, AppConfig provider  
**Logic:** Call / WhatsApp / email only when AppConfig fields non-null; hide otherwise; neutral “Support contact not available yet”.  
**Gaps:** Help topic taxonomy still local (`HELP_TOPICS`); L4 articles prefetched but not rendered as topic list (CMS slug map missing — backend/product gap).

---

## 3.4 Doctor directory (Search Results) — 2026-10-17

**Status:** Partial → Mostly dynamic  
**Files:** `useSearchResultsController.ts`, `models/search.ts`, `SearchResultsView.tsx`, `doctorsApi.ts` types  
**Logic:** Removed `RESULTS` seed + fake timers; query uses `q/city/teleOnly/isOnline/minFee/maxFee/sortBy/page`; fees via `formatMoney`; rating hidden when `reviewCount` 0; no invented languages/years/gender.  
**Gaps:** Client-side filter sheet still partially applied for care-needs (not on API — logged); Search entry screen still has city/nearby seeds (3.4 entry pending); infinite scroll pageNumber ready but UI load-more not wired yet.

---

## 3.3 Home (partial) — 2026-10-17

**Files:** `useHomeController.ts` — removed hardcoded `₹500` fee label (blank until visit list exposes fee).  
**Gaps:** Articles/care categories unused; consult-now constants remain.

---

## 3.5 Doctor profile — 2026-10-17

**Status:** Partial → Mostly dynamic (API doctors)  
**Files:** `useDoctorProfileController.ts`, `DoctorProfileView.tsx`, `DoctorCredentialsTab.tsx`, `doctorProfiles.ts`, booking fee consumers  
**Logic:** Bind G2 detail + Fees/Public + reviews; `formatMoney` for tele/clinic fees; rating hidden when `reviewCount` 0; no invented years/languages/focus/CareLink; registration row only when `registrationNumber` present; legacy non-numeric ids stripped of seed fees.  
**Gaps:** Availability tab still static “no slots” copy (slots live on booking screen).

---

## 3.3 Home articles + categories — 2026-10-17

**Status:** Partial → Dynamic for articles/categories  
**Files:** `useHomeController.ts`, `HomeView.tsx`, `useHealthTipController.ts`, `HealthTipArticleView.tsx`  
**Logic:** `useGetCareCategoriesQuery` / `useGetArticlesQuery`; category tap → search results `q=name`; article cards open `GET /api/Public/Articles/{id}`; null-hide empty sections; removed invented instant-consult fee label from home card.  
**Gaps:** Consult-now wait/availability constants still local; search entry still uses local care-category images.

---

## 3.9–3.11 Visit detail / check-in / switch / late — 2026-10-17

**Status:** Partial → Mutations wired  
**Files:** `useAppointmentDetailController.ts`, `ClinicAppointmentView.tsx`, `ClinicCheckInView.tsx`  
**Logic:** `useCheckInVisitMutation` (WAITING), `useSwitchVisitToTeleMutation`, `useReportRunningLateMutation` when `teleSessionId` present; clinic name/city/phone/map/fee/queue from visit detail with null-hide; removed hardcoded Pune address / tel / queue=2 / wait=15.  
**Gaps:** Check-in screen still shows three demo state cards (actions live); wait ETA not on API (`readyAt` always null).

---

## 3.7 AppointmentRequests — 2026-10-17

**Status:** Wired on booking waitlist CTA  
**Files:** `useBookAppointmentController.ts`  
**Logic:** `useCreateAppointmentRequestMutation` (`POST /api/Patient/AppointmentRequests`) replaces legacy waitlist mutation for “ask for a time”.  
**Gaps:** No request-history list (none in contract).

---

## 3.12–3.16 Reviews / reminders / notifs / pharmacy — 2026-10-17

**Status:** Partial → Dynamic  
**Files:** `useMyReviewsController`, `useAppealReviewController`, `useRemindersCentreController`, `useNotificationSettingsController`, `useChoosePharmacyController` + views  
**Logic:** Mine/Appeal; Reminders CRUD list + mark done + create; Preferences GET/PUT + offsets; Pharmacy sellers name/area only (prices null-hidden).  
**Gaps:** Notifications inbox still maps API without deepLink/type; Consult-now / payment / video still deferred.

---

## 3.6 Booking + slots — 2026-10-17

**Status:** Partial → Mostly dynamic (payment deferred)  
**Files:** `useBookAppointmentController.ts`, `BookAppointmentView.tsx`, `BookingReviewView.tsx`  
**Logic:** `useGetDoctorSlotsQuery` for selected date; no fabricated slot grids for API doctors; `useCreateBookingMutation` / `BookAs` on pay; fees from Fees/Public / doctor profile; `PLATFORM_FEE=90` removed from this path; empty slots → ask-for-time CTA; `TODO(PAYMENT)` before ConsultOrders/Razorpay.  
**Gaps:** Calendar still uses local month builder (dates only); hold countdown UI not yet bound to `holdExpiresAt` in payment screen; AppointmentRequests (§3.7) not yet a separate form (waitlist used as interim).

---
