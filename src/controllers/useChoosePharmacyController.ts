import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetPharmacySellersQuery } from '../store/api/new/medicinesApi';
import { useAppSelector } from '../store/hooks';

/** BE-010 — commercial sort fields stay null; no price/ETA/distance sorts. */
export type PharmacySortId = never;

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
  /** Empty when API price fields are null — hide in UI. */
  priceLabel: string;
  priceNoteKey?: TranslationKey;
  freeDelivery?: boolean;
};

export type EmptyAltId = 'pickup' | 'download';

export const AUTO_ROUTE_PHARMACY_ID = 'auto';

export type ChoosePharmacyViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  hasDelivery: boolean;
  pincode: string;
  pharmacyCount: number;
  /** Always empty — BE-010 commercial sorts not planned. */
  sortId: string | null;
  sorts: { id: string; labelKey: TranslationKey }[];
  pharmacies: PharmacyOption[];
  selectedPharmacyId: string | null;
  selectedPharmacy: PharmacyOption | null;
  emptyAltId: EmptyAltId | null;
  canContinue: boolean;
  isLoading: boolean;
  isError: boolean;
  notice: string | null;
  onRetry: () => void;
  onBack: () => void;
  onToggleLanguage: () => void;
  onSelectSort: (id: string) => void;
  onSelectPharmacy: (id: string) => void;
  onViewBreakdown: (id: string) => void;
  onNotifyDelivery: () => void;
  onSelectEmptyAlt: (id: EmptyAltId) => void;
  onContinue: () => void;
};

export function useChoosePharmacyController({
  onBack,
  onContinue,
  hasDelivery = true,
  pincode = '',
  notice = null,
  continueBusy = false,
}: {
  onBack: () => void;
  onContinue?: (pharmacyId: string) => void;
  hasDelivery?: boolean;
  pincode?: string;
  notice?: string | null;
  continueBusy?: boolean;
}): ChoosePharmacyViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(
    AUTO_ROUTE_PHARMACY_ID,
  );
  const [emptyAltId, setEmptyAltId] = useState<EmptyAltId | null>(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    data: sellersResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPharmacySellersQuery(undefined, {
    skip: !isAuthenticated,
  });

  const pharmacies = useMemo(() => {
    const rows = sellersResponse?.data;
    if (!Array.isArray(rows) || rows.length === 0) {
      return [] as PharmacyOption[];
    }
    // Contract: priceTotal, deliveryFee, etaMinutes, fulfilPercent, distanceKm,
    // serviceable are null — show name and area only.
    return rows.map((row) => {
      const name = (row.name || '').trim() || 'Pharmacy';
      const area = (row.area || '').trim();
      return {
        id: String(row.pharmacyPartnerId),
        nameKey: name as TranslationKey,
        licenceKey: '' as TranslationKey,
        metaKey: (area || '') as TranslationKey,
        tone: 'full' as PharmacyFulfilTone,
        fulfilKey: '' as TranslationKey,
        etaKey: '' as TranslationKey,
        priceLabel: '',
      };
    });
  }, [sellersResponse?.data]);

  useEffect(() => {
    if (
      selectedPharmacyId &&
      selectedPharmacyId !== AUTO_ROUTE_PHARMACY_ID &&
      !pharmacies.some((p) => p.id === selectedPharmacyId)
    ) {
      setSelectedPharmacyId(AUTO_ROUTE_PHARMACY_ID);
    }
  }, [pharmacies, selectedPharmacyId]);

  const selectedPharmacy =
    pharmacies.find((item) => item.id === selectedPharmacyId) ?? null;

  return {
    language,
    t,
    hasDelivery,
    pincode,
    pharmacyCount: pharmacies.length,
    sortId: null,
    sorts: [],
    pharmacies,
    selectedPharmacyId,
    selectedPharmacy,
    emptyAltId,
    canContinue: continueBusy
      ? false
      : hasDelivery
        ? selectedPharmacyId === AUTO_ROUTE_PHARMACY_ID || Boolean(selectedPharmacy)
        : Boolean(emptyAltId),
    isLoading,
    isError,
    notice,
    onRetry: () => {
      void refetch();
    },
    onBack,
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onSelectSort: () => undefined,
    onSelectPharmacy: setSelectedPharmacyId,
    onViewBreakdown: () => undefined,
    onNotifyDelivery: () => undefined,
    onSelectEmptyAlt: setEmptyAltId,
    onContinue: () => {
      if (hasDelivery ? selectedPharmacyId : emptyAltId) {
        onContinue?.(selectedPharmacyId ?? '');
      }
    },
  };
}
