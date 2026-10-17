# Patient app — bind these New API routes

Give this file to Cursor in the **patient** mobile repo (`NIGA_PatientApp`). Bind the screens to these routes. Do not add clinical numbers, names, fees, phones, or photo URLs in the app. If a field is `null`, hide that row.

The New API already implements these routes. This file does not change the app by itself.

## How to call the API

- Base URL is `https://devapi.homeocentrum.com/`. That host is the deployed New API. Paths below start with `/api`. Set `API_CONFIG.new.baseUrl` to that origin.
- Send `Authorization: Bearer <token>` from `POST /api/Account/Login` → `data.token`, except `GET /api/Public/AppConfig` and `GET /api/Public/Doctors`.
- JSON is camelCase. `null` is sent.
- Success body is usually `{ "success": true, "data": ... }`.
- Failure body is `{ "success": false, "code": "FORBIDDEN", "message": "..." }` with HTTP 400, 403, or 404. Missing token is HTTP 401 with an empty body.
- Patient routes resolve the patient from the token (`RoleName = Patient` and the patient-user map). Do not send another patient's id.

Sample people below are fictitious. Replace nothing in the UI with these names.

## 1. App config (no token)

`GET /api/Public/AppConfig`

```json
{
  "success": true,
  "data": {
    "razorpayKeyId": "rzp_test_example",
    "siteUrl": "http://localhost:3000",
    "supportPhone": null,
    "supportWhatsApp": null,
    "supportEmail": null
  }
}
```

`GET /api/App/Config` is the same body. Use `razorpayKeyId` for Checkout. `supportPhone`, `supportWhatsApp`, and `supportEmail` stay `null` until server config sets them. Do not substitute a clinic phone. The response does not include `instantConsultEnabled` or `medicineOnlinePayEnabled`.

## 2. Doctor directory — extra fields

Existing `GET /api/Public/Doctors` and `GET /api/Public/Doctors/{doctorId}`.

New query parameters on the list:

| Query | Meaning |
| --- | --- |
| `qualification` | Matches the qualification name |
| `sortBy` | `online` (default), `name`, or `fee` |
| `q`, `city`, `isOnline`, `teleOnly`, `minFee`, `maxFee`, `pageNumber`, `pageSize` | Unchanged |

New fields on each card and on the profile:

| Field | Source |
| --- | --- |
| `photoUrl` | Absolute `https://<api-host>/api/Profile/Photo/{doctorId}` when `photoPath` is stored. Otherwise `null`. |
| `registrationNumber` | Certificate number on the doctor row. `null` when empty. |
| `passingUniversity` | University on the doctor row. `null` when empty. |
| `yearsExperience` | Always `null`. The doctor row has no years-of-practice column. |
| `languages`, `education` | Not returned. Do not invent a language list or a degree list. |
| `consultFeeInClinic`, `consultFeeTele` | Stored fees. Show them. Do not replace with a fixed rupee label. |
| `averageRating`, `reviewCount` | Approved reviews. `averageRating` is `null` when `reviewCount` is 0. |

```json
{
  "doctorId": 104,
  "displayName": "Meera Joshi",
  "qualification": "BHMS",
  "city": "Pune",
  "clinicName": "Joshi Clinic",
  "consultFeeInClinic": 700,
  "consultFeeTele": 500,
  "isOnline": true,
  "verified": true,
  "photoPath": "doctor_104.jpg",
  "photoUrl": "https://api.example.com/api/Profile/Photo/104",
  "registrationNumber": "BHMS-10421",
  "passingUniversity": "Example Homeopathic Medical College",
  "yearsExperience": null,
  "averageRating": 4.6,
  "reviewCount": 12
}
```

Bind in `src/store/api/new/doctorsApi.ts`. Remove hardcoded fee labels such as `₹500` on the home screen and the consult-now fee constant. Read `consultFeeTele` or `consultFeeInClinic` from this card.

## 3. Visit detail — fees and clinic

Existing `GET /api/Patient/Visits/{patientAppId}`.

Added fields inside `data`:

