import type { TranslationKey } from '../localization/types';

export type ProfileTab = 'about' | 'credentials' | 'reviews' | 'availability';

export type QualificationCard = {
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  badgeKey: TranslationKey;
};

export type RegistrationCard = {
  titleKey: TranslationKey;
  councilKey: TranslationKey;
  statusKey: TranslationKey;
  validKey: TranslationKey;
};

export type FocusCredential = {
  titleKey: TranslationKey;
  idKey: TranslationKey;
  validKey: TranslationKey;
};

export type CareLinkRole = {
  titleKey: TranslationKey;
  quoteKey: TranslationKey;
};

export type DoctorCredentialsSeed = {
  qualifications: QualificationCard[];
  registration: RegistrationCard;
  focus?: FocusCredential;
  careLink?: CareLinkRole;
};

export type DoctorProfileSeed = {
  id: string;
  initials: string;
  verified: boolean;
  nameKey: TranslationKey;
  credentialsKey: TranslationKey;
  experienceKey: TranslationKey;
  rating: string;
  reviewsKey: TranslationKey;
  consultsKey: TranslationKey;
  aboutKey: TranslationKey;
  regVerifiedKey: TranslationKey;
  lastVerifiedKey: TranslationKey;
  nextAvailableKey: TranslationKey;
  feeKey: TranslationKey;
  clinicFeeKey: TranslationKey;
  careNeedKeys: TranslationKey[];
  languageKeys: TranslationKey[];
  reviewIds: Array<1 | 2>;
  credentialsDetail: DoctorCredentialsSeed;
};

export const DOCTOR_PROFILES: DoctorProfileSeed[] = [
  {
    id: 'anjali',
    initials: 'AD',
    verified: true,
    nameKey: 'searchResultAnjaliName',
    credentialsKey: 'searchResultAnjaliCredentials',
    experienceKey: 'profileAnjaliExp',
    rating: '4.6',
    reviewsKey: 'searchResultAnjaliReviews',
    consultsKey: 'profileAnjaliConsults',
    aboutKey: 'profileAnjaliAbout',
    regVerifiedKey: 'profileAnjaliRegVerified',
    lastVerifiedKey: 'profileAnjaliLastVerified',
    nextAvailableKey: 'profileAnjaliNext',
    feeKey: 'searchResultAnjaliFee',
    clinicFeeKey: 'profileAnjaliClinicFee',
    careNeedKeys: ['searchCareSkin', 'searchCareChild', 'searchCareAllergy'],
    languageKeys: ['searchLangMarathi', 'searchLangEnglish'],
    reviewIds: [1, 2],
    credentialsDetail: {
      qualifications: [
        {
          titleKey: 'credAnjaliMdTitle',
          detailKey: 'credAnjaliMdDetail',
          badgeKey: 'credAnjaliMdBadge',
        },
        {
          titleKey: 'credAnjaliBhmsTitle',
          detailKey: 'credAnjaliBhmsDetail',
          badgeKey: 'credVerified',
        },
      ],
      registration: {
        titleKey: 'credAnjaliRegTitle',
        councilKey: 'credAnjaliCouncil',
        statusKey: 'credStatusActive',
        validKey: 'credAnjaliValid',
      },
      focus: {
        titleKey: 'credAnjaliFocusTitle',
        idKey: 'credAnjaliFocusId',
        validKey: 'credAnjaliFocusValid',
      },
      careLink: {
        titleKey: 'credAnjaliCareLinkTitle',
        quoteKey: 'credAnjaliCareLinkQuote',
      },
    },
  },
  {
    id: 'rajesh',
    initials: 'RP',
    verified: true,
    nameKey: 'searchResultRajeshName',
    credentialsKey: 'searchResultRajeshCredentials',
    experienceKey: 'profileRajeshExp',
    rating: '4.2',
    reviewsKey: 'searchResultRajeshReviews',
    consultsKey: 'profileRajeshConsults',
    aboutKey: 'profileRajeshAbout',
    regVerifiedKey: 'profileRajeshRegVerified',
    lastVerifiedKey: 'profileRajeshLastVerified',
    nextAvailableKey: 'profileRajeshNext',
    feeKey: 'searchResultRajeshFee',
    clinicFeeKey: 'searchResultRajeshFee',
    careNeedKeys: ['searchCarePain', 'searchCareLifestyle'],
    languageKeys: ['searchLangMarathi', 'searchLangHindi'],
    reviewIds: [2],
    credentialsDetail: {
      qualifications: [
        {
          titleKey: 'credRajeshBhmsTitle',
          detailKey: 'credRajeshBhmsDetail',
          badgeKey: 'credVerified',
        },
      ],
      registration: {
        titleKey: 'credRajeshRegTitle',
        councilKey: 'credAnjaliCouncil',
        statusKey: 'credStatusActive',
        validKey: 'credRajeshValid',
      },
      focus: {
        titleKey: 'credRajeshFocusTitle',
        idKey: 'credRajeshFocusId',
        validKey: 'credRajeshFocusValid',
      },
      careLink: {
        titleKey: 'credRajeshCareLinkTitle',
        quoteKey: 'credRajeshCareLinkQuote',
      },
    },
  },
  {
    id: 'sunita',
    initials: 'SS',
    verified: false,
    nameKey: 'searchResultSunitaName',
    credentialsKey: 'searchResultSunitaCredentials',
    experienceKey: 'profileSunitaExp',
    rating: '4.8',
    reviewsKey: 'searchResultSunitaReviews',
    consultsKey: 'profileSunitaConsults',
    aboutKey: 'profileSunitaAbout',
    regVerifiedKey: 'profileSunitaRegVerified',
    lastVerifiedKey: 'profileSunitaLastVerified',
    nextAvailableKey: 'profileSunitaNext',
    feeKey: 'searchResultSunitaFee',
    clinicFeeKey: 'profileSunitaClinicFee',
    careNeedKeys: ['searchCareSkin', 'searchCareAllergy'],
    languageKeys: ['searchLangEnglish', 'searchLangHindi'],
    reviewIds: [1],
    credentialsDetail: {
      qualifications: [
        {
          titleKey: 'credSunitaMdTitle',
          detailKey: 'credSunitaMdDetail',
          badgeKey: 'credSunitaMdBadge',
        },
        {
          titleKey: 'credSunitaBhmsTitle',
          detailKey: 'credSunitaBhmsDetail',
          badgeKey: 'credVerified',
        },
      ],
      registration: {
        titleKey: 'credSunitaRegTitle',
        councilKey: 'credAnjaliCouncil',
        statusKey: 'credStatusActive',
        validKey: 'credSunitaValid',
      },
      focus: {
        titleKey: 'credSunitaFocusTitle',
        idKey: 'credSunitaFocusId',
        validKey: 'credSunitaFocusValid',
      },
      careLink: {
        titleKey: 'credSunitaCareLinkTitle',
        quoteKey: 'credSunitaCareLinkQuote',
      },
    },
  },
];

export function getDoctorProfile(id: string): DoctorProfileSeed {
  const alias = id === 'joshi' ? 'anjali' : id === 'patil' ? 'rajesh' : id;
  return DOCTOR_PROFILES.find((doctor) => doctor.id === alias) ?? DOCTOR_PROFILES[0];
}
