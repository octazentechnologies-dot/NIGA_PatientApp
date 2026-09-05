import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';

import {
  getDoctorProfile,
  type DoctorProfileSeed,
  type ProfileTab,
} from '../config/doctorProfiles';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type DoctorProfileViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  profile: DoctorProfileSeed;
  tab: ProfileTab;
  saved: boolean;
  aboutExpanded: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onSelectTab: (tab: ProfileTab) => void;
  onToggleAbout: () => void;
  onOpenDetails: () => void;
  onBook: () => void;
};

export function useDoctorProfileController({
  doctorId,
  onBack,
  onBook,
}: {
  doctorId: string;
  onBack: () => void;
  onBook?: () => void;
}): DoctorProfileViewModel {
  const { language, t } = useLocalization();
  const profile = useMemo(() => getDoctorProfile(doctorId), [doctorId]);
  const [tab, setTab] = useState<ProfileTab>('about');
  const [saved, setSaved] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(true);

  useEffect(() => {
    setTab('about');
    setAboutExpanded(true);
  }, [doctorId]);

  return {
    language,
    t,
    profile,
    tab,
    saved,
    aboutExpanded,
    onBack,
    onShare: () => {
      Share.share({
        message: `${t(profile.nameKey)}\n${t(profile.credentialsKey)}`,
      }).catch(() => undefined);
    },
    onToggleSave: () => setSaved((current) => !current),
    onSelectTab: setTab,
    onToggleAbout: () => setAboutExpanded((current) => !current),
    onOpenDetails: () => setTab('credentials'),
    onBook: () => onBook?.(),
  };
}
