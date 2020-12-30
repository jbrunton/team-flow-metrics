import { DateTime } from "luxon";
import { formatDate } from "../helpers/charts_helper";
import { Issue } from "../models/entities/issue";
import { DataTableBuilder } from "./data_table_builder";
import { ParsedQs } from "qs";
import { getRepository, IsNull, LessThan, MoreThan, Not } from "typeorm";
import { ChartParams, ValidationError } from "./chart_params";
import { chartBuilder } from "./chart_builder";
import { CfdBuilder } from "./cfd_builder";

export type EpicCfdParams = {
  epicKey: string;
};

export type IssueCfdParams = ChartParams & {
  excludeStoppedIssues: boolean;
};

export type CfdParams = EpicCfdParams | IssueCfdParams;

function isEpicParams(params: CfdParams): params is EpicCfdParams {
  return (params as EpicCfdParams).epicKey !== undefined;
}

export function parseParams(query: ParsedQs): CfdParams {
  if (query.epicKey) {
    const epicKey = query.epicKey as string;
    return {
      epicKey,
    };
  } else if (query.fromDate && query.toDate) {
    return {
      fromDate: DateTime.fromISO(query.fromDate as string).toUTC(),
      toDate: DateTime.fromISO(query.toDate as string).toUTC(),
      hierarchyLevel: query.hierarchyLevel as string,
      excludeStoppedIssues: query.excludeStoppedIssues === "true",
    };
  } else {
    throw new ValidationError([
      "Required epicKey or fromDate and toDate query params",
    ]);
  }
}

export async function queryData(params: CfdParams): Promise<Issue[]> {
  if (isEpicParams(params)) {
    const epic = await getRepository(Issue).findOne({ key: params.epicKey });
    if (!epic) {
      throw new ValidationError(
        [`Could not find epic with key ${params.epicKey}`],
        401
      );
    }
    const issues = await getRepository(Issue).find({
      epicId: epic.id,
    });
    return issues;
  } else {
    const completedIssues = await getRepository(Issue).find({
      completed: MoreThan(params.fromDate),
      issueType: params.hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
      started: LessThan(params.toDate),
    });
    const inProgressIssues = await getRepository(Issue).find({
      completed: IsNull(),
      issueType: params.hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
      started: LessThan(params.toDate),
    });
    const issues = completedIssues
      .concat(inProgressIssues)
      .filter(
        (issue) =>
          !params.excludeStoppedIssues || issue.statusCategory !== "To Do"
      );
    return issues;
  }
}

export function buildDataTable(
  issues: Issue[],
  params: CfdParams
): DataTableBuilder {
  const cfdBuilder = new CfdBuilder();
  cfdBuilder.addIssues(issues);
  const rows = cfdBuilder
    .build(params["fromDate"], params["toDate"])
    .map((cfdRow) => {
      const row = [
        formatDate(cfdRow.date),
        0,
        cfdRow.total,
        cfdRow.done,
        cfdRow.inProgress,
      ];
      if (params["epicKey"]) {
        row.push(cfdRow.toDo);
      }
      return row;
    });
  const builder = new DataTableBuilder();
  const columns = [
    {
      label: "Date",
      type: "date",
    },
    {
      label: "Total",
      type: "number",
    },
    {
      label: "Tooltip",
      type: "number",
      role: "tooltip",
    },
    {
      label: "Done",
      type: "number",
    },
    {
      label: "In Progress",
      type: "number",
    },
  ];
  if (params["epicKey"]) {
    columns.push({
      label: "To Do",
      type: "number",
    });
  }
  builder.setColumns(columns);
  builder.addRows(rows);
  return builder;
}

export function buildResponse(
  dataTable: DataTableBuilder,
  data: Issue[],
  params: CfdParams
): unknown {
  return {
    meta: {
      issuesCount: data.length,
    },
    chartOpts: getChartOps(params),
    chartData: dataTable.build(),
  };
}

function getChartOps(params: CfdParams) {
  return {
    chartArea: {
      width: "90%",
      height: "80%",
      top: "5%",
    },
    height: 300,
    hAxis: {
      titleTextStyle: {
        color: "#333",
      },
    },
    vAxis: params["epicKey"]
      ? {
          minValue: 0,
          textPosition: "none",
        }
      : { minValue: 0 },
    isStacked: true,
    lineWidth: 1,
    areaOpacity: 0.4,
    legend: {
      position: "top",
    },
    series: {
      "0": {
        color: "grey",
      },
      "1": {
        color: "blue",
      },
      "2": {
        color: "green",
      },
      "3": {
        color: "red",
      },
      "4": {
        color: "orange",
      },
    },
    crosshair: {
      trigger: "focus",
      orientation: "vertical",
      color: "grey",
    },
    focusTarget: "category",
    annotations: {
      textStyle: {
        color: "black",
      },
      domain: {
        style: "line",
        stem: {
          color: "red",
        },
      },
      datum: {
        style: "point",
        stem: {
          color: "black",
          length: "12",
        },
      },
    },
  };
}

export const buildCfd = chartBuilder<CfdParams, Issue>(
  parseParams,
  queryData,
  buildDataTable,
  buildResponse
);
