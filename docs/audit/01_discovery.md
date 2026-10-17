# Phase 1 — Discovery (read-only)

| Field | Value |
|---|---|
| **Repo** | `NIGA_PatientApp` |
| **Contract** | `docs/audit/PatientMobile_Bind_APIs.md` (copied from Downloads; **SoT**) |
| **Date** | 2026-10-17 |
| **Scope** | Screens, RTK layer, contract map, static scan, integration defects |
| **Code changes** | None (Phase 1 only) |

---

## Environment question (flag — do not silently switch)

| Source | Base URL |
|---|---|
| **Contract** (`PatientMobile_Bind_APIs.md`) | `https://devapi.homeocentrum.com/` |
| **App today** (`src/config/apiConfig.ts` + `app.json` → `extra.apiBaseUrl`) | `https://devmaigrationapi.homeocentrum.com/` |

**Assumption for Phase 2+:** Keep a **single** config value (`API_CONFIG.new.baseUrl`). Do **not** change the host without product/backend confirmation. Recorded as open question **Q-ENV-1**.

**Auth contract note:** Bind doc §“How to call” says token from `POST /api/Account/Login → data.token`. App uses **OTP flow** (`PatientAuth/RequestOtp` + `VerifyOtp` → `token`). Treat OTP as the live patient login path unless backend confirms Login is required. Flag **Q-AUTH-1**.

Public routes that must work **without** Bearer (per contract): `GET /api/Public/AppConfig`, `GET /api/Public/Doctors`. App already attaches Bearer when present via `prepareAuthHeaders` (harmless if token exists; AppConfig not implemented yet).

---

## 1. Screen inventory

Navigation: custom `AppStep` machine in `src/navigation/AppNavigator.tsx` (no React Navigation stack). Home uses boolean overlays + 5 tabs.

