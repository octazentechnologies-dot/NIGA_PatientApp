import { useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type InsightsRangeId = '1m' | '3m' | '6m' | '1y';

export type InsightsMemberId = 'aarav' | 'self';

export type FollowUpTone = 'improved' | 'same';

export type HealthInsightsViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  range: InsightsRangeId;
  ranges: { id: InsightsRangeId; labelKey: TranslationKey }[];
  memberId: InsightsMemberId;
  memberLabel: string;
  memberPickerOpen: boolean;
  members: { id: InsightsMemberId; label: string }[];
  daysLogged: number;
  daysTotal: number;
  avgSeverity: string;
  sleepQuality: string;
  painFrom: number;
  painTo: number;
  /** 0 empty … 4 full adherence */
  adherence: number[];
  followUps: { labelKey: TranslationKey; dateKey: TranslationKey; tone: FollowUpTone }[];
  doctorShareName: string;
  onBack: () => void;
  onSelectRange: (id: InsightsRangeId) => void;
  onOpenMemberPicker: () => void;
  onCloseMemberPicker: () => void;
  onSelectMember: (id: InsightsMemberId) => void;
  onShareHeader: () => void;
  onDownloadHeader: () => void;
  onViewPainPoints: () => void;
  onShareWithDoctor: () => void;
  onDownloadPdf: () => void;
};

const RANGES: HealthInsightsViewModel['ranges'] = [
  { id: '1m', labelKey: 'insightsRange1m' },
  { id: '3m', labelKey: 'insightsRange3m' },
  { id: '6m', labelKey: 'insightsRange6m' },
  { id: '1y', labelKey: 'insightsRange1y' },
];

const FOLLOW_UPS: HealthInsightsViewModel['followUps'] = [
  { labelKey: 'insightsStatusImproved', dateKey: 'insightsFollowOct', tone: 'improved' },
  { labelKey: 'insightsStatusImproved', dateKey: 'insightsFollowNov5', tone: 'improved' },
  { labelKey: 'insightsStatusSame', dateKey: 'insightsFollowNov28', tone: 'same' },
  { labelKey: 'insightsStatusImproved', dateKey: 'insightsFollowDec', tone: 'improved' },
];

/** 4 weeks × 7 days — matches stitch heatmap shades (0–4). */
const ADHERENCE = [
  1, 3, 4, 4, 0, 4, 3, 4, 4, 0, 1, 2, 4, 4, 4, 4, 4, 3, 4, 3, 0, 4, 3, 2, 0, 0, 0, 0,
];

export function useHealthInsightsController({
  onBack,
}: {
  onBack: () => void;
}): HealthInsightsViewModel {
  const { language, t } = useLocalization();
  const [range, setRange] = useState<InsightsRangeId>('3m');
  const [memberId, setMemberId] = useState<InsightsMemberId>('aarav');
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  const members = useMemo(
    () => [
      { id: 'aarav' as const, label: t('insightsMemberAarav') },
      { id: 'self' as const, label: t('insightsMemberSelf') },
    ],
    [t],
  );

  const memberLabel =
    members.find((item) => item.id === memberId)?.label ?? t('insightsMemberAarav');

  const shareSummary = t('insightsSummaryPlain')
    .replace('{name}', memberLabel)
    .replace('{from}', t('insightsSeverityModerate'))
    .replace('{to}', t('insightsSeverityMild'))
    .replace('{logged}', '42')
    .replace('{total}', '56');

  return {
    language,
    t,
    range,
    ranges: RANGES,
    memberId,
    memberLabel,
    memberPickerOpen,
    members,
    daysLogged: 42,
    daysTotal: 56,
    avgSeverity: t('insightsSeverityMild'),
    sleepQuality: t('insightsSleepGood'),
    painFrom: 4,
    painTo: 2,
    adherence: ADHERENCE,
    followUps: FOLLOW_UPS,
    doctorShareName: t('insightsDoctorDeshmukh'),
    onBack,
    onSelectRange: setRange,
    onOpenMemberPicker: () => setMemberPickerOpen(true),
    onCloseMemberPicker: () => setMemberPickerOpen(false),
    onSelectMember: (id) => {
      setMemberId(id);
      setMemberPickerOpen(false);
    },
    onShareHeader: () => {
      void Share.share({ message: shareSummary });
    },
    onDownloadHeader: () => {
      Alert.alert(t('insightsDownloadPdf'), t('insightsDownloadSoon'));
    },
    onViewPainPoints: () => undefined,
    onShareWithDoctor: () => {
      void Share.share({
        message: t('insightsShareMessage').replace('{name}', t('insightsDoctorDeshmukh')),
      });
    },
    onDownloadPdf: () => {
      Alert.alert(t('insightsDownloadPdf'), t('insightsDownloadSoon'));
    },
  };
}
