import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { HelpTopicId } from './useHelpCentreController';

export type TicketIssueId =
  | 'wrongItem'
  | 'missingItem'
  | 'damaged'
  | 'lateDelivery'
  | 'refundMissing'
  | 'other';

export type TicketContactPref = 'inApp' | 'call';

export type TicketTopicOption = {
  id: HelpTopicId;
  labelKey: TranslationKey;
};

export type RaiseTicketViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  topicId: HelpTopicId;
  topicOptions: TicketTopicOption[];
  topicPickerOpen: boolean;
  relatedVisible: boolean;
  relatedOrderId: string;
  relatedOrderMeta: string;
  issues: { id: TicketIssueId; labelKey: TranslationKey }[];
  issueId: TicketIssueId;
  description: string;
  contactPref: TicketContactPref;
  canSubmit: boolean;
  descriptionLangLabel: string;
  onBack: () => void;
  onOpenTopicPicker: () => void;
  onCloseTopicPicker: () => void;
  onSelectTopic: (id: HelpTopicId) => void;
  onClearRelated: () => void;
  onSelectIssue: (id: TicketIssueId) => void;
  onChangeDescription: (value: string) => void;
  onSelectContact: (value: TicketContactPref) => void;
  onAddPhoto: () => void;
  onSubmit: () => void;
};

const TOPIC_OPTIONS: TicketTopicOption[] = [
  { id: 'medicines', labelKey: 'helpTopicMedicines' },
  { id: 'joining', labelKey: 'helpTopicJoining' },
  { id: 'booking', labelKey: 'helpTopicBooking' },
  { id: 'payments', labelKey: 'helpTopicPayments' },
  { id: 'prescriptions', labelKey: 'helpTopicPrescriptions' },
  { id: 'family', labelKey: 'helpTopicFamily' },
  { id: 'privacy', labelKey: 'helpTopicPrivacy' },
  { id: 'report', labelKey: 'helpTopicReport' },
];

const MEDICINE_ISSUES: RaiseTicketViewModel['issues'] = [
  { id: 'wrongItem', labelKey: 'ticketIssueWrongItem' },
  { id: 'missingItem', labelKey: 'ticketIssueMissingItem' },
  { id: 'damaged', labelKey: 'ticketIssueDamaged' },
  { id: 'lateDelivery', labelKey: 'ticketIssueLate' },
  { id: 'refundMissing', labelKey: 'ticketIssueRefund' },
  { id: 'other', labelKey: 'ticketIssueOther' },
];

const GENERIC_ISSUES: RaiseTicketViewModel['issues'] = [
  { id: 'other', labelKey: 'ticketIssueOther' },
  { id: 'lateDelivery', labelKey: 'ticketIssueCantJoin' },
  { id: 'wrongItem', labelKey: 'ticketIssueWrongInfo' },
  { id: 'refundMissing', labelKey: 'ticketIssueRefund' },
];

export function useRaiseTicketController({
  initialTopicId = 'medicines',
  onBack,
  onSubmitted,
}: {
  initialTopicId?: HelpTopicId;
  onBack: () => void;
  onSubmitted?: () => void;
}): RaiseTicketViewModel {
  const { language, t } = useLocalization();
  const [topicId, setTopicId] = useState<HelpTopicId>(initialTopicId);
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [relatedVisible, setRelatedVisible] = useState(true);
  const [issueId, setIssueId] = useState<TicketIssueId>('damaged');
  const [description, setDescription] = useState('');
  const [contactPref, setContactPref] = useState<TicketContactPref>('inApp');

  useEffect(() => {
    setTopicId(initialTopicId);
    setIssueId(initialTopicId === 'medicines' ? 'damaged' : 'other');
    setRelatedVisible(true);
    setDescription('');
    setContactPref('inApp');
  }, [initialTopicId]);

  const issues = topicId === 'medicines' ? MEDICINE_ISSUES : GENERIC_ISSUES;

  const canSubmit = useMemo(
    () => issueId !== 'other' || description.trim().length >= 4,
    [description, issueId],
  );

  return {
    language,
    t,
    topicId,
    topicOptions: TOPIC_OPTIONS,
    topicPickerOpen,
    relatedVisible: topicId === 'medicines' && relatedVisible,
    relatedOrderId: '#HM-4821',
    relatedOrderMeta: t('ticketRelatedDelivered'),
    issues,
    issueId,
    description,
    contactPref,
    canSubmit,
    descriptionLangLabel: language === 'en' ? 'मराठी' : 'English',
    onBack,
    onOpenTopicPicker: () => setTopicPickerOpen(true),
    onCloseTopicPicker: () => setTopicPickerOpen(false),
    onSelectTopic: (id) => {
      setTopicId(id);
      setTopicPickerOpen(false);
      setIssueId(id === 'medicines' ? 'damaged' : 'other');
      setRelatedVisible(true);
    },
    onClearRelated: () => setRelatedVisible(false),
    onSelectIssue: setIssueId,
    onChangeDescription: setDescription,
    onSelectContact: setContactPref,
    onAddPhoto: () => undefined,
    onSubmit: () => {
      if (!canSubmit) {
        return;
      }
      onSubmitted?.();
      onBack();
    },
  };
}
