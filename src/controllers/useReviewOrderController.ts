import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';

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

export function useReviewOrderController({
  onBack,
  onChangePharmacy,
  onProceedToPay,
  pharmacyName,
  items = [],
  rxId = '',
}: {
  onBack: () => void;
  onChangePharmacy?: () => void;
  onProceedToPay?: () => void;
  pharmacyName?: string;
  items?: ReviewOrderItem[];
  rxId?: string;
}): ReviewOrderViewModel {
  const { language, t } = useLocalization();
  const [consentChecked, setConsentChecked] = useState(true);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const authUser = useAppSelector((state) => state.auth.user);
  const authMobile = useAppSelector((state) => state.auth.mobile);
  const patientDisplayName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');
  const userPhone = authUser?.mobile || authUser?.mobileNo || authMobile;
  const recipientLine =
    patientDisplayName && userPhone
      ? `${patientDisplayName} · +91 ${userPhone}`
      : '';

  const name = pharmacyName ?? '';

  return {
    language,
    t,
    rxId,
    pharmacyName: name,
    licenceShort: '',
    distanceLine: '',
    items,
    // Quote fields are null on sellers — hide until a quote exists.
    medicinesSubtotal: '',
    deliveryFee: '',
    taxes: '',
    totalPayable: '',
    // blocked: B-023 — no delivery address book
    addressLine: '',
    recipientLine,
    deliveryEta: '',
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
