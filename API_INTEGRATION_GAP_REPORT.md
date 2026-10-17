# API Integration Gap Report — HelloHomeo Patient App

| Field | Value |
|---|---|
| **App** | `NIGA_PatientApp` (Expo / React Native) |
| **Source root** | `src/` |
| **API documentation** | `PatientMobile_API_Integration_Guide.md` |
| **Networking** | Redux Toolkit + RTK Query (`src/store/api/new/*`) |
| **Audit type** | READ-ONLY, evidence-based (no source code changes) |
| **Audit date** | 2026-10-13 |
| **Scope note** | Full scan of `src/views`, `src/controllers`, `src/store/api`, `src/config`, `src/components/*Sheet*`, `src/navigation`, `src/services/notifications`. Localization copy (`en.ts`/`mr.ts`) treated as CLIENT-SIDE OK unless it embeds product facts (fees, phone numbers, doctor names). |

**Important:** The API guide’s §2 / §7.2 “Today” column reflects an older commit (`1efb723`, ~9 live calls). **This report audits the current tree**, which declares ~108 RTK endpoints. Many are **declared but not wired** to controllers — counted as Partial/None, not Full.

**Status definitions**
- **Full** — Screen’s primary data/actions come from the documented API; remaining locals are UX-only (timers, i18n labels, empty/error UI).
- **Partial** — At least one relevant RTK/API call is used, but UI still shows seed/static data, ignores response fields, or skips critical mutations.
- **None** — No relevant API call for the screen’s primary job (or API exists only as unused RTK stub).
- **N/A** — No backend required (OS permissions, NetInfo offline gate).

**Resolution types (Phase 3)**
1. NEW API NEEDED · 2. NEW KEY NEEDED · 3. EXISTING KEY UNUSED · 4. CONFIG/CMS-DRIVEN · 5. CLIENT-SIDE OK

---

## 1. Executive Summary

| Metric | Count | % |
|---|---:|---:|
| Primary screens / overlays / sheets audited | **74** | 100% |
| Full | **1** | 1% |
| Partial | **36** | 49% |
| None | **34** | 46% |
| N/A (no API required) | **3** | 4% |
| Documented endpoints (Appendix A unique method+route families) | **~95** | — |
| Declared in RTK (`src/store/api/new`) | **108** | — |
| RTK hooks used by controllers/components/session | **~57** | ~52% of hooks |
| RTK hooks exported but never imported outside `store/api` | **52** | orphaned stubs |
| Doc endpoints with **no** RTK declaration | **8** | orphan APIs (see §4) |
| Static/hardcoded values registered (§8) | **128** | — |
| New APIs proposed (backend must create) | **7** | — |
| New keys proposed on existing APIs | **18** | — |

### Top 10 highest-priority gaps

| # | Gap | Why P0 | Owner |
|---|---|---|---|
| 1 | Booking create + pay not wired (`useCreateBookingMutation`, `useCreateConsultOrderMutation`, Razorpay, verify/poll) | Blocks revenue | Mobile + BE (Q40/Q44) |
| 2 | Doctor slots still synthetic (`appointmentSlots.ts`); `useGetDoctorSlotsQuery` unused | Wrong availability | Mobile |
| 3 | Consult Now uses seed offers; Instant Tele APIs unused | Instant care fake | Mobile + BE (Q37) |
| 4 | Video/waiting/token: `useGetTeleSessionQuery` / `useGetTeleTokenMutation` unused; DEMO timers | Tele unusable | Mobile + BE (Q8) |
| 5 | Prescription / consultation note / Erx PDF unused | Records incomplete | Mobile (+ J4 RTK) |
| 6 | Medicine order create/consent/quote unused; checkout prices hardcoded | Commerce fake | Mobile + BE (Q40/Q41) |
| 7 | Home fee hardcoded `₹500`; care categories & articles unused | Visible static | Mobile |
| 8 | Pharmacy sellers API called but UI ignores payload | Visible static | Mobile + BE keys |
| 9 | Notifications start from SEED; filters invented client-side | Badge lies | Mobile + BE (Q42) |
| 10 | Clinic check-in / reminders / my-reviews / notif settings — **no patient API** | Product gaps | Backend |

---

## 2. Screen-wise Integration Matrix

