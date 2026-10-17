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

  const numericOrderId = Number(String(orderId).replace(/\D/g, ''));
  const hasValidId = Number.isFinite(numericOrderId) && numericOrderId > 0;
  const canRefill = hasValidId;
  // blocked: B-028 — order detail payload not fully bound; require real id, no seed doctor/fees.
  const deliveredLine = hasValidId ? t('orderDetailDeliveredOn') : '';

  return {
    language,
    t,
    orderId: hasValidId ? `#HM-${numericOrderId}` : '',
    deliveredLine,
    items: [],
    subtotalLabel: '',
    deliveryLabel: '',
    totalPaidLabel: '',
    paymentMethodLine: '',
    rxId: '',
    doctorName: '',
    pharmacyName: '',
    pharmacyLicense: '',
    invoiceId: '',
    rxValidTill: '',
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
    onSendRefill: async () => {
      setRefillOpen(false);
      // blocked: B-023 — refill requires erxSnapshotId from order payload
    },
    onHelpWrongItem: () => undefined,
    onHelpMissingItem: () => undefined,
    onHelpRefund: () => undefined,
    onReorder: () => onReorder?.(),
  };
}
