import { newBaseApi } from './newBaseApi';
import { unwrapListOrPage } from '../../../utilities/paged';

/** BE-006 — known types; unknown → OTHER in the UI. */
export type NotificationType =
  | 'APPOINTMENT'
  | 'PRESCRIPTION'
  | 'MEDICINE'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'MARKETING'
  | 'OTHER'
  | string;

export type ApiAppNotification = {
  appNotificationId: number;
  title: string;
  body: string;
  isRead: boolean;
  pushStatus?: string;
  createdAt: string;
  /** Null on old rows. */
  type?: NotificationType | null;
  deepLink?: string | null;
};

export type GetNotificationsParams = {
  pageNumber?: number;
  pageSize?: number;
};

export type GetNotificationsResult = {
  success: boolean;
  items: ApiAppNotification[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
};

export type MarkNotificationReadParams = {
  appNotificationId: number | string;
  isRead?: boolean;
};

export type MarkNotificationReadResponse = {
  success: boolean;
  appNotificationId: number;
  isRead: boolean;
};

export type UnreadCountResponse = {
  success: boolean;
  data: { unread: number };
};

export type NotificationPreferences = {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  quietStart: string | null;
  quietEnd: string | null;
  appointments: boolean;
  prescriptions: boolean;
  medicines: boolean;
  marketing: boolean;
  quietHoursEnabled: boolean;
  reminderOffsets: string | null;
};

export type NotificationPreferencesResponse = {
  success: boolean;
  data: NotificationPreferences;
};

/**
 * Notifications API (BE-006, 025, 026, 034):
 * - GET /api/Notifications?pageNumber=&pageSize=
 * - GET /api/Notifications/UnreadCount
 * - PATCH /api/Notifications/{id}
 * - POST /api/Notifications/MarkAllRead
 * - GET/PUT Preferences
 */
export const notificationsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getNotifications: build.query<
      GetNotificationsResult,
      GetNotificationsParams | void
    >({
      query: (params) => ({
        url: 'api/Notifications',
        params: params
          ? {
              pageNumber: params.pageNumber,
              pageSize: params.pageSize,
            }
          : undefined,
      }),
      transformResponse: (response: unknown): GetNotificationsResult => {
        const { items, page } = unwrapListOrPage<ApiAppNotification>(response);
        return {
          success: true,
          items,
          totalRecords: page?.totalRecords ?? items.length,
          pageNumber: page?.pageNumber ?? 1,
          pageSize: page?.pageSize ?? (items.length || 20),
        };
      },
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationCount: build.query<number, void>({
      query: () => 'api/Notifications/UnreadCount',
      transformResponse: (response: UnreadCountResponse | { unread?: number }) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return Number((response as UnreadCountResponse).data?.unread) || 0;
        }
        return Number((response as { unread?: number }).unread) || 0;
      },
      providesTags: ['Notifications'],
    }),
    markNotificationRead: build.mutation<
      MarkNotificationReadResponse,
      MarkNotificationReadParams
    >({
      query: ({ appNotificationId, isRead = true }) => ({
        url: `api/Notifications/${appNotificationId}?isRead=${isRead}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: build.mutation<
      { success: boolean; data: { marked: number } },
      void
    >({
      query: () => ({
        url: 'api/Notifications/MarkAllRead',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    getNotificationPreferences: build.query<NotificationPreferences, void>({
      query: () => 'api/Notifications/Preferences',
      transformResponse: (
        response: NotificationPreferencesResponse | NotificationPreferences,
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as NotificationPreferencesResponse).data;
        }
        return response as NotificationPreferences;
      },
      providesTags: ['NotificationPrefs'],
    }),
    updateNotificationPreferences: build.mutation<
      NotificationPreferences,
      NotificationPreferences
    >({
      query: (body) => ({
        url: 'api/Notifications/Preferences',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['NotificationPrefs'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationsApi;
