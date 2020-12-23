import { DateTime } from "luxon";
import {
  nextIntervalDate,
  dateRange,
  StepInterval,
  compareDates,
  compareDateTimes,
} from "../../../helpers/date_helper";

describe("nextIntervalDate", () => {
  it("returns the next day when the interval is Daily", () => {
    const nextDate = nextIntervalDate(new Date(2020, 1, 1), StepInterval.Daily);
    expect(nextDate).toEqual(new Date(2020, 1, 2));
  });

  it("returns the next week when the interval is Weekly", () => {
    const nextDate = nextIntervalDate(
      new Date(2020, 1, 1),
      StepInterval.Weekly
    );
    expect(nextDate).toEqual(new Date(2020, 1, 8));
  });

  it("returns two weeks later when the interval is BiWeekly", () => {
    const nextDate = nextIntervalDate(
      new Date(2020, 1, 1),
      StepInterval.BiWeekly
    );
    expect(nextDate).toEqual(new Date(2020, 1, 15));
  });

  it("returns the next month when the interval is Monthly", () => {
    const nextDate = nextIntervalDate(
      new Date(2020, 1, 1),
      StepInterval.Monthly
    );
    expect(nextDate).toEqual(new Date(2020, 2, 1));
  });
});

describe("dateRange", () => {
  it("returns an empty array if the start date is after the end date", () => {
    const dates = dateRange(
      new Date(2020, 2, 1),
      new Date(2020, 1, 1),
      StepInterval.Weekly
    );
    expect(dates).toEqual([]);
  });

  it("returns the start date if the end date is within the interval", () => {
    const dates = dateRange(
      new Date(2020, 1, 1),
      new Date(2020, 1, 2),
      StepInterval.Weekly
    );
    expect(dates).toEqual([new Date(2020, 1, 1)]);
  });

  it("returns a equence of dates separated by the step interval", () => {
    const dates = dateRange(
      new Date(2020, 1, 1),
      new Date(2020, 2, 1),
      StepInterval.Weekly
    );
    expect(dates).toEqual([
      new Date(2020, 1, 1),
      new Date(2020, 1, 8),
      new Date(2020, 1, 15),
      new Date(2020, 1, 22),
      new Date(2020, 1, 29),
    ]);
  });
});

describe("#compareDates", () => {
  it("can be used to sort dates", () => {
    const dates = [
      new Date(2020, 2, 1),
      new Date(2020, 3, 1),
      new Date(2020, 1, 1),
    ];
    const sortedDates = dates.sort(compareDates);
    expect(sortedDates).toEqual([
      new Date(2020, 1, 1),
      new Date(2020, 2, 1),
      new Date(2020, 3, 1),
    ]);
  });
});

describe("#compareDateTimes", () => {
  it("can be used to sort dates", () => {
    const dates = [
      DateTime.local(2020, 2, 1),
      DateTime.local(2020, 3, 1),
      DateTime.local(2020, 1, 1),
    ];
    const sortedDates = dates.sort(compareDateTimes);
    expect(sortedDates).toEqual([
      DateTime.local(2020, 1, 1),
      DateTime.local(2020, 2, 1),
      DateTime.local(2020, 3, 1),
    ]);
  });
});
