# Patient app — API coverage report

**Date:** 2026-10-17  
**Contract:** `docs/audit/PatientMobile_Bind_APIs.md`  
**Base URL (app):** `API_CONFIG.new.baseUrl` → `https://devmaigrationapi.homeocentrum.com/` (**Q-ENV-1:** contract lists `devapi.homeocentrum.com` — not switched)  
**Auth:** OTP (`PatientAuth/*`) → Bearer via `prepareAuthHeaders` (**Q-AUTH-1:** contract mentions `Account/Login`)

## Legend

| Status | Meaning |
|---|---|
| Bound | Screen calls RTK hook; UI uses response; null hides |
| Partial | Hook called; some UI still local / demo |
| Stub only | Endpoint in RTK; screen unused or seed still primary |
| Deferred | Explicit `TODO(PAYMENT)` / `TODO(VIDEO-SDK)` |
| N/A | No contract route |

---

## Contract routes

| Contract § | Route | RTK | Screen | Status |
|---|---|---|---|---|
| 1 | `GET /api/Public/AppConfig` | `appConfigApi` | Support / Help / Offline | Bound |
| 2 | `GET /api/Public/Doctors` | `doctorsApi` | Search Results, Home | Bound |
| 2 | `GET /api/Public/Doctors/{id}` | `doctorsApi` | Doctor profile, Booking | Bound |
| 2 | Fees / Slots / Ranking | `doctorsApi` | Booking / Profile | Bound / Partial |
| 3 | Visit detail fee fields | `visitsApi` | Appointment / Clinic | Partial |
| 6 | `POST .../CheckIn` | `visitsApi` | Clinic check-in | Bound |
| 6b | `SwitchToTele` | `visitsApi` | Clinic appointment | Bound |
| 6b | `RunningLate` | `teleApi` | Check-in “tell clinic” | Bound (needs `teleSessionId`) |
| 7 | `POST .../AppointmentRequests` | `appointmentRequestsApi` | Booking waitlist CTA | Bound |
| 5 | `GET /api/Reviews/Mine` | `supportApi` | My reviews | Bound |
| 5 | `POST /api/Reviews/{id}/Appeal` | `supportApi` | Appeal review | Bound |
| 8 | `GET/POST/PUT/DELETE Reminders` | `remindersApi` | Reminders centre | Bound (list/create/done) |
| 9 | `GET/PUT Notifications/Preferences` | `notificationsApi` | Notification settings | Bound |
| 9 | `POST MarkAllRead` | `notificationsApi` | Inbox | Stub / Partial |
| 10 | `POST Public/.../Bookings` | `bookingApi` | Book appointment | Bound (`TODO(PAYMENT)` after) |
| 10 | Slots | `doctorsApi` | Book appointment | Bound |
| 10 | ConsultOrders / Razorpay | payments | Booking payment | Deferred |
| 10 | MedicineOrders pay | medicinesApi | Medicine checkout | Deferred |
| 10 | Pharmacy/Sellers | medicinesApi | Choose pharmacy | Bound (name/area) |
| 10 | Tele Token | teleApi | Join | Deferred (video SDK) |
| 10 | Public/Articles | homeApi | Home + tip article | Bound |
| 10 | Family / BookAs | familyApi / bookingApi | Booking member | Bound |
| — | CareCategories | homeApi | Home | Bound |
| 4 | Patient/Progress | progressApi | Health insights / CliniSight | Partial (pre-existing) |

---

## Screen summary

| Screen | Binding |
|---|---|
| Support / contact | AppConfig phones/email/WhatsApp null-hide |
| Search results | Public Doctors + fees; no invented languages/years |
| Doctor profile | Detail + fees + reviews; credentials null-hide |
| Booking + slots | Slots + create booking / BookAs; AppointmentRequests on ask-time |
| Home | Articles + care categories; doctors list |
| Visit / clinic | Detail fields; CheckIn; SwitchToTele; RunningLate |
| My reviews / appeal | Mine + Appeal |
| Reminders | Patient/Reminders |
| Notification settings | Preferences |
| Pharmacy choose | Sellers name/area; prices hidden |
| Payment / video / consult-now | Deferred or still local fees |

---

## Open questions

1. **Q-ENV-1** — Confirm production/dev host (`devapi` vs `devmaigrationapi`).
2. **Q-AUTH-1** — Confirm OTP vs `Account/Login` as patient token source.
3. Help CMS slug map for L4 articles → topic list.
4. Instant consult product flag (not in AppConfig).

## Verification

- `npx tsc --noEmit`: clean except pre-existing missing `expo-location` types.
- Phase logs: `docs/audit/02_screen_log.md`, `docs/audit/04_static_rescan.md`.
