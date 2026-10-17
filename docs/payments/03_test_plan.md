# Razorpay test plan — PATIENT (test mode only)

Use Razorpay **test** keys on the server. Do not use live keys.

## Preconditions

- Custom dev client / `expo run:*` (not Expo Go).
- `GET /api/Public/AppConfig` returns a non-null `razorpayKeyId` (test).
- Webhook configured for the same host (otherwise status stays pending).
- Signed-in patient with a bookable doctor and (for medicine) a signed Erx.

## Consult payment

| # | Case | Steps | App expect | Server evidence |
|---|---|---|---|---|
| C1 | Success (card) | Book → Pay → test card success | `VERIFYING` → success screen; visit `paymentStatus` PAID | Order `CAPTURED`; webhook received |
| C2 | Success (UPI) | Same with UPI test flow | Same | Same |
| C3 | User cancel | Close Checkout | Stay on payment; retry allowed | Order still PENDING |
| C4 | Payment failure | Fail test card | Failed message + retry | Order FAILED or pending |
| C5 | Network drop in Checkout | Airplane mid-flow | NETWORK / failed copy; no local Paid | Ledger unchanged until webhook |
| C6 | Kill app mid-payment | Force-stop after Checkout success | On reopen, pending id in SecureStore; poll Verify | CAPTURED when webhook lands |
| C7 | Verify timeout | Block webhook temporarily | `PENDING_CONFIRMATION` after ~60 s; no second charge prompt | Later CAPTURED |
| C8 | Double tap | Tap Pay twice quickly | One in-flight attempt | One order (idempotency key) |
| C9 | Hold expired before Pay | Wait past `holdExpiresAt` | Pay disabled | — |
| C10 | Hold expires during Checkout | Start pay near expiry | Still Verify/poll; server message if released | 409 HOLD_EXPIRED or free slot |
| C11 | Gateway not ready | Server `gatewayReady:false` / null keyId | “Online payment is not available…” | No Razorpay order |
| C12 | Amount 0 | Free consult if server allows | No Checkout; friendly message | No gateway charge |
| C13 | 401 mid-flow | Expire token | Refresh or sign-out per existing 401 handler | — |
| C14 | Verify `success:false` | Force API error | Failed copy; Support | — |
| C15 | Re-open after success | Kill and reopen | Paid from server visit, not local seed | G14 / Visits |
| C16 | Receipt | Tap download | Hidden / no-op until invoice route (B-PMT-005) | — |

## Medicine payment

| # | Case | Steps | App expect | Server evidence |
|---|---|---|---|---|
| M1 | Success | Create order → Checkout → pay | Confirm after Verify CAPTURED | Medicine order PAID |
| M2 | Missing keyId (B-PMT-002) | ONLINE without gateway fields | Blocked message; no fake Paid | Order may exist unpaid |
| M3 | Cancel / fail / double-tap | Same as C3–C8 | Same rules | Same |

## Security smoke

| # | Case | Expect |
|---|---|---|
| S1 | Bundle / source grep `rzp_live_`, `key_secret` | No hits |
| S2 | Logs in release | No payment ids / signatures |
| S3 | Amount tamper | App does not send client amount on ConsultOrders |

## Untested here

Device Checkout and webhook end-to-end require a physical/simulator build with native Razorpay — mark **untested — needs device** until QA runs C1 on a dev client.
