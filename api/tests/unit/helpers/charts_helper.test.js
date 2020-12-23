const { DateTime } = require("luxon");
const { formatDate } = require("../../../helpers/charts_helper");

describe("#formatDate", () => {
  it("formats dates for Google Charts JSON format", () => {
    expect(formatDate(DateTime.local(2020, 1, 1, 0, 0))).toEqual(
      "Date(2020, 0, 1, 0, 0)"
    );
    expect(formatDate(DateTime.local(2020, 1, 1, 8, 0))).toEqual(
      "Date(2020, 0, 1, 8, 0)"
    );
    expect(formatDate(DateTime.local(2020, 2, 3, 22, 30))).toEqual(
      "Date(2020, 1, 3, 22, 30)"
    );
  });
});
