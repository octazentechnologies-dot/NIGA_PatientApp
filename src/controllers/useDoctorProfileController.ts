import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';

import {
  getDoctorProfile,
  type DoctorProfileSeed,
  type ProfileTab,
} from '../config/doctorProfiles';
import {
  useGetDoctorByIdQuery,
  useGetDoctorFeesQuery,
  useGetDoctorReviewsQuery,
} from '../store/api/new/doctorsApi';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

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
  saved: boolean;
  aboutExpanded: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  onSelectTab: (tab: ProfileTab) => void;
  onToggleAbout: () => void;
  onOpenDetails: () => void;
  onBook: () => void;
};

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
  const isNumeric = !isNaN(Number(doctorId));
  const { data: doctorDetailResponse } = useGetDoctorByIdQuery(doctorId, {
    skip: !isNumeric,
  });
  const { data: feesResponse } = useGetDoctorFeesQuery(doctorId, {
    skip: !isNumeric,
  });
  const { data: reviewsResponse } = useGetDoctorReviewsQuery(doctorId, {
    skip: !isNumeric,
  });

  const baseProfile = useMemo(() => getDoctorProfile(doctorId), [doctorId]);
  const profile = useMemo(() => {
    if (!doctorDetailResponse?.data) return baseProfile;
    const doc = doctorDetailResponse.data;
    const rating =
      reviewsResponse?.averageRating != null
        ? reviewsResponse.averageRating.toFixed(1)
        : doc.averageRating != null
          ? doc.averageRating.toFixed(1)
          : baseProfile.rating;

    const docName = doc.displayName || 'Doctor';
    const initials = docName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || baseProfile.initials;

    const teleFee = feesResponse?.data?.teleFee ?? doc.consultFeeTele;
    const clinicFee = feesResponse?.data?.inClinicFee ?? doc.consultFeeInClinic;

    const dynamicAbout =
      (doc as any).about ||
      (doc as any).bio ||
      (doc as any).aboutDoctor ||
      doc.rankingSummary?.trim() ||
      '';

    const aboutKey = dynamicAbout
      ? (dynamicAbout as TranslationKey)
      : ('' as TranslationKey);

    const dynamicExp =
      (doc as any).experienceYears != null
        ? `${(doc as any).experienceYears} yrs exp`
        : (doc as any).experience != null
          ? `${(doc as any).experience} yrs exp`
          : '';
    const experienceKey = dynamicExp
      ? (dynamicExp as TranslationKey)
      : ('' as TranslationKey);

    const qualifications = doc.qualification
      ? [
          {
            titleKey: doc.qualification as TranslationKey,
            detailKey: (doc.clinicName || doc.city || 'Verified Doctor') as TranslationKey,
            badgeKey: (doc.isVerified ? 'verifiedByCouncil' : '') as TranslationKey,
          },
        ]
      : [];

    return {
      ...baseProfile,
      id: String(doc.doctorId),
      nameKey: docName as TranslationKey,
      credentialsKey: (doc.qualification || t(baseProfile.credentialsKey)) as TranslationKey,
      initials,
      verified: doc.isVerified ?? baseProfile.verified,
      rating,
      aboutKey,
      experienceKey,
      consultsKey: '' as TranslationKey,
      feeKey: teleFee ? (`₹${teleFee}` as TranslationKey) : baseProfile.feeKey,
      clinicFeeKey: clinicFee ? (`₹${clinicFee}` as TranslationKey) : baseProfile.clinicFeeKey,
      reviewsKey: (reviewsResponse?.reviewCount != null
        ? `${reviewsResponse.reviewCount} reviews`
        : doc.reviewCount
          ? `${doc.reviewCount} reviews`
          : 'reviewsCount') as TranslationKey,
      reviewIds: [],
      regVerifiedKey: (doc.isVerified ? 'verifiedByCouncil' : 'notVerified') as TranslationKey,
      credentialsDetail: {
        ...baseProfile.credentialsDetail,
        qualifications,
        registration: {
          titleKey: (doc.isVerified ? 'Verified Registration' : 'Registration') as TranslationKey,
          councilKey: (doc.city ? `City: ${doc.city}` : '') as TranslationKey,
          statusKey: (doc.isVerified ? 'Active' : '') as TranslationKey,
          validKey: '' as TranslationKey,
        },
        focus: undefined,
        careLink: undefined,
      },
    };
  }, [baseProfile, doctorDetailResponse?.data, feesResponse?.data, reviewsResponse, t]);

  const reviews = useMemo<DynamicDoctorReview[]>(() => {
    if (
      !reviewsResponse?.data ||
      !Array.isArray(reviewsResponse.data) ||
      reviewsResponse.data.length === 0
    ) {
      return [];
    }
    return reviewsResponse.data.map((r, index) => {
      const name =
        (r as any).patientName ||
        (r as any).reviewerName ||
        (r as any).author ||
        (r as any).userName ||
        (r as any).name ||
        `Patient ${index + 1}`;

      let dateLabel = '';
      if (r.at) {
        try {
          const d = new Date(r.at);
          if (!isNaN(d.getTime())) {
            dateLabel = d.toLocaleDateString();
          }
        } catch {
          dateLabel = r.at;
        }
      }

      return {
        id: String(r.reviewId || index),
        reviewerName: name,
        rating: typeof r.rating === 'number' ? r.rating : 5,
        body: r.text || '',
        dateLabel,
      };
    });
  }, [reviewsResponse?.data]);

  const [tab, setTab] = useState<ProfileTab>('about');
  const [saved, setSaved] = useState(false);
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
    onBack,
    onShare: () => {
      Share.share({
        message: `${t(profile.nameKey)}\n${t(profile.credentialsKey)}`,
      }).catch(() => undefined);
    },
    onToggleSave: () => setSaved((current) => !current),
    onSelectTab: setTab,
    onToggleAbout: () => setAboutExpanded((current) => !current),
    onOpenDetails: () => setTab('credentials'),
    onBook: () => onBook?.(),
  };
}
