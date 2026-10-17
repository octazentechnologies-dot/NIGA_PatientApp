import { Alert } from 'react-native';
import { useCallback, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppConfig } from '../providers/AppConfigProvider';
import { useRequestAssistanceMutation } from '../store/api/new/supportApi';
import { useAppSelector } from '../store/hooks';

export type CallBackTimeId = 'now' | 'hour' | 'morning' | 'evening';

export type HelpNeedId = 'doctor' | 'reschedule' | 'joining' | 'other';

export type BookWithHelpViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  patientName: string;
  mobileNumber: string;
  callTime: CallBackTimeId;
  helpNeed: HelpNeedId;
  helpNeedLabel: string;
  helpNeedOptions: { id: HelpNeedId; labelKey: TranslationKey }[];
  helpNeedPickerOpen: boolean;
  submitted: boolean;
  showCallHelpline: boolean;
  showWhatsApp: boolean;
  supportUnavailable: boolean;
  onBack: () => void;
  onCallHelpline: () => void;
  onWhatsApp: () => void;
  onSelectCallTime: (id: CallBackTimeId) => void;
  onOpenHelpNeedPicker: () => void;
  onCloseHelpNeedPicker: () => void;
  onSelectHelpNeed: (id: HelpNeedId) => void;
  onRequestCallBack: () => void;
};

const HELP_NEEDS: BookWithHelpViewModel['helpNeedOptions'] = [
  { id: 'doctor', labelKey: 'bookHelpNeedDoctor' },
  { id: 'reschedule', labelKey: 'bookHelpNeedReschedule' },
  { id: 'joining', labelKey: 'bookHelpNeedJoining' },
  { id: 'other', labelKey: 'bookHelpNeedOther' },
];

export function useBookWithHelpController({
  onBack,
}: {
  onBack: () => void;
}): BookWithHelpViewModel {
  const { language, t } = useLocalization();
  const appConfig = useAppConfig();
  const [callTime, setCallTime] = useState<CallBackTimeId>('now');
  const [helpNeed, setHelpNeed] = useState<HelpNeedId>('doctor');
  const [helpNeedPickerOpen, setHelpNeedPickerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const helpNeedLabel = useMemo(() => {
    const key =
      HELP_NEEDS.find((item) => item.id === helpNeed)?.labelKey ??
      'bookHelpNeedDoctor';
    return t(key);
  }, [helpNeed, t]);

  const authUser = useAppSelector((state) => state.auth.user);
  const authMobile = useAppSelector((state) => state.auth.mobile);
  const [requestAssistanceMutation] = useRequestAssistanceMutation();

  const patientName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ') ||
    '';

  const mobileNumber =
    authUser?.mobile ||
    authUser?.mobileNo ||
    authMobile ||
    '';

  const handleRequestCallBack = useCallback(async () => {
    try {
      await requestAssistanceMutation({
        patientId: authUser?.patientId,
        notes: `Need help: ${helpNeedLabel} (Preferred time: ${callTime})`,
        preferredDate: callTime,
        contactMobile: mobileNumber || undefined,
      }).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.warn('[POST api/Support/AssistanceRequest] Failed:', err);
      Alert.alert(t('bookHelpTitle'), t('bookHelpNeedOther'));
    }
  }, [
    requestAssistanceMutation,
    authUser?.patientId,
    helpNeedLabel,
    callTime,
    mobileNumber,
    t,
  ]);

  return {
    language,
    t,
    patientName,
    mobileNumber,
    callTime,
    helpNeed,
    helpNeedLabel,
    helpNeedOptions: HELP_NEEDS,
    helpNeedPickerOpen,
    submitted,
    showCallHelpline: Boolean(appConfig.supportPhone),
    showWhatsApp: Boolean(appConfig.supportWhatsApp),
    supportUnavailable: !appConfig.hasAnySupportContact,
    onBack,
    onCallHelpline: appConfig.openSupportPhone,
    onWhatsApp: appConfig.openSupportWhatsApp,
    onSelectCallTime: setCallTime,
    onOpenHelpNeedPicker: () => setHelpNeedPickerOpen(true),
    onCloseHelpNeedPicker: () => setHelpNeedPickerOpen(false),
    onSelectHelpNeed: (id) => {
      setHelpNeed(id);
      setHelpNeedPickerOpen(false);
    },
    onRequestCallBack: handleRequestCallBack,
  };
}
