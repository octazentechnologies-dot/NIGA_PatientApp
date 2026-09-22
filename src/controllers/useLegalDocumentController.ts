import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

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
  onBack: () => void;
};

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

  return {
    language,
    t,
    docId,
    titleKey: doc.titleKey,
    versionKey: doc.versionKey,
    introKey: doc.introKey,
    sections: doc.sections,
    onBack,
  };
}