| # | Screen | File path | APIs used | Status | Static values count | Priority |
|---|---|---|---|---|---:|---|
| 1 | Splash | `src/views/SplashView.tsx` / `useSplashController.ts` / `AppNavigator.tsx` | RefreshToken (session restore in navigator) | Partial | 1 | P0 |
| 2 | FirstLaunch | `src/views/FirstLaunchView.tsx` / `useFirstLaunchController.ts` | GetLanguages | Full | 1 (fallback) | P2 |
| 3 | Onboarding | `src/views/OnboardingSlideView.tsx` / `useOnboardingController.ts` | — | None | 3 | P2 |
| 4 | SignIn | `src/views/SignInView.tsx` / `useSignInController.ts` | RequestOtp, Countries | Partial | 2 | P0 |
| 5 | OTP Verification | `src/views/OtpVerificationView.tsx` / `useOtpVerificationController.ts` | VerifyOtp, RequestOtp | Partial | 2 | P0 |
| 6 | Complete Profile | `src/views/CompleteProfileView.tsx` / `useCompleteProfileController.ts` | CreatePatient, Genders, Countries/States/Districts/Cities, PatientProfile Me GET/PUT, OTP | Partial | 4 | P0 |
| 7 | Consent (onboarding) | `src/views/ConsentView.tsx` / `useConsentController.ts` | PrivacyStatus, Notice, GrantPrivacy, Consents, Grant, Withdraw | Partial | 2 | P1 |
| 8 | Phone Setup | `src/views/PhoneSetupView.tsx` / `usePhoneSetupController.ts` | (push via `deviceTokenApi` elsewhere) | N/A* | 0 | P1 |
| 9 | Family Members | `src/views/FamilyMembersView.tsx` / `useFamilyMembersController.ts` | Family CRUD, Relations, Genders | Partial | 2 | P1 |
| 10 | Home | `src/views/HomeView.tsx` / `useHomeController.ts` | Home, Visits, Family, Doctors | Partial | 8 | P0 |
| 11 | Doctors tab / My Appointments | `src/views/MyAppointmentsView.tsx` | via Home visits mapping | Partial | 3 | P0 |
| 12 | Health Records tab | `src/views/HealthRecordsView.tsx` / `useHealthRecordsController.ts` | Timeline, Documents, Family | Partial | 10 | P1 |
| 13 | Medicines tab | `src/views/MedicinesView.tsx` / `useMedicinesController.ts` | MedicineOrders, Family | Partial | 3 | P1 |
| 14 | Account | `src/views/AccountView.tsx` / `useAccountController.ts` | PatientProfile Me, DataRequests | Partial | 2 | P1 |
| 15 | Search Doctors | `src/views/SearchDoctorsView.tsx` / `useSearchDoctorsController.ts` | — | None | 6 | P0 |
| 16 | Search Results | `src/views/SearchResultsView.tsx` / `useSearchResultsController.ts` | Public/Doctors | Partial | 9 | P0 |
| 17 | Doctor Profile | `src/views/DoctorProfileView.tsx` / `useDoctorProfileController.ts` | Doctors/{id}, Fees, Reviews | Partial | 5 | P0 |
| 18 | Book Appointment | `src/views/BookAppointmentView.tsx` / `useBookAppointmentController.ts` | Doctor, Fees, Family, Home, Waitlist/Join | Partial | 12 | P0 |
| 19 | Booking Review | `src/views/BookingReviewView.tsx` / `useBookingReviewController.ts` | — | None | 4 | P0 |
| 20 | Booking Payment | `src/views/BookingPaymentView.tsx` / `useBookingPaymentController.ts` | — | None | 6 | P0 |
| 21 | Payment Status | `src/views/PaymentStatusView.tsx` / `usePaymentStatusController.ts` | — | None | 5 | P0 |
| 22 | Appointment Detail | `src/views/AppointmentDetailView.tsx` / `useAppointmentDetailController.ts` | Visit detail, Cancel, Reschedule | Partial | 6 | P0 |
| 23 | Clinic Appointment | `src/views/ClinicAppointmentView.tsx` | same controller family | Partial | 2 | P1 |
| 24 | Clinic Check-In | `src/views/ClinicCheckInView.tsx` | — | None | 4 | P2 |
| 25 | Reschedule | `src/views/RescheduleAppointmentView.tsx` | Reschedule mutation (via detail) | Partial | 3 | P1 |
| 26 | Cancelled Confirmation | `src/views/CancelledConfirmationView.tsx` | Cancel (via detail) | Partial | 1 | P1 |
| 27 | Device Check | `src/views/DeviceCheckView.tsx` / `useDeviceCheckController.ts` | — (I4 unused) | None | 5 | P0 |
| 28 | Waiting Room | `src/views/WaitingRoomView.tsx` / `useWaitingRoomController.ts` | — (I5 unused) | None | 6 | P0 |
| 29 | Join Failed | `src/views/JoinFailedView.tsx` / `useJoinFailedController.ts` | JoinFailure | Partial | 1 | P1 |
| 30 | Video Call | `src/views/VideoCallView.tsx` / `useVideoCallController.ts` | — (Token/Rejoin/Consent unused) | None | 10 | P0 |
| 31 | Consultation Chat | `src/views/ConsultationChatView.tsx` / `useConsultationChatController.ts` | Chat GET/POST | Partial | 2 | P1 |
| 32 | Consultation Complete | `src/views/ConsultationCompleteView.tsx` / `useConsultationCompleteController.ts` | Tele Summary | Partial | 2 | P1 |
| 33 | Rate Consultation | `src/views/RateConsultationView.tsx` / `useRateConsultationController.ts` | Reviews POST | Partial | 3 | P1 |
| 34 | Consult Now | `src/views/ConsultNowView.tsx` / `useConsultNowController.ts` | Family, Home only | Partial | 12 | P0 |
| 35 | Consult Now Searching | `src/views/ConsultNowSearchingView.tsx` | via ConsultNow | None* | 3 | P0 |
| 36 | Consult Now Unavailable | `src/views/ConsultNowUnavailableView.tsx` | via ConsultNow | None* | 2 | P1 |
| 37 | Consult Now Offer Sheet | `src/views/ConsultNowOfferSheet.tsx` | seed offers | None | 4 | P0 |
| 38 | Prescription | `src/views/PrescriptionView.tsx` / `usePrescriptionController.ts` | — (J3 unused) | None | 5 | P0 |
| 39 | Consultation Record | `src/views/ConsultationRecordView.tsx` / `useConsultationRecordController.ts` | — (J2 unused) | None | 2 | P1 |
| 40 | Upload Document | `src/views/UploadDocumentView.tsx` / `useUploadDocumentController.ts` | Upload, Family, Home | Partial | 4 | P1 |
| 41 | Follow-Up Plan | `src/views/FollowUpPlanView.tsx` / `useFollowUpPlanController.ts` | FollowUps, Complete | Partial | 3 | P1 |
| 42 | Symptom Diary | `src/views/SymptomDiaryView.tsx` / `useSymptomDiaryController.ts` | Diary GET/POST, Family, Home | Partial | 4 | P1 |
| 43 | Symptom Diary Entry | `src/views/SymptomDiaryEntryView.tsx` | via diary controller | Partial | 2 | P1 |
| 44 | Health Insights | `src/views/HealthInsightsView.tsx` / `useHealthInsightsController.ts` | Progress | Partial | 4 | P2 |
| 45 | CliniSight Progress | `src/views/CliniSightProgressView.tsx` / `useCliniSightProgressController.ts` | Progress | Partial | 3 | P2 |
| 46 | Reminders Centre | `src/views/RemindersCentreView.tsx` / `useRemindersCentreController.ts` | — | None | 8 | P2 |
| 47 | Health Tip Article | `src/views/HealthTipArticleView.tsx` / `useHealthTipController.ts` | — (F4 unused) | None | 3 | P2 |
| 48 | Order Medicines | `src/views/OrderMedicinesView.tsx` / `useOrderMedicinesController.ts` | — | None | 4 | P0 |
| 49 | Choose Pharmacy | `src/views/ChoosePharmacyView.tsx` / `useChoosePharmacyController.ts` | Pharmacy/Sellers (ignored for UI) | Partial | 7 | P0 |
| 50 | Review Order | `src/views/ReviewOrderView.tsx` / `useReviewOrderController.ts` | — | None | 6 | P0 |
| 51 | Medicine Checkout | `src/views/MedicineCheckoutView.tsx` / `useMedicineCheckoutController.ts` | PayMedicineOrder (hardcoded id) | Partial | 6 | P0 |
| 52 | Order Tracking | `src/views/OrderTrackingView.tsx` / `useOrderTrackingController.ts` | Tracking (hardcoded 1209) | Partial | 6 | P0 |
| 53 | Order Details | `src/views/OrderDetailsView.tsx` / `useOrderDetailsController.ts` | RequestRefill | Partial | 7 | P1 |
| 54 | Payments (account) | `src/views/PaymentsView.tsx` / `usePaymentsController.ts` | Patient/Payments | Partial | 6 | P1 |
| 55 | Consent Centre | `src/views/ConsentCentreView.tsx` / `useConsentCentreController.ts` | Consents, Grant, Withdraw, DataRequests | Partial | 1 | P1 |
| 56 | My Reviews | `src/views/MyReviewsView.tsx` / `useMyReviewsController.ts` | — | None | 4 | P2 |
| 57 | Appeal Review | `src/views/AppealReviewView.tsx` / `useAppealReviewController.ts` | — | None | 2 | P2 |
| 58 | Help Centre | `src/views/HelpCentreView.tsx` / `useHelpCentreController.ts` | Help (unused for UI topics) | Partial | 4 | P1 |
| 59 | Raise Ticket | `src/views/RaiseTicketView.tsx` / `useRaiseTicketController.ts` | CreateTicket | Partial | 3 | P1 |
| 60 | Book With Help | `src/views/BookWithHelpView.tsx` / `useBookWithHelpController.ts` | AssistanceRequest | Partial | 2 | P1 |
| 61 | Legal Document | `src/views/LegalDocumentView.tsx` / `useLegalDocumentController.ts` | — (G11 unused) | None | 3 | P1 |
| 62 | Notifications | `src/views/NotificationsView.tsx` / `useNotificationsController.ts` | Notifications, MarkRead | Partial | 7 | P1 |
| 63 | Notification Settings | `src/views/NotificationSettingsView.tsx` / `useNotificationSettingsController.ts` | — | None | 4 | P2 |
| 64 | Offline Mode | `src/views/OfflineModeView.tsx` / `OfflineModeGate.tsx` | NetInfo | N/A | 1 | P2 |
| 65 | Who-For Member Sheet | `src/components/WhoForMemberSheet.tsx` | Family, Home | Partial | 1 | P1 |
| 66 | Doctor Filters Sheet | `src/components/DoctorFiltersSheet.tsx` | — | None | 2 | P1 |
| 67 | Why Order Sheet | `src/components/WhyOrderSheet.tsx` | — | None | 1 | P2 |
| 68 | Cancel Appointment Sheet | `src/components/CancelAppointmentSheet.tsx` | via detail cancel | Partial | 1 | P1 |
| 69 | Add Family Member Sheet | `src/components/AddFamilyMemberSheet.tsx` | via family controller | Partial | 1 | P1 |
| 70 | Select Existing Document Sheet | `src/components/SelectExistingDocumentSheet.tsx` | patientDocuments seed | None | 2 | P1 |
| 71 | Date Picker Sheet | `src/components/DatePickerSheet.tsx` | — | N/A | 0 | P2 |
| 72 | Confirmation Modal | `src/components/ConfirmationModal.tsx` | — | N/A | 0 | P2 |
| 73 | Doctor Credentials Tab | `src/views/DoctorCredentialsTab.tsx` | seed profile credentials | None | 3 | P0 |
| 74 | Crash / Offline gates | `src/services/crashReporting`, `OfflineModeGate` | — | N/A | 0 | P2 |

\*Phone Setup UI is OS-only; push registration uses raw `fetch` in `deviceTokenApi.ts` (not RTK hooks). Consult Now Searching/Unavailable inherit Consult Now’s unused Instant APIs → treated as None for their primary job.

---

## 3. Detailed Screen-wise Findings

### SplashView, `src/views/SplashView.tsx` + `src/controllers/useSplashController.ts` + `src/navigation/AppNavigator.tsx`
- **Purpose:** Brand splash; session restore then route.
- **APIs currently integrated:** `POST api/Account/RefreshToken` via navigator restore (~L897 `AppNavigator.tsx`).
- **APIs available but not integrated:** A1 Welcome (not needed here); C4 Me after restore may be incomplete.
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Splash duration | 2800ms | `useSplashController.ts:5,18` | CLIENT-SIDE OK | — |

- **Response keys not mapped to UI:** RefreshToken `user` / expires may be underused vs C4.
- **Business logic gaps:** Must land on Home when token valid; onboarding-seen flag.
- **Missing states/flows:** Explicit “session ended” copy on refresh 401.
- **Contract mismatches:** None critical if refresh shape matches A3.
- **Mobile tasks:**
  - [ ] After refresh success always hydrate C4 `PatientProfile/Me` before Home.
  - [ ] Persist onboarding/first-launch flags (guide §5.5).
- **Backend tasks:**
  - [ ] Confirm RefreshToken body/header contract on all envs (guide A3).

### FirstLaunchView, `src/views/FirstLaunchView.tsx` + `src/controllers/useFirstLaunchController.ts`
- **Purpose:** Choose app language.
- **APIs currently integrated:** `GET api/mastersAPI/GetLanguages` (`firstLaunchApi.ts`).
- **APIs available but not integrated:** C5 save `preferredLanguageId`.
- **Status:** Full (primary list is dynamic)
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Language fallback EN/MR | FALLBACK array | `useFirstLaunchController.ts:26-39` | API; fallback OK offline | — |

