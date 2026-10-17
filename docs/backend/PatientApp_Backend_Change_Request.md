# Patient app — backend change request

| Field | Value |
|---|---|
| Date | 2026-10-17 |
| For | Backend developer who has not read the app |
| App audit | `docs/audit/PATIENT_APP_STATUS_REPORT.md` |
| Contract already shipped | `docs/audit/PatientMobile_Bind_APIs.md` |

## Conventions

- Host the app uses: `https://devapi.homeocentrum.com/` (`app.json` extra.apiBaseUrl and `src/config/apiConfig.ts`).
- Header: `Authorization: Bearer <token>` except the two public reads `GET /api/Public/AppConfig` and `GET /api/Public/Doctors` (the client still sends a token when one is stored; do not require it).
- Patient id comes from the token (`RoleName = Patient`). Do not trust a patient id in the body.
- JSON is camelCase. Unknown or missing facts are `null`, not `0` or `""`.
- Success: `{ "success": true, "data": ... }`. Failure: `{ "success": false, "code": "FORBIDDEN", "message": "..." }` with HTTP 400, 403, or 404.
- HTTP 401 has an empty body. The app refreshes once via `POST /api/Account/RefreshToken`, then signs out.
- Dates: `yyyy-MM-dd`. Times: `HH:mm`. Timestamps: ISO-8601 without a client-side offset assumption.

Examples use fictitious people (patient Asha Patil, doctor Meera Joshi, id 104). They are not real records.

## 1. Executive summary

| Type | Count |
|---|---|
| CONFIG | 2 |
| NEW_ROUTE | 3 |
| EXTEND_ROUTE | 8 |
| CLARIFY | 7 |
| PHASE2 | 6 |
| P1 (not Phase 2) | 6 |
| P2 | 12 |
| P3 | 2 |

Build first: **B-003, B-004, B-005, B-008, B-011, B-028.**

Do not add a second doctors list, a second bookings route, or `DELETE /api/Account`. Those are already decided.

## 2. Index

