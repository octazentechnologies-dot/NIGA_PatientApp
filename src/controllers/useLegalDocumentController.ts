import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useGetTermsPolicyQuery } from '../store/api/new/bookingApi';

export type LegalDocId = 'terms' | 'privacy' | 'about';

export type LegalSection = {
  headingKey: TranslationKey;
  bodyKey: TranslationKey;
};

export type LegalDocumentViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  docId: LegalDocId;
  titleKey: TranslationKey;
  versionKey?: TranslationKey;
  introKey: TranslationKey;
  sections: LegalSection[];
  apiTitle: string | null;
  apiVersion: string | null;
  apiBody: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onBack: () => void;
};

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DOCS: Record<
  LegalDocId,
  {
    titleKey: TranslationKey;
    versionKey?: TranslationKey;
    introKey: TranslationKey;
    sections: LegalSection[];
  }
> = {
  terms: {
    titleKey: 'legalTermsTitle',
    versionKey: 'legalTermsVersion',
    introKey: 'legalTermsIntro',
    sections: [
      { headingKey: 'legalTermsS1Title', bodyKey: 'legalTermsS1Body' },
      { headingKey: 'legalTermsS2Title', bodyKey: 'legalTermsS2Body' },
      { headingKey: 'legalTermsS3Title', bodyKey: 'legalTermsS3Body' },
      { headingKey: 'legalTermsS4Title', bodyKey: 'legalTermsS4Body' },
    ],
  },
  privacy: {
    titleKey: 'legalPrivacyTitle',
    versionKey: 'privacyNoticeVersion',
    introKey: 'legalPrivacyIntro',
    sections: [
      { headingKey: 'legalPrivacyS1Title', bodyKey: 'legalPrivacyS1Body' },
      { headingKey: 'legalPrivacyS2Title', bodyKey: 'legalPrivacyS2Body' },
      { headingKey: 'legalPrivacyS3Title', bodyKey: 'legalPrivacyS3Body' },
      { headingKey: 'legalPrivacyS4Title', bodyKey: 'legalPrivacyS4Body' },
    ],
  },
  about: {
    titleKey: 'legalAboutTitle',
    introKey: 'legalAboutIntro',
    sections: [
      { headingKey: 'legalAboutS1Title', bodyKey: 'legalAboutS1Body' },
      { headingKey: 'legalAboutS2Title', bodyKey: 'legalAboutS2Body' },
      { headingKey: 'legalAboutS3Title', bodyKey: 'legalAboutS3Body' },
      { headingKey: 'legalAboutS4Title', bodyKey: 'legalAboutS4Body' },
    ],
  },
};

export function useLegalDocumentController({
  docId,
  onBack,
}: {
  docId: LegalDocId;
  onBack: () => void;
}): LegalDocumentViewModel {
  const { language, t } = useLocalization();
  const doc = DOCS[docId];
  const {
    data: termsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetTermsPolicyQuery(undefined, { skip: docId !== 'terms' });
  const terms = docId === 'terms' ? termsResponse?.data : undefined;
  const apiBody = terms?.bodyHtml ? stripHtml(terms.bodyHtml) : null;

  return {
    language,
    t,
    docId,
    titleKey: doc.titleKey,
    versionKey: doc.versionKey,
    introKey: doc.introKey,
    sections: apiBody ? [] : doc.sections,
    apiTitle: terms?.title?.trim() || null,
    apiVersion: terms?.version?.trim() || null,
    apiBody,
    isLoading: docId === 'terms' && isLoading,
    isError: docId === 'terms' && isError && !apiBody,
    onRetry: () => {
      void refetch();
    },
    onBack,
  };
}