- **Response keys not mapped to UI:** Hindi selectable but no dictionary (product).
- **Business logic gaps:** Persist language to C5 after login.
- **Missing states/flows:** Loading/error already soft-fallback.
- **Contract mismatches:** Bare array vs envelope handled in transform.
- **Mobile tasks:**
  - [ ] After auth, `PUT PatientProfile/Me` with `preferredLanguageId`.
- **Backend tasks:** None for list.

### OnboardingSlideView, `src/views/OnboardingSlideView.tsx` + `useOnboardingController.ts`
- **Purpose:** 3 intro slides.
- **APIs currently integrated:** None
- **APIs available but not integrated:** A1 `GET /api/Welcome/Patient` (alias; MobilePatient 404)
- **Status:** None
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Slide 1–3 | Local images + i18n keys | `useOnboardingController.ts:14-30` | A1 `slides[]` | Ensure Welcome deployed / alias OK |

- **Mobile tasks:**
  - [ ] Wire `getWelcome` RTK endpoint → map `slides`.
  - [ ] Send `welcomeVersionSeen` via C5.
- **Backend tasks:**
  - [ ] Fix Welcome encoding (Q14); deploy MobilePatient or keep alias.

### SignInView, `src/views/SignInView.tsx` + `useSignInController.ts`
- **Purpose:** Mobile + WhatsApp consent → OTP.
- **APIs currently integrated:** RequestOtp, Countries
- **APIs available but not integrated:** — (core covered)
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Helpline book CTA | Stub / noop risk | SignIn view/controller (helpline) | CONFIG/CMS | Support number endpoint or config |
| WhatsApp consent | Local only | controller validation | B1 should store (Q15) | NEW KEY / accept flags |

- **Business logic gaps:** Country dial code from Countries vs ignored by RequestOtp (Q15).
- **Contract mismatches:** Guide warns duplicate `params` on RequestOtp — verify `signInApi.ts` body-only.
- **Mobile tasks:**
  - [ ] Never show `devCode` outside `__DEV__`.
  - [ ] Pass WhatsApp opt-in if BE accepts (Q15).
- **Backend tasks:**
  - [ ] Accept/store WhatsApp + country (Q15); remove `devCode` outside dev (Q2).

### OtpVerificationView, `src/views/OtpVerificationView.tsx` + `useOtpVerificationController.ts`
- **Purpose:** Verify OTP; establish session.
- **APIs currently integrated:** VerifyOtp, RequestOtp (resend)
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Resend timer | 45s | `useOtpVerificationController.ts:21,74` | Server `expiresAt` / rate limits | Prefer server-driven remaining TTL |
| Routing field | Reads both `isUserAlreadyRegistered` and `isUserRegistered` | `:130-132` | B2 field | Stabilize on `isUserAlreadyRegistered` |

- **Business logic gaps:** Token save present (`:165`); ensure role Patient (Q16).
- **Mobile tasks:**
  - [ ] Reject non-Patient `user.role`.
  - [ ] Always persist `bookingSessionId` for G9.
- **Backend tasks:**
  - [ ] SMS delivery; stop leaking OTP (Q2).

### CompleteProfileView, `src/views/CompleteProfileView.tsx` + `useCompleteProfileController.ts`
- **Purpose:** Register / edit profile.
- **APIs currently integrated:** CreatePatient, location cascade, Genders, Profile Me GET/PUT, OTP re-verify
- **APIs available but not integrated:** C2 PinCodes; C6/C7 Patient/Profile health basics; address read (Q18)
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Accessibility toggles | Local only | CompleteProfile fields | C5/C7 or NEW KEYS | Q17 |
| Pin code | Free text / no PinCodes API | completeProfileApi missing PinCodes | C2 PinCodes | Ensure PinCodes wired |
| indianStates unused | `src/config/indianStates.ts` | leftover | Location APIs | Remove client list |

- **Mobile tasks:**
  - [ ] Add `getPinCodesByCity` RTK + UI.
  - [ ] Wire C6/C7 health section if product wants it.
  - [ ] Delete dead `indianStates.ts` usage.
- **Backend tasks:**
  - [ ] Address read/update contract (Q18); a11y fields (Q17).

### ConsentView, `src/views/ConsentView.tsx` + `useConsentController.ts`
- **Purpose:** Privacy + marketing/medicine toggles.
- **APIs currently integrated:** PrivacyStatus, Notice, GrantPrivacy, Consents, Grant, Withdraw
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Toggle mapping | Local type ↔ UI mapping may be incomplete | controller | D3 type codes | Document mapping Q21 |

- **Mobile tasks:**
  - [ ] Gate Continue on Privacy granted; handle `missingType` (Q20).
- **Backend tasks:**
  - [ ] Confirm onboarding toggle ↔ consent type codes (Q21).

### PhoneSetupView, `src/views/PhoneSetupView.tsx` + `usePhoneSetupController.ts`
- **Purpose:** OS permissions.
- **APIs currently integrated:** None in controller; push via `deviceTokenApi.ts` (fetch M1+M2)
- **Status:** N/A (UI) / Partial (push side-effect)
- **Mobile tasks:**
  - [ ] Prefer RTK `devicesApi` over raw fetch; call only after auth.
  - [ ] Resolve dual M1+M2 with BE (Q1).
- **Backend tasks:**
  - [ ] Finalize push registry (Q1); Expo token support.

### FamilyMembersView, `src/views/FamilyMembersView.tsx` + `useFamilyMembersController.ts`
- **Purpose:** Family CRUD.
- **APIs currently integrated:** Family list/create/update/delete, Relations, Genders
- **APIs available but not integrated:** Caregiver Me/Lookup/Grant/Revoke/List*, E11a OTP, BookAs (booking path)
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Invitation / authorised badges | UI statuses without BE fields | family UI | Caregiver grants / NEW KEYS | Q24 |

- **Mobile tasks:**
  - [ ] Wire caregiver section to E9–E13.
  - [ ] Remove any leftover seed members (SEED empty at `:47` — good).
- **Backend tasks:**
  - [ ] Invitation pending + authorised flags (Q24).

### HomeView, `src/views/HomeView.tsx` + `useHomeController.ts`
- **Purpose:** Hub: greeting, upcoming, quick actions, categories, tips, tabs.
- **APIs currently integrated:** PatientPortal/Home, Patient/Visits, Family, Public/Doctors
- **APIs available but not integrated:** CareCategories, Articles, Notifications unread, MobilePatient/Home preferred path
- **Status:** Partial
- **Static/hardcoded values found:**

| UI element | Current static value | File:line | Should come from | Backend action |
|---|---|---|---|---|
| Appointment fee | `₹500` | `useHomeController.ts:500` | Visit/fee fields | NEW KEY on H1/H2 if missing |
| Reason key | `aptReasonCough` | `:502` | Visit reason | NEW KEY (Q32) |
| Credentials/experience keys | Hardcoded translation keys | `:490-491` | Doctor profile | G2/G3 |
| Care categories | `careCategories.ts` via HomeView | HomeView + config | F2 | — |
| Health tips | `healthTips.ts` | HomeView | F3 | — |
| Client-only bookings retained | filter keeps local ids | `:510-515` | Server only after book | — |
| Consult Now strip counts | `consultNow.ts` | HomeView | Instant/config API | — |

- **Mobile tasks:**
  - [ ] Map fee/doctor credentials from API; remove `₹500`.
  - [ ] Wire `useGetCareCategoriesQuery`, `useGetArticlesQuery`.
  - [ ] Badge from Notifications unread count.
- **Backend tasks:**
  - [ ] Fee + reason on visit list (NEW KEY / Q32).

### MyAppointmentsView / Doctors tab
- **Purpose:** Bookings list.
- **APIs:** Same visit mapping as Home.
- **Status:** Partial — same fee/reason/status mapping gaps (`useHomeController.ts:470-507`).
- **Mobile tasks:** Drive CTAs from H2 `actions` when opening detail.

### HealthRecordsView, `useHealthRecordsController.ts`
- **Purpose:** Timeline of consults/Rx/docs.
- **APIs:** Timeline, Documents, Family
- **Status:** Partial
- **Static values:** `MEMBERS` initials PK/Aarav (`:95-105`); `SELF_ITEMS` / `AARAV_ITEMS` seed timelines (`:116+`) still present as fallbacks when API empty.
- **Response keys not mapped:** Prescription deep link should use J3; note J2; PDF J4 missing from RTK.
- **Mobile tasks:** Prefer API timeline exclusively; wire Prescription/Note/PDF; map family from E1 not seed MEMBERS.
- **Backend tasks:** Family-scoped timeline (Q34).

### MedicinesView, `useMedicinesController.ts`
- **APIs:** MedicineOrders, Family
- **Status:** Partial — maps quoteAmount (`:138`) but order UX still incomplete; refills K9 unused.
- **Mobile tasks:** Wire active Rx from Timeline/Erx; Refills list.

### AccountView, `useAccountController.ts`
- **APIs:** PatientProfile Me, DataRequests; logout via `performLogout` → Account/Logout
- **Status:** Partial
- **Static:** `appVersionLabel` from `release.ts` — CLIENT-SIDE OK / store listing.
- **Mobile tasks:** Ensure logout always calls M3+A4; profile edit uses C5 only (no seed name).

