import { DateTime } from "luxon";
import { ParsedQs } from "qs";
import { Between, getRepository, IsNull, Not } from "typeorm";
import { takeWhile } from "lodash";
import {
  dateRange,
  nextIntervalDate,
  StepInterval,
} from "../helpers/date_helper";
import { Issue } from "../models/entities/issue";
import { ChartParams, ValidationError } from "./chart_params";
import { DataTableBuilder } from "./data_table_builder";
import { formatDate } from "../helpers/charts_helper";
import { chartBuilder } from "./chart_builder";

export type ThroughputParams = ChartParams & {
  stepInterval: StepInterval;
};

export function parseParams(query: ParsedQs): ThroughputParams {
  const errors = [];
  ["fromDate", "toDate", "hierarchyLevel", "stepInterval"].forEach((param) => {
    if (!query[param]) {
      errors.push(`Missing query param: ${param}`);
    }
  });

  if (errors.length) {
    throw new ValidationError(errors);
  }

  return {
    fromDate: DateTime.fromISO(query.fromDate as string),
    toDate: DateTime.fromISO(query.toDate as string),
    hierarchyLevel: query.hierarchyLevel as string,
    stepInterval: StepInterval[query.stepInterval as string],
  };
}

export async function queryData(params: ChartParams): Promise<Issue[]> {
  const completedIssues = await getRepository(Issue).find({
    where: {
      completed: Between(params.fromDate, params.toDate),
      issueType: params.hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
      started: Not(IsNull()),
    },
    order: {
      completed: "ASC",
    },
  });
  return completedIssues;
}

export function buildDataTable(
  issues: Issue[],
  params: ThroughputParams
): DataTableBuilder {
  const dates = dateRange(params.fromDate, params.toDate, params.stepInterval);
  if (dates[dates.length - 1] < params.toDate) {
    dates.push(nextIntervalDate(dates[dates.length - 1], params.stepInterval));
  }

  const { rows } = dates.slice(1).reduce(
    ({ issues, currentDate, rows }, nextDate) => {
      const group = takeWhile(issues, (issue) => issue.completed < nextDate);
      const count = group.length;
      const row = [
        formatDate(currentDate),
        count,
        currentDate.toFormat("yyyy-MM-dd"),
      ];
      return {
        issues: issues.slice(count),
        currentDate: nextDate,
        rows: rows.concat([row]),
      };
    },
    { issues: issues, currentDate: params.fromDate, rows: [] }
  );

  const builder = new DataTableBuilder([
    {
      label: "completed_time",
      type: "date",
    },
    {
      label: "Count",
      type: "number",
    },
    {
      label: "date",
      type: "string",
      role: "annotationText",
    },
  ]);
  builder.addRows(rows);

  return builder;
}

export function buildResponse(
  dataTable: DataTableBuilder,
  data: Issue[]
): unknown {
  return {
    meta: {
      issuesCount: data.length,
    },
    chartOpts: getChartOps(),
    chartData: dataTable.build(),
  };
}

function getChartOps() {
  return {
    seriesType: "scatter",
    chartArea: {
      width: "90%",
      height: "80%",
      top: "5%",
    },
    legend: {
      position: "top",
    },
    series: {
      "0": {
        lineWidth: 1,
        pointSize: 4,
        color: "indianred",
      },
      "1": {
        type: "steppedArea",
        color: "#f44336",
        areaOpacity: 0,
        lineDashStyle: [4, 4],
      },
      "2": {
        type: "steppedArea",
        color: "#ff9800",
        areaOpacity: 0,
        lineDashStyle: [4, 4],
      },
      "3": {
        type: "steppedArea",
        color: "#03a9f4",
        areaOpacity: 0,
        lineDashStyle: [4, 4],
      },
    },
  };
}

export const buildThroughputChart = chartBuilder<ThroughputParams, Issue>(
  parseParams,
  queryData,
  buildDataTable,
  buildResponse
);
