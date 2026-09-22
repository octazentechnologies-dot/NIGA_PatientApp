import { useEffect, useMemo, useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type RateAspectId = 'listened' | 'onTime' | 'avQuality';

export type RateTagId =
  | 'explainedWell'
  | 'patientKind'
  | 'onTime'
  | 'clearRx'
  | 'goodMarathi'
  | 'answered'
  | 'callPoor'
  | 'startedLate';

export type RateConsultationViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  submitted: boolean;
  doctorName: string;
  consultMeta: string;
  overallRating: number;
  overallLabel: string;
  aspectRatings: Record<RateAspectId, number>;
  aspects: { id: RateAspectId; labelKey: TranslationKey }[];
  tags: { id: RateTagId; labelKey: TranslationKey }[];
  selectedTags: RateTagId[];
  reviewText: string;
  reviewMax: number;
  postAsName: string;
  postPublicly: boolean;
  reviewId: string;
  onClose: () => void;
  onSelectOverall: (value: number) => void;
  onSelectAspect: (id: RateAspectId, value: number) => void;
  onToggleTag: (id: RateTagId) => void;
  onChangeReviewText: (value: string) => void;
  onTogglePostPublicly: (value: boolean) => void;
  onRaiseComplaint: () => void;
  onSubmit: () => void;
  onSeeReviews: () => void;
  onVoiceInput: () => void;
};

const ASPECTS: RateConsultationViewModel['aspects'] = [
  { id: 'listened', labelKey: 'rateAspectListened' },
  { id: 'onTime', labelKey: 'rateAspectOnTime' },
  { id: 'avQuality', labelKey: 'rateAspectAvQuality' },
];

const TAGS: RateConsultationViewModel['tags'] = [
  { id: 'explainedWell', labelKey: 'rateTagExplainedWell' },
  { id: 'patientKind', labelKey: 'rateTagPatientKind' },
  { id: 'onTime', labelKey: 'rateTagOnTime' },
  { id: 'clearRx', labelKey: 'rateTagClearRx' },
  { id: 'goodMarathi', labelKey: 'rateTagGoodMarathi' },
  { id: 'answered', labelKey: 'rateTagAnswered' },
  { id: 'callPoor', labelKey: 'rateTagCallPoor' },
  { id: 'startedLate', labelKey: 'rateTagStartedLate' },
];

const OVERALL_KEYS: TranslationKey[] = [
  'rateLabelPoor',
  'rateLabelFair',
  'rateLabelGood',
  'rateLabelVeryGood',
  'rateLabelExcellent',
];

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

export function useRateConsultationController({
  appointment,
  durationMinutes,
  active,
  onClose,
  onFinished,
}: {
  appointment: BookedAppointment | null;
  durationMinutes: number;
  active?: boolean;
  onClose: () => void;
  onFinished: () => void;
}): RateConsultationViewModel {
  const { language, t } = useLocalization();
  const [submitted, setSubmitted] = useState(false);
  const [overallRating, setOverallRating] = useState(4);
  const [aspectRatings, setAspectRatings] = useState<Record<RateAspectId, number>>({
    listened: 4,
    onTime: 3,
    avQuality: 5,
  });
  const [selectedTags, setSelectedTags] = useState<RateTagId[]>([
    'explainedWell',
    'onTime',
  ]);
  const [reviewText, setReviewText] = useState('');
  const [postPublicly, setPostPublicly] = useState(true);

  useEffect(() => {
    if (!active) {
      return;
    }
    setSubmitted(false);
    setOverallRating(4);
    setAspectRatings({ listened: 4, onTime: 3, avQuality: 5 });
    setSelectedTags(['explainedWell', 'onTime']);
    setReviewText('');
    setPostPublicly(true);
  }, [active]);

  const doctorName = appointment
    ? t(appointment.doctorNameKey)
    : t('searchResultAnjaliName');
  const mins = localizeDigits(String(Math.max(1, durationMinutes)), language);
  const modeLabel = appointment?.modeConsultLabel ?? t('reviewVideoConsult');
  const datePart = appointment?.whenLabel?.split(',')[0] ?? '26 Aug 2026';

  const overallLabel = useMemo(() => {
    if (overallRating < 1) {
      return '';
    }
    return t(OVERALL_KEYS[overallRating - 1]);
  }, [overallRating, t]);

  return {
    language,
    t,
    submitted,
    doctorName,
    consultMeta: t('rateConsultMeta')
      .replace('{date}', datePart)
      .replace('{mode}', modeLabel)
      .replace('{mins}', mins),
    overallRating,
    overallLabel,
    aspectRatings,
    aspects: ASPECTS,
    tags: TAGS,
    selectedTags,
    reviewText,
    reviewMax: 500,
    postAsName: t('ratePostAsName'),
    postPublicly,
    reviewId: 'RV-99271',
    onClose: () => {
      if (submitted) {
        onFinished();
        return;
      }
      onClose();
    },
    onSelectOverall: setOverallRating,
    onSelectAspect: (id, value) => {
      setAspectRatings((prev) => ({ ...prev, [id]: value }));
    },
    onToggleTag: (id) => {
      setSelectedTags((prev) =>
        prev.includes(id) ? prev.filter((tag) => tag !== id) : [...prev, id],
      );
    },
    onChangeReviewText: (value) => {
      setReviewText(value.slice(0, 500));
    },
    onTogglePostPublicly: setPostPublicly,
    onRaiseComplaint: () => undefined,
    onSubmit: () => {
      if (overallRating < 1) {
        return;
      }
      setSubmitted(true);
    },
    onSeeReviews: onFinished,
    onVoiceInput: () => undefined,
  };
}
