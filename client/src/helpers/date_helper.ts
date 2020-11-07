import moment from "moment";
import { Route } from "vue-router";

export function getDefaultDateRange(
  route: Route,
  now = new Date()
): Array<Date> {
  if (route.query.fromDate && route.query.toDate) {
    return [
      moment(route.query.fromDate as string).toDate(),
      moment(route.query.toDate as string).toDate()
    ];
  }

  const today = moment(now).startOf("day");
  const toDate = today.add(1, "day").toDate();
  const fromDate = moment(now)
    .subtract(30, "days")
    .toDate();
  return [fromDate, toDate];
}

export function formatDateRange(locale: string, dates: Array<Date>): string {
  return dates.map(date => moment(date).format("D MMM YYYY")).join(" - ");
}
