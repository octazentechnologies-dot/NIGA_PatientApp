import { useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ConsentMemberId = 'self' | 'aarav';

export type ConsentToggleId =
  | 'teleconsult'
  | 'shareRecords'
  | 'carelink'
  | 'recording'
  | 'astro'
  | 'astroDoctor'
  | 'updates';

export type ConsentCentreViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  memberId: ConsentMemberId;
  memberLabel: string;
  memberPickerOpen: boolean;
  members: { id: ConsentMemberId; labelKey: TranslationKey }[];
  toggles: Record<ConsentToggleId, boolean>;
  onBack: () => void;
  onHelp: () => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: ConsentMemberId) => void;
  onToggle: (id: ConsentToggleId) => void;
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
  onBack,
}: {
  onBack: () => void;
}): ConsentCentreViewModel {
  const { language, t } = useLocalization();
  const [memberId, setMemberId] = useState<ConsentMemberId>('self');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [toggles, setToggles] = useState<Record<ConsentToggleId, boolean>>({
    teleconsult: true,
    shareRecords: true,
    carelink: true,
    recording: false,
    astro: true,
    astroDoctor: false,
    updates: false,
  });

  const member = MEMBERS.find((item) => item.id === memberId) ?? MEMBERS[0];

  return {
    language,
    t,
    memberId,
    memberLabel: t(member.labelKey),
    memberPickerOpen,
    members: MEMBERS,
    toggles,
    onBack,
    onHelp: () => undefined,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onToggle: (id) => {
      setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    onSeeCareLinkShared: () => undefined,
    onDataRight: () => undefined,
    onOpenRequest: () => undefined,
    onOpenHistory: () => undefined,
  };
}
