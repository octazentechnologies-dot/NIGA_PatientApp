import { useMemo, useState } from 'react';
import { Linking } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

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

  return {
    language,
    t,
    patientName: 'Pranav Kulkarni',
    mobileNumber: '+91 98765 43210',
    callTime,
    helpNeed,
    helpNeedLabel,
    helpNeedOptions: HELP_NEEDS,
    helpNeedPickerOpen,
    submitted,
    onBack,
    onCallHelpline: () => {
      void Linking.openURL('tel:18001234567');
    },
    onWhatsApp: () => {
      void Linking.openURL('https://wa.me/918001234567');
    },
    onSelectCallTime: setCallTime,
    onOpenHelpNeedPicker: () => setHelpNeedPickerOpen(true),
    onCloseHelpNeedPicker: () => setHelpNeedPickerOpen(false),
    onSelectHelpNeed: (id) => {
      setHelpNeed(id);
      setHelpNeedPickerOpen(false);
    },
    onRequestCallBack: () => {
      setSubmitted(true);
    },
  };
}
