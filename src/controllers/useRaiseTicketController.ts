import { Alert } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import type { HelpTopicId } from './useHelpCentreController';
import { useCreateTicketMutation } from '../store/api/new/supportApi';
import { useGetMedicineOrdersQuery } from '../store/api/new/medicinesApi';
import { useAppSelector } from '../store/hooks';
import { getApiErrorMessage, showAppToast } from '../utilities/toast';

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
  const [createTicketMutation] = useCreateTicketMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: ordersResponse } = useGetMedicineOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const latestOrder = ordersResponse?.data?.[0];
  const relatedOrderId = latestOrder?.medicineOrderId
    ? `#HM-${latestOrder.medicineOrderId}`
    : '';
  const hasRelatedOrder = Boolean(latestOrder?.medicineOrderId);

  const canSubmit = useMemo(
    () => issueId !== 'other' || description.trim().length >= 4,
    [description, issueId],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    const topicOption = TOPIC_OPTIONS.find((opt) => opt.id === topicId);
    const issueOption = issues.find((opt) => opt.id === issueId);
    const subject = `${topicOption ? t(topicOption.labelKey) : topicId}: ${issueOption ? t(issueOption.labelKey) : issueId}`;

    let category: 'billing' | 'booking' | 'technical' | 'clinical' | 'other' = 'other';
    if (topicId === 'booking') category = 'booking';
    else if (topicId === 'payments' || issueId === 'refundMissing') category = 'billing';
    else if (topicId === 'joining') category = 'technical';
    else if (topicId === 'prescriptions') category = 'clinical';

    const orderContext =
      topicId === 'medicines' && relatedVisible && relatedOrderId
        ? ` [Order ${relatedOrderId}]`
        : '';
    const bodyText = `${description.trim() || subject}${orderContext} (Contact preference: ${contactPref})`;

    try {
      const result = await createTicketMutation({
        category,
        subject,
        body: bodyText,
      }).unwrap();
      const ticketId = result.supportTicketId;
      if (ticketId != null) {
        Alert.alert(t('ticketSubmit'), `#${ticketId}`);
      }
      onSubmitted?.();
      onBack();
    } catch (err) {
      console.warn('[POST api/Support/Tickets] Failed to create support ticket:', err);
      if (!getApiErrorMessage(err)) {
        showAppToast({ type: 'error', message: t('ticketIssueOther') });
      }
    }
  }, [
    canSubmit,
    topicId,
    issueId,
    issues,
    t,
    relatedVisible,
    relatedOrderId,
    description,
    contactPref,
    createTicketMutation,
    onSubmitted,
    onBack,
  ]);

  return {
    language,
    t,
    topicId,
    topicOptions: TOPIC_OPTIONS,
    topicPickerOpen,
    relatedVisible: topicId === 'medicines' && relatedVisible && hasRelatedOrder,
    relatedOrderId,
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
    onSubmit: handleSubmit,
  };
}
