import moment from "moment";

export function getDefaultDateRange(now = new Date()): Array<Date> {
  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  const fromDate = moment(now)
    .subtract(30, "days")
    .toDate();
  return [fromDate, toDate];
}
