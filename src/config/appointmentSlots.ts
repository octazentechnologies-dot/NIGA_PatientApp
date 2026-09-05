import type { TranslationKey } from '../localization/types';

export type ConsultMode = 'video' | 'audio' | 'clinic';

export type BookingMember = {
  id: string;
  name: string;
  initials: string;
  icon: 'person' | 'child' | 'woman';
  metaKey?: TranslationKey;
  self?: boolean;
};

export type TimeSlot = {
  id: string;
  labelKey: TranslationKey;
  booked?: boolean;
};

export type DayStatus = 'open' | 'full' | 'closed' | 'past';

export type BookingDay = {
  id: string;
  year: number;
  month: number;
  day: number;
  weekdayIndex: number;
  isToday: boolean;
  dayLabel: string;
  status: DayStatus;
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
};

export type BookingMonthOption = {
  year: number;
  month: number;
};

export const BOOKING_MEMBERS: BookingMember[] = [
  { id: 'self', name: 'Pranav Kulkarni', initials: 'PK', icon: 'person', self: true },
  { id: 'aarav', name: 'Aarav Kulkarni', initials: 'AK', icon: 'child', metaKey: 'bookAaravMeta' },
  { id: 'meera', name: 'Meera Kulkarni', initials: 'MK', icon: 'woman', metaKey: 'bookMeeraMeta' },
];

export const WEEKDAY_KEYS: TranslationKey[] = [
  'bookSun',
  'bookMon',
  'bookTue',
  'bookWed',
  'bookThu',
  'bookFri',
  'bookSat',
];

export const MONTH_KEYS: TranslationKey[] = [
  'bookMonthJan',
  'bookMonthFeb',
  'bookMonthMar',
  'bookMonthApr',
  'bookMonthMay',
  'bookMonthJun',
  'bookMonthJul',
  'bookMonthAug',
  'bookMonthSep',
  'bookMonthOct',
  'bookMonthNov',
  'bookMonthDec',
];

const morning: TimeSlot[] = [
  { id: '10:00', labelKey: 'bookSlot1000' },
  { id: '10:30', labelKey: 'bookSlot1030' },
  { id: '11:00', labelKey: 'bookSlot1100' },
  { id: '11:30', labelKey: 'bookSlot1130', booked: true },
];

const afternoon: TimeSlot[] = [
  { id: '14:00', labelKey: 'bookSlot1400' },
  { id: '15:30', labelKey: 'bookSlot1530' },
];

const evening: TimeSlot[] = [
  { id: '17:00', labelKey: 'bookSlot1700' },
  { id: '18:00', labelKey: 'bookSlot1800' },
  { id: '18:30', labelKey: 'bookSlot1830' },
  { id: '19:00', labelKey: 'bookSlot1900', booked: true },
  { id: '19:30', labelKey: 'bookSlot1930' },
];

const fullMorning: TimeSlot[] = [
  { id: '09:00', labelKey: 'bookSlot0900', booked: true },
  { id: '09:30', labelKey: 'bookSlot0930', booked: true },
  { id: '10:00', labelKey: 'bookSlot1000', booked: true },
  { id: '10:30', labelKey: 'bookSlot1030', booked: true },
  { id: '11:00', labelKey: 'bookSlot1100', booked: true },
  { id: '11:30', labelKey: 'bookSlot1130', booked: true },
];

const fullAfternoon: TimeSlot[] = [
  { id: '13:00', labelKey: 'bookSlot1300', booked: true },
  { id: '13:30', labelKey: 'bookSlot1330', booked: true },
  { id: '14:00', labelKey: 'bookSlot1400', booked: true },
  { id: '14:30', labelKey: 'bookSlot1430', booked: true },
];

export const DEFAULT_SLOT_ID = '18:30';
export const DEFAULT_MEMBER_ID = 'aarav';

export const PLATFORM_FEE_RUPEES = 90;
export const TAX_RUPEES = 0;

const CONSULT_FEE_RUPEES: Record<string, Record<ConsultMode, number>> = {
  anjali: { video: 600, audio: 600, clinic: 500 },
  rajesh: { video: 400, audio: 400, clinic: 400 },
  sunita: { video: 800, audio: 800, clinic: 700 },
};

export function consultFeeRupees(doctorId: string, mode: ConsultMode): number {
  return CONSULT_FEE_RUPEES[doctorId]?.[mode] ?? CONSULT_FEE_RUPEES.anjali.video;
}

export function formatRupees(amount: number, language: 'en' | 'mr'): string {
  const digits = String(amount);
  const shown =
    language === 'mr'
      ? digits.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)])
      : digits;
  return `₹${shown}`;
}

export function padDay(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function todayStart(): Date {
  return startOfDay(new Date());
}

export function dateId(year: number, month: number, day: number): string {
  return `${year}-${padDay(month + 1)}-${padDay(day)}`;
}

export function upcomingMonths(count = 12): BookingMonthOption[] {
  const today = todayStart();
  return Array.from({ length: count }, (_, index) => {
    const cursor = new Date(today.getFullYear(), today.getMonth() + index, 1);
    return { year: cursor.getFullYear(), month: cursor.getMonth() };
  });
}

function slotsFor(status: DayStatus): Pick<BookingDay, 'morning' | 'afternoon' | 'evening'> {
  if (status === 'past' || status === 'closed') {
    return { morning: [], afternoon: [], evening: [] };
  }
  if (status === 'full') {
    return { morning: fullMorning, afternoon: fullAfternoon, evening: [] };
  }
  return { morning, afternoon, evening };
}

export function buildDaysForMonth(year: number, month: number): BookingDay[] {
  const today = todayStart();
  const last = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: last }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);
    const start = startOfDay(date);
    const isToday = start.getTime() === today.getTime();
    const isPast = start.getTime() < today.getTime();
    let status: DayStatus = 'open';
    if (isPast) {
      status = 'past';
    } else if (date.getDay() === 6) {
      status = 'closed';
    } else if (day % 9 === 0) {
      status = 'full';
    }
    return {
      id: dateId(year, month, day),
      year,
      month,
      day,
      weekdayIndex: date.getDay(),
      isToday,
      dayLabel: padDay(day),
      status,
      ...slotsFor(status),
    };
  }).filter((day) => day.status !== 'past');
}

export function firstSelectableDay(days: BookingDay[]): BookingDay | undefined {
  return days.find((day) => day.isToday && day.status !== 'past')
    ?? days.find((day) => day.status === 'open' || day.status === 'full');
}

export function countOpenSlots(slots: TimeSlot[]): number {
  return slots.filter((slot) => !slot.booked).length;
}
