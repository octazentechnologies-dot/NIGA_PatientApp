# MASTER PROMPT — Finish the remaining Patient App mobile gaps

Paste this into Cursor Agent mode in `NIGA_PatientApp`.
Source of truth: `docs/audit/PATIENT_APP_STATUS_REPORT.md` (2026-10-17 working tree on `Devlopment_1.1` @ `48d7507`).
Contract: `docs/audit/PatientMobile_Bind_APIs.md`.
Do not invent API fields. If a field is `null`, hide the row.
Payment and video stay deferred. Mark stubs `TODO(PAYMENT)` or `TODO(VIDEO-SDK)`. Do not fake success.

## Hard rules

1. One `M-xxx` at a time. Run `yarn typecheck` after each.
2. Use existing RTK Query (`newBaseApi` and the screen `*Api.ts`). Do not add a `fetch` client.
3. Do not change the base URL. `app.json` `extra.apiBaseUrl` and `src/config/apiConfig.ts` are both `https://devapi.homeocentrum.com/`.
4. Append a row to `docs/audit/04_mobile_todo_log.md`: date, M-id, files, result.
5. Do not add backend routes. If a step needs a backend item, leave `// blocked: B-xxx` and go to the next unblocked item.
6. Do not edit `src/` files that are not listed for the current M-id.

## Phase 0

Read `src/config/apiConfig.ts` and `app.json` `extra.apiBaseUrl`. Both must still be `https://devapi.homeocentrum.com/`. Record them in the log. Do not change them.
Confirm `AppConfigProvider` still calls `GET /api/Public/AppConfig` and hides a null `supportPhone`.
Confirm `EMPTY_REMINDERS` is still the fallback in `useRemindersCentreController.ts`.

## Do now

### M-036 — Health insights fixtures (P1)

- Screen: Health insights · `src/controllers/useHealthInsightsController.ts`, `src/views/HealthInsightsView.tsx`
- Change: Delete `FOLLOW_UPS` (line 53) and `ADHERENCE` (line 61). `useGetProgressQuery` is already imported. Bind the chart to `series`, and the counts to `visitCount`, `followUpsCompleted`, `followUpsTotal`. Hide `adherencePercent` when it is `null`. Empty state when `series.length === 0` and `visitCount` is 0.
- Acceptance: No October/November fixture dates. Empty API shows an empty chart. `yarn typecheck` passes.

### M-055 — Medicine price null (P1)

- Screen: Medicines · `src/controllers/useMedicinesController.ts` line 138, `src/views/MedicinesView.tsx`
- Change: When `quoteAmount` is `null`, set the price label to empty and hide that row. Do not render `₹0.00`.
- Acceptance: An order with a null quote shows no rupee amount. A real quote still shows. Typecheck passes.

### M-056 — Medicine status (P1)

- Screen: Medicines · `useMedicinesController.ts` lines 128–135
- Change: Map `DELIVERED` to delivered and `REJECTED` to cancelled. Every other status (`OFFERED`, `QUOTED`, `PAID`, `DISPATCHED`, and the rest) keeps its own label. Do not fall through to delivered.
- Acceptance: A `DISPATCHED` order is not labelled delivered. Typecheck passes.

### M-003 — OTP echo (P1)

- Screen: OTP · `src/views/OtpVerificationView.tsx` lines 101–115, `src/navigation/AppNavigator.tsx` `devOtp`
- Change: Render the echoed code only when `__DEV__` is true. Production builds show no code.
- Acceptance: The dev OTP block is absent unless `__DEV__`. Typecheck passes.

### M-001 — Language list failure (P2)

- Screen: First launch · `src/controllers/useFirstLaunchController.ts`
- Change: If `GET api/mastersAPI/GetLanguages` fails, show an error and a retry. Do not silently replace the list with a local language array.
- Acceptance: A failed masters call does not look like a successful language list. Typecheck passes.

### M-002 — Request OTP errors (P2)

- Screen: Sign in · `src/controllers/useSignInController.ts`, `src/views/SignInView.tsx`
- Change: On `POST api/PatientAuth/RequestOtp` failure, show `message` from the error body and stay on the screen.
- Acceptance: A 400 does not open the OTP screen. Typecheck passes.

### M-008 — Home unread badge (P2)

- Screen: Home · `src/controllers/useHomeController.ts`
- Change: `useGetNotificationsQuery` already exists. Badge count is the number of items with `isRead === false`. Hide the badge at 0. Do not invent a count.
- Acceptance: Empty inbox shows no badge. Typecheck passes.

