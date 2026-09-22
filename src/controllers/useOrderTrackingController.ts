import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type OrderTrackingStatus =
  | 'verifying'
  | 'out_for_delivery'
  | 'failed'
  | 'delivered';

export type TrackingStepId =
  | 'placed'
  | 'packed'
  | 'verified'
  | 'out'
  | 'home';

export type OrderTrackingViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  orderId: string;
  status: OrderTrackingStatus;
  otpDigits: string[];
  partnerName: string;
  partnerRating: string;
  distanceAway: string;
  arrivingBy: string;
  deliveredAt: string;
  rating: number;
  medicineLine: string;
  medicinePrice: string;
  deliveryFee: string;
  totalLabel: string;
  onBack: () => void;
  onSupport: () => void;
  onCallPartner: () => void;
  onChatPartner: () => void;
  onReschedule: () => void;
  onSwitchPickup: () => void;
  onDownloadInvoice: () => void;
  onSelectRating: (value: number) => void;
  onSetStatus: (status: OrderTrackingStatus) => void;
};

const OTP = ['4', '7', '2', '9'];

export function useOrderTrackingController({
  onBack,
}: {
  onBack: () => void;
}): OrderTrackingViewModel {
  const { language, t } = useLocalization();
  const [status, setStatus] = useState<OrderTrackingStatus>('out_for_delivery');
  const [rating, setRating] = useState(0);

  return {
    language,
    t,
    orderId: '#HM-4821',
    status,
    otpDigits: language === 'mr' ? ['४', '७', '२', '९'] : OTP,
    partnerName: t('trackPartnerName'),
    partnerRating: '4.8',
    distanceAway: t('trackDistanceAway'),
    arrivingBy: t('trackArrivingBy'),
    deliveredAt: t('trackDeliveredAt'),
    rating,
    medicineLine: t('trackMedsLine'),
    medicinePrice: '₹185.00',
    deliveryFee: '₹14.00',
    totalLabel: '₹199.00',
    onBack,
    onSupport: () => undefined,
    onCallPartner: () => undefined,
    onChatPartner: () => undefined,
    onReschedule: () => undefined,
    onSwitchPickup: () => undefined,
    onDownloadInvoice: () => undefined,
    onSelectRating: setRating,
    onSetStatus: setStatus,
  };
}

export function trackingStepIndex(status: OrderTrackingStatus): number {
  switch (status) {
    case 'verifying':
      return 2;
    case 'out_for_delivery':
    case 'failed':
      return 3;
    case 'delivered':
      return 4;
    default:
      return 0;
  }
}