| # | Screen | View path | Controller | Purpose / data shown or collected |
|---|---|---|---|---|
| 1 | Splash | `views/SplashView.tsx` | `useSplashController` | Brand; timed advance; session restore in navigator |
| 2 | First launch | `views/FirstLaunchView.tsx` | `useFirstLaunchController` | Language list (API + fallback) |
| 3 | Onboarding | `views/OnboardingSlideView.tsx` | `useOnboardingController` | 3 static slides |
| 4 | Sign in | `views/SignInView.tsx` | `useSignInController` | Mobile, WhatsApp consent, country → RequestOtp |
| 5 | OTP | `views/OtpVerificationView.tsx` | `useOtpVerificationController` | 6-digit OTP; token; route registered/new |
| 6 | Complete profile | `views/CompleteProfileView.tsx` | `useCompleteProfileController` | Name/DOB/gender/address cascade; create patient / edit Me |
| 7 | Consent | `views/ConsentView.tsx` | `useConsentController` | Privacy + consent toggles |
| 8 | Phone setup | `views/PhoneSetupView.tsx` | `usePhoneSetupController` | OS permissions (camera/mic/notif) |
| 9 | Family members | `views/FamilyMembersView.tsx` | `useFamilyMembersController` | Family CRUD + relations |
| 10 | Home | `views/HomeView.tsx` | `useHomeController` | Greeting, members, upcoming visits, doctors, tips, tabs |
| 11 | My appointments (Doctors tab) | `views/MyAppointmentsView.tsx` | via Home | Visit list |
| 12 | Health records tab | `views/HealthRecordsView.tsx` | `useHealthRecordsController` | Timeline / docs / members |
| 13 | Medicines tab | `views/MedicinesView.tsx` | `useMedicinesController` | Medicine orders |
| 14 | Account | `views/AccountView.tsx` | `useAccountController` | Profile, menus, logout, data request |
| 15 | Search doctors | `views/SearchDoctorsView.tsx` | `useSearchDoctorsController` | Categories, cities, nearby seeds |
| 16 | Search results | `views/SearchResultsView.tsx` | `useSearchResultsController` | Doctor cards + filters; API + RESULTS fallback |
| 17 | Doctor profile | `views/DoctorProfileView.tsx` | `useDoctorProfileController` | Profile, fees, reviews; seed base |
| 18 | Doctor credentials tab | `views/DoctorCredentialsTab.tsx` | (profile) | Seed credentials blocks |
| 19 | Book appointment | `views/BookAppointmentView.tsx` | `useBookAppointmentController` | Calendar/slots seed; fees; waitlist |
| 20 | Booking review | `views/BookingReviewView.tsx` | `useBookingReviewController` | Summary, attach docs, policy toggles |
| 21 | Booking payment | `views/BookingPaymentView.tsx` | `useBookingPaymentController` | Methods/banks; hold timer (**PAYMENT deferred**) |
| 22 | Payment status | `views/PaymentStatusView.tsx` | `usePaymentStatusController` | Success/fail seed ids (**PAYMENT deferred**) |
| 23 | Appointment detail | `views/AppointmentDetailView.tsx` | `useAppointmentDetailController` | Visit actions; cancel/reschedule |
| 24 | Clinic appointment | `views/ClinicAppointmentView.tsx` | same | Clinic-specific CTAs |
| 25 | Clinic check-in | `views/ClinicCheckInView.tsx` | demo via detail | EARLY/WAITING/READY **demo UI** |
| 26 | Reschedule | `views/RescheduleAppointmentView.tsx` | via detail | Slots/reason |
| 27 | Cancelled confirmation | `views/CancelledConfirmationView.tsx` | via detail | Cancel result |
| 28 | Device check | `views/DeviceCheckView.tsx` | `useDeviceCheckController` | Mock network (**VIDEO deferred**) |
| 29 | Waiting room | `views/WaitingRoomView.tsx` | `useWaitingRoomController` | Fake ETA (**VIDEO deferred**) |
| 30 | Join failed | `views/JoinFailedView.tsx` | `useJoinFailedController` | JoinFailure report |
| 31 | Video call | `views/VideoCallView.tsx` | `useVideoCallController` | DEMO timers (**VIDEO deferred**) |
| 32 | Consultation chat | `views/ConsultationChatView.tsx` | `useConsultationChatController` | Chat API + seed |
| 33 | Consultation complete | `views/ConsultationCompleteView.tsx` | `useConsultationCompleteController` | Summary API |
| 34 | Rate consultation | `views/RateConsultationView.tsx` | `useRateConsultationController` | Create review |
| 35 | Consult now | `views/ConsultNowView.tsx` | `useConsultNowController` | Seed offers/fees |
| 36 | Consult searching | `views/ConsultNowSearchingView.tsx` | via ConsultNow | Fake match delay |
| 37 | Consult unavailable | `views/ConsultNowUnavailableView.tsx` | via ConsultNow | Empty match |
| 38 | Consult offer sheet | `views/ConsultNowOfferSheet.tsx` | via ConsultNow | Seed offer card |
| 39 | Prescription | `views/PrescriptionView.tsx` | `usePrescriptionController` | Static meds |
| 40 | Consultation record | `views/ConsultationRecordView.tsx` | `useConsultationRecordController` | Note unused |
| 41 | Upload document | `views/UploadDocumentView.tsx` | `useUploadDocumentController` | Upload + demo files |
| 42 | Follow-up plan | `views/FollowUpPlanView.tsx` | `useFollowUpPlanController` | FollowUps API + seeds |
| 43 | Symptom diary | `views/SymptomDiaryView.tsx` | `useSymptomDiaryController` | Diary + seed series |
| 44 | Symptom diary entry | `views/SymptomDiaryEntryView.tsx` | via diary | Entry form |
| 45 | Health insights | `views/HealthInsightsView.tsx` | `useHealthInsightsController` | Progress + local adherence |
| 46 | CliniSight progress | `views/CliniSightProgressView.tsx` | `useCliniSightProgressController` | Progress |
| 47 | Reminders centre | `views/RemindersCentreView.tsx` | `useRemindersCentreController` | Local seed reminders |
| 48 | Health tip article | `views/HealthTipArticleView.tsx` | `useHealthTipController` | `healthTips` config |
| 49 | Order medicines | `views/OrderMedicinesView.tsx` | `useOrderMedicinesController` | Static meds/pin |
| 50 | Choose pharmacy | `views/ChoosePharmacyView.tsx` | `useChoosePharmacyController` | Sellers API ignored; price seeds |
| 51 | Review order | `views/ReviewOrderView.tsx` | `useReviewOrderController` | Hardcoded totals |
| 52 | Medicine checkout | `views/MedicineCheckoutView.tsx` | `useMedicineCheckoutController` | Hardcoded + pay mutation (**PAYMENT deferred**) |
| 53 | Order tracking | `views/OrderTrackingView.tsx` | `useOrderTrackingController` | Hardcoded order 1209 |
| 54 | Order details | `views/OrderDetailsView.tsx` | `useOrderDetailsController` | Static doctor/invoice |
| 55 | Payments ledger | `views/PaymentsView.tsx` | `usePaymentsController` | History API + seed fallback |
| 56 | Consent centre | `views/ConsentCentreView.tsx` | `useConsentCentreController` | Consents CRUD |
| 57 | My reviews | `views/MyReviewsView.tsx` | `useMyReviewsController` | Seed reviews (Mine unbound) |
| 58 | Appeal review | `views/AppealReviewView.tsx` | `useAppealReviewController` | Local copy (Appeal unbound) |
| 59 | Help centre | `views/HelpCentreView.tsx` | `useHelpCentreController` | Help API unused for topics |
| 60 | Raise ticket | `views/RaiseTicketView.tsx` | `useRaiseTicketController` | CreateTicket |
| 61 | Book with help | `views/BookWithHelpView.tsx` | `useBookWithHelpController` | Assistance + hardcoded helpline |
| 62 | Legal document | `views/LegalDocumentView.tsx` | `useLegalDocumentController` | Local sections |
| 63 | Notifications | `views/NotificationsView.tsx` | `useNotificationsController` | List/mark + SEED |
| 64 | Notification settings | `views/NotificationSettingsView.tsx` | `useNotificationSettingsController` | Local prefs (Preferences unbound) |
| 65 | Offline | `views/OfflineModeView.tsx` | `useOfflineModeController` | NetInfo + hardcoded helpline |

