import { Route } from "vue-router";
import { getDefaultDateRange } from "./date_helper";

export type ChartParams = {
  dates: [Date, Date];
  selectedLevel: string;
};

export const getDefaultChartParams = (
  query: Route["query"],
  now?: Date
): ChartParams => {
  return {
    dates: getDefaultDateRange(query, now),
    selectedLevel: (query.hierarchyLevel as string) || "Story"
  };
};
