import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type CheckoutPayMethod = 'card' | 'wallet';

export type CheckoutOrderItem = {
  id: string;
  nameKey: TranslationKey;
  metaKey: TranslationKey;
  priceLabel: string;
  icon: 'med' | 'vial';
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
};

const ITEMS: CheckoutOrderItem[] = [
  {
    id: 'm01',
    nameKey: 'checkoutItemM01',
    metaKey: 'checkoutItemM01Meta',
    priceLabel: '₹160',
    icon: 'med',
  },
  {
    id: 'm02',
    nameKey: 'checkoutItemM02',
    metaKey: 'checkoutItemM02Meta',
    priceLabel: '₹90',
    icon: 'vial',
  },
];

export function useMedicineCheckoutController({
  onBack,
  onPlaceOrder,
}: {
  onBack: () => void;
  onPlaceOrder?: () => void;
}): MedicineCheckoutViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [method, setMethod] = useState<CheckoutPayMethod>('card');

  return {
    language,
    t,
    recipientName: t('checkoutRecipientName'),
    addressLines: [t('checkoutAddressLine1'), t('checkoutAddressLine2')],
    phoneLabel: t('checkoutPhone'),
    items: ITEMS,
    subtotalLabel: '₹250',
    taxesLabel: '₹0',
    shippingLabel: '₹60',
    shippingFree: false,
    totalLabel: '₹310',
    method,
    onBack,
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onEditAddress: () => undefined,
    onSelectMethod: setMethod,
    onPlaceOrder: () => onPlaceOrder?.(),
  };
}
