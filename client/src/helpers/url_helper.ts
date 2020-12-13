import moment from "moment";

export const formatDateParam = (date: Date) =>
  moment(date).format("YYYY-MM-DD");

export const buildQueryParams = (
  queryParams: Record<string, unknown>
): string => {
  const serializedParams: Record<string, string> = Object.keys(
    queryParams
  ).reduce((obj, key) => {
    const value = queryParams[key];
    const serializedValue = moment.isDate(value)
      ? formatDateParam(value)
      : value;
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
