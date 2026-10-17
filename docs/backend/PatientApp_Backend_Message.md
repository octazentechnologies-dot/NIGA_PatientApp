# Patient app — backend change request

This note is for the backend developer. The full spec is `PatientApp_Backend_Change_Request.md`. The tracker is `PatientApp_Backend_Change_Request.csv`. The app audit is `docs/audit/PATIENT_APP_STATUS_REPORT.md` (2026-10-17).

The app already calls `https://devapi.homeocentrum.com/` with `Authorization: Bearer <token>` from OTP verify. Patient id comes from the token. Please do not add a second copy of a route that already exists.

Build these five first:

1. **B-003** — Put real `supportPhone`, `supportWhatsApp`, and `supportEmail` on `GET /api/Public/AppConfig` when you want them shown. Leave them `null` to hide the buttons. Do not expect the app to hardcode a clinic number.
2. **B-004** — Add `instantConsultEnabled` and `medicineOnlinePayEnabled` on that same AppConfig object. The app will hide Consult now and medicine online pay when the flag is `false` or `null`.
3. **B-005** — The patient can `POST /api/Patient/AppointmentRequests` but cannot list or answer a proposed time. Add list, status, and respond on that resource.
4. **B-008** — Tele visits need `teleSessionId` on `GET /api/Patient/Visits` and `GET /api/Patient/Visits/{patientAppId}`, or the app must keep Join and Running late hidden.
5. **B-011** — `POST /api/Tele/Instant` is unused because the offer has no fee breakdown. Add `consultFee`, `platformFee`, and `currency` (nullable). The app will not invent ₹ amounts.

Also answer **B-002**: is the Bearer token from `POST /api/PatientAuth/VerifyOtp` or from `POST /api/Account/Login`? The app uses VerifyOtp today.

Payment (`ConsultOrders`, `Verify`, medicine pay) and video (`DeviceCheck`, session, Token) are Phase 2. Do not block the five items above on them.

Reply per id: **done / not planned / ETA / question**.
