import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppealReviewMutation } from '../store/api/new/supportApi';

export type AppealAction = 'edit' | 'appeal';

export type AppealReviewViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  action: AppealAction;
  reason: string;
  canSubmit: boolean;
  removedOnLabel: string;
  reasonLabel: string;
  decisionId: string;
  extractBefore: string;
  extractHighlight: string;
  extractAfter: string;
  onBack: () => void;
  onSelectAction: (action: AppealAction) => void;
  onChangeReason: (value: string) => void;
  onSubmit: () => void;
};

export function useAppealReviewController({
  reviewId,
  onBack,
  onSubmitted,
}: {
  reviewId?: string | null;
  onBack: () => void;
  onSubmitted?: () => void;
}): AppealReviewViewModel {
  const { language, t } = useLocalization();
  const [action, setAction] = useState<AppealAction>('appeal');
  const [reason, setReason] = useState('');
  const [appealReview, { isLoading }] = useAppealReviewMutation();

  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (action === 'edit') {
      return Boolean(reviewId);
    }
    // Contract: reason must be at least 3 characters.
    return Boolean(reviewId) && reason.trim().length >= 3;
  }, [action, isLoading, reason, reviewId]);

  return {
    language,
    t,
    action,
    reason,
    canSubmit,
    removedOnLabel: t('appealRemovedOn'),
    reasonLabel: t('appealRemovalReason'),
    decisionId: t('appealDecisionId'),
    extractBefore: t('appealExtractBefore'),
    extractHighlight: t('appealExtractHighlight'),
    extractAfter: t('appealExtractAfter'),
    onBack,
    onSelectAction: setAction,
    onChangeReason: setReason,
    onSubmit: () => {
      if (!canSubmit || !reviewId) {
        return;
      }
      void appealReview({ reviewId, reason: reason.trim() || 'Appeal' })
        .unwrap()
        .then(() => {
          onSubmitted?.();
          onBack();
        })
        .catch(() => undefined);
    },
  };
}
