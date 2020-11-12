import moment from "moment";

export function getDefaultDateRange(now = new Date()): Array<Date> {
  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  const fromDate = moment(now)
    .subtract(30, "days")
    .toDate();
  return [fromDate, toDate];
}

export function formatDate(date?: Date): string {
  if (!date) {
    return "-";
  }
  return moment(date).format("D MMM YYYY");
}

export function formatTime(time?: Date): string {
  if (!time) {
    return "-";
  }
  return moment(time).format("D MMM YYYY hh:mm");
}

export function formatDateRange(dates: Array<Date>): string {
  return dates.map(date => formatDate(date)).join(" - ");
}
