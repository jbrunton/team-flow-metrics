import { DateTime } from "luxon";
import { Route } from "vue-router";
import { getDefaultDateRange } from "./date_helper";
import Cookies from "js-cookie";

export type ChartParams = {
  dates: [DateTime, DateTime];
  selectedLevel: string;
  selectedResolutions: string[];
};

export const getChartDateRange = (
  query: Route["query"],
  now?: DateTime
): [DateTime, DateTime] => {
  if (query.fromDate && query.toDate) {
    const fromDate = DateTime.fromISO(query.fromDate as string);
    const toDate = DateTime.fromISO(query.toDate as string);
    return [fromDate, toDate];
  }

  const cookieFromDate = Cookies.get("fromDate");
  const cookieToDate = Cookies.get("toDate");
  if (cookieFromDate && cookieToDate) {
    const fromDate = DateTime.fromISO(cookieFromDate);
    const toDate = DateTime.fromISO(cookieToDate);
    return [fromDate, toDate];
  }

  return getDefaultDateRange(now);
};

export const getChartHierarchyLevel = (query: Route["query"]): string => {
  if (query.hierarchyLevel) {
    return query.hierarchyLevel as string;
  }

  const cookieHierarchyLevel = Cookies.get("hierarchyLevel");
  if (cookieHierarchyLevel) {
    return cookieHierarchyLevel;
  }

  return "Story";
};

export const getDefaultChartParams = (
  query: Route["query"],
  now?: DateTime
): ChartParams => {
  return {
    dates: getChartDateRange(query, now),
    selectedLevel: getChartHierarchyLevel(query),
    selectedResolutions: [],
  };
};

export const saveChartParams = (params: ChartParams) => {
  Cookies.set("fromDate", params.dates[0].toISODate());
  Cookies.set("toDate", params.dates[1].toISODate());
  Cookies.set("hierarchyLevel", params.selectedLevel);
};
