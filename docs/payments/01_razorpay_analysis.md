# Razorpay payment analysis — PATIENT app

| Field | Value |
|---|---|
| Date | 2026-10-17 |
| Repo | NIGA_PatientApp (PATIENT) |
| Branch / HEAD | Devlopment_1.1 @ 48d7507 (+ working-tree binds) |
| Contract | `docs/audit/PatientMobile_Bind_APIs.md` |
| Extended guide | `PatientMobile_API_Integration_Guide.md` §G12–G14, K6 |

## 1.1 Secrets scan

| Check | Result |
|---|---|
| Working tree `rzp_live_` / Key Secret / Webhook Secret | **None** in `src/`, `app.json`, `eas.json`, CI |
| `rzp_test_` in source | **None** in `src/` |
| Docs only | Placeholder examples: `rzp_test_example` (contract), `rzp_test_XXXXXXXXXXXX` (integration guide) — not real keys |
| `.env*` files | None present |
| `.gitignore` | Has `.env*.local`, `*.jks`, `*.p8`; **does not** ignore bare `.env` → PM-001 |
| Git history (`git log -S rzp_test_`) | Hits only doc/example text in `PatientMobile_API_Integration_Guide.md` via commit `48d7507` — no Key Secret |
| AppConfig | Reads `razorpayKeyId` at runtime (`appConfigApi.ts:8`, `AppConfigProvider.tsx:51`) |

**CRITICAL:** none found. No rotate required from this scan.

## 1.2 Existing payment workflow map

### Consult (after book)

1. User confirms slot → `onOpenPayment` in `useBookAppointmentController.ts:571`.
2. Family: `POST Family/BookAs`; self: `POST …/Bookings` → stores `holdExpiresAt` (`:619`).
3. `TODO(PAYMENT)` at `:622` — does **not** call `ConsultOrders` or Razorpay.
4. Opens payment sheet (`setPaymentOpen(true)`, `paymentStatus: 'pending'`).
5. `useBookingPaymentController` — local 10-minute hold (`SLOT_HOLD_SECONDS`), local bank/wallet pickers (`config/bookingPayment.ts`). Pay calls parent with method id only.
6. `usePaymentStatusController` — on `status === 'success'` invents a local booking with `SEED_PAYMENT_ID` (`:111`, `:139`). No Verify.

### Medicine

1. Order create via `POST /api/MedicineOrders` (live).
2. `useMedicineCheckoutController.ts:81` — `TODO(PAYMENT)`; Pay shows “Online payment is not available yet.”
3. `usePayMedicineOrderMutation` exists (`medicinesApi.ts:206`) and is unused by the checkout screen.

### Payments history

- `usePaymentsController` → `GET /api/Patient/Payments` (bound). Refund sheet is local / empty. Invoice download is no-op.

### Hardcoded / stub signals

| Signal | Evidence | Classification |
|---|---|---|
| `TODO(PAYMENT)` book | `useBookAppointmentController.ts:622` | stub |
| `TODO(PAYMENT)` medicine | `useMedicineCheckoutController.ts:81` | stub |
| `PLATFORM_FEE_RUPEES = 90` | `appointmentSlots.ts:184`; used by consult-now | STATIC / deferred consult-now |
| `SEED_PAYMENT_ID` | `usePaymentStatusController.ts:111` | fake paid |
| Local hold timer | `useBookingPaymentController.ts:67–93` | ignores `holdExpiresAt` |
| Fake method pickers | PAY_BANKS / PAY_WALLETS | local UI; Checkout replaces them |

## 1.3 API integration status (PATIENT)

| Route | Hook / file | Status | Notes |
|---|---|---|---|
| `GET /api/Public/AppConfig` → `razorpayKeyId` | `appConfigApi` / provider | BOUND_OK | Public; key at runtime |
| `POST /api/Public/Doctors/{id}/Bookings` + `holdExpiresAt` | `bookingApi` | BOUND_OK | Hold stored; not used for countdown |
| `POST /api/Payments/ConsultOrders` | `useCreateConsultOrderMutation` | NOT_BOUND (hook unused) | Types include `gatewayReady`, `keyId`, order fields |
| `POST /api/Payments/Verify` | `useVerifyPaymentMutation` | NOT_BOUND | Body: `paymentOrderId`, optional `gatewayPaymentId`. **Does not accept signature**; webhook marks paid |
| `GET /api/Payments/Appointments/{patientAppId}` | `useGetAppointmentPaymentSummaryQuery` | NOT_BOUND | Status poll alternative |
| `GET /api/Patient/Payments` | `useGetPaymentsHistoryQuery` | BOUND_OK | History list |
| `GET /api/Refunds/Policy/{paymentOrderId}` | payments + visits | PARTIAL | Hook exists; cancel UI may not use it |
| `POST /api/Payments/MedicineOrders` | `usePayMedicineOrderMutation` | NOT_BOUND | App type missing `keyId` / `gatewayOrderId` on `data` |
| `GET/POST /api/Invoices/ByPayment/{id}` | — | NOT_IN_CONTRACT | Guide Q33: no receipt PDF; build from G14 |
| Visit fee fields | `visitsApi` | BOUND_OK | `consultFee`, `currency`, `platformFee` |

## 1.4 Order → verify contract (exact)

### Create consult order — `POST /api/Payments/ConsultOrders`

Request (guide G12):

```json
{ "patientAppId": 88120, "bookingToken": "…", "payAtClinic": false, "idempotencyKey": "pa-88120-1728537600" }
```

