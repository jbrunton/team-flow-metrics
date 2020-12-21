import moment from "moment";
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
    const fromDate = moment(query.fromDate as string).toDate();
    const toDate = moment(query.toDate as string).toDate();
    return [fromDate, toDate];
  }

  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  const fromDate = moment(now)
    .subtract(30, "days")
    .toDate();
  return [fromDate, toDate];
}

export function getRelativeDateRanges(now = new Date()): Array<DateRange> {
  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  return [
    {
      fromDate: moment(now)
        .subtract(7, "days")
        .toDate(),
      toDate: toDate,
      description: "Last 7 days"
    },
    {
      fromDate: moment(now)
        .subtract(30, "days")
        .toDate(),
      toDate: toDate,
      description: "Last 30 days"
    },
    {
      fromDate: moment(now)
        .subtract(90, "days")
        .toDate(),
      toDate: toDate,
      description: "Last 90 days"
    },
    {
      fromDate: moment(now)
        .subtract(180, "days")
        .toDate(),
      toDate: toDate,
      description: "Last 180 days"
    },
    {
      fromDate: moment(now)
        .subtract(365, "days")
        .toDate(),
      toDate: toDate,
      description: "Last 1 year"
    },
    {
      fromDate: moment(now)
        .subtract(365 * 2, "days")
        .toDate(),
      toDate: toDate,
      description: "Last 2 years"
    }
  ];
}

export function getCalendarMonthRanges(now = new Date()): Array<DateRange> {
  const thisMonth = moment(now).startOf("month");
  const fromDate = thisMonth;
  const ranges = [
    {
      fromDate: thisMonth.toDate(),
      toDate: moment(fromDate)
        .add(1, "month")
        .toDate(),
      description: "This month"
    }
  ];

  for (let i = 0; i < 5; ++i) {
    fromDate.subtract(1, "month");
    ranges.push({
      fromDate: fromDate.toDate(),
      toDate: moment(fromDate)
        .add(1, "month")
        .toDate(),
      description: fromDate.format("MMMM")
    });
  }

  return ranges;
}

export function formatDate(date?: Date): string {
  if (!date) {
    return "-";
  }
  return moment(date).format("D MMM YYYY");
}

export function formatTime(time?: Date): string {
  if (!time) {
    return "-";
  }
  return moment(time).format("D MMM YYYY hh:mm");
}

export function formatDateRange(dates: Array<Date>): string {
  return dates.map(date => formatDate(date)).join(" - ");
}