**Sheets / overlays (data-bearing):** `WhoForMemberSheet`, `DoctorFiltersSheet`, `WhyOrderSheet`, `CancelAppointmentSheet`, `AddFamilyMemberSheet`, `SelectExistingDocumentSheet`, `DatePickerSheet`, `ConfirmationModal`, `OfflineModeGate`.

**Total primary screens:** 65 · **Sheets/modals:** 9+

---

## 2. API layer inventory

### 2.1 Files

| File | Role |
|---|---|
| `src/store/api/new/newBaseApi.ts` | Base + 401 refresh |
| `src/store/api/prepareAuthHeaders.ts` | Bearer from SecureStore |
| `src/store/api/new/*Api.ts` (21 inject files) | Feature endpoints |
| `src/store/api/legacy/legacyBaseApi.ts` | Empty / unused for patient |
| `src/store/index.ts` | Registers all inject files |

### 2.2 Summary

| Metric | Count |
|---|---:|
| Declared endpoints (approx.) | ~100 |
| Exported hooks | 97 |
| USED outside `store/api` | 58 |
| UNUSED outside `store/api` | 39 |

### 2.3 Hooks critical to Bind doc — status

| Hook / route | Status |
|---|---|
| `useCreateBookingMutation` | **UNUSED** |
| `useGetDoctorSlotsQuery` | **UNUSED** |
| `useBookAsFamilyMutation` | **UNUSED** |
| `useGetArticlesQuery` / `useGetArticleByIdQuery` | **UNUSED** |
| `useGetCareCategoriesQuery` | **UNUSED** |
| `useGetPharmacySellersQuery` | USED but UI ignores payload prices |
| `useCreateConsultOrderMutation` / Verify | UNUSED → **DEFERRED PAYMENT** |
| `useGetTeleTokenMutation` | UNUSED → **DEFERRED VIDEO** |
| `usePayMedicineOrderMutation` | USED with hardcoded order id → **DEFERRED PAYMENT** cleanup |
| AppConfig | **NOT DECLARED** |
| AppointmentRequests | **NOT DECLARED** |
| CheckIn / SwitchToTele / RunningLate | **NOT DECLARED** |
| Reviews/Mine + Appeal | **NOT DECLARED** |
| Patient/Reminders CRUD | **NOT DECLARED** |
| Notifications/Preferences + MarkAllRead | **NOT DECLARED** |
| Account/Login | **NOT DECLARED** (OTP used instead) |

### 2.4 Tag types today (`newBaseApi`)

`Consents`, `Doctors`, `Family`, `PatientProfile`, `Visits`, `Appointments`, `Timeline`, `Prescriptions`, `Documents`, `Notifications`, `Diary`, `FollowUps`, `Orders`, `Tele`, `Support`, `Payments`.

