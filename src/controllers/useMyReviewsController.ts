import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ReviewStatus = 'published' | 'moderation' | 'rejected';

export type MyReviewItem = {
  id: string;
  doctorName: string;
  dateLabel: string;
  rating: number;
  quoteKey: TranslationKey;
  status: ReviewStatus;
  footerKey: TranslationKey;
  struck?: boolean;
  canAppeal?: boolean;
};

export type MyReviewsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  pendingDoctor: string;
  pendingDate: string;
  reviews: MyReviewItem[];
  onBack: () => void;
  onRatePending: () => void;
  onAppeal: (reviewId: string) => void;
  onSeeWhy: (reviewId: string) => void;
};

const REVIEWS: MyReviewItem[] = [
  {
    id: 'pub-1',
    doctorName: 'Dr. Anjali Deshmukh',
    dateLabel: '28 Aug',
    rating: 5,
    quoteKey: 'myReviewsQuotePublished',
    status: 'published',
    footerKey: 'myReviewsPublishedFooter',
  },
  {
    id: 'mod-1',
    doctorName: 'Dr. Rajesh Pawar',
    dateLabel: '26 Aug',
    rating: 4,
    quoteKey: 'myReviewsQuoteModeration',
    status: 'moderation',
    footerKey: 'myReviewsModerationFooter',
  },
  {
    id: 'rej-1',
    doctorName: 'Dr. S. Kulkarni',
    dateLabel: '24 Aug',
    rating: 3,
    quoteKey: 'myReviewsQuoteRejected',
    status: 'rejected',
    footerKey: 'myReviewsRejectedFooter',
    struck: true,
    canAppeal: true,
  },
];

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
  const [reviews] = useState(REVIEWS);

  return {
    language,
    t,
    pendingDoctor: 'Dr. Anjali Deshmukh',
    pendingDate: '30 Aug',
    reviews,
    onBack,
    onRatePending: () => onRatePending?.(),
    onAppeal: (reviewId) => onAppeal?.(reviewId),
    onSeeWhy: (reviewId) => onAppeal?.(reviewId),
  };
}
