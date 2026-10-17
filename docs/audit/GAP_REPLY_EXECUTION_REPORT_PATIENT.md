# Gap Reply Execution Report — NIGA Patient App

**Date:** 2026-10-17  
**Source of truth:** `PatientApp_Backend_Gap_Reply_17102026.md`  
**Pre-check:** `docs/audit/05_gap_reply_precheck.md`  
**Log:** `docs/audit/05_gap_reply_log.md`

---

## 1. Executive summary

| Bucket | Count / notes |
|---|---|
| Implemented (done / exists / config) | Items 1–14, 16 |
| Not planned (UI removed/hidden) | Item 15 (pharmacy commercial sorts, bookmarks, photo upload, feature flags, years/languages/adherence placeholders) |
| Deferred phase2 | Item 17 — Payment (Razorpay verify path) + Video SDK |
| **Verdict (deferred excluded)** | **MOSTLY DYNAMIC** |
| Host | `https://devapi.homeocentrum.com/` (`src/config/apiConfig.ts`) — no `devmaigrationapi` in `src/` |
| AppConfig live check | `GET /api/Public/AppConfig` returns non-null support contacts + `razorpayKeyId` (pre-check) |

Remaining static risk is narrow: consult-now *need* chips still use local `CONSULT_NOW_NEEDS` labels (care needs catalog), waiting-room UI still has demo timers (marked `TODO(VIDEO-SDK)`), and local `Math.random` only for idempotency/upload client ids.

---

## 2. Per-item table

| BE/B id | Backend | App | Screens | Key files | Business logic | Notes |
|---|---|---|---|---|---|---|
| BE-001/B-002 | done | ✅ | OTP login | `apiConfig`, `signInApi`, `otpVerificationApi` | OTP → top-level `token`; refresh/logout | No `Account/Login` |
| BE-003/B-003 | config | ✅ | Help/Support | `appConfigApi`, `AppConfigProvider` | tel/wa/mailto; hide nulls | `razorpayKeyId` stored, unused for pay |
| B-004 flags | not planned | 🚫 | — | — | flags not read | Instant/medicine pay always available |
| BE-005/027 | done | ✅ | My requests | `appointmentRequestsApi`, `AppointmentRequestsView` | Respond PROPOSED; DELETE PENDING; Idempotency-Key | Invalidate Requests/Visits/Notifications |
| BE-006/025/026/034 | done | ✅ | Notifications | `notificationsApi`, `useNotificationsController` | type filter; UnreadCount; deepLink whitelist | |
| BE-007/008/022/035 | done | ✅ | Visits / My appts / check-in | `visitsApi`, `useMyAppointmentsController`, `useAppointmentDetailController` | teleSessionId → RunningLate; paging+filters; no invented ETA | readyAt always null → hide |
| BE-009/013/014/029 | done | ✅ | Search / filters / profile | `doctorsApi`, `DoctorFiltersSheet`, `useSearchDoctorsController` | FilterOptions cities; displayName; nextAvailableAt | careCategoryId optional |
| BE-011 | done (display) | ✅ | Consult Now | `useConsultNowController`, `teleApi` Instant | fees from poll only | Pay → `TODO(PAYMENT)` |
| BE-012 | done | ✅ | Prescription | `recordsApi.getErxPdfMeta`, `usePrescriptionController` | JSON pdfUrl; 409/403 messages | |
| BE-028 | exists | ✅ | Order tracking | `medicinesApi`, `useOrderTrackingController` | events/lines; hide null money | no `1209` |
| BE-023 | done | ✅ | Medicine checkout / order | `addressesApi`, checkout/order controllers | CRUD; pincode 6; `addressId` on create | |
| BE-024 | done | ✅ | Reminders | `remindersApi`, `useRemindersCentreController` | snoozeMinutes + notifyPush on PUT | |
| BE-017 | done | ✅ | My reviews | `supportApi`, `MyReviewsView` | chip; hide Appeal when set | |
| BE-018/019/033 | done | ✅ | Account / Consent | `consentApi`, `familyApi` Caregiver | history list; DELETE via DataRequests; Code==Caregiver | |
| BE-020 | done | ✅ | Help | `supportApi`, `useHelpCentreController` | list+slug detail | already bound |
| BE-010 | not planned | 🚫 | Pharmacy | `useChoosePharmacyController` | name/area only; sorts removed | |
| BE-015/016/021 | not planned | 🚫 | Doctor / progress | profile + CliniSight | hide null years/languages/adherence | |
| BE-031 | not planned | 🚫 | Tips / profile | controllers/views | bookmark UI removed | |
| BE-032 | not planned | 🚫 | Account | `AccountView` | initials only; pencil removed | |
| BE-030 | exists | ✅ | Doctor profile | `getDoctorTeleAvailability` | nextAvailableAt / online | defensive optional typing |
| BE-P01…P08 / B-P* | phase2 | ⏸ | Pay / Tele | markers in payments, Instant, teleApi, waiting room, device check | — | keep compiling |

