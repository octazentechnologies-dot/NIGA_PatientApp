import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetAddressesQuery,
  type PatientAddress,
} from '../store/api/new/addressesApi';
import { useCreateMedicineOrderMutation } from '../store/api/new/medicinesApi';
import {
  useGetPrescriptionQuery,
  useGetTimelineQuery,
} from '../store/api/new/recordsApi';
import { useAppSelector } from '../store/hooks';
import { messageFromUnknownError } from '../utilities/apiResponse';
import {
  useChoosePharmacyController,
  type ChoosePharmacyViewModel,
} from './useChoosePharmacyController';
import {
  formatAddressLines,
  useMedicineCheckoutController,
  type MedicineCheckoutViewModel,
} from './useMedicineCheckoutController';
import {
  useReviewOrderController,
  type ReviewOrderViewModel,
} from './useReviewOrderController';

export type OrderMedicineItem = {
  id: string;
  nameKey: TranslationKey;
  qtyKey: TranslationKey;
  selected: boolean;
};

const EMPTY_ADDRESSES: PatientAddress[] = [];

export type OrderMedicinesViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  rxId: string;
  doctorLine: string;
  patientLine: string;
  validTill: string;
  addressLine: string;
  medicines: OrderMedicineItem[];
  pharmacyOpen: boolean;
  reviewOpen: boolean;
  checkoutOpen: boolean;
  pharmacy: ChoosePharmacyViewModel;
  review: ReviewOrderViewModel;
  checkout: MedicineCheckoutViewModel;
  onBack: () => void;
  onToggleLanguage: () => void;
  onViewPrescription: () => void;
  onOrderHomeoMeds: () => void;
  onDownloadInstead: () => void;
  onToggleMedicine: (id: string) => void;
  onChangeAddress: () => void;
  onSeePharmacies: () => void;
  addressPickerOpen: boolean;
  onCloseAddressPicker: () => void;
  onSelectAddress: (addressId: number) => void;
  addresses: PatientAddress[];
  selectedAddressId: number | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function useOrderMedicinesController({
  onBack,
  onViewPrescription,
  onPlaceOrder,
}: {
  onBack: () => void;
  onViewPrescription?: () => void;
  onPlaceOrder?: () => void;
}): OrderMedicinesViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [pharmacyOpen, setPharmacyOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [medicineOrderId, setMedicineOrderId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: addresses = EMPTY_ADDRESSES } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (selectedAddressId != null) return;
    const defaultId =
      addresses.find((a) => a.isDefault)?.addressId ?? addresses[0]?.addressId ?? null;
    if (defaultId != null) {
      setSelectedAddressId(defaultId);
    }
  }, [addresses, selectedAddressId]);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: timeline } = useGetTimelineQuery(undefined, {
    skip: !isAuthenticated,
  });
  const latestRx = useMemo(() => {
    const rows = timeline?.data?.prescriptions ?? [];
    if (rows.length === 0) {
      return null;
    }
    return [...rows].sort((a, b) =>
      (b.signedAt || '').localeCompare(a.signedAt || ''),
    )[0];
  }, [timeline?.data?.prescriptions]);
  const { data: erxResponse, isLoading: erxLoading, isError: erxError, refetch } =
    useGetPrescriptionQuery(latestRx?.patientAppId ?? 0, {
      skip: !latestRx?.patientAppId,
    });
  const erx = erxResponse?.data;
  const erxSnapshotId = erx?.erxSnapshotId ?? latestRx?.erxSnapshotId ?? null;
  const [createMedicineOrder, { isLoading: creatingOrder }] =
    useCreateMedicineOrderMutation();

  const medicines = useMemo<OrderMedicineItem[]>(() => {
    const items = erx?.items ?? [];
    return items.map((item, index) => {
      const id = `${item.remedyCode || 'rx'}-${index}`;
      const name = [item.remedyName, item.potencyCode].filter(Boolean).join(' ');
      const qty = [item.dose, item.frequency, item.duration]
        .filter(Boolean)
        .join(' · ');
      return {
        id,
        nameKey: (name || 'Medicine') as TranslationKey,
        qtyKey: (qty || '') as TranslationKey,
        selected: selectedIds == null ? true : selectedIds.includes(id),
      };
    });
  }, [erx?.items, selectedIds]);

  const reviewItems = medicines
    .filter((item) => item.selected)
    .map((item) => ({
      id: item.id,
      nameKey: item.nameKey,
      doseKey: item.qtyKey,
      qtyKey: '' as TranslationKey,
      priceLabel: '',
    }));

  const pharmacy = useChoosePharmacyController({
    hasDelivery: true,
    pincode: '',
    notice: orderError,
    continueBusy: creatingOrder,
    onBack: () => setPharmacyOpen(false),
    onContinue: (pharmacyId: string) => {
      const partnerId = Number(pharmacyId);
      if (!erxSnapshotId || !Number.isFinite(partnerId) || partnerId <= 0) {
        setOrderError('A signed prescription and pharmacy are required.');
        return;
      }
      setOrderError(null);
      const addressId =
        selectedAddressId ??
        addresses.find((a) => a.isDefault)?.addressId ??
        addresses[0]?.addressId ??
        null;
      if (!addressId) {
        setOrderError('Add a delivery address before ordering.');
        setAddressPickerOpen(true);
        return;
      }
      void createMedicineOrder({
        erxSnapshotId,
        pharmacyPartnerId: partnerId,
        addressId,
      })
        .unwrap()
        .then((res) => {
          setMedicineOrderId(res.data?.medicineOrderId ?? null);
          setPharmacyOpen(false);
          setCheckoutOpen(false);
          setReviewOpen(true);
        })
        .catch((err: unknown) => {
          setOrderError(messageFromUnknownError(err));
        });
    },
  });

  const pharmacyName = pharmacy.selectedPharmacy
    ? t(pharmacy.selectedPharmacy.nameKey)
    : '';

  const review = useReviewOrderController({
    pharmacyName,
    items: reviewItems,
    rxId: erxSnapshotId ? String(erxSnapshotId) : '',
    onBack: () => {
      setReviewOpen(false);
      setPharmacyOpen(true);
    },
    onChangePharmacy: () => {
      setReviewOpen(false);
      setPharmacyOpen(true);
    },
    onProceedToPay: () => {
      setReviewOpen(false);
      setCheckoutOpen(true);
    },
  });

  const selectedAddress =
    addresses.find((a) => a.addressId === selectedAddressId) ?? null;
  const addressLine = formatAddressLines(selectedAddress).join(', ');

  const checkout = useMedicineCheckoutController({
    medicineOrderId,
    addressId: selectedAddressId,
    onAddressIdChange: setSelectedAddressId,
    items: reviewItems.map((item) => ({
      id: item.id,
      nameKey: item.nameKey,
      metaKey: item.doseKey,
      priceLabel: '',
      icon: 'med' as const,
    })),
    onBack: () => {
      setCheckoutOpen(false);
      setReviewOpen(true);
    },
    onPaid: () => {
      setCheckoutOpen(false);
      setReviewOpen(false);
      setPharmacyOpen(false);
      // CAPTURED already invalidates Orders; mark home medicines tab state.
      onPlaceOrder?.();
    },
  });

  return {
    language,
    t,
    rxId: erxSnapshotId ? String(erxSnapshotId) : '',
    doctorLine: '',
    patientLine:
      authUser?.patientName ||
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' '),
    validTill: '',
    addressLine,
    medicines,
    pharmacyOpen,
    reviewOpen,
    checkoutOpen,
    pharmacy,
    review,
    checkout,
    onBack: () => {
      if (checkoutOpen) {
        setCheckoutOpen(false);
        setReviewOpen(true);
        return;
      }
      if (reviewOpen) {
        setReviewOpen(false);
        setPharmacyOpen(true);
        return;
      }
      if (pharmacyOpen) {
        setPharmacyOpen(false);
        return;
      }
      onBack();
    },
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onViewPrescription: () => onViewPrescription?.(),
    onOrderHomeoMeds: () => setPharmacyOpen(true),
    onDownloadInstead: () => undefined,
    onToggleMedicine: (id) => {
      setSelectedIds((prev) => {
        const current = prev ?? medicines.map((item) => item.id);
        return current.includes(id)
          ? current.filter((row) => row !== id)
          : [...current, id];
      });
    },
    onChangeAddress: () => setAddressPickerOpen(true),
    onSeePharmacies: () => setPharmacyOpen(true),
    addressPickerOpen,
    onCloseAddressPicker: () => setAddressPickerOpen(false),
    onSelectAddress: (id) => {
      setSelectedAddressId(id);
      setAddressPickerOpen(false);
    },
    addresses,
    selectedAddressId,
    isLoading: erxLoading,
    isError: erxError,
    onRetry: () => {
      void refetch();
    },
  };
}
