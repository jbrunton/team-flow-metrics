import { DateTime } from "luxon";

export type DateRange = {
  fromDate: DateTime;
  toDate: DateTime;
  description: string;
};

export function getDefaultDateRange(
  now = DateTime.local()
): [DateTime, DateTime] {
  const today = now.startOf("day");
  const toDate = today.plus({ days: 1 });
  const fromDate = now.minus({ days: 30 });
  return [fromDate, toDate];
}

export function getRelativeDayRange(
  days: number,
  today: DateTime = DateTime.local().startOf("day")
): DateRange {
  const toDate = today.plus({ days: 1 });
  return {
    fromDate: today.minus({ days: days }),
    toDate: toDate,
    description: `Last ${days} days`
  };
}

export function getRelativeDayRanges(now = DateTime.local()): Array<DateRange> {
  const today = now.startOf("day");
  const toDate = today.plus({ days: 1 });
  return [
    getRelativeDayRange(7, today),
    getRelativeDayRange(30, today),
    getRelativeDayRange(90, today),
    getRelativeDayRange(180, today),
    {
      fromDate: now.minus({ years: 1 }),
      toDate: toDate,
      description: "Last 1 year"
    },
    {
      fromDate: now.minus({ years: 2 }),
      toDate: toDate,
      description: "Last 2 years"
    }
  ];
}

export function getRelativeWeekRanges(
  now = DateTime.local()
): Array<DateRange> {
  const startOfWeek = now.startOf("week");
  return [
    {
      fromDate: startOfWeek,
      toDate: startOfWeek.plus({ weeks: 1 }),
      description: "This week"
    },
    {
      fromDate: startOfWeek.minus({ weeks: 1 }),
      toDate: startOfWeek,
      description: "Last week"
    },
    {
      fromDate: startOfWeek.minus({ weeks: 4 }),
      toDate: startOfWeek,
      description: "Last 4 weeks"
    },
    {
      fromDate: startOfWeek.minus({ weeks: 8 }),
      toDate: startOfWeek,
      description: "Last 8 weeks"
    },
    {
      fromDate: startOfWeek.minus({ weeks: 26 }),
      toDate: startOfWeek,
      description: "Last 26 weeks"
    },
    {
      fromDate: startOfWeek.minus({ weeks: 52 }),
      toDate: startOfWeek,
      description: "Last 52 weeks"
    }
  ];
}

export function getRelativeMonthRange(
  months: number,
  startOfMonth: DateTime = DateTime.local().startOf("month")
): DateRange {
  const description = months === 1 ? "Last month" : `Last ${months} months`;
  return {
    fromDate: startOfMonth.minus({ months }),
    toDate: startOfMonth,
    description
  };
}

export function getRelativeMonthRanges(
  now = DateTime.local()
): Array<DateRange> {
  const startOfMonth = now.startOf("month");
  return [
    {
      fromDate: startOfMonth,
      toDate: startOfMonth.plus({ months: 1 }),
      description: "This month"
    },
    getRelativeMonthRange(1, startOfMonth),
    getRelativeMonthRange(3, startOfMonth),
    getRelativeMonthRange(6, startOfMonth),
    getRelativeMonthRange(12, startOfMonth),
    getRelativeMonthRange(24, startOfMonth)
  ];
}

export function getRelativeYearRanges(
  now = DateTime.local()
): Array<DateRange> {
  const today = now.startOf("day");
  const toDate = today.plus({ days: 1 });
  return [
    {
      fromDate: now.minus({ years: 1 }),
      toDate: toDate,
      description: "Last 1 year"
    },
    {
      fromDate: now.minus({ years: 2 }),
      toDate: toDate,
      description: "Last 2 years"
    }
  ];
}

export function formatDate(date?: Date | DateTime): string {
  if (!date) {
    return "-";
  }
  if (date instanceof Date) {
    return formatDate(DateTime.fromJSDate(date));
  }
  return date.toFormat("d MMM yyyy");
}

export function formatTime(time?: Date | DateTime): string {
  if (!time) {
    return "-";
  }
  if (time instanceof Date) {
    return formatDate(DateTime.fromJSDate(time));
  }
  return time.toFormat("d MMM yyyy hh:mm");
}

export function formatDateRange(dates: Array<DateTime>): string {
  return dates.map(date => formatDate(date)).join(" - ");
}

export function timeBetween(d1: DateTime, d2: DateTime): number {
  const diff = d2.diff(d2, "hours");
  return diff.hours / 24;
}

export function parseDate(input?: string): DateTime | null {
  return input ? DateTime.fromISO(input) : null;
}
