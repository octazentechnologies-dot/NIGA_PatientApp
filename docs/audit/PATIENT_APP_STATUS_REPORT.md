# Patient app status report

| Field | Value |
|---|---|
| Date | 2026-10-17 |
| Branch / commit | `Devlopment_1.1` @ `48d7507` (working tree includes later uncommitted binds) |
| Contract | `docs/audit/PatientMobile_Bind_APIs.md` |
| Evidence | `docs/audit/evidence/RERUN_2026-10-17_A1_A3_A5.txt`, `RERUN_A7_typecheck.txt`, `RERUN_A7_lint.txt` |
| Prior audits | Read, not edited: `04_mobile_todo_log.md`, `MOBILE_TODO_EXECUTION_REPORT.md` |

## 1. Executive summary

The working tree calls `https://devapi.homeocentrum.com/` from `apiConfig.ts:4`, `app.json:116`, and `env.ts:2`. That matches the contract. 65 screens were traced. Verdicts: ✅ 0 · 🟡 51 · ❌ 4 · ⏸ 7 · 📱 3. Fully dynamic excluding deferred: 0 / 58 (0%). No screen is ✅ because none was proven to have loading, empty, error, and null handling on every value and every action.

123 RTK hooks are exported. 44 hook names are not imported by a screen. Logout and token refresh still run (`session.ts:37`, `newBaseApi.ts:46`). Two `fetch` clients remain outside RTK (`services/api/client.ts`, `services/notifications/deviceTokenApi.ts`).

Static bugs still in UI paths: health-insights fixtures (`useHealthInsightsController.ts:53` and `:61`), medicine list `₹0.00` and wrong status (`useMedicinesController.ts:129` and `:138`), consult-now fee constants (`useConsultNowController.ts:361`), production OTP echo (`OtpVerificationView.tsx:101`). Payment and video stubs are ⏸, not failures.

Open mobile items: 9 that can be done now, plus items that wait on backend. Open backend items: 20, plus 6 Phase 2. Overall verdict: **MOSTLY DYNAMIC**.

What to do next: fix the four static bugs (M-036, M-055, M-056, M-003). Hide the consult-now fee UI until B-011. Ask the backend for support contacts (B-003), feature flags (B-004), appointment-request status (B-005), teleSessionId (B-008), and instant-consult fees (B-011). Leave payment and video marked TODO.

## 2. Scorecard

| Screen | Verdict | Data | Logic | States | Open M | Open B |
|---|---|---|---|---|---|---|
| Splash | 📱 | 5/5 | 5/5 | 4/5 | — | — |
| First launch | 🟡 | 4/5 | 4/5 | 2/5 | M-001 | — |
| Onboarding | 📱 | 5/5 | 5/5 | 4/5 | — | — |
| Sign in | 🟡 | 4/5 | 4/5 | 3/5 | M-002 | B-002 |
| OTP | 🟡 | 4/5 | 3/5 | 3/5 | M-003 | B-002 |
| Complete profile | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Phone setup | 📱 | 5/5 | 4/5 | 3/5 | — | — |
| Privacy consent | 🟡 | 4/5 | 4/5 | 3/5 | — | B-021 |
| Home | 🟡 | 4/5 | 3/5 | 3/5 | M-008 | B-004 |
| Search entry | 🟡 | 3/5 | 3/5 | 2/5 | — | B-009, B-029 |
| Search results | 🟡 | 4/5 | 4/5 | 4/5 | — | B-009, B-029 |
| Doctor profile | 🟡 | 4/5 | 4/5 | 3/5 | — | B-013, B-015 |
| Credentials tab | 🟡 | 3/5 | 3/5 | 3/5 | — | B-016 |
| Book appointment | 🟡 | 4/5 | 4/5 | 3/5 | — | B-027 |
| Booking review | 🟡 | 4/5 | 3/5 | 2/5 | — | — |
| Booking payment | ⏸ | 2/5 | 2/5 | 2/5 | M-P01 | B-P01 |
| Payment status | ⏸ | 1/5 | 1/5 | 2/5 | M-P02 | B-P01 |
| My appointments | 🟡 | 4/5 | 3/5 | 3/5 | M-010 | B-005 |
| Visit detail | 🟡 | 4/5 | 4/5 | 3/5 | — | B-008, B-022 |
| Clinic appointment | 🟡 | 4/5 | 3/5 | 3/5 | — | — |
| Check-in | 🟡 | 4/5 | 4/5 | 3/5 | — | B-007 |
| Reschedule | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Cancelled confirmation | 🟡 | 3/5 | 3/5 | 2/5 | — | — |
| Device check | ⏸ | 1/5 | 2/5 | 2/5 | M-V01 | B-P10 |
| Waiting room | ⏸ | 1/5 | 2/5 | 2/5 | M-V02 | B-P11 |
| Video call | ⏸ | 1/5 | 1/5 | 2/5 | M-V04 | B-P12 |
| Join failed | ⏸ | 2/5 | 2/5 | 2/5 | M-V03 | B-008 |
| Consultation chat | 🟡 | 4/5 | 3/5 | 3/5 | — | — |
| Consultation complete | 🟡 | 4/5 | 3/5 | 3/5 | — | — |
| Rate consultation | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Consult now | ❌ | 1/5 | 1/5 | 2/5 | M-030 | B-011 |
| Consult searching | ❌ | 1/5 | 1/5 | 2/5 | M-030 | B-011 |
| Consult unavailable | ❌ | 1/5 | 1/5 | 2/5 | M-030 | B-011 |
| Consult offer | ❌ | 1/5 | 1/5 | 2/5 | M-030 | B-011 |
| Prescription | 🟡 | 4/5 | 3/5 | 4/5 | — | B-012 |
| Consultation note | 🟡 | 4/5 | 3/5 | 4/5 | — | — |
| Upload document | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Follow-up plan | 🟡 | 4/5 | 3/5 | 4/5 | — | — |
| Symptom diary | 🟡 | 4/5 | 3/5 | 3/5 | — | — |
| Diary entry | 🟡 | 4/5 | 3/5 | 3/5 | — | — |
| Health insights | 🟡 | 2/5 | 2/5 | 2/5 | M-036 | — |
| CliniSight progress | 🟡 | 4/5 | 4/5 | 4/5 | — | — |
| Reminders | 🟡 | 4/5 | 4/5 | 3/5 | M-039 | — |
| Notifications | 🟡 | 4/5 | 3/5 | 4/5 | — | B-006 |
| Notification settings | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Health records | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Medicines list | 🟡 | 3/5 | 2/5 | 2/5 | M-055, M-056 | B-023 |
| Order medicines | 🟡 | 3/5 | 3/5 | 3/5 | — | B-023 |
| Choose pharmacy | 🟡 | 4/5 | 3/5 | 4/5 | — | B-010 |
| Review order | 🟡 | 3/5 | 3/5 | 3/5 | — | B-023 |
| Medicine checkout | ⏸ | 2/5 | 2/5 | 2/5 | M-P03 | B-P03 |
| Order tracking | 🟡 | 3/5 | 3/5 | 3/5 | — | B-028 |
| Order details | 🟡 | 3/5 | 3/5 | 2/5 | — | B-028 |
| My reviews | 🟡 | 4/5 | 3/5 | 4/5 | — | B-017 |
| Appeal | 🟡 | 4/5 | 4/5 | 3/5 | — | B-017 |
| Help centre | 🟡 | 3/5 | 3/5 | 3/5 | M-048 | B-003, B-020b |
| Book with help | 🟡 | 4/5 | 4/5 | 3/5 | — | B-003 |
| Raise ticket | 🟡 | 4/5 | 4/5 | 3/5 | — | — |
| Health tip | 🟡 | 4/5 | 3/5 | 4/5 | — | — |
| Legal | 🟡 | 4/5 | 3/5 | 3/5 | — | — |
| Account | 🟡 | 4/5 | 4/5 | 3/5 | — | B-018 |
| Family members | 🟡 | 4/5 | 4/5 | 3/5 | M-006 | B-021 |
| Consent centre | 🟡 | 4/5 | 4/5 | 3/5 | — | B-021 |
| Payments | 🟡 | 3/5 | 3/5 | 3/5 | — | — |
| Offline mode | 🟡 | 4/5 | 4/5 | 3/5 | — | B-003 |

Counts: ✅ 0, 🟡 51, ❌ 4, ⏸ 7, 📱 3. Total 65.

## 3. End-to-end flows

