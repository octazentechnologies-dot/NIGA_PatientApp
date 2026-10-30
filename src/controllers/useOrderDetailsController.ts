import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useCreateMedicineOrderMutation,
  useGetMedicineOrderTrackingQuery,
  useGetMedicineOrdersQuery,
  useGrantMedicineConsentMutation,
  useRequestRefillMutation,
} from '../store/api/new/medicinesApi';
import { useAppSelector } from '../store/hooks';
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
  refillMessage: string | null;
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
  const [refillMessage, setRefillMessage] = useState<string | null>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: ordersResponse } = useGetMedicineOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [requestRefill] = useRequestRefillMutation();
  const [createOrder] = useCreateMedicineOrderMutation();
  const [grantConsent] = useGrantMedicineConsentMutation();
  const numericOrderId = Number(String(orderId).replace(/\D/g, ''));
  const hasValidId = Number.isFinite(numericOrderId) && numericOrderId > 0;
  const canRefill = hasValidId;

  const { data: trackingResponse } = useGetMedicineOrderTrackingQuery(numericOrderId, {
    skip: !isAuthenticated || !hasValidId,
  });

  const trackingData = trackingResponse?.data;
  const rawItems = trackingData?.items ?? trackingData?.lines ?? [];
  const items: OrderDetailItem[] = useMemo(() => {
    return rawItems.map((item, index) => ({
      id: item.remedyCode || String(index),
      nameKey: item.remedyName as TranslationKey,
      detailKey: [item.potencyCode, item.quantityLabel].filter(Boolean).join(' · ') as TranslationKey,
      priceLabel: '',
    }));
  }, [rawItems]);

  const totalPaidLabel = trackingData?.quoteAmount != null
    ? `${trackingData.currency ?? '₹'}${trackingData.quoteAmount.toFixed(2)}`
    : '';
  const subtotalLabel = totalPaidLabel;

  const deliveredLine = hasValidId ? t('orderDetailDeliveredOn') : '';

  return {
    language,
    t,
    orderId: hasValidId ? `#HM-${numericOrderId}` : '',
    deliveredLine,
    items,
    subtotalLabel,
    deliveryLabel: '',
    totalPaidLabel,
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
    refillMessage,
    onSendRefill: () => {
      const match = (ordersResponse?.data ?? []).find(
        (row) => row.medicineOrderId === numericOrderId,
      );
      const erxSnapshotId = Number(match?.erxSnapshotId);
      if (!Number.isFinite(erxSnapshotId) || erxSnapshotId <= 0) {
        setRefillMessage(t('orderDetailRefillMissingRx'));
        return;
      }
      void requestRefill({ erxSnapshotId })
        .unwrap()
        .then(() => {
          setRefillMessage(t('orderDetailRefillSent'));
        })
        .catch(() => {
          setRefillMessage(t('orderDetailRefillMissingRx'));
        });
    },
    onHelpWrongItem: () => undefined,
    onHelpMissingItem: () => undefined,
    onHelpRefund: () => undefined,
    onReorder: () => {
      const match = (ordersResponse?.data ?? []).find(
        (row) => row.medicineOrderId === numericOrderId,
      );
      const erxSnapshotId = Number(match?.erxSnapshotId);
      if (!Number.isFinite(erxSnapshotId) || erxSnapshotId <= 0) {
        setRefillMessage(t('orderDetailRefillMissingRx'));
        return;
      }
      void createOrder({ erxSnapshotId })
        .unwrap()
        .then(async (res) => {
          const createdId = res.data?.medicineOrderId;
          if (!createdId) return;
          await grantConsent(createdId).unwrap();
          onReorder?.();
        })
        .catch(() => {
          setRefillMessage(t('orderMedsMissingSnapshot'));
        });
    },
  };
}
