import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Share } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { getAccessToken } from '../services/secureStorage';
import {
  useCreateMedicineInvoiceByPaymentMutation,
  useCreateMedicineOrderMutation,
  useGetMedicineOrderHistoryQuery,
  useGetMedicineOrderTrackingQuery,
  useGetMedicineOrdersQuery,
  useGrantMedicineConsentMutation,
  useLazyGetMedicineInvoiceByPaymentQuery,
  useRequestRefillMutation,
  type MedicineInvoiceData,
  type MedicineOrderEnrichment,
  type MedicineOrderTrackingData,
  type TrackingItem,
} from '../store/api/new/medicinesApi';
import { useAppSelector } from '../store/hooks';
import {
  formatDate,
  formatMoney,
  formatTime,
  resolveApiUrl,
} from '../utilities/formatters';
import { getApiErrorMessage } from '../utilities/toast';

export type RefillFeeling = 'improved' | 'same' | 'worse' | 'returned';

export type OrderDetailItem = {
  id: string;
  /** Display name from API (not an i18n key). */
  name: string;
  detail: string;
  priceLabel: string;
};

export type OrderDetailsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  orderId: string;
  showDeliveredBanner: boolean;
  deliveredLine: string;
  items: OrderDetailItem[];
  subtotalLabel: string;
  deliveryLabel: string;
  totalPaidLabel: string;
  paymentMethodLine: string;
  rxId: string;
  doctorName: string;
  showFulfilledCard: boolean;
  pharmacyName: string;
  pharmacyArea: string;
  pharmacyLicense: string;
  pharmacyLicensed: boolean;
  pharmacyContactNote: string;
  canContactPharmacy: boolean;
  invoiceId: string;
  showInvoiceCard: boolean;
  showInvoiceDownload: boolean;
  invoiceBusy: boolean;
  invoiceMessage: string | null;
  rxValidTill: string;
  canRefill: boolean;
  refillOpen: boolean;
  refillMedicines: { id: string; name: string; selected: boolean }[];
  refillReason: string;
  refillFeeling: RefillFeeling | null;
  refillFeelings: { id: RefillFeeling; labelKey: TranslationKey }[];
  helpComingSoon: boolean;
  onBack: () => void;
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

const FEELINGS: OrderDetailsViewModel['refillFeelings'] = [
  { id: 'improved', labelKey: 'refillFeelingImproved' },
  { id: 'same', labelKey: 'refillFeelingSame' },
  { id: 'worse', labelKey: 'refillFeelingWorse' },
  { id: 'returned', labelKey: 'refillFeelingReturned' },
];

function moneyLabel(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  return formatMoney(amount, currency) ?? '';
}

function pickString(
  ...values: Array<string | null | undefined>
): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function deliveredAtFromSources(
  tracking: MedicineOrderTrackingData | undefined,
  history: MedicineOrderEnrichment | undefined,
): string | null {
  const direct =
    tracking?.deliveredAt?.trim() || history?.deliveredAt?.trim() || '';
  if (direct) return direct;
  const events = tracking?.events ?? [];
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const ev = events[i];
    if (ev?.status?.toUpperCase() === 'DELIVERED' && ev.at) {
      return ev.at;
    }
  }
  return null;
}

function mapItems(
  rawItems: TrackingItem[],
  currency: string | null | undefined,
): OrderDetailItem[] {
  return rawItems.map((item, index) => ({
    id: item.remedyCode || String(index),
    name:
      item.remedyName?.trim() ||
      item.remedyCode?.trim() ||
      `Item ${index + 1}`,
    detail: [item.potencyCode, item.quantityLabel].filter(Boolean).join(' · '),
    priceLabel: moneyLabel(item.lineAmount, currency),
  }));
}

async function openSecureDocumentPdf(
  secureDocumentId: number,
  fileLabel: string,
): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sign in required');
  }
  const url = resolveApiUrl(`/api/SecureDocument/${secureDocumentId}`);
  if (!url) {
    throw new Error('Invoice URL missing');
  }
  const dir = new Directory(Paths.cache, 'medicine-invoices');
  if (!dir.exists) {
    dir.create();
  }
  const safeName = `${fileLabel.replace(/[^\w.\-]+/g, '_').slice(0, 80) || 'invoice'}.pdf`;
  const destination = new File(dir, safeName);
  const downloaded = await File.downloadFileAsync(url, destination, {
    headers: { Authorization: `Bearer ${token}` },
    idempotent: true,
  });
  await Share.share({
    url: downloaded.uri,
    message: safeName,
    title: safeName,
  });
}