**Missing vs Phase 2 plan:** `DoctorProfile`, `Slots`, `Bookings`, `VisitDetail`, `Progress`, `Reviews`, `Reminders`, `NotificationPrefs`, `AppointmentRequests`, `AppConfig`, `PharmacySellers`, `Articles`, `Profile` (alias of PatientProfile).

### 2.5 Base query defects (existing)

| Defect | Evidence | Impact |
|---|---|---|
| 401 empty body | `baseQueryWithReauth` uses `result.error.status === 401` then refresh — OK path; does not special-case empty body parsing (usually fine) | Low |
| `success: false` in 200 body | Not normalized globally — each endpoint may ignore | Medium |
| Public AppConfig / Doctors | Bearer still attached if token exists | Low (usually OK) |
| No AppConfig fetch on launch | — | Support/helpline hardcodes |
| Cache tags incomplete for new routes | — | Stale UI after mutations |

Full endpoint table: see agent inventory in session (all `src/store/api/new/*.ts`); not duplicated here for length — hooks USED/UNUSED listed in §2.3 and prior audit.

---

## 3. Contract mapping table (`PatientMobile_Bind_APIs.md` §§1–10)

| § | Route | Expected screen(s) | Status | Notes |
|---|---|---|---|---|
| 1 | `GET /api/Public/AppConfig` | Launch, Support/Help/Contact, Payment key store | **NOT_BOUND** | No RTK endpoint |
| 1 | `GET /api/App/Config` (alias) | same | **NOT_BOUND** | |
| 1 | Token via `POST /api/Account/Login` | Login | **DRIFT** | App: OTP VerifyOtp → token (**Q-AUTH-1**) |
| 2 | `GET /api/Public/Doctors` + new query `qualification`, `sortBy` | Directory, Home featured | **PARTIAL** | Bound without `qualification`/`sortBy`; RESULTS seed fallback; fake delay |
| 2 | `GET /api/Public/Doctors/{id}` + `photoUrl`, `registrationNumber`, `passingUniversity`, fees, rating | Doctor profile | **PARTIAL** | Types missing new fields; seed `doctorProfiles` still base |
| 2 | Hide `yearsExperience` / languages / education | Profile cards | **DRIFT** | Credentials tab still shows seed language/degree-like content |
| 3 | `GET /api/Patient/Visits/{id}` + `consultFee`, `currency`, `platformFee`, `clinicPhone`, `reasonText`, `doctorPhotoUrl` | Visit detail | **PARTIAL** | Endpoint used; Home still maps `feeLabel: '₹500'`; PLATFORM_FEE=90 still used in booking |
| 4 | `GET /api/Patient/Progress` enriched fields | Insights / CliniSight | **PARTIAL** | Hook used; local adherence/follow-up seeds remain |
| 5 | `GET /api/Reviews/Mine` | My reviews | **NOT_BOUND** | Seed list in controller |
| 5 | `POST /api/Reviews/{id}/Appeal` | Appeal | **NOT_BOUND** | |
| 6 | `POST /api/Patient/Visits/{id}/CheckIn` | Clinic check-in | **NOT_BOUND** | Demo UI only |
| 6b | `POST /api/PatientAppointment/SwitchToTele` | Visit detail | **NOT_BOUND** | |
| 6b | `POST /api/Tele/Sessions/{id}/RunningLate` | Visit / check-in | **NOT_BOUND** | |
| 7 | `POST /api/Patient/AppointmentRequests` | Ask for a time | **NOT_BOUND** | No screen wired; waitlist Join exists separately |
| 8 | Reminders CRUD | Reminders centre | **NOT_BOUND** | Local seeds |
| 9 | `GET/PUT Notifications/Preferences` | Notification settings | **NOT_BOUND** | Local defaults |
| 9 | `POST Notifications/MarkAllRead` | Notifications inbox | **NOT_BOUND** | Client-only mark-all |
| 9 | `PATCH Notifications/{id}` | Inbox | **BOUND** (partial) | Used; SEED until hydrate |
| 10 | `useCreateBookingMutation` | Booking | **NOT_BOUND** (hook unused) | |
| 10 | `useGetDoctorSlotsQuery` | Booking | **NOT_BOUND** (hook unused) | Synthetic slots |
| 10 | ConsultOrders + verify | Payment | **DEFERRED** | |
| 10 | MedicineOrders pay | Medicine checkout | **DEFERRED** | |
| 10 | Pharmacy/Sellers name+area only | Choose pharmacy | **PARTIAL** | API called; prices/ETA still static |
| 10 | Tele Token | Video | **DEFERRED** | |
| 10 | Articles | Home / tip | **NOT_BOUND** (hooks unused) | `healthTips` config |
| 10 | Family + BookAs | Family / book | **PARTIAL** | Family CRUD bound; BookAs unused |
| 10 | DataRequests | Account | **PARTIAL** | Create bound; no history (correct per contract) |

