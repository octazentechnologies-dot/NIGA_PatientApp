# Patient App — Backend API Requirements

| Field | Value |
|---|---|
| **Title** | NIGA Patient Mobile — Backend API Requirements |
| **Date** | 2026-10-17 (refreshed) |
| **App** | `niga_patientapp` v1.0.0 |
| **Branch / commit** | `Devlopment_1.1` @ `48d7507` |
| **Audience** | Backend developer (no app code access required) |
| **Produced by** | Screen-by-screen analysis of `src/views/*` + `src/controllers/*` + `src/store/api/new/*` against `docs/audit/PatientMobile_Bind_APIs.md`, `docs/audit/01_discovery.md`, `02_screen_log.md`, `PATIENT_APP_API_COVERAGE_REPORT.md`. Read-only on app code; this file is the only write target for this task. |
| **Companion** | `PatientApp_Backend_Message.md`, `PatientApp_Backend_Requirements.csv` |
| **Screens analysed** | 65 primary views + 9+ sheets/modals (see §3.4 / Appendix A) |

## Conventions (must match existing New API)

- **Base URL (contract):** `https://devapi.homeocentrum.com/` — paths start with `/api`.
- **App today:** `https://devmaigrationapi.homeocentrum.com/` via `API_CONFIG.new.baseUrl` (`src/config/apiConfig.ts`). See **Q1 / BE-001**.
- **Auth:** `Authorization: Bearer <token>`. App obtains token from **OTP** (`POST /api/PatientAuth/RequestOtp` + `VerifyOtp` → `token`). Contract text also mentions `POST /api/Account/Login` — clarify in **Q2**.
- **Public (no token required):** `GET /api/Public/AppConfig`, `GET /api/Public/Doctors` (and list variants).
- **Patient identity:** Resolved from token (`RoleName = Patient` + patient-user map). App must not send another patient’s id except `memberPatientId` / family member ids in family flows.
- **JSON:** camelCase; `null` is meaningful (hide row in UI).
- **Success:** `{ "success": true, "data": ... }`.
- **Failure:** `{ "success": false, "code": "...", "message": "..." }` with HTTP 400 / 403 / 404.
- **Missing / invalid token:** HTTP **401** with **empty body**.
- **Dates:** `YYYY-MM-DD` for calendar days; `HH:mm` for times; ISO-8601 local/server datetime for timestamps (`dueAt`, `holdExpiresAt`, `createdAt`).
- **Examples:** Fictitious people only (e.g. Meera Joshi, patientId 5012). No real phones/emails/health data.

---

## 3.2 Executive summary

| Type | Count |
|---|---|
| `NEW_ROUTE` | 6 |
| `EXTEND_ROUTE` | 19 |
| `FIX_ROUTE` | 5 |
| `CONFIG` | 1 |
| `CLARIFY` | 4 |
| `PHASE2` | 8 |
| **Total requests** | **43** |

| Priority | Count |
|---|---|
| P1 | 12 |
| P2 | 17 |
| P3 | 6 |
| PHASE2 | 8 |

### Build this first (P1 order)

1. **BE-001** — Confirm / publish base URL used by patient app (env).
2. **BE-002** — Document OTP as patient auth SoT (or provide Login parity).
3. **BE-003** — Populate AppConfig support channels (CONFIG).
4. **BE-004** — AppConfig feature flags: `instantConsultEnabled`, `medicineOnlinePayEnabled`.
5. **BE-005** — AppointmentRequests: list + status + proposed time + patient respond/cancel.
6. **BE-006** — Notifications: `type` + `deepLink` (+ wire MarkAllRead is app-side; route exists).
7. **BE-007** — Visit check-in: meaningful `readyAt` / queue refresh contract.
8. **BE-008** — Ensure `teleSessionId` always present on tele visits (list + detail).
9. **BE-009** — Doctor directory filter masters (cities; optional qualifications list).
10. **BE-010** — Pharmacy seller quote facts **or** formal “quote after order” contract.
11. **BE-011** — Instant consult offer: fee fields from API (no platform-fee invention).
12. **BE-012** — Erx: signed PDF / share URL for prescription screen.

---

## 3.3 Priority-ordered request index

