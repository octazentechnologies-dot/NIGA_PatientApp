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
  /** Omit when registrationNumber is null. */
  registration?: RegistrationCard;
  focus?: FocusCredential;
  careLink?: CareLinkRole;
};

export type DoctorProfileSeed = {
  id: string;
  initials: string;
  verified: boolean;
  nameKey: TranslationKey;
  credentialsKey: TranslationKey;
  /** Always null from API (yearsExperience) — hide when empty. */
  experienceKey: TranslationKey | '';
  /** Null when reviewCount is 0. */
  rating: string | null;
  reviewCount: number;
  reviewsKey: TranslationKey;
  consultsKey: TranslationKey | '';
  aboutKey: TranslationKey | '';
  regVerifiedKey: TranslationKey;
  lastVerifiedKey: TranslationKey | '';
  nextAvailableKey: TranslationKey | '';
  /** Tele fee label; empty → hide. */
  feeKey: TranslationKey | '';
  /** In-clinic fee label; empty → hide. */
  clinicFeeKey: TranslationKey | '';
  teleFeeLabel: string | null;
  clinicFeeLabel: string | null;
  registrationNumber: string | null;
  passingUniversity: string | null;
  photoUrl: string | null;
  careNeedKeys: TranslationKey[];
  /** Not returned by API — keep empty. */
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
    experienceKey: '',
    rating: null,
    reviewCount: 0,
    reviewsKey: 'searchResultAnjaliReviews',
    consultsKey: '',
    aboutKey: '',
    regVerifiedKey: 'profileAnjaliRegVerified',
    lastVerifiedKey: '',
    nextAvailableKey: '',
    feeKey: '',
    clinicFeeKey: '',
    teleFeeLabel: null,
    clinicFeeLabel: null,
    registrationNumber: null,
    passingUniversity: null,
    photoUrl: null,
    careNeedKeys: [],
    languageKeys: [],
    reviewIds: [],
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
    experienceKey: '',
    rating: null,
    reviewCount: 0,
    reviewsKey: 'searchResultRajeshReviews',
    consultsKey: '',
    aboutKey: '',
    regVerifiedKey: 'profileRajeshRegVerified',
    lastVerifiedKey: '',
    nextAvailableKey: '',
    feeKey: '',
    clinicFeeKey: '',
    teleFeeLabel: null,
    clinicFeeLabel: null,
    registrationNumber: null,
    passingUniversity: null,
    photoUrl: null,
    careNeedKeys: [],
    languageKeys: [],
    reviewIds: [],
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
    experienceKey: '',
    rating: null,
    reviewCount: 0,
    reviewsKey: 'searchResultSunitaReviews',
    consultsKey: '',
    aboutKey: '',
    regVerifiedKey: 'profileSunitaRegVerified',
    lastVerifiedKey: '',
    nextAvailableKey: '',
    feeKey: '',
    clinicFeeKey: '',
    teleFeeLabel: null,
    clinicFeeLabel: null,
    registrationNumber: null,
    passingUniversity: null,
    photoUrl: null,
    careNeedKeys: [],
    languageKeys: [],
    reviewIds: [],
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
