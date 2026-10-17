# Razorpay integration log — PATIENT

| When | Phase | Note |
|---|---|---|
| 2026-10-17 | 1 | Analysis written. No CRITICAL secrets. Verify route exists (G13). Medicine ONLINE missing keyId/gatewayOrderId in guide sample → B-PMT-002. |
| 2026-10-17 | 2 | Installed react-native-razorpay@3.0.0; plugins/withRazorpay.js; src/payments/* (checkout, state machine, key helper, pending SecureStore). |
| 2026-10-17 | 3A | Book → ConsultOrders → Checkout → Verify; holdExpiresAt countdown; removed SEED_PAYMENT_ID path for success; medicine Pay wired; Instant pay still blocked. |
| 2026-10-17 | 4 | 02_secure_config.md; .gitignore .env; AppConfig-only Key ID. |
| 2026-10-17 | 5 | 03_test_plan.md + RAZORPAY_INTEGRATION_REPORT.md; yarn typecheck PASS; yarn lint PASS. Device Checkout untested. |
| 2026-10-17 | ops | Backend confirms live KeyId in NewAPI appsettings + UI widgets; KeySecret server-only; **WebhookSecret empty**. App still must not embed KeyId. B-PMT-003 remains open until webhook secret + dashboard URL are set. Prefer test keys on non-prod. |
