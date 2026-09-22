import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';

export type PrescriptionMedicine = {
  nameKey: TranslationKey;
  doseKey: TranslationKey;
  timeKey: TranslationKey;
  durationKey: TranslationKey;
  noteKey: TranslationKey;
  noteAlert?: boolean;
};

export type PrescriptionViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  medicines: PrescriptionMedicine[];
  adviceKeys: TranslationKey[];
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  onOrder: () => void;
  onVerify: () => void;
  onOpenVersionHistory: () => void;
};

const MEDICINES: PrescriptionMedicine[] = [
  {
    nameKey: 'rxMed1Name',
    doseKey: 'rxMedDose4',
    timeKey: 'rxMed1Time',
    durationKey: 'rxMedDuration15',
    noteKey: 'rxMed1Note',
    noteAlert: true,
  },
  {
    nameKey: 'rxMed2Name',
    doseKey: 'rxMedDose4',
    timeKey: 'rxMed2Time',
    durationKey: 'rxMedDuration15',
    noteKey: 'rxMed2Note',
  },
];

const ADVICE: TranslationKey[] = [
  'rxAdvice1',
  'rxAdvice2',
  'rxAdvice3',
];

export function usePrescriptionController({
  onBack,
  onOrder,
}: {
  onBack: () => void;
  onOrder?: () => void;
}): PrescriptionViewModel {
  const { language, t } = useLocalization();

  return {
    language,
    t,
    medicines: MEDICINES,
    adviceKeys: ADVICE,
    onBack,
    onShare: () => undefined,
    onDownload: () => undefined,
    onOrder: () => onOrder?.(),
    onVerify: () => undefined,
    onOpenVersionHistory: () => undefined,
  };
}