export function useOrderDetailsController({
  orderId,
  onBack,
  onReorder,
  onOpenPrescription,
}: {
  orderId: string;
  onBack: () => void;
  onReorder?: () => void;
  onOpenPrescription?: (erxSnapshotId: number) => void;
}): OrderDetailsViewModel {
  const { language, t } = useLocalization();
  const locale = language === 'mr' ? 'mr-IN' : 'en-IN';
  const [refillOpen, setRefillOpen] = useState(false);
  const [refillSelected, setRefillSelected] = useState<Record<string, boolean>>(
    {},
  );
  const [refillReason, setRefillReason] = useState('');
  const [refillFeeling, setRefillFeeling] = useState<RefillFeeling | null>(
    'improved',
  );
  const [refillMessage, setRefillMessage] = useState<string | null>(null);
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const invoiceBusyRef = useRef(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: ordersResponse } = useGetMedicineOrdersQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });
  const { data: historyResponse } = useGetMedicineOrderHistoryQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });
  const [requestRefill] = useRequestRefillMutation();
  const [createOrder] = useCreateMedicineOrderMutation();
  const [grantConsent] = useGrantMedicineConsentMutation();
  const [fetchInvoice] = useLazyGetMedicineInvoiceByPaymentQuery();
  const [createInvoice] = useCreateMedicineInvoiceByPaymentMutation();
  const numericOrderId = Number(String(orderId).replace(/\D/g, ''));
  const hasValidId = Number.isFinite(numericOrderId) && numericOrderId > 0;

  const { data: trackingResponse } = useGetMedicineOrderTrackingQuery(
    numericOrderId,
    {
      skip: !isAuthenticated || !hasValidId,
      refetchOnMountOrArgChange: true,
    },
  );

  const trackingData = trackingResponse?.data;
  const listMatch = useMemo(
    () =>
      (ordersResponse?.data ?? []).find(
        (row) => row.medicineOrderId === numericOrderId,
      ),
    [ordersResponse?.data, numericOrderId],
  );
  const historyMatch = useMemo(
    () =>
      (historyResponse?.data ?? []).find(
        (row) => row.medicineOrderId === numericOrderId,
      ),
    [historyResponse?.data, numericOrderId],
  );

  const currency =
    trackingData?.currency ?? historyMatch?.currency ?? 'INR';

  const rawItems =
    trackingData?.items ??
    trackingData?.lines ??
    historyMatch?.items ??
    [];
  const items: OrderDetailItem[] = useMemo(
    () => mapItems(rawItems, currency),
    [rawItems, currency],
  );

  const deliveredAt = deliveredAtFromSources(trackingData, historyMatch);
  /** Prompt: real deliveredAt or hide — do not invent a date from status alone. */
  const showDeliveredBanner = Boolean(deliveredAt);

  const deliveredLine = useMemo(() => {
    if (!deliveredAt) return '';
    const datePart = formatDate(deliveredAt, locale);
    const timePart = formatTime(deliveredAt, locale);
    const when = [datePart, timePart].filter(Boolean).join(', ');
    return when
      ? t('orderDetailDeliveredOn').replace('{when}', when)
      : t('orderDetailDelivered');
  }, [deliveredAt, locale, t]);

  const subtotalAmount =
    trackingData?.subtotalMedicines ??
    historyMatch?.subtotalMedicines ??
    trackingData?.quoteAmount ??
    historyMatch?.quoteAmount ??
    null;
  const totalAmount =
    trackingData?.totalPaid ??
    historyMatch?.totalPaid ??
    trackingData?.quoteAmount ??
    historyMatch?.quoteAmount ??
    null;
  const deliveryFee =
    trackingData?.deliveryFee ?? historyMatch?.deliveryFee ?? null;

  const subtotalLabel = moneyLabel(subtotalAmount, currency);
  const totalPaidLabel = moneyLabel(totalAmount, currency);
  /**
   * null = unknown → “Included” (never invent ₹0).
   * 0 = known free → show ₹0.
   */
  const deliveryLabel =
    deliveryFee == null
      ? t('orderDetailDeliveryIncluded')
      : (formatMoney(deliveryFee, currency) ?? '');

  const payMode = pickString(
    trackingData?.payMode,
    historyMatch?.payMode,
    listMatch?.payMode,
  );
  const paymentReference = pickString(
    trackingData?.paymentReference,
    historyMatch?.paymentReference,
  );
  const paymentMethodLine = payMode
    ? t('orderDetailPaymentMethodLine')
        .replace('{mode}', payMode)
        .replace('{ref}', paymentReference ? ` (${paymentReference})` : '')
    : '';

  const erxSnapshotIdRaw =
    Number(trackingData?.erxSnapshotId) > 0
      ? Number(trackingData?.erxSnapshotId)
      : Number(historyMatch?.erxSnapshotId) > 0
        ? Number(historyMatch?.erxSnapshotId)
        : Number(listMatch?.erxSnapshotId) > 0
          ? Number(listMatch?.erxSnapshotId)
          : null;
  const erxSnapshotId = erxSnapshotIdRaw;

  const rxId = pickString(
    trackingData?.rxLabel,
    historyMatch?.rxLabel,
    erxSnapshotId != null ? `eRx #${erxSnapshotId}` : '',
  );
  const doctorName = pickString(
    trackingData?.doctorName,
    historyMatch?.doctorName,
  );
  const showFulfilledCard = Boolean(rxId || doctorName);

  const pharmacyName = pickString(
    trackingData?.pharmacyName,
    historyMatch?.pharmacyName,
    listMatch?.pharmacyName,
  );
  const pharmacyArea = pickString(
    trackingData?.pharmacyArea,
    historyMatch?.pharmacyArea,
  );
  const pharmacyLicense = pickString(
    trackingData?.pharmacyLicenceNumber,
    historyMatch?.pharmacyLicenceNumber,
  );
  const pharmacyLicensed =
    trackingData?.pharmacyLicensed === true ||
    historyMatch?.pharmacyLicensed === true;
  const pharmacyContactMasked = pickString(
    trackingData?.pharmacyContactMasked,
    historyMatch?.pharmacyContactMasked,
  );
  const canContactPharmacy = Boolean(pharmacyContactMasked);
  const pharmacyContactNote = pharmacyContactMasked
    ? t('orderDetailMaskedNumber')
    : pharmacyName
      ? t('orderDetailContactUnavailable')
      : '';

  const invoiceNumber = pickString(
    trackingData?.invoiceNumber,
    historyMatch?.invoiceNumber,
    trackingData?.invoiceId != null
      ? String(trackingData.invoiceId)
      : historyMatch?.invoiceId != null
        ? String(historyMatch.invoiceId)
        : '',
  );
  const invoicePdfAvailable =
    trackingData?.invoicePdfAvailable === true ||
    historyMatch?.invoicePdfAvailable === true;
  const paymentOrderIdRaw =
    trackingData?.paymentOrderId ??
    historyMatch?.paymentOrderId ??
    listMatch?.paymentOrderId ??
    null;
  const paymentOrderId =
    paymentOrderIdRaw != null && Number(paymentOrderIdRaw) > 0
      ? Number(paymentOrderIdRaw)
      : null;
  const showInvoiceCard = Boolean(
    pharmacyName || invoiceNumber || paymentOrderId || invoicePdfAvailable,
  );
  const showInvoiceDownload =
    invoicePdfAvailable === true && paymentOrderId != null;

  const canRequestRefillFlag =
    trackingData?.canRequestRefill ?? historyMatch?.canRequestRefill;
  const canRefill =
    canRequestRefillFlag === true ||
    (canRequestRefillFlag !== false &&
      hasValidId &&
      erxSnapshotId != null);

  const refillMedicines = useMemo(() => {
    const source =
      items.length > 0
        ? items
        : rawItems.map((item, index) => ({
            id: item.remedyCode || String(index),
            name: item.remedyName?.trim() || `Item ${index + 1}`,
          }));
    return source.map((item, index) => {
      const id = 'id' in item ? item.id : String(index);
      const name = 'name' in item ? item.name : String(item);
      const selected =
        refillSelected[id] ?? (index === 0 && source.length > 0);
      return { id, name, selected };
    });
  }, [items, rawItems, refillSelected]);

  const showHelpComingSoon = () => {
    Alert.alert(t('orderDetailNeedHelp'), t('orderDetailHelpComingSoon'));
  };

  const resolveInvoice = useCallback(
    async (payId: number): Promise<MedicineInvoiceData | null> => {
      try {
        const existing = await fetchInvoice(payId).unwrap();
        if (existing.data?.secureDocumentId || existing.data?.invoiceId) {
          return existing.data ?? null;
        }
      } catch {
        /* 404 → try create */
      }
      try {
        const created = await createInvoice(payId).unwrap();
        return created.data ?? null;
      } catch {
        return null;
      }
    },
    [createInvoice, fetchInvoice],
  );

  const onDownloadInvoice = useCallback(() => {
    setInvoiceMessage(null);
    if (!showInvoiceDownload || paymentOrderId == null) {
      setInvoiceMessage(t('orderDetailInvoiceUnavailable'));
      return;
    }
    if (invoiceBusyRef.current) return;
    invoiceBusyRef.current = true;
    setInvoiceBusy(true);
    void (async () => {
      try {
        const invoice = await resolveInvoice(paymentOrderId);
        const docId = Number(invoice?.secureDocumentId);
        if (!Number.isFinite(docId) || docId <= 0) {
          setInvoiceMessage(
            invoice?.number
              ? t('orderDetailInvoiceReady').replace('{number}', invoice.number)
              : t('orderDetailInvoiceUnavailable'),
          );
          return;
        }
        await openSecureDocumentPdf(
          docId,
          invoice?.number || `invoice-${paymentOrderId}`,
        );
        setInvoiceMessage(null);
      } catch (err) {
        if (!getApiErrorMessage(err)) {
          setInvoiceMessage(t('orderDetailInvoiceUnavailable'));
        }
      } finally {
        invoiceBusyRef.current = false;
        setInvoiceBusy(false);
      }
    })();
  }, [
    paymentOrderId,
    resolveInvoice,
    showInvoiceDownload,
    t,
  ]);

  return {
    language,
    t,
    orderId: hasValidId ? `#HM-${numericOrderId}` : '',
    showDeliveredBanner,
    deliveredLine,
    items,
    subtotalLabel,
    deliveryLabel,
    totalPaidLabel,
    paymentMethodLine,
    rxId,
    doctorName,
    showFulfilledCard,
    pharmacyName,
    pharmacyArea,
    pharmacyLicense,
    pharmacyLicensed,
    pharmacyContactNote,
    canContactPharmacy,
    invoiceId: invoiceNumber,
    showInvoiceCard,
    showInvoiceDownload,
    invoiceBusy,
    invoiceMessage,
    rxValidTill: '',
    canRefill,
    refillOpen,
    refillMedicines,
    refillReason,
    refillFeeling,
    refillFeelings: FEELINGS,
    helpComingSoon: true,
    onBack,
    onOpenPrescription: () => {
      if (erxSnapshotId != null) {
        onOpenPrescription?.(erxSnapshotId);
      }
    },
    onContactPharmacy: () => {
      if (!pharmacyContactMasked) {
        Alert.alert(
          t('orderDetailContactPharmacy'),
          t('orderDetailContactUnavailable'),
        );
        return;
      }
      Alert.alert(
        t('orderDetailContactPharmacy'),
        `${t('orderDetailMaskedNumber')}\n${pharmacyContactMasked}`,
      );
    },
    onDownloadInvoice,
    onOpenRefill: () => setRefillOpen(true),
    onCloseRefill: () => setRefillOpen(false),
    onToggleRefillMedicine: (id) => {
      setRefillSelected((prev) => ({
        ...prev,
        [id]: !(prev[id] ?? refillMedicines.find((m) => m.id === id)?.selected),
      }));
    },
    onChangeRefillReason: setRefillReason,
    onSelectFeeling: setRefillFeeling,
    refillMessage,
    onSendRefill: () => {
      if (erxSnapshotId == null) {
        setRefillMessage(t('orderDetailRefillMissingRx'));
        return;
      }
      void requestRefill({ erxSnapshotId })
        .unwrap()
        .then(() => {
          setRefillMessage(t('orderDetailRefillSent'));
          setRefillOpen(false);
        })
        .catch(() => {
          setRefillMessage(t('orderDetailRefillMissingRx'));
        });
    },
    onHelpWrongItem: showHelpComingSoon,
    onHelpMissingItem: showHelpComingSoon,
    onHelpRefund: showHelpComingSoon,
    onReorder: () => {
      if (erxSnapshotId == null) {
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
