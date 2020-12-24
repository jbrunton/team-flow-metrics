import { DateTime } from "luxon";
import { Route } from "vue-router";

export type DateRange = {
  fromDate: DateTime;
  toDate: DateTime;
  description: string;
};

export function getDefaultDateRange(
  query: Route["query"],
  now = DateTime.local()
): [DateTime, DateTime] {
  if (query.fromDate && query.toDate) {
    const fromDate = DateTime.fromISO(query.fromDate as string);
    const toDate = DateTime.fromISO(query.toDate as string);
    return [fromDate, toDate];
  }

  const today = now.startOf("day");
  const toDate = today.plus({ days: 1 });
  const fromDate = now.minus({ days: 30 });
  return [fromDate, toDate];
}

export function getRelativeDateRanges(
  now = DateTime.local()
): Array<DateRange> {
  const today = now.startOf("day");
  const toDate = today.plus({ days: 1 });
  return [
    {
      fromDate: now.minus({ days: 7 }),
      toDate: toDate,
      description: "Last 7 days"
    },
    {
      fromDate: now.minus({ days: 30 }),
      toDate: toDate,
      description: "Last 30 days"
    },
    {
      fromDate: now.minus({ days: 90 }),
      toDate: toDate,
      description: "Last 90 days"
    },
    {
      fromDate: now.minus({ days: 180 }),
      toDate: toDate,
      description: "Last 180 days"
    },
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

export function getCalendarMonthRanges(
  now = DateTime.local()
): Array<DateRange> {
  const thisMonth = now.startOf("month");
  let fromDate = thisMonth;
  const ranges = [
    {
      fromDate: thisMonth,
      toDate: thisMonth.plus({ months: 1 }),
      description: "This month"
    }
  ];

  for (let i = 0; i < 5; ++i) {
    fromDate = fromDate.minus({ months: 1 });
    ranges.push({
      fromDate: fromDate,
      toDate: fromDate.plus({ months: 1 }),
      description: fromDate.toFormat("MMMM")
    });
  }

  return ranges;
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
