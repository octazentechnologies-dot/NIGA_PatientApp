import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useCreateAddressMutation,
  useGetAddressesQuery,
  type AddressWriteBody,
  type PatientAddress,
} from '../store/api/new/addressesApi';
import {
  useCreateMedicineOrderMutation,
  useGrantMedicineConsentMutation,
  useRefillMedicineOrderMutation,
} from '../store/api/new/medicinesApi';
import {
  useGetPrescriptionByAppointmentQuery,
  useGetPrescriptionQuery,
  useGetPrescriptionsListQuery,
  useGetTimelineQuery,
  type ErxItem,
} from '../store/api/new/recordsApi';
import { useGetPatientProfileQuery } from '../store/api/new/patientProfileApi';
import { useAppSelector } from '../store/hooks';
import { messageFromUnknownError } from '../utilities/apiResponse';
import {
  useChoosePharmacyController,
  type ChoosePharmacyViewModel,
} from './useChoosePharmacyController';
import { formatAddressLines } from './useMedicineCheckoutController';

export type OrderMedicineItem = {
  id: string;
  name: string;
  detail: string;
};

export type SignedRxChoice = {
  erxSnapshotId: number;
  patientAppId: number | null;
  title: string;
  doctorLine: string;
  signed: boolean;
};

const EMPTY_ADDRESSES: PatientAddress[] = [];

const EMPTY_ADDRESS_FORM: AddressWriteBody = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  label: '',
  phone: '',
};

function profileAddressParts(user: {
  addressLine1?: string;
  address?: string;
  pinCodeId?: number | string;
} | null): { line1: string; pincode: string; line: string } {
  const line1 = String(user?.addressLine1 || user?.address || '').trim();
  const pinRaw = user?.pinCodeId != null ? String(user.pinCodeId).trim() : '';
  const pincode = /^\d{6}$/.test(pinRaw) ? pinRaw : '';
  return {
    line1,
    pincode,
    line: [line1, pincode].filter(Boolean).join(', '),
  };
}

function medicineLines(items: ErxItem[] | undefined): OrderMedicineItem[] {
  return (items ?? []).map((item, index) => {
    const remedy = item.remedyName?.trim() || '';
    const potency = item.potencyCode?.trim() || '';
    const name = [remedy, potency].filter(Boolean).join(' ') || 'Medicine';
    const detail = [item.dose, item.frequency, item.duration]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part) && part !== name && part !== potency)
      .join(' · ');
    return {
      id: `${item.remedyCode || remedy || 'rx'}-${index}`,
      name,
      detail,
    };
  });
}

function addressFormError(form: AddressWriteBody): TranslationKey | null {
  if (!form.line1?.trim()) return 'orderMedsAddressLineRequired';
  if (!form.city?.trim()) return 'orderMedsCityRequired';
  if (!form.state?.trim()) return 'orderMedsStateRequired';
  if (!/^\d{6}$/.test(form.pincode?.trim() || '')) return 'orderMedsPinRequired';
  return null;
}

function isSignedStatus(status: string, signedAt: string | null | undefined): boolean {
  if (signedAt && String(signedAt).trim().length > 0) return true;
  return /signed|locked/i.test(status);
}

export type OrderMedicinesViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  rxId: string;
  doctorLine: string;
  patientLine: string;
  signed: boolean;
  unsignedMessage: string | null;
  choices: SignedRxChoice[];
  medicines: OrderMedicineItem[];
  pharmacyOpen: boolean;
  quotePlaced: boolean;
  orderError: string | null;
  pharmacy: ChoosePharmacyViewModel;
  addressLine: string;
  onBack: () => void;
  onToggleLanguage: () => void;
  onSelectRx: (erxSnapshotId: number) => void;
  onSeePharmacies: () => void;
  addressPickerOpen: boolean;
  addressFormOpen: boolean;
  addressForm: AddressWriteBody;
  addressFormError: string | null;
  addressSaveBusy: boolean;
  onChangeAddress: () => void;
  onCloseAddressPicker: () => void;
  onSelectAddress: (addressId: number) => void;
  onAddressFormChange: (patch: Partial<AddressWriteBody>) => void;
  onSaveAddress: () => void;
  addresses: PatientAddress[];
  selectedAddressId: number | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewOrders: () => void;
};