| ID | Priority | Type | Screen(s) | Method + Path | Purpose |
|---|---|---|---|---|---|
| BE-001 | P1 | CLARIFY | All | — | Confirm New API host for patient app |
| BE-002 | P1 | CLARIFY | Auth | OTP vs Login | Auth SoT for Bearer token |
| BE-003 | P1 | CONFIG | Help / Book with help / Offline | `GET /api/Public/AppConfig` | Set supportPhone / WhatsApp / Email |
| BE-004 | P1 | EXTEND_ROUTE | Home / Consult now / Medicines | `GET /api/Public/AppConfig` | Feature flags for instant + medicine online pay |
| BE-005 | P1 | NEW_ROUTE | Booking ask-time / Appointments | `GET/PATCH/DELETE /api/Patient/AppointmentRequests…` | Patient sees status / proposal / cancel |
| BE-006 | P1 | EXTEND_ROUTE | Notifications | `GET /api/Notifications` | `type`, `deepLink` on items |
| BE-007 | P1 | FIX_ROUTE | Clinic check-in | `POST …/CheckIn` | `readyAt` + queue refresh rules |
| BE-008 | P1 | FIX_ROUTE | Visit detail / Waiting / Join / Late | Visits list/detail | Guarantee `teleSessionId` when tele |
| BE-009 | P1 | NEW_ROUTE | Search doctors | `GET /api/Public/Doctors/FilterOptions` | Cities (+ quals) for filters |
| BE-010 | P1 | EXTEND_ROUTE | Choose pharmacy | `GET /api/Pharmacy/Sellers` | Store or document quote fields |
| BE-011 | P1 | EXTEND_ROUTE | Consult now offer | `GET /api/Tele/Instant/{id}` | Fee breakdown on offer |
| BE-012 | P1 | FIX_ROUTE | Prescription | `GET /api/Erx/{erxSnapshotId}/Pdf` | Confirm PDF route + wireable response |
| BE-013 | P2 | EXTEND_ROUTE | Doctor profile / Search | Public Doctors | `nextAvailableAt` |
| BE-014 | P2 | EXTEND_ROUTE | Doctor profile / Clinic | Public Doctors + Visits | Street address / map |
| BE-015 | P2 | CLARIFY | Doctor profile | Public Doctors | `yearsExperience` / languages / education |
| BE-016 | P2 | EXTEND_ROUTE | Doctor credentials | Public Doctors/{id} | Structured qualifications (optional) |
| BE-017 | P2 | EXTEND_ROUTE | My reviews / Appeal | Reviews/Mine | Appeal status / outcome |
| BE-018 | P2 | NEW_ROUTE | Account | `GET /api/Patient/DataRequests` | List/status of data requests |
| BE-019 | P2 | CLARIFY | Account | — | Account delete vs DataRequest DELETE |
| BE-020 | P2 | EXTEND_ROUTE | Help centre | `GET /api/Help` | Topic taxonomy / slugs for UI |
| BE-021 | P2 | EXTEND_ROUTE | Progress / Insights | `GET /api/Patient/Progress` | `adherencePercent` or drop |
| BE-022 | P2 | EXTEND_ROUTE | Visit detail | `GET /api/Patient/Visits/{id}` | `followUpDate`, erx link |
| BE-023 | P2 | NEW_ROUTE | Order medicines | `GET/POST /api/Patient/DeliveryAddresses` | Delivery address book |
| BE-024 | P2 | EXTEND_ROUTE | Reminders | Reminders CRUD | Snooze + server push schedule |
| BE-025 | P2 | EXTEND_ROUTE | Notifications | `GET /api/Notifications` | Pagination |
| BE-026 | P2 | NEW_ROUTE | Home / Notifications | `GET /api/Notifications/UnreadCount` | Bell badge |
| BE-027 | P2 | EXTEND_ROUTE | Booking ask-time | `POST …/AppointmentRequests` | Idempotency-Key |
| BE-028 | P2 | FIX_ROUTE | Order tracking | Medicine tracking | Stable order id (no hardcode) |
| BE-029 | P2 | EXTEND_ROUTE | Search results | Public Doctors | Care-need / specialty filter param |
| BE-030 | P3 | EXTEND_ROUTE | Doctor profile availability | `GET /api/Tele/Availability/{id}` | Document shape for “next slot” UI |
| BE-031 | P3 | NEW_ROUTE | Articles | `POST …/Articles/{id}/Bookmark` | Optional bookmarks |
| BE-032 | P3 | EXTEND_ROUTE | Profile | PatientProfile/Me | Photo upload/remove |
| BE-033 | P3 | EXTEND_ROUTE | Legal | Policies | Versioned privacy/terms body |
| BE-034 | P3 | FIX_ROUTE | Notifications Mark all | `POST …/MarkAllRead` | Confirm envelope; app must call it |
| BE-035 | P3 | EXTEND_ROUTE | Visits list | `GET /api/Patient/Visits` | Filters + pagination |
| BE-P01 | PHASE2 | PHASE2 | Booking payment | ConsultOrders + Verify | Complete gateway contract |
| BE-P02 | PHASE2 | PHASE2 | Medicine checkout | MedicineOrders + Verify | Complete gateway contract |
| BE-P03 | PHASE2 | PHASE2 | Booking | Bookings hold | Slot release on `holdExpiresAt` |
| BE-P04 | PHASE2 | PHASE2 | Payments / Orders | Webhooks / status poll | Order status after pay |
| BE-P05 | PHASE2 | PHASE2 | Cancel / Refunds | Refunds/Policy | Cancellation fee rules |
| BE-P06 | PHASE2 | PHASE2 | Payments / Visit | Invoice/receipt URL | PDF after capture |
| BE-P07 | PHASE2 | PHASE2 | Video / Waiting | Tele Token + Session | Real vendor (`isStub=false`) |
| BE-P08 | PHASE2 | PHASE2 | Waiting room | Tele Sessions | Queue ETA / doctor status events |

---

## 3.4 Requests grouped by screen

### Splash — `src/views/SplashView.tsx`
- **Purpose:** Brand; timed advance; session restore.
- **Already served:** Refresh token via `api/Account/RefreshToken`.
- **Missing:** None for UI.
- **Requests:** None (env/auth clarified globally: BE-001, BE-002).

### First launch — `src/views/FirstLaunchView.tsx`
- **Already served:** `GET api/mastersAPI/GetLanguages`.
- **Missing:** None if masters stay populated.
- **Requests:** None.

### Onboarding — `src/views/OnboardingSlideView.tsx`
- Static slides. **No backend work.**

### Sign in — `src/views/SignInView.tsx` / OTP — `src/views/OtpVerificationView.tsx`
- **Already served:** `PatientAuth/RequestOtp`, `VerifyOtp`.
- **Missing:** Contract still cites `Account/Login`.
- **Requests:** BE-002.

### Complete profile — `src/views/CompleteProfileView.tsx`
- **Already served:** Genders, address cascade, `POST api/patient/`, `PatientProfile/Me`.
- **Missing (P3):** Photo upload/remove.
- **Requests:** BE-032.

### Consent / Phone setup
- **Already served:** Consent grant APIs; phone setup is OS-local.
- **Requests:** BE-033 (versioned notices polish).

### Family members — `src/views/FamilyMembersView.tsx`
- **Already served:** Family CRUD + Relations + Caregiver routes.
- **Missing:** None blocking (seeds cleared).
- **Requests:** None.

### Home — `src/views/HomeView.tsx`
- **Already served:** Home dashboard, Public Doctors, CareCategories, Articles, AppConfig.
- **Missing:** Instant consult flag; support channels; unread badge; filter cities used via search entry.
- **Requests:** BE-003, BE-004, BE-009, BE-026, BE-011 (via Consult now).

### My appointments — `src/views/MyAppointmentsView.tsx`
- **Already served:** Visits list (often via home mapping).
- **Missing:** Pagination/filters; appointment-request status list.
- **Requests:** BE-005, BE-035.

### Health records — `src/views/HealthRecordsView.tsx`
- **Already served:** Timeline, Documents, Erx by visit, Notes.
- **Missing:** Prescription PDF share URL surfaces here too.
- **Requests:** BE-012, BE-022.

### Medicines tab — `src/views/MedicinesView.tsx`
- **Already served:** MedicineOrders list, Refills.
- **Missing:** Feature flag for online pay; delivery addresses; seller quote facts.
- **Requests:** BE-004, BE-010, BE-023, BE-P02.

