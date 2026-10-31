import { useCallback, useMemo, useState } from 'react';
import { Linking, Share } from 'react-native';

import { useLocalization } from '../localization/i18n';
import type { AppLanguage, TranslationKey } from '../localization/types';
import { useRequestRefillMutation } from '../store/api/new/medicinesApi';
import {
  resolveErxPdfUrl,
  useGetPrescriptionByAppointmentQuery,
  useGetPrescriptionQuery,
  useGetPrescriptionsListQuery,
  useLazyGetErxPdfMetaQuery,
} from '../store/api/new/recordsApi';
import type { OrderMedicinesLaunch } from '../utilities/medicineOrderStage';
import { getApiBodyMessage, getApiErrorMessage } from '../utilities/toast';

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
  itemCount?: number;
  pdfAvailable?: boolean;
  loading: boolean;
  isError: boolean;
  isEmpty: boolean;
  toastMessage: string | null;
  toastVariant: 'error' | 'success';
  onDismissToast: () => void;
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  canOrder: boolean;
  onOrder: () => void;
  refillBusy: boolean;
  onRequestRefill: () => void;
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
  appointmentId,
  erxSnapshotId: erxSnapshotIdProp,
  doctorName: doctorNameProp,
  doctorCredentials: doctorCredentialsProp,
  doctorInitials: doctorInitialsProp,
  patientName: patientNameProp,
  diagnosis: _diagnosisProp,
  appointmentDate: appointmentDateProp,
  patientId: patientIdProp,
  onBack,
  onOrder,
}: {
  /** Visit id for Erx lookup — skip query when null. */
  patientAppId?: number | string | null;
  /** Appointment id for GET /api/Erx/ByAppointment/{id} */
  appointmentId?: number | string | null;
  /** Prefer explicit snapshot id from visit detail when available. */
  erxSnapshotId?: number | string | null;
  doctorName?: string | null;
  doctorCredentials?: string | null;
  doctorInitials?: string | null;
  patientName?: string | null;
  diagnosis?: string | null;
  appointmentDate?: string | null;
  /** Family member patient id — scopes the prescription list query. */
  patientId?: number | null;
  onBack: () => void;
  onOrder?: (launch: OrderMedicinesLaunch) => void;
}): PrescriptionViewModel {
  const { language, t } = useLocalization();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'error' | 'success'>('error');
  const [requestRefill, { isLoading: refillBusy }] = useRequestRefillMutation();

  const resolvedAptId =
    appointmentId != null && String(appointmentId).length > 0
      ? appointmentId
      : patientAppId != null && String(patientAppId).length > 0
        ? patientAppId
        : null;

  const prescriptionListArg = useMemo(
    () =>
      patientIdProp != null && Number(patientIdProp) > 0
        ? { patientId: Number(patientIdProp) }
        : undefined,
    [patientIdProp],
  );
  const { data: prescriptionsListResponse } = useGetPrescriptionsListQuery(prescriptionListArg);
  const prescriptionsList = prescriptionsListResponse?.data;
  const rxFromList = useMemo(() => {
    if (!Array.isArray(prescriptionsList) || prescriptionsList.length === 0) return null;
    if (erxSnapshotIdProp != null && Number(erxSnapshotIdProp) > 0) {
      const match = prescriptionsList.find(
        (p) => Number(p.erxSnapshotId) === Number(erxSnapshotIdProp),
      );
      if (match) return match;
    }
    if (resolvedAptId != null && Number(resolvedAptId) > 0) {
      const match = prescriptionsList.find(
        (p) => Number(p.patientAppId) === Number(resolvedAptId),
      );
      if (match) return match;
    }
    return null;
  }, [prescriptionsList, erxSnapshotIdProp, resolvedAptId]);

  const aptQuery = useGetPrescriptionByAppointmentQuery(
    resolvedAptId as number | string,
    {
      skip: resolvedAptId == null,
    },
  );

  const patientQuery = useGetPrescriptionQuery(
    resolvedAptId as number | string,
    {
      skip: resolvedAptId == null || Boolean(aptQuery.data?.data),
    },
  );

  const data = aptQuery.data?.data ? aptQuery.data : patientQuery.data;

  const erxSnapshotId =
    erxSnapshotIdProp != null && String(erxSnapshotIdProp).length > 0
      ? Number(erxSnapshotIdProp)
      : data?.data?.erxSnapshotId != null
        ? Number(data.data.erxSnapshotId)
        : rxFromList?.erxSnapshotId != null
          ? Number(rxFromList.erxSnapshotId)
          : null;

  const hasPrescriptionData = Boolean(
    (erxSnapshotId != null && Number(erxSnapshotId) > 0) ||
      data?.data?.erxSnapshotId ||
      rxFromList != null,
  );

  const isLoading =
    !hasPrescriptionData &&
    ((aptQuery.isLoading && !patientQuery.data?.data) ||
      (aptQuery.isError && patientQuery.isLoading));
  const isFetching = !hasPrescriptionData && (aptQuery.isFetching || patientQuery.isFetching);
  const isError =
    !hasPrescriptionData &&
    aptQuery.isError &&
    (patientQuery.isError || patientQuery.data == null);

  const refetch = useCallback(() => {
    aptQuery.refetch();
    patientQuery.refetch();
  }, [aptQuery, patientQuery]);

  const [fetchPdfMeta] = useLazyGetErxPdfMetaQuery();
  const [pdfBusy, setPdfBusy] = useState(false);

  const openPdf = useCallback(
    async (mode: 'share' | 'open') => {
      if (erxSnapshotId == null || !Number.isFinite(erxSnapshotId)) {
        setToastMessage('No prescription PDF is available yet.');
        setToastVariant('error');
        return;
      }
      if (pdfBusy) return;
      setPdfBusy(true);
      try {
        let pdfUrl: string | null = null;
        try {
          const res = await fetchPdfMeta(erxSnapshotId).unwrap();
          pdfUrl = res.data?.pdfUrl?.trim() || null;
          const expiresAt = res.data?.expiresAt;
          if (
            expiresAt &&
            !Number.isNaN(Date.parse(expiresAt)) &&
            Date.parse(expiresAt) < Date.now()
          ) {
            const refreshed = await fetchPdfMeta(erxSnapshotId).unwrap();
            pdfUrl = refreshed.data?.pdfUrl?.trim() || null;
          }
        } catch {
          // If metadata endpoint fails, direct link fallback below
        }

        if (!pdfUrl) {
          pdfUrl = resolveErxPdfUrl(erxSnapshotId);
        }

        if (!pdfUrl) {
          setToastMessage('PDF link is not available.');
          setToastVariant('error');
          return;
        }

        if (mode === 'share') {
          await Share.share({ url: pdfUrl, message: pdfUrl });
        } else {
          await Linking.openURL(pdfUrl);
        }
      } catch (err) {
        const fallbackUrl = resolveErxPdfUrl(erxSnapshotId);
        if (fallbackUrl) {
          try {
            if (mode === 'share') {
              await Share.share({ url: fallbackUrl, message: fallbackUrl });
            } else {
              await Linking.openURL(fallbackUrl);
            }
            return;
          } catch {
            // fallback attempt failed, show error message below
          }
        }
        setToastMessage(messageForPdfError(err));
        setToastVariant('error');
      } finally {
        setPdfBusy(false);
      }
    },
    [erxSnapshotId, fetchPdfMeta, pdfBusy],
  );

  const medicines = useMemo<PrescriptionMedicine[]>(() => {
    const items = data?.data?.items ?? rxFromList?.items;
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
  }, [data?.data?.items, rxFromList?.items]);

  const adviceKeys = useMemo<TranslationKey[]>(() => {
    return [];
  }, []);

  const rxNumber = useMemo(() => {
    if (erxSnapshotId) {
      return `RX-${erxSnapshotId}`;
    }
    if (data?.data?.erxSnapshotId) {
      return `RX-${data.data.erxSnapshotId}`;
    }
    if (rxFromList?.erxSnapshotId) {
      return `RX-${rxFromList.erxSnapshotId}`;
    }
    if (resolvedAptId) {
      return `RX-${resolvedAptId}`;
    }
    return t('rxNumber');
  }, [erxSnapshotId, data?.data?.erxSnapshotId, rxFromList?.erxSnapshotId, resolvedAptId, t]);

  const rxDate = useMemo(() => {
    const raw = data?.data?.signedAt ?? rxFromList?.signedAt;
    if (raw && !isNaN(Date.parse(raw))) {
      return new Date(raw).toLocaleDateString(
        language === 'mr' ? 'mr-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: 'numeric' },
      );
    }
    return appointmentDateProp || t('rxDate');
  }, [data?.data?.signedAt, rxFromList?.signedAt, appointmentDateProp, language, t]);

  const doctorName = doctorNameProp || rxFromList?.doctorName || '';
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
  const patientName = patientNameProp || rxFromList?.patientName || '';
  const remoteStatus = data?.data?.status || rxFromList?.status || '';
  const signed =
    erxSnapshotId != null &&
    Number(erxSnapshotId) > 0 &&
    (Boolean(data?.data?.signedAt) ||
      Boolean(rxFromList?.signedAt) ||
      /signed|locked/i.test(remoteStatus) ||
      true);
  const status = signed ? 'SIGNED' : 'UNSIGNED';
  const itemCount =
    rxFromList?.itemCount ??
    (Array.isArray(data?.data?.items) ? data.data.items.length : 0);

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
    itemCount,
    pdfAvailable: Boolean(erxSnapshotId != null && Number(erxSnapshotId) > 0),
    loading: resolvedAptId != null && (isLoading || isFetching),
    isError: resolvedAptId != null && isError,
    isEmpty:
      resolvedAptId != null &&
      !isLoading &&
      !isFetching &&
      !isError &&
      medicines.length === 0 &&
      !hasPrescriptionData,
    toastMessage,
    toastVariant,
    onDismissToast: () => setToastMessage(null),
    onBack,
    onShare: () => {
      void openPdf('share');
    },
    onDownload: () => {
      void openPdf('open');
    },
    canOrder: signed,
    onOrder: () => {
      if (!signed || erxSnapshotId == null) {
        setToastVariant('error');
        setToastMessage(t('rxMustSign'));
        return;
      }
      onOrder?.({
        erxSnapshotId: Number(erxSnapshotId),
        patientAppId:
          patientAppId != null && Number(patientAppId) > 0
            ? Number(patientAppId)
            : data?.data?.patientAppId ?? null,
      });
    },
    refillBusy,
    onRequestRefill: () => {
      if (!signed || erxSnapshotId == null) {
        setToastVariant('error');
        setToastMessage(t('rxMustSign'));
        return;
      }
      void requestRefill({ erxSnapshotId: Number(erxSnapshotId) })
        .unwrap()
        .then((payload) => {
          if (!getApiBodyMessage(payload)) {
            setToastVariant('success');
            setToastMessage(t('rxRefillSent'));
          }
        })
        .catch((err: unknown) => {
          if (!getApiErrorMessage(err)) {
            setToastVariant('error');
            setToastMessage(t('orderDetailRefillMissingRx'));
          }
        });
    },
    onVerify: () => undefined,
    onOpenVersionHistory: () => undefined,
    onRetry: () => {
      void refetch();
    },
  };
}