| Field | Meaning |
| --- | --- |
| `consultFee` | Doctor tele fee when `isTele` is true, otherwise the in-clinic fee. `null` if the doctor has no fee stored. |
| `currency` | Doctor fee currency. `null` when the profile has none. |
| `platformFee` | `null`, unless a CONSULT payment for this visit is greater than `consultFee`. Then it is payment amount minus `consultFee`. Never send a fixed 90. |
| `clinicPhone` | Doctor mobile on the profile. `null` when empty. |
| `reasonText` | Latest chief complaint on that patient's case with this doctor. `null` when none exists. |

`doctorPhotoUrl` stays a path (`/api/Profile/Photo/{doctorId}`). Prefix the New API origin when you render it.

Bind in `src/store/api/new/visitsApi.ts` and the visit detail screen. Delete `PLATFORM_FEE = 90` and booked-appointment fee labels.

## 4. Progress

Existing `GET /api/Patient/Progress`.

`data` now includes:

```json
{
  "visitCount": 4,
  "openFollowUps": 1,
  "completedFollowUps": 2,
  "followUpsCompleted": 2,
  "followUpsTotal": 3,
  "adherencePercent": null,
  "series": [{ "date": "2026-09-17T00:00:00", "severity": 6 }]
}
```

`visitCount` excludes cancelled visits. `followUpsCompleted` is the same count as `completedFollowUps`. `followUpsTotal` is open plus completed. `adherencePercent` is `null` because it is not stored. `series` is the symptom diary. Bind the progress screen to this hook; do not keep a local series.

## 5. My reviews and appeal

`GET /api/Reviews/Mine` with a **patient** token now returns that patient's reviews. A doctor token still returns the doctor's reviews.

```json
{
  "success": true,
  "data": [
    {
      "reviewId": 18,
      "patientAppId": 88120,
      "doctorId": 104,
      "doctorName": "Dr. Meera Joshi",
      "patientId": 5012,
      "rating": 5,
      "text": "Clear advice.",
      "status": "APPROVED",
      "at": "2026-10-01T11:20:00",
      "createdAt": "2026-10-01T11:20:00"
    }
  ]
}
```

`POST /api/Reviews/{reviewId}/Appeal` with body `{ "reason": "Please correct the visit date." }` is allowed for the patient who wrote the review. Reason must be at least 3 characters. Response `{ "success": true, "message": "Appeal opened." }`.

Bind in the reviews / support API file. An empty `data` array means this patient has no reviews.

## 6. Check-in

`POST /api/Patient/Visits/{patientAppId}/CheckIn`

Today's in-clinic visit only, owned by this patient. Tele, cancelled, and completed visits are rejected. Send `status` as a query or a JSON body: `EARLY`, `WAITING`, or `READY`.

```json
{ "status": "WAITING" }
```

```json
{ "success": true, "data": { "patientAppId": 88120, "status": "WAITING", "queuePosition": 2, "readyAt": null } }
```

`readyAt` is `null`. Add the mutation next to `visitsApi.ts`.

## 6b. Switch to tele, and running late

`POST /api/PatientAppointment/SwitchToTele?patientAppId=88120` or body `{ "patientAppId": 88120 }`. The patient must own the visit. Cancelled and completed visits are rejected.

```json
{ "success": true, "data": { "patientAppId": 88120, "consultMode": "Tele", "isTele": true } }
```

`POST /api/Tele/Sessions/{teleSessionId}/RunningLate?minutes=10` or body `{ "minutes": 10 }`. Writes a `RUNNING_LATE` event. `detail` is `"10 minutes"`, or `null` when minutes is omitted.

## 7. Ask the doctor for a time

`POST /api/Patient/AppointmentRequests`

```json
{
  "doctorId": 104,
  "requestedDate": "2026-10-20",
  "requestedTime": "10:30",
  "consultMode": "Tele",
  "reason": "Fever for two days"
}
```

`consultMode` is `Tele` or `InClinic`. Response `{ "success": true, "data": { "status": "PENDING" } }`. The doctor accepts, declines, or proposes on the doctor app. This does not create the visit until the doctor accepts.

