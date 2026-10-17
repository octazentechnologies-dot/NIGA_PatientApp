# A3 — RTK endpoint inventory summary
Source: scan of src/store/api/new/*.ts + grep of use*Query/Mutation in src/
Date: 2026-10-17 | Branch Devlopment_1.1 @ 48d7507

- ~127 endpoint definitions across 24 API files; legacyBaseApi has 0 injectEndpoints
- ~52 USED from controllers / initiate(); ~75 UNUSED hooks
- Duplicate: useGetRefundPolicyQuery in paymentsApi + visitsApi (visits wins by import order)
- Non-RTK: services/notifications/deviceTokenApi.ts uses fetch for Device/Register

See agent audit transcript for full table. Key UNUSED contract-relevant:
- useMarkAllNotificationsReadMutation
- useDeleteReminderMutation
- useGetPrescriptionQuery / useGetConsultationNoteQuery
- useCreateConsultOrderMutation / useVerifyPaymentMutation
- useGetTeleTokenMutation / most Tele Instant hooks
- Caregiver* hooks
- useDeleteDocumentMutation