### SearchDoctorsView, `useSearchDoctorsController.ts`
- **APIs:** None
- **Status:** None
- **Static:** CARE_CATEGORIES (`:12-18`); cities solapur/pune/mumbai (`:20-24`); nearby Joshi/Patil (`:26-43`); recent searches (`:45-49`); default city solapur (`:94`).
- **Mobile tasks:** Drive categories from F2; nearby from G1 with geo/city; drop seed doctors.
- **Backend tasks:** Search filters (Q27).

### SearchResultsView, `useSearchResultsController.ts`
- **APIs:** `useGetDoctorsQuery` (overlay)
- **Status:** Partial
- **Static:** Full RESULTS seed anjali/rajesh/sunita fees 600/400/800 (`:21-97`); CURRENT_CITY_ID solapur (`:19`); fake load 1400ms (`:311`).
- **Mobile tasks:** Replace RESULTS with G1 mapping only; empty state when none; remove fake delay.
- **Backend tasks:** Credentials/languages on G1 (Q29); image URL rules (Q28).

### DoctorProfileView + DoctorCredentialsTab
- **APIs:** DoctorById, Fees, Reviews
- **Status:** Partial
- **Static:** `getDoctorProfile` seed always base (`useDoctorProfileController.ts:63-65`); credentials tab from seed (`doctorProfiles.ts:58-201`).
- **Unused RTK:** Ranking, TeleAvailability, Photo (G3/G7/G8 — Photo not even in RTK).
- **Mobile tasks:** Map G2/G5/G6 fully; add Ranking + Availability; implement Photo URL/binary; remove seed credentials.
- **Backend tasks:** Credentials fields (Q29); Photo URL convention.

### BookAppointmentView, `useBookAppointmentController.ts`
- **APIs:** DoctorById, Fees, Family, Home, Waitlist/Join
- **Unused critical:** `useGetDoctorSlotsQuery`, `useCreateBookingMutation`, `useBookAsFamilyMutation`
- **Status:** Partial
- **Static:** PLATFORM_FEE 90, TAX 0, CONSULT_FEE map, DEFAULT_SLOT 18:30, DEFAULT_MEMBER aarav (`appointmentSlots.ts:181-194`); synthetic day full/closed (`:249-256`).
- **Mobile tasks:**
  - [ ] Load slots from G4 by selected date.
  - [ ] Create booking G9 or E8; pass `bookingSessionId`, `holdExpiresAt`.
  - [ ] Platform fee: use server only (Q30).
- **Backend tasks:** Align platform fee (Q30); Family/BookAs schedule parity (Q25).

### BookingReviewView, `useBookingReviewController.ts`
- **APIs:** None (`useGetTermsPolicyQuery` unused)
- **Status:** None
- **Static:** Fee labels from upstream draft; policy toggles local (`:72-75`).
- **Mobile tasks:** Load G11 Terms; create booking on proceed; attach docs via J6 + link (Q32).
- **Backend tasks:** Booking reason/attachments (Q32).

### BookingPaymentView, `useBookingPaymentController.ts`
- **APIs:** None (G12/G13 unused)
- **Status:** None
- **Static:** SLOT_HOLD_SECONDS 10min (`bookingPayment.ts:19`); banks/wallets lists (`:21-30`); DEFAULT gpay (`:18`).
- **Mobile tasks:** CreateConsultOrder; open Razorpay with `keyId`/`gatewayOrderId`; countdown from `holdExpiresAt`.
- **Backend tasks:** Webhook CAPTURED (Q44); hold release job (Q43).

### PaymentStatusView, `usePaymentStatusController.ts`
- **APIs:** None (Verify, Appointments summary, Bookings/{token} unused)
- **Status:** None
- **Static:** SEED_PAYMENT_ID / SEED_ATTEMPT_ID / SEED_REASON_KEY (`:111-112,137-138`); chat +7 days (`:116-118`).
- **Mobile tasks:** Poll G14 until CAPTURED; show real ids; remove seeds.

### AppointmentDetailView, `useAppointmentDetailController.ts`
- **APIs:** Visit detail, Cancel, Reschedule
- **Unused:** ChangeLog, RefundPolicy hooks
- **Status:** Partial
- **Static:** FALLBACK_APPOINTMENT (`:285-305`); clinic tel `+918001234567`; Maps Prabhat Road Pune (`:856-861`).
- **Mobile tasks:** Drive buttons from `actions`; show H6 refund preview; ChangeLog UI; clinic phone from API.
- **Backend tasks:** Clinic phone (Q35); status mapping (Q26); cancel cut-off (Q36).

### ClinicCheckInView
- **APIs:** None (Q7)
- **Status:** None — **API MISSING**
- **Static:** Demo early/waiting/ready (`ClinicCheckInView.tsx:75-159`; `onSelectCheckInDemoState`).
- **Backend tasks:** PROPOSED check-in + late + switch-online APIs (see §5/§6.1).
- **Mobile tasks:** Remove demo toggles after API exists.

### DeviceCheckView, `useDeviceCheckController.ts`
- **APIs:** I4 `useGetDeviceCheckQuery` unused
- **Status:** None
- **Static:** `mockNetworkCheck` good/4.2 Mbps (`:45-47,89`); force weak 0.4 (`:82-87`); fallback doctor Anjali / 6:30 PM (`:102-103`).
- **Mobile tasks:** Combine on-device permissions with I4 vendor hints; remove mock Mbps as truth.

### WaitingRoomView, `useWaitingRoomController.ts`
- **APIs:** I5 unused
- **Status:** None
- **Static:** elapsed 88s (`:82`); ETA `'3'` / late `'10'` (`:129-134`); documentCount 2 (`:156`); demo late toggle (`:179`).
- **Mobile tasks:** Poll Tele/Sessions; join when Active; handle stub.

### VideoCallView, `useVideoCallController.ts`
- **APIs:** Token/Rejoin/Consent unused
- **Status:** None
- **Static:** DEMO_* timers (`:113-117`); seed chat (`:79-98`); call elapsed 8:12; chatUnread 2 (`:186,137`); fake disconnect handlers.
- **Mobile tasks:** Real SDK from I6 token; recording consent I9; remove DEMO_*.
- **Backend tasks:** Vendor/SDK per env (Q8).

### JoinFailedView
- **APIs:** JoinFailure wired
- **Status:** Partial — still depends on appointment seed context.
- **Mobile tasks:** Map `allowedCodes`, `retry`, `supportPath` from response.

### ConsultationChatView
- **APIs:** Chat GET/POST
- **Status:** Partial — closed demo toggle (`onToggleClosedDemo`); attachments unsupported (Q38).
- **Mobile tasks:** Poll/refresh messages; remove demo closed.

### ConsultationCompleteView
- **APIs:** Tele Summary
- **Status:** Partial — Rx via J3 unused; follow-up navigation local.
- **Mobile tasks:** Load Erx + Summary together.

### RateConsultationView
- **APIs:** CreateReview
- **Status:** Partial — ASPECTS/TAGS local lists (`:50-67`) CLIENT-SIDE OK if product agrees; need `patientAppId` real.

### ConsultNow* (+ OfferSheet)
- **APIs used:** Family, Home only
- **Unused:** Instant request/status/cancel; payments
- **Status:** Partial/None for matching
- **Static:** Offers/fees/cities/delays in `consultNow.ts:53-112`; fake pay success 2500ms (`useConsultNowController.ts:330`); available=14 (`:436-477`).
- **Backend tasks:** Define post-ACCEPTED flow (Q37).
- **Mobile tasks:** Wire I1–I3 + payment; delete seed offers.

### PrescriptionView
- **APIs:** None (J3/J4 unused / J4 not in RTK)
- **Status:** None
- **Static:** MEDICINES + ADVICE (`usePrescriptionController.ts:26-48`).
- **Mobile tasks:** Map Erx items (codes/potency); PDF download with Bearer.

### ConsultationRecordView
- **APIs:** J2 unused
- **Status:** None
- **Mobile tasks:** Wire Note; version history if BE adds.

### UploadDocumentView
- **APIs:** Upload mutation; still `addDemoFile` for camera/gallery (`:145,213-215`)
- **Status:** Partial
- **Mobile tasks:** Real image picker → multipart J6; delete demo files; enforce 10MB.

### FollowUpPlanView
- **APIs:** FollowUps + Complete
- **Status:** Partial — INITIAL_TASKS fallback (`:66`); photos unsupported (Q39).

### SymptomDiary* 
- **APIs:** Diary GET/POST; update/delete unused
- **Status:** Partial — SEEDED_ENTRIES (`:92-105`); photos (Q39).

### HealthInsights / CliniSight
- **APIs:** Progress (visitCount + severity series)
- **Status:** Partial — FOLLOW_UPS/ADHERENCE seeds (`useHealthInsightsController.ts:46-61`); metrics gap Q9.
- **Backend tasks:** Extra metrics (Q9).

