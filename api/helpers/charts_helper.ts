export function formatDate(date: Date): string {
  return `Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}, ${date.getMinutes()})`;
}
