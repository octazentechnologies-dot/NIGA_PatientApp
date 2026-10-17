# Mobile TODO execution log

| Date | M-id | Files | Result |
|---|---|---|---|
| 2026-10-17 | Phase 0 | apiConfig.ts, app.json, AppConfigProvider, useRemindersCentreController | OK — default `https://devapi.homeocentrum.com/`; runtime `https://devmaigrationapi.homeocentrum.com/` (unchanged, B-001). AppConfig GET bound; support null-hide OK. EMPTY_REMINDERS present. |
| 2026-10-17 | M-016 | models/search.ts, useSearchResultsController.ts | Done — empty defaults; teleOnly only when video selected |
| 2026-10-17 | M-018 | AppNavigator.tsx, useDoctorProfileController.ts, useBookAppointmentController.ts | Done — numeric doctorId; no anjali fallback |
| 2026-10-17 | M-024 | useAppointmentDetailController.ts | Done — visit fees only; null-hide |
| 2026-10-17 | M-031 | usePrescriptionController.ts, recordsApi.ts | Done — Erx bind; B-012 PDF blocked |
| 2026-10-17 | M-032 | useConsultationRecordController.ts | Done — consultation note query |
| 2026-10-17 | M-033 | useUploadDocumentController.ts | Done — real picker + FormData upload |
| 2026-10-17 | M-035 | useSymptomDiaryController.ts | Done — seeds removed; Diary API |
| 2026-10-17 | M-037 | useCliniSightProgressController.ts | Done — Progress API; empty chart |
| 2026-10-17 | M-040 | useNotificationsController.ts, notificationsApi.ts | Done — SEED gone; MarkAllRead |
| 2026-10-17 | M-005 | useConsentController.ts, useConsentCentreController.ts | Done — caregiver 409 UX |
| 2026-10-17 | M-007 | useHomeController.ts | Done — no invented upcoming labels |
| 2026-10-17 | M-020 | useBookAppointmentController.ts | Done — in-flight disable + 409 map |
| 2026-10-17 | M-025 | useAppointmentDetailController.ts, ClinicCheckInView.tsx | Done — demo check-in removed |
| 2026-10-17 | M-027 | useConsultationChatController.ts | Done — seed chat removed |
| 2026-10-17 | M-009 | HomeView.tsx | Done — photoUrl helper; rating hide when reviewCount=0 |
| 2026-10-17 | M-017 | useSearchResultsController.ts, SearchResultsView.tsx | Done — debounce, error/retry, load-more |
| 2026-10-17 | M-011 | useHealthRecordsController.ts, HealthRecordsView.tsx | Done — delete document mutation |
| 2026-10-17 | M-038 | useRemindersCentreController.ts, RemindersCentreView.tsx | Done — DELETE + PUT full body |
| 2026-10-17 | M-039 | useRemindersCentreController.ts | Partial — memberPatientId on PUT; family picker still local |
| 2026-10-17 | M-013 / M-045 | AppNavigator, order tracking/details controllers | Done/Partial — no hardcoded order ids; B-028 detail body |
| 2026-10-17 | M-042 | useNotificationSettingsController.ts | Done — quiet hours validation + in-flight guard |
| 2026-10-17 | M-046 | useMyReviewsController.ts, MyReviewsView.tsx | Done — loading/error/retry |
| 2026-10-17 | M-047 | useAppealReviewController.ts | Done — in-flight disables submit |
| 2026-10-17 | M-048 | useHelpCentreController.ts | Partial — Help prefetch; slug CMS map B-020b |
| 2026-10-17 | M-049 | useRaiseTicketController.ts | Done — show supportTicketId |
| 2026-10-17 | M-050 | useBookWithHelpController.ts | Done — error on fail; null contacts |
| 2026-10-17 | M-052 | useHealthTipController.ts | Done — loading/error/retry |
| 2026-10-17 | M-053 | usePaymentsController.ts | Done — seed payments removed |
| 2026-10-17 | M-054 | useOfflineModeController.ts | Done — null phone hide |
| 2026-10-17 | M-030 / Phase2 | Consult Now / Payment / Video | Skipped — B-011 + TODO(PAYMENT)/TODO(VIDEO-SDK) |
| 2026-10-17 | Gates | yarn typecheck, yarn lint | PASS |
| 2026-10-17 | Deliverable | MOBILE_TODO_EXECUTION_REPORT.md | Written |
| 2026-10-17 | M-014 | useAccountController.ts, AccountView.tsx | Done — data request shows API/success message only; no history list (B-018) |
| 2026-10-17 | M-019 | useDoctorProfileController.ts | Done — credentials only from real fields; empty blocks omitted (B-016) |
| 2026-10-17 | M-022 | useBookingReviewController.ts, useAppointmentDetailController.ts | Done — attach list is GET Documents ids. Booking POST has no documentIds field |
| 2026-10-17 | M-026 | useAppointmentDetailController.ts, RescheduleAppointmentView.tsx | Done — future dates + Slots API; confirm only after reschedule succeeds |
| 2026-10-17 | M-028 | useConsultationCompleteController.ts, ConsultationCompleteView.tsx | Done — summary text only; loading/error; invented discussed/advice hidden |
| 2026-10-17 | M-029 | useRateConsultationController.ts, RateConsultationView.tsx | Done — in-flight disable; 400 message; no fake review id |
| 2026-10-17 | M-034 | useFollowUpPlanController.ts, FollowUpPlanView.tsx | Done — seed tasks removed; empty/loading/error |
| 2026-10-17 | M-041 | useNotificationsController.ts | Done — client title categories kept until B-006 |
| 2026-10-17 | M-043 | useOrderMedicinesController.ts, review/checkout | Partial — create order from Erx + pharmacy; quote/address hidden (B-023); pay TODO(PAYMENT) |
| 2026-10-17 | M-044 | useChoosePharmacyController.ts, ChoosePharmacyView.tsx | Done — loading/error/retry/empty |
| 2026-10-17 | M-051 | useLegalDocumentController.ts, LegalDocumentView.tsx | Done — Terms from GET Policies/Terms; privacy/about stay local |
| 2026-10-17 | Gates | yarn typecheck, yarn lint | PASS |
