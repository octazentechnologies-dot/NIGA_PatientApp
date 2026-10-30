import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppConfig } from '../providers/AppConfigProvider';
import { usePayment, type PaymentFlowState } from '../payments';
import {
  useCreateAddressMutation,
  useGetAddressesQuery,
  type PatientAddress,
} from '../store/api/new/addressesApi';
import {
  useGetMedicineOrderTrackingQuery,
  usePayMedicineOrderMutation,
  type PayMedicineOrderResponse,
} from '../store/api/new/medicinesApi';
import { formatQuoteAmount } from '../utilities/medicineOrderStage';
import {
  useGetCitiesByStateQuery,
  useGetCountriesQuery,
  useGetStatesByCountryQuery,
} from '../store/api/new/completeProfileApi';
import { useGetPatientProfileQuery } from '../store/api/new/patientProfileApi';
import { useAppSelector } from '../store/hooks';
import { messageFromUnknownError } from '../utilities/apiResponse';

export type CheckoutPayMethod = 'online' | 'cod';

export type CheckoutOrderItem = {
  id: string;
  nameKey: TranslationKey;
  metaKey: TranslationKey;
  priceLabel: string;
  icon: 'med' | 'vial';
};

export type LocationOption = {
  id: number;
  name: string;
};

export type AddressFormDraft = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
  phone: string;
};

export type MedicineCheckoutViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  recipientName: string;
  addressLines: string[];
  phoneLabel: string;
  items: CheckoutOrderItem[];
  subtotalLabel: string;
  taxesLabel: string;
  shippingLabel: string;
  shippingFree: boolean;
  totalLabel: string;
  method: CheckoutPayMethod;
  onBack: () => void;
  onToggleLanguage: () => void;
  onEditAddress: () => void;
  onSelectMethod: (method: CheckoutPayMethod) => void;
  onPlaceOrder: () => void;
  placeOrderNote: string | null;
  payBusy: boolean;
  paymentState: PaymentFlowState;
  medicineOrderId: number | null;
  addressId: number | null;
  addresses: PatientAddress[];
  addressesLoading: boolean;
  addressPickerOpen: boolean;
  addressFormOpen: boolean;
  addressForm: AddressFormDraft;
  addressFormError: string | null;
  onSelectAddress: (addressId: number) => void;
  onAddressFormChange: (patch: Partial<AddressFormDraft>) => void;
  onOpenAddressForm: () => void;
  onCloseAddressForm: () => void;
  onSaveAddress: () => void;
  addressSaveBusy: boolean;
  stateOptions: LocationOption[];
  cityOptions: LocationOption[];
  statesLoading: boolean;
  citiesLoading: boolean;
  selectedStateId: number | null;
  selectedCityId: number | null;
  onSelectState: (id: number) => void;
  onSelectCity: (id: number) => void;
};

const EMPTY_FORM: AddressFormDraft = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  label: '',
  phone: '',
};

const EMPTY_ADDRESSES: PatientAddress[] = [];
const EMPTY_CHECKOUT_ITEMS: CheckoutOrderItem[] = [];

export function formatAddressLines(address: PatientAddress | null | undefined): string[] {
  if (!address) {
    return [];
  }
  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.pincode ? `PIN ${address.pincode}` : '',
  ].filter(Boolean) as string[];
  if (address.label?.trim()) {
    lines.unshift(address.label.trim());
  }
  return lines;
}

function localMobile(value: string | null | undefined): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function validateAddressForm(form: AddressFormDraft): string | null {
  if (!form.line1.trim()) return 'Address line 1 is required.';
  if (!form.city.trim()) return 'City is required.';
  if (!form.state.trim()) return 'State is required.';
  if (!/^\d{6}$/.test(form.pincode.trim())) return 'Pincode must be 6 digits.';
  return null;
}

