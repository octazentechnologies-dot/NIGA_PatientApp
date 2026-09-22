import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

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
  onBack,
  onSubmitted,
}: {
  onBack: () => void;
  onSubmitted?: () => void;
}): AppealReviewViewModel {
  const { language, t } = useLocalization();
  const [action, setAction] = useState<AppealAction>('appeal');
  const [reason, setReason] = useState('');

  const canSubmit = useMemo(() => {
    if (action === 'edit') {
      return true;
    }
    return reason.trim().length >= 8;
  }, [action, reason]);

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
      if (!canSubmit) {
        return;
      }
      onSubmitted?.();
      onBack();
    },
  };
}
