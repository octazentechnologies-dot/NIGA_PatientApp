import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { newBaseApi } from './newBaseApi';

/**
 * BE-023 / B-023 — Delivery address book.
 * Web saves these at /api/Patient/DeliveryAddresses. The patient app also
 * accepts /api/Patient/Addresses, and keeps whichever list returns rows.
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function pickStr(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNum(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

function unwrapAddressRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [];
  if (Array.isArray(root.data)) return root.data;
  const data = asRecord(root.data);
  if (Array.isArray(data?.addresses)) return data.addresses;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(root.addresses)) return root.addresses;
  return [];
}

export function normalizePatientAddress(raw: unknown): PatientAddress | null {
  const row = asRecord(raw);
  if (!row) return null;
  const addressId = pickNum(row, 'addressId', 'deliveryAddressId', 'id', 'Id');
  const line1 = pickStr(row, 'line1', 'addressLine1', 'address', 'AddressLine1', 'Line1');
  if (!addressId || !line1) return null;
  return {
    addressId,
    label: pickStr(row, 'label', 'Label') || null,
    line1,
    line2: pickStr(row, 'line2', 'addressLine2', 'Line2') || null,
    city: pickStr(row, 'city', 'cityName', 'City'),
    state: pickStr(row, 'state', 'stateName', 'State'),
    pincode: pickStr(row, 'pincode', 'pinCode', 'postalCode', 'Pincode'),
    phone: pickStr(row, 'phone', 'mobile', 'mobileNo', 'Phone') || null,
    isDefault: Boolean(row.isDefault ?? row.IsDefault),
  };
}

function normalizeAddressWrite(payload: unknown): {
  success: boolean;
  data?: PatientAddress;
  message?: string;
} {
  const root = asRecord(payload) ?? {};
  const data =
    normalizePatientAddress(root.data) ??
    normalizePatientAddress(root);
  return {
    success: root.success !== false,
    data: data ?? undefined,
    message: pickStr(root, 'message', 'Message') || undefined,
  };
}

const ADDRESS_LIST_URLS = ['api/Patient/DeliveryAddresses', 'api/Patient/Addresses'];

export const addressesApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAddresses: build.query<PatientAddress[], void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const merged: PatientAddress[] = [];
        const seen = new Set<number>();
        let sawSuccess = false;
        let lastError: FetchBaseQueryError | undefined;
        for (const url of ADDRESS_LIST_URLS) {
          const result = await baseQuery(url);
          if (result.error) {
            lastError = result.error as FetchBaseQueryError;
            continue;
          }
          sawSuccess = true;
          for (const row of unwrapAddressRows(result.data)) {
            const address = normalizePatientAddress(row);
            if (!address || seen.has(address.addressId)) continue;
            seen.add(address.addressId);
            merged.push(address);
          }
        }
        if (!sawSuccess && lastError) {
          return { error: lastError };
        }
        return { data: merged };
      },
      providesTags: ['Addresses'],
    }),
    createAddress: build.mutation<
      { success: boolean; data?: PatientAddress; message?: string },
      AddressWriteBody
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        let lastError: FetchBaseQueryError | undefined;
        for (const url of ADDRESS_LIST_URLS) {
          const result = await baseQuery({ url, method: 'POST', body });
          if (!result.error) {
            return { data: normalizeAddressWrite(result.data) };
          }
          lastError = result.error as FetchBaseQueryError;
        }
        return { error: lastError ?? { status: 500, data: 'Could not save address' } };
      },
      invalidatesTags: ['Addresses'],
    }),
    updateAddress: build.mutation<
      { success: boolean; data?: PatientAddress; message?: string },
      { addressId: number; body: AddressWriteBody }
    >({
      async queryFn({ addressId, body }, _api, _extraOptions, baseQuery) {
        let lastError: FetchBaseQueryError | undefined;
        for (const url of ADDRESS_LIST_URLS) {
          const result = await baseQuery({
            url: `${url}/${addressId}`,
            method: 'PUT',
            body,
          });
          if (!result.error) {
            return { data: normalizeAddressWrite(result.data) };
          }
          lastError = result.error as FetchBaseQueryError;
        }
        return { error: lastError ?? { status: 500, data: 'Could not update address' } };
      },
      invalidatesTags: ['Addresses'],
    }),
    deleteAddress: build.mutation<
      { success: boolean; message?: string },
      number
    >({
      async queryFn(addressId, _api, _extraOptions, baseQuery) {
        let lastError: FetchBaseQueryError | undefined;
        for (const url of ADDRESS_LIST_URLS) {
          const result = await baseQuery({
            url: `${url}/${addressId}`,
            method: 'DELETE',
          });
          if (!result.error) {
            const root = asRecord(result.data);
            return {
              data: {
                success: root?.success !== false,
                message: root ? pickStr(root, 'message', 'Message') || undefined : undefined,
              },
            };
          }
          lastError = result.error as FetchBaseQueryError;
        }
        return { error: lastError ?? { status: 500, data: 'Could not delete address' } };
      },
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