- Do **not** send `amount` unless it matches the server quote (leave out).
- Response top-level: `gatewayReady`, `keyId`, `checkoutMethods`, `data.{paymentOrderId,amount,currency,gatewayOrderId,status,…}`.
- **Amount unit: rupees.** Checkout paise = `Math.round(amount * 100)` (guide line 2289).
- `gatewayReady === false` or null `keyId` / `gatewayOrderId` → block online pay; offer pay-at-clinic when enabled.

### Checkout returns

`razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`. App sends only `gatewayPaymentId` (= payment id) to Verify. Signature stays client-side only for this API (server verifies via webhook).

### Verify — `POST /api/Payments/Verify`

```json
{ "paymentOrderId": 7731, "gatewayPaymentId": "pay_…" }
```

- **Does not mark paid.** Webhook does. Response `data.status`: `CAPTURED` | `FAILED` | pending variants.
- `409 NOT_CAPTURED` → poll every ~3 s up to ~60 s (guide).
- Success screen only when server status is `CAPTURED` (or appointment `paymentStatus === PAID` via G14).

### Medicine — `POST /api/Payments/MedicineOrders`

Contract Bind_APIs §10: `data` includes `paymentOrderId`, `amount`, `currency`, `gatewayReady`, `keyId`, `gatewayOrderId`. Guide K6 sample today omits `keyId`/`gatewayOrderId` (Q40) → **B-PMT-002**.

Medicine verify: reuse `POST /api/Payments/Verify` with the medicine `paymentOrderId` (same ledger). No separate medicine-verify route in the contract.

### Hold

- `holdExpiresAt` ISO UTC from booking. Disable Pay when expired. If expired mid-Checkout, still Verify/poll; server may return hold-expired / released slot.
- Idempotency: reuse same `idempotencyKey` for retries of the same attempt; new key for a new attempt (`pa-{patientAppId}-{ts}`).

### Free consult

- If order amount is `0` or status `PAY_AT_CLINIC` with no gateway → do not open Checkout. Undocumented zero-fee path → open question B-PMT-004.

## 1.5 SDK / build readiness

| Item | Current | Required |
|---|---|---|
| Expo | ~57.0.24 managed + `expo-dev-client` | Keep; rebuild native |
| `react-native-razorpay` | **Not installed** | Add dependency |
| Expo Go | Cannot load native Razorpay | Use dev client / EAS / prebuild |
| Android UPI `<queries>` | Not present (`/android` gitignored) | Config plugin on prebuild |
| iOS `LSApplicationQueriesSchemes` | Not present | `tez`, `phonepe`, `paytmmp`, `gpay`, etc. |
| New Architecture | RN 0.86 | Verify Razorpay pod compatibility on first native build |
| Amount conversion | — | ×100 at Checkout boundary only |

## 1.6 Gap list

### Mobile tasks (PM-xxx)

| ID | Priority | What |
|---|---|---|
| PM-001 | P2 | Ignore bare `.env` in `.gitignore` |
| PM-002 | P1 | Install Razorpay SDK + Expo config plugin (UPI schemes) |
| PM-003 | P1 | `src/payments/` module: key helper, checkout hook, state machine, error map |
| PM-004 | P1 | Align `paymentsApi` types with G12/G13; medicine pay response fields |
| PM-005 | P1 | Wire BookingPayment: ConsultOrders → Checkout → Verify/poll; hold from `holdExpiresAt` |
| PM-006 | P1 | Replace PaymentStatus seed success with server-driven CAPTURED/PAID |
| PM-007 | P1 | Wire MedicineCheckout: PayMedicine → Checkout → Verify/poll when gateway fields present |
| PM-008 | P2 | Persist pending `paymentOrderId` in SecureStore; resolve on next open |
| PM-009 | P2 | Visit detail “Pay now” only when summary says UNPAID/PENDING and contract allows |
| PM-010 | P3 | Invoice: hide or show G14-built receipt (no PDF route) |

### Backend gaps (B-PMT-xxx)

| ID | Priority | Need |
|---|---|---|
| B-PMT-001 | — | **Closed for consult** — Verify route documented and typed |
| B-PMT-002 | P1 | Medicine `Payments/MedicineOrders` ONLINE must return `keyId`, `gatewayOrderId`, `gatewayReady` (contract) |
| B-PMT-003 | P1 | `WebhookSecret` is empty in NewAPI appsettings today; set secret + Razorpay dashboard webhook URL — without it CAPTURED never arrives |
| B-PMT-004 | P2 | Document free / amount-0 / `FEE_NOT_CONFIGURED` client behaviour |
| B-PMT-005 | P2 | Invoice/receipt PDF route if product needs download (Q33 says none) |
| B-PMT-006 | P2 | Hold release job after `holdExpiresAt` (guide Q43) |
| B-PMT-007 | P3 | Refund policy rules for cancel UI messages |

### Risks

- Implementing Checkout while webhook is unset → perpetual `PENDING_CONFIRMATION`.
- Medicine pay blocked until B-PMT-002.
- Consult-now still uses hardcoded fees — out of scope for this payment pass (Instant fees are B-011).

### Open questions

1. Amount always rupees for medicine too? (Assume yes, same as consult.)
2. Can unpaid past visits call ConsultOrders again? (PM-009 waits on clarification.)
3. Signature fields: API rejects client signature — confirm production still webhook-only.
