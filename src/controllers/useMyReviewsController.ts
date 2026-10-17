import { useMemo } from 'react';

import { mapAppealStatus } from '../constants/statusMaps';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetMyReviewsQuery } from '../store/api/new/supportApi';

export type ReviewStatus = 'published' | 'moderation' | 'rejected';

export type MyReviewItem = {
  id: string;
  doctorName: string;
  dateLabel: string;
  rating: number;
  /** API review text — render with AppText raw. */
  quoteText: string;
  status: ReviewStatus;
  footerKey: TranslationKey;
  struck?: boolean;
  /** BE-017 — hide Appeal when appealStatus is set. */
  canAppeal?: boolean;
  appealStatusLabel?: string;
};

export type MyReviewsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  pendingDoctor: string;
  pendingDate: string;
  reviews: MyReviewItem[];
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onRatePending: () => void;
  onAppeal: (reviewId: string) => void;
  onSeeWhy: (reviewId: string) => void;
  onRetry: () => void;
};

function mapStatus(raw: string | null | undefined): ReviewStatus {
  const s = (raw || '').toUpperCase();
  if (s === 'APPROVED' || s === 'PUBLISHED') return 'published';
  if (s === 'REJECTED' || s === 'REMOVED') return 'rejected';
  return 'moderation';
}

function formatReviewDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  } catch {
    return value;
  }
}

export function useMyReviewsController({
  onBack,
  onRatePending,
  onAppeal,
}: {
  onBack: () => void;
  onRatePending?: () => void;
  onAppeal?: (reviewId: string) => void;
}): MyReviewsViewModel {
  const { language, t } = useLocalization();
  const { data, isLoading, isError, refetch } = useGetMyReviewsQuery();

  const reviews = useMemo<MyReviewItem[]>(() => {
    const rows = data?.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      const status = mapStatus(row.status);
      const appeal = row.appealStatus ?? null;
      return {
        id: String(row.reviewId),
        doctorName: (row.doctorName || '').trim() || 'Doctor',
        dateLabel: formatReviewDate(row.at || row.createdAt),
        rating: typeof row.rating === 'number' ? row.rating : 0,
        quoteText: (row.text || '').trim(),
        status,
        footerKey:
          status === 'published'
            ? ('myReviewsPublishedFooter' as TranslationKey)
            : status === 'rejected'
              ? ('myReviewsRejectedFooter' as TranslationKey)
              : ('myReviewsModerationFooter' as TranslationKey),
        struck: status === 'rejected',
        // Appeal only when rejected and no prior appeal (BE-017).
        canAppeal: status === 'rejected' && appeal == null,
        appealStatusLabel: appeal
          ? mapAppealStatus(appeal).label || String(appeal)
          : '',
      };
    });
  }, [data?.data]);

  return {
    language,
    t,
    pendingDoctor: '',
    pendingDate: '',
    reviews,
    isLoading,
    isError,
    onBack,
    onRatePending: () => onRatePending?.(),
    onAppeal: (reviewId) => onAppeal?.(reviewId),
    onSeeWhy: (reviewId) => onAppeal?.(reviewId),
    onRetry: () => {
      void refetch();
    },
  };
}
