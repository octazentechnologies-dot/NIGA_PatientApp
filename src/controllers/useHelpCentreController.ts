import { useMemo, useState } from 'react';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppConfig } from '../providers/AppConfigProvider';
import {
  useGetHelpArticleBySlugQuery,
  useGetHelpArticlesQuery,
} from '../store/api/new/supportApi';

export type HelpTopicId = string;

export type HelpTopic = {
  id: HelpTopicId;
  slug: string;
  title: string;
  category: string;
  sortOrder: number;
  bodyAvailable: boolean;
};

export type HelpCentreViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  query: string;
  topics: HelpTopic[];
  filteredTopics: HelpTopic[];
  grouped: { category: string; topics: HelpTopic[] }[];
  languageToggleLabel: string;
  showChatSupport: boolean;
  showCallHelpline: boolean;
  supportUnavailable: boolean;
  selectedSlug: string | null;
  selectedBody: string | null;
  selectedTitle: string | null;
  detailLoading: boolean;
  detailError: boolean;
  listLoading: boolean;
  listError: boolean;
  isEmpty: boolean;
  onBack: () => void;
  onToggleLanguage: () => void;
  onChangeQuery: (value: string) => void;
  onChatSupport: () => void;
  onCallHelpline: () => void;
  onOpenTopic: (id: HelpTopicId) => void;
  onCloseArticle: () => void;
  onRetry: () => void;
};

/**
 * BE-020 — Help from GET /api/Help; detail only for listed slugs with bodyAvailable.
 */
export function useHelpCentreController({
  onBack,
  onOpenTopic,
}: {
  onBack: () => void;
  onOpenTopic?: (id: HelpTopicId) => void;
}): HelpCentreViewModel {
  const { language, setLanguage, t } = useLocalization();
  const appConfig = useAppConfig();
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const {
    data: helpResponse,
    isLoading: listLoading,
    isError: listError,
    refetch,
  } = useGetHelpArticlesQuery();

  const topics = useMemo<HelpTopic[]>(() => {
    const rows = helpResponse?.data;
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows
      .map((row) => ({
        id: row.slug,
        slug: row.slug,
        title: row.title || row.slug,
        category: row.category?.trim() || 'General',
        sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : 0,
        bodyAvailable: row.bodyAvailable !== false && Boolean(row.slug),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  }, [helpResponse?.data]);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return topics;
    }
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.category.toLowerCase().includes(q),
    );
  }, [query, topics]);

  const grouped = useMemo(() => {
    const map = new Map<string, HelpTopic[]>();
    for (const topic of filteredTopics) {
      const list = map.get(topic.category) ?? [];
      list.push(topic);
      map.set(topic.category, list);
    }
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      topics: items,
    }));
  }, [filteredTopics]);

  const {
    data: articleResponse,
    isLoading: detailLoading,
    isError: detailError,
  } = useGetHelpArticleBySlugQuery(selectedSlug ?? '', {
    skip: !selectedSlug,
  });

  return {
    language,
    t,
    query,
    topics,
    filteredTopics,
    grouped,
    languageToggleLabel: language === 'en' ? 'मराठी' : t('english'),
    showChatSupport: Boolean(appConfig.supportWhatsApp),
    showCallHelpline: Boolean(appConfig.supportPhone),
    supportUnavailable: !appConfig.hasAnySupportContact,
    selectedSlug,
    selectedBody: articleResponse?.data?.body ?? null,
    selectedTitle: articleResponse?.data?.title ?? null,
    detailLoading,
    detailError,
    listLoading,
    listError,
    isEmpty: !listLoading && !listError && topics.length === 0,
    onBack,
    onToggleLanguage: () => setLanguage(language === 'en' ? 'mr' : 'en'),
    onChangeQuery: setQuery,
    onChatSupport: appConfig.openSupportWhatsApp,
    onCallHelpline: appConfig.openSupportPhone,
    onOpenTopic: (id) => {
      const topic = topics.find((item) => item.id === id || item.slug === id);
      if (!topic || !topic.bodyAvailable) {
        onOpenTopic?.(id);
        return;
      }
      setSelectedSlug(topic.slug);
    },
    onCloseArticle: () => setSelectedSlug(null),
    onRetry: () => {
      void refetch();
    },
  };
}

/** @deprecated Local taxonomy removed — use API slugs (BE-020). */
export const HELP_TOPICS: HelpTopic[] = [];