### RemindersCentreView
- **APIs:** None — **API MISSING** (Q10)
- **Status:** None
- **Static:** Doctor/self-care seeds (`:112-155`); progress 1/3 (`:200-201`); default times.
- **Resolution:** Keep local (CLIENT-SIDE OK) **or** NEW API — product decide.

### HealthTipArticleView
- **APIs:** F4 unused; uses `healthTips.ts`
- **Status:** None
- **Mobile tasks:** `useGetArticleByIdQuery`.

### OrderMedicines / ReviewOrder / Checkout / Tracking / Details / ChoosePharmacy
- **Status:** None → Partial with severe static pricing
- Evidence: pharmacies ₹310/280/290 ignoring sellers (`useChoosePharmacyController.ts:57-93,115-119`); checkout totals ₹250/60/310 (`useMedicineCheckoutController.ts:87-91`); orderId `1209` (`:101-103`, tracking `:60`); OTP `4,7,2,9` (`useOrderTrackingController.ts:48,85`); RX-2026-77410; Dr. Anjali Deshmukh (`useOrderDetailsController.ts:128-131`).
- **Unused RTK:** createMedicineOrder, consent, acceptQuote, getRefills, refillMedicineOrder
- **Backend tasks:** Checkout keyId (Q40); serviceability/prices (Q41).
- **Mobile tasks:** Full K2–K10 chain; remove hardcoded money.

### PaymentsView
- **APIs:** Payments history
- **Status:** Partial — seed amounts ₹600/310/900/550 (`:77-117`); demo empty toggle (`:147`).
- **Mobile tasks:** Render API rows only; remove seeds/demo.

### ConsentCentreView
- **APIs:** Consents suite
- **Status:** Partial — confirm withdraw UX (Q22).

### MyReviewsView / AppealReviewView
- **APIs:** None — **API MISSING** (Q11; appeals doctor-only)
- **Status:** None
- **Static:** Seeded reviews (`useMyReviewsController.ts:32-62`).
- **Backend tasks:** PROPOSED `GET /api/Reviews/Mine` + appeal patient path — or remove screens.

### HelpCentreView
- **APIs:** Help articles fetched but UI uses HELP_TOPICS (`:47-73,101`); helpline noop (`:108`)
- **Status:** Partial
- **Mobile tasks:** Render L4 articles; open L5 by slug; wire helpline from config API.

### RaiseTicketView
- **APIs:** CreateTicket
- **Status:** Partial — TOPIC_OPTIONS local (`:50-70`); Mine/Messages unused.
- **Mobile tasks:** Ticket inbox + thread L3/L3b/L3c.

### BookWithHelpView
- **APIs:** AssistanceRequest
- **Status:** Partial
- **Static:** Helpline `tel:18001234567`, WhatsApp `918001234567` (`:106-110`) → CONFIG.

### LegalDocumentView
- **APIs:** G11 unused
- **Status:** None
- **Static:** Section keys client (`useLegalDocumentController.ts:22-63`).
- **Backend tasks:** Policy types beyond Terms (Q12).

### NotificationsView
- **APIs:** List + MarkRead
- **Status:** Partial
- **Static:** SEED 6 items (`:54-117`); initial state SEED (`:127`); filter inferred from title text (`:140-145`).
- **Backend tasks:** `type` / deep-link ids (Q42); delete endpoint if product needs swipe-delete.
- **Mobile tasks:** No SEED when authenticated; map type for filters/actions.

### NotificationSettingsView
- **APIs:** None — **API MISSING** (Q13)
- **Status:** None — keep local or NEW API.

### OfflineModeView
- **Status:** N/A
- **Static:** Helpline `tel:18001234567` (`useOfflineModeController.ts:75-76`) → CONFIG.

### Sheets / Credentials tab
- Covered in matrix rows 65–73. SelectExistingDocument uses `patientDocuments.ts:15-30` seeds. DoctorCredentialsTab uses `doctorProfiles` seed — P0 for compliance display.

---

## 4. Orphan APIs (in doc, never used by the app)

| Method | Route (doc) | Card | In RTK? | Called by UI? | Notes |
|---|---|---|---|---|---|
| GET | `/api/MobilePatient/Welcome` (+ alias Welcome/Patient) | A1 | No | No | Onboarding still local |
| GET | `/api/UserAddressLocation/PinCodes/ByCity/{id}` | C2 | No | No | Profile PIN |
| GET/PUT | `/api/Patient/Profile` | C6/C7 | No | No | Health basics |
| GET | `/api/Profile/Photo/{doctorId}` | G8 | No | No | Doctor avatar |
| GET | `/api/Erx/{erxSnapshotId}/Pdf` | J4 | No (comment only in recordsApi) | No | Rx PDF |
| GET | `/api/Device/Mine` | M2 | No | No | Device list |
| POST | `/api/Otp/RequestOtp` | E11a | No | No | Caregiver OTP |
| POST | `/api/Family/Relations` | E6 write | No | No | Custom relation |
| GET | `/api/MobilePatient/*` preferred paths | F1/H2/G17 | Aliases used | Aliases only | Switch after Q3 |

**Declared in RTK but never imported by controllers (orphaned stubs — 52 hooks):**  
`useCreateBookingMutation`, `useBookAsFamilyMutation`, `useGetBookingByTokenQuery`, `useGetTermsPolicyQuery`, `useGetWaitlistOffersQuery`, `useGetDoctorSlotsQuery`, `useGetDoctorRankingQuery`, `useGetDoctorTeleAvailabilityQuery`, `useCreateConsultOrderMutation`, `useVerifyPaymentMutation`, `useGetAppointmentPaymentSummaryQuery`, `useGetRefundPolicyQuery` (×2 files), `useRequestInstantConsultMutation`, `useGetInstantConsultStatusQuery`, `useCancelInstantConsultMutation`, `useGetDeviceCheckQuery`, `useGetTeleSessionQuery`, `useGetTeleTokenMutation`, `useRejoinTeleSessionMutation`, `useSendRecordingConsentMutation`, `useGetCareCategoriesQuery`, `useGetArticlesQuery`, `useGetArticleByIdQuery`, `useGetConsultationNoteQuery`, `useGetPrescriptionQuery`, `useDeleteDocumentMutation`, `useCreateMedicineOrderMutation`, `useGrantMedicineConsentMutation`, `useAcceptMedicineQuoteMutation`, `useGetRefillsQuery`, `useRefillMedicineOrderMutation`, caregiver hooks (6), ticket message hooks, help-by-slug, diary update/delete, device register hooks (raw fetch used instead), `useRefreshTokenMutation`/`useLogoutMutation` (`.initiate` used in session — hooks unused).

---

## 5. Screens With No API Available (API MISSING)

| Screen | Required data/actions | PROPOSED endpoint |
|---|---|---|
| ClinicCheckIn | early / waiting / ready; notify clinic | `POST /api/Patient/Visits/{patientAppId}/CheckIn` body `{ status }` → `{ success, data: { status, queuePosition, readyAt } }` Auth P |
| WaitingRoom “running late” | patient late notice | `POST /api/Tele/Sessions/{id}/RunningLate` `{ minutes }` |
| Switch to online | convert clinic→tele | `POST /api/PatientAppointment/SwitchToTele` `{ patientAppId }` |
| RemindersCentre | CRUD reminders | `GET/POST/PUT/DELETE /api/Patient/Reminders` (or keep local — Q10) |
| MyReviews | list my reviews | `GET /api/Reviews/Mine` → `{ success, data: [{ reviewId, patientAppId, doctorName, rating, text, createdAt, appealStatus? }] }` |
| AppealReview | patient appeal | `POST /api/Reviews/{id}/Appeal` `{ reason }` (today doctor-only) |
| NotificationSettings | channel prefs | `GET/PUT /api/Notifications/Preferences` |
| Data request history / hard delete | list + delete account | `GET /api/Patient/DataRequests`; `DELETE /api/Account` (Q23) |

---

## 6. BACKEND DEVELOPER ACTION LIST (Cursor-ready)

### 6.1 New APIs to create

**Task BE-1 — Patient clinic check-in**  
Paste into Cursor: *Implement `POST /api/Patient/Visits/{patientAppId}/CheckIn` for patient Bearer auth. Body `{ "status": "EARLY"|"WAITING"|"READY" }`. Response `{ "success": true, "data": { "patientAppId", "status", "queuePosition", "message" } }`. Reject if visit not clinic or not today.*  
**AC:** 200 for owner patient; 403 other; swagger tagged Patient.

**Task BE-2 — My reviews list**  
*Implement `GET /api/Reviews/Mine` returning the logged-in patient’s reviews (mirror doctor Reviews/Mine shape but patient-scoped). Include `doctorId`, `doctorName`, `rating`, `text`, `createdAt`, `patientAppId`.*  
**AC:** Never returns other patients’ reviews; empty array OK.

**Task BE-3 — Notification preferences**  
*Implement `GET` + `PUT /api/Notifications/Preferences` with `{ appointments, prescriptions, medicines, marketing, quietHoursEnabled, reminderOffsetsMinutes[] }`.*  
**AC:** Persists per userId; defaults documented.

