import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';

import { getHealthTip, type HealthTipSeed } from '../config/healthTips';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type TextScaleStep = 0 | 1 | 2;

export const TEXT_SCALE = [1, 1.12, 1.25] as const;

export type HealthTipViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  tip: HealthTipSeed;
  related: HealthTipSeed[];
  saved: boolean;
  notesOpen: boolean;
  textScale: number;
  helpful: 'up' | 'down' | null;
  onBack: () => void;
  onCycleTextSize: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  onToggleNotes: () => void;
  onOpenRelated: (id: string) => void;
  onFindDoctor: () => void;
  onHelpful: (value: 'up' | 'down') => void;
  onReport: () => void;
};

export function useHealthTipController({
  tipId,
  onBack,
  onOpenRelated,
  onFindDoctor,
}: {
  tipId: string;
  onBack: () => void;
  onOpenRelated: (id: string) => void;
  onFindDoctor: (query: string) => void;
}): HealthTipViewModel {
  const { language, t } = useLocalization();
  const tip = useMemo(() => getHealthTip(tipId), [tipId]);
  const related = useMemo(
    () => tip.relatedIds.map((id) => getHealthTip(id)),
    [tip],
  );
  const [saved, setSaved] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [step, setStep] = useState<TextScaleStep>(0);
  const [helpful, setHelpful] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setNotesOpen(false);
    setHelpful(null);
    setSaved(false);
  }, [tipId]);

  return {
    language,
    t,
    tip,
    related,
    saved,
    notesOpen,
    textScale: TEXT_SCALE[step],
    helpful,
    onBack,
    onCycleTextSize: () =>
      setStep((current) => ((current + 1) % 3) as TextScaleStep),
    onToggleSave: () => setSaved((current) => !current),
    onShare: () => {
      Share.share({
        message: `${t(tip.titleKey)}\n${t(tip.excerptKey)}`,
      }).catch(() => undefined);
    },
    onToggleNotes: () => setNotesOpen((current) => !current),
    onOpenRelated,
    onFindDoctor: () => onFindDoctor(t(tip.searchQueryKey)),
    onHelpful: (value) =>
      setHelpful((current) => (current === value ? null : value)),
    onReport: () => undefined,
  };
}
