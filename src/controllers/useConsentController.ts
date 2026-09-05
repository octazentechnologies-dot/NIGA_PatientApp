import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ConsentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  shareHealthRecords: boolean;
  medicineFulfilment: boolean;
  updatesAndTips: boolean;
  noticeOpen: boolean;
  onToggleShareHealthRecords: () => void;
  onToggleMedicineFulfilment: () => void;
  onToggleUpdatesAndTips: () => void;
  onReadNotice: () => void;
  onCloseNotice: () => void;
  onAgree: () => void;
  onManageLater: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onBack: () => void;
};

export function useConsentController({
  onBack,
  onAgree,
  onManageLater,
}: {
  onBack: () => void;
  onAgree: () => void;
  onManageLater: () => void;
}): ConsentViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [shareHealthRecords, setShareHealthRecords] = useState(true);
  const [medicineFulfilment, setMedicineFulfilment] = useState(false);
  const [updatesAndTips, setUpdatesAndTips] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  return {
    language,
    t,
    shareHealthRecords,
    medicineFulfilment,
    updatesAndTips,
    noticeOpen,
    onToggleShareHealthRecords: () =>
      setShareHealthRecords((current) => !current),
    onToggleMedicineFulfilment: () =>
      setMedicineFulfilment((current) => !current),
    onToggleUpdatesAndTips: () => setUpdatesAndTips((current) => !current),
    onReadNotice: () => setNoticeOpen(true),
    onCloseNotice: () => setNoticeOpen(false),
    onAgree,
    onManageLater,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
