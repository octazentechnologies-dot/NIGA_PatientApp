# Patient App UI modernization — full-app summary

**Date:** 2026-10-17  
**Scope:** Entire `NIGA_PatientApp` presentation layer (Patient role only)  
**Rule:** UI only — APIs, auth logic, navigation wiring, and business logic unchanged

---

## 1. Screens redesigned

**All ~66 views** under `src/views/` were brought onto the shared Clinical Trust token set (ink, muted, primary, success/error/warning, page/card, dark tele surfaces).

Auth + core already polished earlier; this pass completed **full-app color unification** and shared headers on key stacks:

| Area | Status |
|---|---|
| Splash / Sign-in / OTP / Onboarding | Tokenized + hierarchy polish |
| Home / Account / Tab bar | Tokenized |
| Search / Results / Doctor profile | Tokenized |
| Booking / Payment / Consult Now | Tokenized (Paytm/Visa/MC brand hex kept) |
| Appointments / Requests / Check-in | Tokenized; Requests uses `AppScreenHeader` |
| Medicines / Pharmacy / Tracking / Checkout | Tokenized |
| Records / Prescription / Tips / Insights | Tokenized |
| Notifications / Help / Reviews | Tokenized + `AppScreenHeader` |
| Reminders / Consent / Family / Support | Tokenized |
| Video / Waiting room / Device check | Dark tokens applied |

---

## 2. New / enhanced reusable components

| Component | Role |
|---|---|
| `AppScreenHeader` | Canonical back + title + optional right action |
| `StatusChip` | Compact status pills |
| `EmptyState` | Icon badge + title/body/CTA |
| `AppButton` | Refined `labelLg`, pressed/disabled states |
| `AppCard` / `FormField` / `LanguageToggle` | Token-aligned |

---

## 3. Design system

- `src/theme/colors.ts` — Clinical Trust patient tokens (`ink`, `muted`, success/warning/link/astro, dark video surfaces)
- `src/theme/typography.ts` — slightly tighter display/headline/title
- Script: `scripts/tokenize-ui-colors.mjs` (one-shot migrator)

---

## 4. Typography

- **Poppins + Noto Sans Devanagari** retained (not Inter)
- Button labels: `labelLg` (15 SemiBold)
- Less oversized titles app-wide

---

## 5. Color / branding

- Primary `#2A7BA3`, ink `#1F1F1F`, page `#F5F6F7`, card `#FFFFFF`
- No page gradients (design.md)
- Remaining intentional hex: payment brand marks only (`#00BAF2`, `#1A1F71`, `#EB001B`)

---

## 6. Animation

- Existing splash / press feedback only; no new animation libraries

---

## 7. Responsive / a11y

- 48dp tap targets kept
- Safe-area headers via `AppScreenHeader`
- Contrast via token ink/muted/primaryOutline

---

## 8. APIs — not modified

No changes to `src/store/api/**`, endpoint URLs, request/response shapes, or auth/token logic in this UI pass.

---

## 9. Navigation / business logic — preserved

View-model props, tab IDs, and controllers’ handlers unchanged. Presentation-only edits in views/components/theme.

---

## 10. Gaps / next polish (optional)

| Item | Note |
|---|---|
| Every stack screen on `AppScreenHeader` | Partially adopted (Notifications, Help, Requests, Reviews); rest still use local headers with same tokens |
| Illustrations / imagery pack | Empty states use icon badges; custom illustrations not added |
| Onboarding light rewrite | Existing slides tokenized; no new welcome funnel (would risk nav changes) |

---

## Verification

- `yarn typecheck` — pass  
- `yarn lint` — pass  
