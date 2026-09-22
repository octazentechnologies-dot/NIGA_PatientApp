import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type PharmacySortId = 'fastest' | 'price' | 'nearest';

export type PharmacyFulfilTone = 'full' | 'partial' | 'pickup';

export type PharmacyOption = {
  id: string;
  nameKey: TranslationKey;
  licenceKey: TranslationKey;
  metaKey: TranslationKey;
  tone: PharmacyFulfilTone;
  fulfilKey: TranslationKey;
  fulfilDetailKey?: TranslationKey;
  etaKey: TranslationKey;
  ratingKey?: TranslationKey;
  priceLabel: string;
  priceNoteKey?: TranslationKey;
  freeDelivery?: boolean;
};

export type EmptyAltId = 'pickup' | 'download';

export type ChoosePharmacyViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  hasDelivery: boolean;
  pincode: string;
  pharmacyCount: number;
  sortId: PharmacySortId;
  sorts: { id: PharmacySortId; labelKey: TranslationKey }[];
  pharmacies: PharmacyOption[];
  selectedPharmacyId: string | null;
  selectedPharmacy: PharmacyOption | null;
  emptyAltId: EmptyAltId | null;
  canContinue: boolean;
  onBack: () => void;
  onToggleLanguage: () => void;
  onSelectSort: (id: PharmacySortId) => void;
  onSelectPharmacy: (id: string) => void;
  onViewBreakdown: (id: string) => void;
  onNotifyDelivery: () => void;
  onSelectEmptyAlt: (id: EmptyAltId) => void;
  onContinue: () => void;
};

const SORTS: ChoosePharmacyViewModel['sorts'] = [
  { id: 'fastest', labelKey: 'pharmacySortFastest' },
  { id: 'price', labelKey: 'pharmacySortPrice' },
  { id: 'nearest', labelKey: 'pharmacySortNearest' },
];

const PHARMACIES: PharmacyOption[] = [
  {
    id: 'shree',
    nameKey: 'pharmacyShreeName',
    licenceKey: 'pharmacyShreeLicence',
    metaKey: 'pharmacyShreeMeta',
    tone: 'full',
    fulfilKey: 'pharmacyFulfilAll',
    etaKey: 'pharmacyEta4560',
    ratingKey: 'pharmacyShreeRating',
    priceLabel: '₹310',
  },
  {
    id: 'sai',
    nameKey: 'pharmacySaiName',
    licenceKey: 'pharmacySaiLicence',
    metaKey: 'pharmacySaiMeta',
    tone: 'partial',
    fulfilKey: 'pharmacyFulfilPartial',
    fulfilDetailKey: 'pharmacyFulfilPartialDetail',
    etaKey: 'pharmacyEtaTomorrow',
    priceLabel: '₹280',
    priceNoteKey: 'pharmacyTotalInclDelivery',
  },
  {
    id: 'wellness',
    nameKey: 'pharmacyWellnessName',
    licenceKey: 'pharmacyWellnessLicence',
    metaKey: 'pharmacyWellnessMeta',
    tone: 'pickup',
    fulfilKey: 'pharmacyPickupToday',
    etaKey: 'pharmacyPickupEta',
    priceLabel: '₹290',
    priceNoteKey: 'pharmacyMedicinesOnly',
    freeDelivery: true,
  },
];

export function useChoosePharmacyController({
  onBack,
  onContinue,
  hasDelivery = true,
  pincode = '413001',
}: {
  onBack: () => void;
  onContinue?: () => void;
  hasDelivery?: boolean;
  pincode?: string;
}): ChoosePharmacyViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [sortId, setSortId] = useState<PharmacySortId>('fastest');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(
    hasDelivery ? 'shree' : null,
  );
  const [emptyAltId, setEmptyAltId] = useState<EmptyAltId | null>(null);

  const pharmacies = useMemo(() => {
    const list = [...PHARMACIES];
    if (sortId === 'price') {
      return list.sort(
        (a, b) =>
          Number(a.priceLabel.replace(/[^\d]/g, '')) -
          Number(b.priceLabel.replace(/[^\d]/g, '')),
      );
    }
    if (sortId === 'nearest') {
      return [list[0], list[2], list[1]];
    }
    return list;
  }, [sortId]);

  const selectedPharmacy =
    pharmacies.find((item) => item.id === selectedPharmacyId) ?? null;

  return {
    language,
    t,
    hasDelivery,
    pincode,
    pharmacyCount: PHARMACIES.length,
    sortId,
    sorts: SORTS,
    pharmacies,
    selectedPharmacyId,
    selectedPharmacy,
    emptyAltId,
    canContinue: hasDelivery
      ? Boolean(selectedPharmacyId)
      : Boolean(emptyAltId),
    onBack,
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onSelectSort: setSortId,
    onSelectPharmacy: setSelectedPharmacyId,
    onViewBreakdown: () => undefined,
    onNotifyDelivery: () => undefined,
    onSelectEmptyAlt: setEmptyAltId,
    onContinue: () => {
      if (hasDelivery ? selectedPharmacyId : emptyAltId) {
        onContinue?.();
      }
    },
  };
}
