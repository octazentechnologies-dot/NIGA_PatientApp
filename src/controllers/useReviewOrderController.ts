import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ReviewOrderItem = {
  id: string;
  nameKey: TranslationKey;
  doseKey: TranslationKey;
  qtyKey: TranslationKey;
  priceLabel: string;
};

export type ReviewOrderViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  rxId: string;
  pharmacyName: string;
  licenceShort: string;
  distanceLine: string;
  items: ReviewOrderItem[];
  medicinesSubtotal: string;
  deliveryFee: string;
  taxes: string;
  totalPayable: string;
  addressLine: string;
  recipientLine: string;
  deliveryEta: string;
  deliveryInstructions: string;
  consentChecked: boolean;
  canPay: boolean;
  onBack: () => void;
  onChangePharmacy: () => void;
  onChangeDelivery: () => void;
  onChangeInstructions: (value: string) => void;
  onToggleConsent: () => void;
  onTogglePolicy: () => void;
  policyOpen: boolean;
  onProceedToPay: () => void;
};

const ITEMS: ReviewOrderItem[] = [
  {
    id: 'm01',
    nameKey: 'orderMedM01',
    doseKey: 'reviewOrderDose',
    qtyKey: 'orderMedQty1Vial',
    priceLabel: '₹90',
  },
  {
    id: 'm02',
    nameKey: 'orderMedM02',
    doseKey: 'reviewOrderDose',
    qtyKey: 'orderMedQty1Vial',
    priceLabel: '₹80',
  },
  {
    id: 'm03',
    nameKey: 'orderMedM03',
    doseKey: 'reviewOrderDose',
    qtyKey: 'orderMedQty1Vial',
    priceLabel: '₹80',
  },
];

export function useReviewOrderController({
  onBack,
  onChangePharmacy,
  onProceedToPay,
  pharmacyName,
}: {
  onBack: () => void;
  onChangePharmacy?: () => void;
  onProceedToPay?: () => void;
  pharmacyName?: string;
}): ReviewOrderViewModel {
  const { language, t } = useLocalization();
  const [consentChecked, setConsentChecked] = useState(true);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const name = pharmacyName ?? t('pharmacyShreeName');

  return {
    language,
    t,
    rxId: 'RX-2026-77410',
    pharmacyName: name,
    licenceShort: t('reviewOrderLicenceShort'),
    distanceLine: t('reviewOrderDistance'),
    items: ITEMS,
    medicinesSubtotal: '₹250',
    deliveryFee: '₹60',
    taxes: '₹0',
    totalPayable: '₹310',
    addressLine: t('orderMedsAddress'),
    recipientLine: t('reviewOrderRecipient'),
    deliveryEta: t('reviewOrderEta'),
    deliveryInstructions,
    consentChecked,
    canPay: consentChecked,
    onBack,
    onChangePharmacy: () => onChangePharmacy?.(),
    onChangeDelivery: () => undefined,
    onChangeInstructions: setDeliveryInstructions,
    onToggleConsent: () => setConsentChecked((prev) => !prev),
    onTogglePolicy: () => setPolicyOpen((prev) => !prev),
    policyOpen,
    onProceedToPay: () => {
      if (consentChecked) {
        onProceedToPay?.();
      }
    },
  };
}
