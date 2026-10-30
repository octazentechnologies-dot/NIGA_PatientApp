import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { newBaseApi } from './newBaseApi';
import type {
  DashboardMedicineOrder,
  DashboardPayment,
  DashboardVisit,
  PatientDashboardData,
} from '../../../utilities/patientDashboard';

/**
 * Same sources as the web patient dashboard:
 * GET /api/Patient/Visits, GET /api/Patient/Payments,
 * GET /api/Erx/History, GET /api/Patient/MedicineOrders.
 * Rows are reduced to counts and dates. Names are not kept.
 */
export const patientDashboardApi = newBaseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getPatientDashboard: build.query<PatientDashboardData, void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const range = visitRange();
        const [visits, payments, prescriptions, medicines] = await Promise.all([
          loadVisits(baseQuery, range.from, range.to),
          loadList(baseQuery, 'api/Patient/Payments', normalizePayment),
          loadPrescriptionCount(baseQuery),
          loadList(baseQuery, 'api/Patient/MedicineOrders', normalizeMedicine),
        ]);

        const data: PatientDashboardData = {
          visits: visits.rows,
          payments: payments.rows,
          prescriptionCount: prescriptions.count,
          medicineOrders: medicines.rows,
          visitsFailed: visits.failed,
          paymentsFailed: payments.failed,
          prescriptionsFailed: prescriptions.failed,
          medicineOrdersFailed: medicines.failed,
        };
        return { data };
      },
      providesTags: ['Visits', 'Payments', 'Prescriptions', 'Orders'],
    }),
  }),
});

export const { useGetPatientDashboardQuery } = patientDashboardApi;

type QueryResult = { data?: unknown; error?: FetchBaseQueryError };

type BaseQuery = (
  arg: string | { url: string; params?: Record<string, string | number> },
) => PromiseLike<QueryResult> | QueryResult;

async function loadVisits(
  baseQuery: BaseQuery,
  from: string,
  to: string,
): Promise<{ rows: DashboardVisit[]; failed: boolean }> {
  const pageSize = 100;
  const first = await baseQuery({
    url: 'api/Patient/Visits',
    params: { fromDate: from, toDate: to, pageNumber: 1, pageSize },
  });
  if (first.error || first.data == null) return { rows: [], failed: true };

  const rows = unwrapList(first.data).flatMap(normalizeVisit);
  const total = readTotal(first.data, rows.length);
  const pages = Math.min(Math.ceil(total / pageSize), 10);
  for (let page = 2; page <= pages; page += 1) {
    const next = await baseQuery({
      url: 'api/Patient/Visits',
      params: { fromDate: from, toDate: to, pageNumber: page, pageSize },
    });
    if (next.error || next.data == null) break;
    rows.push(...unwrapList(next.data).flatMap(normalizeVisit));
  }
  return { rows, failed: false };
}

async function loadList<T>(
  baseQuery: BaseQuery,
  url: string,
  mapRow: (row: Record<string, unknown>) => T | null,
): Promise<{ rows: T[]; failed: boolean }> {
  const result = await baseQuery(url);
  if (result.error || result.data == null) return { rows: [], failed: true };
  const rows = unwrapList(result.data).flatMap((row) => {
    const mapped = mapRow(row);
    return mapped ? [mapped] : [];
  });
  return { rows, failed: false };
}

async function loadPrescriptionCount(
  baseQuery: BaseQuery,
): Promise<{ count: number; failed: boolean }> {
  const history = await baseQuery({
    url: 'api/Erx/History',
    params: { pageSize: 100 },
  });
  if (!history.error && history.data != null) {
    return { count: unwrapList(history.data).length, failed: false };
  }
  const legacy = await baseQuery('api/Erx/Prescriptions');
  if (!legacy.error && legacy.data != null) {
    return { count: unwrapList(legacy.data).length, failed: false };
  }
  return { count: 0, failed: true };
}

function unwrapList(payload: unknown): Record<string, unknown>[] {
  const data = unwrapEnvelope(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.items)
      ? data.items
      : isRecord(data) && Array.isArray(data.Items)
        ? data.Items
        : isRecord(data) && Array.isArray(data.data)
          ? data.data
          : isRecord(data) && Array.isArray(data.orders)
            ? data.orders
            : isRecord(data) && Array.isArray(data.rows)
              ? data.rows
              : [];
  return list.filter(isRecord);
}

function unwrapEnvelope(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  if ('data' in payload && payload.data != null) return payload.data;
  return payload;
}

function readTotal(payload: unknown, fallback: number): number {
  if (!isRecord(payload)) return fallback;
  const direct = payload.totalRecords ?? payload.TotalRecords;
  if (typeof direct === 'number' && direct >= 0) return direct;
  const data = payload.data;
  if (isRecord(data)) {
    const nested = data.totalRecords ?? data.TotalRecords;
    if (typeof nested === 'number' && nested >= 0) return nested;
  }
  return fallback;
}

function normalizeVisit(row: Record<string, unknown>): DashboardVisit[] {
  const appointmentDate = pickString(row, 'appointmentDate', 'AppointmentDate');
  if (!appointmentDate) return [];
  return [
    {
      appointmentDate,
      status: pickString(row, 'status', 'Status'),
      consultMode: pickString(row, 'consultMode', 'ConsultMode'),
      isTele: pickBool(row, 'isTele', 'IsTele'),
    },
  ];
}

function normalizePayment(row: Record<string, unknown>): DashboardPayment | null {
  const createdAt = pickString(
    row,
    'createdAt',
    'CreatedAt',
    'at',
    'At',
    'paymentDate',
    'PaymentDate',
  );
  if (!createdAt) return null;
  const amount = pickNumber(row, 'amount', 'Amount', 'consultFee', 'ConsultFee');
  return {
    createdAt,
    status: pickString(row, 'status', 'Status', 'paymentStatus', 'PaymentStatus'),
    amount,
  };
}

function normalizeMedicine(row: Record<string, unknown>): DashboardMedicineOrder | null {
  return { status: pickString(row, 'status', 'Status') };
}

function pickString(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function pickNumber(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function pickBool(row: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'boolean') return value;
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function visitRange(now = new Date()): { from: string; to: string } {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 180);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90);
  return { from: formatDay(from), to: formatDay(to) };
}

function formatDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
