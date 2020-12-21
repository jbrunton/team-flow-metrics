import {
  formatDateRange,
  getCalendarMonthRanges,
  getDefaultDateRange,
  getRelativeDateRanges
} from "@/helpers/date_helper";

describe("getDefaultDateRange", () => {
  it("returns dates spanning the last 30 days by default", () => {
    const now = new Date(2020, 1, 10);
    const dates = getDefaultDateRange({}, now);
    expect(dates).toEqual([new Date(2020, 0, 11), new Date(2020, 1, 11)]);
  });

  it("returns dates given by query params if defined", () => {
    const now = new Date(2020, 1, 10);
    const dates = getDefaultDateRange(
      { fromDate: "2020-02-01", toDate: "2020-02-07" },
      now
    );
    expect(dates).toEqual([new Date(2020, 1, 1), new Date(2020, 1, 7)]);
  });
});

describe("getRelativeDateRanges", () => {
  it("returns a list of relative date ranges", () => {
    const now = new Date(2020, 6, 10);
    const ranges = getRelativeDateRanges(now);
    expect(ranges).toEqual([
      {
        fromDate: new Date(2020, 6, 3),
        toDate: new Date(2020, 6, 11),
        description: "Last 7 days"
      },
      {
        fromDate: new Date(2020, 5, 10),
        toDate: new Date(2020, 6, 11),
        description: "Last 30 days"
      },
      {
        fromDate: new Date(2020, 3, 11),
        toDate: new Date(2020, 6, 11),
        description: "Last 90 days"
      },
      {
        fromDate: new Date(2020, 0, 12),
        toDate: new Date(2020, 6, 11),
        description: "Last 180 days"
      },
      {
        fromDate: new Date(2019, 6, 11),
        toDate: new Date(2020, 6, 11),
        description: "Last 1 year"
      },
      {
        fromDate: new Date(2018, 6, 11),
        toDate: new Date(2020, 6, 11),
        description: "Last 2 years"
      }
    ]);
  });
});

describe("getCalendarMonthRanges", () => {
  it("returns a list of calendar month ranges", () => {
    const now = new Date(2020, 6, 10);
    const ranges = getCalendarMonthRanges(now);
    expect(ranges).toEqual([
      {
        fromDate: new Date(2020, 6, 1),
        toDate: new Date(2020, 6, 32),
        description: "This month"
      },
      {
        fromDate: new Date(2020, 5, 1),
        toDate: new Date(2020, 5, 31),
        description: "June"
      },
      {
        fromDate: new Date(2020, 4, 1),
        toDate: new Date(2020, 4, 32),
        description: "May"
      },
      {
        fromDate: new Date(2020, 3, 1),
        toDate: new Date(2020, 3, 31),
        description: "April"
      },
      {
        fromDate: new Date(2020, 2, 1),
        toDate: new Date(2020, 2, 32),
        description: "March"
      },
      {
        fromDate: new Date(2020, 1, 1),
        toDate: new Date(2020, 2, 1),
        description: "February"
      }
    ]);
  });
});

describe("formatDateRange", () => {
  it("formats the given range", () => {
    const fromDate = new Date(2020, 0, 1);
    const toDate = new Date(2020, 1, 10);
    expect(formatDateRange([fromDate, toDate])).toEqual(
      "1 Jan 2020 - 10 Feb 2020"
    );
  });
});
