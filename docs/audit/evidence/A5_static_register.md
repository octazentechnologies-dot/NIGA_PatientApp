# A5 — Static/hardcoded register (selected high-signal hits)

| file:line | snippet/signal | screen | class |
|---|---|---|---|
| app.json:116 | apiBaseUrl migration host | All | STATIC_BUG (env) |
| config/appointmentSlots.ts:184 | PLATFORM_FEE_RUPEES = 90 | Consult now / fees | STATIC_BUG |
| config/appointmentSlots.ts:187-194 | CONSULT_FEE_RUPEES map | Visit fallback | STATIC_BUG |
| config/consultNow.ts:64 | CONSULT_NOW_FEE_RUPEES | Consult now | STATIC_BUG |
| models/search.ts:68-72 | DEFAULT modes video + mr | Search results | STATIC_BUG |
| useUploadDocumentController.ts:145-215 | addDemoFile | Upload | STATIC_BUG |
| useUploadDocumentController.ts:123-136 | fake progress timer | Upload | STATIC_BUG |
| useConsultNowController.ts:264-330 | setTimeout match/pay | Consult now | STATIC_BUG |
| useDeviceCheckController.ts:46,89 | mockNetworkCheck | Device check | DEFERRED_VIDEO |
| useWaitingRoomController.ts:71-179 | forceDoctorLate / local ETA | Waiting room | DEFERRED_VIDEO |
| useBookingPaymentController.ts | banks/wallets local; no ConsultOrders | Booking payment | DEFERRED_PAYMENT |
| usePrescriptionController.ts:26-48 | MEDICINES/ADVICE constants | Prescription | STATIC_BUG |
| useNotificationsController.ts:54-127 | SEED notifications | Notifications | STATIC_BUG |
| useSymptomDiaryController.ts:105-147 | SEEDED_ENTRIES | Symptom diary | STATIC_BUG |
| useCliniSightProgressController.ts:56-120 | FOLLOW_UPS chips; 42/56 copy | Progress | STATIC_BUG |
| AppNavigator.tsx:329,334 | doctorId ?? 'anjali' | Profile/Book | STATIC_BUG |
| localization en ₹500 strings | copy | Search/profile copy | LEGIT_UI_TEXT / review |
| AppConfigProvider support Linking | tel/wa/mailto from API | Help | LOCAL_BY_DESIGN / LIVE |