### Account — `src/views/AccountView.tsx`
- **Already served:** Profile Me, Logout, DataRequests POST (incl. DELETE type).
- **Missing:** DataRequests list/status; delete-account clarity.
- **Requests:** BE-018, BE-019, BE-032.

### Search doctors (entry) — `src/views/SearchDoctorsView.tsx`
- **Already served:** CareCategories (home API) partially overlaps.
- **Missing:** Cities list is **STATIC** (`CITIES` in `useSearchDoctorsController.ts` L20–24); nearby doctors **STATIC** (`DOCTORS` L26–43).
- **Requests:** BE-009, BE-029.

### Search results — `src/views/SearchResultsView.tsx`
- **Already served:** Public Doctors query params.
- **Missing:** Care-need specialty filter param; languages.
- **Requests:** BE-015, BE-029.

### Doctor profile + credentials — `DoctorProfileView.tsx`, `DoctorCredentialsTab.tsx`
- **Already served:** Doctors/{id}, Fees, Reviews/Doctor.
- **Missing:** next available; years/languages/education; street address; availability tab empty.
- **Requests:** BE-013, BE-014, BE-015, BE-016, BE-030.

### Book appointment + review — `BookAppointmentView.tsx`, `BookingReviewView.tsx`
- **Already served:** Slots, Bookings, BookAs, AppointmentRequests create, Terms.
- **Missing:** Patient-facing request status; idempotency; payment (Phase 2).
- **Requests:** BE-005, BE-027, BE-P01, BE-P03.

### Booking payment / Payment status
- **Already served (stubs):** ConsultOrders, Verify — **not wired** (`TODO(PAYMENT)` in `useBookAppointmentController.ts` ~L586).
- **Requests:** BE-P01 … BE-P06.

### Appointment / Clinic / Check-in / Reschedule / Cancelled
- **Already served:** Visit detail, CheckIn, SwitchToTele, Reschedule, Cancel, RunningLate.
- **Missing:** readyAt; teleSessionId reliability; street address; follow-up/erx links; queue live updates.
- **Requests:** BE-007, BE-008, BE-014, BE-022.

### Device check / Waiting / Join failed / Video / Chat / Complete / Rate
- **Already served:** DeviceCheck, Sessions, Token, Rejoin, JoinFailure, Chat, Summary, Reviews POST.
- **Missing:** Real vendor tokens; waiting ETA; demo timers in video UI.
- **Requests:** BE-P07, BE-P08, BE-008.

### Consult now (+ searching / unavailable / offer)
- **Already served:** Tele/Instant create/poll/cancel.
- **Missing:** Feature flag; fee fields on offer (app still uses `PLATFORM_FEE_RUPEES`).
- **Requests:** BE-004, BE-011, BE-P01 (if paid).

### Prescription — `PrescriptionView.tsx`
- **Already served (unused by screen):** `GET api/Erx/Patient/{patientAppId}` with medicine lines.
- **Missing for UX:** PDF URL; share/download currently **NO-OP** (`usePrescriptionController.ts` L65–66).
- **Requests:** BE-012.

### Consultation record
- **Already served:** Consultations/{id}/Note.
- **Requests:** None if note binding finishes on app side.

### Upload document / Follow-up / Symptom diary / Insights / CliniSight
- **Already served:** Documents CRUD; FollowUps; Diary CRUD; Progress.
- **Missing:** adherencePercent always null (contract).
- **Requests:** BE-021. Diary create exists — **no NEW_ROUTE** for diary write.

### Reminders centre
- **Already served:** Reminders CRUD.
- **Missing:** Snooze, server push scheduling, completion history list.
- **Requests:** BE-024.

### Health tip article
- **Already served:** Public Articles list/detail.
- **Missing (optional):** Bookmarks.
- **Requests:** BE-031.

### Order medicines / Choose pharmacy / Review / Checkout / Tracking / Details
- **Already served:** MedicineOrders, Sellers, Consent, AcceptQuote, Pay, Tracking, Refills.
- **Missing:** Seller price/ETA fields null; delivery addresses; tracking uses hardcoded `1209` in controller; payment Phase 2.
- **Requests:** BE-010, BE-023, BE-028, BE-P02, BE-P04, BE-P06.

### Payments ledger
- **Already served:** `GET api/Patient/Payments` (seed fallback still in controller).
- **Requests:** BE-P06 (receipts). History route OK if data populated.

### Consent centre / Legal
- **Already served:** Consents grant/withdraw; Privacy notices.
- **Requests:** BE-033.

### My reviews / Appeal
- **Already served:** Mine, Appeal, Create review.
- **Missing:** Appeal outcome/status on mine list; pending-to-rate visit cue is empty.
- **Requests:** BE-017, BE-022 (`canReview` already on visit actions).

### Help / Raise ticket / Book with help / Offline
- **Already served:** Help list/slug, Tickets, AssistanceRequest, AppConfig.
- **Missing:** Support channels CONFIG; Help topic taxonomy for UI.
- **Requests:** BE-003, BE-020.

### Notifications / Notification settings
- **Already served:** List, PATCH read, Preferences, MarkAllRead, Devices register.
- **Missing:** type/deepLink; MarkAllRead not called (app loops PATCH); unread count; pagination.
- **Requests:** BE-006, BE-025, BE-026, BE-034.

---

## 3.5 Full request specifications

#### BE-001 — Confirm New API host for patient app
- **Priority:** P1 | **Type:** CLARIFY
- **Screens:** All authenticated/public calls (`src/config/apiConfig.ts` L3–21)
- **Why:** Runtime host comes from `app.json` → `extra.apiBaseUrl` (currently `https://devmaigrationapi.homeocentrum.com/`). Fallback constant in `src/config/apiConfig.ts` is `https://devapi.homeocentrum.com/`. Contract lists `devapi`. Wrong host = silent 404 / stale API.
- **Method + Path:** N/A (ops/config)
- **Auth:** N/A
- **Business rules:** Single origin for New API; publish in env docs for patient + doctor apps.
- **Acceptance test:**
  - Hit `GET /api/Public/AppConfig` on chosen host → 200 + envelope.
  - Patient OTP against same host succeeds.
  - Document which host doctor app uses for parity.
- **Proposed default:** Confirm which host is SoT; app will set `extra.apiBaseUrl` to that origin only.

