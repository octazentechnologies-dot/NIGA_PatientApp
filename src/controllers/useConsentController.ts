import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import {
  type ConsentItem,
  useGetConsentsQuery,
  useGrantConsentMutation,
  useWithdrawConsentMutation,
} from '../store/api/new/consentApi';
import {
  useGetConsentNoticeQuery,
  useGetPrivacyStatusQuery,
  useGrantPrivacyConsentMutation,
} from '../store/api/new/privacyConsentApi';

export type ConsentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  consents: ConsentItem[];
  isLoading: boolean;
  isError: boolean;
  togglingConsentId: number | null;
  noticeOpen: boolean;
  noticeTitle?: string;
  noticeBody?: string;
  noticeVersion?: string;
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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [togglingConsentId, setTogglingConsentId] = useState<number | null>(null);

  const {
    data: remoteConsents,
    isLoading: isConsentsLoading,
    isError: isConsentsError,
    refetch,
  } = useGetConsentsQuery(undefined, { skip: !active || !isAuthenticated });

  const {
    data: privacyStatusResponse,
    isLoading: isPrivacyLoading,
    isError: isPrivacyError,
  } = useGetPrivacyStatusQuery(undefined, { skip: !active || !isAuthenticated });

  const privacyData = privacyStatusResponse?.data;

  const { data: noticeResponse } = useGetConsentNoticeQuery(
    { consentTypeCode: 'DataPrivacy', language },
    { skip: !active || !isAuthenticated },
  );

  const [grantPrivacyConsent] = useGrantPrivacyConsentMutation();
  const [grantConsentMutation] = useGrantConsentMutation();
  const [withdrawConsentMutation] = useWithdrawConsentMutation();

  const [consents, setConsents] = useState<ConsentItem[]>([]);

  useEffect(() => {
    if (remoteConsents) {
      setConsents(remoteConsents);
    }
  }, [remoteConsents]);

  const handleAgree = useCallback(async () => {
    // If privacy consent is required and not granted, grant it now
    if (privacyData && (!privacyData.granted || privacyData.reconsentRequired)) {
      try {
        await grantPrivacyConsent({
          noticeVersion: noticeResponse?.data?.version ?? privacyData.currentNoticeVersion ?? '1.0',
          noticeLanguage: language,
        }).unwrap();
      } catch (err) {
        console.warn('[POST Grant Privacy] Warning granting privacy consent:', err);
      }
    }
    onAgree();
  }, [privacyData, grantPrivacyConsent, noticeResponse, language, onAgree]);

  const handleToggleConsent = useCallback(
    async (consentTypeId: number) => {
      const item = consents.find((c) => c.consentTypeId === consentTypeId);
      if (!item || togglingConsentId === consentTypeId) {
        return;
      }

      setTogglingConsentId(consentTypeId);

      // B-021 — Caregiver is managed via Caregiver APIs, never Consents Grant.
      if ((item.code || '').toLowerCase() === 'caregiver') {
        Alert.alert(
          'Caregiver',
          item.manageLink
            ? 'Manage caregiver access from the Caregiver page.'
            : 'Caregiver access is managed separately.',
        );
        setTogglingConsentId(null);
        return;
      }

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
          const err = error as {
            status?: number;
            data?: { code?: string; message?: string };
          };
          const message =
            err?.data?.message ||
            (err?.status === 409
              ? 'This consent must be managed from the Caregiver page.'
              : 'Could not update consent.');
          console.error(
            `[POST Grant Consent] Error for consentTypeId ${consentTypeId}:`,
            error,
          );
          Alert.alert('Consent', message);
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
    isLoading: isConsentsLoading || isPrivacyLoading,
    isError: isConsentsError && isPrivacyError,
    togglingConsentId,
    noticeOpen,
    noticeTitle: noticeResponse?.data?.title,
    noticeBody: noticeResponse?.data?.body,
    noticeVersion: noticeResponse?.data?.version,
    onToggleConsent: handleToggleConsent,
    onRetry: () => void refetch(),
    onReadNotice: () => setNoticeOpen(true),
    onCloseNotice: () => setNoticeOpen(false),
    onAgree: handleAgree,
    onManageLater,
    onSelectLanguage: setLanguage,
    onBack,
  };
}
