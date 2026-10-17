# Phase 4 — Static-data re-scan (2026-10-17)

Contract: `docs/audit/PatientMobile_Bind_APIs.md`.

## Cleared / reduced this session

| Area | Was | Now |
|---|---|---|
| Doctor profile fees / rating / registration | Seed fees, invented years/languages | API fees + null-hide rating/reg |
| Search results | `RESULTS` seed fallback | API-only mapping |
| Home articles / categories | `CARE_CATEGORIES` + `healthTips` seeds | CareCategories + Public/Articles |
| Instant fee on home card | `CONSULT_NOW_FEE_RUPEES` | Removed from card |
| Clinic address / tel / queue | Hardcoded Pune / +91 / queue=2 | Visit detail null-hide |
| My reviews | Hardcoded Anjali/Rajesh rows | `Reviews/Mine` |
| Appeal | Local submit only | `Reviews/{id}/Appeal` |
| Reminders | Doctor/astro seeds | `Patient/Reminders` |
| Notification prefs | Local DEFAULT_PREFS | Preferences GET/PUT |
| Pharmacy | Price/ETA seeds | Sellers name + area only |
| Ask for time | Legacy waitlist mutation | `AppointmentRequests` |

## Remaining static / deferred (intentional or TODO)

| Area | Notes |
|---|---|
| `TODO(PAYMENT)` | ConsultOrders / MedicineOrders / Razorpay Checkout |
| `TODO(VIDEO-SDK)` | Device check, waiting room ETA, video call timers |
| Consult now | Still uses `PLATFORM_FEE_RUPEES` / local match fees |
| Medicine checkout / review order / order details | Hardcoded ₹90 / ₹310 |
| Payments ledger seed amounts | Fallback rows still seeded |
| Clinic check-in UI | Still three demo variants; mutations live |
| Search entry | Local care-category images |
| Help topics | Local taxonomy (CMS slug map missing) |
| `consultFeeRupees` helper | Still used for refund estimate when visit fee absent |
| Q-ENV-1 | App base URL remains `devmaigrationapi` (not silently switched) |

## Ban check

- No new `PLATFORM_FEE = 90` inventions on booking/profile paths.
- Null API fields hide rows (fees, rating, clinic phone, pharmacy price, article image).