#### BE-002 — Auth SoT: OTP vs Account/Login
- **Priority:** P1 | **Type:** CLARIFY
- **Screens:** Sign in / OTP (`signInApi.ts`, `otpVerificationApi.ts`)
- **Why:** Contract header says Login; app only implements OTP.
- **Proposed default:** OTP is SoT for patients; Login optional/admin. Refresh via `Account/RefreshToken`, logout `Account/Logout` remain.
- **Acceptance test:** VerifyOtp returns Bearer usable on Patient routes; 401 empty body without token.

#### BE-003 — Populate AppConfig support channels
- **Priority:** P1 | **Type:** CONFIG
- **Screens:** HelpCentre, BookWithHelp, OfflineMode (`AppConfigProvider`, controllers)
- **Why:** UI hides Call/WhatsApp/Email when null (`PatientMobile_Bind_APIs.md` §1).
- **Method + Path:** `GET /api/Public/AppConfig` (unchanged)
- **Config keys:** `supportPhone`, `supportWhatsApp`, `supportEmail` (E.164 / mailto-ready strings or null)
- **Acceptance test:** Non-null phone → app shows Call; null → hidden, no invented clinic number.

#### BE-004 — AppConfig feature flags
- **Priority:** P1 | **Type:** EXTEND_ROUTE
- **Screens:** Home instant card, Consult now, Medicine checkout
- **Why:** Contract says flags not returned; app still shows instant consult UI / online pay paths without server kill-switch (`Bind_APIs` §1; `useConsultNowController.ts` PLATFORM_FEE).
- **Method + Path:** `GET /api/Public/AppConfig` — **add fields only**
- **Added fields:**

| name | type | nullable | meaning |
|---|---|---|---|
| instantConsultEnabled | boolean | no | Show Consult now entry |
| medicineOnlinePayEnabled | boolean | no | Allow ONLINE pay mode |

- **Success example:**
```json
{
  "success": true,
  "data": {
    "razorpayKeyId": "rzp_test_example",
    "siteUrl": "https://example.homeocentrum.com",
    "supportPhone": null,
    "supportWhatsApp": null,
    "supportEmail": null,
    "instantConsultEnabled": false,
    "medicineOnlinePayEnabled": false
  }
}
```
- **Errors:** unchanged.
- **Acceptance test:** Flags false → app hides CTAs; true → CTAs shown.

#### BE-005 — AppointmentRequests patient lifecycle
- **Priority:** P1 | **Type:** NEW_ROUTE
- **Screens:** Booking ask-time (`useBookAppointmentController.ts` create); My appointments (no status UI today)
- **Why:** Create exists (`POST /api/Patient/AppointmentRequests` → PENDING). Doctor can accept/decline/propose; **patient has no list/status/cancel/accept-proposal**.
- **Auth:** Bearer; patient from token
- **Routes:**

1. `GET /api/Patient/AppointmentRequests`
```json
{
  "success": true,
  "data": [
    {
      "appointmentRequestId": 9001,
      "doctorId": 104,
      "doctorName": "Meera Joshi",
      "requestedDate": "2026-10-20",
      "requestedTime": "10:30",
      "consultMode": "Tele",
      "reason": "Fever for two days",
      "status": "PENDING",
      "proposedDate": null,
      "proposedTime": null,
      "doctorMessage": null,
      "createdAt": "2026-10-16T09:00:00",
      "updatedAt": "2026-10-16T09:00:00"
    }
  ]
}
```

2. `DELETE /api/Patient/AppointmentRequests/{appointmentRequestId}` — cancel while PENDING (or PROPOSED before accept).

3. `POST /api/Patient/AppointmentRequests/{appointmentRequestId}/Respond`
```json
{ "action": "ACCEPT_PROPOSAL" }
```
or `{ "action": "DECLINE_PROPOSAL" }`.

- **Status enum:** `PENDING` | `ACCEPTED` | `DECLINED` | `PROPOSED` | `CANCELLED` | `EXPIRED`
- **Business rules:** Ownership = requesting patient (or family booker). ACCEPT_PROPOSAL creates visit (same as doctor accept). Doctor-app side effect: status sync on doctor inbox.
- **Errors:** 403 FORBIDDEN other patient; 409 CONFLICT invalid transition; 404 NOT_FOUND.
- **Acceptance test:** Create → list shows PENDING; doctor proposes → patient ACCEPT → visit appears; DELETE cancels PENDING.

#### BE-006 — Notification type + deepLink
- **Priority:** P1 | **Type:** EXTEND_ROUTE
- **Screens:** `NotificationsView.tsx` / `useNotificationsController.ts` (client guesses filter from title keywords L140–145)
- **Method + Path:** `GET /api/Notifications` — add fields; unchanged otherwise
- **Added fields:**

| name | type | nullable | meaning |
|---|---|---|---|
| type | string | no | `APPOINTMENT` \| `PRESCRIPTION` \| `MEDICINE` \| `PAYMENT` \| `SYSTEM` \| `MARKETING` |
| deepLink | string | yes | App path e.g. `niga://visit/88120` |

- **Acceptance test:** Item with type MEDICINE filters correctly without title heuristics; null deepLink → open detail only.

#### BE-007 — Check-in readyAt + queue refresh
- **Priority:** P1 | **Type:** FIX_ROUTE
- **Screens:** `ClinicCheckInView.tsx`; mutation in `visitsApi.ts` CheckIn
- **Current:** `readyAt` always null; `waitMinutes` hidden in app; demo cards remain.
- **Expected:** When status WAITING, return `queuePosition` (int|null) and either `readyAt` (ISO) **or** documented `estimatedWaitMinutes` (int|null). If not stored, return null and document “never estimated”.
- **Also document:** Client may poll `GET /api/Patient/Visits/{id}` every N seconds for queuePosition.
- **Acceptance test:** CheckIn WAITING → queuePosition integer when clinic queue exists; otherwise null without inventing.

#### BE-008 — teleSessionId on tele visits
- **Priority:** P1 | **Type:** FIX_ROUTE
- **Screens:** Running late (`useAppointmentDetailController.ts` L909–911 returns early if null); Chat; Join; Waiting
- **Current:** Field optional; often missing → late/join no-ops.
- **Expected:** For `isTele=true` and status not CANCELLED/COMPLETED (pre-session), `teleSessionId` non-null once session row exists; after end may remain for rejoin window.
- **Acceptance test:** Book tele → detail has teleSessionId before join; RunningLate 200.

