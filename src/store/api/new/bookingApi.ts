import { newBaseApi } from './newBaseApi';

export type CreateBookingRequest = {
  doctorId: number | string;
  mobile: string;
  patientName: string;
  email?: string;
  appointmentDate: string; // yyyy-MM-dd
  appointmentTime: string; // HH:mm
  consultMode: 'Tele' | 'InClinic';
  visitType: 'Tele' | 'InClinic';
  bookingSessionId?: number;
  consentPolicyVersion?: string;
  payAtClinic?: boolean;
  /** BE-027 — same key for retries of one attempt. */
  idempotencyKey?: string;
};

export type BookAsFamilyRequest = {
  memberPatientId: number;
  doctorId: number;
  appointmentDate: string; // yyyy-MM-dd
  appointmentTime: string; // HH:mm
  consultMode?: 'Tele' | 'InClinic';
};

export type BookingHoldData = {
  patientAppId: number;
  bookingToken: string;
  paymentStatus: string;
  holdExpiresAt?: string;
  consentPolicyVersion?: string;
  consultMode?: string;
  consultFee?: number;
  payAtClinicAllowed?: boolean;
  payAtClinicEnabled?: boolean;
  patientId?: number;
  patientName?: string;
};

export type BookingResponse = {
  success: boolean;
  data: BookingHoldData;
  message?: string;
};

export type BookingDetailData = {
  patientAppId: number;
  doctorId: number;
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  visitType: string;
  consultMode: string;
  paymentStatus: string;
  isTele: boolean;
  bookingToken: string;
  holdExpiresAt?: string;
  consentPolicyVersion?: string;
  consultFee: number;
  payAtClinicEnabled: boolean;
};

export type BookingDetailResponse = {
  success: boolean;
  data: BookingDetailData;
  message?: string;
};

export type TermsPolicyData = {
  policyType: string;
  version: string;
  title: string;
  bodyHtml: string;
  effectiveAt: string;
};

export type TermsPolicyResponse = {
  success: boolean;
  data: TermsPolicyData;
};

export type JoinWaitlistRequest = {
  doctorId: number;
  patientId?: number;
  requestedDate?: string; // yyyy-MM-dd
  appointmentDate?: string;
  consultMode?: 'Tele' | 'InClinic' | string;
  contactName?: string;
  patientName?: string;
  contactMobile: string;
  preferredTimeWindow?: string;
};

export type JoinWaitlistResponse = {
  success: boolean;
  bookingWaitlistId?: number;
  status?: string;
  message?: string;
};

export type WaitlistOfferItem = {
  bookingWaitlistId: number;
  doctorId: number;
  patientId: number;
  requestedDate: string;
  consultMode: string;
  contactName: string;
  contactMobile: string;
  status: string;
  createdAt: string;
};

export type WaitlistOffersResponse = {
  success: boolean;
  hasOffer: boolean;
  data: WaitlistOfferItem[];
};

/**
 * Booking Endpoints:
 * - G9: POST /api/Public/Doctors/{doctorId}/Bookings (hold slot, self)
 * - E8: POST /api/Family/BookAs (hold slot, family or authenticated self)
 * - G10: GET /api/Public/Bookings/{bookingToken}
 * - G11: GET /api/Public/Policies/Terms
 * - G15: POST /api/Waitlist/Join
 * - G17: GET /api/Waitlist/Offers
 */
export const bookingApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    createBooking: build.mutation<BookingResponse, CreateBookingRequest>({
      query: ({ doctorId, idempotencyKey, ...body }) => ({
        url: `api/Public/Doctors/${doctorId}/Bookings`,
        method: 'POST',
        body,
        headers: idempotencyKey
          ? { 'Idempotency-Key': idempotencyKey }
          : undefined,
      }),
      invalidatesTags: ['Visits', 'VisitDetail', 'Slots', 'Bookings'],
    }),
    bookAsFamily: build.mutation<BookingResponse, BookAsFamilyRequest>({
      query: (body) => ({
        url: 'api/Family/BookAs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visits', 'VisitDetail', 'Slots', 'Bookings'],
    }),
    getBookingByToken: build.query<BookingDetailResponse, string>({
      query: (bookingToken) => `api/Public/Bookings/${bookingToken}`,
    }),
    getTermsPolicy: build.query<TermsPolicyResponse, void>({
      query: () => 'api/Public/Policies/Terms',
    }),
    joinWaitlist: build.mutation<JoinWaitlistResponse, JoinWaitlistRequest>({
      query: (body) => ({
        url: 'api/Waitlist/Join',
        method: 'POST',
        body: {
          doctorId: body.doctorId,
          patientId: body.patientId,
          requestedDate: body.requestedDate || body.appointmentDate,
          consultMode: body.consultMode || 'InClinic',
          contactName: body.contactName || body.patientName,
          contactMobile: body.contactMobile,
          preferredTimeWindow: body.preferredTimeWindow,
        },
      }),
    }),
    getWaitlistOffers: build.query<WaitlistOffersResponse, string | void>({
      query: (contactMobile) => ({
        url: 'api/Waitlist/Offers',
        params: contactMobile ? { contactMobile } : undefined,
      }),
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useBookAsFamilyMutation,
  useGetBookingByTokenQuery,
  useGetTermsPolicyQuery,
  useJoinWaitlistMutation,
  useGetWaitlistOffersQuery,
} = bookingApi;
