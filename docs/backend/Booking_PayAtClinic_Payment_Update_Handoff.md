# Backend handoff — Booking hold + Pay at clinic + Razorpay payment update

**Audience:** Backend / New API  
**App:** NIGA Patient App (HelloHomeo Patient)  
**Base:** `https://devapi2.homeocentrum.com/` (paths below are after `/api`)  
**Auth:** `Authorization: Bearer <JWT>` unless noted

---

## Goal

1. Extend **slot-hold booking** APIs so the Patient app can send:
   - logged-in `userId`
   - `payAtClinic: true | false` (InClinic flow when user chooses pay at clinic vs pay online)
   - optional Razorpay ids when already known
2. **Do not treat hold as “appointment booked / paid”.** Confirm + FCM “booked” only after online payment is captured, or after pay-at-clinic is explicitly recorded.
3. Resolve **payment method** (card / UPI / netbanking / wallet / EMI) on the **server** via Razorpay Payments API (Checkout callback does **not** return method).
4. Add an API so a patient can **pay later** for a booking that was created with pay-at-clinic (or unpaid hold), by sending `userId` + Razorpay `order_id` + `payment_id`.

---

## Current mobile behaviour (context)

| Step | App action | API today |
|------|------------|-----------|
| Review → **Proceed To Pay** | Create **hold** only | `POST …/Bookings` or `POST /Family/BookAs` |
| Payment screen → online Pay | Create order → Razorpay Checkout → Verify | `POST /Payments/ConsultOrders` then `POST /Payments/Verify` |
| Payment screen → **Pay at clinic** | Record clinic pay | `POST /Payments/ConsultOrders` with `payAtClinic: true` |

Checkout success returns only:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

**No method** (PhonePe / GPay / card / etc.) in that callback.

---

## 1) Extend hold booking bodies

### 1.1 Self — `POST /api/Public/Doctors/{doctorId}/Bookings`

**Existing fields (keep):**

```json
{
  "mobile": "<auth mobile>",
  "patientName": "<name>",
  "appointmentDate": "yyyy-MM-dd",
  "appointmentTime": "HH:mm",
  "consultMode": "Tele",
  "visitType": "Tele",
  "bookingSessionId": 12345
}
```

**Add / accept (Patient app will send when available):**

