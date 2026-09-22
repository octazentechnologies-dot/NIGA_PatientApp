import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type EmptyRangeId = '7d' | '14d' | '30d';

export type ReadyRangeId = '1m' | '3m' | '6m' | '1y' | 'custom';

export type FollowUpChip = {
  id: string;
  status: 'improved' | 'same';
  dateLabel: string;
};

export type CliniSightProgressViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  hasEnoughData: boolean;
  memberLabel: string;
  emptyRange: EmptyRangeId;
  readyRange: ReadyRangeId;
  emptyRanges: { id: EmptyRangeId; labelKey: TranslationKey }[];
  readyRanges: { id: ReadyRangeId; labelKey: TranslationKey }[];
  followUps: FollowUpChip[];
  chartCaption: string;
  daysLoggedLine: string;
  followUpResponsesLine: string;
  onBack: () => void;
  onToggleLanguage: () => void;
  onSelectMember: () => void;
  onSelectEmptyRange: (id: EmptyRangeId) => void;
  onSelectReadyRange: (id: ReadyRangeId) => void;
  onAddTodayEntry: () => void;
  onSeeAllInsights: () => void;
  onShareWithDoctor: () => void;
  onDownloadPdf: () => void;
};

const EMPTY_RANGES: CliniSightProgressViewModel['emptyRanges'] = [
  { id: '7d', labelKey: 'cliniSightRange7d' },
  { id: '14d', labelKey: 'cliniSightRange14d' },
  { id: '30d', labelKey: 'cliniSightRange30d' },
];

const READY_RANGES: CliniSightProgressViewModel['readyRanges'] = [
  { id: '1m', labelKey: 'cliniSightRange1m' },
  { id: '3m', labelKey: 'cliniSightRange3m' },
  { id: '6m', labelKey: 'cliniSightRange6m' },
  { id: '1y', labelKey: 'cliniSightRange1y' },
  { id: 'custom', labelKey: 'cliniSightRangeCustom' },
];

const FOLLOW_UPS: FollowUpChip[] = [
  { id: 'fu1', status: 'improved', dateLabel: 'Oct 12' },
  { id: 'fu2', status: 'improved', dateLabel: 'Oct 26' },
  { id: 'fu3', status: 'same', dateLabel: 'Nov 9' },
  { id: 'fu4', status: 'improved', dateLabel: 'Nov 23' },
];

export function useCliniSightProgressController({
  onBack,
  onAddTodayEntry,
  onToggleLanguage,
}: {
  onBack: () => void;
  onAddTodayEntry?: () => void;
  onToggleLanguage?: () => void;
}): CliniSightProgressViewModel {
  const { language, setLanguage, t } = useLocalization();
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [emptyRange, setEmptyRange] = useState<EmptyRangeId>('7d');
  const [readyRange, setReadyRange] = useState<ReadyRangeId>('3m');

  const chartCaption = useMemo(
    () =>
      t('cliniSightChartCaption')
        .replace('{logged}', '42')
        .replace('{total}', '56'),
    [t],
  );

  const daysLoggedLine = useMemo(
    () =>
      t('cliniSightDaysLoggedValue')
        .replace('{logged}', '42')
        .replace('{total}', '56'),
    [t],
  );

  const followUpResponsesLine = useMemo(
    () =>
      t('cliniSightFollowUpResponsesValue')
        .replace('{improved}', '3')
        .replace('{same}', '1'),
    [t],
  );

  return {
    language,
    t,
    hasEnoughData,
    memberLabel: t('diaryMemberAarav'),
    emptyRange,
    readyRange,
    emptyRanges: EMPTY_RANGES,
    readyRanges: READY_RANGES,
    followUps: FOLLOW_UPS,
    chartCaption,
    daysLoggedLine,
    followUpResponsesLine,
    onBack,
    onToggleLanguage: () => {
      if (onToggleLanguage) {
        onToggleLanguage();
        return;
      }
      setLanguage(language === 'en' ? 'mr' : 'en');
    },
    onSelectMember: () => undefined,
    onSelectEmptyRange: setEmptyRange,
    onSelectReadyRange: setReadyRange,
    onAddTodayEntry: () => {
      setHasEnoughData(true);
      onAddTodayEntry?.();
    },
    onSeeAllInsights: () => undefined,
    onShareWithDoctor: () => undefined,
    onDownloadPdf: () => undefined,
  };
}
