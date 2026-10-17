# A4 — Contract mapping (PatientMobile_Bind_APIs.md §§1–10)

| Route | Status | Notes |
|---|---|---|
| GET /api/Public/AppConfig | BOUND_OK | AppConfigProvider; support null-hide |
| GET /api/Public/Doctors | BOUND_OK / PARTIAL | Home+Search; default video filter client-side |
| GET /api/Public/Doctors/{id} | BOUND_OK | Doctor profile numeric ids |
| GET …/Slots | BOUND_OK | Book appointment |
| POST …/Bookings | BOUND_OK | createBooking; payment deferred after |
| GET Visits / Visits/{id} | BOUND_OK / PARTIAL | platformFee UI incomplete; fee fallbacks |
| POST …/CheckIn | BOUND_OK | appointment detail |
| POST SwitchToTele | BOUND_OK | |
| POST …/RunningLate | BOUND_OK | needs teleSessionId |
| POST AppointmentRequests | BOUND_OK | no list/status route |
| GET Progress | BOUND_OK / PARTIAL | series not fully chart-bound; static follow-up chips |
| GET Reviews/Mine + Appeal | BOUND_OK | |
| Reminders CRUD | BOUND_OK / PARTIAL | DELETE unused; quiet hours local |
| Notifications GET/PATCH/Prefs | BOUND_OK / PARTIAL | SEED boot; MarkAllRead unused; no type/deepLink |
| Pharmacy/Sellers | BOUND_OK | null metrics hidden |
| Articles list/detail | BOUND_OK | |
| Payments ConsultOrders | NOT_BOUND (DEFERRED) | hooks exist unused |
| Tele Token | NOT_BOUND (DEFERRED) | |
| DataRequests POST | BOUND_OK | no list |
