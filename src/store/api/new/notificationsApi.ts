import { newBaseApi } from './newBaseApi';

export type ApiAppNotification = {
  appNotificationId: number;
  title: string;
  body: string;
  isRead: boolean;
  pushStatus?: string;
  createdAt: string;
};

export type GetNotificationsResponse = {
  success: boolean;
  data: ApiAppNotification[];
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

/**
 * Notifications API:
 * - M4: GET /api/Notifications
 * - M5: PATCH /api/Notifications/{appNotificationId}?isRead=true
 */
export const notificationsApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getNotifications: build.query<GetNotificationsResponse, void>({
      query: () => 'api/Notifications',
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
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = notificationsApi;
