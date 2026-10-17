# Gap Reply execution log

| When | Item | Note |
|---|---|---|
| 2026-10-17 | Phase 1 | Pre-check written. Host OK. AppConfig live. AppointmentRequests list missing. |
| 2026-10-17 | Items 1–4 | Host/OTP already BOUND; AppConfig support; AppointmentRequests list/respond/DELETE + Idempotency-Key; Notifications type/deepLink/UnreadCount/paging. |
| 2026-10-17 | Item 5 (BE-035) | `useMyAppointmentsController` + paged `GET api/Patient/Visits` with filters; `MyAppointmentsView` wired in `AppNavigator`. |
| 2026-10-17 | Item 6 | FilterOptions cities/qualifications → DoctorFiltersSheet + SearchDoctors; careCategoryId on filters; tele fields. |
| 2026-10-17 | Item 7 (BE-011) | Instant Consult: `requestInstant` + poll fees (`consultFee`/`platformFee`/`totalPayable`); PLATFORM_FEE null. |
| 2026-10-17 | Item 8 (BE-012) | Prescription share/download via `getErxPdfMeta` (`?format=json`). |
| 2026-10-17 | Item 9 (BE-028) | Tracking timeline from `events` + `lines`; no hardcoded 1209. |
| 2026-10-17 | Item 10 (BE-023) | Address book on medicine order/checkout via `addressesApi`; `addressId` on `createMedicineOrder`. |
| 2026-10-17 | Item 11 (BE-024) | Reminders editor persists `snoozeMinutes` + `notifyPush` on create/update. |
| 2026-10-17 | Item 12 (BE-017) | Appeal status chip + hide Appeal when `appealStatus != null`. |
| 2026-10-17 | Item 13 | DataRequests history under Account; DELETE via POST DataRequests; Caregiver Code guard. |
| 2026-10-17 | Item 14 | Help centre already API-bound (unchanged this pass). |
| 2026-10-17 | Item 15 | Pharmacy sort chips removed; bookmarks UI removed; photo pencil removed; adherence not invented. |
| 2026-10-17 | Item 16 | Tele Availability on doctor profile (`nextAvailableAt` / online). |
| 2026-10-17 | Item 17 | `TODO(PAYMENT)` / `TODO(VIDEO-SDK)` markers on Instant pay, book, payments module, tele token, waiting room, device check. |
| 2026-10-17 | Phase 3 | Static rescan: no `devmaigrationapi` / `Account/Login` / `1209` / feature flags in `src/`. |
| 2026-10-17 | Phase 4 | Report → `GAP_REPLY_EXECUTION_REPORT_PATIENT.md`. |
