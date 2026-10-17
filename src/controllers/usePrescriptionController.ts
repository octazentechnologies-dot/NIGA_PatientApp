import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, Share } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import {
  useGetPrescriptionQuery,
  useLazyGetErxPdfMetaQuery,
} from '../store/api/new/recordsApi';

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
  onBack,
  onOrder,
}: {
  /** Visit id for Erx lookup — skip query when null. */
  patientAppId?: number | string | null;
  /** Prefer explicit snapshot id from visit detail when available. */
  erxSnapshotId?: number | string | null;
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
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      nameKey: (item.remedyName || item.remedyCode || '') as TranslationKey,
      doseKey: (item.dose || '') as TranslationKey,
      timeKey: (item.frequency || '') as TranslationKey,
      durationKey: (item.duration || '') as TranslationKey,
      noteKey: (item.instructions || '') as TranslationKey,
    }));
  }, [data?.data?.items]);

  const adviceKeys = useMemo<TranslationKey[]>(() => {
    if (data?.data?.notesIncluded) {
      return [];
    }
    return [];
  }, [data?.data?.notesIncluded]);

  return {
    language,
    t,
    medicines,
    adviceKeys,
    loading: id != null && (isLoading || isFetching),
    isError: id != null && isError,
    isEmpty: id == null || (!isLoading && !isError && medicines.length === 0),
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
