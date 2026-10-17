import { newBaseApi } from './newBaseApi';

/**
 * Contract §8 — Patient reminders CRUD.
 */
export type PatientReminder = {
  patientReminderId: number;
  patientId: number;
  title: string;
  dueAt: string;
  isDone: boolean;
  kind: string | null;
  timeOfDay: string | null;
  weekdays: string | null;
  memberPatientId: number | null;
  /** BE-024 — 0–1440 or null (none). */
  snoozeMinutes?: number | null;
  notifyPush?: boolean;
};

export type ReminderWriteBody = {
  title: string;
  dueAt: string;
  kind?: string | null;
  timeOfDay?: string | null;
  weekdays?: string | null;
  memberPatientId?: number | null;
  isDone?: boolean;
  snoozeMinutes?: number | null;
  notifyPush?: boolean;
};

export type RemindersListResponse = {
  success: boolean;
  data: PatientReminder[];
};

export const remindersApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getReminders: build.query<PatientReminder[], void>({
      query: () => 'api/Patient/Reminders',
      transformResponse: (response: RemindersListResponse | PatientReminder[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ['Reminders'],
    }),
    createReminder: build.mutation<
      { success: boolean; data?: PatientReminder; message?: string },
      ReminderWriteBody
    >({
      query: (body) => ({
        url: 'api/Patient/Reminders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reminders'],
    }),
    updateReminder: build.mutation<
      { success: boolean; data?: PatientReminder; message?: string },
      { id: number | string; body: ReminderWriteBody & { isDone: boolean } }
    >({
      query: ({ id, body }) => ({
        url: `api/Patient/Reminders/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Reminders'],
    }),
    deleteReminder: build.mutation<
      { success: boolean; message?: string },
      number | string
    >({
      query: (id) => ({
        url: `api/Patient/Reminders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reminders'],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = remindersApi;
