const moment = require("moment");

export enum StepInterval {
  Daily = "Daily",
  Weekly = "Weekly",
  BiWeekly = "Bi-Weekly",
  Monthly = "Monthly",
};

export const nextIntervalDate = (date: Date, interval: StepInterval): Date => {
  switch(interval) {
    case StepInterval.Daily: return moment(date).add(1, "day").toDate();
    case StepInterval.Weekly: return moment(date).add(1, "week").toDate();
    case StepInterval.BiWeekly: return moment(date).add(2, "weeks").toDate();
    case StepInterval.Monthly: return moment(date).add(1, "month").toDate();
    default: throw new Error(`Unexpected interval: ${interval}`);
  }
};

export const dateRange = (startDate: Date, endDate: Date, interval: StepInterval): Date[] => {
  if (moment(startDate).isAfter(endDate)) {
    return [];
  }
  const nextDate = nextIntervalDate(startDate, interval);
  return [startDate].concat(dateRange(nextDate, endDate, interval));
};