#### BE-009 — Doctor filter options (cities)
- **Priority:** P1 | **Type:** NEW_ROUTE
- **Screens:** Search entry STATIC cities (`useSearchDoctorsController.ts` L20–24)
- **Method + Path:** `GET /api/Public/Doctors/FilterOptions`
- **Auth:** none (public)
- **Success:**
```json
{
  "success": true,
  "data": {
    "cities": [{ "city": "Pune", "doctorCount": 12 }],
    "qualifications": [{ "name": "BHMS", "doctorCount": 40 }]
  }
}
```
- **Acceptance test:** Cities reflect distinct non-null `city` on doctor rows; empty array if none.

#### BE-010 — Pharmacy seller commercial fields
- **Priority:** P1 | **Type:** EXTEND_ROUTE
- **Screens:** `ChoosePharmacyView` / `useChoosePharmacyController` (prices hidden; name+area only)
- **Current (contract):** `priceTotal`, `deliveryFee`, `etaMinutes`, `fulfilPercent`, `distanceKm`, `serviceable` always null.
- **Decision needed:** Store them **or** move quoting to post-`AcceptQuote` only.
- **If store (preferred for compare UI):** populate on `GET /api/Pharmacy/Sellers` as nullable numbers/booleans.
- **If not store:** document that compare UI is name/area only; quote amounts appear only on `AcceptQuote` / order detail — app keeps null-hide.
- **Acceptance test:** Either non-null quote fields for at least one test seller, or written “never stored” + AcceptQuote returns amount.

#### BE-011 — Instant consult offer fees
- **Priority:** P1 | **Type:** EXTEND_ROUTE
- **Screens:** Consult now offer (`useConsultNowController.ts` uses `PLATFORM_FEE_RUPEES`)
- **Method + Path:** `GET /api/Tele/Instant/{requestId}` when status OFFERED — **add**
- **Added fields:** `consultFee` (number|null), `currency` (string|null), `platformFee` (number|null — only if real), `totalPayable` (number|null)
- **Rule:** Never invent fixed 90. Null → hide rows.
- **Doctor-app side effect:** Offer must use same fee as doctor tele fee.
- **Acceptance test:** OFFERED payload includes consultFee matching doctor tele fee.

#### BE-012 — Prescription PDF download (confirm / complete J4)
- **Priority:** P1 | **Type:** FIX_ROUTE
- **Screens:** Prescription (`onShare`/`onDownload` NO-OP — `usePrescriptionController.ts` L65–66); Health records Erx
- **Why:** App comments document `GET /api/Erx/{erxSnapshotId}/Pdf` (`recordsApi.ts` L122) but **no RTK endpoint is injected** and the screen never calls it. Share/download are no-ops until backend confirms the route and response shape.
- **Method + Path:** `GET /api/Erx/{erxSnapshotId}/Pdf` (existing intended route — confirm)
- **Auth:** Bearer; patient resolved from token; owner of the visit that produced the snapshot (or caregiver with grant)
- **Query params:** none
- **Request body:** none
- **Success response (preferred — signed URL):**
```json
{
  "success": true,
  "data": {
    "erxSnapshotId": 7001,
    "pdfUrl": "https://devapi.homeocentrum.com/api/Erx/Files/example-signed.pdf",
    "expiresAt": "2026-10-17T12:00:00"
  }
}
```
| name | type | nullable | meaning |
|---|---|---|---|
| erxSnapshotId | number | no | Snapshot id |
| pdfUrl | string | yes | Absolute HTTPS URL; null if not yet signed |
| expiresAt | string | yes | ISO expiry of signed URL |

**Alternate:** `200` with `Content-Type: application/pdf` binary body (document which).
- **Errors:** 403 FORBIDDEN other patient; 404 NOT_FOUND unknown snapshot; 409 CONFLICT if Erx not signed (`erxSigned=false`)
- **Business rules:** Immutable once signed (product rule). Never invent medicines in PDF.
- **Notes for the app:** Wire `useLazyGetErxPdfQuery`; enable Share/Download only when `pdfUrl` non-null.
- **Acceptance test:**
  - Signed Erx for own visit → 200 + usable pdfUrl or PDF bytes.
  - Unsigned Erx → 409 or null pdfUrl (document which).
  - Other patient's snapshotId → 403 empty of clinical content.
  - Missing token → 401 empty body.

#### BE-013 — nextAvailableAt on doctor
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Doctor profile availability/footer (`nextAvailableKey` always empty in `useDoctorProfileController.ts`)
- **Add to Public Doctors card/detail:** `nextAvailableAt` (ISO|null) — next open slot start, or null.
- **Acceptance test:** Doctor with future slot → non-null; no slots → null.

#### BE-014 — Clinic street address / map
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Clinic appointment (only `clinicCity` today)
- **Add:** `clinicAddressLine` (string|null), keep `clinicMapLink` (string|null)
- **On:** Visit detail + optionally Public Doctors/{id}
- **Acceptance test:** Null hides address; non-null shows + directions.

#### BE-015 — yearsExperience / languages / education decision
- **Priority:** P2 | **Type:** CLARIFY
- **Screens:** Search filters / profile chips (hidden today)
- **Options:** (A) store and return arrays/strings; (B) permanently omit (app keeps hide).
- **Proposed default:** (B) omit; do not return always-null `yearsExperience`.
- **Acceptance test:** Documented decision in API changelog.

#### BE-016 — Structured qualifications on profile
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Credentials tab (only qualification + passingUniversity)
- **Optional add:** `qualifications: [{ name, institute, year }]` — only if stored; else skip.
- **Compliance note:** Do not invent Focus/CareLink blocks.

#### BE-017 — Review appeal status
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** My reviews / Appeal
- **Add on Mine items:** `appealStatus` (`NONE`|`OPEN`|`ACCEPTED`|`REJECTED`), `appealReason`, `appealedAt`
- **Doctor-app side effect:** Governance queue for OPEN appeals.
- **Acceptance test:** After Appeal POST, Mine shows OPEN.

#### BE-018 — DataRequests list/status
- **Priority:** P2 | **Type:** NEW_ROUTE
- **Screens:** Account (POST only today via `useCreateDataRequestMutation`)
- **Method + Path:** `GET /api/Patient/DataRequests`
```json
{
  "success": true,
  "data": [
    {
      "dataRequestId": 1,
      "requestType": "EXPORT",
      "status": "PENDING",
      "createdAt": "2026-10-16T10:00:00",
      "completedAt": null,
      "downloadUrl": null
    }
  ]
}
```
- **Ownership:** Token patient only.
- **Acceptance test:** POST EXPORT → list PENDING; completed → downloadUrl non-null or documented async channel.

