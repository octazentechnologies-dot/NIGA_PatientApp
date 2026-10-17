import { useEffect, useMemo, useState } from 'react';
import { Share, type ImageSourcePropType } from 'react-native';

import { getHealthTip, type HealthTipSeed } from '../config/healthTips';
import { images } from '../config/images';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetArticleByIdQuery,
  useGetArticlesQuery,
} from '../store/api/new/homeApi';
import { resolveApiUrl } from '../utilities/formatters';

export type TextScaleStep = 0 | 1 | 2;

export const TEXT_SCALE = [1, 1.12, 1.25] as const;

export type HealthTipViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  tip: HealthTipSeed;
  related: HealthTipSeed[];
  /** When true, title/body/etc. are API strings — render with AppText raw. */
  fromApi: boolean;
  isLoading: boolean;
  isError: boolean;
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
  onRetry: () => void;
};

function emptyTip(id: string): HealthTipSeed {
  return {
    id,
    hero: images.healthTipHero,
    categoryKey: '' as TranslationKey,
    searchQueryKey: '' as TranslationKey,
    readMins: 0,
    titleKey: '' as TranslationKey,
    excerptKey: '' as TranslationKey,
    authorNameKey: '' as TranslationKey,
    authorCredsKey: '' as TranslationKey,
    reviewerKey: '' as TranslationKey,
    publishedKey: '' as TranslationKey,
    reviewNotesKey: '' as TranslationKey,
    findDoctorKey: 'tipTalkToDoctor' as TranslationKey,
    body: [],
    careTipKeys: [],
    relatedIds: [],
  };
}

function heroFromUrl(url: string | null): ImageSourcePropType {
  if (url) return { uri: url };
  return images.healthTipHero;
}

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
  const isNumeric = !Number.isNaN(Number(tipId));

  const {
    data: articleResponse,
    isLoading,
    isError,
    refetch,
  } = useGetArticleByIdQuery(tipId, {
    skip: !isNumeric,
  });
  const { data: articlesList } = useGetArticlesQuery(
    { pageNumber: 1, pageSize: 10 },
    { skip: !isNumeric },
  );

  const tip = useMemo((): HealthTipSeed => {
    if (!isNumeric) {
      return getHealthTip(tipId);
    }
    const article = articleResponse?.data;
    if (!article) {
      return emptyTip(tipId);
    }
    const imageUrl = resolveApiUrl(article.blogImage1 ?? null);
    const bodyText = (article.body || '').trim();
    const published =
      article.blogDate?.trim() ||
      '';
    return {
      id: String(article.blogId),
      hero: heroFromUrl(imageUrl),
      categoryKey: '' as TranslationKey,
      searchQueryKey: (article.blogHead || '') as TranslationKey,
      readMins: 0,
      titleKey: (article.blogHead || '') as TranslationKey,
      excerptKey: (article.blogSubHead || '') as TranslationKey,
      authorNameKey: '' as TranslationKey,
      authorCredsKey: '' as TranslationKey,
      reviewerKey: '' as TranslationKey,
      publishedKey: published as TranslationKey,
      reviewNotesKey: '' as TranslationKey,
      findDoctorKey: 'tipTalkToDoctor' as TranslationKey,
      body: bodyText
        ? [{ type: 'paragraph', key: bodyText as TranslationKey }]
        : [],
      careTipKeys: [],
      relatedIds: [],
    };
  }, [articleResponse?.data, isNumeric, tipId]);

  const related = useMemo((): HealthTipSeed[] => {
    if (!isNumeric) {
      return tip.relatedIds.map((id) => getHealthTip(id));
    }
    const rows = articlesList?.data;
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((row) => String(row.blogId) !== String(tipId))
      .slice(0, 5)
      .map((row) => {
        const imageUrl = resolveApiUrl(row.blogImage1 ?? null);
        return {
          id: String(row.blogId),
          hero: heroFromUrl(imageUrl),
          categoryKey: '' as TranslationKey,
          searchQueryKey: (row.blogHead || '') as TranslationKey,
          readMins: 0,
          titleKey: (row.blogHead || '') as TranslationKey,
          excerptKey: (row.blogSubHead || '') as TranslationKey,
          authorNameKey: '' as TranslationKey,
          authorCredsKey: '' as TranslationKey,
          reviewerKey: '' as TranslationKey,
          publishedKey: (row.blogDate || '') as TranslationKey,
          reviewNotesKey: '' as TranslationKey,
          findDoctorKey: 'tipTalkToDoctor' as TranslationKey,
          body: [],
          careTipKeys: [],
          relatedIds: [],
        };
      });
  }, [articlesList?.data, isNumeric, tip.relatedIds, tipId]);

  // BE-031 — bookmarks not planned.
  const saved = false;
  const [notesOpen, setNotesOpen] = useState(false);
  const [step, setStep] = useState<TextScaleStep>(0);
  const [helpful, setHelpful] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setNotesOpen(false);
    setHelpful(null);
  }, [tipId]);

  return {
    language,
    t,
    tip,
    related,
    fromApi: isNumeric,
    isLoading: isNumeric && isLoading,
    isError: isNumeric && isError,
    saved,
    notesOpen,
    textScale: TEXT_SCALE[step],
    helpful,
    onBack,
    onCycleTextSize: () =>
      setStep((current) => ((current + 1) % 3) as TextScaleStep),
    onToggleSave: () => undefined,
    onShare: () => {
      const title = String(tip.titleKey);
      const excerpt = String(tip.excerptKey);
      Share.share({
        message: excerpt ? `${title}\n${excerpt}` : title,
      }).catch(() => undefined);
    },
    onToggleNotes: () => setNotesOpen((current) => !current),
    onOpenRelated,
    onFindDoctor: () => {
      const q = String(tip.searchQueryKey || tip.titleKey || '');
      onFindDoctor(q);
    },
    onHelpful: (value) =>
      setHelpful((current) => (current === value ? null : value)),
    onReport: () => undefined,
    onRetry: () => {
      void refetch();
    },
  };
}
