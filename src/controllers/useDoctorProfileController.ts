import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';

import type { DoctorProfileSeed, ProfileTab } from '../config/doctorProfiles';
import {
  useGetDoctorByIdQuery,
  useGetDoctorFeesQuery,
  useGetDoctorReviewsQuery,
  useGetDoctorTeleAvailabilityQuery,
} from '../store/api/new/doctorsApi';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { formatMoney, resolveApiUrl } from '../utilities/formatters';

export type DynamicDoctorReview = {
  id: string;
  reviewerName: string;
  rating: number;
  body: string;
  dateLabel: string;
};

export type DoctorProfileViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  profile: DoctorProfileSeed;
  reviews: DynamicDoctorReview[];
  tab: ProfileTab;
  /** BE-031 — article/doctor bookmarks not planned; always false. */
  saved: boolean;
  aboutExpanded: boolean;
  isLoading: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onSelectTab: (tab: ProfileTab) => void;
  onToggleAbout: () => void;
  onOpenDetails: () => void;
  onBook: () => void;
};

function emptyProfile(id: string): DoctorProfileSeed {
  return {
    id,
    initials: 'DR',
    verified: false,
    nameKey: '' as TranslationKey,
    credentialsKey: '' as TranslationKey,
    experienceKey: '',
    rating: null,
    reviewCount: 0,
    reviewsKey: '' as TranslationKey,
    consultsKey: '',
    aboutKey: '',
    regVerifiedKey: '' as TranslationKey,
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
      qualifications: [],
    },
  };
}

