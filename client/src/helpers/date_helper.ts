import moment from "moment";

export function getDefaultDateRange(now = new Date()): Array<Date> {
  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  const fromDate = moment(now)
    .subtract(30, "days")
    .toDate();
  return [fromDate, toDate];
}

export function formatDateRange(locale: string, dates: Array<Date>): string {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return dates.map(date => formatter.format(date)).join(" - ");
}