| ID | Priority | Type | Screens | Method + path | Purpose | Unblocks |
|---|---|---|---|---|---|---|
| B-003 | P1 | CONFIG | Help, Book with help, Offline | GET /api/Public/AppConfig | Fill support contacts or leave null | — |
| B-004 | P1 | CONFIG | Home, Consult now, medicine pay | GET /api/Public/AppConfig | Feature flags | home CTAs |
| B-005 | P1 | NEW_ROUTE | My appointments, Book | GET/POST /api/Patient/AppointmentRequests… | List, status, respond | appointments UI |
| B-008 | P1 | EXTEND_ROUTE | Visit detail, Join, Running late | GET /api/Patient/Visits and /{id} | teleSessionId present for tele visits | join / late |
| B-011 | P1 | EXTEND_ROUTE | Consult now | POST/GET /api/Tele/Instant… | Fee breakdown | M-030 |
| B-028 | P1 | EXTEND_ROUTE | Order tracking, Order details | GET /api/MedicineOrders/{id}/Tracking | Document the body | tracking UI |
| B-002 | P2 | CLARIFY | Sign in, OTP | POST VerifyOtp vs Account/Login | Which call returns the Bearer token | — |
| B-006 | P2 | EXTEND_ROUTE | Notifications | GET /api/Notifications | type + deepLink | inbox routing |
| B-007 | P2 | EXTEND_ROUTE | Check-in | POST …/CheckIn | When readyAt is set; poll or not | check-in |
| B-009 | P2 | NEW_ROUTE | Search | GET /api/Public/Doctors/FilterOptions | Cities and qualifications | chips |
| B-010 | P2 | CLARIFY | Choose pharmacy | GET /api/Pharmacy/Sellers | Keep price/ETA/distance null or store them | — |
| B-012 | P2 | CLARIFY | Prescription | GET /api/Erx/{id}/Pdf | URL or bytes | PDF button |
| B-017 | P2 | EXTEND_ROUTE | My reviews, Appeal | GET /api/Reviews/Mine | Appeal status | appeal row |
| B-020b | P2 | CLARIFY | Help | GET /api/Help/{slug} | Publish the slug list | M-048 |
| B-021 | P2 | CLARIFY | Consent, Family | existing Caregiver/* | Link to consent type 6 | M-006 |
| B-023 | P2 | NEW_ROUTE | Order medicines, Review | GET/POST /api/Patient/Addresses | Address book | address row |
| B-027 | P2 | EXTEND_ROUTE | Book | POST Bookings, POST AppointmentRequests | Idempotency-Key | — |
| B-029 | P2 | EXTEND_ROUTE | Search | GET /api/Public/Doctors | careCategoryId | category search |
| B-020 | P3 | CLARIFY | Complete profile | profile photo | Upload route if required | — |
| B-025 | P3 | CLARIFY | Notifications | GET /api/Notifications | Pagination | — |
| B-P01 | — | PHASE2 | Booking payment | POST /api/Payments/ConsultOrders, Verify | Consult checkout | M-P01 |
| B-P02 | — | PHASE2 | Booking | holdExpiresAt | Release unpaid holds | — |
| B-P03 | — | PHASE2 | Medicine checkout | POST /api/Payments/MedicineOrders | Medicine checkout | M-P03 |
| B-P10 | — | PHASE2 | Device check | GET /api/Tele/DeviceCheck | Real device check | M-V01 |
| B-P11 | — | PHASE2 | Waiting room | GET /api/Tele/Sessions/{id} | Session status | M-V02 |
| B-P12 | — | PHASE2 | Video call | POST …/Token | Join token | M-V04 |

## 3. What the patient sees today

Support call buttons are hidden because AppConfig phones are null (`AppConfigProvider`). Consult now shows a seed doctor and a config fee (`useConsultNowController.ts:361`). After asking for a time, the patient only sees success of the POST; there is no PENDING card (`appointmentRequestsApi.ts` is create-only). Join and running late disappear when `teleSessionId` is missing. Order tracking has an id but an unspecified body (`useOrderDetailsController` comment `blocked: B-028`). Pharmacy cards show name and area only.

## 4. Specs

#### B-002 — Which call issues the Bearer token

- Priority / Type: P2 / CLARIFY
- Screens: Sign in `src/views/SignInView.tsx`, OTP `src/views/OtpVerificationView.tsx`
- Why: Contract line 10 says `POST /api/Account/Login` → `data.token`. The app calls `POST /api/PatientAuth/VerifyOtp` (`otpVerificationApi.ts:51`) and stores that token.
- Method + Path: no new route until you answer.
- Auth: public OTP routes.
- Proposed default: keep VerifyOtp as the patient token source. Document the JSON field that holds the token (`token` or `data.token`). Say if Login is for staff only.
- Acceptance: one sentence in the reply: which route, which JSON path, token lifetime.

#### B-003 — Support contacts

- Priority / Type: P1 / CONFIG
- Screens: Help `src/views/HelpCentreView.tsx`, Book with help, Offline `src/views/OfflineModeView.tsx`
- Why: `GET /api/Public/AppConfig` returns `supportPhone`, `supportWhatsApp`, and `supportEmail` as null (contract §1). The app hides the buttons. Evidence: `src/providers/AppConfigProvider.tsx`.
- Method + Path: existing `GET /api/Public/AppConfig` (public).
- Change: set the three strings in server config when a human should be reachable. Leave null to keep the button hidden.
- Success (illustrative):

```json
{
  "success": true,
  "data": {
    "razorpayKeyId": "rzp_test_example",
    "siteUrl": "https://example.homeocentrum.com",
    "supportPhone": "+910000000000",
    "supportWhatsApp": "+910000000000",
    "supportEmail": "help@example.com"
  }
}
```

- Notes for the app: `tel:`, `https://wa.me/`, and `mailto:` are built only from non-null values.
- Acceptance: null still returns 200 with nulls. A configured phone is E.164. No other patient's data is involved (public config).

#### B-004 — Feature flags

- Priority / Type: P1 / CONFIG
- Screens: Home, Consult now, medicine checkout
- Why: Contract line 35 says the body does not include `instantConsultEnabled` or `medicineOnlinePayEnabled`. The app cannot gate those CTAs.
- Method + Path: extend `GET /api/Public/AppConfig`.
- Add:

| Field | Type | Required | Meaning |
|---|---|---|---|
| instantConsultEnabled | boolean or null | no | null or false hides Consult now |
| medicineOnlinePayEnabled | boolean or null | no | null or false hides online medicine pay |

- Example `data` adds `"instantConsultEnabled": false, "medicineOnlinePayEnabled": false`.
- Errors: none beyond the existing AppConfig errors.
- Notes: null means off. Do not omit the keys once you add them; send null.
- Acceptance: flags false → app hides CTAs. Flags true → CTAs show, but payment still waits for Phase 2.

#### B-005 — Appointment request list and respond

- Priority / Type: P1 / NEW_ROUTE
- Screens: My appointments `src/views/MyAppointmentsView.tsx`, Book `useBookAppointmentController` (create already live)
- Why: `POST /api/Patient/AppointmentRequests` exists (`appointmentRequestsApi.ts:29`). The contract says the doctor accepts or proposes on the doctor app. The patient has no list and no respond route.
- Do not duplicate the create POST.

**List**

- Method + Path: `GET /api/Patient/AppointmentRequests`
- Auth: Bearer. Patient from token. A patient sees only their requests. A family request is visible to the account that created it.
- Query: `status` optional (`PENDING`, `ACCEPTED`, `DECLINED`, `PROPOSED`, `CANCELLED`). `pageNumber` optional integer ≥ 1. `pageSize` optional 1–50, default 20.
- Success:

```json
{
  "success": true,
  "data": [
    {
      "appointmentRequestId": 77,
      "doctorId": 104,
      "doctorName": "Meera Joshi",
      "requestedDate": "2026-10-20",
      "requestedTime": "10:30",
      "consultMode": "Tele",
      "reason": "Fever for two days",
      "status": "PROPOSED",
      "proposedDate": "2026-10-21",
      "proposedTime": "11:00",
      "patientAppId": null
    }
  ]
}
```

- `proposedDate` and `proposedTime` are null unless status is `PROPOSED`. `patientAppId` is null until the doctor accepts and a visit exists.
- Empty: `{ "success": true, "data": [] }`.
- Errors: 401 empty body. 403 `FORBIDDEN` if a filter tries to read another patient (ignore foreign ids).

**Respond**

- Method + Path: `POST /api/Patient/AppointmentRequests/{appointmentRequestId}/Respond`
- Body:

```json
{ "action": "ACCEPT", "message": null }
```

- `action`: `ACCEPT` or `DECLINE`. `message` optional, max 500 chars.
- Success: `{ "success": true, "data": { "status": "ACCEPTED", "patientAppId": 88120 } }` or `DECLINED` with `patientAppId` null.
- Errors: 404 `NOT_FOUND` for another patient's id. 400 `INVALID_STATE` if status is not `PROPOSED`. 409 `CONFLICT` if already answered.
- Side effect: ACCEPT creates the visit the doctor app already creates today. DECLINE does not create a visit.
- Notes: hide proposed fields when null. Do not show another patient's request.
- Acceptance: empty list; Asha cannot GET or POST an id owned by someone else; ACCEPT on PENDING (not PROPOSED) returns 400.

#### B-006 — Notification type and deep link

- Priority / Type: P2 / EXTEND_ROUTE
- Screens: Notifications `useNotificationsController.ts` `categorize()`
- Why: Contract §9 says inbox items have no `type` and no `deepLink`. The app guesses from the title.
- Method + Path: existing `GET /api/Notifications`. Add fields on each item:

| Field | Type | Meaning |
|---|---|---|
| type | string or null | `APPOINTMENT`, `PRESCRIPTION`, `MEDICINE`, `OTHER` |
| deepLink | string or null | In-app path or https URL. Null if nowhere to go |

- Example item adds `"type": "APPOINTMENT", "deepLink": null`.
- Ownership: only the token's notifications.
- Notes: unknown `type` is treated as OTHER. The app will allow-list schemes.
- Acceptance: old rows may send null type. A row for another user is not returned.

#### B-007 — Check-in readyAt

- Priority / Type: P2 / EXTEND_ROUTE
- Screens: Check-in `ClinicCheckInView.tsx`
- Why: Contract §6 says `readyAt` is null. The app hides it. The queue does not refresh.
- Method + Path: existing `POST /api/Patient/Visits/{patientAppId}/CheckIn`.
- Reply with: when `readyAt` becomes a timestamp; whether the patient should poll `GET /api/Patient/Visits/{id}` and at what interval (proposed default: no poll, refresh on focus only).
- `readyAt` stays null until the clinic marks the patient ready. Do not send a placeholder time.
- Errors: unchanged (tele, cancelled, completed rejected).
- Acceptance: EARLY returns `readyAt: null`. A visit that is not today's in-clinic visit is 400.

#### B-008 — teleSessionId on visits

- Priority / Type: P1 / EXTEND_ROUTE
- Screens: Visit detail, Running late, Join
- Why: `useReportRunningLateMutation` needs `teleSessionId`. The visit type has `teleSessionId?: number | null` (`visitsApi.ts`). The app hides the action when it is missing. Evidence: status report visit-detail section.
- Method + Path: existing `GET /api/Patient/Visits` and `GET /api/Patient/Visits/{patientAppId}`.
- Rule: when `isTele` is true and status is not cancelled or completed, `teleSessionId` is a number. Otherwise null.
- Example: `"isTele": true, "teleSessionId": 5501`.
- Ownership: the visit belongs to the token's patient.
- Notes: null hides Join and Running late. Do not invent an id.
- Acceptance: in-clinic visit has null. Another patient's visit is 404. A tele visit that is booked has a number.

#### B-009 — Filter options

- Priority / Type: P2 / NEW_ROUTE
- Screens: Search `SearchDoctorsView.tsx`, `SearchResultsView.tsx`
- Why: City and qualification chips are not returned by a route. The doctor list already filters with query params.
- Method + Path: `GET /api/Public/Doctors/FilterOptions` (public).
- Success:

```json
{
  "success": true,
  "data": {
    "cities": ["Pune"],
    "qualifications": ["BHMS"]
  }
}
```

- Empty arrays are valid. No patient data.
- Notes: the app will not show a chip that is not in this list.
- Acceptance: 200 with empty arrays; values match what `city` and `qualification` on doctors accept.

#### B-010 — Pharmacy metrics

- Priority / Type: P2 / CLARIFY
- Screens: Choose pharmacy
- Why: Contract §10 says `priceTotal`, `deliveryFee`, `etaMinutes`, `fulfilPercent`, `distanceKm`, and `serviceable` are null because they are not stored. The app shows name and area only.
- Decision requested: keep them null (app stays as it is) or store them later. Proposed default: keep null. Do not send `0`.
- No new route if you keep null.

#### B-011 — Instant consult fees

- Priority / Type: P1 / EXTEND_ROUTE
- Screens: Consult now and the searching / unavailable / offer sheets. Evidence: `useConsultNowController.ts:361` uses `CONSULT_NOW_FEE_RUPEES` because the Instant hooks are unused (`teleApi.ts:175`).
- Method + Path: existing `POST /api/Tele/Instant` and `GET /api/Tele/Instant/{instantConsultRequestId}`.
- Auth: Bearer. Patient from token.
- POST body (already expected by a future app bind):

```json
{
  "consultMode": "Tele",
  "reason": "Fever for two days",
  "memberPatientId": null
}
```

- `memberPatientId` null means the signed-in patient. A family id must belong to that account.
- Success `data`:

| Field | Type | Nullable | Meaning |
|---|---|---|---|
| instantConsultRequestId | number | no | Id for the GET |
| status | string | no | `SEARCHING`, `OFFERED`, `UNAVAILABLE`, `CANCELLED` |
| doctorId | number | yes | Set when OFFERED |
| doctorName | string | yes | Display name |
| consultFee | number | yes | Doctor fee. Null hides the fee |
| platformFee | number | yes | Null hides the row. Never a fixed 90 |
| currency | string | yes | e.g. INR |

```json
{
  "success": true,
  "data": {
    "instantConsultRequestId": 90,
    "status": "OFFERED",
    "doctorId": 104,
    "doctorName": "Meera Joshi",
    "consultFee": 500,
    "platformFee": null,
    "currency": "INR"
  }
}
```

- Errors: 400 `INVALID` bad mode. 403 if `memberPatientId` is not in the family. 404 on GET for another patient's request.
- Notes: the app will delete config fees only after this shape exists. Payment is still Phase 2.
- Acceptance: SEARCHING has null doctor and null fees. Another patient cannot GET the id. platformFee is null, not 90.

#### B-012 — Erx PDF

- Priority / Type: P2 / CLARIFY
- Screens: Prescription. The app comment says `blocked: B-012`. `recordsApi.ts` mentions `GET /api/Erx/{erxSnapshotId}/Pdf` but does not inject it.
- Reply with: HTTP 200 body is a PDF byte stream, or JSON `{ "success": true, "data": { "url": "https://..." } }`. Proposed default: JSON url, null when no PDF, and the app keeps the button hidden.
- Auth: Bearer. Only the patient on that snapshot.
- Errors: 404 for another patient's snapshot.

#### B-017 — Appeal status

- Priority / Type: P2 / EXTEND_ROUTE
- Screens: My reviews, Appeal
- Why: `POST /api/Reviews/{id}/Appeal` returns a message only. The list row cannot show an outcome.
- Method + Path: existing `GET /api/Reviews/Mine`. Add on each review:

| Field | Type | Meaning |
|---|---|---|
| appealStatus | string or null | null, `OPEN`, `UPHELD`, `REJECTED` |

- Do not add a second appeal POST.
- Ownership: the patient who wrote the review.
- Acceptance: no appeal → null. Another patient's review is absent.

#### B-020 — Profile photo

- Priority / Type: P3 / CLARIFY
- Screens: Complete profile / account avatar
- Why: `PUT api/PatientProfile/Me` has no file field in the app. Say if a photo upload route is required. Proposed default: no upload route; the avatar stays initials.
- If you add one, prefer `POST /api/PatientProfile/Me/Photo` multipart, Bearer, own patient only, 400 on a non-image. Do not invent this until you confirm it.

#### B-020b — Help slugs

- Priority / Type: P2 / CLARIFY
- Screens: Help centre. `useGetHelpArticlesQuery` is used. `useGetHelpArticleBySlugQuery` is not, because the app's topic ids may not match slugs.
- Reply with the slug list from `GET /api/Help` (`slug`, `title`). The app will open `GET /api/Help/{slug}` only for those slugs.
- No new route. Existing help routes stay.

#### B-021 — Caregiver vs consent type 6

- Priority / Type: P2 / CLARIFY
- Screens: Consent, Family. Grant returns 409 with a message that caregiver access is granted from the Caregiver page. Caregiver routes already exist (`familyApi.ts` Grant, Revoke, ListMine) and are unused.
- Reply: which `consentTypeId` must not be granted via Consents, and that `POST /api/Caregiver/Grant` is the only writer. Who may read `GET /api/Caregiver/ListMine` (the granting patient only).
- Proposed default: the app disables that consent toggle and does not add a caregiver screen until you name the type id.
- No duplicate route.

#### B-023 — Address book

- Priority / Type: P2 / NEW_ROUTE
- Screens: Order medicines, Review order, Checkout. The app hides the address (`blocked: B-023` in the order controller).
- Method + Path: `GET /api/Patient/Addresses` and `POST /api/Patient/Addresses`.
- Auth: Bearer. Own patient only.
- POST body:

```json
{
  "line1": "12 Example Lane",
  "line2": null,
  "city": "Pune",
  "pincode": "411001",
  "phone": "+910000000000"
}
```

- Success list item: those fields plus `addressId` number. Empty list is `[]`.
- Errors: 400 when pincode is not 6 digits. 403 for another patient's id (there is no id in the path; do not add one).
- Notes: the medicine order create body stays `{ erxSnapshotId, pharmacyPartnerId }` until you add an optional `addressId`. Say if you will add it. Proposed default: add optional `addressId` on `POST /api/MedicineOrders` in the same change.
- Acceptance: empty list; invalid pincode 400; Asha cannot read another account's addresses.

#### B-025 — Notification pagination

- Priority / Type: P3 / CLARIFY
- Screens: Notifications
- Why: `GET /api/Notifications` returns one array. Proposed default: no pagination until a patient can exceed 100 rows. If you add it, use `pageNumber` and `pageSize` and keep the same item shape.

#### B-027 — Idempotency

- Priority / Type: P2 / EXTEND_ROUTE
- Screens: Book
- Why: The app disables the button while the mutation runs. A retry after a timeout can still double-book. Header `Idempotency-Key` on `POST /api/Public/Doctors/{id}/Bookings` and `POST /api/Patient/AppointmentRequests`.
- Same key + same patient + same body returns the original success. Same key + different body returns 409 `IDEMPOTENCY_CONFLICT`.
- Proposed default: optional header. Missing header keeps today's behaviour.

#### B-028 — Order tracking and detail body

- Priority / Type: P1 / EXTEND_ROUTE
- Screens: `useOrderTrackingController.ts`, `useOrderDetailsController.ts` (`blocked: B-028`)
- Method + Path: existing `GET /api/MedicineOrders/{medicineOrderId}/Tracking`. Also document whether detail lines live on that route or on `GET /api/Patient/MedicineOrders` (do not add a third route if one of these can hold the lines).
- Auth: Bearer. Order must belong to the token's patient.
- Success:

```json
{
  "success": true,
  "data": {
    "medicineOrderId": 1209,
    "status": "DISPATCHED",
    "quoteAmount": null,
    "currency": null,
    "events": [
      { "at": "2026-10-17T10:00:00", "status": "DISPATCHED", "label": "Handed to the courier" }
    ],
    "lines": [
      { "remedyName": "Sulphur", "potencyCode": "30C", "quantityLabel": null }
    ]
  }
}
```

- `quoteAmount`, `currency`, and `quantityLabel` are null when not stored. `events` and `lines` are empty arrays, not null.
- Errors: 404 `NOT_FOUND` for another patient's order. 400 if the id is not a number.
- Notes: the app hides null money. It must not show ₹0.
- Acceptance: empty events; foreign id 404; null quote stays null.

#### B-029 — careCategoryId on doctor search

- Priority / Type: P2 / EXTEND_ROUTE
- Screens: Search entry
- Method + Path: existing `GET /api/Public/Doctors`.
- Add query `careCategoryId` (integer, optional). Omit it to mean all categories. Unknown id returns an empty `data` array, not 500.
- The id matches `GET /api/PatientPortal/CareCategories`.
- No patient data on this public list beyond doctor cards you already return.

## 5. Status catalogue (what the app already branches on)

| Domain | Values the app names | If you send another value |
|---|---|---|
| Visit | status string; tele vs clinic via `isTele` | Shown as raw text or hidden action |
| Check-in | `EARLY`, `WAITING`, `READY` | Treated as an error message |
| Appointment request | `PENDING` on create | List values in B-005 |
| Medicine order | `OFFERED`, `ACCEPTED`, `QUOTED`, `PAID`, `DISPATCHED`, `DELIVERED`, `REJECTED` | M-056 will show the raw status, not delivered |
| Review appeal | message only today | B-017 |
| Reminder kind | `MEDICINE` and other strings | Displayed as text |
| Notification | no type today | B-006 |

## 6. Always-null decision

| Field | Returned today | Used by | Needed? | Decision | If dropped |
|---|---|---|---|---|---|
| supportPhone / WhatsApp / email | null | Help, offline | Yes if humans answer | B-003 config | Button stays hidden |
| yearsExperience | null | Profile | No, per contract | Drop | Row stays hidden |
| languages, education | absent | Profile | No | Drop | Row stays hidden |
| adherencePercent | null | Progress | No | Drop | Row stays hidden |
| platformFee | null unless payment > fee | Visit, consult now | Yes when a fee exists | Store only then | Row hidden |
| readyAt | null | Check-in | Only when clinic marks ready | B-007 | Row hidden |
| pharmacy price, ETA, distance | null | Pharmacy | No for this release | B-010 keep null | Name and area only |
| notification type, deepLink | absent | Inbox | Yes for routing | B-006 | Title filter stays |
| quoteAmount | null | Medicines | Yes when quoted | Store or null | App must not show 0 (M-055) |

## 7. Phase 2 — Payment and video (later)

These hooks already exist and are unused. Confirm the JSON. Do not block section 4 on them.

#### B-P01 — Consult payment

- `POST /api/Payments/ConsultOrders` then `POST /api/Payments/Verify`.
- Auth: Bearer. The order is for the token's patient and a `patientAppId` they own.
- ConsultOrders `data` must include `paymentOrderId`, `amount`, `currency`, `gatewayReady`, `keyId`, `gatewayOrderId`. `keyId` is null when `gatewayReady` is false. The app reads `razorpayKeyId` from AppConfig only as a fallback if you say they are the same.
- Verify succeeds only after the gateway confirms. The app must not mark success from a timer.
- 403 if the visit is not theirs. 409 if the hold expired (see B-P02).

#### B-P02 — Hold release

- `holdExpiresAt` on the booking response. When it passes unpaid, the slot is free and Verify returns 409 `HOLD_EXPIRED`.

#### B-P03 — Medicine payment

- `POST /api/Payments/MedicineOrders` with `medicineOrderId`, `payMode` `ONLINE` or `COD`, `idempotencyKey`.
- `data.gatewayReady` and `data.keyId`. Null key means the app does not open a gateway.
- 404 if the order is not theirs.

#### B-P10 — Device check

- `GET /api/Tele/DeviceCheck`. Describe the JSON (recommended boolean flags, not a fake Mbps). Bearer. Own patient.

#### B-P11 — Session status

- `GET /api/Tele/Sessions/{teleSessionId}`. Include `status` and optional `doctorJoinedAt` (null until joined). 404 if the session is not theirs.

#### B-P12 — Token

- `POST /api/Tele/Sessions/{teleSessionId}/Token`. Returns the vendor token and channel. 403 if the visit is not in a joinable status. Also document leave and rejoin if the unused rejoin route is the one to call.

## 8. Open questions

| Question | Why | Proposed default | IDs |
|---|---|---|---|
| Token route | App uses VerifyOtp | Document VerifyOtp | B-002 |
| Poll check-in? | readyAt always null | Refresh on focus only | B-007 |
| PDF url or bytes | Button hidden | JSON url or null | B-012 |
| Store pharmacy metrics? | All null | Keep null | B-010 |
| Photo upload? | No route in the app | Do not add | B-020 |
| Paginate notifications? | One array | No, until 100+ | B-025 |

## 9. Delivery plan

1. B-003 and B-004 are config on AppConfig. The app hides or shows buttons. No new mobile route.
2. B-008 and B-028 are fields on routes the app already calls.
3. B-011 lets the app delete seed fees (M-030) without taking payment.
4. B-005 is the only new patient workflow before Phase 2.
5. Phase 2 after the list above is in production.

## Appendix A — Screen × API (gaps only)

| Screen | Already called | Gap |
|---|---|---|
| Help / Offline | AppConfig | B-003 values |
| Home | Home, Doctors, Articles, Visits | B-004 flags |
| My appointments | Visits | B-005 |
| Visit detail | Visits/{id}, CheckIn, Switch, Reschedule, Cancel, RunningLate | B-008, B-007 |
| Consult now | none of Instant* | B-011 |
| Search | Doctors | B-009, B-029 |
| Pharmacy / orders | Sellers, MedicineOrders, Tracking | B-010, B-023, B-028 |
| Prescription | Erx/Patient | B-012 |
| Notifications | Notifications, MarkAllRead, Preferences | B-006 |
| Reviews | Mine, Appeal, POST Reviews | B-017 |

## Appendix B — Evidence

File references are in the app repo at the paths in each spec. Hook inventory: 44 generated hooks have no screen import, including Instant, Tele token, ConsultOrders, Verify, PayMedicine, Help slug, and caregiver grant. Logout still runs through `src/store/session.ts`.
