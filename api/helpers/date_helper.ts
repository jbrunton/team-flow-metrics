import { DateTime } from "luxon";

export enum StepInterval {
  Daily = "Daily",
  Weekly = "Weekly",
  BiWeekly = "Bi-Weekly",
  Monthly = "Monthly",
};

export const nextIntervalDate = (date: Date, interval: StepInterval): Date => {
  switch(interval) {
    case StepInterval.Daily: return DateTime.fromJSDate(date).plus({ days: 1 }).toJSDate();
    case StepInterval.Weekly: return DateTime.fromJSDate(date).plus({ weeks: 1 }).toJSDate();
    case StepInterval.BiWeekly: return DateTime.fromJSDate(date).plus({ weeks: 2 }).toJSDate();
    case StepInterval.Monthly: return DateTime.fromJSDate(date).plus({ months: 1 }).toJSDate();
    default: throw new Error(`Unexpected interval: ${interval}`);
  }
};

export const dateRange = (startDate: Date, endDate: Date, interval: StepInterval): Date[] => {
  if (DateTime.fromJSDate(startDate) > DateTime.fromJSDate(endDate)) {
    return [];
  }
  const nextDate = nextIntervalDate(startDate, interval);
  return [startDate].concat(dateRange(nextDate, endDate, interval));
};

export const compareDates = (d1: Date, d2: Date): number => {
  return d1.getTime() - d2.getTime();
};

export const compareDateTimes = (d1: DateTime, d2: DateTime): number => {
  return compareDates(d1.toJSDate(), d2.toJSDate());
};
