import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { resolveBookingMembers } from '../config/appointmentSlots';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import {
  type ConsentItem,
  useCreateDataRequestMutation,
  useGetConsentsQuery,
  useGrantConsentMutation,
  useWithdrawConsentMutation,
} from '../store/api/new/consentApi';
import { useGetFamilyQuery } from '../store/api/new/familyApi';
import { useGetHomeDashboardQuery } from '../store/api/new/homeApi';

export type ConsentCentreMember = {
  id: string;
  label: string;
};

export type ConsentCentreViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: string;
  memberLabel: string;
  memberPickerOpen: boolean;
  members: ConsentCentreMember[];
  consents: ConsentItem[];
  isLoading: boolean;
  isError: boolean;
  togglingConsentId: number | null;
  onBack: () => void;
  onHelp: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: string) => void;
  onToggleConsent: (consentTypeId: number) => void;
  onRetry: () => void;
  onSeeCareLinkShared: () => void;
  onDataRight: (id: string) => void;
  onOpenRequest: () => void;
  onOpenHistory: () => void;
};

export function useConsentCentreController({
  active = true,
  onBack,
}: {
  active?: boolean;
  onBack: () => void;
}): ConsentCentreViewModel {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [togglingConsentId, setTogglingConsentId] = useState<number | null>(null);

  const { data: homeDashboardResponse } = useGetHomeDashboardQuery(undefined, {
    skip: !active || !isAuthenticated,
  });
  const patientFullName =
    homeDashboardResponse?.data?.patientName ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');

  const { data: familyResponse } = useGetFamilyQuery(undefined, {
    skip: !active || !isAuthenticated,
  });
  const apiFamily = familyResponse?.data;

  const members = useMemo<ConsentCentreMember[]>(() => {
    const bookingMembers = resolveBookingMembers(
      patientFullName,
      undefined,
      apiFamily,
    );
    return bookingMembers.map((member) => ({
      id: member.id,
      label: member.self
        ? t('consentCentreMemberSelf')
        : member.name.split(' ')[0] || member.name,
    }));
  }, [apiFamily, patientFullName, t]);

  useEffect(() => {
    if (!members.some((member) => member.id === memberId)) {
      setMemberId(members[0]?.id ?? 'self');
    }
  }, [memberId, members]);

  const {
    data: remoteConsents,
    isLoading,
    isError,
    refetch,
  } = useGetConsentsQuery(undefined, { skip: !active || !isAuthenticated });

  const [grantConsentMutation] = useGrantConsentMutation();
  const [withdrawConsentMutation] = useWithdrawConsentMutation();
  const [createDataRequestMutation] = useCreateDataRequestMutation();

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
        // BE-033 — Caregiver must use Caregiver/Grant, never Types/{id}/Grant.
        if ((item.code || '').trim().toLowerCase() === 'caregiver') {
          Alert.alert(
            'Caregiver',
            'Manage caregiver access from the Caregiver screen.',
          );
          setTogglingConsentId(null);
          if (item.manageLink === '/caregiver' || item.manageLink) {
            // Navigation to caregiver is handled by onSeeCareLinkShared when wired.
          }
          return;
        }
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
            `[ConsentCentre - POST Grant Consent] Error for consentTypeId ${consentTypeId}:`,
            error,
          );
          Alert.alert('Consent', message);
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
          await withdrawConsentMutation(item.consentRecordId).unwrap();
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

  const member = members.find((item) => item.id === memberId) ?? members[0];

  return {
    language,
    t,
    memberId,
    memberLabel: member?.label ?? t('consentCentreMemberSelf'),
    memberPickerOpen,
    members,
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
    onDataRight: (id: string) => {
      if (isAuthenticated) {
        const reqType = id === 'delete' ? 'DELETE' : 'EXPORT';
        void createDataRequestMutation({ requestType: reqType });
      }
    },
    onOpenRequest: () => undefined,
    onOpenHistory: () => undefined,
  };
}
