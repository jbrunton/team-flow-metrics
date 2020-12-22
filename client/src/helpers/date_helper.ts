import { DateTime } from "luxon";
import { Route } from "vue-router";

export type DateRange = {
  fromDate: Date;
  toDate: Date;
  description: string;
};

export function getDefaultDateRange(
  query: Route["query"],
  now = new Date()
): [Date, Date] {
  if (query.fromDate && query.toDate) {
    const fromDate = DateTime.fromISO(query.fromDate as string).toJSDate();
    const toDate = DateTime.fromISO(query.toDate as string).toJSDate();
    return [fromDate, toDate];
  }

  const today = DateTime.fromJSDate(now).startOf("day");
  const toDate = today.plus({ days: 1 }).toJSDate();
  const fromDate = DateTime.fromJSDate(now)
    .minus({ days: 30 })
    .toJSDate();
  return [fromDate, toDate];
}

export function getRelativeDateRanges(now = new Date()): Array<DateRange> {
  const today = DateTime.fromJSDate(now).startOf("day");
  const toDate = today.plus({ days: 1 }).toJSDate();
  return [
    {
      fromDate: DateTime.fromJSDate(now)
        .minus({ days: 7 })
        .toJSDate(),
      toDate: toDate,
      description: "Last 7 days"
    },
    {
      fromDate: DateTime.fromJSDate(now)
        .minus({ days: 30 })
        .toJSDate(),
      toDate: toDate,
      description: "Last 30 days"
    },
    {
      fromDate: DateTime.fromJSDate(now)
        .minus({ days: 90 })
        .toJSDate(),
      toDate: toDate,
      description: "Last 90 days"
    },
    {
      fromDate: DateTime.fromJSDate(now)
        .minus({ days: 180 })
        .toJSDate(),
      toDate: toDate,
      description: "Last 180 days"
    },
    {
      fromDate: DateTime.fromJSDate(now)
        .minus({ years: 1 })
        .toJSDate(),
      toDate: toDate,
      description: "Last 1 year"
    },
    {
      fromDate: DateTime.fromJSDate(now)
        .minus({ years: 2 })
        .toJSDate(),
      toDate: toDate,
      description: "Last 2 years"
    }
  ];
}

export function getCalendarMonthRanges(now = new Date()): Array<DateRange> {
  const thisMonth = DateTime.fromJSDate(now).startOf("month");
  let fromDate = thisMonth;
  const ranges = [
    {
      fromDate: thisMonth.toJSDate(),
      toDate: thisMonth.plus({ months: 1 }).toJSDate(),
      description: "This month"
    }
  ];

  for (let i = 0; i < 5; ++i) {
    fromDate = fromDate.minus({ months: 1 });
    ranges.push({
      fromDate: fromDate.toJSDate(),
      toDate: fromDate.plus({ months: 1 }).toJSDate(),
      description: fromDate.toFormat("MMMM")
    });
  }

  return ranges;
}

export function formatDate(date?: Date): string {
  if (!date) {
    return "-";
  }
  return DateTime.fromJSDate(date).toFormat("d MMM yyyy");
}

export function formatTime(time?: Date): string {
  if (!time) {
    return "-";
  }
  return DateTime.fromJSDate(time).toFormat("d MMM yyyy hh:mm");
}

export function formatDateRange(dates: Array<Date>): string {
  return dates.map(date => formatDate(date)).join(" - ");
}

export function timeBetween(d1: Date, d2: Date): number {
  const dateTime1 = DateTime.fromJSDate(d1);
  const dateTime2 = DateTime.fromJSDate(d2);
  const diff = dateTime2.diff(dateTime1, "hours");
  console.log({ dateTime1, dateTime2, hours: diff.hours });
  return diff.hours / 24;
}