---

## 4. Static-data scan (priority rows)

Format: `file:line | what | screen | replace with | or delete`

### Fees / money (P0)

| Location | What | Screen | Replace / delete |
|---|---|---|---|
| `src/config/appointmentSlots.ts:184` | `PLATFORM_FEE_RUPEES = 90` | Book / Consult pay | Visit/order `platformFee` or hide if null · **delete constant** |
| `src/config/appointmentSlots.ts:185` | `TAX_RUPEES = 0` | Book | delete / server |
| `src/config/appointmentSlots.ts:187-194` | `CONSULT_FEE_RUPEES` map | Book | `consultFeeTele` / `consultFeeInClinic` |
| `src/config/consultNow.ts:64-68` | Consult-now fee constants | Consult Now / Home | API fees · delete |
| `src/controllers/useHomeController.ts:500` | `feeLabel: '₹500'` | Home | Visit `consultFee` + `formatMoney` |
| `src/controllers/useChoosePharmacyController.ts:67,78,89` | ₹310/280/290 | Pharmacy | Hide (null per contract) · delete |
| `src/controllers/useMedicineCheckoutController.ts:87-91` | ₹250/0/60/310 | Checkout | DEFERRED payment; delete fixtures |
| `src/controllers/useReviewOrderController.ts:104-107` | Same totals | Review order | delete fixtures |
| `src/controllers/useOrderTrackingController.ts:93-95` | ₹185/14/199 | Tracking | API or hide |
| `src/controllers/usePaymentsController.ts:82-111` | Seed ₹ amounts | Payments | History API only |

### Seeds / mocks (P0–P1)

| Location | What | Screen | Replace / delete |
|---|---|---|---|
| `src/config/doctorProfiles.ts:58-206` | 3 seed doctors | Profile/book | Public Doctors · delete |
| `src/config/appointmentSlots.ts:145-256` | Synthetic slots/calendar | Book | Slots API · delete |
| `src/config/consultNow.ts:80-112` | Offers + timers | Consult Now | Instant APIs or hide · delete offers |
| `src/config/healthTips.ts:31-116` | Tip corpus | Home/article | Articles API |
| `src/config/careCategories.ts:14-50` | Categories | Search/home | CareCategories API |
| `src/controllers/useSearchResultsController.ts:21-97,311,329` | RESULTS + fake delay + fallback | Search | Doctors API only |
| `src/controllers/useSearchResultsController.ts:339,346` | `\|\| 500`, rating `'4.5'` | Search | null → hide |
| `src/controllers/useNotificationsController.ts:54-128` | SEED inbox | Notifications | Notifications API |
| `src/controllers/useRemindersCentreController.ts:112-170` | Reminder seeds | Reminders | Reminders API |
| `src/controllers/useMyReviewsController.ts:32-62` | Seed reviews | My reviews | Reviews/Mine |
| `src/controllers/usePrescriptionController.ts:26-48` | Static Rx | Prescription | Erx API |
| `src/controllers/useHealthRecordsController.ts:95-116+` | Members + timeline seeds | Records | Timeline/Family |
| `src/controllers/useSymptomDiaryController.ts:91-147` | SEEDED_ENTRIES | Diary | Diary/Progress series |
| `src/controllers/useDeviceCheckController.ts:45-89` | `mockNetworkCheck` | Device check | Device + local perms |
| `src/controllers/useVideoCallController.ts:79-117` | Seed chat + DEMO_* | Video | DEFERRED · delete demos |
| `src/controllers/useAppointmentDetailController.ts:285-324` | FALLBACK_APPOINTMENT | Visit detail | Error/empty · delete |
| `src/views/ClinicCheckInView.tsx:75-159` | Demo variants | Check-in | CheckIn API · delete demo |