## 8. Reminders

| Method | Path |
| --- | --- |
| GET | `/api/Patient/Reminders` |
| POST | `/api/Patient/Reminders` |
| PUT | `/api/Patient/Reminders/{id}` |
| DELETE | `/api/Patient/Reminders/{id}` |

POST body:

```json
{
  "title": "Take the evening dose",
  "dueAt": "2026-10-16T20:00:00",
  "kind": "MEDICINE",
  "timeOfDay": "20:00",
  "weekdays": "Mon,Wed",
  "memberPatientId": null
}
```

List item:

```json
{
  "patientReminderId": 3,
  "patientId": 5012,
  "title": "Take the evening dose",
  "dueAt": "2026-10-16T20:00:00",
  "isDone": false,
  "kind": "MEDICINE",
  "timeOfDay": "20:00",
  "weekdays": "Mon,Wed",
  "memberPatientId": null
}
```

PUT sends `title`, `dueAt`, `isDone`, `kind`, `timeOfDay`, `weekdays`, and `memberPatientId`. An empty list is a real empty list. The four extra fields are null when the app does not send them.

## 9. Notification preferences and mark all read

`GET /api/Notifications/Preferences` and `PUT /api/Notifications/Preferences`.

```json
{
  "pushEnabled": true,
  "smsEnabled": false,
  "emailEnabled": false,
  "quietStart": "22:00:00",
  "quietEnd": "07:00:00",
  "appointments": true,
  "prescriptions": true,
  "medicines": true,
  "marketing": false,
  "quietHoursEnabled": true,
  "reminderOffsets": "60,1440"
}
```

Before the first save, push, appointments, prescriptions, and medicines are true. SMS, email, and marketing are false. `reminderOffsets` is a comma-separated list of minutes, or `null`. Inbox items have no `type` and no `deepLink`. Keep filtering on the client if the screen needs a category.

`POST /api/Notifications/MarkAllRead` → `{ "success": true, "data": { "marked": 4 } }`. `marked` is how many rows changed.

Keep the existing per-notification `PATCH /api/Notifications/{id}`.

## 10. Screens that already have routes — wire the unused hooks

These hooks exist and return live data. Call them from the screens. Do not keep fixture lists.

| Screen | Call |
| --- | --- |
| Book a doctor | `POST /api/Public/Doctors/{doctorId}/Bookings` (`useCreateBookingMutation`) |
| Slots | `GET /api/Public/Doctors/{doctorId}/Slots` |
| Consult payment | `POST /api/Payments/ConsultOrders` then verify. Amount is the order the API creates from the doctor's fee. Read `gatewayReady` and `keyId` from that response. The booking response includes `holdExpiresAt`. |
| Medicine payment | `POST /api/Payments/MedicineOrders`. `data` includes `paymentOrderId`, `amount`, `currency`, `gatewayReady`, `keyId`, and `gatewayOrderId`. `keyId` is null when the gateway is not ready. |
| Pharmacy sellers | `GET /api/Pharmacy/Sellers`. `priceTotal`, `deliveryFee`, `etaMinutes`, `fulfilPercent`, `distanceKm`, and `serviceable` are `null`. Those facts are not stored. Show name and area only. |
| Join tele | `POST /api/Tele/Sessions/{id}/Token` |
| Home articles | `GET /api/Public/Articles` |
| Family booking | existing family and `BookAs` routes already in `familyApi.ts` / `bookingApi.ts` |

Payment Checkout must use `razorpayKeyId` from AppConfig. Do not paste a key into the app.

`POST /api/Patient/DataRequests` already exists for a data request. There is no list route and no `DELETE /api/Account`. Do not add a delete-account call.

## Cursor instruction

In `NIGA_PatientApp`, add or extend RTK Query endpoints under `src/store/api/new/` for every route in this file. Point each screen at the hook. Delete hardcoded fees, doctor names, and platform-fee constants. Render `null` fields as hidden. Do not change the New API.