### M-010 — Appointments error (P2)

- Screen: My appointments · the controller that loads `GET api/Patient/Visits` and `src/views/MyAppointmentsView.tsx`
- Change: The view already has an empty state (line 56). Add error + retry around that visits query. Do not add a fake visit.
- Acceptance: A failed visits call shows retry and does not show an empty calendar as if the patient has no visits. Typecheck passes.

### M-039 — Reminder members (P2)

- Screen: Reminders · `src/controllers/useRemindersCentreController.ts`
- Change: Member choices come from `GET /api/Family` (`useGetFamilyQuery` is already used on other screens). PUT still sends `isDone`, `weekdays`, and `memberPatientId`. After create, update, and delete, reschedule local notifications from the API rows (`LOCAL_BY_DESIGN`).
- Acceptance: The picker does not use a hardcoded member id. An empty family list offers only the signed-in patient. Typecheck passes.

## Execute only after the backend delivers

### After B-004

Hide Consult now when `instantConsultEnabled` is `false` or `null`. Hide medicine online pay when `medicineOnlinePayEnabled` is `false` or `null`. Read both from `GET /api/Public/AppConfig`.

### After B-005

Add list and respond endpoints only if the backend documents them. Show `PENDING` and a proposed time on My appointments. Patient respond/cancel uses the documented routes. Hide null proposal fields.

### After B-006

Replace `categorize()` title checks in `useNotificationsController.ts` with `type`. Navigate with `deepLink` only for an allow-list of `https` and in-app paths. Drop unknown schemes.

### After B-007

On check-in, show `readyAt` when it is non-null. Refresh the queue on the interval the backend documents. Keep hiding null.

### After B-008

Running late and join require `teleSessionId` on the visit. Hide those buttons when it is null.

### After B-009 and B-029

City and qualification chips come from FilterOptions. Pass `careCategoryId` from the search entry. Do not send a chip the API did not return.

### After B-011 — M-030

Replace consult-now config fees and `setTimeout` match with `POST /api/Tele/Instant` and `GET /api/Tele/Instant/{id}`. Remove `CONSULT_NOW_FEE_RUPEES` and `PLATFORM_FEE_RUPEES` from that flow (`useConsultNowController.ts`, `src/config/consultNow.ts`, `src/config/appointmentSlots.ts`). Do not call Razorpay. Leave `TODO(PAYMENT)`.

### After B-012

Wire prescription PDF/share only if the response includes a URL or bytes the contract names. Otherwise keep the control hidden.

### After B-020b — M-048

Help topic tap calls `useGetHelpArticleBySlugQuery`. Render API title and body. Keep local topics only as navigation keys that match published slugs.

### After B-021 — M-006

If the family screen shows a caregiver control, call `useGrantCaregiverMutation`, `useRevokeCaregiverMutation`, and `useListCaregiversMineQuery`. If it does not, do not add the control.

### After B-023

Show the delivery address from the address-book payload. Until then keep the address row hidden. Do not invent a pincode.

### After B-028

Bind tracking and order-detail lines from the documented fields. Hide null lines.

## Phase 2 — do not treat as failures

### TODO(PAYMENT)

- M-P01 / M-P02: `POST /api/Payments/ConsultOrders` and `POST /api/Payments/Verify`. `razorpayKeyId` from AppConfig. Delete `SEED_PAYMENT_ID` in `usePaymentStatusController.ts`.
- M-P03: `POST /api/Payments/MedicineOrders` only when `gatewayReady` is true and `keyId` is non-null.

### TODO(VIDEO-SDK)

- M-V01: `GET /api/Tele/DeviceCheck`. Remove the mock Mbps path.
- M-V02: `GET /api/Tele/Sessions/{id}`. Remove `forceDoctorLate`.
- M-V03: Join failure stays on `POST …/JoinFailure`. Hide retry without `teleSessionId`.
- M-V04: `POST /api/Tele/Sessions/{id}/Token`. Remove the elapsed-time seed in `useVideoCallController.ts` line 186.

## Finish

1. Grep: no `FOLLOW_UPS` in the insights controller, no `₹0.00` fallback, no `PLATFORM_FEE_RUPEES` in consult now, `devOtp` gated by `__DEV__`.
2. `yarn typecheck` and `yarn lint`.
3. Write `docs/audit/MOBILE_TODO_EXECUTION_REPORT.md` with each M-id as Done, Blocked(B-xxx), or Skipped(Phase2), plus the file list.
4. Do not rewrite the status report unless asked.