### Phones / support (P0)

| Location | What | Screen | Replace / delete |
|---|---|---|---|
| `src/controllers/useBookWithHelpController.ts:106-110` | `18001234567` / WhatsApp | Book with help | AppConfig fields · hide if null |
| `src/controllers/useOfflineModeController.ts:75-76` | `tel:18001234567` | Offline | AppConfig |
| `src/controllers/useAppointmentDetailController.ts:856-861` | Clinic tel + Maps address | Clinic apt | `clinicPhone` · hide if null |

### Fake async (P1)

| Location | What | Replace |
|---|---|---|
| `useSearchResultsController.ts:311,320` | setTimeout fake load | RTK `isLoading` |
| `useConsultNowController.ts:264-272,330` | Fake match + pay success | Real poll / DEFERRED pay |

---

## 5. Existing integration review — defects

| Area | Defect | Severity |
|---|---|---|
| Doctors list | Client RESULTS fallback when API empty; invents fee 500 / rating 4.5 | High |
| Doctors query | Missing contract params `qualification`, `sortBy` | Medium |
| Doctor types | Missing `photoUrl`, `registrationNumber`, `passingUniversity`, `yearsExperience` on `PublicDoctor` | Medium |
| Booking | Slots generated locally; create booking never called | High |
| Visit fees | Hardcoded ₹500 / PLATFORM_FEE 90 vs contract `platformFee` null-unless-paid | High |
| Pharmacy | Sellers fetched; UI still uses PHARMACIES prices/ETA/sort | High |
| Articles / categories | Hooks exist, Home uses config seeds | Medium |
| Notifications | SEED until first response; MarkAllRead not server; Preferences local | Medium |
| Progress | Local adherence % / follow-up cards despite Progress API | Medium |
| Reviews | No Mine/Appeal endpoints | High (vs §5) |
| Check-in / SwitchToTele / RunningLate | Demo only | High (vs §6/6b) |
| Reminders | Fully local | High (vs §8) |
| Support phones | Hardcoded 1800… | High (vs §1 null) |
| Upload | Demo file instead of real picker bytes | Medium |
| Prescription / Note | Hooks unused | Medium |
| BookAs | Unused | Medium |
| Payment / Video | Present as stubs — **correctly out of scope** for this pass; mark TODO | Deferred |

---

## 6. Open questions (safest assumptions)

| ID | Question | Assumption until answered |
|---|---|---|
| **Q-ENV-1** | Is production New API host `devapi.homeocentrum.com` or `devmaigrationapi.homeocentrum.com`? | Keep current `apiConfig` / `app.json`; single knob only |
| **Q-AUTH-1** | Is `POST /api/Account/Login` required, or is OTP VerifyOtp the patient login? | Keep OTP; do not add Login unless confirmed |
| **Q-REQ-LIST** | Is there a list route for AppointmentRequests? | No list UI; success toast only (§7) |
| **Q-APPEAL** | Which review `status` values allow Appeal? | Allow submit; rely on backend error |
| **Q-TELE-ID** | Is `teleSessionId` always on visit detail for RunningLate? | Hide RunningLate when id null |
| **Q-DELETE** | Delete-account UI? | No DELETE /api/Account — route to AppConfig support or hide |

---

## 7. Phase 2 readiness checklist

- [ ] Response normalizer + typed `success:false`
- [ ] UI: Loading / Empty / Error / NullableRow
- [ ] Formatters: money / date / `resolveApiUrl`
- [ ] `statusMaps.ts`
- [ ] Expand cache tags
- [ ] AppConfig provider (no token)
- [ ] Align `PublicDoctor` + visit detail types with contract fields
- [ ] Add missing RTK files: appConfig, appointmentRequests, reminders, reviewsMine, visit actions (check-in/switch/late), notification prefs

---

## 8. Execution order next

Per master prompt §6:

1. ~~Phase 1~~ → this file  
2. Phase 2 → shared foundation  
3. Phase 3 screens in order: Login/start → Support → Doctor directory → Doctor profile → Home → Booking/slots → Appointment request → Visits → Visit detail → Check-in → Switch/Late → Progress → Reviews → Reminders → Notifications → Pharmacy → Family → Profile → remaining  
4. Phase 4 re-scan  
5. Phase 5 `PATIENT_APP_API_COVERAGE_REPORT.md`

---

*End of Phase 1 discovery.*
