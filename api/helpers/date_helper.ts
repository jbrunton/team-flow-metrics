import { DateTime } from "luxon";
import { ValueTransformer } from "typeorm";

export enum StepInterval {
  Daily = "Daily",
  Weekly = "Weekly",
  BiWeekly = "Bi-Weekly",
  Monthly = "Monthly",
}

export const nextIntervalDate = (
  date: DateTime,
  interval: StepInterval
): DateTime => {
  switch (interval) {
    case StepInterval.Daily:
      return date.plus({ days: 1 });
    case StepInterval.Weekly:
      return date.plus({ weeks: 1 });
    case StepInterval.BiWeekly:
      return date.plus({ weeks: 2 });
    case StepInterval.Monthly:
      return date.plus({ months: 1 });
    default:
      throw new Error(`Unexpected interval: ${interval}`);
  }
};

export const dateRange = (
  startDate: DateTime,
  endDate: DateTime,
  interval: StepInterval
): DateTime[] => {
  if (startDate > endDate) {
    return [];
  }
  const nextDate = nextIntervalDate(startDate, interval);
  return [startDate].concat(dateRange(nextDate, endDate, interval));
};

export const compareDateTimes = (d1: DateTime, d2: DateTime): number => {
  return d1.toMillis() - d2.toMillis();
};

export const DateTimeTransformer: ValueTransformer = {
  from(value: Date | null): DateTime | null {
    return value ? DateTime.fromJSDate(value) : null;
  },

  to(value: DateTime | null): Date | null {
    if (value instanceof DateTime) {
      return value.toJSDate();
    } else {
      // Could be null, could be a find operator. See:
      // https://github.com/typeorm/typeorm/issues/2390
      return value;
    }
  },
};

export const getCycleTime = (
  startDate?: DateTime,
  endDate?: DateTime
): number | null => {
  return startDate && endDate
    ? endDate.diff(startDate, "hours").hours / 24
    : null;
};
