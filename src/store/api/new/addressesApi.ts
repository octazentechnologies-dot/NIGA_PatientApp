import { newBaseApi } from './newBaseApi';

/**
 * BE-023 / B-023 — Delivery address book.
 * Path: /api/Patient/Addresses (alias DeliveryAddresses — use Addresses).
 */
export type PatientAddress = {
  addressId: number;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string | null;
  isDefault: boolean;
};

export type AddressWriteBody = {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone?: string | null;
  isDefault?: boolean;
};

export type AddressesListResponse = {
  success: boolean;
  data: PatientAddress[];
};

export const addressesApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAddresses: build.query<PatientAddress[], void>({
      query: () => 'api/Patient/Addresses',
      transformResponse: (response: AddressesListResponse | PatientAddress[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        return Array.isArray(response?.data) ? response.data : [];
      },
      providesTags: ['Addresses'],
    }),
    createAddress: build.mutation<
      { success: boolean; data?: PatientAddress; message?: string },
      AddressWriteBody
    >({
      query: (body) => ({
        url: 'api/Patient/Addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Addresses'],
    }),
    updateAddress: build.mutation<
      { success: boolean; data?: PatientAddress; message?: string },
      { addressId: number; body: AddressWriteBody }
    >({
      query: ({ addressId, body }) => ({
        url: `api/Patient/Addresses/${addressId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Addresses'],
    }),
    deleteAddress: build.mutation<
      { success: boolean; message?: string },
      number
    >({
      query: (addressId) => ({
        url: `api/Patient/Addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Addresses'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
