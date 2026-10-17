import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetProgressQuery } from '../store/api/new/symptomDiaryApi';
import { useAppSelector } from '../store/hooks';

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
  adherenceLabel: string | null;
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
  const [emptyRange, setEmptyRange] = useState<EmptyRangeId>('7d');
  const [readyRange, setReadyRange] = useState<ReadyRangeId>('3m');

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: progressResponse } = useGetProgressQuery(undefined, {
    skip: !isAuthenticated,
  });

  const progress = progressResponse?.data;
  const seriesCount = progress?.series?.length ?? 0;
  const visitCount = progress?.visitCount ?? 0;
  const hasEnoughData = seriesCount > 0 || visitCount > 0;

  const userDisplayName =
    authUser?.patientName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ');
  const memberLabel = userDisplayName || t('bookMyself');

  const followUpsCompleted =
    progress?.followUpsCompleted ?? progress?.completedFollowUps ?? 0;
  const followUpsTotal = progress?.followUpsTotal ?? 0;
  const openFollowUps = progress?.openFollowUps ?? 0;

  const chartCaption = useMemo(() => {
    if (!hasEnoughData) return '';
    return t('cliniSightChartCaption')
      .replace('{logged}', String(seriesCount))
      .replace('{total}', String(Math.max(seriesCount, visitCount)));
  }, [hasEnoughData, seriesCount, t, visitCount]);

  const daysLoggedLine = useMemo(() => {
    if (!hasEnoughData) return '';
    return t('cliniSightDaysLoggedValue')
      .replace('{logged}', String(seriesCount))
      .replace('{total}', String(Math.max(seriesCount, visitCount)));
  }, [hasEnoughData, seriesCount, t, visitCount]);

  const followUpResponsesLine = useMemo(() => {
    if (!hasEnoughData) return '';
    return t('cliniSightFollowUpResponsesValue')
      .replace('{improved}', String(followUpsCompleted))
      .replace('{same}', String(openFollowUps));
  }, [followUpsCompleted, hasEnoughData, openFollowUps, t]);

  const adherenceLabel =
    // BE-021 — adherencePercent not planned / always null — do not invent.
    progress?.adherencePercent != null && Number.isFinite(progress.adherencePercent)
      ? String(progress.adherencePercent)
      : null;

  // No fabricated follow-up chips — API does not return per-chip rows.
  const followUps: FollowUpChip[] = [];

  return {
    language,
    t,
    hasEnoughData,
    memberLabel,
    emptyRange,
    readyRange,
    emptyRanges: EMPTY_RANGES,
    readyRanges: READY_RANGES,
    followUps,
    chartCaption,
    daysLoggedLine,
    followUpResponsesLine,
    adherenceLabel,
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
      onAddTodayEntry?.();
    },
    onSeeAllInsights: () => undefined,
    onShareWithDoctor: () => undefined,
    onDownloadPdf: () => undefined,
  };
}
