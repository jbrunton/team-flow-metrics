export function formatNumber(number: number): string {
  if (!number) {
    return "-";
  }
  return number.toFixed(2);
}