#### BE-019 — Delete account policy
- **Priority:** P2 | **Type:** CLARIFY
- **Screens:** Account sends `DataRequests` with `requestType: 'DELETE'` (`useAccountController.ts` ~L193)
- **Contract:** No `DELETE /api/Account`.
- **Proposed default:** Keep request workflow; add status via BE-018; do **not** hard-delete token immediately.
- **Acceptance test:** DELETE request creates row; login still works until ops completes; document SLA.

#### BE-020 — Help topic taxonomy
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Help centre uses local `HELP_TOPICS` (`useHelpCentreController.ts`); `GET /api/Help` prefetched unused for taxonomy
- **Expected `GET /api/Help` items:** `slug`, `title`, `category`, `sortOrder`, `bodyAvailable`
- **Acceptance test:** App can render topics from API without local list.

#### BE-021 — adherencePercent
- **Priority:** P2 | **Type:** EXTEND_ROUTE or CONFIG decision
- **Screens:** Health insights / CliniSight
- **Current:** always null (not stored).
- **Decision:** Compute from diary/reminders **or** remove field.
- **Proposed default:** Remove from payload until computed; app hides.

#### BE-022 — Visit follow-up + erx link
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Visit detail / Records
- **Add:** `followUpDate` (YYYY-MM-DD|null), `erxSnapshotId` (already), `erxPdfUrl` (null|string)
- **Acceptance test:** Completed visit with signed Erx exposes erxSnapshotId + pdfUrl.

#### BE-023 — Delivery addresses CRUD
- **Priority:** P2 | **Type:** NEW_ROUTE
- **Screens:** Order medicines / checkout (pincode often local)
- **Routes:**
  - `GET /api/Patient/DeliveryAddresses`
  - `POST /api/Patient/DeliveryAddresses` body `{ label, line1, line2, city, state, pincode, isDefault }`
  - `PUT /api/Patient/DeliveryAddresses/{id}`
  - `DELETE /api/Patient/DeliveryAddresses/{id}`
- **Ownership:** Token patient.
- **Acceptance test:** Create default → list returns one; delete removes.

#### BE-024 — Reminder snooze + push schedule
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Reminders centre editor (snooze UI local)
- **Add fields:** `snoozeMinutes` (number|null), `notifyPush` (bool)
- **Side effect:** If notifyPush, server schedules push respecting Notification Preferences quiet hours.
- **Acceptance test:** Create with snoozeMinutes=10; device receives push when due (staging).

#### BE-025 — Notifications pagination
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** `NotificationsView.tsx` / `useNotificationsController.ts` (loads full list today)
- **Method + Path:** `GET /api/Notifications` — add query; unchanged item shape otherwise
- **Query params:**

| name | type | required | rules |
|---|---|---|---|
| pageNumber | number | no | default 1, ≥1 |
| pageSize | number | no | default 20, max 100 |

- **Success:** wrap list with `totalRecords`, `pageNumber`, `pageSize` (same pattern as Articles).
- **Acceptance test:** page 2 returns next slice; totalRecords stable across pages.

#### BE-026 — Unread notification count
- **Priority:** P2 | **Type:** NEW_ROUTE
- **Screens:** Home bell badge (`HomeView` / home controller `notificationCount`)
- **Method + Path:** `GET /api/Notifications/UnreadCount`
- **Auth:** Bearer; patient from token
- **Success:**
```json
{ "success": true, "data": { "unread": 3 } }
```
- **Business rules:** Count only rows for token patient where `isRead=false`.
- **Acceptance test:** Mark one read → count decrements; other patient data never counted.

#### BE-027 — Idempotency on AppointmentRequests
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Header:** `Idempotency-Key: <uuid>` on POST create
- **Rule:** Same key + body within 24h returns original result; no duplicate PENDING rows.

#### BE-028 — Medicine order tracking id contract
- **Priority:** P2 | **Type:** FIX_ROUTE
- **Screens:** `useOrderTrackingController.ts` hardcodes `1209`
- **Expected:** Tracking only for orders returned by `GET /api/Patient/MedicineOrders`; document 404 when unknown.
- **Note:** Primarily app fix; backend must ensure list returns trackable ids.

#### BE-029 — Care-need / specialty filter
- **Priority:** P2 | **Type:** EXTEND_ROUTE
- **Screens:** Search filters (care needs local)
- **Add query on Public Doctors:** `careCategoryId` (number) matching CareCategories ids
- **Acceptance test:** Filter returns subset; invalid id → 400 VALIDATION.

#### BE-030 — Tele Availability shape for profile
- **Priority:** P3 | **Type:** EXTEND_ROUTE
- **Path exists:** `GET /api/Tele/Availability/{doctorId}`
- **Need:** Document response fields used for next-slot strip; align with BE-013.

#### BE-031 — Article bookmarks (optional)
- **Priority:** P3 | **Type:** NEW_ROUTE
- **POST/DELETE** `/api/Patient/ArticleBookmarks/{blogId}`; **GET** list.
- Place in Optional if capacity low.

#### BE-032 — Profile photo upload/remove
- **Priority:** P3 | **Type:** EXTEND_ROUTE
- **POST** `/api/PatientProfile/Photo` multipart; **DELETE** same.
- Return `photoUrl` on Me.

#### BE-033 — Versioned legal documents
- **Priority:** P3 | **Type:** EXTEND_ROUTE
- Ensure `Consent/Notice/{code}` and Policies/Terms return `version`, `effectiveAt`, full body for in-app Legal screens (today partly local).

#### BE-034 — MarkAllRead envelope confirmation
- **Priority:** P3 | **Type:** FIX_ROUTE (app usage) / confirm
- **Path exists:** `POST /api/Notifications/MarkAllRead`
- **App today:** loops per-item PATCH (`useNotificationsController.ts` L190–198)
- **Backend:** Keep `{ marked: n }`; no change required if already correct.
- **Acceptance test:** MarkAllRead marks all unread for token patient only.

#### BE-035 — Visits list filters/pagination
- **Priority:** P3 | **Type:** EXTEND_ROUTE
- **Query:** `status`, `fromDate`, `toDate`, `pageNumber`, `pageSize`

---