```json
{
  "mobile": "<auth mobile>",
  "patientName": "<name>",
  "appointmentDate": "yyyy-MM-dd",
  "appointmentTime": "HH:mm",
  "consultMode": "Tele" | "InClinic",
  "visitType": "Tele" | "InClinic",
  "bookingSessionId": 12345,
  "userId": 10020,
  "payAtClinic": false,
  "razorpay_order_id": null,
  "razorpay_payment_id": null
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `userId` | long | Recommended | Logged-in user from JWT / VerifyOtp. If sent, must match JWT user. |
| `payAtClinic` | bool | Recommended | `true` = patient chose pay at clinic (InClinic). `false` = online pay (or Tele). Default `false`. |
| `razorpay_order_id` | string \| null | Optional | Razorpay `order_…`. Usually **null on hold**. |
| `razorpay_payment_id` | string \| null | Optional | Razorpay `pay_…`. Usually **null on hold**. |

---

### 1.2 Family — `POST /api/Family/BookAs`

**Existing fields (keep):**

```json
{
  "memberPatientId": 5012,
  "doctorId": 104,
  "appointmentDate": "yyyy-MM-dd",
  "appointmentTime": "HH:mm",
  "consultMode": "Tele" | "InClinic"
}
```

**Add / accept:**

```json
{
  "memberPatientId": 5012,
  "doctorId": 104,
  "appointmentDate": "yyyy-MM-dd",
  "appointmentTime": "HH:mm",
  "consultMode": "Tele" | "InClinic",
  "userId": 10020,
  "payAtClinic": false,
  "razorpay_order_id": null,
  "razorpay_payment_id": null
}
```

Same field rules as §1.1.

---

### 1.3 Server rules for `payAtClinic` + Razorpay ids on these APIs

| `payAtClinic` | What to do with gateway ids | Visit / payment state |
|---------------|-----------------------------|------------------------|
| **`true`** | **Do not** require Razorpay ids. Persist `payAtClinic = true`. Leave `gatewayOrderId` / `gatewayPaymentId` **null** (or ignore client ids if sent empty). | Hold / unpaid clinic intention — **not** “paid online”. Do **not** send FCM “appointment booked” as paid. |
| **`false`** | On **first hold**, usually **do not** write Razorpay ids yet (ids come after Checkout). If client sends both ids (rare / late retry), you may upsert them; otherwise leave null and wait for Verify / new update API. | Hold with online payment pending until `CAPTURED`. |

**Summary for DB on hold create:**

- Always store: slot, patient, doctor, `userId` (if provided), `payAtClinic`.
- **If `payAtClinic === true`:** mark clinic-pay intention; **do not** set paid from Razorpay; gateway ids stay empty.
- **If `payAtClinic === false`:** hold only; **do not** mark paid; update `razorpay_order_id` / `razorpay_payment_id` **later** when payment completes (Verify / webhook / §3 API).

**Notifications:** send “appointment booked / confirmed” only after online payment is **CAPTURED**, or after an explicit clinic-pay confirmation rule you define — **not** on bare hold create.

---

## 2) Payment method — server only (Razorpay)

Checkout does **not** return method. After you have `razorpay_payment_id`, on the server:

```http
GET https://api.razorpay.com/v1/payments/{razorpay_payment_id}
Authorization: Basic <KeyId:KeySecret base64>
```

Store the returned `method` (and related fields as needed) on your payment / visit ledger.

| `method` | Meaning |
|----------|---------|
| `card` | Debit / credit card |
| `upi` | UPI (GPay / PhonePe / etc. often under UPI) |
| `netbanking` | Net banking |
| `wallet` | Wallet |
| `emi` | EMI |

Optional detail fields from the same payment object (when present): `wallet`, `bank`, `vpa`, `card` network/last4 — useful for receipts; never return secrets to the app.

Preferred capture path remains: **Razorpay webhook** → mark `CAPTURED` → fetch payment if method missing → update DB. Client `POST /Payments/Verify` with `{ paymentOrderId, gatewayPaymentId }` should poll until `CAPTURED` / `FAILED`.

---

## 3) New API — update payment on a booking (pay anytime / pay later)

### Purpose

Patient booked (especially **InClinic + pay at clinic**, or unpaid hold) and later pays online from the booking / appointment UI. Mobile will send logged-in `userId` plus Razorpay ids after Checkout success.

### Proposed

`POST /api/Payments/Bookings/UpdatePayment`  
(or equivalent under your Payments controller — name can vary; contract below matters)

**Headers**

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Request**

```json
{
  "userId": 10020,
  "patientAppId": 88120,
  "razorpay_order_id": "order_XXXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXXX",
  "paymentOrderId": 7731
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `userId` | long | Yes | Must match JWT user. |
| `patientAppId` | long | Yes | Appointment / visit id from hold. |
| `razorpay_order_id` | string | Yes | From Checkout. |
| `razorpay_payment_id` | string | Yes | From Checkout. |
| `paymentOrderId` | long | Recommended | From `POST /Payments/ConsultOrders` if that flow was used. |

**Server steps (suggested)**

1. Authorize: JWT `userId` matches body `userId` and owns `patientAppId`.
2. Upsert `gatewayOrderId` = `razorpay_order_id`, `gatewayPaymentId` = `razorpay_payment_id`.
3. Call Razorpay `GET /v1/payments/{razorpay_payment_id}` (or rely on webhook) → store `method`, amount, status.
4. When status is captured: set visit `paymentStatus = PAID` (or your enum), clear / reconcile `payAtClinic` as needed, then send FCM “appointment booked / payment confirmed”.
5. Idempotent on same `razorpay_payment_id` / `paymentOrderId`.

**Success `200` (shape)**

```json
{
  "success": true,
  "message": "Payment updated.",
  "data": {
    "patientAppId": 88120,
    "paymentOrderId": 7731,
    "paymentStatus": "PAID",
    "method": "upi",
    "gatewayOrderId": "order_XXXXXXXX",
    "gatewayPaymentId": "pay_XXXXXXXX"
  }
}
```

**Errors**

| Status | Example |
|--------|---------|
| 400 | Missing ids / invalid body |
| 401 | Sign in required |
| 403 | `userId` does not match JWT or visit |
| 404 | Booking / payment order not found |
| 409 | Payment not captured yet / conflict |

---

## 4) How mobile will use this (target)

### InClinic → user selects **Pay at clinic**

1. Hold: `Bookings` / `BookAs` with `payAtClinic: true`, `userId`, Razorpay ids **null**.
2. Backend stores clinic-pay intention; gateway ids empty.
3. Later (optional): user pays online from booking → ConsultOrders → Checkout → **§3 UpdatePayment** (or existing Verify) with `userId` + Razorpay ids.

### InClinic / Tele → user selects **Pay online**

1. Hold: `payAtClinic: false`, Razorpay ids **null**.
2. ConsultOrders → Checkout → Verify (existing) **or** §3 UpdatePayment with ids after success.
3. Backend updates order/payment ids + method; confirm only on `CAPTURED`.

---

## 5) Acceptance checklist (backend)

- [ ] `Bookings` and `BookAs` accept `userId`, `payAtClinic`, optional `razorpay_order_id`, `razorpay_payment_id`.
- [ ] `payAtClinic: true` → persist clinic flag; **do not** mark paid; do **not** require gateway ids.
- [ ] `payAtClinic: false` → hold unpaid; gateway ids updated **after** payment (Verify / webhook / §3).
- [ ] No “appointment booked (paid)” push on hold alone.
- [ ] Method resolved via `GET /v1/payments/{razorpay_payment_id}` (or webhook) and stored.
- [ ] New **UpdatePayment** API updates gateway ids + status for `patientAppId` + `userId` when patient pays later.

---

## 6) Out of scope for this handoff

- Changing DoctorApp contracts.
- Embedding Razorpay **secret** in the mobile app (server only).
- Client-side signature verification as the sole source of truth (webhook / server Verify remains authoritative).

---

## Contact / follow-up

If route names differ (`UpdatePayment` vs extending `POST /Payments/Verify`), keep the **same request fields** so the Patient app can bind once. Prefer reusing existing `ConsultOrders` + `Verify` where possible, and add §3 only if “pay anytime from booking” needs an explicit upsert without a full Checkout recreate.