**Task BE-4 — Patient reminders (if product keeps cloud sync)**  
*CRUD `/api/Patient/Reminders` with memberPatientId, kind, timeOfDay, weekdays, linkedErxId?.*  
**AC:** Soft-delete; scoped to owner/family rules.

**Task BE-5 — Visit fee + reason on list/detail**  
*Add to H1/H2 response: `consultFee`, `currency`, `reasonText`, `clinicPhone` (Q32/Q35).*  
**AC:** Mobile can remove hardcoded `₹500` and clinic tel.

**Task BE-6 — Medicine online checkout fields**  
*Make `POST /api/Payments/MedicineOrders` return same gateway fields as ConsultOrders when `payMode=ONLINE`: `gatewayReady`, `keyId`, `gatewayOrderId`, `amount`, `currency` (Q40).*  
**AC:** Patient app can open Razorpay without hardcoding.

**Task BE-7 — Pharmacy quote richness**  
*Extend `GET /api/Pharmacy/Sellers` (and order quote) with `priceTotal`, `deliveryFee`, `etaMinutes`, `fulfilPercent`, `distanceKm`, `serviceable` by PIN (Q41).*  
**AC:** ChoosePharmacy can render server prices.

### 6.2 Keys to add to existing APIs

**H1/H2 — CURRENT (simplified):** `{ patientAppId, appointmentDate, appointmentTime, status, consultMode, doctorId, doctorName, … }`  
**PROPOSED:** add  
`consultFee` // NEW number  
`currency` // NEW string "INR"  
`reasonText` // NEW string|null  
`clinicPhone` // NEW string|null  
`clinicAddress` // NEW string|null  

**M4 Notifications — PROPOSED:**  
`type` // NEW enum appointment|prescription|medicine|system  
`deepLink` // NEW `{ screen, id }`  
`appointmentId` // NEW number|null  

**G1/G2 Doctors — PROPOSED (Q29):**  
`languages[]`, `registrationNumber`, `education[]`, `yearsExperience`, `photoUrl`  

**G12 ConsultOrders — ensure always:** `holdExpiresAt` echoed; platform fee line items if charged (Q30).  

**K3 Sellers — PROPOSED:** see BE-7.  

**J15 Progress — PROPOSED (Q9):** `adherencePercent`, `followUpsCompleted`, `followUpsTotal` // NEW  

### 6.3 Config/Master-data/CMS endpoints required

| Need | PROPOSED |
|---|---|
| Support helpline / WhatsApp | `GET /api/Public/AppConfig` → `{ helplineTel, whatsappE164, supportEmail }` |
| Care categories | Already F2 — ensure content filled |
| Articles/tips | Already F3/F4 |
| Help topics | Already L4 — publish articles matching app topics |
| Legal policies | G11 types: Terms, Privacy, About, Refund (Q12) |
| Onboarding slides | A1 Welcome |
| Feature flags | Include in AppConfig: `instantConsultEnabled`, `medicineOnlinePayEnabled` |

### 6.4 Business logic to move server-side

| Logic | Today on client | Server rule |
|---|---|---|
| Platform fee ₹90 | `PLATFORM_FEE_RUPEES` | Include in payment order breakdown or stop charging (Q30) |
| Slot availability | Synthetic calendar | G4 only source of truth |
| Instant matching | Seed offers + timers | Tele/Instant queue |
| Refund eligibility | Copy only | H6 policy |
| Medicine totals | Hardcoded ₹310 | Quote + AcceptQuote |
| OTP resend window | 45s local | Respect 429 + `expiresAt` |
| Notification filters | Title string contains | Server `type` |

### 6.5 Validation/error-code/enum standardization

- Appointment `status` ↔ app states (Q26) — publish enum table.
- JoinFailure `code` list — document `allowedCodes`.
- Payment statuses: PENDING/CAPTURED/FAILED — poll contract.
- Consent type codes for onboarding toggles (Q21).
- Reject VerifyOtp when `user.role !== Patient` (Q16).

### 6.6 Pagination/filter/sort support to add

- G1 Doctors: category, language, availability, sort (Q27) — query params.
- F3 Articles: already pageNumber/pageSize — ensure mobile uses them.
- M4 Notifications: cursor/page + filter by type.
- H1 Visits: filter by status/member (Q34 family access model).

---

## 7. MOBILE DEVELOPER ACTION LIST

Ordered for Cursor. Architecture: controller owns hooks; view stays dumb; one `*Api.ts` per screen family (existing rule).

### P0 — Core funnel
1. **BookAppointment:** Wire `useGetDoctorSlotsQuery(date)`; remove `appointmentSlots` synthetic grids; on confirm call `useCreateBookingMutation` or `useBookAsFamilyMutation` with `bookingSessionId`.
2. **BookingReview:** `useGetTermsPolicyQuery`; pass real fee breakdown from G5/G9 response.
3. **BookingPayment:** `useCreateConsultOrderMutation` → Razorpay Checkout → `useVerifyPaymentMutation` + poll `useGetAppointmentPaymentSummaryQuery`; countdown from `holdExpiresAt` not `SLOT_HOLD_SECONDS`.
4. **PaymentStatus:** Remove `SEED_*`; show gateway/payment ids from API.
5. **SearchResults:** Delete `RESULTS` seed; map only G1; remove 1400ms fake delay.
6. **SearchDoctors:** Categories from F2; nearby from G1; delete Joshi/Patil seeds.
7. **DoctorProfile/Credentials:** Stop `getDoctorProfile` seed base; map G2+G5+G6; add Ranking/Availability/Photo.
8. **Home:** Remove `feeLabel: '₹500'`; wire CareCategories + Articles; unread badge from M4.
9. **ConsultNow:** Wire Instant I1–I3; delete `consultNow.ts` offers; real payment path.
10. **Tele path:** DeviceCheck I4 + device perms; WaitingRoom poll I5; VideoCall Token/Rejoin/Consent; remove DEMO_*.
11. **Prescription:** `useGetPrescriptionQuery` + implement J4 PDF endpoint in RTK.
12. **Medicines commerce:** K2→K4→K5→K6→K7 end-to-end; delete PHARMACIES prices and orderId 1209.

### P1 — Care & account
13. Wire ConsultationRecord J2; Upload real files; FollowUps without INITIAL_TASKS fallback.
14. Diary update/delete hooks; Progress-only insights until Q9.
15. Notifications: no SEED when `notifResponse` present; deep links (Q42).
16. Help: render L4/L5; tickets Mine + messages.
17. Legal: `Public/Policies/{type}`.
18. Caregiver UI on Family screen.
19. Prefer RTK devicesApi; remove duplicate fetch if redundant.
20. PinCodes cascade; C6/C7 optional health block.

### P2 — Polish
21. Onboarding Welcome A1.
22. Reminders: local-only flag in UI **or** wait for BE.
23. MyReviews/Appeal: hide until API or implement BE-2.
24. Notification settings: local AsyncStorage labeled “device only” or wait BE-3.
25. Remove demo long-press toggles (Payments empty, DeviceCheck weak, WaitingRoom late, Chat closed, ClinicCheckIn demo).
26. Delete unused config seeds after migration: `doctorProfiles`, `bookedAppointments` seeds, `healthTips`, `careCategories`, `bookingPayment` banks (if Razorpay owns methods), `patientDocuments` demo library, `indianStates`.

---

## 8. Static Values Master Register