## 3.6 Data model hints (suggestion — backend decides)

| Entity | Key fields | Relations |
|---|---|---|
| AppointmentRequest | appointmentRequestId, patientId, doctorId, status, requested*, proposed*, reason | → Visit on ACCEPT |
| DeliveryAddress | addressId, patientId, pincode, isDefault | → MedicineOrder |
| Notification | +type, +deepLink | Patient |
| DataRequest | dataRequestId, requestType, status, downloadUrl | Patient |
| ArticleBookmark | patientId, blogId | Article |

---

## 3.7 Status and enum catalogue

| Domain | Values | Notes |
|---|---|---|
| Visit status | NOT ARRIVED, WAITING, WALK-IN, E-CONSULT, REMAINING, COMPLETED, CANCELLED | From visitsApi comments |
| Check-in | EARLY, WAITING, READY | CheckIn body |
| AppointmentRequest | PENDING, ACCEPTED, DECLINED, PROPOSED, CANCELLED, EXPIRED | **BE-005** |
| Review status | APPROVED, PENDING/MODERATION, REJECTED… | App maps APPROVED→published |
| Appeal | NONE, OPEN, ACCEPTED, REJECTED | **BE-017** |
| Reminder kind | MEDICINE, DIARY, APPT, CUSTOM… | Free string today |
| Payment order | PENDING, AWAITING_GATEWAY, PAY_AT_CLINIC, CAPTURED, FAILED | paymentsApi |
| Instant consult | OPEN, OFFERED, NO_DOCTOR, ACCEPTED, CANCELLED | teleApi |
| Tele session | Waiting, Active, Ended | teleApi |
| Tele event | RUNNING_LATE | RunningLate |
| Notification type | APPOINTMENT, PRESCRIPTION, MEDICINE, PAYMENT, SYSTEM, MARKETING | **BE-006** |
| DataRequest | EXPORT, DELETE, … + PENDING/COMPLETED/REJECTED | **BE-018** |
| ConsultMode | Tele, InClinic | Booking / requests |

Flag: app also uses UI statuses `waiting_acceptance`, `confirmed` on local `BookedAppointment` — map from API, do not store those strings server-side.

---

## 3.8 Phase 2 — Payment and Video (needed later)

#### BE-P01 — ConsultOrders + Verify (complete contract)
- **Type:** PHASE2 / FIX_ROUTE (routes exist in `paymentsApi.ts`)
- **Screens:** Booking payment (`TODO(PAYMENT)` `useBookAppointmentController.ts` L586)
- **Need:** Response always includes `gatewayReady`, `keyId` (or null), `data.amount`, `data.currency`, `data.gatewayOrderId`; Verify captures and releases hold.
- **keyId source:** Prefer order `keyId`; fallback AppConfig `razorpayKeyId`.
- **Acceptance:** Pay-at-clinic path without gateway; online path with test key.

#### BE-P02 — MedicineOrders payment
- **Type:** PHASE2
- **Path exists:** `POST /api/Payments/MedicineOrders`
- **Need:** Same gateway fields; respect `medicineOnlinePayEnabled` (BE-004).

#### BE-P03 — Hold expiry releases slot
- **Type:** PHASE2 / FIX_ROUTE
- **Field:** `holdExpiresAt` on booking create (`bookingApi.ts`)
- **Rule:** After expiry without capture, slot free; booking CANCELLED_HOLD or equivalent; client countdown authoritative with server time.

#### BE-P04 — Payment / order status via webhook + poll
- **Type:** PHASE2 / NEW_ROUTE (if missing)
- **GET** payment order by id; webhook from Razorpay updates CAPTURED/FAILED.

#### BE-P05 — Refund / cancellation fee rules
- **Type:** PHASE2
- **Path exists:** `Refunds/Policy/{paymentOrderId}`
- **Need:** Stable FULL/PARTIAL/NONE with amounts; app cancel sheet uses this instead of local 4h heuristic.

#### BE-P06 — Invoice / receipt URL
- **Type:** PHASE2 / EXTEND
- **Add** `receiptUrl` on payment history item and visit payment summary.

#### BE-P07 — Tele Token real vendor
- **Type:** PHASE2 / FIX_ROUTE
- **Path:** `POST /api/Tele/Sessions/{id}/Token`
- **Current type includes** `isStub: boolean` (`teleApi.ts`)
- **Need:** Production vendor token + `clientConfig`; `isStub=false` in staging with test project.

#### BE-P08 — Waiting-room live status
- **Type:** PHASE2 / EXTEND
- **Path:** `GET /api/Tele/Sessions/{id}`
- **Add:** `queuePosition`, `estimatedStartAt`, `doctorJoined`, `events[]`
- Replaces fake ETA / setTimeout auto-advance in waiting room / video demos.

---

## 3.9 Always-null / not-stored fields decision table

| Field | Where today | Screen | Needed? | Backend decision | App if dropped |
|---|---|---|---|---|---|
| yearsExperience | Public Doctors | Profile/Search | Weak | Drop or store (BE-015) | Hide |
| languages / education | Not returned | Profile/Search | Deferred | BE-015 | Hide |
| adherencePercent | Progress | Insights | Nice | BE-021 | Hide |
| readyAt | CheckIn | Check-in | Yes if ETA exists | BE-007 | Hide wait line |
| Pharmacy priceTotal etc. | Sellers | Pharmacy | Yes for compare | BE-010 | Name/area only |
| support* | AppConfig | Help | Yes for contact | BE-003 CONFIG | Hide buttons |
| platformFee | Visit detail | Fees | Only if real | Keep null rule | Hide |
| Notification type/deepLink | Missing | Inbox | Yes | BE-006 | Heuristic filters |

---

## 3.10 Open questions for the backend developer

1. **Q1 (BE-001):** Which host is canonical for patient New API — `devapi` or `devmaigrationapi`? **Default:** keep app host until you confirm.
2. **Q2 (BE-002):** Is OTP the only patient login? **Default:** yes.
3. **Q3 (BE-010):** Will pharmacy commercial fields be stored, or only post-quote? **Default:** post-quote only if storage is hard.
4. **Q4 (BE-015):** Will languages/education/years ever be stored? **Default:** no — omit.
5. **Q5 (BE-019):** Is DataRequest DELETE the approved account-closure path? **Default:** yes; no hard DELETE /api/Account.
6. **Q6 (BE-007):** Can clinics supply queue ETA, or always null? **Default:** null until clinic module exists.
7. **Q7 (BE-005):** Exact status names for doctor propose/accept — align with doctor app enums?
8. **Q8 (BE-004):** Default for new flags in production — false until product enables?

