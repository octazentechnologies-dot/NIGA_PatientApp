# Secure Razorpay configuration — PATIENT app

| Item | Where it lives | In the app? |
|---|---|---|
| Razorpay Key ID | Server → `GET /api/Public/AppConfig` → `razorpayKeyId`, and order response `keyId` | Read at runtime only. **Never hardcode. Never put in `.env`.** |
| Razorpay Key Secret | Backend only (`Razorpay:KeySecret`) | **NEVER** |
| Webhook Secret | Backend only (`Razorpay:WebhookSecret`) | **NEVER** |
| Test vs Live | Backend config (test on dev, live on prod) | No app change |

## Repo checks (done)

- `.gitignore` ignores `.env`, `.env.*`, `*.jks`, `*.p8`, keystores.
- No `rzp_` Key ID or Key Secret in `src/` (scan 2026-10-17).
- App reads `razorpayKeyId` via `AppConfigProvider` / order `keyId` (`src/payments/getKeyId.ts`).
- Checkout amount from server order only; paise conversion only in `src/payments/amount.ts` / Checkout boundary.
- Verify does not accept client signatures; webhook marks `CAPTURED` (G13).

## Native rebuild (required for Checkout)

`react-native-razorpay` is a native module. **Expo Go cannot open Checkout.**

```bash
yarn install
npx expo prebuild --clean   # applies plugins/withRazorpay.js (UPI schemes)
npx expo run:android        # or EAS build with a development client
npx expo run:ios
```

Plugin: `./plugins/withRazorpay` in `app.json` → iOS `LSApplicationQueriesSchemes` + Android package queries.

## Release checklist

1. Backend sets `Razorpay:KeyId`, `Razorpay:KeySecret`, `Razorpay:WebhookSecret` in the environment secret store (not the git repo).
2. Webhook URL points at the matching host and verifies the signature server-side.
3. Dev/staging use **test** keys; production uses **live** keys only.
4. Before store release, grep the JS bundle for `rzp_` and `secret` (Key ID from AppConfig may appear only after a network response — it must not be baked into the binary).
5. Rotate keys if any secret was ever committed or logged.
6. Crashlytics / logging must not capture Checkout payloads (app masks ids; only `__DEV__` logs).

## Local override (optional, stripped from release)

Do **not** add a Key ID to `.env`. If a developer needs an override, use a `__DEV__`-only flag that is tree-shaken from release builds — prefer fixing AppConfig on the server instead.

## Backend note (2026-10-17) — do not copy into the app

From `NIGA_NewAPI` `appsettings.json` → `Razorpay` (and the same public KeyId used by `NIGAHomeopathy_UI` widgets):

| Field | Status for the patient app |
|---|---|
| `KeyId` (public) | Must arrive only via `GET /api/Public/AppConfig` → `razorpayKeyId` and/or order `keyId`. **Never paste into `src/`, `.env`, or `app.json`.** |
| `KeySecret` | Server-only. Never in either mobile app. |
| `WebhookSecret` | **Empty in config today** → webhooks cannot be verified; Checkout success will stall on Verify/`PENDING_CONFIRMATION` until this is set (see B-PMT-003). |

**Environment warning:** that KeyId is a **live** (`rzp_live_…`) key. Dev/staging should use Razorpay **test** keys. Pointing a mobile build at live keys without a verified webhook and a matching prod host risks real charges and uncleared orders.

**App behaviour (unchanged):** if AppConfig/`keyId` is null or `gatewayReady` is false → show “Online payment is not available right now.” No hardcoded fallback.
