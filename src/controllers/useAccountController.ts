import { useState } from 'react';

import { appReleaseNotes, appVersionLabel } from '../config/release';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppSelector } from '../store/hooks';
import {
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
} from '../store/api/new/patientProfileApi';
import {
  useCreateDataRequestMutation,
  useGetDataRequestsQuery,
} from '../store/api/new/consentApi';
import { messageFromUnknownError } from '../utilities/apiResponse';

export type DataRequestHistoryRow = {
  id: string;
  typeLabel: string;
  statusLabel: string;
  createdAt: string;
};

export type AccountViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  profileName: string;
  profileInitials: string;
  profilePhone: string;
  astroEnabled: boolean;
  lowDataMode: boolean;
  languagePickerOpen: boolean;
  languageValue: string;
  appVersionLabel: string;
  appReleaseNotes: string;
  onEditProfile: () => void;
  onOpenRow: (id: string) => void;
  onToggleAstro: () => void;
  onToggleLowData: () => void;
  onOpenLanguagePicker: () => void;
  onCloseLanguagePicker: () => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onLogOut: () => void;
  onDeleteAccount: () => void;
  dataRequestMessage: string | null;
  dataRequestBusy: boolean;
  dataRequestHistory: DataRequestHistoryRow[];
  dataRequestsOpen: boolean;
  onCloseDataRequests: () => void;
};

export function useAccountController({
  onLogOut,
  onOpenHealthInsights,
  onOpenReminders,
  onOpenEditProfile,
  onOpenFamilyMembers,
  onOpenAppointments,
  onOpenPrescriptions,
  onOpenHealthRecords,
  onOpenPayments,
  onOpenConsentCentre,
  onOpenNotificationSettings,
  onOpenMyReviews,
  onOpenHelpCentre,
  onOpenBookWithHelp,
  onOpenLegalDoc,
}: {
  onLogOut: () => void;
  onOpenHealthInsights?: () => void;
  onOpenReminders?: () => void;
  onOpenEditProfile?: () => void;
  onOpenFamilyMembers?: () => void;
  onOpenAppointments?: () => void;
  onOpenPrescriptions?: () => void;
  onOpenHealthRecords?: () => void;
  onOpenPayments?: () => void;
  onOpenConsentCentre?: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenMyReviews?: () => void;
  onOpenHelpCentre?: () => void;
  onOpenBookWithHelp?: () => void;
  onOpenLegalDoc?: (doc: 'terms' | 'privacy' | 'about') => void;
} = { onLogOut: () => undefined }): AccountViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [astroEnabled, setAstroEnabled] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(true);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [dataRequestMessage, setDataRequestMessage] = useState<string | null>(
    null,
  );
  const [dataRequestBusy, setDataRequestBusy] = useState(false);
  const [dataRequestsOpen, setDataRequestsOpen] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const authMobile = useAppSelector((state) => state.auth.mobile);

  const { data: profileQueryResponse } = useGetPatientProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updatePatientProfile] = useUpdatePatientProfileMutation();
  const [createDataRequestMutation] = useCreateDataRequestMutation();
  const { data: dataRequestsList } = useGetDataRequestsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dataRequestHistory: DataRequestHistoryRow[] = (dataRequestsList ?? []).map(
    (row, index) => ({
      id: String(row.dataRequestId ?? index),
      typeLabel: String(row.requestType || row.type || 'REQUEST'),
      statusLabel: String(row.status || '').trim() || 'Unknown',
      createdAt: row.createdAt?.trim() || '',
    }),
  );

  const submitDataRequest = (requestType: 'EXPORT' | 'DELETE') => {
    if (!isAuthenticated || dataRequestBusy) {
      return;
    }
    setDataRequestBusy(true);
    setDataRequestMessage(null);
    void createDataRequestMutation({ requestType })
      .unwrap()
      .then((response) => {
        const status = response.data?.status?.trim();
        setDataRequestMessage(
          response.message?.trim() ||
            (status ? `Request received (${status}).` : 'Request received.'),
        );
      })
      .catch((err: unknown) => {
        setDataRequestMessage(messageFromUnknownError(err));
      })
      .finally(() => {
        setDataRequestBusy(false);
      });
  };
  const apiProfile = profileQueryResponse?.data;

  const profileName =
    apiProfile?.patientName ||
    [apiProfile?.firstName, apiProfile?.lastName].filter(Boolean).join(' ') ||
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    t('homeTabAccount');

  const profileInitials =
    apiProfile?.patientName || (apiProfile?.firstName || apiProfile?.lastName)
      ? profileName
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : authUser?.patientName || (authUser?.firstName || authUser?.lastName)
        ? profileName
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'P';

  const profilePhone =
    apiProfile?.mobileNo ||
    authUser?.mobile ||
    authUser?.mobileNo ||
    authMobile ||
    '';

  return {
    language,
    t,
    profileName,
    profileInitials,
    profilePhone,
    astroEnabled,
    lowDataMode,
    languagePickerOpen,
    languageValue: language === 'mr' ? t('marathi') : t('english'),
    appVersionLabel: appVersionLabel(t('brandName'), t('byline')),
    appReleaseNotes: appReleaseNotes(),
    onEditProfile: () => onOpenEditProfile?.(),
    onOpenRow: (id) => {
      if (id === 'reviews') {
        onOpenMyReviews?.();
      }
      if (id === 'help') {
        onOpenHelpCentre?.();
      }
      if (id === 'book-help') {
        onOpenBookWithHelp?.();
      }
      if (id === 'terms') {
        onOpenLegalDoc?.('terms');
      }
      if (id === 'privacy') {
        onOpenLegalDoc?.('privacy');
      }
      if (id === 'about') {
        onOpenLegalDoc?.('about');
      }
      if (id === 'insights') {
        onOpenHealthInsights?.();
      }
      if (id === 'reminders') {
        onOpenReminders?.();
      }
      if (id === 'family') {
        onOpenFamilyMembers?.();
      }
      if (id === 'appointments') {
        onOpenAppointments?.();
      }
      if (id === 'prescriptions') {
        onOpenPrescriptions?.();
      }
      if (id === 'records') {
        onOpenHealthRecords?.();
      }
      if (id === 'receipts') {
        onOpenPayments?.();
      }
      if (id === 'consent') {
        onOpenConsentCentre?.();
      }
      if (id === 'notifications') {
        onOpenNotificationSettings?.();
      }
      if (id === 'data-requests') {
        setDataRequestsOpen(true);
        return;
      }
      if (id === 'download') {
        submitDataRequest('EXPORT');
      }
    },
    onCloseDataRequests: () => setDataRequestsOpen(false),
    onToggleAstro: () => setAstroEnabled((value) => !value),
    onToggleLowData: () => setLowDataMode((value) => !value),
    onOpenLanguagePicker: () => setLanguagePickerOpen(true),
    onCloseLanguagePicker: () => setLanguagePickerOpen(false),
    onSelectLanguage: (next) => {
      setLanguage(next);
      setLanguagePickerOpen(false);
      if (isAuthenticated) {
        const langId = next === 'mr' ? 2 : 1;
        void updatePatientProfile({ preferredLanguageId: langId });
      }
    },
    onLogOut,
    onDeleteAccount: () => submitDataRequest('DELETE'),
    dataRequestMessage,
    dataRequestBusy,
    dataRequestHistory,
    dataRequestsOpen,
  };
}
