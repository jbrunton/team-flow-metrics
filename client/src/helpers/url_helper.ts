import { DateTime } from "luxon";

export const formatDateParam = (date: DateTime) => date.toFormat("yyyy-MM-dd");

export const buildQueryParams = (
  queryParams: Record<string, unknown>
): string => {
  const serializedParams: Record<string, string> = Object.keys(
    queryParams
  ).reduce((obj, key) => {
    const value = queryParams[key];
    const serializedValue =
      value instanceof DateTime ? formatDateParam(value) : value;
    return { ...obj, [key]: serializedValue };
  }, {});
  return new URLSearchParams(serializedParams).toString();
};

export const buildUrl = (
  base: string,
  queryParams: Record<string, unknown>
): string => {
  return `${base}?${buildQueryParams(queryParams)}`;
};