export function useMedicineCheckoutController({
  onBack,
  items = EMPTY_CHECKOUT_ITEMS,
  medicineOrderId = null,
  onPaid,
  addressId: addressIdProp = null,
  onAddressIdChange,
}: {
  onBack: () => void;
  onPlaceOrder?: () => void;
  items?: CheckoutOrderItem[];
  medicineOrderId?: number | null;
  onPaid?: (paymentOrderId: number) => void;
  addressId?: number | null;
  onAddressIdChange?: (addressId: number | null) => void;
}): MedicineCheckoutViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [method, setMethod] = useState<CheckoutPayMethod>('online');
  const [placeOrderNote, setPlaceOrderNote] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormDraft>(EMPTY_FORM);
  const [addressFormError, setAddressFormError] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const phoneSeeded = useRef(false);
  const [internalAddressId, setInternalAddressId] = useState<number | null>(null);
  const appConfig = useAppConfig();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: trackingResponse } = useGetMedicineOrderTrackingQuery(
    medicineOrderId ?? 0,
    { skip: !isAuthenticated || !medicineOrderId },
  );
  const quoteLabel =
    formatQuoteAmount(
      trackingResponse?.data?.quoteAmount,
      trackingResponse?.data?.currency,
    ) ?? '';
  const quotedItems = useMemo<CheckoutOrderItem[]>(() => {
    const rows = trackingResponse?.data?.items ?? trackingResponse?.data?.lines ?? [];
    if (!Array.isArray(rows) || rows.length === 0) return items;
    return rows.map((row, index) => ({
      id: `line-${index}`,
      nameKey: (row.remedyName || 'Medicine') as TranslationKey,
      metaKey: ([row.potencyCode, row.quantityLabel].filter(Boolean).join(' · ') ||
        '') as TranslationKey,
      priceLabel: '',
      icon: 'med' as const,
    }));
  }, [items, trackingResponse?.data?.items, trackingResponse?.data?.lines]);
  const authUser = useAppSelector((state) => state.auth.user);
  const authMobile = useAppSelector((state) => state.auth.mobile);
  const { data: profileResponse } = useGetPatientProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profile = profileResponse?.data;

  const { data: addresses = EMPTY_ADDRESSES, isLoading: addressesLoading } =
    useGetAddressesQuery(undefined, { skip: !isAuthenticated });
  const [createAddress, { isLoading: addressSaveBusy }] = useCreateAddressMutation();
  const [payMedicineOrder] = usePayMedicineOrderMutation();

  const selectedAddressId =
    addressIdProp ?? internalAddressId ?? addresses.find((a) => a.isDefault)?.addressId ?? addresses[0]?.addressId ?? null;

  useEffect(() => {
    if (addressIdProp != null) return;
    const defaultId =
      addresses.find((a) => a.isDefault)?.addressId ?? addresses[0]?.addressId ?? null;
    if (defaultId != null && internalAddressId == null) {
      setInternalAddressId(defaultId);
      onAddressIdChange?.(defaultId);
    }
  }, [addresses, addressIdProp, internalAddressId, onAddressIdChange]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.addressId === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const recipientName =
    profile?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');
  const userPhone = localMobile(
    profile?.mobileNo || authUser?.mobile || authUser?.mobileNo || authMobile,
  );
  const { data: countriesResponse } = useGetCountriesQuery();
  const countryId = useMemo(() => {
    const countries = countriesResponse?.data ?? [];
    const saved =
      authUser?.countryId != null && Number(authUser.countryId) > 0
        ? Number(authUser.countryId)
        : null;
    if (saved) return saved;
    const india = countries.find(
      (country) =>
        country.iso2Code?.trim().toUpperCase() === 'IN' ||
        /india/i.test(country.countryName || ''),
    );
    return india?.countryId ?? (countries.length === 1 ? countries[0].countryId : null);
  }, [authUser?.countryId, countriesResponse?.data]);
  const { data: statesResponse, isLoading: statesLoading } = useGetStatesByCountryQuery(
    countryId ?? 0,
    { skip: !countryId },
  );
  const { data: citiesResponse, isFetching: citiesLoading } = useGetCitiesByStateQuery(
    selectedStateId ?? 0,
    { skip: !selectedStateId },
  );
  const stateOptions = useMemo<LocationOption[]>(
    () =>
      (statesResponse?.data ?? []).map((row) => ({
        id: row.stateId,
        name: row.stateName?.trim() || '',
      })).filter((row) => row.name),
    [statesResponse?.data],
  );
  const cityOptions = useMemo<LocationOption[]>(
    () =>
      (citiesResponse?.data ?? []).map((row) => ({
        id: row.cityId,
        name: row.cityName?.trim() || '',
      })).filter((row) => row.name),
    [citiesResponse?.data],
  );

  useEffect(() => {
    if (!addressFormOpen || phoneSeeded.current || !userPhone) return;
    phoneSeeded.current = true;
    setAddressForm((current) =>
      current.phone.trim() ? current : { ...current, phone: userPhone },
    );
  }, [addressFormOpen, userPhone]);
  const phoneLabel = selectedAddress?.phone?.trim()
    ? selectedAddress.phone.trim()
    : userPhone
      ? `+91 ${userPhone}`
      : '';

  const prefill = useMemo(
    () => ({
      name: recipientName || null,
      email: profile?.email || authUser?.email || null,
      contact: userPhone || null,
    }),
    [authUser?.email, profile?.email, recipientName, userPhone],
  );

  const payment = usePayment({
    flow: 'medicine',
    appConfigKeyId: appConfig.razorpayKeyId,
    prefill,
    description: 'Medicine order',
    medicineOrderId,
    createOrder: async () => {
      if (!medicineOrderId) {
        throw {
          data: {
            code: 'VALIDATION',
            message: 'No medicine order to pay. Go back and choose a pharmacy.',
          },
        };
      }
      const idempotencyKey = `mo-${medicineOrderId}-${Date.now()}`;
      const res: PayMedicineOrderResponse = await payMedicineOrder({
        medicineOrderId,
        payMode: 'ONLINE',
        idempotencyKey,
      }).unwrap();

      const keyId = res.keyId ?? null;
      const gatewayOrderId = res.data?.gatewayOrderId ?? null;
      return {
        gatewayReady: res.gatewayReady,
        keyId,
        message: res.message,
        data: {
          paymentOrderId: res.data?.paymentOrderId ?? 0,
          amount: res.data?.amount ?? null,
          currency: res.data?.currency ?? 'INR',
          gatewayOrderId,
          status: res.data?.status ?? 'PENDING',
        },
      };
    },
    onConfirmed: (order) => {
      setPlaceOrderNote(null);
      onPaid?.(order.paymentOrderId);
    },
  });

  const setAddressId = useCallback(
    (id: number | null) => {
      if (addressIdProp == null) {
        setInternalAddressId(id);
      }
      onAddressIdChange?.(id);
    },
    [addressIdProp, onAddressIdChange],
  );

  const onPlaceOrder = useCallback(() => {
    setPlaceOrderNote(null);
    if (!medicineOrderId) {
      setPlaceOrderNote(t('checkoutWaitingQuote'));
      return;
    }
    if (!quoteLabel) {
      setPlaceOrderNote(t('checkoutWaitingQuote'));
      return;
    }
    if (!selectedAddressId) {
      setPlaceOrderNote(t('orderMedsAddAddressHint'));
      setAddressPickerOpen(true);
      return;
    }
    if (method === 'cod') {
      const idempotencyKey = `mo-${medicineOrderId}-cod-${Date.now()}`;
      void payMedicineOrder({
        medicineOrderId,
        payMode: 'COD',
        idempotencyKey,
      })
        .unwrap()
        .then((res) => {
          onPaid?.(res.data?.paymentOrderId ?? medicineOrderId);
        })
        .catch((err: unknown) => {
          setPlaceOrderNote(messageFromUnknownError(err));
        });
      return;
    }
    void payment.startPayment();
  }, [
    medicineOrderId,
    method,
    onPaid,
    payMedicineOrder,
    payment,
    quoteLabel,
    selectedAddressId,
    t,
  ]);

  const onSaveAddress = useCallback(() => {
    const err = validateAddressForm(addressForm);
    if (err) {
      setAddressFormError(err);
      return;
    }
    setAddressFormError(null);
    void createAddress({
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim() || null,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
      label: addressForm.label.trim() || null,
      phone: addressForm.phone.trim() || null,
      isDefault: addresses.length === 0,
    })
      .unwrap()
      .then((res) => {
        const id = res.data?.addressId;
        if (id != null) {
          setAddressId(id);
        }
        setAddressFormOpen(false);
        setAddressForm(EMPTY_FORM);
        setAddressPickerOpen(true);
      })
      .catch((e: unknown) => {
        setAddressFormError(messageFromUnknownError(e));
      });
  }, [addressForm, addresses.length, createAddress, setAddressId]);

  return {
    language,
    t,
    recipientName,
    addressLines: formatAddressLines(selectedAddress),
    phoneLabel,
    items: quotedItems,
    subtotalLabel: quoteLabel,
    taxesLabel: '',
    shippingLabel: '',
    shippingFree: false,
    totalLabel: quoteLabel,
    method,
    onBack,
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onEditAddress: () => setAddressPickerOpen((v) => !v),
    onSelectMethod: setMethod,
    placeOrderNote: placeOrderNote || payment.errorMessage,
    payBusy: payment.busy,
    paymentState: payment.state,
    medicineOrderId,
    onPlaceOrder,
    addressId: selectedAddressId,
    addresses,
    addressesLoading,
    addressPickerOpen,
    addressFormOpen,
    addressForm,
    addressFormError,
    onSelectAddress: (id) => {
      setAddressId(id);
      setAddressPickerOpen(false);
    },
    onAddressFormChange: (patch) => {
      setAddressForm((prev) => ({ ...prev, ...patch }));
      setAddressFormError(null);
    },
    onOpenAddressForm: () => {
      setAddressForm((current) =>
        current.phone.trim()
          ? current
          : { ...current, phone: userPhone },
      );
      if (userPhone) phoneSeeded.current = true;
      setAddressFormOpen(true);
      setAddressFormError(null);
    },
    onCloseAddressForm: () => {
      setAddressFormOpen(false);
      setAddressForm(EMPTY_FORM);
      setSelectedStateId(null);
      setSelectedCityId(null);
      phoneSeeded.current = false;
      setAddressFormError(null);
    },
    onSaveAddress,
    addressSaveBusy,
    stateOptions,
    cityOptions,
    statesLoading,
    citiesLoading,
    selectedStateId,
    selectedCityId,
    onSelectState: (id) => {
      const name = stateOptions.find((row) => row.id === id)?.name ?? '';
      setSelectedStateId(id);
      setSelectedCityId(null);
      setAddressForm((current) => ({ ...current, state: name, city: '' }));
      setAddressFormError(null);
    },
    onSelectCity: (id) => {
      const name = cityOptions.find((row) => row.id === id)?.name ?? '';
      setSelectedCityId(id);
      setAddressForm((current) => ({ ...current, city: name }));
      setAddressFormError(null);
    },
  };
}
