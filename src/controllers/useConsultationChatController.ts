import { useMemo, useState } from 'react';

import type { BookedAppointment } from '../config/bookedAppointments';
import { images } from '../config/images';
import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type ChatMessageKind = 'text' | 'image' | 'prescription' | 'system';

export type ChatMessage = {
  id: string;
  kind: ChatMessageKind;
  from: 'doctor' | 'patient' | 'system';
  body?: string;
  timeLabel: string;
  read?: boolean;
  imageSource?: number;
  fileName?: string;
  fileSize?: string;
  dateGroup: string;
};

export type ConsultationChatViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  doctorName: string;
  statusLabel: string;
  linkedLabel: string;
  closed: boolean;
  closedDateLabel: string;
  messages: ChatMessage[];
  draft: string;
  replySlaLabel: string;
  canSend: boolean;
  onBack: () => void;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onViewLinked: () => void;
  onOpenVideo: () => void;
  onViewPrescription: () => void;
  onBookConsultation: () => void;
  /** Demo: long-press header subtitle to toggle closed. */
  onToggleClosedDemo: () => void;
};

function localizeDigits(value: string, language: AppLanguage): string {
  if (language !== 'mr') {
    return value;
  }
  return value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)] ?? digit);
}

function formatCloseLabel(iso: string | undefined, language: AppLanguage): string {
  if (!iso) {
    return language === 'en' ? '02 Sep' : '०२ सप्टें';
  }
  const date = new Date(iso);
  const monthEn = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const raw = `${date.getDate()} ${monthEn[date.getMonth()]}`;
  return localizeDigits(raw, language);
}

function seedMessages(language: AppLanguage, closed: boolean): ChatMessage[] {
  if (closed) {
    return [
      {
        id: 'c1',
        kind: 'text',
        from: 'doctor',
        body:
          language === 'en'
            ? 'How is the rash after two days of the new potency?'
            : 'नवीन पोटेन्सीनंतर दोन दिवसांनी पुरळ कशी आहे?',
        timeLabel: localizeDigits('10:00 AM', language),
        dateGroup: language === 'en' ? '28 Aug 2024' : '२८ ऑगस्ट २०२४',
      },
      {
        id: 'c2',
        kind: 'text',
        from: 'patient',
        body:
          language === 'en'
            ? 'Much better, itching is almost gone. Thank you doctor.'
            : 'खूप चांगले, खाज जवळजवळ गेली आहे. धन्यवाद डॉक्टर.',
        timeLabel: localizeDigits('10:22 AM', language),
        read: true,
        dateGroup: language === 'en' ? '28 Aug 2024' : '२८ ऑगस्ट २०२४',
      },
    ];
  }

  return [
    {
      id: '1',
      kind: 'text',
      from: 'doctor',
      body:
        language === 'en'
          ? 'Hello! Please share a clear photo of the rash today.'
          : 'नमस्कार! कृपया आज पुरळाचा स्पष्ट फोटो शेअर करा.',
      timeLabel: localizeDigits('10:02 AM', language),
      dateGroup: 'today',
    },
    {
      id: '2',
      kind: 'image',
      from: 'patient',
      imageSource: images.categorySkin,
      fileName: 'rash_left_arm.jpg',
      fileSize: '1.2 MB',
      timeLabel: localizeDigits('10:12 AM', language),
      dateGroup: 'today',
    },
    {
      id: '3',
      kind: 'text',
      from: 'patient',
      body:
        language === 'en'
          ? "I've uploaded the photo. It's still itching."
          : 'मी फोटो अपलोड केला आहे. अजून खाज येत आहे.',
      timeLabel: localizeDigits('10:15 AM', language),
      read: true,
      dateGroup: 'today',
    },
    {
      id: '4',
      kind: 'prescription',
      from: 'system',
      body:
        language === 'en'
          ? 'Dr. Deshmukh signed a prescription'
          : 'डॉ. देशमुख यांनी प्रिस्क्रिप्शन साइन केले',
      timeLabel: '',
      dateGroup: 'today',
    },
  ];
}

export function useConsultationChatController({
  appointment,
  onBack,
  onBookConsultation,
  onOpenVideo,
  onViewLinked,
}: {
  appointment: BookedAppointment | null;
  onBack: () => void;
  onBookConsultation: () => void;
  onOpenVideo: () => void;
  onViewLinked: () => void;
}): ConsultationChatViewModel {
  const { language, t } = useLocalization();
  const closesLabel = formatCloseLabel(appointment?.chatClosesAt, language);
  const naturallyClosed = Boolean(
    appointment?.chatClosesAt &&
      new Date(appointment.chatClosesAt).getTime() < Date.now(),
  );
  const [forceClosed, setForceClosed] = useState(naturallyClosed);
  const [draft, setDraft] = useState('');
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);

  const closed = forceClosed || naturallyClosed;
  const baseMessages = useMemo(
    () => seedMessages(language, closed),
    [language, closed],
  );
  const messages = closed ? baseMessages : [...baseMessages, ...extraMessages];

  const doctorName = appointment
    ? t(appointment.doctorNameKey)
    : t('searchResultAnjaliName');
  const shortName = doctorName.replace(/^Dr\.\s*/i, '').split(' ')[0] || doctorName;

  const statusLabel = closed
    ? t('chatStatusClosed').replace('{date}', closesLabel)
    : t('chatStatusActive').replace('{date}', closesLabel);

  const linkedLabel = t('chatLinkedTo').replace(
    '{date}',
    appointment?.linkedConsultationLabel ??
      appointment?.bookedOnLabel ??
      (language === 'en' ? '26 Aug 2024' : '२६ ऑगस्ट २०२४'),
  );

  return {
    language,
    t,
    doctorName,
    statusLabel,
    linkedLabel,
    closed,
    closedDateLabel: closesLabel,
    messages,
    draft,
    replySlaLabel: t('chatReplySla').replace('{name}', shortName),
    canSend: draft.trim().length > 0 && !closed,
    onBack,
    onChangeDraft: setDraft,
    onSend: () => {
      const text = draft.trim();
      if (!text || closed) {
        return;
      }
      const now = new Date();
      const timeLabel = localizeDigits(
        `${((now.getHours() + 11) % 12) + 1}:${String(now.getMinutes()).padStart(2, '0')} ${
          now.getHours() >= 12 ? 'PM' : 'AM'
        }`,
        language,
      );
      setExtraMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          kind: 'text',
          from: 'patient',
          body: text,
          timeLabel,
          read: true,
          dateGroup: 'today',
        },
      ]);
      setDraft('');
    },
    onAttach: () => undefined,
    onViewLinked,
    onOpenVideo,
    onViewPrescription: () => undefined,
    onBookConsultation,
    onToggleClosedDemo: () => setForceClosed((prev) => !prev),
  };
}
