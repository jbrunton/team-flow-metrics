import { DateTime } from "luxon";

export function formatDate(date: DateTime): string {
  return `Date(${date.year}, ${date.month - 1}, ${date.day}, ${date.hour}, ${
    date.minute
  })`;
}
