import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type HelpTopicId =
  | 'joining'
  | 'booking'
  | 'payments'
  | 'prescriptions'
  | 'medicines'
  | 'family'
  | 'privacy'
  | 'report';

export type HelpTopic = {
  id: HelpTopicId;
  labelKey: TranslationKey;
  icon:
    | 'videocam-outline'
    | 'calendar-outline'
    | 'cash-outline'
    | 'document-text-outline'
    | 'cube-outline'
    | 'people-outline'
    | 'shield-checkmark-outline'
    | 'alert-circle-outline';
  danger?: boolean;
};

export type HelpCentreViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  query: string;
  topics: HelpTopic[];
  filteredTopics: HelpTopic[];
  languageToggleLabel: string;
  onBack: () => void;
  onToggleLanguage: () => void;
  onChangeQuery: (value: string) => void;
  onChatSupport: () => void;
  onCallHelpline: () => void;
  onOpenTopic: (id: HelpTopicId) => void;
};

export const HELP_TOPICS: HelpTopic[] = [
  { id: 'joining', labelKey: 'helpTopicJoining', icon: 'videocam-outline' },
  { id: 'booking', labelKey: 'helpTopicBooking', icon: 'calendar-outline' },
  { id: 'payments', labelKey: 'helpTopicPayments', icon: 'cash-outline' },
  {
    id: 'prescriptions',
    labelKey: 'helpTopicPrescriptions',
    icon: 'document-text-outline',
  },
  {
    id: 'medicines',
    labelKey: 'helpTopicMedicines',
    icon: 'cube-outline',
  },
  { id: 'family', labelKey: 'helpTopicFamily', icon: 'people-outline' },
  {
    id: 'privacy',
    labelKey: 'helpTopicPrivacy',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'report',
    labelKey: 'helpTopicReport',
    icon: 'alert-circle-outline',
    danger: true,
  },
];

export function useHelpCentreController({
  onBack,
  onOpenTopic,
}: {
  onBack: () => void;
  onOpenTopic?: (id: HelpTopicId) => void;
}): HelpCentreViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [query, setQuery] = useState('');

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return HELP_TOPICS;
    }
    return HELP_TOPICS.filter((topic) =>
      t(topic.labelKey).toLowerCase().includes(q),
    );
  }, [query, t]);

  return {
    language,
    t,
    query,
    topics: HELP_TOPICS,
    filteredTopics,
    languageToggleLabel: language === 'en' ? 'मराठी' : t('english'),
    onBack,
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onChangeQuery: setQuery,
    onChatSupport: () => undefined,
    onCallHelpline: () => undefined,
    onOpenTopic: (id) => onOpenTopic?.(id),
  };
}
