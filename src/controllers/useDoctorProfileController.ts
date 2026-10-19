import { useEffect, useMemo, useState } from 'react';
import { Platform, Share } from 'react-native';

import type { DoctorProfileSeed, ProfileTab } from '../config/doctorProfiles';
import {
  useGetDoctorByIdQuery,
  useGetDoctorFeesQuery,
  useGetDoctorReviewsQuery,
  useGetDoctorTeleAvailabilityQuery,
} from '../store/api/new/doctorsApi';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useAppConfig } from '../providers/AppConfigProvider';
import {
  formatDate,
  formatMoney,
  formatTime,
  resolveApiUrl,
} from '../utilities/formatters';

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
  const appConfig = useAppConfig();
  const isNumeric = Boolean(doctorId) && /^\d+$/.test(doctorId);
  const {
    data: doctorDetailResponse,
    currentData: doctorDetailCurrent,
    isLoading: detailLoading,
    isFetching: detailFetching,
  } = useGetDoctorByIdQuery(doctorId, {
    skip: !isNumeric,
  });
  const {
    data: feesResponse,
    currentData: feesCurrent,
    isLoading: feesLoading,
    isFetching: feesFetching,
  } = useGetDoctorFeesQuery(doctorId, {
    skip: !isNumeric,
  });
  const { data: reviewsResponse, currentData: reviewsCurrent } =
    useGetDoctorReviewsQuery(doctorId, {
      skip: !isNumeric,
    });
  const {
    data: teleAvailability,
    currentData: teleCurrent,
    isLoading: teleLoading,
    isFetching: teleFetching,
  } = useGetDoctorTeleAvailabilityQuery(doctorId, { skip: !isNumeric });

  // Prefer currentData so a previous doctor's cached payload never paints
  // while the newly selected doctorId is still fetching.
  const doctorDetail = doctorDetailCurrent ?? doctorDetailResponse;
  const fees = feesCurrent ?? feesResponse;
  const reviewsPayload = reviewsCurrent ?? reviewsResponse;
  const teleAvailabilityPayload = teleCurrent ?? teleAvailability;

  useEffect(() => {
    if (!isNumeric) {
      onBack();
    }
  }, [isNumeric, onBack]);

  const detailMatches =
    doctorDetail?.data != null &&
    String(doctorDetail.data.doctorId) === String(doctorId);

  const profile = useMemo((): DoctorProfileSeed => {
    if (!isNumeric) {
      return emptyProfile(doctorId || '0');
    }

    const doc = doctorDetail?.data;
    if (!doc || String(doc.doctorId) !== String(doctorId)) {
      return emptyProfile(doctorId);
    }
    const tele = teleAvailabilityPayload?.data;
    const nextRaw =
      tele?.nextAvailableAt?.trim() ||
      (doc as { nextAvailableAt?: string | null }).nextAvailableAt?.trim() ||
      '';
    const teleOnline =
      tele?.isOnline === true || tele?.available === true;
    const nextDate = formatDate(nextRaw || null, language === 'mr' ? 'mr-IN' : 'en-IN');
    const nextTime = formatTime(nextRaw || null, language === 'mr' ? 'mr-IN' : 'en-IN');
    const nextLabel = [nextDate, nextTime].filter(Boolean).join(' · ');

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
      reviewsPayload?.reviewCount ?? doc.reviewCount ?? 0;
    const averageRating =
      reviewsPayload?.averageRating ?? doc.averageRating ?? null;
    const rating =
      reviewCount > 0 && averageRating != null
        ? averageRating.toFixed(1)
        : null;

    // Prefer Public doctor detail fees (same as search/booking). Fees/Public can
    // lag behind doctor fee updates for some profiles.
    const teleFee =
      doc.consultFeeTele ?? fees?.data?.teleFee ?? null;
    const clinicFee =
      doc.consultFeeInClinic ?? fees?.data?.inClinicFee ?? null;
    const currency = fees?.data?.currency ?? 'INR';
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
      nextAvailableKey: nextLabel
        ? (`Next available ${nextLabel}` as TranslationKey)
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
    doctorDetail?.data,
    doctorId,
    fees?.data,
    isNumeric,
    language,
    reviewsPayload?.averageRating,
    reviewsPayload?.reviewCount,
    teleAvailabilityPayload?.data,
  ]);

  const reviews = useMemo<DynamicDoctorReview[]>(() => {
    if (!detailMatches) {
      return [];
    }
    if (!reviewsPayload?.data || !Array.isArray(reviewsPayload.data)) {
      return [];
    }
    return reviewsPayload.data.map((r, index) => {
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
  }, [detailMatches, reviewsPayload?.data]);

  const [tab, setTab] = useState<ProfileTab>('about');
  const saved = false;
  const [aboutExpanded, setAboutExpanded] = useState(true);

  useEffect(() => {
    setTab('about');
    setAboutExpanded(true);
  }, [doctorId]);

  // Hold the shimmer until THIS doctor's detail (+ fee + tele) have settled.
  // detailMatches blocks painting a previously selected doctor.
  const isLoading =
    isNumeric &&
    (!detailMatches ||
      detailLoading ||
      feesLoading ||
      teleLoading ||
      (detailFetching && !detailMatches) ||
      (feesFetching && fees == null) ||
      (teleFetching && teleAvailabilityPayload == null));

  return {
    language,
    t,
    profile,
    reviews,
    tab,
    saved,
    aboutExpanded,
    isLoading,
    onBack,
    onShare: () => {
      const name = String(profile.nameKey).trim() || 'Doctor';
      const creds = String(profile.credentialsKey).trim();
      const site = appConfig.siteUrl?.replace(/\/$/, '') || null;
      const profileUrl = site
        ? `${site}/doctor/${profile.id}`
        : `nigapatient://doctor/${profile.id}`;
      const lines = [
        name,
        creds || null,
        profile.teleFeeLabel ? `Tele ${profile.teleFeeLabel}` : null,
        profile.clinicFeeLabel ? `In-clinic ${profile.clinicFeeLabel}` : null,
        '',
        profileUrl,
      ].filter((line) => line != null) as string[];
      const message = lines.join('\n');
      void Share.share(
        Platform.OS === 'ios'
          ? { message, url: profileUrl, title: name }
          : { message, title: name },
      ).catch(() => undefined);
    },
    onToggleSave: () => undefined,
    onSelectTab: setTab,
    onToggleAbout: () => setAboutExpanded((current) => !current),
    onOpenDetails: () => setTab('credentials'),
    onBook: () => onBook?.(),
  };
}
