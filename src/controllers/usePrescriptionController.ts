import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, Share } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetPrescriptionQuery,
  useLazyGetErxPdfMetaQuery,
} from '../store/api/new/recordsApi';

export type PrescriptionMedicine = {
  name: string;
  nameKey: TranslationKey;
  dose: string;
  doseKey: TranslationKey;
  time: string;
  timeKey: TranslationKey;
  duration: string;
  durationKey: TranslationKey;
  note: string;
  noteKey: TranslationKey;
  noteAlert?: boolean;
};

export type PrescriptionViewModel = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
  medicines: PrescriptionMedicine[];
  adviceKeys: TranslationKey[];
  doctorName: string;
  doctorCredentials: string;
  doctorInitials: string;
  patientName: string;
  rxNumber: string;
  rxDate: string;
  status: string;
  loading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  onOrder: () => void;
  onVerify: () => void;
  onOpenVersionHistory: () => void;
  onRetry: () => void;
};

function messageForPdfError(err: unknown): string {
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined;
  if (status === 409) {
    return 'Prescription not signed yet';
  }
  if (status === 403) {
    return 'You do not have access to this prescription.';
  }
  const data =
    err && typeof err === 'object' && 'data' in err
      ? (err as { data?: { message?: string } }).data
      : undefined;
  return data?.message?.trim() || 'Could not open prescription PDF.';
}

export function usePrescriptionController({
  patientAppId,
  erxSnapshotId: erxSnapshotIdProp,
  doctorName: doctorNameProp,
  doctorCredentials: doctorCredentialsProp,
  doctorInitials: doctorInitialsProp,
  patientName: patientNameProp,
  diagnosis: _diagnosisProp,
  appointmentDate: appointmentDateProp,
  onBack,
  onOrder,
}: {
  /** Visit id for Erx lookup — skip query when null. */
  patientAppId?: number | string | null;
  /** Prefer explicit snapshot id from visit detail when available. */
  erxSnapshotId?: number | string | null;
  doctorName?: string | null;
  doctorCredentials?: string | null;
  doctorInitials?: string | null;
  patientName?: string | null;
  diagnosis?: string | null;
  appointmentDate?: string | null;
  onBack: () => void;
  onOrder?: () => void;
}): PrescriptionViewModel {
  const { language, t } = useLocalization();
  const id =
    patientAppId != null && String(patientAppId).length > 0
      ? patientAppId
      : null;
  const { data, isLoading, isError, isFetching, refetch } =
    useGetPrescriptionQuery(id as number | string, {
      skip: id == null,
    });
  const [fetchPdfMeta] = useLazyGetErxPdfMetaQuery();
  const [pdfBusy, setPdfBusy] = useState(false);

  const erxSnapshotId =
    erxSnapshotIdProp != null && String(erxSnapshotIdProp).length > 0
      ? Number(erxSnapshotIdProp)
      : data?.data?.erxSnapshotId != null
        ? Number(data.data.erxSnapshotId)
        : null;

  const openPdf = useCallback(
    async (mode: 'share' | 'open') => {
      if (erxSnapshotId == null || !Number.isFinite(erxSnapshotId)) {
        Alert.alert('Prescription', 'No prescription PDF is available yet.');
        return;
      }
      if (pdfBusy) return;
      setPdfBusy(true);
      try {
        const res = await fetchPdfMeta(erxSnapshotId).unwrap();
        const pdfUrl = res.data?.pdfUrl?.trim();
        const expiresAt = res.data?.expiresAt;
        if (
          expiresAt &&
          !Number.isNaN(Date.parse(expiresAt)) &&
          Date.parse(expiresAt) < Date.now()
        ) {
          const refreshed = await fetchPdfMeta(erxSnapshotId).unwrap();
          const url = refreshed.data?.pdfUrl?.trim();
          if (!url) {
            Alert.alert('Prescription', 'PDF link is not available.');
            return;
          }
          if (mode === 'share') {
            await Share.share({ url, message: url });
          } else {
            await Linking.openURL(url);
          }
          return;
        }
        if (!pdfUrl) {
          Alert.alert('Prescription', 'PDF link is not available.');
          return;
        }
        if (mode === 'share') {
          await Share.share({ url: pdfUrl, message: pdfUrl });
        } else {
          await Linking.openURL(pdfUrl);
        }
      } catch (err) {
        Alert.alert('Prescription', messageForPdfError(err));
      } finally {
        setPdfBusy(false);
      }
    },
    [erxSnapshotId, fetchPdfMeta, pdfBusy],
  );

  const medicines = useMemo<PrescriptionMedicine[]>(() => {
    const items = data?.data?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => {
        const remedyName = item.remedyName?.trim();
        const remedyCode = item.remedyCode?.trim();
        const potency = item.potencyCode?.trim();
        let name = '';
        if (remedyName) {
          name = potency ? `${remedyName} (${potency})` : remedyName;
        } else if (remedyCode) {
          name = potency ? `${remedyCode} (${potency})` : remedyCode;
        } else {
          name = 'Remedy';
        }
        const dose = item.dose?.trim() || '-';
        const time = item.frequency?.trim() || '-';
        const duration = item.duration?.trim() || '-';
        const note = item.instructions?.trim() || '-';

        return {
          name,
          nameKey: name as TranslationKey,
          dose,
          doseKey: dose as TranslationKey,
          time,
          timeKey: time as TranslationKey,
          duration,
          durationKey: duration as TranslationKey,
          note,
          noteKey: note as TranslationKey,
        };
      });
    }
    return [];
  }, [data?.data?.items]);

  const adviceKeys = useMemo<TranslationKey[]>(() => {
    return [];
  }, []);

  const rxNumber = useMemo(() => {
    if (data?.data?.erxSnapshotId) {
      return `RX-${data.data.erxSnapshotId}`;
    }
    if (erxSnapshotId) {
      return `RX-${erxSnapshotId}`;
    }
    if (id) {
      return `RX-${id}`;
    }
    return t('rxNumber');
  }, [data?.data?.erxSnapshotId, erxSnapshotId, id, t]);

  const rxDate = useMemo(() => {
    const raw = data?.data?.signedAt;
    if (raw && !isNaN(Date.parse(raw))) {
      return new Date(raw).toLocaleDateString(
        language === 'mr' ? 'mr-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' },
      );
    }
    return appointmentDateProp || t('rxDate');
  }, [data?.data?.signedAt, appointmentDateProp, language, t]);

  const doctorName = doctorNameProp || '';
  const doctorCredentials = doctorCredentialsProp || '';
  const doctorInitials =
    doctorInitialsProp ||
    (doctorName
      ? doctorName
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'DR');
  const patientName = patientNameProp || '';
  const status = data?.data?.status || 'SIGNED';

  return {
    language,
    t,
    medicines,
    adviceKeys,
    doctorName,
    doctorCredentials,
    doctorInitials,
    patientName,
    rxNumber,
    rxDate,
    status,
    loading: id != null && (isLoading || isFetching),
    isError: id != null && isError,
    isEmpty: id != null && !isLoading && !isFetching && !isError && medicines.length === 0,
    onBack,
    onShare: () => {
      void openPdf('share');
    },
    onDownload: () => {
      void openPdf('open');
    },
    onOrder: () => onOrder?.(),
    onVerify: () => undefined,
    onOpenVersionHistory: () => undefined,
    onRetry: () => {
      void refetch();
    },
  };
}
