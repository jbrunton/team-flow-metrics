import { DateTime } from "luxon";
import {
  formatDateParam,
  buildQueryParams,
  buildUrl
} from "@/helpers/url_helper";

describe("formatDateParam", () => {
  it("formats the given date", () => {
    expect(formatDateParam(DateTime.local(2020, 2, 1))).toEqual("2020-02-01");
  });
});

describe("buildQueryParams", () => {
  it("formats the given object into query params", () => {
    expect(buildQueryParams({ foo: "bar" })).toEqual("foo=bar");
  });

  it("serializes dates", () => {
    expect(buildQueryParams({ date: DateTime.local(2020, 2, 1) })).toEqual(
      "date=2020-02-01"
    );
  });
});

describe("buildUrl", () => {
  it("returns the URL with query params", () => {
    expect(
      buildUrl("example.com", { date: DateTime.local(2020, 2, 1) })
    ).toEqual("example.com?date=2020-02-01");
  });
});
