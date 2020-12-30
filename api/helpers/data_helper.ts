import { jStat } from "jstat";

/**
 * Removes outliers from a list of items based on the Tukey Fence method.
 * @param data the list of items to consider
 * @param valueOf a function which returns the value for the given item
 */
export function excludeOutliers<T>(data: T[], valueOf: (T) => number): T[] {
  const values = data.map((x) => valueOf(x));

  const [q25, , q75] = jStat.quartiles(values) as [number, number, number];
  const iqr = q75 - q25;
  const cutoff = iqr * 1.5;

  return data.filter((x) => {
    const value = valueOf(x);
    return q25 - cutoff <= value && value <= q75 + cutoff;
  });
}
