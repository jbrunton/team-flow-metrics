import {
  formatDateRange,
  getDefaultDateRange
} from "../../../src/helpers/date_helper";

describe("getDefaultDateRange", () => {
  it("returns dates spanning the last 30 days", () => {
    const now = new Date(2020, 1, 10);
    const dates = getDefaultDateRange(now);
    expect(dates).toEqual([new Date(2020, 0, 11), new Date(2020, 1, 11)]);
  });
});

describe("formatDateRange", () => {
  it("formats the given range", () => {
    const fromDate = new Date(2020, 0, 1);
    const toDate = new Date(2020, 1, 10);
    expect(formatDateRange("en-GB", [fromDate, toDate])).toEqual(
      "Jan 1, 2020 - Feb 10, 2020"
    );
  });
});
