/**
 * Same figures as the web patient dashboard
 * (NIGAHomeopathy_UI/src/pages/Patient/Dashboard).
 * Inputs are already stripped of names and other identifiers.
 */

export type DashboardVisit = {
  appointmentDate: string;
  status: string;
  consultMode: string;
  isTele: boolean;
};

export type DashboardPayment = {
  createdAt: string;
  status: string;
  amount: number;
};

export type DashboardMedicineOrder = {
  status: string;
};

export type PatientDashboardData = {
  visits: DashboardVisit[];
  payments: DashboardPayment[];
  prescriptionCount: number;
  medicineOrders: DashboardMedicineOrder[];
  visitsFailed: boolean;
  paymentsFailed: boolean;
  prescriptionsFailed: boolean;
  medicineOrdersFailed: boolean;
};

export type VisitStatusKey =
  | 'waiting'
  | 'walkIn'
  | 'notArrived'
  | 'tele'
  | 'remaining'
  | 'completed'
  | 'cancelled'
  | 'other';

export type DashboardCardId =
  | 'today'
  | 'upcoming'
  | 'payments'
  | 'prescriptions'
  | 'medicines';

export type PatientDashboardModel = {
  cards: { id: DashboardCardId; value: number | null }[];
  visitStatus: { key: VisitStatusKey; count: number }[];
  visitTotal: number;
  visitMonths: { label: string; visits: number; tele: number }[];
  paymentMonths: { label: string; paid: number; pending: number }[];
  visitsFailed: boolean;
  paymentsFailed: boolean;
  prescriptionsFailed: boolean;
  medicineOrdersFailed: boolean;
};

const STATUS_ORDER: VisitStatusKey[] = [
  'waiting',
  'walkIn',
  'notArrived',
  'tele',
  'remaining',
  'completed',
  'cancelled',
  'other',
];

export function buildPatientDashboard(
  data: PatientDashboardData,
  language: 'en' | 'mr',
  now = new Date(),
): PatientDashboardModel {
  const todayKey = dayKey(now);
  const todayCount = data.visitsFailed
    ? null
    : data.visits.filter((row) => dayKeyOf(row.appointmentDate) === todayKey).length;
  const upcomingCount = data.visitsFailed
    ? null
    : data.visits.filter((row) => {
        const day = dayKeyOf(row.appointmentDate);
        return day != null && day >= todayKey;
      }).length;

  const pendingPay = data.paymentsFailed
    ? null
    : data.payments.filter((row) => {
        const status = row.status.trim().toUpperCase();
        return status.length > 0 && !/PAID|CAPTURED|COLLECTED|SUCCESS|REFUNDED/.test(status);
      }).length;

  const openMeds = data.medicineOrders.filter((row) => {
    const status = row.status.trim().toUpperCase();
    return status.length > 0 && !/DELIVER|COMPLETE|CANCEL|REJECT/.test(status);
  }).length;
  const medicineValue = data.medicineOrdersFailed
    ? null
    : openMeds || data.medicineOrders.length;

  const counts = new Map<VisitStatusKey, number>();
  if (!data.visitsFailed) {
    for (const row of data.visits) {
      const key = statusKey(row.status);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const visitStatus = STATUS_ORDER.filter((key) => (counts.get(key) ?? 0) > 0).map(
    (key) => ({ key, count: counts.get(key) ?? 0 }),
  );

  const months = lastSixMonths(now);
  const visitMonths = months.map((month) => ({
    label: monthLabel(month, language, true),
    visits: 0,
    tele: 0,
  }));
  if (!data.visitsFailed) {
    for (const row of data.visits) {
      const day = parseDay(row.appointmentDate);
      if (!day) continue;
      const idx = months.findIndex((month) => sameMonth(day, month));
      if (idx < 0) continue;
      const bucket = visitMonths[idx];
      if (!bucket) continue;
      bucket.visits += 1;
      const mode = row.consultMode.toLowerCase();
      if (row.isTele || mode.includes('tele')) bucket.tele += 1;
    }
  }

  const paymentMonths = months.map((month) => ({
    label: monthLabel(month, language, false),
    paid: 0,
    pending: 0,
  }));
  if (!data.paymentsFailed) {
    for (const row of data.payments) {
      const day = parseDay(row.createdAt);
      if (!day) continue;
      const idx = months.findIndex((month) => sameMonth(day, month));
      if (idx < 0) continue;
      const bucket = paymentMonths[idx];
      if (!bucket) continue;
      const status = row.status.trim().toUpperCase();
      if (/REFUND/.test(status)) continue;
      const amount = Number.isFinite(row.amount) ? row.amount : 0;
      if (/PAID|CAPTURED|COLLECTED|SUCCESS/.test(status)) bucket.paid += amount;
      else bucket.pending += amount;
    }
  }

  return {
    cards: [
      { id: 'today', value: todayCount },
      { id: 'upcoming', value: upcomingCount },
      { id: 'payments', value: pendingPay },
      {
        id: 'prescriptions',
        value: data.prescriptionsFailed ? null : data.prescriptionCount,
      },
      { id: 'medicines', value: medicineValue },
    ],
    visitStatus,
    visitTotal: visitStatus.reduce((sum, row) => sum + row.count, 0),
    visitMonths,
    paymentMonths,
    visitsFailed: data.visitsFailed,
    paymentsFailed: data.paymentsFailed,
    prescriptionsFailed: data.prescriptionsFailed,
    medicineOrdersFailed: data.medicineOrdersFailed,
  };
}

function statusKey(status: string): VisitStatusKey {
  const value = status.trim().toUpperCase().replace(/_/g, ' ').replace(/\s+/g, ' ');
  if (!value) return 'other';
  if (/CANCEL|REJECT|FAIL/.test(value)) return 'cancelled';
  if (/COMPLETE|DONE|CLOSED/.test(value)) return 'completed';
  if (/NOT\s*ARRIV/.test(value)) return 'notArrived';
  if (/WALK/.test(value)) return 'walkIn';
  if (/E-?\s*CONSULT|TELE/.test(value)) return 'tele';
  if (/REMAIN/.test(value)) return 'remaining';
  if (/WAIT|CHECK/.test(value)) return 'waiting';
  return 'other';
}

function lastSixMonths(now: Date): Date[] {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const months: Date[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    months.push(new Date(start.getFullYear(), start.getMonth() - offset, 1));
  }
  return months;
}

function monthLabel(month: Date, language: 'en' | 'mr', withYear: boolean): string {
  const label = month.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
    month: 'short',
    year: withYear ? '2-digit' : undefined,
  });
  // en-IN can emit "Sept"; keep three-letter "Sep" so the bar axis does not wrap.
  return language === 'en' ? label.replace(/\bSept\b/g, 'Sep') : label;
}

function sameMonth(day: Date, month: Date): boolean {
  return day.getFullYear() === month.getFullYear() && day.getMonth() === month.getMonth();
}

function parseDay(raw: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayKeyOf(raw: string): string | null {
  const day = parseDay(raw);
  return day ? dayKey(day) : null;
}