Legend: ✅ bound · 🟡 partial · ❌ missing · ⏸ deferred · 🚫 not planned applied

---

## 3. Endpoint coverage (Gap Reply routes)

| Route | Hook | File | Screens | Matches reply? | Null / empty / error |
|---|---|---|---|---|---|
| `GET /api/Public/AppConfig` | `useGetAppConfigQuery` | `appConfigApi.ts` | App shell / Help | yes | hide null contacts |
| `POST PatientAuth/RequestOtp` | existing | `signInApi` | Phone | yes | — |
| `POST PatientAuth/VerifyOtp` | existing | `otpVerificationApi` | OTP | yes — top-level `token` | — |
| `POST Account/RefreshToken` | base | `newBaseApi` | 401 path | yes | empty 401 body safe |
| `POST Account/Logout` | account | account API | Account | yes | clear local even if fail |
| `GET/POST/DELETE AppointmentRequests` + Respond | hooks | `appointmentRequestsApi` | My requests | yes + Idempotency-Key on create | INVALID_STATE/CONFLICT/NOT_FOUND |
| `GET Notifications` (+ paging) | query | `notificationsApi` | Notifications | yes | — |
| `GET Notifications/UnreadCount` | query | same | badge | yes | — |
| `POST MarkAllRead` / `PATCH {id}` | mutations | same | list | yes | — |
| `GET Patient/Visits` paged | `useGetPatientVisitsQuery` | `visitsApi` | My appointments | yes | filters + infinite scroll |
| `GET Public/Doctors/FilterOptions` | query | `doctorsApi` | Search filters | yes | empty chips when empty |
| `GET Public/Doctors` | query | same | Search results | empty data = empty UI | — |
| `GET Tele/Availability/{id}` | query | same | Doctor profile | defensive shape | hide when null |
| `POST/GET Tele/Instant` | mutation+query | `teleApi` | Consult Now | fees fields | Pay deferred |
| `GET Erx/{id}/Pdf?format=json` | lazy query | `recordsApi` | Prescription | yes | 409/403 alerts |
| `GET MedicineOrders/{id}/Tracking` | query | `medicinesApi` | Tracking | yes | 404 not-found |
| `CRUD Patient/Addresses` | hooks | `addressesApi` | Checkout / order | yes | empty → Add address |
| `CRUD Patient/Reminders` | hooks | `remindersApi` | Reminders | snooze+push | — |
| `GET Reviews/Mine` | query | `supportApi` | My reviews | appealStatus | — |
| `GET/POST Patient/DataRequests` | hooks | `consentApi` | Account privacy | yes | history list |
| `GET Help` / `GET Help/{slug}` | hooks | `supportApi` | Help centre | yes | — |
| Caregiver Grant/ListMine | hooks | `familyApi` | Caregiver | Code guard | no Types Grant for Caregiver |

---

## 4. Business-logic matrix

| Rule | Evidence |
|---|---|
| Idempotency-Key on AppointmentRequests create + Bookings | `utilities/idempotency.ts`; headers in `appointmentRequestsApi` / `bookingApi` |
| Respond only when PROPOSED | `useAppointmentRequestsController` |
| deepLink whitelist | `utilities/deepLink.ts` + notifications controller |
| Notifications paging + UnreadCount badge | `useNotificationsController` |
| Visits page reset on filter change | `useMyAppointmentsController` |
| Address pincode 6 + required line1/city/state | medicine checkout create form |
| Appeal hide when status set | `useMyReviewsController` + `MyReviewsView` |
| Caregiver by `Code == "Caregiver"` | `useConsentCentreController` |
| Null money never `₹0` | `formatMoney` + tracking/fees hide empty |
| Instant fees from API only | `useConsultNowController` poll mapping |

---

## 5. Static data removed / remaining

### Removed or neutralized
| What | Where | Replaced by |
|---|---|---|
| `PLATFORM_FEE = 90` | `appointmentSlots.ts` | `null`; Instant poll fees |
| Hardcoded city chips (Pune/Mumbai/Solapur) | `DoctorFiltersSheet`, search doctors, consult-now | `FilterOptions.cities` |
| Nearby seed doctors on search entry | `useSearchDoctorsController` | empty until search |
| Pharmacy price/ETA/distance sorts | Choose pharmacy | name + area only |
| Bookmark save UI | Doctor profile / health tip | removed (BE-031) |
| Avatar photo pencil | Account | initials only |
| Hardcoded Instant matching seeds for fees | Consult Now | Tele Instant request + poll |
| Hardcoded order id `1209` | — | none in `src/` |

