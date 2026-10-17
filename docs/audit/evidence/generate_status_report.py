#!/usr/bin/env python3
"""Generate docs/audit/PATIENT_APP_STATUS_REPORT.md — analysis only."""
from __future__ import annotations

from collections import Counter
from pathlib import Path


def S(
    name,
    view,
    ctrl,
    verdict,
    d,
    l,
    s,
    Ms,
    Bs,
    purpose,
    entry,
    b1,
    b2,
    b3,
    states,
    rem_m,
    rem_b,
    deferred="",
    questions="—",
):
    for label, rows in (("b1", b1), ("b2", b2), ("b3", b3)):
        for i, row in enumerate(rows):
            if len(row) != 4:
                raise ValueError(f"{name}.{label}[{i}] len={len(row)}: {row!r}")
    return dict(
        name=name,
        view=view,
        ctrl=ctrl,
        verdict=verdict,
        d=d,
        l=l,
        s=s,
        Ms=Ms,
        Bs=Bs,
        purpose=purpose,
        entry=entry,
        b1=b1,
        b2=b2,
        b3=b3,
        states=states,
        rem_m=rem_m,
        rem_b=rem_b,
        deferred=deferred,
        questions=questions,
    )


screens = [
    S(
        "Splash",
        "views/SplashView.tsx",
        "useSplashController",
        "📱",
        5,
        4,
        3,
        "—",
        "—",
        "Brand splash; timed advance",
        "AppStep splash",
        [("Brand/tagline", "i18n", "LIVE", "useSplashController.ts")],
        [("Auto advance", "local timer", "LOCAL", "useSplashController.ts:17-20")],
        [("Timer cleanup", "Yes", "Yes", "useSplashController.ts:17-20")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [],
        [],
    ),
    S(
        "First launch",
        "views/FirstLaunchView.tsx",
        "useFirstLaunchController",
        "🟡",
        4,
        4,
        3,
        "M-001",
        "—",
        "Language pick before onboarding",
        "AppStep firstLaunch",
        [
            (
                "Language list",
                "GET mastersAPI/GetLanguages",
                "LIVE",
                "firstLaunchApi.ts",
            ),
            (
                "Fallback languages",
                "local list if API empty",
                "STATIC",
                "useFirstLaunchController",
            ),
        ],
        [("Select language", "local + persist", "LOCAL", "useFirstLaunchController")],
        [("Prefer API languages", "Yes", "Partial", "fallback still present")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-001 Remove/limit local language fallback; show error+retry when masters fail"
        ],
        [],
    ),
    S(
        "Onboarding",
        "views/OnboardingSlideView.tsx",
        "useOnboardingController",
        "📱",
        5,
        5,
        4,
        "—",
        "—",
        "3 static product slides",
        "AppStep onboarding",
        [("Slides", "local i18n copy", "LIVE", "LOCAL_BY_DESIGN marketing")],
        [("Next/Skip", "local nav", "LOCAL", "useOnboardingController")],
        [("Static content", "Yes", "Yes", "by design")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [],
        [],
    ),
    S(
        "Sign in",
        "views/SignInView.tsx",
        "useSignInController",
        "🟡",
        4,
        4,
        3,
        "M-002",
        "B-002",
        "Mobile + WhatsApp consent → RequestOtp",
        "AppStep signIn",
        [
            (
                "Countries",
                "GET UserAddressLocation/Countries",
                "LIVE",
                "completeProfileApi / signIn",
            ),
            ("Mobile input", "local state", "LOCAL", "useSignInController"),
        ],
        [
            (
                "Request OTP",
                "POST api/PatientAuth/RequestOtp",
                "LIVE",
                "signInApi.ts",
            ),
            (
                "Account/Login",
                "contract mentions Login",
                "NO ENDPOINT in app",
                "B-002",
            ),
        ],
        [
            ("Mobile validation", "Yes", "Yes", "controller"),
            (
                "Token from OTP not Login",
                "Contract says Login",
                "App uses OTP",
                "signInApi.ts",
            ),
        ],
        "Loading ☐ Empty ☐ Error+retry ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-002 Map RequestOtp errors to UI; ensure no hardcoded credentials"],
        ["B-002 Clarify OTP vs Account/Login as Bearer SoT"],
    ),
    S(
        "OTP verification",
        "views/OtpVerificationView.tsx",
        "useOtpVerificationController",
        "🟡",
        4,
        4,
        4,
        "M-003",
        "B-002",
        "6-digit OTP; store token; route new vs registered",
        "AppStep otp",
        [
            (
                "Dev OTP display",
                "VerifyOtp response / initialDevOtp",
                "LIVE/STATIC",
                "useOtpVerificationController.ts:78-90",
            )
        ],
        [
            (
                "Verify",
                "POST PatientAuth/VerifyOtp",
                "LIVE",
                "otpVerificationApi.ts",
            ),
            ("Resend", "RequestOtp", "LIVE", "controller"),
        ],
        [
            ("Resend countdown", "Yes", "Yes", "secondsLeft effect"),
            ("6-digit gate", "Yes", "Yes", "canVerify"),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-003 Hide/dev-gate any OTP echo in production builds"],
        ["B-002"],
    ),
    S(
        "Complete profile",
        "views/CompleteProfileView.tsx",
        "useCompleteProfileController",
        "🟡",
        4,
        4,
        3,
        "M-004",
        "B-020",
        "Name/DOB/gender/address cascade; create or edit Me",
        "AppStep + Account edit",
        [
            ("Genders", "GET mastersAPI/GetGenders", "LIVE", "completeProfileApi"),
            (
                "Geo cascade",
                "Countries/States/Districts/Cities",
                "LIVE",
                "completeProfileApi",
            ),
            (
                "Profile Me",
                "GET/PUT PatientProfile/Me",
                "LIVE",
                "patientProfileApi",
            ),
            ("Create patient", "POST api/patient/", "LIVE", "completeProfileApi"),
        ],
        [
            ("Save create", "POST api/patient/", "LIVE", "useCompleteProfileController"),
            (
                "Save edit",
                "PUT PatientProfile/Me",
                "LIVE",
                "useCompleteProfileController",
            ),
        ],
        [
            ("Cascade skip when parent unset", "Yes", "Yes", "skip flags"),
            ("Photo upload", "UI may exist", "NO ENDPOINT", "M-004 / B-020"),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-004 Wire photo only after B-020; hide photo CTA if no route"],
        ["B-020 Profile photo upload route if product requires"],
    ),
    S(
        "Consent (onboarding)",
        "views/ConsentView.tsx",
        "useConsentController",
        "🟡",
        4,
        3,
        3,
        "M-005",
        "B-019",
        "Privacy grant + per-type consents",
        "AppStep consent",
        [
            (
                "Privacy status",
                "GET Consent/PrivacyStatus",
                "LIVE",
                "privacyConsentApi",
            ),
            ("Consent list", "GET Patient/Consents", "LIVE", "consentApi"),
            (
                "Notice",
                "GET Consent/Notice/{code}",
                "LIVE",
                "privacyConsentApi",
            ),
        ],
        [
            (
                "Grant privacy",
                "POST Consent/GrantPrivacy",
                "LIVE",
                "privacyConsentApi",
            ),
            (
                "Grant type",
                "POST Consents/Types/{id}/Grant",
                "LIVE",
                "consentApi — 409 caregiver type 6",
            ),
            (
                "Withdraw",
                "POST Consents/{recordId}/Withdraw",
                "LIVE",
                "consentApi",
            ),
        ],
        [
            (
                "Disable caregiver grant from this screen",
                "Yes (409)",
                "Partial — still toggleable",
                "useConsentController.ts:130",
            )
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-005 Hide/disable consentType that must be granted from Caregiver page; surface 409 message"
        ],
        ["B-019 Document consent type catalogue + caregiver rule"],
    ),
    S(
        "Phone setup",
        "views/PhoneSetupView.tsx",
        "usePhoneSetupController",
        "📱",
        5,
        5,
        4,
        "—",
        "—",
        "OS camera/mic/notification permissions",
        "AppStep phoneSetup",
        [("Permission state", "expo APIs", "LOCAL", "LOCAL_BY_DESIGN")],
        [("Request permissions", "OS", "LOCAL", "usePhoneSetupController")],
        [("Local only", "Yes", "Yes", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [],
        [],
    ),
    S(
        "Family members",
        "views/FamilyMembersView.tsx",
        "useFamilyMembersController",
        "🟡",
        4,
        4,
        4,
        "M-006",
        "B-021",
        "Family CRUD + relations",
        "AppStep + Account overlay",
        [
            ("Members", "GET api/Family", "LIVE", "familyApi"),
            ("Relations", "GET Family/Relations", "LIVE", "familyApi"),
            ("Genders", "GetGenders", "LIVE", "completeProfileApi"),
        ],
        [
            ("Create/Update/Delete", "POST/PUT/DELETE Family", "LIVE", "familyApi"),
            (
                "Caregiver grant",
                "Caregiver/* hooks",
                "UNUSED",
                "familyApi caregiver endpoints unused",
            ),
        ],
        [
            ("CRUD validation", "Yes", "Partial", "controller"),
            (
                "Caregiver conflict with consent type 6",
                "Yes",
                "Not wired",
                "B-021",
            ),
        ],
        "Loading ☐ Empty ☐ Error+retry ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-006 Bind Caregiver Grant/Revoke/List when product requires; else remove dead UI"
        ],
        ["B-021 Caregiver API ownership + consent type 6 relationship"],
    ),
    S(
        "Home",
        "views/HomeView.tsx",
        "useHomeController",
        "🟡",
        4,
        3,
        3,
        "M-007,M-008",
        "B-004,B-026",
        "Greeting, tabs, upcoming visits, doctors, articles, care categories",
        "AppStep home",
        [
            (
                "Doctors",
                "GET Public/Doctors",
                "LIVE",
                "useHomeController.ts:242-247",
            ),
            (
                "Visits/upcoming",
                "PatientPortal/Home + Patient/Visits",
                "LIVE",
                "useHomeController.ts:461-566",
            ),
            ("Articles", "GET Public/Articles", "LIVE", "useHomeController.ts:250-253"),
            (
                "Care categories",
                "PatientPortal/CareCategories",
                "LIVE",
                "useHomeController.ts:249",
            ),
            (
                "Visit reasonKey",
                "hardcoded aptReasonCough",
                "STATIC",
                "useHomeController.ts:552",
            ),
            (
                "Feature flags instant/medicine",
                "AppConfig",
                "NO SOURCE",
                "contract §1",
            ),
        ],
        [
            (
                "Pull refresh doctors",
                "refetchDoctors",
                "LIVE",
                "HomeView RefreshControl",
            ),
            ("Open search/consult", "nav", "LOCAL", "HomeView / AppNavigator"),
        ],
        [
            ("Merge dashboard+visits dedupe", "Yes", "Yes", "useHomeController.ts:485-514"),
            ("Null-hide fees", "Yes", "Yes", "HomeView consultFeeTele/InClinic"),
            ("Hardcoded reason", "No", "No", "M-007"),
        ],
        "Loading ☑ Empty ☑ Error+retry ☑ (doctors) Null-hiding ☑ 401 ☐ Offline ☐",
        [
            "M-007 Stop inventing reasonKey/paymentId placeholders; hide when null",
            "M-008 Wire unread badge to Notifications (or B-026)",
        ],
        [
            "B-004 AppConfig instantConsultEnabled / medicineOnlinePayEnabled",
            "B-026 UnreadCount for bell",
        ],
    ),
    S(
        "Doctors tab (Home)",
        "views/HomeView.tsx (doctors tab)",
        "useHomeController",
        "🟡",
        4,
        3,
        4,
        "M-009",
        "—",
        "Available doctors list + online filter",
        "Home selectedTab=doctors",
        [
            (
                "Doctor cards",
                "GET Public/Doctors",
                "LIVE",
                "HomeView.tsx:708-868",
            ),
            (
                "Online filter",
                "client isOnline",
                "LOCAL",
                "HomeView.tsx:295-298",
            ),
        ],
        [
            ("Book/open profile", "nav doctorId", "LIVE", "HomeView DoctorCard"),
            ("Search bar", "opens SearchDoctors", "LOCAL", "HomeView.tsx:751-766"),
        ],
        [("Empty/error/loading", "Yes", "Yes", "HomeView.tsx:834-858")],
        "Loading ☑ Empty ☑ Error+retry ☑ Null ☑ 401 ☐ Offline ☐",
        [
            "M-009 Ensure photoUrl via resolveApiUrl; hide rating when reviewCount=0 on cards"
        ],
        [],
    ),
    S(
        "My appointments",
        "views/MyAppointmentsView.tsx",
        "via useHomeController",
        "🟡",
        3,
        3,
        3,
        "M-010",
        "B-005",
        "List of booked visits from home state",
        "Account / home overlay",
        [
            (
                "Appointments",
                "mapped from Visits/Home",
                "LIVE",
                "useHomeController appointments",
            ),
            (
                "Ask-for-time requests",
                "no list API",
                "NO SOURCE",
                "B-005",
            ),
        ],
        [
            ("Open detail", "nav", "LIVE", "AppNavigator"),
            ("Refresh", "parent refetch", "Partial", "MyAppointmentsView"),
        ],
        [
            ("Upcoming/past split", "Partial", "Partial", "status filter"),
            ("Pagination", "Required for large lists", "No", "B/M"),
        ],
        "Loading ☐ Empty ☑ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-010 Add empty/error states + pull-to-refresh on this view"],
        ["B-005 AppointmentRequests list/status"],
    ),
    S(
        "Health records tab",
        "views/HealthRecordsView.tsx",
        "useHealthRecordsController",
        "🟡",
        3,
        3,
        3,
        "M-011,M-012",
        "—",
        "Timeline + documents library",
        "Home tab records",
        [
            ("Timeline", "GET Patient/Timeline", "LIVE", "recordsApi"),
            ("Documents", "GET Patient/Documents", "LIVE", "recordsApi"),
            (
                "Prescription entry",
                "usePrescriptionController STATIC",
                "STATIC",
                "usePrescriptionController.ts:26-48",
            ),
        ],
        [
            ("Open upload", "UploadDocument", "Partial LIVE", "upload demo"),
            (
                "Delete document",
                "DELETE Documents/{id}",
                "NO-OP / UNUSED hook",
                "recordsApi delete unused",
            ),
        ],
        [("Null-hide timeline fields", "Yes", "Partial", "HealthRecordsView")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-011 Bind delete document + loading/empty/error",
            "M-012 Replace prescription static with Erx hooks",
        ],
        [],
    ),
    S(
        "Medicines tab",
        "views/MedicinesView.tsx",
        "useMedicinesController",
        "🟡",
        3,
        3,
        3,
        "M-013",
        "B-023,B-028",
        "Medicine order list entry",
        "Home tab medicines",
        [
            (
                "Orders",
                "GET Patient/MedicineOrders",
                "LIVE",
                "medicinesApi",
            ),
            (
                "Tracking id hardcode risk",
                "orderDetailsId ?? 'hm-3922'",
                "STATIC",
                "AppNavigator",
            ),
        ],
        [
            ("Open order / track", "nav", "Partial", "M-013"),
            (
                "Create order",
                "POST MedicineOrders",
                "UNUSED hook",
                "medicinesApi",
            ),
        ],
        [("Stable order ids", "Yes", "No hardcoded", "M-013")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-013 Remove hardcoded order id fallback; empty/error states"],
        ["B-023 Delivery address book", "B-028 Stable tracking contract"],
        "Payment ⏸",
    ),
    S(
        "Account",
        "views/AccountView.tsx",
        "useAccountController",
        "🟡",
        4,
        4,
        3,
        "M-014",
        "B-018,B-019",
        "Profile summary, menus, logout, data request",
        "Home tab account",
        [
            (
                "Profile",
                "GET PatientProfile/Me",
                "LIVE",
                "patientProfileApi",
            ),
            (
                "Release notes",
                "local appReleaseNotes",
                "STATIC",
                "useAccountController",
            ),
            (
                "Data request history",
                "none",
                "NO SOURCE",
                "B-018",
            ),
        ],
        [
            ("Update profile", "PUT PatientProfile/Me", "LIVE", "patientProfileApi"),
            (
                "Data request",
                "POST Patient/DataRequests",
                "LIVE",
                "useAccountController",
            ),
            (
                "Delete account",
                "DELETE Account",
                "NOT CALLED (correct)",
                "contract §10",
            ),
            ("Logout", "Account/Logout initiate", "LIVE", "session.ts"),
        ],
        [
            ("No delete-account call", "Yes", "Yes", "correct"),
            (
                "Astro/low-data toggles local",
                "Yes",
                "Yes",
                "LOCAL_BY_DESIGN",
            ),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-014 After data request show success only; no fake history"],
        [
            "B-018 DataRequests list optional",
            "B-019 Delete-account policy clarify",
        ],
    ),
    S(
        "Search doctors",
        "views/SearchDoctorsView.tsx",
        "useSearchDoctorsController",
        "🟡",
        3,
        3,
        2,
        "M-015",
        "B-009",
        "Category/city entry to search",
        "Home open search",
        [
            (
                "Care categories",
                "home categories / local",
                "PARTIAL",
                "useSearchDoctorsController",
            ),
            (
                "City options",
                "no FilterOptions API",
                "NO SOURCE / STATIC",
                "B-009",
            ),
        ],
        [("Submit query", "nav to results", "LOCAL", "AppNavigator")],
        [("Debounce search submit", "Nice", "UNVERIFIED", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-015 Drive cities/categories from API only; remove seed nearby doctors if any"
        ],
        ["B-009 GET Public/Doctors/FilterOptions"],
    ),
    S(
        "Search results",
        "views/SearchResultsView.tsx",
        "useSearchResultsController",
        "🟡",
        3,
        2,
        3,
        "M-016,M-017",
        "B-009,B-029",
        "Doctor cards + filters",
        "from SearchDoctors",
        [
            (
                "Results",
                "GET Public/Doctors params",
                "LIVE",
                "useSearchResultsController.ts:235-254",
            ),
            (
                "Default video+mr filters",
                "DEFAULT_DOCTOR_FILTERS",
                "STATIC_BUG",
                "models/search.ts:68-72",
            ),
            (
                "Modes from fees",
                "consultFeeTele null → no video",
                "LIVE filter",
                "useSearchResultsController.ts:275-281",
            ),
            (
                "yearsExperience/languages",
                "not returned",
                "HIDDEN-NULL",
                "contract §2",
            ),
        ],
        [
            (
                "Apply filters",
                "client + query params",
                "Partial LIVE",
                "teleOnly/minFee etc",
            ),
            ("Clear filters", "EMPTY_DOCTOR_FILTERS", "LOCAL", "controller"),
            (
                "Pagination next page",
                "pageNumber state",
                "Partial",
                "setPageNumber; load-more UNVERIFIED",
            ),
        ],
        [
            ("Default video empties list", "Bug", "Yes", "M-016"),
            ("Duplicate client+server filter", "Avoid", "Partial", "M-017"),
            ("minFee<=maxFee", "Yes", "UNVERIFIED", "—"),
        ],
        "Loading ☑ Empty ☑ Error ☐ (weak) Null ☑ 401 ☐ Offline ☐",
        [
            "M-016 Change DEFAULT_DOCTOR_FILTERS to empty; do not teleOnly by default",
            "M-017 Add error+retry; wire load-more; debounce q; cancel stale",
        ],
        ["B-009 FilterOptions", "B-029 careCategoryId param"],
    ),
    S(
        "Doctor profile",
        "views/DoctorProfileView.tsx",
        "useDoctorProfileController",
        "🟡",
        3,
        3,
        3,
        "M-018",
        "B-013,B-015",
        "About, fees, reviews, CTAs",
        "from search/home",
        [
            (
                "Profile",
                "GET Public/Doctors/{id}",
                "LIVE",
                "useDoctorProfileController",
            ),
            ("Fees", "GET Fees/Public/{id}", "LIVE", "doctorsApi"),
            ("Reviews", "GET Reviews/Doctor/{id}", "LIVE", "doctorsApi"),
            (
                "Legacy anjali seed",
                "getDoctorProfile when non-numeric",
                "STATIC",
                "AppNavigator doctorId ?? 'anjali'",
            ),
            (
                "yearsExperience",
                "always null",
                "HIDDEN-NULL",
                "contract",
            ),
            (
                "Ranking",
                "GET …/Ranking",
                "UNUSED hook",
                "doctorsApi",
            ),
        ],
        [
            ("Book", "nav book", "LIVE", "AppNavigator"),
            ("Ask for a time", "book waitlist/request", "Partial", "book controller"),
            ("Consult now", "nav", "STATIC offer path", "Consult now"),
        ],
        [
            ("Hide rating if reviewCount 0", "Yes", "Partial", "M-018"),
            ("Both fees labelled", "Yes", "Partial", "DoctorProfileView"),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-018 Ban 'anjali' default; numeric ids only; null-hide registration/university/rating"
        ],
        [
            "B-013 nextAvailableAt",
            "B-015 yearsExperience/languages/education decision",
        ],
    ),
    S(
        "Doctor credentials tab",
        "views/DoctorCredentialsTab.tsx",
        "via profile",
        "🟡",
        2,
        2,
        2,
        "M-019",
        "B-016",
        "Three credential blocks (regulatory)",
        "Doctor profile tab",
        [
            (
                "Recognised / Homeocentrum / CareLink",
                "seed + partial API",
                "STATIC/PARTIAL",
                "DoctorCredentialsTab + design.md §8",
            )
        ],
        [("—", "—", "—", "—")],
        [
            (
                "Keep 3 distinct sections",
                "Yes (compliance)",
                "Must preserve",
                "design system",
            )
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-019 Bind only real fields; hide empty blocks; never invent degrees"
        ],
        ["B-016 Structured qualifications optional"],
    ),
    S(
        "Book appointment",
        "views/BookAppointmentView.tsx",
        "useBookAppointmentController",
        "🟡",
        4,
        3,
        3,
        "M-020,M-021",
        "B-027",
        "Calendar, slots, book/book-as, ask-for-time",
        "from profile",
        [
            (
                "Slots",
                "GET Public/Doctors/{id}/Slots?date",
                "LIVE",
                "useBookAppointmentController",
            ),
            ("Fees", "Fees/Public + doctor", "LIVE", "useBookAppointmentController"),
            ("Family BookAs", "POST Family/BookAs", "LIVE", "bookingApi"),
            (
                "Doctor seed shell",
                "getDoctorProfile",
                "STATIC",
                "useBookAppointmentController",
            ),
        ],
        [
            (
                "Create booking",
                "POST Public/Doctors/{id}/Bookings",
                "LIVE",
                "useCreateBookingMutation",
            ),
            (
                "Appointment request",
                "POST Patient/AppointmentRequests",
                "LIVE",
                "appointmentRequestsApi",
            ),
            ("Join waitlist", "Waitlist/Join", "UNUSED", "bookingApi"),
            (
                "Proceed to payment",
                "nav fake pending",
                "DEFERRED_PAYMENT",
                "book controller TODO",
            ),
        ],
        [
            ("Double-submit guard", "Yes", "Partial", "M-020"),
            ("Empty slots → ask time", "Yes", "Partial", "M-021"),
            ("holdExpiresAt countdown", "Payment screen local", "Partial", "⏸"),
            ("Invalidate Slots/Visits", "Yes", "Yes", "bookingApi tags"),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-020 Double-submit guard + slot-taken error UX",
            "M-021 Remove seed doctor shell; slots empty → AppointmentRequests UX",
        ],
        ["B-027 Idempotency-Key on Bookings/AppointmentRequests"],
        "Payment ⏸",
    ),
    S(
        "Booking review",
        "views/BookingReviewView.tsx",
        "useBookingReviewController",
        "🟡",
        3,
        3,
        2,
        "M-022",
        "—",
        "Summary, attach docs, policy toggles",
        "book flow",
        [
            ("Draft summary", "nav draft", "LOCAL", "useBookingReviewController"),
            (
                "Library docs",
                "local state / prior uploads",
                "Partial",
                "BookingReviewView",
            ),
        ],
        [
            ("Upload open", "UploadDocument", "Partial", "demo upload"),
            ("Continue to payment", "nav", "DEFERRED_PAYMENT", "AppNavigator"),
        ],
        [("Policy toggles required", "Yes", "Partial", "controller")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-022 Bind document attach to real documentIds from API"],
        [],
        "Payment ⏸",
    ),
    S(
        "Booking payment",
        "views/BookingPaymentView.tsx",
        "useBookingPaymentController",
        "⏸",
        1,
        1,
        2,
        "M-P01",
        "B-P01,B-P02",
        "Pay methods + hold timer",
        "book flow",
        [
            (
                "Banks/wallets",
                "local config",
                "STATIC",
                "useBookingPaymentController",
            ),
            (
                "Razorpay key",
                "AppConfig.razorpayKeyId",
                "NOT USED",
                "AppConfigProvider",
            ),
            (
                "Consult order",
                "POST Payments/ConsultOrders",
                "UNUSED",
                "paymentsApi",
            ),
        ],
        [
            (
                "Pay",
                "simulated in AppNavigator",
                "NO-OP/STATIC",
                "AppNavigator payment timers",
            ),
            ("Verify", "POST Payments/Verify", "UNUSED", "paymentsApi"),
        ],
        [
            ("Hold countdown", "local SLOT_HOLD", "Partial", "controller"),
            ("Price breakdown full", "Required", "Partial labels", "compliance"),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-P01 TODO(PAYMENT): bind ConsultOrders + Razorpay keyId + Verify; no fake success"
        ],
        ["B-P01 ConsultOrders+Verify readiness", "B-P02 holdExpiresAt release"],
        "⏸ Deferred",
    ),
    S(
        "Payment status",
        "views/PaymentStatusView.tsx",
        "usePaymentStatusController",
        "⏸",
        1,
        2,
        2,
        "M-P02",
        "B-P01",
        "Success/fail confirmation + booking confirm",
        "after payment",
        [
            ("Status", "nav draft", "STATIC", "usePaymentStatusController"),
            (
                "Booking confirm local",
                "onConfirmBooking seed fields",
                "STATIC",
                "usePaymentStatusController",
            ),
        ],
        [("Confirm booking into home list", "local state", "LOCAL", "home merge")],
        [
            (
                "Idempotent confirm",
                "Yes",
                "ref confirmed",
                "usePaymentStatusController.ts:82-93",
            )
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-P02 TODO(PAYMENT): confirm from verify response only"],
        ["B-P01"],
        "⏸ Deferred",
    ),
    S(
        "Appointment detail",
        "views/AppointmentDetailView.tsx",
        "useAppointmentDetailController",
        "🟡",
        3,
        3,
        3,
        "M-023,M-024",
        "B-008,B-022",
        "Visit actions: cancel/reschedule/check-in/switch tele/late/join",
        "from appointments",
        [
            (
                "Visit detail",
                "GET Patient/Visits/{id}",
                "LIVE",
                "useAppointmentDetailController",
            ),
            (
                "consultFee/currency",
                "visit data",
                "LIVE/PARTIAL",
                "appointment detail controller",
            ),
            (
                "platformFee",
                "API null or value",
                "HIDDEN/INCOMPLETE",
                "PLATFORM_FEE constant still in config",
            ),
            (
                "Fee fallback consultFeeRupees",
                "config map",
                "STATIC",
                "useAppointmentDetailController",
            ),
        ],
        [
            ("Check-in", "POST …/CheckIn", "LIVE", "visitsApi"),
            ("Switch tele", "POST SwitchToTele", "LIVE", "visitsApi"),
            (
                "Running late",
                "POST Tele/Sessions/{id}/RunningLate",
                "LIVE",
                "needs teleSessionId",
            ),
            ("Cancel/Reschedule", "PatientAppointment/*", "LIVE", "visitsApi"),
            (
                "Join video",
                "DeviceCheck→Waiting→Video",
                "DEFERRED_VIDEO",
                "auto timer",
            ),
        ],
        [
            ("Status-based CTAs", "Yes", "Partial", "M-023"),
            (
                "Remove PLATFORM_FEE/consultFeeRupees",
                "Yes",
                "No",
                "M-024",
            ),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-023 Status gates for check-in/switch/late/join",
            "M-024 Delete fee constant fallbacks; null-hide platformFee/clinicPhone/reason",
        ],
        [
            "B-008 Guarantee teleSessionId on tele visits",
            "B-022 followUpDate / erx link on visit",
        ],
        "Video ⏸",
    ),
    S(
        "Clinic appointment",
        "views/ClinicAppointmentView.tsx",
        "useAppointmentDetailController",
        "🟡",
        3,
        3,
        3,
        "M-023",
        "B-008",
        "Clinic-specific CTAs for visit",
        "mode clinic",
        [("Same visit detail", "Visits/{id}", "LIVE", "visitsApi")],
        [
            (
                "Check-in / call clinic",
                "CheckIn / tel clinicPhone",
                "LIVE/PARTIAL",
                "ClinicAppointmentView",
            )
        ],
        [("clinicPhone null hide", "Yes", "Partial", "M-023")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-023"],
        ["B-008"],
    ),
    S(
        "Clinic check-in",
        "views/ClinicCheckInView.tsx",
        "props from appointmentDetail",
        "🟡",
        3,
        3,
        3,
        "M-025",
        "B-007",
        "EARLY|WAITING|READY + queue",
        "from clinic appointment",
        [
            (
                "queuePosition/readyAt",
                "CheckIn response",
                "LIVE/PARTIAL",
                "readyAt always null per contract",
            ),
            (
                "Demo status selector",
                "local",
                "STATIC",
                "appointmentDetail demo state",
            ),
        ],
        [("Submit check-in", "POST CheckIn", "LIVE", "visitsApi")],
        [("Reject tele/cancelled", "API", "Partial UX", "B-007")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-025 Remove demo status; show API queuePosition; hide readyAt when null"
        ],
        ["B-007 readyAt/queue refresh contract"],
    ),
    S(
        "Reschedule",
        "views/RescheduleAppointmentView.tsx",
        "appointmentDetail",
        "🟡",
        3,
        3,
        2,
        "M-026",
        "—",
        "Pick new slot/reason",
        "appointment detail",
        [
            (
                "Slots",
                "may reuse doctor slots / local days",
                "PARTIAL",
                "reschedule days local",
            )
        ],
        [
            (
                "Submit",
                "POST RescheduleAppointment",
                "LIVE",
                "visitsApi",
            )
        ],
        [("No past dates", "Yes", "Partial", "M-026")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-026 Slots strictly from API; validate date/time"],
        [],
    ),
    S(
        "Cancelled confirmation",
        "views/CancelledConfirmationView.tsx",
        "appointmentDetail",
        "🟡",
        3,
        3,
        3,
        "—",
        "—",
        "Cancel result",
        "after cancel",
        [("Message", "cancel response / i18n", "LIVE/LOCAL", "CancelledConfirmationView")],
        [("Done", "nav home", "LOCAL", "AppNavigator")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [],
        [],
    ),
    S(
        "Device check",
        "views/DeviceCheckView.tsx",
        "useDeviceCheckController",
        "⏸",
        1,
        1,
        2,
        "M-V01",
        "B-P10",
        "Pre-join network/camera check",
        "before waiting room",
        [
            (
                "Network quality",
                "mockNetworkCheck",
                "STATIC",
                "useDeviceCheckController.ts:46,89",
            ),
            (
                "Tele/DeviceCheck API",
                "GET Tele/DeviceCheck",
                "UNUSED",
                "teleApi",
            ),
        ],
        [("Continue", "nav waiting", "LOCAL", "AppNavigator")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-V01 TODO(VIDEO-SDK): real device check; no mock Mbps"],
        ["B-P10 DeviceCheck contract"],
        "⏸ Deferred",
    ),
    S(
        "Waiting room",
        "views/WaitingRoomView.tsx",
        "useWaitingRoomController",
        "⏸",
        1,
        1,
        2,
        "M-V02",
        "B-008,B-P11",
        "Wait for doctor before join",
        "after device check",
        [
            (
                "Queue/ETA",
                "i18n/local timer",
                "STATIC",
                "useWaitingRoomController",
            ),
            (
                "forceDoctorLate demo",
                "local",
                "STATIC",
                "useWaitingRoomController",
            ),
            (
                "Session",
                "GET Tele/Sessions/{id}",
                "UNUSED",
                "teleApi",
            ),
        ],
        [
            ("Join", "nav video / Token unused", "NO-OP API", "teleApi Token unused"),
            ("Running late display", "local", "STATIC", "controller"),
        ],
        [
            (
                "No fake queue from server facts",
                "Required",
                "Violated",
                "M-V02",
            )
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-V02 TODO(VIDEO-SDK): bind session status; remove demo late/fake ETA"
        ],
        ["B-008 teleSessionId", "B-P11 waiting-room status"],
        "⏸ Deferred",
    ),
    S(
        "Join failed",
        "views/JoinFailedView.tsx",
        "useJoinFailedController",
        "🟡",
        3,
        3,
        3,
        "M-V03",
        "—",
        "Report join failure",
        "join error path",
        [("—", "—", "—", "—")],
        [
            (
                "Report",
                "POST Tele/Sessions/{id}/JoinFailure",
                "LIVE",
                "useJoinFailedController",
            )
        ],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-V03 Ensure teleSessionId required; error UX"],
        [],
        "⏸ related",
    ),
    S(
        "Video call",
        "views/VideoCallView.tsx",
        "useVideoCallController",
        "⏸",
        1,
        1,
        1,
        "M-V04",
        "B-P12",
        "In-call UI",
        "from waiting room",
        [
            ("Call", "demo timers", "STATIC", "useVideoCallController"),
            ("Token", "POST …/Token", "UNUSED", "teleApi"),
        ],
        [("End call", "local", "LOCAL", "controller")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-V04 TODO(VIDEO-SDK): Agora/WebRTC with Token"],
        ["B-P12 Token/join/leave/reconnect"],
        "⏸ Deferred",
    ),
    S(
        "Consultation chat",
        "views/ConsultationChatView.tsx",
        "useConsultationChatController",
        "🟡",
        3,
        3,
        2,
        "M-027",
        "—",
        "Chat during/after consult",
        "tele flow",
        [
            (
                "Messages",
                "GET Tele/Chat/{sessionId}",
                "LIVE",
                "useConsultationChatController",
            ),
            ("Seed messages", "possible", "STATIC", "controller seed paths"),
        ],
        [("Send", "POST Tele/Chat", "LIVE", "teleApi")],
        [("Require sessionId", "Yes", "Partial", "M-027")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-027 Remove seed chat lines; empty state"],
        [],
    ),
    S(
        "Consultation complete",
        "views/ConsultationCompleteView.tsx",
        "useConsultationCompleteController",
        "🟡",
        3,
        3,
        3,
        "M-028",
        "—",
        "Summary after consult",
        "post call",
        [
            (
                "Summary",
                "GET Tele/Summary/{patientAppId}",
                "LIVE",
                "useConsultationCompleteController",
            )
        ],
        [("Rate / Rx / follow-up", "nav", "LOCAL", "AppNavigator")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-028 Null-hide missing summary fields; loading/error"],
        [],
    ),
    S(
        "Rate consultation",
        "views/RateConsultationView.tsx",
        "useRateConsultationController",
        "🟡",
        4,
        4,
        3,
        "M-029",
        "—",
        "Create review",
        "after complete",
        [("—", "—", "—", "—")],
        [
            (
                "Submit",
                "POST api/Reviews",
                "LIVE",
                "supportApi useCreateReviewMutation",
            )
        ],
        [
            ("Rating required", "Yes", "Yes", "controller"),
            ("Text optional rules", "Yes", "Partial", "controller"),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-029 Disable double submit; map 400 errors"],
        [],
    ),
    S(
        "Consult now",
        "views/ConsultNowView.tsx",
        "useConsultNowController",
        "❌",
        1,
        1,
        2,
        "M-030",
        "B-011",
        "Instant match UI",
        "Home CTA",
        [
            (
                "Offers/fees",
                "config consultNow + PLATFORM_FEE",
                "STATIC",
                "useConsultNowController + config/consultNow.ts",
            ),
            ("Instant API", "Tele/Instant*", "UNUSED", "teleApi"),
            (
                "Family members",
                "Family + Home",
                "LIVE",
                "member picker only",
            ),
        ],
        [
            ("Search match", "setTimeout", "STATIC", "useConsultNowController"),
            ("Accept offer → payment", "fake", "STATIC", "useConsultNowController"),
        ],
        [("No invented fees", "Required", "Violated", "M-030")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-030 Bind Tele/Instant after B-011; remove CONSULT_NOW_FEE/PLATFORM_FEE"
        ],
        ["B-011 Instant offer fee breakdown fields"],
        "Payment part ⏸",
    ),
    S(
        "Consult searching / unavailable / offer",
        "ConsultNow*View/Sheet",
        "useConsultNowController",
        "❌",
        1,
        1,
        2,
        "M-030",
        "B-011",
        "Match states for consult now",
        "consult now",
        [("Match state", "local timers/seeds", "STATIC", "controller")],
        [("Decline/accept", "local", "STATIC", "controller")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-030"],
        ["B-011"],
    ),
    S(
        "Prescription",
        "views/PrescriptionView.tsx",
        "usePrescriptionController",
        "❌",
        1,
        1,
        1,
        "M-031",
        "B-012",
        "Rx medicines + advice",
        "records / complete",
        [
            (
                "Medicines/advice",
                "MEDICINES/ADVICE constants",
                "STATIC",
                "usePrescriptionController.ts:26-48",
            ),
            (
                "Erx",
                "GET Erx/Patient/{id}",
                "UNUSED",
                "recordsApi",
            ),
            (
                "PDF",
                "Erx/{id}/Pdf",
                "UNVERIFIED shape",
                "B-012",
            ),
        ],
        [("Share/PDF", "stub", "NO-OP", "PrescriptionView")],
        [
            (
                "Immutability once signed",
                "Compliance",
                "N/A until live",
                "design.md",
            )
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-031 Bind Erx hooks; hide empty; no static meds"],
        ["B-012 Confirm PDF/share URL response"],
    ),
    S(
        "Consultation record",
        "views/ConsultationRecordView.tsx",
        "useConsultationRecordController",
        "❌",
        1,
        1,
        1,
        "M-032",
        "—",
        "Consultation note",
        "records",
        [
            (
                "Note",
                "GET Consultations/{id}/Note",
                "UNUSED",
                "recordsApi",
            )
        ],
        [("—", "—", "—", "—")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-032 Bind useGetConsultationNoteQuery"],
        [],
    ),
    S(
        "Upload document",
        "views/UploadDocumentView.tsx",
        "useUploadDocumentController",
        "🟡",
        2,
        2,
        2,
        "M-033",
        "—",
        "Pick files and upload",
        "records / booking / apt",
        [
            (
                "File list",
                "demo files",
                "STATIC",
                "addDemoFile useUploadDocumentController.ts:145-215",
            ),
            (
                "Upload",
                "POST Patient/Documents FormData",
                "LIVE on save",
                "useUploadDocumentController.ts:230-248 with fake uri",
            ),
        ],
        [
            (
                "Take photo/gallery/file",
                "addDemoFile",
                "STATIC",
                "useUploadDocumentController.ts:213-215",
            ),
            (
                "Save",
                "uploadDocumentApi",
                "LIVE attempt",
                "fake uri fails",
            ),
        ],
        [("Real picker + uri", "Required", "Missing", "M-033")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-033 expo-image-picker/document-picker; real FormData; remove fake progress"
        ],
        [],
    ),
    S(
        "Follow-up plan",
        "views/FollowUpPlanView.tsx",
        "useFollowUpPlanController",
        "🟡",
        3,
        3,
        2,
        "M-034",
        "—",
        "Follow-up tasks",
        "home/account",
        [
            ("Tasks", "GET Patient/FollowUps", "LIVE", "recordsApi"),
            ("Seeds", "possible leftover", "STATIC?", "controller"),
        ],
        [
            (
                "Complete",
                "POST FollowUps/{id}/Complete",
                "LIVE",
                "recordsApi",
            )
        ],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-034 Remove any seed tasks; empty state"],
        [],
    ),
    S(
        "Symptom diary",
        "views/SymptomDiaryView.tsx",
        "useSymptomDiaryController",
        "🟡",
        3,
        3,
        2,
        "M-035",
        "—",
        "Diary calendar + entries",
        "home overlay",
        [
            (
                "Entries",
                "GET Patient/Diary",
                "LIVE",
                "useSymptomDiaryController",
            ),
            (
                "SEED entries",
                "SEEDED_ENTRIES",
                "STATIC",
                "useSymptomDiaryController.ts:105-147",
            ),
            (
                "Fixed Aug 2026 week",
                "local",
                "STATIC",
                "useSymptomDiaryController.ts:91-103",
            ),
        ],
        [
            ("Create entry", "POST Patient/Diary", "LIVE", "symptomDiaryApi"),
            (
                "Update/Delete",
                "hooks exist",
                "UNUSED",
                "symptomDiaryApi",
            ),
        ],
        [("Prefer API over seed", "Yes", "Partial", "M-035")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-035 Delete SEEDED_ENTRIES; calendar from API dates; wire update/delete"
        ],
        [],
    ),
    S(
        "Symptom diary entry",
        "views/SymptomDiaryEntryView.tsx",
        "via diary",
        "🟡",
        3,
        3,
        2,
        "M-035",
        "—",
        "Add/edit diary form",
        "diary",
        [("Form", "local → POST Diary", "LIVE", "symptomDiaryApi")],
        [("Save", "POST Diary", "LIVE", "useCreateDiaryEntryMutation")],
        [("Validation severity", "Yes", "Partial", "entry view")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-035"],
        [],
    ),
    S(
        "Health insights",
        "views/HealthInsightsView.tsx",
        "useHealthInsightsController",
        "🟡",
        3,
        2,
        2,
        "M-036",
        "B-021b",
        "Progress summary / insights",
        "account",
        [
            (
                "Progress",
                "GET Patient/Progress",
                "LIVE",
                "useHealthInsightsController",
            ),
            (
                "adherencePercent",
                "null",
                "HIDDEN-NULL",
                "contract §4",
            ),
        ],
        [("Open CliniSight", "nav", "LOCAL", "AppNavigator")],
        [("No local series", "Yes", "Check", "M-036")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-036 Bind series only from API; empty-chart state; hide adherence null"
        ],
        ["B-021b adherencePercent store or drop"],
    ),
    S(
        "CliniSight progress",
        "views/CliniSightProgressView.tsx",
        "useCliniSightProgressController",
        "🟡",
        2,
        2,
        2,
        "M-037",
        "B-021b",
        "Chart + follow-up chips",
        "insights",
        [
            (
                "Progress series",
                "GET Progress (partial)",
                "PARTIAL",
                "useCliniSightProgressController.ts:79-94",
            ),
            (
                "FOLLOW_UPS chips",
                "local constants",
                "STATIC",
                "useCliniSightProgressController.ts:56-61",
            ),
            (
                "Chart caption 42/56",
                "hardcoded",
                "STATIC",
                "useCliniSightProgressController.ts:99-120",
            ),
        ],
        [("—", "—", "—", "—")],
        [("No fabricated series", "Required", "Violated", "M-037")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-037 Bind series/visitCount/followUps*; remove FOLLOW_UPS constants and 42/56"
        ],
        ["B-021b"],
    ),
    S(
        "Reminders centre",
        "views/RemindersCentreView.tsx",
        "useRemindersCentreController",
        "🟡",
        4,
        3,
        3,
        "M-038,M-039",
        "B-024",
        "Reminder list CRUD",
        "account/home",
        [
            (
                "List",
                "GET Patient/Reminders",
                "LIVE",
                "useRemindersCentreController.ts:131",
            ),
            (
                "Members",
                "aarav/self seed labels",
                "STATIC",
                "useRemindersCentreController",
            ),
            ("Quiet hours", "local state", "LOCAL", "controller"),
        ],
        [
            ("Create/Update", "POST/PUT Reminders", "LIVE", "remindersApi"),
            (
                "Delete",
                "DELETE Reminders/{id}",
                "UNUSED",
                "remindersApi",
            ),
            (
                "Local notifications",
                "should schedule from API",
                "UNVERIFIED",
                "LOCAL_BY_DESIGN",
            ),
        ],
        [
            ("PUT full body incl isDone", "Yes", "Partial", "M-038"),
            (
                "Infinite loop fix EMPTY_REMINDERS",
                "Yes",
                "Done",
                "useRemindersCentreController EMPTY_REMINDERS",
            ),
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-038 Wire DELETE; PUT full body; weekdays chips from API",
            "M-039 Member picker from Family API; reschedule local notifs after CRUD",
        ],
        ["B-024 Snooze + server push schedule optional"],
    ),
    S(
        "Notifications",
        "views/NotificationsView.tsx",
        "useNotificationsController",
        "🟡",
        3,
        3,
        2,
        "M-040,M-041",
        "B-006,B-025",
        "Inbox list",
        "bell",
        [
            (
                "Items",
                "GET Notifications",
                "LIVE after load",
                "useNotificationsController",
            ),
            (
                "SEED initial",
                "SEED constant",
                "STATIC",
                "useNotificationsController.ts:54-127",
            ),
            (
                "type/deepLink",
                "absent in contract",
                "NO SOURCE",
                "client title heuristics",
            ),
        ],
        [
            (
                "Mark read",
                "PATCH Notifications/{id}",
                "LIVE",
                "notificationsApi",
            ),
            (
                "Mark all read",
                "POST MarkAllRead",
                "UNUSED (loops PATCH)",
                "useNotificationsController",
            ),
        ],
        [("Use data.marked", "Yes", "No", "M-040")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-040 Call MarkAllRead; remove SEED; empty state",
            "M-041 Keep client category until B-006",
        ],
        ["B-006 type+deepLink", "B-025 pagination"],
    ),
    S(
        "Notification settings",
        "views/NotificationSettingsView.tsx",
        "useNotificationSettingsController",
        "🟡",
        4,
        4,
        3,
        "M-042",
        "—",
        "Prefs GET/PUT",
        "from notifications",
        [
            (
                "Prefs",
                "GET/PUT Notifications/Preferences",
                "LIVE",
                "useNotificationSettingsController.ts:142-207",
            ),
            (
                "reminderOffsets parse",
                "string minutes",
                "LIVE",
                "controller",
            ),
        ],
        [("Persist toggles", "PUT full object", "LIVE", "notificationsApi")],
        [("Quiet hours rules", "Yes", "Partial", "M-042")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-042 Validate quietStart/End; disable save while in-flight"],
        [],
    ),
    S(
        "Order medicines",
        "views/OrderMedicinesView.tsx",
        "useOrderMedicinesController",
        "🟡",
        2,
        2,
        2,
        "M-043",
        "B-023",
        "Start medicine order / choose pharmacy",
        "medicines",
        [
            (
                "Sellers via choose pharmacy",
                "Pharmacy/Sellers",
                "LIVE",
                "useChoosePharmacyController",
            ),
            ("Address book", "none", "NO SOURCE", "B-023"),
        ],
        [
            (
                "Create MedicineOrder",
                "POST MedicineOrders",
                "UNUSED",
                "medicinesApi",
            ),
            (
                "Pay",
                "Payments/MedicineOrders",
                "USED in checkout / DEFERRED gateway",
                "useMedicineCheckoutController",
            ),
        ],
        [
            (
                "No cheapest/fastest on null metrics",
                "Yes",
                "Yes",
                "choose pharmacy",
            )
        ],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-043 Wire create order; hide quote metrics when null"],
        ["B-023 addresses"],
        "Payment ⏸",
    ),
    S(
        "Choose pharmacy",
        "views/ChoosePharmacyView.tsx",
        "useChoosePharmacyController",
        "🟡",
        4,
        3,
        3,
        "M-044",
        "B-010",
        "Seller list name+area",
        "order medicines",
        [
            (
                "Sellers",
                "GET Pharmacy/Sellers",
                "LIVE",
                "useChoosePharmacyController.ts:76-97",
            ),
            (
                "price/eta/distance",
                "null",
                "HIDDEN-NULL",
                "contract §10",
            ),
        ],
        [
            ("Select seller", "local callback", "LOCAL", "controller"),
            ("Sort by price", "no-op on null", "LOCAL", "controller"),
        ],
        [("Never invent cheapest", "Yes", "Yes", "controller")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        [
            "M-044 Empty/error/retry; area query from user location if product wants"
        ],
        ["B-010 Store quote fields or formalize quote-after-order"],
    ),
    S(
        "Medicine checkout",
        "views/MedicineCheckoutView.tsx",
        "useMedicineCheckoutController",
        "⏸",
        2,
        2,
        2,
        "M-P03",
        "B-P03",
        "Pay for medicine order",
        "order flow",
        [
            (
                "Pay mutation",
                "POST Payments/MedicineOrders",
                "LIVE hook",
                "medicinesApi",
            ),
            (
                "Gateway",
                "keyId/gatewayReady",
                "PARTIAL",
                "DEFERRED checkout UI",
            ),
        ],
        [("Pay", "mutation", "PARTIAL", "useMedicineCheckoutController")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-P03 TODO(PAYMENT): Razorpay from AppConfig + gatewayReady"],
        ["B-P03 MedicineOrders payment readiness"],
        "⏸ Deferred",
    ),
    S(
        "Order tracking",
        "views/OrderTrackingView.tsx",
        "useOrderTrackingController",
        "🟡",
        3,
        2,
        2,
        "M-045",
        "B-028",
        "Tracking status",
        "orders",
        [
            (
                "Tracking",
                "GET MedicineOrders/{id}/Tracking",
                "LIVE",
                "useOrderTrackingController.ts:65",
            ),
            (
                "Hardcoded order id risk",
                "hm-3922",
                "STATIC",
                "AppNavigator",
            ),
        ],
        [("—", "—", "—", "—")],
        [("Map server status", "Yes", "Partial", "controller")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-045 Require real order id; loading/error"],
        ["B-028"],
    ),
    S(
        "Order details",
        "views/OrderDetailsView.tsx",
        "useOrderDetailsController",
        "🟡",
        3,
        3,
        2,
        "M-045",
        "—",
        "Order detail + refill",
        "orders",
        [("Detail", "from list/nav", "PARTIAL", "OrderDetailsView")],
        [
            (
                "Request refill",
                "POST Erx/Refills",
                "LIVE",
                "useOrderDetailsController",
            )
        ],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-045"],
        [],
    ),
    S(
        "My reviews",
        "views/MyReviewsView.tsx",
        "useMyReviewsController",
        "🟡",
        4,
        3,
        3,
        "M-046",
        "B-017",
        "Patient reviews list",
        "account",
        [
            (
                "Reviews",
                "GET Reviews/Mine",
                "LIVE",
                "useMyReviewsController.ts:62-86",
            ),
            (
                "Appeal status",
                "not in payload",
                "NO SOURCE",
                "B-017",
            ),
        ],
        [("Open appeal", "nav", "LIVE", "AppNavigator")],
        [("Empty array = no reviews", "Yes", "Yes", "contract §5")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-046 Loading/error/retry; status labels"],
        ["B-017 Appeal status/outcome fields"],
    ),
    S(
        "Appeal review",
        "views/AppealReviewView.tsx",
        "useAppealReviewController",
        "🟡",
        4,
        4,
        3,
        "M-047",
        "B-017",
        "Appeal a review",
        "from my reviews",
        [("—", "—", "—", "—")],
        [
            (
                "Submit",
                "POST Reviews/{id}/Appeal reason≥3",
                "LIVE",
                "useAppealReviewController",
            )
        ],
        [("Trim length ≥3", "Yes", "Yes", "controller")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-047 Disable while in-flight; show API message"],
        ["B-017"],
    ),
    S(
        "Help centre",
        "views/HelpCentreView.tsx",
        "useHelpCentreController",
        "🟡",
        3,
        3,
        3,
        "M-048",
        "B-003,B-020b",
        "FAQ topics + support contacts",
        "account",
        [
            (
                "Support contacts",
                "AppConfig support*",
                "LIVE null-hide",
                "AppConfigProvider + help controller",
            ),
            (
                "Help articles",
                "GET Help prefetch unused in UI",
                "PARTIAL",
                "useHelpCentreController.ts:91",
            ),
            (
                "HELP_TOPICS taxonomy",
                "local",
                "STATIC",
                "useHelpCentreController.ts:51-77",
            ),
        ],
        [
            (
                "tel/wa/mailto",
                "from AppConfig",
                "LIVE",
                "AppConfigProvider.tsx:61-74",
            ),
            ("Open article by slug", "GET Help/{slug}", "UNUSED", "supportApi"),
        ],
        [("Hide contacts when null", "Yes", "Yes", "AppConfigProvider")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-048 Render GET /api/Help articles; bind slug detail"],
        [
            "B-003 Populate supportPhone/WhatsApp/Email",
            "B-020b Help taxonomy slugs",
        ],
    ),
    S(
        "Raise ticket",
        "views/RaiseTicketView.tsx",
        "useRaiseTicketController",
        "🟡",
        3,
        3,
        3,
        "M-049",
        "—",
        "Create support ticket",
        "help",
        [
            (
                "Topics",
                "local MEDICINE_ISSUES",
                "STATIC",
                "useRaiseTicketController",
            )
        ],
        [
            ("Submit", "POST Support/Tickets", "LIVE", "supportApi"),
            ("My tickets", "GET Tickets/Mine", "UNUSED", "supportApi"),
        ],
        [("canSubmit validation", "Yes", "Yes", "useRaiseTicketController")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-049 After create show ticket id; optional bind Tickets/Mine"],
        [],
    ),
    S(
        "Book with help",
        "views/BookWithHelpView.tsx",
        "useBookWithHelpController",
        "🟡",
        3,
        3,
        3,
        "M-050",
        "B-003",
        "Assistance request",
        "help/home",
        [
            (
                "Support contacts",
                "AppConfig",
                "LIVE",
                "useBookWithHelpController",
            )
        ],
        [
            (
                "Request assistance",
                "POST Support/AssistanceRequest",
                "LIVE",
                "supportApi",
            )
        ],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-050 Loading/error; no hardcoded phone"],
        ["B-003"],
    ),
    S(
        "Legal document",
        "views/LegalDocumentView.tsx",
        "useLegalDocumentController",
        "🟡",
        2,
        2,
        2,
        "M-051",
        "—",
        "Terms/privacy content",
        "account",
        [
            (
                "Terms",
                "GET Public/Policies/Terms unused?",
                "PARTIAL",
                "bookingApi getTerms UNUSED",
            ),
            (
                "Local legal copy",
                "i18n/assets",
                "STATIC",
                "useLegalDocumentController",
            ),
        ],
        [("—", "—", "—", "—")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-051 Bind Terms policy API or confirm local legal OK"],
        [],
    ),
    S(
        "Health tip article",
        "views/HealthTipArticleView.tsx",
        "useHealthTipController",
        "🟡",
        4,
        3,
        3,
        "M-052",
        "—",
        "Article detail",
        "home tips",
        [
            (
                "Article",
                "GET Public/Articles/{id}",
                "LIVE",
                "useHealthTipController",
            ),
            ("List", "Articles page", "LIVE", "homeApi"),
        ],
        [("—", "—", "—", "—")],
        [("Pagination on list", "Partial", "home pageSize 10", "homeApi")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-052 Loading/error/null image hide"],
        [],
    ),
    S(
        "Payments history",
        "views/PaymentsView.tsx",
        "usePaymentsController",
        "🟡",
        3,
        3,
        2,
        "M-053",
        "—",
        "Past payments",
        "account",
        [
            (
                "History",
                "GET Patient/Payments",
                "LIVE",
                "usePaymentsController",
            )
        ],
        [
            (
                "Open detail/invoice",
                "none",
                "NO ENDPOINT",
                "Phase2 invoices",
            )
        ],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-053 Empty/error; formatMoney null-hide"],
        [],
        "Invoices ⏸",
    ),
    S(
        "Consent centre",
        "views/ConsentCentreView.tsx",
        "useConsentCentreController",
        "🟡",
        4,
        3,
        3,
        "M-005",
        "B-019",
        "Manage consents post-onboarding",
        "account",
        [
            (
                "Same as Consent",
                "Patient/Consents",
                "LIVE",
                "useConsentCentreController",
            )
        ],
        [
            (
                "Grant/Withdraw/DataRequest",
                "same routes",
                "LIVE",
                "consentApi",
            )
        ],
        [("Caregiver 409", "Yes", "Needs UX", "M-005")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-005"],
        ["B-019"],
    ),
    S(
        "Offline mode",
        "views/OfflineModeView.tsx",
        "useOfflineModeController",
        "📱",
        3,
        3,
        3,
        "M-054",
        "B-003",
        "Low-data / offline guidance + support",
        "settings",
        [
            ("Support", "AppConfig", "LIVE", "useOfflineModeController"),
            ("Mode toggle", "local", "LOCAL", "controller"),
        ],
        [("Contact support", "tel/wa/mailto", "LIVE", "AppConfigProvider")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-054 Hide contacts when null"],
        ["B-003"],
    ),
    S(
        "Consult now unavailable",
        "views/ConsultNowUnavailableView.tsx",
        "via ConsultNow",
        "❌",
        1,
        1,
        2,
        "M-030",
        "B-011",
        "No match",
        "consult now",
        [("—", "local", "STATIC", "ConsultNowUnavailableView")],
        [("Retry/back", "local", "LOCAL", "controller")],
        [("—", "—", "—", "—")],
        "Loading ☐ Empty ☐ Error ☐ Null ☐ 401 ☐ Offline ☐",
        ["M-030"],
        ["B-011"],
    ),
]


def main() -> None:
    vc = Counter(s["verdict"] for s in screens)
    non_def = [s for s in screens if s["verdict"] != "⏸"]
    fully = sum(1 for s in non_def if s["verdict"] == "✅")
    pct = round(100 * fully / len(non_def), 1) if non_def else 0
    all_m, all_b = set(), set()
    for s in screens:
        for x in (s["Ms"] or "").split(","):
            x = x.strip()
            if x.startswith("M"):
                all_m.add(x)
        for x in (s["Bs"] or "").split(","):
            x = x.strip()
            if x.startswith("B"):
                all_b.add(x)

    parts: list[str] = []
    parts.append(f"""# Patient App — Status Report (deep end-to-end audit)

| Field | Value |
|---|---|
| **Date** | 2026-10-17 |
| **Branch / commit** | `Devlopment_1.1` @ `48d7507` |
| **Contract** | `docs/audit/PatientMobile_Bind_APIs.md` |
| **Prior inputs (read, not edited)** | `docs/audit/01_discovery.md`, `02_screen_log.md`, `04_static_rescan.md`, `docs/backend/PatientApp_Backend_API_Requirements.md` |
| **Evidence** | `docs/audit/evidence/` |
| **Code changes in this audit** | **None** under `src/` |

---

## 1. Executive summary

- **Screens / overlays analysed:** {len(screens)} (plus nested sheets inside views).
- **Verdicts:** ✅ {vc.get('✅',0)} · 🟡 {vc.get('🟡',0)} · ❌ {vc.get('❌',0)} · ⏸ {vc.get('⏸',0)} · 📱 {vc.get('📱',0)}.
- **% fully dynamic (excluding ⏸):** {pct}% ({fully}/{len(non_def)}) — **overall: NOT YET**.
- **Base URL:** Contract + `apiConfig.ts` default = `https://devapi.homeocentrum.com/`; **runtime** `app.json` `extra.apiBaseUrl` = `https://devmaigrationapi.homeocentrum.com/` (**mismatch** — B-001).
- **Endpoints:** ~127 defined; ~52 used from UI; ~75 unused hooks; payment/tele token deferred.
- **Static bugs (high-signal):** default search video filter; Consult Now fees; prescription constants; upload demo files; notifications SEED; CliniSight hardcoded captions; `anjali` default id; PLATFORM_FEE=90 still in config.
- **Open work (scorecard refs):** ~{len(all_m)} mobile item ids · ~{len(all_b)} backend item ids (canonical catalogues in §11 + companion files).
- **Quality gates:** `yarn typecheck` exit 0; `yarn lint` exit 0; no unit-test script (`A7_*` evidence).

**What to do next:**
1. Fix runtime base URL / confirm host (B-001) before more bind work.
2. Ship P1 mobile fixes that need no backend: M-016 search defaults, M-024 fee fallbacks, M-033 real upload, M-040 MarkAllRead, M-031/M-032 Erx/note bind.
3. Backend: B-003 support contacts, B-005 appointment-request status, B-008 teleSessionId, B-011 instant fees, B-012 Erx PDF.
4. Keep payment + video behind TODO(PAYMENT)/TODO(VIDEO-SDK); do not block other screens.
5. Re-run static scan after mobile pass; update this report.

---

## 2. Scorecard

| Screen | Verdict | Data | Logic | States | Open M | Open B |
|---|---|---|---|---|---|---|
""")
    for s in screens:
        parts.append(
            f"| {s['name']} | {s['verdict']} | {s['d']}/5 | {s['l']}/5 | {s['s']}/5 | {s['Ms']} | {s['Bs']} |\n"
        )

    parts.append("""
---

## 3. End-to-end flow status

### Discover → book → visit → Rx
| Step | Status |
|---|---|
| Discover doctor (Home/Search) | 🟡 (API live; default video filter empties search) |
| Doctor profile | 🟡 (live for numeric ids; `anjali` seed) |
|Slots | ✅/🟡 |
| Booking create | ✅ |
| Payment | ⏸ |
| Visit detail | 🟡 |
| Check-in / switch tele | 🟡 |
| Video join | ⏸ |
| Prescription | ❌ |
| Progress / follow-up | 🟡 |

### Ask-for-a-time
| POST AppointmentRequests | ✅ |
| Patient list/status | ❌ B-005 |

### Reminders / Reviews / Pharmacy / Data request
Reminders 🟡 · Reviews 🟡 · Pharmacy 🟡 · DataRequest POST ✅ / no history

---

## 4. Screen-by-screen analysis

""")
    for s in screens:
        parts.append(f"### {s['name']} — `src/{s['view']}`\n")
        parts.append(f"**Controller:** `{s['ctrl']}`\n")
        parts.append(f"**Purpose / entry point:** {s['purpose']} · {s['entry']}\n")
        parts.append(f"**Verdict:** {s['verdict']}\n")
        parts.append(
            f"**Score:** Data binding {s['d']}/5 · Business logic {s['l']}/5 · States {s['s']}/5\n\n"
        )
        parts.append("#### B.1 Data read — field by field\n\n")
        parts.append("| UI element | Source (route + field) | Status | Evidence |\n|---|---|---|---|\n")
        for row in s["b1"]:
            parts.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} |\n")
        parts.append("\n#### B.2 Actions\n\n")
        parts.append("| Action | Route + method + params | Status | Evidence |\n|---|---|---|---|\n")
        for row in s["b2"]:
            parts.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} |\n")
        parts.append("\n#### B.3 Business logic\n\n")
        parts.append("| Rule | Required? | Implemented? | Evidence / gap |\n|---|---|---|---|\n")
        for row in s["b3"]:
            parts.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} |\n")
        parts.append(f"\n#### B.4 States\n{s['states']}\n\n")
        parts.append("#### B.5 Remaining work\n**Mobile:**\n")
        for m in s["rem_m"] or ["—"]:
            parts.append(f"- {m}\n")
        parts.append("**Backend:**\n")
        for b in s["rem_b"] or ["—"]:
            parts.append(f"- {b}\n")
        if s["deferred"]:
            parts.append(f"**Deferred:** {s['deferred']}\n")
        parts.append(f"**Open questions:** {s['questions']}\n\n---\n\n")

    parts.append("""## 5. Endpoint coverage matrix

See `docs/audit/evidence/A3_endpoint_hooks_summary.md` and `A4_contract_mapping.md`.

## 6. Business-logic matrix

| Rule | Screen | Implemented? | Item |
|---|---|---|---|
| Default search not teleOnly | Search | No | M-016 |
| No PLATFORM_FEE=90 | Visit/Consult | No | M-024,M-030 |
| MarkAllRead | Notifications | No | M-040 |
| Prescription not static | Prescription | No | M-031 |
| Progress not fabricated | CliniSight | No | M-037 |
| No DELETE Account | Account | Yes | — |

## 7–10. Cross-cutting / static / local / deferred

See evidence files `A5_static_register.md`, deferred table in companion backend Phase 2 section.

## 11. Work split

Mobile prompt: `docs/audit/PATIENT_MOBILE_TODO_PROMPT.md`.
Backend change request: `docs/backend/PatientApp_Backend_Change_Request.md`.

**P1 mobile today:** M-016, M-018, M-024, M-031, M-032, M-033, M-035, M-037, M-040, M-005, M-007, M-020, M-025, M-027.
**P1 backend:** B-001…B-012 (see backend file).

## 12. QA checklist

Empty/null/400/403/404/401-empty/slow/offline/double-tap book/slot taken/check-in on tele/consent 409/search clear filters.

## 13. Quality gates

typecheck PASS · lint PASS · tests N/A · build not run — logs in `docs/audit/evidence/A7_*`.

## 14. Appendix

Methodology: read-only. UNVERIFIED: Help article UI bind, local notif scheduling, search load-more, statusMaps fallback, platformFee UI row.
""")

    Path("docs/audit/PATIENT_APP_STATUS_REPORT.md").write_text("".join(parts))
    print("OK", len(screens), "chars", len("".join(parts)), dict(vc), "pct", pct)


if __name__ == "__main__":
    main()