| ID | Screen | Value | File:line | Category | Resolution (1–5) | Owner | Priority |
|---|---|---|---|---|---|---|---|
| S001 | Splash | 2800ms duration | `useSplashController.ts:5` | timer | 5 | Mobile | P2 |
| S002 | FirstLaunch | FALLBACK EN/MR | `useFirstLaunchController.ts:26-39` | mock | 5 (offline) | Mobile | P2 |
| S003 | Onboarding | 3 local slides | `useOnboardingController.ts:14-30` | list | 3 (A1 unused) | Mobile | P2 |
| S004 | OTP | Resend 45s | `useOtpVerificationController.ts:21` | timer | 2/5 | BE/Mobile | P1 |
| S005 | Book | PLATFORM_FEE 90 | `appointmentSlots.ts:184` | price | 1/4 (Q30) | BE | P0 |
| S006 | Book | TAX 0 | `appointmentSlots.ts:185` | price | 1 | BE | P0 |
| S007 | Book | Per-doctor fee map | `appointmentSlots.ts:187-194` | price | 3 (G5) | Mobile | P0 |
| S008 | Book | DEFAULT_SLOT 18:30 | `appointmentSlots.ts:181` | mock | 3 (G4) | Mobile | P0 |
| S009 | Book | DEFAULT_MEMBER aarav | `appointmentSlots.ts:182` | mock | 3 (E1) | Mobile | P0 |
| S010 | Book | Synthetic slots grids | `appointmentSlots.ts:145-179` | mock | 3 (G4) | Mobile | P0 |
| S011 | Book | Sat closed / day%9 full | `appointmentSlots.ts:249-256` | mock | 3 | Mobile | P0 |
| S012 | Payment | SLOT_HOLD 10min | `bookingPayment.ts:19` | timer | 3 (`holdExpiresAt`) | Mobile | P0 |
| S013 | Payment | Banks HDFC/SBI/ICICI | `bookingPayment.ts:21-25` | list | 4/5 | Mobile | P1 |
| S014 | Payment | Wallets Amazon/MobiKwik | `bookingPayment.ts:27-30` | list | 4/5 | Mobile | P1 |
| S015 | Payment | Default gpay | `bookingPayment.ts:18` | config | 5 | Mobile | P2 |
| S016 | PaymentStatus | SEED_PAYMENT_ID | `bookedAppointments.ts:32` + controller | mock | 3 | Mobile | P0 |
| S017 | PaymentStatus | SEED_ATTEMPT_ID | `bookedAppointments.ts:33` | mock | 3 | Mobile | P0 |
| S018 | PaymentStatus | Chat +7 days | `usePaymentStatusController.ts:116-118` | timer | 2 | BE | P1 |
| S019 | Doctors | Seed profiles ×3 | `doctorProfiles.ts:58-201` | mock | 3 | Mobile | P0 |
| S020 | Doctors | Alias fallbacks | `doctorProfiles.ts:203-206` | mock | 3 | Mobile | P0 |
| S021 | Search | RESULTS seed fees | `useSearchResultsController.ts:21-97` | mock | 3 | Mobile | P0 |
| S022 | Search | CURRENT_CITY solapur | `useSearchResultsController.ts:19` | config | 3/4 | Mobile | P1 |
| S023 | Search | Fake load 1400ms | `useSearchResultsController.ts:311` | timer | 5 remove | Mobile | P1 |
| S024 | Search entry | Nearby Joshi/Patil | `useSearchDoctorsController.ts:26-43` | mock | 3 | Mobile | P0 |
| S025 | Search entry | Cities list | `useSearchDoctorsController.ts:20-24` | list | 4 | BE/Mobile | P1 |
| S026 | Search entry | CARE_CATEGORIES | `careCategories.ts:14-50` | list | 3 (F2) | Mobile | P1 |
| S027 | Home | feeLabel ₹500 | `useHomeController.ts:500` | price | 2/3 | BE/Mobile | P0 |
| S028 | Home | reason aptReasonCough | `useHomeController.ts:502` | mock | 2 | BE | P0 |
| S029 | Home | seed-followup-chat keep | `useHomeController.ts:513` | mock | 5 remove | Mobile | P1 |
| S030 | Home tips | healthTips corpus | `healthTips.ts:31-113` | list | 3 (F3) | Mobile | P2 |
| S031 | ConsultNow | Cities Pune/Mumbai | `consultNow.ts:53-59` | list | 4 | BE | P1 |
| S032 | ConsultNow | availableDoctors 14 | `consultNow.ts:61` | mock | 3 (I2) | Mobile | P0 |
| S033 | ConsultNow | wait 4–8 min | `consultNow.ts:62-63` | mock | 3 | Mobile | P0 |
| S034 | ConsultNow | Mode fees 600/600/400 | `consultNow.ts:64-68` | price | 3 | Mobile | P0 |
| S035 | ConsultNow | Offer seeds | `consultNow.ts:80-108` | mock | 3 | Mobile | P0 |
| S036 | ConsultNow | Search 2800ms | `consultNow.ts:110` | timer | 5/3 | Mobile | P1 |
| S037 | ConsultNow | Offer TTL 108s | `consultNow.ts:111` | timer | 2 | BE | P1 |
| S038 | ConsultNow | Max declines 2 | `consultNow.ts:112` | config | 2/5 | BE | P1 |
| S039 | ConsultNow | Fake pay success 2.5s | `useConsultNowController.ts:330` | demo | 3 (G12) | Mobile | P0 |
| S040 | DeviceCheck | mockNetworkCheck 4.2 | `useDeviceCheckController.ts:45-47` | demo | 3 (I4+device) | Mobile | P0 |
| S041 | DeviceCheck | Force weak 0.4 | `useDeviceCheckController.ts:82-87` | demo | 5 remove | Mobile | P1 |
| S042 | WaitingRoom | Elapsed start 88 | `useWaitingRoomController.ts:82` | mock | 3 | Mobile | P0 |
| S043 | WaitingRoom | ETA 3 / late 10 | `useWaitingRoomController.ts:129-134` | mock | 2/3 | BE/Mobile | P0 |
| S044 | WaitingRoom | documentCount 2 | `useWaitingRoomController.ts:156` | mock | 3 | Mobile | P1 |
| S045 | VideoCall | DEMO consent 5s | `useVideoCallController.ts:113` | demo | 5 remove | Mobile | P0 |
| S046 | VideoCall | DEMO disconnect 28s | `useVideoCallController.ts:115` | demo | 5 remove | Mobile | P0 |
| S047 | VideoCall | DEMO rejoin 50s | `useVideoCallController.ts:117` | demo | 5 remove | Mobile | P0 |
| S048 | VideoCall | Seed chat messages | `useVideoCallController.ts:79-98` | mock | 3 (I11) | Mobile | P0 |
| S049 | VideoCall | chatUnread 2 | `useVideoCallController.ts:137` | mock | 3 | Mobile | P1 |
| S050 | VideoCall | Start elapsed 8:12 | `useVideoCallController.ts:186` | mock | 3 | Mobile | P1 |
| S051 | Pharmacy | ₹310/280/290 cards | `useChoosePharmacyController.ts:57-93` | price | 2/3 | BE/Mobile | P0 |
| S052 | Pharmacy | API response ignored | `useChoosePharmacyController.ts:115-119` | mock | 3 | Mobile | P0 |
| S053 | ReviewOrder | Item prices 90/80/80 | `useReviewOrderController.ts:43-65` | price | 3 | Mobile | P0 |
| S054 | ReviewOrder | Totals 250/60/0/310 | `useReviewOrderController.ts:104-107` | price | 3 | Mobile | P0 |
| S055 | ReviewOrder | RX-2026-77410 | `useReviewOrderController.ts:99` | mock | 3 | Mobile | P0 |
| S056 | Checkout | Items 160/90 | `useMedicineCheckoutController.ts:38-53` | price | 3 | Mobile | P0 |
| S057 | Checkout | Totals 250/0/60/310 | `useMedicineCheckoutController.ts:87-91` | price | 3 | Mobile | P0 |
| S058 | Checkout | medicineOrderId 1209 | `useMedicineCheckoutController.ts:101-103` | mock | 3 | Mobile | P0 |
| S059 | Tracking | Order id 1209 | `useOrderTrackingController.ts:60` | mock | 3 | Mobile | P0 |
| S060 | Tracking | OTP 4,7,2,9 | `useOrderTrackingController.ts:48,85` | mock | 2 | BE | P0 |
| S061 | Tracking | Prices 185/14/199 | `useOrderTrackingController.ts:93-95` | price | 3 | Mobile | P0 |
| S062 | OrderDetails | Items 90/45/115 | `useOrderDetailsController.ts:56-75` | price | 3 | Mobile | P1 |
| S063 | OrderDetails | Dr Anjali / licence / invoice | `useOrderDetailsController.ts:128-131` | mock | 3 | Mobile | P1 |
| S064 | OrderDetails | erxSnapshotId 3307 | `useOrderDetailsController.ts:159` | mock | 3 | Mobile | P1 |
| S065 | OrderMedicines | Meds m01–m03 | `useOrderMedicinesController.ts:50-54` | list | 3 | Mobile | P0 |
| S066 | OrderMedicines | Pin 413001 demo | `useOrderMedicinesController.ts:73-74` | demo | 3 | Mobile | P1 |
| S067 | OrderMedicines | RX-2026-77410 | `useOrderMedicinesController.ts:125` | mock | 3 | Mobile | P0 |
| S068 | Prescription | MEDICINES seed | `usePrescriptionController.ts:26-42` | list | 3 (J3) | Mobile | P0 |
| S069 | Prescription | ADVICE seed | `usePrescriptionController.ts:44-48` | list | 3 | Mobile | P0 |
| S070 | Records | MEMBERS PK/Aarav | `useHealthRecordsController.ts:95-105` | list | 3 (E1) | Mobile | P1 |
| S071 | Records | SELF_ITEMS timeline | `useHealthRecordsController.ts:116+` | mock | 3 (J1) | Mobile | P1 |
| S072 | Docs | Demo PDF/JPG library | `patientDocuments.ts:15-30` | mock | 3 (J5) | Mobile | P1 |
| S073 | Upload | addDemoFile camera/gallery | `useUploadDocumentController.ts:213-215` | demo | 3 (J6) | Mobile | P1 |
| S074 | Notifications | SEED 6 items | `useNotificationsController.ts:54-117` | mock | 3 (M4) | Mobile | P1 |
| S075 | Notifications | Initial items=SEED | `useNotificationsController.ts:127` | mock | 3 | Mobile | P1 |
| S076 | Notifications | Filter from title text | `useNotificationsController.ts:140-145` | mock | 2 | BE | P1 |
| S077 | Notif settings | Default channel matrix | `useNotificationSettingsController.ts:31-37` | config | 1/5 | BE/Mobile | P2 |
| S078 | Reminders | Doctor reminder seeds | `useRemindersCentreController.ts:112-139` | mock | 1/5 | BE | P2 |
| S079 | Reminders | Self-care seeds | `useRemindersCentreController.ts:141-155` | mock | 1/5 | BE | P2 |
| S080 | Reminders | todayDone 1/3 | `useRemindersCentreController.ts:200-201` | mock | 1 | BE | P2 |
| S081 | MyReviews | Seeded reviews | `useMyReviewsController.ts:32-62` | mock | 1 | BE | P2 |
| S082 | Help | HELP_TOPICS static | `useHelpCentreController.ts:47-73` | list | 3 (L4) | Mobile | P1 |
| S083 | Help | Helpline noop | `useHelpCentreController.ts:108` | config | 4 | BE | P1 |
| S084 | BookWithHelp | tel:18001234567 | `useBookWithHelpController.ts:106-110` | config | 4 | BE | P1 |
| S085 | Offline | tel:18001234567 | `useOfflineModeController.ts:75-76` | config | 4 | BE | P2 |
| S086 | Apt detail | FALLBACK appointment | `useAppointmentDetailController.ts:285-305` | mock | 3 | Mobile | P0 |
| S087 | Apt detail | Clinic +918001234567 | `useAppointmentDetailController.ts:856-861` | config | 2 | BE | P1 |
| S088 | Apt detail | Maps Prabhat Road Pune | `useAppointmentDetailController.ts:856-861` | config | 2 | BE | P1 |
| S089 | Payments | Seed ₹600/310/900/550 | `usePaymentsController.ts:77-117` | price | 3 (G16) | Mobile | P1 |
| S090 | Payments | demoToggle | `usePaymentsController.ts:147` | demo | 5 remove | Mobile | P2 |
| S091 | Legal | Local sections | `useLegalDocumentController.ts:22-63` | list | 3 (G11) | Mobile | P1 |
| S092 | Diary | SEEDED_ENTRIES | `useSymptomDiaryController.ts:92-105` | mock | 3 | Mobile | P1 |
| S093 | FollowUp | INITIAL_TASKS | `useFollowUpPlanController.ts:66` | mock | 3 | Mobile | P1 |
| S094 | Insights | FOLLOW_UPS/ADHERENCE | `useHealthInsightsController.ts:46-61` | mock | 2 (Q9) | BE | P2 |
| S095 | Rate | ASPECTS/TAGS | `useRateConsultationController.ts:50-67` | list | 5 | Mobile | P2 |
| S096 | Ticket | TOPIC_OPTIONS | `useRaiseTicketController.ts:50-70` | list | 4/5 | Mobile | P2 |
| S097 | ClinicCheckIn | Demo state UI | `ClinicCheckInView.tsx:75-159` | demo | 1 | BE | P2 |
| S098 | Chat | Closed demo toggle | `useConsultationChatController.ts:287` | demo | 5 remove | Mobile | P2 |
| S099 | i18n | refillSendToDoctor Dr.Deshmukh | `en.ts:1887` | mock | 3 | Mobile | P1 |
| S100 | Appointments seed | Follow-up chat apt fee ₹400 | `bookedAppointments.ts:77-127` | mock | 3 | Mobile | P1 |
| S101 | Config | JOIN windows 2h/30m | `bookedAppointments.ts:34-36` | config | 2/5 | BE | P1 |
| S102 | indianStates | Full state list unused | `indianStates.ts:7-52` | list | 5 delete | Mobile | P2 |
| S103 | DoctorProfile | Seed overlay base | `useDoctorProfileController.ts:63-65` | mock | 3 | Mobile | P0 |
| S104 | BookAppt | Waitlist doctor fallback 104 | `useBookAppointmentController.ts:248` | mock | 3 | Mobile | P1 |
| S105 | Completeness | GetGenders used but not in Appendix A | `completeProfileApi.ts:113` | — | Document in API guide | BE docs | P2 |
| S106–S128 | (aggregate) | Remaining demo long-press + i18n doctor names in tips/clinic demo strings | various `*Demo*`, `WaitingRoomView.tsx:52`, `DeviceCheckView.tsx:52`, `PaymentsView.tsx:54` | demo | 5 remove | Mobile | P2 |

