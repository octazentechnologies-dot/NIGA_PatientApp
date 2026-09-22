import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type RefillFeeling = 'improved' | 'same' | 'worse' | 'returned';

export type OrderDetailItem = {
  id: string;
  nameKey: TranslationKey;
  detailKey: TranslationKey;
  priceLabel: string;
};

export type OrderDetailsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  orderId: string;
  deliveredLine: string;
  items: OrderDetailItem[];
  subtotalLabel: string;
  deliveryLabel: string;
  totalPaidLabel: string;
  paymentMethodLine: string;
  rxId: string;
  doctorName: string;
  pharmacyName: string;
  pharmacyLicense: string;
  invoiceId: string;
  rxValidTill: string;
  canRefill: boolean;
  refillOpen: boolean;
  refillMedicines: { id: string; nameKey: TranslationKey; selected: boolean }[];
  refillReason: string;
  refillFeeling: RefillFeeling | null;
  refillFeelings: { id: RefillFeeling; labelKey: TranslationKey }[];
  onBack: () => void;
  onHelp: () => void;
  onOpenPrescription: () => void;
  onContactPharmacy: () => void;
  onDownloadInvoice: () => void;
  onOpenRefill: () => void;
  onCloseRefill: () => void;
  onToggleRefillMedicine: (id: string) => void;
  onChangeRefillReason: (value: string) => void;
  onSelectFeeling: (id: RefillFeeling) => void;
  onSendRefill: () => void;
  onHelpWrongItem: () => void;
  onHelpMissingItem: () => void;
  onHelpRefund: () => void;
  onReorder: () => void;
};

const ITEMS: OrderDetailItem[] = [
  {
    id: 'm01',
    nameKey: 'orderDetailMedM01',
    detailKey: 'orderDetailMedM01Detail',
    priceLabel: '₹90',
  },
  {
    id: 'm02',
    nameKey: 'orderDetailMedM02',
    detailKey: 'orderDetailMedM02Detail',
    priceLabel: '₹45',
  },
  {
    id: 'm03',
    nameKey: 'orderDetailMedM03',
    detailKey: 'orderDetailMedM03Detail',
    priceLabel: '₹115',
  },
];

const FEELINGS: OrderDetailsViewModel['refillFeelings'] = [
  { id: 'improved', labelKey: 'refillFeelingImproved' },
  { id: 'same', labelKey: 'refillFeelingSame' },
  { id: 'worse', labelKey: 'refillFeelingWorse' },
  { id: 'returned', labelKey: 'refillFeelingReturned' },
];

export function useOrderDetailsController({
  orderId,
  onBack,
  onReorder,
}: {
  orderId: string;
  onBack: () => void;
  onReorder?: () => void;
}): OrderDetailsViewModel {
  const { language, t } = useLocalization();
  const [refillOpen, setRefillOpen] = useState(false);
  const [refillMedicines, setRefillMedicines] = useState(() =>
    ITEMS.map((item) => ({
      id: item.id,
      nameKey: item.nameKey,
      selected: item.id === 'm01',
    })),
  );
  const [refillReason, setRefillReason] = useState('');
  const [refillFeeling, setRefillFeeling] = useState<RefillFeeling | null>(
    'improved',
  );

  const canRefill = orderId === 'hm-3922';
  const deliveredLine =
    orderId === 'hm-3850'
      ? t('medsStatusCancelledByYou')
      : orderId === 'hm-3601'
        ? t('medsStatusRefunded')
        : t('orderDetailDeliveredOn');

  return {
    language,
    t,
    orderId: orderId === 'hm-3922' ? '#HM-3922' : `#${orderId.toUpperCase()}`,
    deliveredLine,
    items: ITEMS,
    subtotalLabel: '₹250',
    deliveryLabel: '₹60',
    totalPaidLabel: '₹310',
    paymentMethodLine: t('orderDetailPaymentMethod'),
    rxId: 'RX-2026-77410',
    doctorName: 'Dr. Anjali Deshmukh',
    pharmacyName: t('orderDetailPharmacyName'),
    pharmacyLicense: 'MH-SOL-20B/21B-4471',
    invoiceId: 'INV-SHP-2026-1187',
    rxValidTill: t('orderDetailRxValidTill'),
    canRefill,
    refillOpen,
    refillMedicines,
    refillReason,
    refillFeeling,
    refillFeelings: FEELINGS,
    onBack,
    onHelp: () => undefined,
    onOpenPrescription: () => undefined,
    onContactPharmacy: () => undefined,
    onDownloadInvoice: () => undefined,
    onOpenRefill: () => setRefillOpen(true),
    onCloseRefill: () => setRefillOpen(false),
    onToggleRefillMedicine: (id) => {
      setRefillMedicines((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item,
        ),
      );
    },
    onChangeRefillReason: setRefillReason,
    onSelectFeeling: setRefillFeeling,
    onSendRefill: () => setRefillOpen(false),
    onHelpWrongItem: () => undefined,
    onHelpMissingItem: () => undefined,
    onHelpRefund: () => undefined,
    onReorder: () => onReorder?.(),
  };
}