export function useDoctorProfileController({
  doctorId,
  onBack,
  onBook,
}: {
  doctorId: string;
  onBack: () => void;
  onBook?: () => void;
}): DoctorProfileViewModel {
  const { language, t } = useLocalization();
  const isNumeric = Boolean(doctorId) && /^\d+$/.test(doctorId);
  const {
    data: doctorDetailResponse,
    isLoading: detailLoading,
  } = useGetDoctorByIdQuery(doctorId, {
    skip: !isNumeric,
  });
  const { data: feesResponse } = useGetDoctorFeesQuery(doctorId, {
    skip: !isNumeric,
  });
  const { data: reviewsResponse } = useGetDoctorReviewsQuery(doctorId, {
    skip: !isNumeric,
  });
  const { data: teleAvailability } = useGetDoctorTeleAvailabilityQuery(
    doctorId,
    { skip: !isNumeric },
  );

  useEffect(() => {
    if (!isNumeric) {
      onBack();
    }
  }, [isNumeric, onBack]);

  const profile = useMemo((): DoctorProfileSeed => {
    if (!isNumeric) {
      return emptyProfile(doctorId || '0');
    }

    const doc = doctorDetailResponse?.data;
    if (!doc) {
      return emptyProfile(doctorId);
    }
    const tele = teleAvailability?.data;
    const nextAt =
      tele?.nextAvailableAt?.trim() ||
      (doc as { nextAvailableAt?: string | null }).nextAvailableAt?.trim() ||
      '';
    const teleOnline =
      tele?.isOnline === true || tele?.available === true;

    const docName = (doc.displayName || '').trim() || 'Doctor';
    const initials =
      docName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DR';

    const reviewCount =
      reviewsResponse?.reviewCount ?? doc.reviewCount ?? 0;
    const averageRating =
      reviewsResponse?.averageRating ?? doc.averageRating ?? null;
    const rating =
      reviewCount > 0 && averageRating != null
        ? averageRating.toFixed(1)
        : null;

    const teleFee =
      feesResponse?.data?.teleFee ?? doc.consultFeeTele ?? null;
    const clinicFee =
      feesResponse?.data?.inClinicFee ?? doc.consultFeeInClinic ?? null;
    const currency = feesResponse?.data?.currency ?? 'INR';
    const teleFeeLabel = formatMoney(teleFee, currency);
    const clinicFeeLabel = formatMoney(clinicFee, currency);
    const verified = Boolean(doc.verified ?? doc.isVerified);

    const registrationNumber = doc.registrationNumber?.trim() || null;
    const passingUniversity = doc.passingUniversity?.trim() || null;

    const qualifications =
      doc.qualification || passingUniversity
        ? [
            {
              titleKey: (doc.qualification || '') as TranslationKey,
              detailKey: (passingUniversity || doc.city || '') as TranslationKey,
              badgeKey: (verified ? 'verifiedByCouncil' : '') as TranslationKey,
            },
          ]
        : [];

    return {
      id: String(doc.doctorId),
      initials,
      verified,
      nameKey: docName as TranslationKey,
      credentialsKey: (doc.qualification || '') as TranslationKey,
      experienceKey: '', // yearsExperience always null — do not invent
      rating,
      reviewCount,
      reviewsKey: `${reviewCount}` as TranslationKey,
      consultsKey: '',
      aboutKey: (doc.rankingSummary?.trim() || '') as TranslationKey,
      regVerifiedKey: (verified ? 'verifiedByCouncil' : '') as TranslationKey,
      lastVerifiedKey: '',
      nextAvailableKey: nextAt
        ? (`Next available ${nextAt}` as TranslationKey)
        : teleOnline
          ? ('Online now' as TranslationKey)
          : ('' as TranslationKey),
      feeKey: (teleFeeLabel || '') as TranslationKey,
      clinicFeeKey: (clinicFeeLabel || '') as TranslationKey,
      teleFeeLabel,
      clinicFeeLabel,
      registrationNumber,
      passingUniversity,
      photoUrl: resolveApiUrl(doc.photoUrl ?? null),
      careNeedKeys: [],
      languageKeys: [], // not returned by API
      reviewIds: [],
      credentialsDetail: {
        // blocked: B-016 — only qualification / registrationNumber / passingUniversity. Do not invent degrees.
        qualifications,
        registration: registrationNumber
          ? {
              titleKey: registrationNumber as TranslationKey,
              councilKey: '' as TranslationKey,
              statusKey: '' as TranslationKey,
              validKey: '' as TranslationKey,
            }
          : undefined,
        // Focus / CareLink not in Public Doctors — omit (compliance: do not invent)
      },
    };
  }, [
    doctorDetailResponse?.data,
    doctorId,
    feesResponse?.data,
    isNumeric,
    reviewsResponse?.averageRating,
    reviewsResponse?.reviewCount,
    teleAvailability?.data,
  ]);

  const reviews = useMemo<DynamicDoctorReview[]>(() => {
    if (!reviewsResponse?.data || !Array.isArray(reviewsResponse.data)) {
      return [];
    }
    return reviewsResponse.data.map((r, index) => {
      let dateLabel = '';
      if (r.at) {
        try {
          const d = new Date(r.at);
          if (!Number.isNaN(d.getTime())) {
            dateLabel = d.toLocaleDateString();
          }
        } catch {
          dateLabel = r.at;
        }
      }
      return {
        id: String(r.reviewId || index),
        reviewerName: 'Patient',
        rating: typeof r.rating === 'number' ? r.rating : 0,
        body: r.text || '',
        dateLabel,
      };
    });
  }, [reviewsResponse?.data]);

  const [tab, setTab] = useState<ProfileTab>('about');
  const saved = false;
  const [aboutExpanded, setAboutExpanded] = useState(true);

  useEffect(() => {
    setTab('about');
    setAboutExpanded(true);
  }, [doctorId]);

  return {
    language,
    t,
    profile,
    reviews,
    tab,
    saved,
    aboutExpanded,
    isLoading: isNumeric && detailLoading,
    onBack,
    onShare: () => {
      const name = String(profile.nameKey);
      const creds = String(profile.credentialsKey);
      Share.share({
        message: creds ? `${name}\n${creds}` : name,
      }).catch(() => undefined);
    },
    onToggleSave: () => undefined,
    onSelectTab: setTab,
    onToggleAbout: () => setAboutExpanded((current) => !current),
    onOpenDetails: () => setTab('credentials'),
    onBook: () => onBook?.(),
  };
}
