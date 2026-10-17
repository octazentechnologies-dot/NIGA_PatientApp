# Patient App UI modernization — Phase 1 audit

**Scope:** `NIGA_PatientApp` only (prompt text mentioned Doctor; this repo is Patient).  
**Constraint:** UI/presentation only. No API, auth logic, navigation wiring, or business logic changes.  
**Design source:** HelloHomeo `design.md` + existing `src/theme/*` (not Inter / not page gradients).

## Inventory

| Area | Status |
|---|---|
| Screens (`src/views`) | ~66 views |
| Reusable components | AppButton, AppText, AppCard, FormField, AuthHeader, PatientTabBar, Empty/Error/Loading, sheets |
| Theme | colors, typography, spacing, radii, shadows (floating only) |
| Fonts | Poppins (EN) + Noto Sans Devanagari (MR) — keep; do not switch to Inter |
| Auth flow | Splash → Onboarding → SignIn (OTP mobile) → OTP verify → profile/consent |
| Main tabs | Home, Doctors, Records, Medicines, Account |
| Brand | `#2A7BA3` primary; page `#F5F6F7`; card `#FFFFFF` |

## Pain points (visual)

- Oversized labels on buttons (`titleMd` 18 on every CTA)
- Hard-coded `#000000` / slate hexes in views (breaks ink rule `#1F1F1F`)
- Inconsistent status colours (ad-hoc greens)
- Empty states text-only
- Auth screens text-heavy, little hierarchy
- Splash uses pure black type + logo tint

## Plan

1. Tokens + reusable Header / StatusChip / EmptyState icon  
2. Auth polish (Splash, SignIn, OTP)  
3. Home + TabBar + Account presentation  
4. High-traffic list/detail polish where hex debt is worst  
5. Summary confirming APIs untouched  
