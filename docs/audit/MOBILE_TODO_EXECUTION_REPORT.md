# Mobile TODO — Execution Report

| Field | Value |
|---|---|
| **Date** | 2026-10-17 |
| **Source** | `PATIENT_APP_STATUS_REPORT.md` @ `48d7507` |
| **Contract** | `PatientMobile_Bind_APIs.md` |
| **Log** | `docs/audit/04_mobile_todo_log.md` |
| **Gates** | `yarn typecheck` PASS · `yarn lint` PASS |

## Phase 0

| Check | Result |
|---|---|
| `apiConfig.ts` default | `https://devapi.homeocentrum.com/` (unchanged) |
| `app.json` `extra.apiBaseUrl` | `https://devmaigrationapi.homeocentrum.com/` (unchanged — B-001) |
| `AppConfigProvider` → `GET /api/Public/AppConfig` | Confirmed; null contacts hidden |
| Reminders `EMPTY_REMINDERS` | Present (infinite-loop fix) |

---

## Unblocked mobile work

| M-id | Status | Files | Notes |
|---|---|---|---|
| **M-016** | Done | `models/search.ts`, `useSearchResultsController.ts` | `DEFAULT_DOCTOR_FILTERS` = empty; `teleOnly` only when user selects video |
| **M-018** | Done | `AppNavigator.tsx`, `useDoctorProfileController.ts`, `useBookAppointmentController.ts` | Numeric doctorId required; seed profile path removed from live flow |
| **M-024** | Done | `useAppointmentDetailController.ts` | Visit `consultFee` / currency / platformFee only; null rows hidden |
| **M-031** | Done | `usePrescriptionController.ts`, `recordsApi.ts` | Erx list bound; static meds removed; PDF `blocked: B-012` |
| **M-032** | Done | `useConsultationRecordController.ts` | `useGetConsultationNoteQuery`; loading/error/null-hide |
| **M-033** | Done | `useUploadDocumentController.ts` | expo-image-picker / document-picker; real FormData upload; mutation status |
| **M-035** | Done | `useSymptomDiaryController.ts` | Seeds removed; diary GET/POST |
| **M-037** | Done | `useCliniSightProgressController.ts` | Progress API series; no invented captions |
| **M-040** | Done | `useNotificationsController.ts`, `notificationsApi.ts` | SEED removed; `MarkAllRead` mutation |
| **M-005** | Done | `useConsentController.ts`, `useConsentCentreController.ts` | 409/CONFLICT caregiver UX + API message |
| **M-007** | Done | `useHomeController.ts` | No invented reason/fee labels on upcoming cards |
| **M-020** | Done | `useBookAppointmentController.ts` | CTA disabled in-flight; 409/slot-taken mapped |
| **M-025** | Done | `useAppointmentDetailController.ts`, `ClinicCheckInView.tsx` | Demo selector removed; `queuePosition`; hide null `readyAt` |
| **M-027** | Done | `useConsultationChatController.ts` | Seed messages deleted; empty when no session/messages |
| **M-009** | Done | `HomeView.tsx`, `doctorsApi.ts` | `photoUrl \|\| photoPath` via `resolveApiUrl`; rating only if `reviewCount > 0` |
| **M-017** | Done | `useSearchResultsController.ts`, `SearchResultsView.tsx` | Debounced `q`; error+retry; pageNumber load-more; photoUrl helper |
| **M-011** | Done | `useHealthRecordsController.ts`, `HealthRecordsView.tsx`, `recordsApi.ts` | `useDeleteDocumentMutation` wired on document rows |
| **M-038** | Done | `useRemindersCentreController.ts`, `RemindersCentreView.tsx`, `remindersApi.ts` | DELETE + PUT full body (`isDone`, weekdays, `memberPatientId`) |
| **M-039** | Partial | `useRemindersCentreController.ts` | PUT includes `memberPatientId`; family picker still local ids — Local notifs reschedule = LOCAL_BY_DESIGN |
| **M-013** | Done | `AppNavigator.tsx`, order controllers | Hardcoded `hm-3922` / seed order fallbacks removed; require real id |
| **M-045** | Partial | `useOrderTrackingController.ts`, `useOrderDetailsController.ts` | Real id required; tracking query skipped without id; detail body `blocked: B-028` |
| **M-042** | Done | `useNotificationSettingsController.ts` | Quiet HH:mm validation; skip persist while in-flight / invalid quiet |
| **M-046** | Done | `useMyReviewsController.ts`, `MyReviewsView.tsx` | Loading / error / retry |
| **M-047** | Done | `useAppealReviewController.ts` | `canSubmit` false while mutation in-flight |
| **M-048** | Partial | `useHelpCentreController.ts` | Prefetch `GET /api/Help`; topics still local taxonomy until CMS slug map (B-020b) |
| **M-049** | Done | `useRaiseTicketController.ts` | Success Alert shows `supportTicketId` |
| **M-050** | Done | `useBookWithHelpController.ts` | Errors surfaced; no success on failure; null contacts hidden via AppConfig |
| **M-052** | Done | `useHealthTipController.ts` | Loading / error / retry; null image via `resolveApiUrl` |
| **M-053** | Done | `usePaymentsController.ts` | Seed PAYMENTS list removed; empty follows API |
| **M-054** | Done | `useOfflineModeController.ts` | Helpline only when `supportPhone` non-null |
| **M-014** | Done | `useAccountController.ts`, `AccountView.tsx` | EXPORT/DELETE show the request result only. No invented history (B-018 has no list) |
| **M-019** | Done | `useDoctorProfileController.ts`, `DoctorCredentialsTab.tsx` | Qualification / registration / university only; focus and CareLink omitted when absent |
| **M-022** | Done | `useBookingReviewController.ts`, `useAppointmentDetailController.ts` | Attach picker uses `documentId` from `GET /api/Patient/Documents`. Booking body has no `documentIds` |
| **M-026** | Done | `useAppointmentDetailController.ts`, `RescheduleAppointmentView.tsx` | Past dates excluded; slots from `GET …/Slots`; local appointment updates only after reschedule succeeds |
| **M-028** | Done | `useConsultationCompleteController.ts`, `ConsultationCompleteView.tsx` | Summary `text` only; loading/error; empty when the note is missing |
| **M-029** | Done | `useRateConsultationController.ts`, `RateConsultationView.tsx` | Submit disabled in flight; API error shown; success only after `POST api/Reviews` |
| **M-034** | Done | `useFollowUpPlanController.ts`, `FollowUpPlanView.tsx` | Seed tasks removed. Empty API → empty state |
| **M-041** | Done | `useNotificationsController.ts` | Client title filters kept. `blocked: B-006` |
| **M-043** | Partial | order / review / checkout controllers and views | `POST /api/MedicineOrders` with `erxSnapshotId` + `pharmacyPartnerId`. Quote rows and address hidden (`B-023`). Pay is `TODO(PAYMENT)` |
| **M-044** | Done | `useChoosePharmacyController.ts`, `ChoosePharmacyView.tsx` | Loading, error+retry, empty list |
| **M-051** | Done | `useLegalDocumentController.ts`, `LegalDocumentView.tsx` | Terms bound to `GET /api/Public/Policies/Terms`. Privacy and About stay local copy |