---

## 9. Prioritized Roadmap

### P0 — Blocks core flow / revenue (sequence)
1. **BE:** Confirm payment webhooks + medicine checkout fields (Q40/Q44) + fee source (Q30).  
2. **Mobile:** Auth session already improved — verify cold start → Home (T5).  
3. **Mobile:** Slots G4 → Booking G9/E8 → ConsultOrders → Razorpay → Verify/Poll.  
4. **Mobile:** Doctor search/profile without seeds.  
5. **Mobile:** Home fee/categories/articles.  
6. **BE+Mobile:** Instant consult post-ACCEPTED (Q37) then wire I1–I3.  
7. **BE+Mobile:** Tele vendor (Q8) then Token/Waiting/Video.  
8. **Mobile:** Erx + medicine order chain.

**Dependency:** P0 booking before payment; payment before payment-status; tele token before video SDK UI.

### P1 — Visible static data
Records note/Rx/PDF, notifications without SEED, pharmacy prices from sellers, help/legal from CMS, caregiver, refund policy UI, push registry finalization (Q1).

### P2 — Polish / edge
Welcome slides, reminders decision, my-reviews decision, notif prefs, clinic check-in, remove all DEMO long-press, CliniSight metrics (Q9).

---

## 10. Verification Checklist

| Gap closed when… | How to verify |
|---|---|
| No seed doctors | Grep `anjali\|rajesh\|sunita` in controllers/config — only acceptable in tests/fixtures |
| No hardcoded ₹ fees in booking/home/meds | Grep `₹500\|₹310\|PLATFORM_FEE\|CONSULT_FEE_RUPEES\|PHARMACIES` — zero in runtime paths |
| Booking real | Proxy: G4 → G9/E8 → G12 → G13/G14; UI shows `holdExpiresAt` |
| Consult Now real | Proxy: Tele/Instant POST + GET poll; no `CONSULT_NOW_OFFERS` |
| Tele real | Token response used; `DEMO_` constants deleted |
| Rx real | Erx/Patient called; PDF with Authorization |
| Notifications | Cold start unread matches server; SEED const unused when authenticated |
| Push | After login only; hits `devapi2` Devices/Device Register — not api1 |
| Guide AC | Run PatientMobile guide §12 T1–T24 |

Grep smoke:
```bash
rg -n "SEED_|FALLBACK_APPOINTMENT|RESULTS:|PHARMACIES:|DEMO_|mockNetworkCheck|PLATFORM_FEE_RUPEES|feeLabel: '₹500'|medicineOrderId: 1209" src
rg -n "useCreateBookingMutation|useGetDoctorSlotsQuery|useCreateConsultOrderMutation|useRequestInstantConsultMutation|useGetTeleTokenMutation|useGetPrescriptionQuery" src/controllers
```
Expect: first command empty (or only comments); second command shows controller imports.

---

## 11. Assumptions & Open Questions

Assumptions:
1. Appendix A of `PatientMobile_API_Integration_Guide.md` is the contract source of truth; RTK comments referencing aliases are intentional until Q3.
2. `GET api/mastersAPI/GetGenders` is valid in backend though missing from Appendix A — **docs should be updated**, not removed from app.
3. Localization strings are OK unless they embed live product facts (doctor names, helplines, fees).
4. Razorpay Checkout is required for online pay even though SDK may not be in package yet — gap is both mobile dependency + API fields.

Open questions (carry forward from guide §13 — still blocking 100% dynamic):  
Q1 push registry · Q2 SMS/devCode · Q3 MobilePatient deploy · Q7 clinic check-in · Q8 video vendor · Q9 progress metrics · Q10 reminders · Q11 my reviews · Q12 policy types · Q13 notif prefs · Q15 WhatsApp/country · Q17 a11y fields · Q18 address read · Q21 consent mapping · Q24 family invitation flags · Q27 doctor filters · Q29 credentials · Q30 platform fee · Q32 booking reason/docs · Q34 family data access · Q35 clinic phone · Q37 instant after ACCEPTED · Q38 chat files · Q39 diary/follow-up photos · Q40 medicine Razorpay fields · Q41 pharmacy serviceability · Q42 push/inbox deep link · Q43 hold release · Q44 webhook.

---

## Appendix — Self-check

| Check | Result |
|---|---|
| Every matrix row (§2) has a §3 section or explicit group coverage | Yes (74 rows; sheets/credentials grouped with pointers) |
| Every §8 ID cites file:line | Yes (S001–S105 detailed; S106–S128 aggregate demo/i18n) |
| No invented “existing” endpoints | Proposals marked PROPOSED / NEW |
| Scanned areas | views, controllers, store/api/new, config, notification services, AppNavigator, key sheets |
| Not scanned as product UI | `__tests__` (if any), `node_modules`, EAS profiles, native ios/android beyond app.json permissions |

---

*End of report. Hand this file to backend + mobile Cursor agents with: “Execute §6 tasks” / “Execute §7 tasks” respectively.*
