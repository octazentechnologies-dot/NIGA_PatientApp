# HelloHomeo Patient

## System bars & safe areas

All system-bar spacing comes from `useSafeAreaInsets` via the shared `<Screen>`
component (`src/components/Screen.tsx`).

- Do **not** import `SafeAreaView` from `react-native` (iOS-only; no-op on Android).
- Do **not** hard-code bottom padding to clear the Android navigation bar.
- Do **not** set `StatusBar` / navigation-bar background colors for edge-to-edge
  (they are no-ops on Expo SDK 57 / Android 15+ and emit warnings).
- Tab-hosted screens: `<Screen edges={['top','left','right']}>` (or omit top if
  the header already applies `insets.top`). The custom tab bar consumes the
  bottom inset.
- Absolute footers / sticky CTAs: `paddingBottom: Math.max(insets.bottom, spacing.md)`.
- Lists: `contentContainerStyle={{ paddingBottom: insets.bottom + designSpacing }}`.
- Modals: use `SafeAreaModal` (sets `statusBarTranslucent` /
  `navigationBarTranslucent` and re-provides safe-area metrics).