---

## Blocked on backend (skipped — do after delivery)

| M-id / area | Blocker | App stance |
|---|---|---|
| Feature gates Consult Now / meds pay | **B-004** | Wait for AppConfig flags |
| Appointment requests UI | **B-005** | No invent list/status |
| Notification `type` / deepLink | **B-006** | Keep title heuristics until types land |
| Check-in `readyAt` poll | **B-007** | Hide null `readyAt` |
| Join / running-late CTAs | **B-008** | Need `teleSessionId` |
| Filter chips / careCategory | **B-009 / B-029** | Params ready; options API pending |
| Instant consult fees (**M-030**) | **B-011** | Still config fees — leave until Instant* hooks |
| Erx PDF/share | **B-012** | Hidden with `blocked: B-012` |
| Support phones populated | **B-003** | Null-hide already; re-verify after populate |
| Order detail lines | **B-028 / B-023** | Empty detail until payload |
| Medicine delivery address | **B-023** | Address rows hidden on order / review / checkout |
| Structured credentials | **B-016** | No invented degrees |
| Credentials / ranking extras | **B-013…B-016** | When touching those screens |

---

## Phase 2 — deferred (not P1 failures)

| Id | Status | Notes |
|---|---|---|
| **M-P01 / M-P02** | Skipped(Phase2) | `TODO(PAYMENT)` — ConsultOrders + Verify; no fake success timers |
| **M-P03** | Skipped(Phase2) | Medicine gatewayReady/keyId |
| **M-V01–M-V04** | Skipped(Phase2) | `TODO(VIDEO-SDK)` — DeviceCheck, session, Token/join; `forceDoctorLate` / mock Mbps remain |

---

## Static re-scan (post-pass)

| Check | Result |
|---|---|
| Default video/mr search filters | Cleared |
| SEED notifications / SEEDED diary | Cleared from controllers |
| Chat seed messages | Cleared |
| `hm-3922` / `anjali` nav defaults | Cleared from live nav paths |
| `Math.random` upload ids | OK (client temp ids only) |
| `PLATFORM_FEE_RUPEES` in UI paths | **Still in Consult Now** (`useConsultNowController`) — expected until **B-011** / M-030 |
| `forceDoctorLate` / mock tele | Phase2 VIDEO-SDK |

---

## Scorecard note

Do **not** rewrite `PATIENT_APP_STATUS_REPORT.md` unless asked. This report is the deliverable for the mobile TODO pass.
