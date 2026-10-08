import { useCallback, useEffect, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  type ConsentItem,
  useGetConsentsQuery,
  useGrantConsentMutation,
  useWithdrawConsentMutation,
} from '../store/api/new/consentApi';

export type ConsentMemberId = 'self' | 'aarav';

export type ConsentCentreViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: ConsentMemberId;
  memberLabel: string;
  memberPickerOpen: boolean;
  members: { id: ConsentMemberId; labelKey: TranslationKey }[];
  consents: ConsentItem[];
  isLoading: boolean;
  isError: boolean;
  togglingConsentId: number | null;
  onBack: () => void;
  onHelp: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: ConsentMemberId) => void;
  onToggleConsent: (consentTypeId: number) => void;
  onRetry: () => void;
  onSeeCareLinkShared: () => void;
  onDataRight: (id: string) => void;
  onOpenRequest: () => void;
  onOpenHistory: () => void;
};

const MEMBERS: ConsentCentreViewModel['members'] = [
  { id: 'self', labelKey: 'consentCentreMemberSelf' },
  { id: 'aarav', labelKey: 'consentCentreMemberAarav' },
];

export function useConsentCentreController({
  active = true,
  onBack,
}: {
  active?: boolean;
  onBack: () => void;
}): ConsentCentreViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState<ConsentMemberId>('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
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
        // Toggle ON -> Grant
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
            `[ConsentCentre - POST Grant Consent] Error for consentTypeId ${consentTypeId}:`,
            error,
          );
        } finally {
          setTogglingConsentId(null);
        }
      } else {
        // Toggle OFF -> Withdraw
        if (!item.consentRecordId) {
          console.warn(
            `[ConsentCentre - POST Withdraw Consent] Cannot withdraw consentTypeId ${consentTypeId} because consentRecordId is missing.`,
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
            `[ConsentCentre - POST Withdraw Consent] Error for consentRecordId ${item.consentRecordId}:`,
            error,
          );
        } finally {
          setTogglingConsentId(null);
        }
      }
    },
    [consents, togglingConsentId, grantConsentMutation, withdrawConsentMutation],
  );

  const member = MEMBERS.find((item) => item.id === memberId) ?? MEMBERS[0];

  return {
    language,
    t,
    memberId,
    memberLabel: t(member.labelKey),
    memberPickerOpen,
    members: MEMBERS,
    consents,
    isLoading,
    isError,
    togglingConsentId,
    onBack,
    onHelp: () => undefined,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onToggleConsent: handleToggleConsent,
    onRetry: () => void refetch(),
    onSeeCareLinkShared: () => undefined,
    onDataRight: () => undefined,
    onOpenRequest: () => undefined,
    onOpenHistory: () => undefined,
  };
}
