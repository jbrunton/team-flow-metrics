import {
  formatDateRange,
  formatDate,
  formatTime,
  getCalendarMonthRanges,
  getDefaultDateRange,
  getRelativeDateRanges
} from "@/helpers/date_helper";
import { DateTime } from "luxon";

describe("getDefaultDateRange", () => {
  it("returns dates spanning the last 30 days by default", () => {
    const now = DateTime.local(2020, 2, 10);
    const dates = getDefaultDateRange({}, now);
    expect(dates).toEqual([
      DateTime.local(2020, 1, 11),
      DateTime.local(2020, 2, 11)
    ]);
  });

  it("returns dates given by query params if defined", () => {
    const now = DateTime.local(2020, 1, 10);
    const dates = getDefaultDateRange(
      { fromDate: "2020-02-01", toDate: "2020-02-07" },
      now
    );
    expect(dates).toEqual([
      DateTime.local(2020, 2, 1),
      DateTime.local(2020, 2, 7)
    ]);
  });
});

describe("getRelativeDateRanges", () => {
  it("returns a list of relative date ranges", () => {
    const now = DateTime.local(2020, 6, 10);
    const ranges = getRelativeDateRanges(now);
    expect(ranges).toEqual([
      {
        fromDate: DateTime.local(2020, 6, 3),
        toDate: DateTime.local(2020, 6, 11),
        description: "Last 7 days"
      },
      {
        fromDate: DateTime.local(2020, 5, 11),
        toDate: DateTime.local(2020, 6, 11),
        description: "Last 30 days"
      },
      {
        fromDate: DateTime.local(2020, 3, 12),
        toDate: DateTime.local(2020, 6, 11),
        description: "Last 90 days"
      },
      {
        fromDate: DateTime.local(2019, 12, 13),
        toDate: DateTime.local(2020, 6, 11),
        description: "Last 180 days"
      },
      {
        fromDate: DateTime.local(2019, 6, 10),
        toDate: DateTime.local(2020, 6, 11),
        description: "Last 1 year"
      },
      {
        fromDate: DateTime.local(2018, 6, 10),
        toDate: DateTime.local(2020, 6, 11),
        description: "Last 2 years"
      }
    ]);
  });
});

describe("getCalendarMonthRanges", () => {
  it("returns a list of calendar month ranges", () => {
    const now = DateTime.local(2020, 6, 10, 10, 30);
    const ranges = getCalendarMonthRanges(now);
    expect(ranges).toEqual([
      {
        fromDate: DateTime.local(2020, 6, 1),
        toDate: DateTime.local(2020, 7, 1),
        description: "This month"
      },
      {
        fromDate: DateTime.local(2020, 5, 1),
        toDate: DateTime.local(2020, 6, 1),
        description: "May"
      },
      {
        fromDate: DateTime.local(2020, 4, 1),
        toDate: DateTime.local(2020, 5, 1),
        description: "April"
      },
      {
        fromDate: DateTime.local(2020, 3, 1),
        toDate: DateTime.local(2020, 4, 1),
        description: "March"
      },
      {
        fromDate: DateTime.local(2020, 2, 1),
        toDate: DateTime.local(2020, 3, 1),
        description: "February"
      },
      {
        fromDate: DateTime.local(2020, 1, 1),
        toDate: DateTime.local(2020, 2, 1),
        description: "January"
      }
    ]);
  });
});

describe("formatDate", () => {
  it("formats the given date", () => {
    const date = DateTime.local(2020, 1, 1);
    expect(formatDate(date)).toEqual("1 Jan 2020");
  });
});

describe("formatTime", () => {
  it("formats the given time", () => {
    const date = DateTime.local(2020, 1, 1, 10, 30);
    expect(formatTime(date)).toEqual("1 Jan 2020 10:30");
  });
});

describe("formatDateRange", () => {
  it("formats the given range", () => {
    const fromDate = DateTime.local(2020, 1, 1);
    const toDate = DateTime.local(2020, 2, 10);
    expect(formatDateRange([fromDate, toDate])).toEqual(
      "1 Jan 2020 - 10 Feb 2020"
    );
  });
});