| Step | Status |
|---|---|
| Discover doctor (search) | 🟡 live list; filter chips waiting on B-009 |
| Profile | 🟡 live profile/fees/reviews; years hidden |
| Slots | 🟡 from Slots API |
| Booking hold | 🟡 POST Bookings / BookAs |
| Payment | ⏸ |
| Visit detail | 🟡 |
| Check-in | 🟡 readyAt hidden |
| Switch to tele | 🟡 |
| Video join | ⏸ |
| Prescription | 🟡 Erx; PDF blocked B-012 |
| Follow-up / CliniSight | 🟡 |
| Health insights chart | ❌ fixtures remain (M-036) |

| Ask for a time | Status |
|---|---|
| POST AppointmentRequests | 🟡 |
| Patient sees PENDING / can respond | ❌ no list route (B-005) |

| Reminders | Status |
|---|---|
| List / create / update / delete | 🟡 |
| Family member picker | 🟡 M-039 |
| Local notification reschedule | 📱 |

| Reviews | Status |
|---|---|
| Create POST /api/Reviews | 🟡 |
| List Mine | 🟡 |
| Appeal | 🟡 outcome fields B-017 |

| Pharmacy | Status |
|---|---|
| Sellers name + area | 🟡 |
| Create MedicineOrders | 🟡 |
| Quote / address | ❌ hidden or ₹0.00 on the list (M-055, B-023) |
| Pay | ⏸ |

| Data request | Status |
|---|---|
| POST DataRequests | 🟡 success message only |
| History / delete account | not provided — correctly not called |

## 4. Screen-by-screen analysis

### Splash — `src/views/SplashView.tsx`
**Purpose / entry point:** Timed brand screen · AppStep splash · `useSplashController`
**Verdict:** 📱 Local by design
**Score:** Data binding 5/5 · Business logic 5/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Brand hold | local timer | LOCAL | useSplashController.ts:18 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Finish | local navigation | LOCAL | useSplashController.ts:18 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No server data | Yes | Yes | timer only |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### First launch — `src/views/FirstLaunchView.tsx`
**Purpose / entry point:** Language pick · `useFirstLaunchController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Languages | GET api/mastersAPI/GetLanguages | LIVE | firstLaunchApi.ts:15 |
| Fallback list | local if API empty | STATIC | useFirstLaunchController.ts |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Select language | local persist | LOCAL | useFirstLaunchController |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Show error when masters fail | Yes | No | M-001 fallback still present |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-001 Replace silent local fallback with error + retry when GetLanguages fails
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Onboarding — `src/views/OnboardingSlideView.tsx`
**Purpose / entry point:** Three product slides · `useOnboardingController`
**Verdict:** 📱 Local by design
**Score:** Data binding 5/5 · Business logic 5/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Slide copy | i18n | LOCAL | OnboardingSlideView |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Next / skip | local nav | LOCAL | useOnboardingController |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Marketing copy only | Yes | Yes | no clinical data |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Sign in — `src/views/SignInView.tsx`
**Purpose / entry point:** Mobile + consent → RequestOtp · `useSignInController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Countries | GET UserAddressLocation/Countries | LIVE | completeProfileApi.ts:128 |
| Mobile | local state | LOCAL | useSignInController |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Request OTP | POST api/PatientAuth/RequestOtp | LIVE | signInApi.ts:33 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No hardcoded credentials | Yes | Yes | no password fixture |
| Map OTP errors | Yes | Partial | M-002 |
| Token from Account/Login | Contract line 10 | No — app uses OTP | B-002 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-002 Surface RequestOtp failure message; do not advance on failure
**Backend (needs API change):**
- B-002 Clarify Bearer source: OTP verify vs POST /api/Account/Login
**Deferred:**
—
**Open questions:**
—

---