### Remaining (justified or deferred)
| Hit | Class | File |
|---|---|---|
| `Math.random` for Idempotency / upload id | LOCAL_BY_DESIGN | `idempotency.ts`, upload controller |
| `CONSULT_NOW_NEEDS` care labels | LOCAL_BY_DESIGN / catalog gap | `consultNow.ts` — needs CareCategories API if backend adds |
| Waiting-room demo elapsed timer | DEFERRED_VIDEO | `useWaitingRoomController` |
| Payment module compile path | DEFERRED_PAYMENT | `src/payments/*` + `TODO(PAYMENT)` |
| `PLATFORM_FEE_RUPEES = null` export | LEGIT (deprecated sentinel) | `appointmentSlots.ts` |

---

## 6. Local by design

- Push permission / quiet hours UI (reminders centre)
- Biometrics / phone setup battery intents
- Speech recognition for search
- Theme / language / Noto partners
- Local notification scheduling after reminder CRUD (client-side)
- Idempotency UUID generation

---

## 7. Deferred (`TODO` markers)

| Marker | File:line (approx) | Route needed |
|---|---|---|
| `TODO(PAYMENT)` | `useConsultNowController` (accept/pay), `useBookAppointmentController`, `payments/usePayment.ts` | ConsultOrders create + Verify; MedicineOrders pay; hold release; webhook/refunds/`receiptUrl` |
| `TODO(VIDEO-SDK)` | `teleApi` Token, `useWaitingRoomController`, `useDeviceCheckController` | Tele Token, DeviceCheck join, waiting-room ETA |

Still in scope (implemented): read `teleSessionId`, show fee fields read-only, display `holdExpiresAt`, Instant fee display.

---

## 8. Decisions applied (not planned)

| ID | Action |
|---|---|
| BE-010 | Removed pharmacy commercial sort chips; list name/area only |
| BE-015/016/021 | Hide years/languages/education/credentials/adherence inventing |
| BE-031 | Removed bookmark toggles from tip + doctor profile |
| BE-032 | Removed avatar upload affordance; initials only |
| B-004 | No `instantConsultEnabled` / `medicineOnlinePayEnabled` reads |
| BE-007 | readyAt / estimatedWaitMinutes not shown as invented ETA |

---

## 9. New backend gaps / questions

1. **Tele Availability** response shape — typed defensively (`isOnline`/`available`/`nextAvailableAt`); confirm canonical fields.
2. **Care category source** for `careCategoryId` on doctor search — FilterOptions has cities/qualifications only; CareCategories list for Instant needs still local.
3. **Caregiver** grant/list response shapes — hooks exist; confirm payloads in a live call.
4. **Help body format** — HTML vs markdown (app shows API body as returned).
5. **Visits list** flat vs paged envelope — handled via `utilities/paged.ts`; confirm default when no page params.
6. **Consent notice** body/version fields — show when present; confirm field names if notices endpoint differs.

---

## 10. Manual QA checklist (per item)

- [ ] Null fee / phone / address / deepLink → row hidden (never ₹0 / empty tel)
- [ ] Empty lists → EmptyState (appointments, addresses, help, pharmacies, requests)
- [ ] 400 / 403 / 404 / 409 → API `message` surfaced; 409 refetch where specified
- [ ] Idempotency: same key retry OK; different body → regenerate key
- [ ] Appointment request Respond only on PROPOSED; Cancel on PENDING
- [ ] Notification tap: mark read then whitelist deepLink only
- [ ] Instant offer: fees match Instant poll; Pay shows deferred path
- [ ] eRx PDF: unsigned 409; wrong patient 403; expired `expiresAt` refetch
- [ ] Tracking: foreign id 404; events/lines render
- [ ] Address: invalid pincode blocked; default reflected after save
- [ ] Reminder save sends snoozeMinutes/notifyPush
- [ ] Appeal chip; Appeal button hidden when appealed
- [ ] Data request history; delete account = POST DELETE (no DELETE /Account)
- [ ] Caregiver consent toggle does not call Types/Grant
- [ ] 401 empty body → refresh once → logout
- [ ] Slow network: loading states; pull-to-refresh

---

## 11. Verification output

| Check | Result |
|---|---|
| `yarn typecheck` | **pass** (`docs/audit/evidence/GAP_REPLY_typecheck3.txt`) |
| `yarn lint` | **pass** (`docs/audit/evidence/GAP_REPLY_lint2.txt`) |
| Static grep | `docs/audit/evidence/GAP_REPLY_static_rescan.txt` — no `devmaigrationapi`, `Account/Login`, `1209`, feature flags in `src/` |
| Tests / build | not run in this pass (typecheck+lint only) |

---

## Chat summary counts

- Items implemented: **15** (1–14, 16)  
- Not-planned cleanups: **1** (item 15 bundle)  
- Deferred: **payment + video** (item 17)  
- Verdict: **MOSTLY DYNAMIC** (deferred excluded)
