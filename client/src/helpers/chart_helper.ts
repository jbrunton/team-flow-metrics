import { DateTime } from "luxon";
import { Route } from "vue-router";
import { getDefaultDateRange } from "./date_helper";

export type ChartParams = {
  dates: [DateTime, DateTime];
  selectedLevel: string;
};

export const getDefaultChartParams = (
  query: Route["query"],
  now?: DateTime
): ChartParams => {
  return {
    dates: getDefaultDateRange(query, now),
    selectedLevel: (query.hierarchyLevel as string) || "Story"
  };
};
