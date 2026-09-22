import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useChoosePharmacyController,
  type ChoosePharmacyViewModel,
} from './useChoosePharmacyController';
import {
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
};

const INITIAL_MEDS: Omit<OrderMedicineItem, 'selected'>[] = [
  { id: 'm01', nameKey: 'orderMedM01', qtyKey: 'orderMedQty1Vial' },
  { id: 'm02', nameKey: 'orderMedM02', qtyKey: 'orderMedQty1Vial' },
  { id: 'm03', nameKey: 'orderMedM03', qtyKey: 'orderMedQty1Vial' },
];

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
  const [medicines, setMedicines] = useState<OrderMedicineItem[]>(() =>
    INITIAL_MEDS.map((item) => ({ ...item, selected: true })),
  );
  const [pharmacyOpen, setPharmacyOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  /** 413001 has delivery; 413115 shows empty/no-delivery state. */
  const [pincode, setPincode] = useState('413001');
  const hasDelivery = pincode === '413001';

  const openReview = () => {
    setPharmacyOpen(false);
    setCheckoutOpen(false);
    setReviewOpen(true);
  };

  const pharmacy = useChoosePharmacyController({
    hasDelivery,
    pincode,
    onBack: () => setPharmacyOpen(false),
    onContinue: openReview,
  });

  const pharmacyName = pharmacy.selectedPharmacy
    ? t(pharmacy.selectedPharmacy.nameKey)
    : t('pharmacyShreeName');

  const review = useReviewOrderController({
    pharmacyName,
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

  const checkout = useMedicineCheckoutController({
    onBack: () => {
      setCheckoutOpen(false);
      setReviewOpen(true);
    },
    onPlaceOrder: () => {
      setCheckoutOpen(false);
      setReviewOpen(false);
      setPharmacyOpen(false);
      onPlaceOrder?.();
    },
  });

  return {
    language,
    t,
    rxId: 'RX-2026-77410',
    doctorLine: t('orderMedsDoctorLine'),
    patientLine: t('orderMedsPatientLine'),
    validTill: t('orderMedsValidTill'),
    addressLine:
      pincode === '413001'
        ? t('orderMedsAddress')
        : t('orderMedsAddressAlt').replace('{pin}', pincode),
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
      setMedicines((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item,
        ),
      );
    },
    onChangeAddress: () => {
      setPincode((prev) => (prev === '413001' ? '413115' : '413001'));
    },
    onSeePharmacies: () => setPharmacyOpen(true),
  };
}