export function useOrderMedicinesController({
  onBack,
  onPlaced,
  erxSnapshotId: erxSnapshotIdProp = null,
  patientAppId: patientAppIdProp = null,
  refillRequestId = null,
}: {
  onBack: () => void;
  onPlaced?: () => void;
  erxSnapshotId?: number | null;
  patientAppId?: number | null;
  refillRequestId?: number | null;
}): OrderMedicinesViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [pharmacyOpen, setPharmacyOpen] = useState(false);
  const [quotePlaced, setQuotePlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [pickedSnapshotId, setPickedSnapshotId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressWriteBody>(EMPTY_ADDRESS_FORM);
  const [addressFormErrorKey, setAddressFormErrorKey] = useState<TranslationKey | null>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const patientId = useAppSelector((state) => state.auth.patientId);
  const { data: profileResponse } = useGetPatientProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profileRecord = profileResponse?.data;
  const profileAddress = profileAddressParts({
    addressLine1: profileRecord?.addressLine1 || authUser?.addressLine1,
    address: profileRecord?.address || authUser?.address,
    pinCodeId: profileRecord?.pinCodeId ?? authUser?.pinCodeId,
  });

  const { data: addresses = EMPTY_ADDRESSES } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createAddress, { isLoading: addressSaveBusy }] = useCreateAddressMutation();
  const { data: timeline } = useGetTimelineQuery(
    patientId && patientId > 0 ? { patientId } : undefined,
    { skip: !isAuthenticated },
  );
  const {
    data: listResponse,
    isLoading: listLoading,
    refetch: refetchList,
  } = useGetPrescriptionsListQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (selectedAddressId != null) return;
    const defaultId =
      addresses.find((a) => a.isDefault)?.addressId ?? addresses[0]?.addressId ?? null;
    if (defaultId != null) {
      setSelectedAddressId(defaultId);
    }
  }, [addresses, selectedAddressId]);

  const choices = useMemo<SignedRxChoice[]>(() => {
    const rows = listResponse?.data ?? [];
    const fromList = rows.map((row) => ({
      erxSnapshotId: Number(row.erxSnapshotId),
      patientAppId: row.patientAppId ?? null,
      title: row.erxSnapshotId ? `eRx #${row.erxSnapshotId}` : 'Prescription',
      doctorLine: row.doctorName?.trim() || '',
      signed: isSignedStatus(row.status || '', row.signedAt),
    }));
    if (fromList.length > 0) return fromList.filter((row) => row.erxSnapshotId > 0);
    return (timeline?.data?.prescriptions ?? [])
      .filter((row) => Number(row.erxSnapshotId) > 0)
      .map((row) => ({
        erxSnapshotId: Number(row.erxSnapshotId),
        patientAppId: row.patientAppId ?? null,
        title: `eRx #${row.erxSnapshotId}`,
        doctorLine: '',
        signed: isSignedStatus(row.status || '', row.signedAt),
      }));
  }, [listResponse?.data, timeline?.data?.prescriptions]);

  const activeSnapshotId =
    pickedSnapshotId ??
    (erxSnapshotIdProp != null && Number(erxSnapshotIdProp) > 0
      ? Number(erxSnapshotIdProp)
      : null);

  const activeChoice = choices.find((row) => row.erxSnapshotId === activeSnapshotId) ?? null;
  const patientAppId =
    patientAppIdProp ??
    activeChoice?.patientAppId ??
    null;

  const aptQuery = useGetPrescriptionByAppointmentQuery(patientAppId ?? 0, {
    skip: !patientAppId,
  });
  const patientQuery = useGetPrescriptionQuery(patientAppId ?? 0, {
    skip: !patientAppId || Boolean(aptQuery.data?.data?.erxSnapshotId),
  });

  const erx = aptQuery.data?.data?.erxSnapshotId
    ? aptQuery.data.data
    : patientQuery.data?.data?.erxSnapshotId
      ? patientQuery.data.data
      : aptQuery.data?.data ?? patientQuery.data?.data;
  const erxLoading =
    Boolean(patientAppId) &&
    !erx?.erxSnapshotId &&
    (aptQuery.isLoading || aptQuery.isFetching || patientQuery.isLoading || patientQuery.isFetching);
  const erxError =
    Boolean(patientAppId) &&
    !erx?.erxSnapshotId &&
    aptQuery.isError &&
    (patientQuery.isError || patientQuery.isUninitialized);
  const erxSnapshotId =
    (erx?.erxSnapshotId && Number(erx.erxSnapshotId) > 0
      ? Number(erx.erxSnapshotId)
      : null) ?? activeSnapshotId;
  const isRefill = Number(refillRequestId) > 0;
  const signed = isRefill
    ? true
    : erxSnapshotId != null &&
      (activeChoice
        ? activeChoice.signed
        : isSignedStatus(erx?.status || '', erx?.signedAt));
  const medicines = useMemo<OrderMedicineItem[]>(() => {
    if (erx?.items?.length) return medicineLines(erx.items);
    const fromList = (listResponse?.data ?? []).find(
      (row) => Number(row.erxSnapshotId) === erxSnapshotId,
    );
    return medicineLines(fromList?.items);
  }, [erx?.items, erxSnapshotId, listResponse?.data]);

  const [createMedicineOrder, { isLoading: creatingOrder }] =
    useCreateMedicineOrderMutation();
  const [grantConsent, { isLoading: consenting }] = useGrantMedicineConsentMutation();
  const [startRefill, { isLoading: startingRefill }] = useRefillMedicineOrderMutation();

  const selectedAddress =
    addresses.find((a) => a.addressId === selectedAddressId) ?? null;
  const addressLine =
    formatAddressLines(selectedAddress).join(', ') || profileAddress.line;
  const pincode = selectedAddress?.pincode?.trim() || profileAddress.pincode;

  const place = async (pharmacyId: string) => {
    if (!isRefill && (!erxSnapshotId || !signed)) {
      setOrderError(t('orderMedsMissingSnapshot'));
      return;
    }
    const isAuto = pharmacyId === 'auto' || pharmacyId === '';
    const partnerId = Number(pharmacyId);
    if (!isAuto && (!Number.isFinite(partnerId) || partnerId <= 0)) {
      return;
    }
    setOrderError(null);
    const addressId = selectedAddressId;
    try {
      if (isRefill && refillRequestId) {
        await startRefill({
          refillRequestId: Number(refillRequestId),
          ...(isAuto ? {} : { pharmacyPartnerId: partnerId }),
        }).unwrap();
        setPharmacyOpen(false);
        setQuotePlaced(true);
        return;
      }
      let orderId = createdOrderId;
      if (!orderId) {
        const res = await createMedicineOrder({
          erxSnapshotId: Number(erxSnapshotId),
          ...(isAuto ? {} : { pharmacyPartnerId: partnerId }),
          ...(addressId ? { addressId } : {}),
        }).unwrap();
        orderId = res.data?.medicineOrderId ?? null;
        setCreatedOrderId(orderId);
      }
      if (!orderId) {
        setOrderError(t('orderMedsMissingSnapshot'));
        return;
      }
      await grantConsent(orderId).unwrap();
      setPharmacyOpen(false);
      setQuotePlaced(true);
    } catch (err: unknown) {
      setOrderError(messageFromUnknownError(err));
    }
  };

  const pharmacy = useChoosePharmacyController({
    hasDelivery: true,
    pincode,
    notice: orderError,
    continueBusy: creatingOrder || consenting || startingRefill,
    onBack: () => setPharmacyOpen(false),
    onContinue: (pharmacyId: string) => {
      void place(pharmacyId);
    },
  });

  return {
    language,
    t,
    rxId: erxSnapshotId ? `eRx #${erxSnapshotId}` : '',
    doctorLine: activeChoice?.doctorLine || '',
    patientLine:
      authUser?.patientName ||
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' '),
    signed: Boolean(signed && erxSnapshotId),
    unsignedMessage:
      !isRefill && activeSnapshotId != null && !signed ? t('orderMedsUnsignedBody') : null,
    choices: !isRefill && !signed ? choices : [],
    medicines,
    pharmacyOpen,
    quotePlaced,
    orderError,
    pharmacy,
    addressLine,
    onBack: () => {
      if (quotePlaced) {
        onPlaced?.();
        return;
      }
      if (pharmacyOpen) {
        setPharmacyOpen(false);
        return;
      }
      onBack();
    },
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onSelectRx: (id) => {
      setPickedSnapshotId(id);
      setOrderError(null);
      setCreatedOrderId(null);
    },
    onSeePharmacies: () => {
      if (!isRefill && (!erxSnapshotId || !signed)) {
        setOrderError(
          activeSnapshotId != null && !signed
            ? t('orderMedsUnsignedBody')
            : t('orderMedsNeedSigned'),
        );
        return;
      }
      setOrderError(null);
      setPharmacyOpen(true);
    },
    addressPickerOpen,
    addressFormOpen,
    addressForm,
    addressFormError: addressFormErrorKey ? t(addressFormErrorKey) : null,
    addressSaveBusy,
    onChangeAddress: () => {
      if (addressPickerOpen) {
        setAddressPickerOpen(false);
        setAddressFormOpen(false);
        return;
      }
      setAddressPickerOpen(true);
      setAddressFormOpen(true);
      setAddressFormErrorKey(null);
      setAddressForm((current) =>
        current.line1?.trim()
          ? current
          : {
              ...EMPTY_ADDRESS_FORM,
              line1: profileAddress.line1,
              pincode: profileAddress.pincode,
            },
      );
    },
    onCloseAddressPicker: () => {
      setAddressPickerOpen(false);
      setAddressFormOpen(false);
    },
    onSelectAddress: (id) => {
      setSelectedAddressId(id);
      setAddressPickerOpen(false);
      setAddressFormOpen(false);
    },
    onAddressFormChange: (patch) => {
      setAddressForm((current) => ({ ...current, ...patch }));
      setAddressFormErrorKey(null);
    },
    onSaveAddress: () => {
      const problem = addressFormError(addressForm);
      if (problem) {
        setAddressFormErrorKey(problem);
        return;
      }
      void createAddress({
        line1: addressForm.line1.trim(),
        line2: addressForm.line2?.trim() || null,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        label: addressForm.label?.trim() || null,
        phone: addressForm.phone?.trim() || null,
        isDefault: addresses.length === 0,
      })
        .unwrap()
        .then((res) => {
          if (res.data?.addressId) {
            setSelectedAddressId(res.data.addressId);
          }
          setAddressFormOpen(false);
          setAddressPickerOpen(false);
          setAddressForm(EMPTY_ADDRESS_FORM);
        })
        .catch((err: unknown) => {
          setOrderError(messageFromUnknownError(err));
        });
    },
    addresses,
    selectedAddressId,
    isLoading: erxLoading || (listLoading && !erx?.erxSnapshotId),
    isError: erxError && medicines.length === 0,
    onRetry: () => {
      void refetchList();
      if (patientAppId) {
        void aptQuery.refetch();
        void patientQuery.refetch();
      }
    },
    onViewOrders: () => onPlaced?.(),
  };
}
