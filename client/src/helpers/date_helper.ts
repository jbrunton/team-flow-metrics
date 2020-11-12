import moment, { Moment } from "moment";

export function getDefaultDateRange(now = new Date()): Array<Date> {
  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  const fromDate = moment(now)
    .subtract(30, "days")
    .toDate();
  return [fromDate, toDate];
}

export function formatDate(date?: Moment, now: Moment = moment()): string {
  if (!date) {
    return "-";
  }
  if (date.year() === now.year()) {
    return moment(date).format("D MMM");
  }
  return date.format("D MMM YYYY");
}

export function formatTime(time?: Moment, now: Moment = moment()): string {
  if (!time) {
    return "-";
  }
  if (time.year() === now.year()) {
    return time.format("D MMM hh:mm Z");
  }
  return time.format("DD MMM YYYY hh:mm Z");
}

export function formatDateString(
  date?: string,
  now: Moment = moment()
): string {
  return formatDate(date ? moment(date) : undefined, now);
}

export function formatTimeString(
  time?: string,
  now: Moment = moment()
): string {
  return formatTime(time ? moment(time) : undefined, now);
}

export function formatDateRange(dates: Array<Date>): string {
  return dates.map(date => formatDate(moment(date))).join(" - ");
}