Reply format per BE id: `done | not planned | ETA | question`.

---

## 3.11 Suggested delivery plan

| Sprint | Deliver | Unblocks |
|---|---|---|
| S0 | BE-001, BE-002 | Correct environment + auth docs |
| S1 | BE-003, BE-004, BE-006, BE-008, BE-034 | Support, flags, notifications, tele actions |
| S2 | BE-005, BE-027, BE-009, BE-029 | Ask-time lifecycle + search filters |
| S3 | BE-007, BE-013, BE-014, BE-022, BE-012 | Clinic + profile + Rx PDF |
| S4 | BE-010, BE-011, BE-023, BE-028 | Pharmacy + instant fees + addresses |
| S5 | BE-017–BE-021, BE-024–BE-026, BE-035 | Reviews, progress, reminders, visits list |
| S6+ | BE-P01…BE-P08 | Payment + Video |

**App team after each item:** rebind hooks, remove null-hide where data arrives, delete TODO/PLATFORM_FEE/seeds, update coverage report.

---

## 3.12 Appendix A — Screen × API coverage matrix

| Screen | Existing APIs | Requested BE ids | After delivery |
|---|---|---|---|
| Splash | RefreshToken | BE-001 | OK |
| First launch | GetLanguages | — | OK |
| Onboarding | — | — | OK (static) |
| Sign in / OTP | PatientAuth/* | BE-002 | OK |
| Complete profile | patient/, masters, address | BE-032 | OK |
| Consent / Phone setup | Consent/* | BE-033 | OK |
| Family | Family/*, Caregiver/* | — | OK |
| Home | Home, Doctors, Articles, CareCategories, AppConfig | BE-003,4,9,26 | OK |
| My appointments | Visits | BE-005,35 | OK |
| Health records | Timeline, Docs, Erx, Notes | BE-012,22 | OK |
| Medicines | MedicineOrders, Refills | BE-004,10,23,P02 | OK |
| Account | Me, Logout, DataRequests POST | BE-018,19,32 | OK |
| Search entry | — (static cities) | BE-009,29 | OK |
| Search results | Public Doctors | BE-015,29 | OK |
| Doctor profile | Doctors/{id}, Fees, Reviews | BE-013–16,30 | OK |
| Booking / review | Slots, Bookings, BookAs, ApptRequests POST | BE-005,27,P01,P03 | OK |
| Payment / status | ConsultOrders (unwired) | BE-P01–P06 | OK |
| Visit / clinic / check-in | Visits, CheckIn, Switch, Late | BE-007,8,14,22 | OK |
| Tele stack | Sessions, Token, Chat, Summary | BE-008,P07,P08 | OK |
| Consult now | Tele/Instant | BE-004,11,P01 | OK |
| Prescription | Erx (unwired UI) | BE-012 | OK |
| Diary / Progress | Diary, Progress | BE-021 | OK |
| Reminders | Reminders CRUD | BE-024 | OK |
| Articles | Public Articles | BE-031 | OK |
| Pharmacy / orders | Sellers, Orders, Tracking | BE-010,23,28,P02,P04 | OK |
| Payments ledger | Patient/Payments | BE-P06 | OK |
| Reviews / Appeal | Mine, Appeal, Reviews POST | BE-017 | OK |
| Help / Tickets / Assist | Help, Tickets, Assistance, AppConfig | BE-003,20 | OK |
| Notifications / settings | Notifications, Prefs, Devices | BE-006,25,26,34 | OK |
| Offline | AppConfig + NetInfo | BE-003 | OK |
| Legal | Policies / Notices | BE-033 | OK |

---

## 3.13 Appendix B — Evidence (selected)

| BE | Evidence |
|---|---|
| BE-001 | `src/config/apiConfig.ts` L3–21 `devmaigrationapi`; contract `devapi` |
| BE-002 | `signInApi.ts` RequestOtp; `otpVerificationApi.ts` VerifyOtp; no Account/Login call |
| BE-003 | Bind §1 null support*; Help/BookWithHelp/Offline hide channels |
| BE-004 | Bind §1 “does not include instantConsultEnabled…”; Consult now still shown |
| BE-005 | `appointmentRequestsApi.ts` POST only; no GET list |
| BE-006 | `useNotificationsController.ts` L140–145 title heuristics; Bind §9 no type/deepLink |
| BE-007 | Bind §6 `readyAt` null; ClinicCheckIn wait hidden |
| BE-008 | `useAppointmentDetailController.ts` L909–911 early return if no teleSessionId |
| BE-009 | `useSearchDoctorsController.ts` L20–43 STATIC CITIES/DOCTORS |
| BE-010 | Bind §10 pharmacy fields null; ChoosePharmacy null-hide prices |
| BE-011 | `useConsultNowController.ts` `PLATFORM_FEE_RUPEES` |
| BE-012 | `usePrescriptionController.ts` L65–66 share/download `() => undefined`; `recordsApi.ts` L122 documents Pdf route but no injectEndpoints |
| BE-013 | `useDoctorProfileController.ts` `nextAvailableKey: ''` |
| BE-018 | Bind §10 “no list route”; Account POST only |
| BE-019 | `useAccountController.ts` DataRequest DELETE; Bind forbids DELETE /api/Account |
| BE-020 | `useHelpCentreController.ts` HELP_TOPICS local; getHelpArticles prefetch only |
| BE-028 | `useOrderTrackingController.ts` `useGetMedicineOrderTrackingQuery(1209` |
| BE-P01 | `useBookAppointmentController.ts` `TODO(PAYMENT)` ~L586 |
| BE-P07 | `teleApi.ts` TeleTokenResponse `isStub`; VideoCall DEMO timers |

---

## 3.14 Quality checklist (author)

- [x] Every BE-xxx tied to a screen/file signal
- [x] No duplicate of existing Bind contract routes except EXTEND/FIX
- [x] Every screen in §3.4 / Appendix A
- [x] Fictitious example people only
- [x] Payment/Video only in §3.8 (PHASE2)
- [x] Ownership stated for patient/family data routes
- [x] Open questions have proposed defaults

*End of requirements. Prefer questions in §3.10 over inventing fields.*
