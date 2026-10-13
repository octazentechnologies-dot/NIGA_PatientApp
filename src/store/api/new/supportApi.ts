import { newBaseApi } from './newBaseApi';

export type CreateReviewRequest = {
  patientAppId: number;
  rating: number; // 1-5
  text?: string; // max 1000
};

export type CreateReviewResponse = {
  success: boolean;
  message?: string;
};

export type CreateTicketRequest = {
  category: 'billing' | 'booking' | 'technical' | 'clinical' | 'other' | string;
  subject: string;
  body: string;
};

export type CreateTicketResponse = {
  success: boolean;
  supportTicketId: number;
  message?: string;
};

export type SupportTicketSummary = {
  supportTicketId: number;
  reporterUserId: number;
  reporterRole: string;
  category: string;
  subject: string;
  body: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  priority: string;
  assigneeUserId: number | null;
  slaDueAt: string | null;
  createdAt: string;
  reporterName?: string;
  reporterEmail?: string;
};

export type GetMyTicketsResponse = {
  success: boolean;
  data: SupportTicketSummary[];
};

export type SupportTicketMessage = {
  supportTicketMessageId: number;
  supportTicketId: number;
  authorUserId: number;
  authorRole: string;
  body: string;
  at: string;
};

export type GetTicketMessagesResponse = {
  success: boolean;
  data: SupportTicketMessage[];
  attachments: Array<{
    supportTicketAttachmentId?: number;
    fileName?: string;
    url?: string;
  }>;
};

export type SendTicketMessageRequest = {
  supportTicketId: number;
  body: string;
  fileName?: string;
};

export type SendTicketMessageResponse = {
  success: boolean;
  supportTicketId: number;
  supportTicketMessageId: number;
  supportTicketAttachmentId?: number | null;
  storageKey?: string | null;
};

export type HelpArticleItem = {
  helpArticleId: number;
  title: string;
  slug: string;
  body: string;
  isPublished: boolean;
};

export type GetHelpArticlesResponse = {
  success: boolean;
  data: HelpArticleItem[];
};

export type GetHelpArticleBySlugResponse = {
  success: boolean;
  data: HelpArticleItem;
  message?: string;
};

export type AssistanceRequest = {
  doctorId?: number;
  patientId?: number;
  notes?: string;
  preferredDate?: string;
  contactMobile?: string;
};

export type AssistanceResponse = {
  success: boolean;
  supportTicketId: number;
  category: string;
  status: string;
  nextStep?: string;
  message?: string;
};

/**
 * Support, Reviews and Help API Endpoints:
 * - L1: POST /api/Reviews
 * - L2: POST /api/Support/Tickets
 * - L3: GET /api/Support/Tickets/Mine
 * - L3b: GET /api/Support/Tickets/{id}/Messages
 * - L3c: POST /api/Support/Tickets/{id}/Messages
 * - L4: GET /api/Help
 * - L5: GET /api/Help/{slug}
 * - L6: POST /api/Support/AssistanceRequest
 */
export const supportApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    createReview: build.mutation<CreateReviewResponse, CreateReviewRequest>({
      query: (body) => ({
        url: 'api/Reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visits'],
    }),
    createTicket: build.mutation<CreateTicketResponse, CreateTicketRequest>({
      query: (body) => ({
        url: 'api/Support/Tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Support', id: 'LIST' }],
    }),
    getMyTickets: build.query<GetMyTicketsResponse, void>({
      query: () => 'api/Support/Tickets/Mine',
      providesTags: [{ type: 'Support', id: 'LIST' }],
    }),
    getTicketMessages: build.query<GetTicketMessagesResponse, number | string>({
      query: (supportTicketId) => `api/Support/Tickets/${supportTicketId}/Messages`,
      providesTags: (_result, _error, supportTicketId) => [
        { type: 'Support', id: supportTicketId },
      ],
    }),
    sendTicketMessage: build.mutation<
      SendTicketMessageResponse,
      SendTicketMessageRequest
    >({
      query: ({ supportTicketId, ...body }) => ({
        url: `api/Support/Tickets/${supportTicketId}/Messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { supportTicketId }) => [
        { type: 'Support', id: supportTicketId },
      ],
    }),
    getHelpArticles: build.query<GetHelpArticlesResponse, void>({
      query: () => 'api/Help',
    }),
    getHelpArticleBySlug: build.query<GetHelpArticleBySlugResponse, string>({
      query: (slug) => `api/Help/${encodeURIComponent(slug)}`,
    }),
    requestAssistance: build.mutation<AssistanceResponse, AssistanceRequest>({
      query: (body) => ({
        url: 'api/Support/AssistanceRequest',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Support', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketMessagesQuery,
  useSendTicketMessageMutation,
  useGetHelpArticlesQuery,
  useGetHelpArticleBySlugQuery,
  useRequestAssistanceMutation,
} = supportApi;
