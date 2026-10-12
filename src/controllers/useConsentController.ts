import { useCallback, useEffect, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  type ConsentItem,
  useGetConsentsQuery,
  useGrantConsentMutation,
  useWithdrawConsentMutation,
} from '../store/api/new/consentApi';

export type ConsentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  consents: ConsentItem[];
  isLoading: boolean;
  isError: boolean;
  togglingConsentId: number | null;
  noticeOpen: boolean;
  onToggleConsent: (consentTypeId: number) => void;
  onRetry: () => void;
  onReadNotice: () => void;
  onCloseNotice: () => void;
  onAgree: () => void;
  onManageLater: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onBack: () => void;
};

export function useConsentController({
  active = true,
  onBack,
  onAgree,
  onManageLater,
}: {
  active?: boolean;
  onBack: () => void;
  onAgree: () => void;
  onManageLater: () => void;
}): ConsentViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [togglingConsentId, setTogglingConsentId] = useState<number | null>(null);

  const {
    data: remoteConsents,
    isLoading,
    isError,
    refetch,
  } = useGetConsentsQuery(undefined, { skip: !active });

  const [grantConsentMutation] = useGrantConsentMutation();
  const [withdrawConsentMutation] = useWithdrawConsentMutation();

  const [consents, setConsents] = useState<ConsentItem[]>([]);

  useEffect(() => {
    if (remoteConsents) {
      setConsents(remoteConsents);
    }
  }, [remoteConsents]);

  const handleToggleConsent = useCallback(
    async (consentTypeId: number) => {
      const item = consents.find((c) => c.consentTypeId === consentTypeId);
      if (!item || togglingConsentId === consentTypeId) {
        return;
      }

      setTogglingConsentId(consentTypeId);

      if (!item.granted) {
        // Switch ON -> Call Grant API
        try {
          const res = await grantConsentMutation(consentTypeId).unwrap();
          setConsents((prev) =>
            prev.map((c) =>
              c.consentTypeId === consentTypeId
                ? {
                  ...c,
                  granted: true,
                  consentRecordId:
                    res.data?.consentRecordId ?? c.consentRecordId,
                  grantedAt: res.data?.grantedAt ?? c.grantedAt,
                }
                : c,
            ),
          );
        } catch (error) {
          console.error(
            `[POST Grant Consent] Error for consentTypeId ${consentTypeId}:`,
            error,
          );
        } finally {
          setTogglingConsentId(null);
        }
      } else {
        // Switch OFF -> Call Withdraw API
        if (!item.consentRecordId) {
          console.warn(
            `[POST Withdraw Consent] Cannot withdraw consentTypeId ${consentTypeId} because consentRecordId is missing.`,
          );
          setTogglingConsentId(null);
          return;
        }

        try {
          const res = await withdrawConsentMutation(
            item.consentRecordId,
          ).unwrap();
          setConsents((prev) =>
            prev.map((c) =>
              c.consentTypeId === consentTypeId
                ? {
                  ...c,
                  granted: false,
                  consentRecordId: null,
                  withdrawnAt: new Date().toISOString(),
                }
                : c,
            ),
          );
        } catch (error) {
          console.error(
            `[POST Withdraw Consent] Error for consentRecordId ${item.consentRecordId}:`,
            error,
          );
        } finally {
          setTogglingConsentId(null);
        }
      }
    },
    [consents, togglingConsentId, grantConsentMutation, withdrawConsentMutation],
  );

  return {
    language,
    t,
    consents,
    isLoading,
    isError,
    togglingConsentId,
    noticeOpen,
    onToggleConsent: handleToggleConsent,
    onRetry: () => void refetch(),
    onReadNotice: () => setNoticeOpen(true),
    onCloseNotice: () => setNoticeOpen(false),
    onAgree,
    onManageLater,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