### OTP — `src/views/OtpVerificationView.tsx`
**Purpose / entry point:** Verify code · `useOtpVerificationController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Code entry | local | LOCAL | OtpVerificationView |
| Dev OTP echo | server/dev value rendered | STATIC_BUG | OtpVerificationView.tsx:101-115 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Verify | POST api/PatientAuth/VerifyOtp | LIVE | otpVerificationApi.ts:51 |
| Resend | POST api/PatientAuth/RequestOtp | LIVE | signInApi.ts |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Hide OTP echo in production | Yes | No | M-003 view shows devOtp whenever set |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-003 Render the OTP echo only when `__DEV__` is true
**Backend (needs API change):**
- B-002 Same token-source question
**Deferred:**
—
**Open questions:**
—

---

### Complete profile — `src/views/CompleteProfileView.tsx`
**Purpose / entry point:** Registration fields · `useCompleteProfileController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Genders / geo masters | GET masters + UserAddressLocation/* | LIVE | completeProfileApi.ts:113-137 |
| Existing profile | GET api/PatientProfile/Me | LIVE | patientProfileApi.ts:56 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Create patient | POST api/patient/ | LIVE | completeProfileApi.ts:141 |
| Update | PUT api/PatientProfile/Me | LIVE | patientProfileApi.ts |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Masters required before submit | Yes | Partial | controller validates locally |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
Photo upload route is B-020 if the avatar control must persist a file.

---

### Phone setup — `src/views/PhoneSetupView.tsx`
**Purpose / entry point:** Device permission prompts · `usePhoneSetupController`
**Verdict:** 📱 Local by design
**Score:** Data binding 5/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Permission copy | i18n | LOCAL | PhoneSetupView |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Grant OS permission | OS APIs | LOCAL | usePhoneSetupController — no RTK hook |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No clinical payload | Yes | Yes | no hook |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Privacy consent — `src/views/ConsentView.tsx`
**Purpose / entry point:** Privacy notice + grant · `useConsentController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Notice | GET api/Consent/PrivacyStatus + notice | LIVE | privacyConsentApi.ts:79 |
| Consent rows | GET api/Patient/Consents | LIVE | consentApi.ts:58 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Grant privacy | POST api/Consent/GrantPrivacy | LIVE | privacyConsentApi.ts:92 |
| Grant type | POST Consents/Types/{id}/Grant | LIVE | consentApi.ts |
| Caregiver 409 | API message shown | LIVE | useConsentController |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Type 6 must not fail silently | Yes | Yes | 409 message surfaced |

#### B.4 States
Loading ☑ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-021 Confirm which consentTypeId is caregiver-only (routes already exist)
**Deferred:**
—
**Open questions:**
—

---

### Home — `src/views/HomeView.tsx`
**Purpose / entry point:** Dashboard, doctors, articles, visits · `useHomeController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Dashboard | GET api/PatientPortal/Home | LIVE | homeApi.ts:97 |
| Doctors | GET api/Public/Doctors | LIVE | doctorsApi.ts:148 |
| Articles | GET api/Public/Articles | LIVE | homeApi.ts:109 |
| Visits | GET api/Patient/Visits | LIVE | visitsApi.ts:160 |
| Care categories | GET api/PatientPortal/CareCategories | LIVE | homeApi.ts:101 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Open doctor / article / visit | navigation | LOCAL | useHomeController |
| Pull to refresh | refetch home queries | Partial | confirm each query refetch — UNVERIFIED per query |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not invent visit reason or fee | Yes | Yes | prior M-007; re-check if a label is still a translation fallback — UNVERIFIED line-by-line |
| Unread bell from isRead | Yes | No | notificationsOpen is local UI; no unread count from isRead. M-008 |
| Gate Consult now on a flag | Yes | No | flag not in AppConfig. B-004 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-008 Badge = count of GET /api/Notifications where isRead is false
**Backend (needs API change):**
- B-004 Add instantConsultEnabled and medicineOnlinePayEnabled
**Deferred:**
—
**Open questions:**
—

---

### Search doctors — `src/views/SearchDoctorsView.tsx`
**Purpose / entry point:** Query entry · `useSearchDoctorsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Care categories | GET CareCategories when used | PARTIAL | homeApi |
| City chips | not from FilterOptions | NO SOURCE | B-009 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Submit query | navigates to results | LOCAL | SearchDoctorsView |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Pass careCategoryId | Product wants category search | No | B-029 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-009 GET filter option lists
- B-029 careCategoryId query param
**Deferred:**
—
**Open questions:**
—

---

### Search results — `src/views/SearchResultsView.tsx`
**Purpose / entry point:** Doctor list · `useSearchResultsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Doctors | GET api/Public/Doctors q, teleOnly, minFee, maxFee, page | LIVE | doctorsApi.ts:148; controller teleOnly only when video selected |
| Default filters | EMPTY_DOCTOR_FILTERS | LIVE | models/search.ts:69 |
| Rating | hidden when reviewCount is 0 | LIVE | search model |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Debounce q | 300ms | LIVE | useSearchResultsController.ts:217 |
| Retry | refetch | LIVE | useSearchResultsController.ts:494 |
| Load more | pageNumber | LIVE | controller |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| minFee <= maxFee | Yes | UNVERIFIED | — |
| No client-only teleOnly default | Yes | Yes | search.ts:69 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-009 City/qualification chips
- B-029 careCategoryId
**Deferred:**
—
**Open questions:**
—

---

### Doctor profile — `src/views/DoctorProfileView.tsx`
**Purpose / entry point:** Profile, fees, reviews · `useDoctorProfileController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Profile | GET api/Public/Doctors/{id} | LIVE | doctorsApi.ts:160 |
| Fees | GET api/Fees/Public/{id} | LIVE | doctorsApi.ts:181 |
| Reviews | GET api/Reviews/Doctor/{id} | LIVE | doctorsApi.ts:184 |
| yearsExperience | always null — hidden | HIDDEN-NULL | useDoctorProfileController.ts experienceKey empty |
| Non-numeric id | rejected, onBack | LIVE | useDoctorProfileController.ts:82 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Book | navigation with numeric id | LIVE | controller |
| Share | OS share | LOCAL | Share API |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Numeric id only | Yes | Yes | no anjali fallback on this screen |
| Hide rating at reviewCount 0 | Yes | Yes | controller |

#### B.4 States
Loading ☑ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-013 nextAvailableAt if the next-slot row must be live
- B-015 years/languages/education stay null by contract — decision only
**Deferred:**
—
**Open questions:**
—

---

### Credentials — `src/views/DoctorCredentialsTab.tsx`
**Purpose / entry point:** Three regulatory blocks · fed by profile
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Qualification | doctor.qualification | LIVE | useDoctorProfileController qualifications |
| Registration | registrationNumber | LIVE | same |
| University | passingUniversity | LIVE | same |
| Focus / CareLink | omitted | HIDDEN-NULL | controller comment B-016 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Report error | no handler | NO-OP | DoctorCredentialsTab pressable without onPress — UNVERIFIED if parent wires it |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not invent degrees | Yes | Yes | empty blocks hidden in the tab |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-016 Structured qualification list only if product requires more than one string
**Deferred:**
—
**Open questions:**
—

---

### Book appointment — `src/views/BookAppointmentView.tsx`
**Purpose / entry point:** Calendar + slots + book · `useBookAppointmentController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Doctor | GET Public/Doctors/{id} | LIVE | doctorsApi |
| Slots | GET …/Slots?date= | LIVE | useGetDoctorSlotsQuery |
| Fees | GET Fees/Public/{id} | LIVE | useGetDoctorFeesQuery |
| Family | GET api/Family | LIVE | familyApi.ts:166 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Book self | POST Public/Doctors/{id}/Bookings | LIVE | bookingApi.ts createBooking |
| Book family | POST api/Family/BookAs | LIVE | bookingApi.ts:141 |
| Ask for a time | POST api/Patient/AppointmentRequests | LIVE | appointmentRequestsApi.ts:29 |
| Pay | not called | DEFERRED | useBookAppointmentController.ts:622 TODO(PAYMENT) |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Double submit | Yes | Yes | bookingInFlight disables CTA |
| Slot taken | Yes | Yes | 409 mapped via extractErrorMessage |
| Empty slots → request | Yes | Yes | handleJoinWaitlist uses AppointmentRequests, not unused Waitlist/Join |
| Idempotency-Key | Nice to have | No | B-027 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-027 Optional Idempotency-Key on Bookings and AppointmentRequests
**Deferred:**
Payment Checkout ⏸ M-P01
**Open questions:**
—

---

### Booking review — `src/views/BookingReviewView.tsx`
**Purpose / entry point:** Summary + attach · `useBookingReviewController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Draft | navigation state | LOCAL | controller |
| Documents | GET api/Patient/Documents documentId | LIVE | useBookingReviewController libraryDocuments |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Attach | selects numeric documentId locally | LOCAL | booking body has no documentIds field |
| Continue to pay | navigation | DEFERRED | TODO(PAYMENT) |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not send a fake document id | Yes | Yes | ids come from the documents query |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
Payment ⏸
**Open questions:**
—

---

### Booking payment — `src/views/BookingPaymentView.tsx`
**Purpose / entry point:** Consult checkout · `useBookingPaymentController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 2/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Amount | not from ConsultOrders | DEFERRED_PAYMENT | controller does not call useCreateConsultOrderMutation |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Pay | POST api/Payments/ConsultOrders + Verify | NO-OP | hooks UNUSED |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No fake success | Yes | Partial | book flow marks TODO(PAYMENT) |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-P01 Bind ConsultOrders + Verify after B-P01; use razorpayKeyId from AppConfig
**Backend (needs API change):**
- B-P01 Confirm ConsultOrders response: gatewayReady, keyId, hold release
**Deferred:**
⏸
**Open questions:**
—

---

### Payment status — `src/views/PaymentStatusView.tsx`
**Purpose / entry point:** Result screen · `usePaymentStatusController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 1/5 · Business logic 1/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Payment id | SEED_PAYMENT_ID | DEFERRED_PAYMENT | usePaymentStatusController.ts:111 |
| Doctor | getDoctorProfile seed | DEFERRED_PAYMENT | line 93 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Show result | local seed | NO-OP | not from Verify |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Confirm only from Verify | Yes | No | M-P02 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-P02 Render only Verify response fields
**Backend (needs API change):**
- B-P01
**Deferred:**
⏸
**Open questions:**
—

---

### My appointments — `src/views/MyAppointmentsView.tsx`
**Purpose / entry point:** Visit list from parent booked appointments
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Rows | parent list built from GET api/Patient/Visits | LIVE | visitsApi.ts:160; view receives appointments |
| Empty | local empty view | LIVE | MyAppointmentsView.tsx:56 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Open visit | onOpenAppointment(id) | LOCAL | line 69 |
| Book new | navigation | LOCAL | onBookNew |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Error + retry on the list | Yes | No | view has empty, not ErrorState. M-010 |
| Show PENDING appointment requests | Yes | No | no list route. B-005 |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-010 Add error + retry around the visits query that feeds this list
**Backend (needs API change):**
- B-005 Patient list/status/respond for AppointmentRequests
**Deferred:**
—
**Open questions:**
—

---

### Visit detail — `src/views/AppointmentDetailView.tsx`
**Purpose / entry point:** One visit · `useAppointmentDetailController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Detail | GET api/Patient/Visits/{id} | LIVE | visitsApi.ts:166 |
| consultFee / platformFee | visit fields; null hidden | LIVE | formatMoney; no ₹90 fallback on this screen |
| Photo | doctorPhotoUrl via resolveApiUrl | LIVE | visits type |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Cancel | POST CancelAppointment | LIVE | visitsApi.ts:236 |
| Reschedule | POST RescheduleAppointment | LIVE | visitsApi.ts:225 |
| Check-in | POST Visits/{id}/CheckIn | LIVE | useCheckInVisitMutation |
| Switch to tele | POST SwitchToTele | LIVE | visitsApi.ts:204 |
| Running late | POST Tele/Sessions/{id}/RunningLate | LIVE | requires teleSessionId |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Hide platform fee when null | Yes | Yes | M-024 |
| Join only with teleSessionId | Yes | Partial | B-008 if the field is often missing |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-008 Guarantee teleSessionId on tele visits
- B-022 followUpDate / erx link if those rows must be live
**Deferred:**
Video join ⏸
**Open questions:**
—

---

### Clinic appointment — `src/views/ClinicAppointmentView.tsx`
**Purpose / entry point:** In-clinic detail presentation of the same visit model
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Clinic name / map | visit clinicName, clinicMapLink | LIVE | visitsApi VisitDetailData |
| Phone | clinicPhone null-hidden | HIDDEN-NULL | visit type |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Directions | Linking.openURL when map link set | LIVE | controller |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not invent clinic phone | Yes | Yes | null hide |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Check-in — `src/views/ClinicCheckInView.tsx`
**Purpose / entry point:** Queue · appointment detail controller
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| queuePosition | CheckIn data.queuePosition | LIVE | contract §6 |
| readyAt | null hidden | HIDDEN-NULL | B-007 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Submit | POST CheckIn status EARLY|WAITING|READY | LIVE | visits API |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No demo status picker | Yes | Yes | M-025 |
| Poll queue | Yes | No | B-007 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-007 When readyAt can be non-null, and whether the app should poll
**Deferred:**
—
**Open questions:**
—

---

### Reschedule — `src/views/RescheduleAppointmentView.tsx`
**Purpose / entry point:** New slot · `useAppointmentDetailController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Days | future dates only | LIVE | futureRescheduleDays |
| Slots | GET …/Slots for selected date | LIVE | useGetDoctorSlotsQuery |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Confirm | POST RescheduleAppointment | LIVE | updates local row only after unwrap() |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No past dates | Yes | Yes | past days filtered |
| HH:mm | Yes | Yes | regex on slot id |

#### B.4 States
Loading ☐ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Cancelled confirmation — `src/views/CancelledConfirmationView.tsx`
**Purpose / entry point:** After cancel · same controller
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| When | local snapshot of the visit | LOCAL | cancelledSnapshot |
| Refund copy | derived from consultFee or hidden | PARTIAL | refundAmount empty when fee null |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Book another | navigation | LOCAL | onBookAnother |
| View refund | no-op | NO-OP | onViewRefund () => undefined |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not invent refund amount | Yes | Yes | hidden when fee null |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
Refund receipt ⏸ if a payment existed
**Open questions:**
—

---

### Device check — `src/views/DeviceCheckView.tsx`
**Purpose / entry point:** Camera/mic/network · `useDeviceCheckController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 1/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Mbps | local / mock | DEFERRED_VIDEO | controller speaker timer useDeviceCheckController.ts:157 |
| DeviceCheck API | GET api/Tele/DeviceCheck | UNUSED_HOOK | teleApi.ts:199 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Continue | local | LOCAL | not Token |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Use DeviceCheck | Yes later | No | M-V01 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-V01 Replace mock network numbers with GET /api/Tele/DeviceCheck
**Backend (needs API change):**
- B-P10 Confirm DeviceCheck JSON
**Deferred:**
⏸
**Open questions:**
—

---

### Waiting room — `src/views/WaitingRoomView.tsx`
**Purpose / entry point:** Before join · `useWaitingRoomController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 1/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Doctor late | forceDoctorLate prop | DEFERRED_VIDEO | useWaitingRoomController.ts:71 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Running late | can call report mutation from detail | PARTIAL | session status hook unused |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No fake ETA | Yes | No | M-V02 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-V02 Bind GET Tele/Sessions/{id}; remove forceDoctorLate
**Backend (needs API change):**
- B-P11 Waiting-room status fields
**Deferred:**
⏸
**Open questions:**
—

---

### Video call — `src/views/VideoCallView.tsx`
**Purpose / entry point:** Call UI · `useVideoCallController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 1/5 · Business logic 1/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Elapsed | starts at 8*60+12 | DEFERRED_VIDEO | useVideoCallController.ts:186 |
| Token | POST Tele/Sessions/{id}/Token | UNUSED_HOOK | useGetTeleTokenMutation |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| End | local timer | LOCAL | no Leave route call |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Join with token | Yes later | No | M-V04 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-V04 Agora/WebRTC only after Token
**Backend (needs API change):**
- B-P12 Token, join, leave, reconnect
**Deferred:**
⏸
**Open questions:**
—

---

### Join failed — `src/views/JoinFailedView.tsx`
**Purpose / entry point:** Join error · `useJoinFailedController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 2/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Failure | POST Tele/Sessions/{id}/JoinFailure | LIVE | useReportJoinFailureMutation |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | local | LOCAL | useJoinFailedController.ts:106 setTimeout |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Require teleSessionId | Yes | Partial | B-008 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-V03 Hide retry when teleSessionId is missing
**Backend (needs API change):**
- B-008
**Deferred:**
⏸ related
**Open questions:**
—

---

### Consultation chat — `src/views/ConsultationChatView.tsx`
**Purpose / entry point:** Tele chat · `useConsultationChatController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Messages | GET api/Tele/Chat/{sessionId} | LIVE | teleApi.ts:249 |
| Empty | no seed messages | LIVE | M-027 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Send | POST api/Tele/Chat | LIVE | teleApi.ts:242 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No session → empty | Yes | Yes | controller |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Consultation complete — `src/views/ConsultationCompleteView.tsx`
**Purpose / entry point:** Summary · `useConsultationCompleteController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Summary text | GET api/Tele/Summary/{patientAppId} data[].text | LIVE | teleApi.ts:256 |
| Discussed / advice split | not in payload — hidden | HIDDEN-NULL | controller sets them to '' |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | refetch | LIVE | controller onRetry |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No lorem | Yes | Yes | M-028 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Rate consultation — `src/views/RateConsultationView.tsx`
**Purpose / entry point:** Create review · `useRateConsultationController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Doctor name | visit draft, hidden if absent | PARTIAL | no anjali fallback |
| Review id | not returned — hidden | HIDDEN-NULL | reviewId '' |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Submit | POST api/Reviews | LIVE | supportApi.ts:132 |
| Double submit | disabled while in flight | LIVE | canSubmit |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not show success on 400 | Yes | Yes | submitError from messageFromUnknownError |

#### B.4 States
Loading ☐ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Consult now — `src/views/ConsultNowView.tsx`
**Purpose / entry point:** Instant match · `useConsultNowController`
**Verdict:** ❌ Static
**Score:** Data binding 1/5 · Business logic 1/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Fee | CONSULT_NOW_FEE_RUPEES + PLATFORM_FEE_RUPEES | STATIC | useConsultNowController.ts:361 and :6 |
| Doctor | getDoctorProfile seed | STATIC | line 377 |
| Instant API | POST/GET api/Tele/Instant* | UNUSED_HOOK | teleApi.ts:175 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Search match | setTimeout | STATIC | controller timer |
| Accept → pay | fake timer success | DEFERRED_PAYMENT | line 330 setPaymentStatus success |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No invented fees | Yes | No | M-030 / B-011 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-030 After B-011, bind Tele/Instant* and delete fee constants. Payment stays TODO(PAYMENT)
**Backend (needs API change):**
- B-011 Fee breakdown on the instant offer
**Deferred:**
Payment step ⏸
**Open questions:**
—

---

### Consult searching — `src/views/ConsultNowSearchingView.tsx`
**Purpose / entry point:** Match animation · same controller
**Verdict:** ❌ Static
**Score:** Data binding 1/5 · Business logic 1/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| State | local timer | STATIC | useConsultNowController |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Cancel | useCancelInstantConsultMutation unused | NO ENDPOINT call | hook UNUSED |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Bind Instant status | Yes | No | M-030 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-030
**Backend (needs API change):**
- B-011
**Deferred:**
—
**Open questions:**
—

---

### Consult unavailable — `src/views/ConsultNowUnavailableView.tsx`
**Purpose / entry point:** No-match state · same controller
**Verdict:** ❌ Static
**Score:** Data binding 1/5 · Business logic 1/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Copy | local | STATIC | view |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | local | LOCAL | not Instant API |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Show only when API says unavailable | Yes | No | M-030 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-030
**Backend (needs API change):**
- B-011
**Deferred:**
—
**Open questions:**
—

---

### Consult offer — `src/views/ConsultNowOfferSheet.tsx`
**Purpose / entry point:** Offer sheet · same controller
**Verdict:** ❌ Static
**Score:** Data binding 1/5 · Business logic 1/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Offer fee | config rupees | STATIC | CONSULT_NOW_FEE_RUPEES |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Accept | local then fake pay | DEFERRED_PAYMENT | setTimeout success |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Offer from Instant response | Yes | No | B-011 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-030
**Backend (needs API change):**
- B-011
**Deferred:**
Payment ⏸
**Open questions:**
—

---

### Prescription — `src/views/PrescriptionView.tsx`
**Purpose / entry point:** Erx · `usePrescriptionController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Items | GET api/Erx/Patient/{patientAppId} | LIVE | recordsApi.ts:144 |
| PDF | not wired | NO SOURCE | blocked B-012 in controller |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | refetch | LIVE | controller |
| Share PDF | hidden | NO ENDPOINT | B-012 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No static medicines | Yes | Yes | M-031 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-012 PDF/share response shape
**Deferred:**
—
**Open questions:**
—

---

### Consultation note — `src/views/ConsultationRecordView.tsx`
**Purpose / entry point:** Note · `useConsultationRecordController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Text | GET api/Patient/Consultations/{id}/Note | LIVE | recordsApi.ts:141 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | refetch | LIVE | controller |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Null hide | Yes | Yes | M-032 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Upload document — `src/views/UploadDocumentView.tsx`
**Purpose / entry point:** Picker + upload · `useUploadDocumentController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| File | expo-image-picker / document-picker | LOCAL | real uri |
| Save | POST api/Patient/Documents FormData | LIVE | recordsApi.ts:153 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Progress | mutation status | LIVE | fake timer removed |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Temp id Math.random | client only | Yes | useUploadDocumentController.ts:93 — not sent as the server id |

#### B.4 States
Loading ☑ Empty ☐ Error ☑ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Follow-up plan — `src/views/FollowUpPlanView.tsx`
**Purpose / entry point:** Tasks · `useFollowUpPlanController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Tasks | GET api/Patient/FollowUps title, dueDate, status | LIVE | recordsApi.ts:167 |
| Doctor name / created line | not in payload — hidden | HIDDEN-NULL | controller empty strings |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Complete | POST FollowUps/{id}/Complete | LIVE | useCompleteFollowUpMutation |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No seed tasks | Yes | Yes | INITIAL_TASKS removed |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Symptom diary — `src/views/SymptomDiaryView.tsx`
**Purpose / entry point:** Calendar · `useSymptomDiaryController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Entries | GET api/Patient/Diary | LIVE | symptomDiaryApi.ts:65 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Create | POST api/Patient/Diary | LIVE | useCreateDiaryEntryMutation |
| Update / delete | hooks exist | UNUSED_HOOK | useUpdateDiaryEntryMutation, useDeleteDiaryEntryMutation — no delete control found |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Empty API → empty UI | Yes | Yes | seeds removed |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
Add update/delete only if product adds those controls.

---

### Diary entry — `src/views/SymptomDiaryEntryView.tsx`
**Purpose / entry point:** One entry form · same controller
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Fields | local until save | LOCAL | onSaveEntry |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Save | POST api/Patient/Diary | LIVE | saveCurrentEntry |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Do not seed a fixed week | Yes | Yes | M-035 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Health insights — `src/views/HealthInsightsView.tsx`
**Purpose / entry point:** Charts · `useHealthInsightsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 2/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Progress hook | GET api/Patient/Progress is called | PARTIAL | useGetProgressQuery imported |
| Follow-up rows | FOLLOW_UPS constant | STATIC | useHealthInsightsController.ts:53-58 |
| Adherence grid | ADHERENCE literals | STATIC | lines 61-63 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Change range | local | LOCAL | setRange |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No fabricated series | Yes | No | M-036 — CliniSight was cleaned; this screen was not |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-036 Delete FOLLOW_UPS and ADHERENCE. Bind series and follow-up counts from GET /api/Patient/Progress. Hide adherencePercent when null
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### CliniSight — `src/views/CliniSightProgressView.tsx`
**Purpose / entry point:** Progress chart · `useCliniSightProgressController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| series, visitCount, follow-ups | GET api/Patient/Progress | LIVE | symptomDiaryApi.ts:92 |
| adherencePercent | null hidden | HIDDEN-NULL | contract §4 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Empty chart | when series empty and visitCount 0 | LIVE | M-037 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No 42/56 caption | Yes | Yes | constants removed |

#### B.4 States
Loading ☑ Empty ☑ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Reminders — `src/views/RemindersCentreView.tsx`
**Purpose / entry point:** CRUD · `useRemindersCentreController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| List | GET api/Patient/Reminders | LIVE | remindersApi.ts:37 |
| Empty guard | EMPTY_REMINDERS | LIVE | controller — avoids a new [] each render |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Create | POST | LIVE | useCreateReminderMutation |
| Update | PUT full body isDone, weekdays, memberPatientId | LIVE | useUpdateReminderMutation |
| Delete | DELETE | LIVE | useDeleteReminderMutation |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Member picker from Family | Yes | Partial | M-039 memberPatientId sent; picker ids still local |
| Reschedule local notifications | LOCAL_BY_DESIGN | Partial | after CRUD |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-039 Populate the member picker from GET /api/Family. Reschedule local notifications after create/update/delete
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Notifications — `src/views/NotificationsView.tsx`
**Purpose / entry point:** Inbox · `useNotificationsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| List | GET api/Notifications title, body, isRead | LIVE | notificationsApi.ts:58 |
| Category | title heuristics | LOCAL | categorize() comment B-006 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Mark one | PATCH api/Notifications/{id} | LIVE | useMarkNotificationReadMutation |
| Mark all | POST MarkAllRead data.marked | LIVE | notificationsApi.ts:76 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No SEED list | Yes | Yes | M-040 |
| Navigate by deepLink | Cannot | No | field absent. B-006 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-006 Add type and deepLink
**Deferred:**
—
**Open questions:**
—

---

### Notification settings — `src/views/NotificationSettingsView.tsx`
**Purpose / entry point:** Preferences · `useNotificationSettingsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Prefs | GET api/Notifications/Preferences | LIVE | notificationsApi.ts:82 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Save | PUT full object | LIVE | useUpdateNotificationPreferencesMutation |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Quiet hours HH:mm | Yes | Yes | M-042 |
| Skip save while in flight | Yes | Yes | controller |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Health records — `src/views/HealthRecordsView.tsx`
**Purpose / entry point:** Timeline + documents · `useHealthRecordsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Timeline | GET api/Patient/Timeline | LIVE | recordsApi.ts:134 |
| Documents | GET api/Patient/Documents | LIVE | recordsApi.ts:148 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Delete document | DELETE api/Patient/Documents/{id} | LIVE | useDeleteDocumentMutation |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Numeric id required | Yes | Yes | controller guard |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Medicines — `src/views/MedicinesView.tsx`
**Purpose / entry point:** Past orders · `useMedicinesController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Orders | GET api/Patient/MedicineOrders | LIVE | medicinesApi.ts:160 |
| Price | quoteAmount or ₹0.00 | STATIC | useMedicinesController.ts:138 |
| Status | non-final mapped to delivered | STATIC | line 129 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Open order | navigation | LOCAL | view |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Hide null quote | Yes | No | M-055 |
| Status map | Yes | No | M-056 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-055 Hide the price row when quoteAmount is null. Do not show ₹0.00
- M-056 Map OFFERED/QUOTED/PAID/DISPATCHED to their own labels. Only DELIVERED is delivered
**Backend (needs API change):**
- B-023 Address book is separate; this screen does not need it to fix the two bugs
**Deferred:**
—
**Open questions:**
—

---

### Order medicines — `src/views/OrderMedicinesView.tsx`
**Purpose / entry point:** Erx lines → pharmacy · `useOrderMedicinesController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Latest Erx | GET Timeline then GET Erx/Patient/{id} | LIVE | recordsApi |
| Address | hidden | HIDDEN-NULL | B-023 |
| Rx id | erxSnapshotId or hidden | LIVE | no RX-2026 constant |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Create order | POST api/MedicineOrders {erxSnapshotId, pharmacyPartnerId} | LIVE | useCreateMedicineOrderMutation |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No seed vials | Yes | Yes | INITIAL_MEDS removed |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-023 Delivery address book
**Deferred:**
Payment ⏸
**Open questions:**
—

---

### Choose pharmacy — `src/views/ChoosePharmacyView.tsx`
**Purpose / entry point:** Sellers · `useChoosePharmacyController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Name and area | GET api/Pharmacy/Sellers | LIVE | medicinesApi |
| Price, ETA, distance | null — hidden | HIDDEN-NULL | contract §10 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | refetch | LIVE | controller |
| Sort chips | do not reorder by null metrics | LIVE | mapped list order |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No cheapest/fastest claim from nulls | Yes | Yes | labels empty |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-010 Decide whether those metrics will ever be stored
**Deferred:**
—
**Open questions:**
—

---

### Review order — `src/views/ReviewOrderView.tsx`
**Purpose / entry point:** Confirm lines · `useReviewOrderController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Lines | Erx names, price empty | LIVE | items from parent |
| Totals | empty strings hidden | HIDDEN-NULL | PayRow returns null |
| Address | hidden | HIDDEN-NULL | B-023 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Proceed | opens checkout | LOCAL | does not call pay |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No ₹250 seed | Yes | Yes | ITEMS constant removed |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-023
**Deferred:**
Payment ⏸
**Open questions:**
—

---

### Medicine checkout — `src/views/MedicineCheckoutView.tsx`
**Purpose / entry point:** Pay · `useMedicineCheckoutController`
**Verdict:** ⏸ Deferred
**Score:** Data binding 2/5 · Business logic 2/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Totals | hidden | HIDDEN-NULL | empty labels |
| Address lines | empty | HIDDEN-NULL | B-023 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Place order | sets placeOrderNote; does not call Pay | DEFERRED_PAYMENT | controller TODO(PAYMENT); usePayMedicineOrderMutation UNUSED |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No fake paid order 1209 | Yes | Yes | hardcoded id removed |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-P03 After B-P03, call POST /api/Payments/MedicineOrders only when gatewayReady and keyId are set
**Backend (needs API change):**
- B-P03
**Deferred:**
⏸
**Open questions:**
—

---

### Order tracking — `src/views/OrderTrackingView.tsx`
**Purpose / entry point:** Tracking · `useOrderTrackingController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Tracking | GET api/MedicineOrders/{id}/Tracking | LIVE | medicinesApi |
| Id | required numeric; no hm-3922 | LIVE | controller |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Open | skipped without id | LIVE | hasValidId |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Full timeline body | Unknown | Partial | B-028 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-028 Document the tracking payload
**Deferred:**
—
**Open questions:**
—

---

### Order details — `src/views/OrderDetailsView.tsx`
**Purpose / entry point:** One order · `useOrderDetailsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 2/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Header | id only | PARTIAL | comment blocked B-028 |
| Lines | not in payload | NO SOURCE | B-028 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Refill | not called | NO ENDPOINT | blocked B-023 comment in controller for erxSnapshotId |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No seed doctor/fees | Yes | Yes | controller comment |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-028
**Deferred:**
—
**Open questions:**
—

---

### My reviews — `src/views/MyReviewsView.tsx`
**Purpose / entry point:** List · `useMyReviewsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Rows | GET api/Reviews/Mine | LIVE | supportApi.ts:156 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | refetch | LIVE | controller |
| Appeal | navigation | LOCAL | outcome fields missing |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Empty list is empty | Yes | Yes | contract §5 |

#### B.4 States
Loading ☑ Empty ☑ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-017 Appeal status/outcome on the review row
**Deferred:**
—
**Open questions:**
—

---

### Appeal — `src/views/AppealReviewView.tsx`
**Purpose / entry point:** Appeal form · `useAppealReviewController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Reason | local, min 3 | LOCAL | contract |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Submit | POST api/Reviews/{id}/Appeal | LIVE | useAppealReviewMutation |
| In flight | disables submit | LIVE | M-047 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Show API message | Yes | Yes | controller |

#### B.4 States
Loading ☐ Empty ☐ Error ☑ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-017
**Deferred:**
—
**Open questions:**
—

---

### Help centre — `src/views/HelpCentreView.tsx`
**Purpose / entry point:** Topics + contacts · `useHelpCentreController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Articles prefetch | GET api/Help | LIVE | supportApi.ts:202 |
| Topic body | local taxonomy | STATIC | slug hook UNUSED |
| Phone | AppConfig supportPhone, hidden if null | HIDDEN-NULL | AppConfigProvider |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Call | tel: only if phone set | LIVE | showCallHelpline |
| Open slug | useGetHelpArticleBySlugQuery | UNUSED_HOOK | M-048 after B-020b |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No hardcoded clinic phone | Yes | Yes | null hide |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-048 After B-020b, open GET /api/Help/{slug} and render title/body. Hide null contacts
**Backend (needs API change):**
- B-003 Populate support phones
- B-020b Publish slug list matching the app topics
**Deferred:**
—
**Open questions:**
—

---

### Book with help — `src/views/BookWithHelpView.tsx`
**Purpose / entry point:** Assistance form · `useBookWithHelpController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Contacts | AppConfig, null hidden | HIDDEN-NULL | provider |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Submit | POST api/Support/AssistanceRequest | LIVE | supportApi |
| Error | surfaced, no success on failure | LIVE | M-050 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No hardcoded phone | Yes | Yes | Boolean(supportPhone) |

#### B.4 States
Loading ☐ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-003
**Deferred:**
—
**Open questions:**
—

---

### Raise ticket — `src/views/RaiseTicketView.tsx`
**Purpose / entry point:** New ticket · `useRaiseTicketController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Form | local | LOCAL | view |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Create | POST api/Support/Tickets | LIVE | supportApi.ts:172 |
| Show id | supportTicketId | LIVE | M-049 |
| My tickets list | GET Tickets/Mine | UNUSED_HOOK | optional |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Success only with id | Yes | Yes | controller |

#### B.4 States
Loading ☐ Empty ☐ Error ☑ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
Binding Tickets/Mine is optional polish, not a missing route.

---

### Health tip — `src/views/HealthTipArticleView.tsx`
**Purpose / entry point:** Article · `useHealthTipController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 4/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Article | GET api/Public/Articles/{id} | LIVE | homeApi.ts:118 |
| Image | resolveApiUrl or hidden | HIDDEN-NULL | controller |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry | refetch | LIVE | line 207 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Numeric id or back | Yes | Yes | isNumeric |

#### B.4 States
Loading ☑ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
—

---

### Legal — `src/views/LegalDocumentView.tsx`
**Purpose / entry point:** Terms / privacy / about · `useLegalDocumentController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Terms | GET api/Public/Policies/Terms title, version, bodyHtml | LIVE | bookingApi.ts:151 |
| Privacy / about | local i18n | LOCAL | no route |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Retry terms | refetch | LIVE | controller |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Prefer API body for terms | Yes | Yes | stripHtml |

#### B.4 States
Loading ☑ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
—
**Open questions:**
Privacy and About stay local until a policy route exists. Not requested by the contract.

---

### Account — `src/views/AccountView.tsx`
**Purpose / entry point:** Profile menu · `useAccountController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Profile | GET api/PatientProfile/Me | LIVE | patientProfileApi.ts:56 |
| Data-request history | none | NO SOURCE | contract: no list |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Language | PUT PatientProfile/Me preferredLanguageId | LIVE | controller |
| Data request | POST api/Patient/DataRequests EXPORT or DELETE | LIVE | consentApi.ts:92 |
| Logout | POST api/Account/Logout via session.ts | LIVE | session.ts:37 |
| Delete account HTTP | not called | LOCAL | correct — no DELETE /api/Account |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Show request result only | Yes | Yes | dataRequestMessage |
| No fake history | Yes | Yes | M-014 |

#### B.4 States
Loading ☐ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-018 Only if product wants a history list. Do not build it for the current UI
**Deferred:**
—
**Open questions:**
—

---

### Family — `src/views/FamilyMembersView.tsx`
**Purpose / entry point:** Members · `useFamilyMembersController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| List | GET api/Family | LIVE | familyApi.ts:166 |
| Relations | GET api/Family/Relations | LIVE | familyApi.ts:177 |
| Caregiver | hooks unused | UNUSED_HOOK | Grant/Revoke/ListMine |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Add | POST api/Family | LIVE | useCreateFamilyMemberMutation |
| Edit | PUT | LIVE | useUpdateFamilyMemberMutation |
| Remove | DELETE | LIVE | useDeleteFamilyMemberMutation |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| SEED_MEMBERS is [] | Yes | Yes | line 47 — not a fixture list |
| Caregiver UI | If shown, must call Grant | UNVERIFIED | M-006 |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
- M-006 If a caregiver control is on screen, bind Grant/Revoke/ListMine. If it is not on screen, leave the hooks unused
**Backend (needs API change):**
- B-021 How consent type 6 relates to Caregiver/Grant
**Deferred:**
—
**Open questions:**
—

---

### Consent centre — `src/views/ConsentCentreView.tsx`
**Purpose / entry point:** Toggles · `useConsentCentreController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Rows | GET api/Patient/Consents | LIVE | consentApi.ts:58 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Grant | POST Types/{id}/Grant | LIVE | useGrantConsentMutation |
| Withdraw | POST Consents/{id}/Withdraw | LIVE | useWithdrawConsentMutation |
| Data request | POST DataRequests | LIVE | also from account |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Caregiver conflict message | Yes | Yes | M-005 |

#### B.4 States
Loading ☐ Empty ☐ Error ☑ Null ☑ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-021
**Deferred:**
—
**Open questions:**
—

---

### Payments — `src/views/PaymentsView.tsx`
**Purpose / entry point:** History · `usePaymentsController`
**Verdict:** 🟡 Partial
**Score:** Data binding 3/5 · Business logic 3/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Rows | GET api/Patient/Payments | LIVE | paymentsApi.ts:131 |
| Seed list | removed | LIVE | M-053 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Open receipt | invoice route absent | NO ENDPOINT | deferred invoices |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| Null money hidden | Yes | Partial | confirm formatMoney — UNVERIFIED on every row |

#### B.4 States
Loading ☐ Empty ☑ Error ☐ Null ☐ 401 ☐ Offline ☐

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
—
**Deferred:**
Invoices ⏸
**Open questions:**
—

---

### Offline — `src/views/OfflineModeView.tsx`
**Purpose / entry point:** Offline help · `useOfflineModeController`
**Verdict:** 🟡 Partial
**Score:** Data binding 4/5 · Business logic 4/5 · States (loading/empty/error/null) 3/5

#### B.1 Data read — field by field
| UI element | Source (route + field) | Status | Evidence |
|---|---|---|---|
| Connectivity | NetInfo | LOCAL | controller |
| Helpline | supportPhone or hidden | HIDDEN-NULL | M-054 |

#### B.2 Actions — button/form by button/form
| Action | Route + method + params | Status | Evidence |
|---|---|---|---|
| Call | tel: when phone set | LIVE | showCallHelpline |
| Retry | NetInfo.fetch | LOCAL | line 53 |

#### B.3 Business logic — required vs implemented
| Rule | Required? | Implemented? | Evidence / gap |
|---|---|---|---|
| No hardcoded clinic phone | Yes | Yes | AppConfig |

#### B.4 States
Loading ☐ Empty ☐ Error ☐ Null ☑ 401 ☐ Offline ☑

#### B.5 Remaining work
**Mobile (app-only):**
—
**Backend (needs API change):**
- B-003
**Deferred:**
—
**Open questions:**
—

---

## 5. Endpoint coverage (contract and app)

Ownership for every patient, family, visit, diary, document, reminder, review, and order route: the server reads the patient from the Bearer token. The app must not send another patient's id. Family writes are for members the token's patient owns.

| Route | Hook | File | Status | Notes |
|---|---|---|---|---|
| GET /api/Public/AppConfig | useGetAppConfigQuery | appConfigApi.ts:24 | BOUND_OK | Null contacts hidden |
| GET /api/Public/Doctors | useGetDoctorsQuery | doctorsApi.ts:148 | BOUND_OK | teleOnly only when video filter is on |
| GET /api/Public/Doctors/{id} | useGetDoctorByIdQuery | doctorsApi.ts:160 | BOUND_OK | Numeric id required |
| GET /api/Public/Doctors/{id}/Slots | useGetDoctorSlotsQuery | doctorsApi.ts | BOUND_OK | Book + reschedule |
| GET /api/Fees/Public/{id} | useGetDoctorFeesQuery | doctorsApi.ts:181 | BOUND_OK | |
| GET /api/Reviews/Doctor/{id} | useGetDoctorReviewsQuery | doctorsApi.ts:184 | BOUND_OK | |
| GET /api/Public/Doctors/{id}/Ranking | useGetDoctorRankingQuery | doctorsApi.ts:166 | UNUSED_HOOK | |
| GET /api/Tele/Availability/{id} | useGetDoctorTeleAvailabilityQuery | doctorsApi.ts | UNUSED_HOOK | |
| POST /api/Public/Doctors/{id}/Bookings | useCreateBookingMutation | bookingApi.ts | BOUND_OK | |
| POST /api/Family/BookAs | useBookAsFamilyMutation | bookingApi.ts:141 | BOUND_OK | |
| GET /api/Public/Bookings/{token} | useGetBookingByTokenQuery | bookingApi.ts:148 | UNUSED_HOOK | |
| GET /api/Public/Policies/Terms | useGetTermsPolicyQuery | bookingApi.ts:151 | BOUND_OK | Terms screen |
| POST /api/Waitlist/Join | useJoinWaitlistMutation | bookingApi.ts:155 | UNUSED_HOOK | App uses AppointmentRequests instead |
| GET /api/Waitlist/Offers | useGetWaitlistOffersQuery | bookingApi.ts | UNUSED_HOOK | |
| POST /api/Patient/AppointmentRequests | useCreateAppointmentRequestMutation | appointmentRequestsApi.ts:29 | BOUND_OK | No list route |
| GET /api/Patient/Visits | useGetPatientVisitsQuery | visitsApi.ts:160 | BOUND_OK | |
| GET /api/Patient/Visits/{id} | useGetVisitDetailQuery | visitsApi.ts:166 | BOUND_OK | |
| POST …/CheckIn | useCheckInVisitMutation | visitsApi | BOUND_OK | readyAt null |
| POST SwitchToTele | useSwitchVisitToTeleMutation | visitsApi.ts:204 | BOUND_OK | |
| POST RescheduleAppointment | useRescheduleAppointmentMutation | visitsApi.ts:225 | BOUND_OK | |
| POST CancelAppointment | useCancelAppointmentMutation | visitsApi.ts:236 | BOUND_OK | |
| POST RunningLate | useReportRunningLateMutation | teleApi | BOUND_OK | Needs teleSessionId |
| GET /api/Patient/Progress | useGetProgressQuery | symptomDiaryApi.ts:92 | BOUND_OK | Insights screen still overlays fixtures |
| GET/POST /api/Patient/Diary | diary hooks | symptomDiaryApi.ts | BOUND_OK | Update/delete UNUSED_HOOK |
| GET /api/Reviews/Mine | useGetMyReviewsQuery | supportApi.ts:156 | BOUND_OK | |
| POST /api/Reviews | useCreateReviewMutation | supportApi.ts:132 | BOUND_OK | |
| POST /api/Reviews/{id}/Appeal | useAppealReviewMutation | supportApi | BOUND_OK | |
| GET/POST/PUT/DELETE /api/Patient/Reminders | reminders hooks | remindersApi.ts | BOUND_OK | |
| GET /api/Notifications | useGetNotificationsQuery | notificationsApi.ts:58 | BOUND_OK | No type/deepLink |
| PATCH /api/Notifications/{id} | useMarkNotificationReadMutation | notificationsApi | BOUND_OK | |
| POST MarkAllRead | useMarkAllNotificationsReadMutation | notificationsApi.ts:76 | BOUND_OK | |
| GET/PUT Preferences | notification pref hooks | notificationsApi.ts:82 | BOUND_OK | |
| GET /api/Pharmacy/Sellers | useGetPharmacySellersQuery | medicinesApi | BOUND_OK | Metrics null |
| GET /api/Patient/MedicineOrders | useGetMedicineOrdersQuery | medicinesApi.ts:160 | BOUND_DRIFT | App shows ₹0.00 and wrong status |
| POST /api/MedicineOrders | useCreateMedicineOrderMutation | medicinesApi.ts | BOUND_OK | |
| GET …/Tracking | useGetMedicineOrderTrackingQuery | medicinesApi | PARTIAL | Body under-specified B-028 |
| POST /api/Payments/MedicineOrders | usePayMedicineOrderMutation | medicinesApi.ts:206 | UNUSED_HOOK | ⏸ |
| POST /api/Payments/ConsultOrders | useCreateConsultOrderMutation | paymentsApi.ts:109 | UNUSED_HOOK | ⏸ |
| POST /api/Payments/Verify | useVerifyPaymentMutation | paymentsApi.ts:117 | UNUSED_HOOK | ⏸ |
| GET /api/Erx/Patient/{id} | useGetPrescriptionQuery | recordsApi.ts:144 | BOUND_OK | |
| GET /api/Erx/{id}/Pdf | none | recordsApi comment only | NOT_BOUND | B-012 |
| GET Note | useGetConsultationNoteQuery | recordsApi.ts:141 | BOUND_OK | |
| GET/POST Documents, DELETE | records hooks | recordsApi.ts | BOUND_OK | |
| GET FollowUps + Complete | records hooks | recordsApi.ts:167 | BOUND_OK | |
| GET /api/Patient/Timeline | useGetTimelineQuery | recordsApi.ts:134 | BOUND_OK | |
| GET/POST Family, PUT, DELETE | family hooks | familyApi.ts | BOUND_OK | |
| Caregiver Grant/Revoke/List | caregiver hooks | familyApi.ts:218-255 | UNUSED_HOOK | Routes exist. B-021 is a rule question |
| GET /api/PatientProfile/Me + PUT | profile hooks | patientProfileApi.ts | BOUND_OK | |
| POST /api/Patient/DataRequests | useCreateDataRequestMutation | consentApi.ts:92 | BOUND_OK | No list |
| GET/POST Consents | consent hooks | consentApi.ts | BOUND_OK | |
| POST /api/PatientAuth/RequestOtp | useRequestOtpMutation | signInApi.ts:33 | BOUND_OK | |
| POST /api/PatientAuth/VerifyOtp | useVerifyOtpMutation | otpVerificationApi.ts:51 | BOUND_OK | |
| POST /api/Account/Login | none | — | NOT_BOUND | Contract names it; app uses OTP. B-002 |
| POST /api/Account/RefreshToken | inline in newBaseApi.ts:63 | newBaseApi.ts | BOUND_OK | Hook unused |
| POST /api/Account/Logout | endpoints.logout.initiate | session.ts:37 | BOUND_OK | Hook name unused |
| GET /api/Public/Articles + /{id} | article hooks | homeApi.ts | BOUND_OK | |
| GET /api/Help | useGetHelpArticlesQuery | supportApi.ts:202 | PARTIAL | Slug hook unused |
| GET /api/Help/{slug} | useGetHelpArticleBySlugQuery | supportApi.ts:205 | UNUSED_HOOK | B-020b |
| POST /api/Support/Tickets | useCreateTicketMutation | supportApi.ts:172 | BOUND_OK | |
| GET Tickets/Mine | useGetMyTicketsQuery | supportApi.ts:179 | UNUSED_HOOK | |
| POST AssistanceRequest | useRequestAssistanceMutation | supportApi | BOUND_OK | |
| POST /api/Tele/Instant* | instant hooks | teleApi.ts:175 | UNUSED_HOOK | B-011 |
| GET /api/Tele/DeviceCheck | useGetDeviceCheckQuery | teleApi.ts:199 | UNUSED_HOOK | ⏸ |
| GET /api/Tele/Sessions/{id} | useGetTeleSessionQuery | teleApi.ts:202 | UNUSED_HOOK | ⏸ |
| POST …/Token | useGetTeleTokenMutation | teleApi | UNUSED_HOOK | ⏸ |
| GET/POST Tele/Chat | chat hooks | teleApi.ts | BOUND_OK | |
| GET Tele/Summary | useGetConsultationSummaryQuery | teleApi.ts:256 | BOUND_OK | |
| GET /api/PatientPortal/Home | useGetHomeDashboardQuery | homeApi.ts:97 | BOUND_OK | |
| POST api/Devices/Register | fetch, not RTK | deviceTokenApi.ts:35 | called outside RTK | Also devicesApi hooks UNUSED |

App routes not in the contract excerpt: masters languages/genders, UserAddressLocation, POST api/patient/, privacy consent, caregiver, devices. Treat them as existing server routes already called. Do not add duplicates.

## 6. Business-logic matrix

| Rule | Screen | Implemented? | Evidence | Item |
|---|---|---|---|---|
| Bearer only when a token exists | All | Yes | prepareAuthHeaders.ts:13 | — |
| 401 refresh once, then sign-out | All | Yes | newBaseApi.ts:46 | — |
| Null hides the row | Visit, pharmacy, terms, support | Partial | medicines list violates it | M-055 |
| Search not teleOnly by default | Search | Yes | models/search.ts:69 | — |
| Numeric doctor id | Profile, book | Yes | useDoctorProfileController | — |
| One booking submit | Book | Yes | bookingInFlight | — |
| Reschedule only after success | Reschedule | Yes | unwrap then update | — |
| No seed diary / notifications | Those screens | Yes | controllers | — |
| Insights chart from API only | Health insights | No | FOLLOW_UPS :53 | M-036 |
| Order status not collapsed | Medicines | No | line 129 | M-056 |
| OTP echo off in production | OTP | No | OtpVerificationView.tsx:101 | M-003 |
| Consult-now fees from API | Consult now | No | CONSULT_NOW_FEE | M-030, B-011 |
| Appointment request status | My appointments | No | no list route | B-005 |

## 7. Cross-cutting

- Errors: `messageFromUnknownError` in `src/utilities/apiResponse.ts` and `extractErrorMessage` in `newBaseApi.ts:127`. Not every screen uses them.
- 401: empty body is not parsed (`apiResponse.ts:4`). Refresh uses the current token as the body (`newBaseApi.ts:66`).
- Money: `formatMoney` returns empty for null on visit detail. Medicines list bypasses it (`₹0.00`).
- Photos: `resolveApiUrl` prefixes relative `doctorPhotoUrl`.
- Cache tags are declared on `newBaseApi.ts:168`. Booking invalidates Visits, Slots, Bookings. A full matrix of every mutation was not re-tested at runtime (UNVERIFIED).
- Deep links: notification `deepLink` is absent. No allow-list yet (B-006).
- Secrets: no `rzp_` literal in `src/` from this scan. Key must come from AppConfig.
- Dead hooks: 44 names listed in the evidence file. Caregiver, Instant, Tele token, ConsultOrders, Verify, PayMedicine, Help slug, diary update/delete, ranking, waitlist, refund policy.
- Outside RTK: `services/api/client.ts:31`, `deviceTokenApi.ts:35`.

## 8. Static / hardcoded register

| Hit | Class | Fix |
|---|---|---|
| useHealthInsightsController.ts:53 FOLLOW_UPS | STATIC_BUG | M-036 |
| useHealthInsightsController.ts:61 ADHERENCE | STATIC_BUG | M-036 |
| useMedicinesController.ts:138 ₹0.00 | STATIC_BUG | M-055 |
| useMedicinesController.ts:129 status delivered | STATIC_BUG | M-056 |
| useConsultNowController.ts:361 fee constants | STATIC_BUG | M-030 after B-011 |
| appointmentSlots.ts:184 PLATFORM_FEE_RUPEES | STATIC_BUG | used by consult now; delete with M-030 |
| OtpVerificationView.tsx:101 devOtp | STATIC_BUG | M-003 |
| usePaymentStatusController.ts:111 SEED_PAYMENT_ID | DEFERRED_PAYMENT | M-P02 |
| useWaitingRoomController.ts:71 forceDoctorLate | DEFERRED_VIDEO | M-V02 |
| useVideoCallController.ts:186 fake elapsed | DEFERRED_VIDEO | M-V04 |
| useUploadDocumentController.ts:93 Math.random | LOCAL_BY_DESIGN | temp id only |
| i18n strings such as aptReasonCough | LEGIT_UI_TEXT | not shown unless a key is passed |
| doctorProfiles.ts anjali seed | STATIC_BUG | still used by consult now and payment status only |

## 9. Local by design

Splash timer, onboarding slides, phone-setup OS permissions, language persistence, astro/low-data toggles, NetInfo, local notification scheduling after reminder CRUD. These hold no fabricated clinical records. `EMPTY_REMINDERS` is an empty constant so the query data identity stays stable.

## 10. Deferred register

| Stub | Evidence | Route later | Backend |
|---|---|---|---|
| Consult pay | useBookAppointmentController.ts:622 | POST /api/Payments/ConsultOrders + Verify | B-P01 |
| Payment status seeds | usePaymentStatusController.ts:111 | Verify response | B-P01 |
| Medicine pay | useMedicineCheckoutController TODO(PAYMENT) | POST /api/Payments/MedicineOrders | B-P03 |
| Device check mock | useDeviceCheckController.ts:157 | GET /api/Tele/DeviceCheck | B-P10 |
| Waiting room late flag | useWaitingRoomController.ts:71 | GET /api/Tele/Sessions/{id} | B-P11 |
| Video timers | useVideoCallController.ts:186 | POST …/Token | B-P12 |

## 11. Work split

### 11.1 Mobile — do now

| ID | Priority | Screen | Change |
|---|---|---|---|
| M-036 | P1 | Health insights | Remove FOLLOW_UPS and ADHERENCE. Use Progress series and counts. Hide null adherence |
| M-055 | P1 | Medicines list | Hide price when quoteAmount is null |
| M-056 | P1 | Medicines list | Do not label in-progress orders as delivered |
| M-003 | P1 | OTP | Show devOtp only in `__DEV__` |
| M-001 | P2 | First launch | Error + retry when languages fail |
| M-002 | P2 | Sign in | Show RequestOtp error; do not continue |
| M-008 | P2 | Home | Unread count from Notifications.isRead |
| M-010 | P2 | My appointments | Error + retry on the visits query |
| M-039 | P2 | Reminders | Member picker from GET /api/Family; reschedule local notifications |

### 11.2 Mobile — after backend

M-030 after B-011. M-048 after B-020b. M-006 after B-021 if a caregiver control exists. M-P01/M-P02 after B-P01. M-P03 after B-P03. M-V01–M-V04 after B-P10–B-P12. Home consult-now button after B-004.

### 11.3 Backend — do first

B-003, B-004, B-005, B-008, B-011, B-028. Then B-002, B-006, B-007, B-009, B-023, B-029. Phase 2 last.

### 11.4 Sequence

Today: M-036, M-055, M-056, M-003. In parallel the backend fills B-003 and B-004 (config only). After B-005 the appointments screen can show PENDING. After B-008 join and running-late can require a session id. After B-011 consult now can drop seed fees. Payment and video stay last.

## 12. Risks and QA

For each live screen, check empty list, null fee/phone, 400 message, 401 (empty body, then login), slow network, and double tap on book, reschedule, review, data request, and medicine order. Slot taken must stay one error, not a second booking. Hold expiry is UNVERIFIED until payment is bound.

## 13. Quality gates

| Gate | Result |
|---|---|
| yarn typecheck | Pass. `docs/audit/evidence/RERUN_A7_typecheck.txt` |
| yarn lint | Pass. `docs/audit/evidence/RERUN_A7_lint.txt` |
| Unit tests | No test script in package.json |
| Bundle | Not run |

## 14. Appendix

Method: read controllers, RTK endpoint files, and the bind contract. Hook usage was a script over `src/` (123 hooks, 44 unused names). Claims cite file:line. Runtime JSON from the server was not called, so payload drift is UNVERIFIED.

UNVERIFIED: pull-to-refresh on every home query; minFee ≤ maxFee enforcement; whether a caregiver button is visible; refund-policy copy on cancel; cache invalidation on device; `services/api/client.ts` callers.

Not edited: `src/`, prior `04_mobile_todo_log.md`, `MOBILE_TODO_EXECUTION_REPORT.md`, `PatientMobile_Bind_APIs.md`.
