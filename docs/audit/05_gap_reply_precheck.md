# Gap Reply execution — Phase 1 pre-check (2026-10-17)

Source: `PatientApp_Backend_Gap_Reply_17102026.md`

## Host

| Location | Value |
|---|---|
| `src/config/apiConfig.ts` | `https://devapi.homeocentrum.com/` |
| `src/config/env.ts` | same |
| `app.json` extra.apiBaseUrl | same |
| `devmaigrationapi` in `src/` | **none** |
| Docs only | `PATIENT_APP_API_COVERAGE_REPORT.md`, `PatientMobile_API_Integration_Guide.md` (historical) |

## Auth

| Check | Status |
|---|---|
| RequestOtp / VerifyOtp | BOUND (`signInApi`, `otpVerificationApi`) |
| Token field | Top-level `token` saved (`useOtpVerificationController.ts:145–165`) |
| Account/Login | **none** in `src/` |
| Refresh / Logout | `accountApi` + `newBaseApi` 401 refresh |

## AppConfig live check

`GET https://devapi.homeocentrum.com/api/Public/AppConfig` → 200 with non-null `supportPhone`, `supportWhatsApp`, `supportEmail`, `siteUrl`, `razorpayKeyId` (live key). Backend deployed for support fields.

## Per-item status (before this pass)

| Item | BE/B | Status | Notes |
|---|---|---|---|
| 1 Host+OTP | BE-001/002 | BOUND | Host OK; OTP OK |
| 2 AppConfig | BE-003/004 | PARTIAL | Bound; no flag reads found; confirm Help uses contacts |
| 3 AppointmentRequests | BE-005/027 | NOT_BOUND | Create-only; no list/respond/DELETE/Idempotency |
| 4 Notifications | BE-006/025/026/034 | PARTIAL | List+MarkAllRead; no type/deepLink/UnreadCount/paging |
| 5 Visits | BE-007/008/022/035 | PARTIAL | teleSessionId typed; readyAt/ETA/paging TBD |
| 6 Doctors | BE-009/013/014/029 | PARTIAL | displayName exists; no FilterOptions/careCategoryId bind |
| 7 Instant fees | BE-011 | NOT_BOUND | `PLATFORM_FEE_RUPEES=90` still used |
| 8 Erx PDF | BE-012 | NOT_BOUND | Comment only |
| 9 Tracking | BE-028 | PARTIAL | Hook exists; no hardcoded 1209 in src |
| 10 Addresses | BE-023 | NOT_BOUND | No API file |
| 11 Reminders snooze | BE-024 | NOT_BOUND | Check remindersApi |
| 12 Appeal status | BE-017 | NOT_BOUND | Check supportApi Reviews |
| 13 Data/Caregiver | BE-018/019/033 | PARTIAL | POST DataRequests; no GET list; Caregiver hooks unused |
| 14 Help | BE-020 | PARTIAL | List may exist; slug detail unused |
| 15 Not planned | — | PARTIAL | Bookmarks UI still present on tips/profile |
| 16 Tele avail | BE-030 | NOT_BOUND | Hook may exist unused |
| 17 Phase 2 | P* | DEFERRED | Payment module exists from prior pass; keep `TODO(PAYMENT)` / video markers |

## Hardcode hunt (initial)

| Hit | File | Class |
|---|---|---|
| `PLATFORM_FEE_RUPEES = 90` | `appointmentSlots.ts:184`, `useConsultNowController` | STILL_STATIC |
| Bookmark UI | `HealthTipArticleView`, `DoctorProfileView` | NOT_PLANNED → remove |
| Seed doctor profiles | `doctorProfiles.ts` | LOCAL/deferred consult-now |
| Account/Login | — | clean |
| 1209 | — | clean |
| Feature flags | — | clean |
