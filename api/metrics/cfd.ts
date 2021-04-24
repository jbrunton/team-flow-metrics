import { DateTime } from "luxon";
import { concat, map } from "lodash";
import { formatDate } from "../helpers/charts_helper";
import { Issue } from "../models/entities/issue";
import { DataTableBuilder } from "./data_table_builder";
import { ParsedQs } from "qs";
import {
  Between,
  getRepository,
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Not,
} from "typeorm";
import { ChartParams, ValidationError } from "./chart_params";
import { chartBuilder } from "./chart_builder";
import { CfdBuilder } from "./cfd_builder";

export type EpicCfdParams = {
  epicKey: string;
};

export type IssueCfdParams = ChartParams & {
  includeStoppedIssues: boolean;
  includeToDoIssues: boolean;
  includeBacklog: boolean;
  includeDoneIssues: boolean;
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
      includeStoppedIssues: query.includeStoppedIssues === "true",
      includeToDoIssues: query.includeToDoIssues === "true",
      includeBacklog: query.includeBacklog === "true",
      includeDoneIssues: query.includeDoneIssues === "true",
    };
  } else {
    throw new ValidationError([
      "Required epicKey or fromDate and toDate query params",
    ]);
  }
}

export type CfdData = {
  epic?: Issue;
  issues: Issue[];
  backlogSize: number;
  doneCount: number;
};

export async function queryData(params: CfdParams): Promise<CfdData> {
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
    return {
      epic,
      issues,
      backlogSize: 0,
      doneCount: 0,
    };
  } else {
    const { fromDate, toDate } = params;
    const isStopped = (issue: Issue) =>
      issue.started && !issue.completed && issue.statusCategory === "To Do";
    const issueType = params.hierarchyLevel === "Epic" ? "Epic" : Not("Epic"); // TODO: this is a hack
    const completedIssues = await getRepository(Issue).find({
      issueType,
      started: LessThan(toDate),
      completed: MoreThanOrEqual(fromDate),
    });
    const inProgressIssues = await getRepository(Issue).find({
      issueType,
      started: Not(IsNull()),
      completed: IsNull(),
      created: LessThan(toDate),
    });
    const toDoIssues = params.includeToDoIssues
      ? await getRepository(Issue).find({
          issueType,
          started: IsNull(),
          completed: IsNull(),
          created: Between(fromDate, toDate),
        })
      : [];
    const backlogSize =
      params.includeToDoIssues && params.includeBacklog
        ? await getRepository(Issue).count({
            issueType,
            started: IsNull(),
            completed: IsNull(),
            created: LessThan(fromDate),
          })
        : 0;
    const doneCount = params.includeDoneIssues
      ? await getRepository(Issue).count({
          issueType,
          completed: LessThan(fromDate),
        })
      : 0;
    const candidates = concat(completedIssues, inProgressIssues, toDoIssues);
    const issues = candidates.filter(
      (issue) => params.includeStoppedIssues || !isStopped(issue)
    );
    return {
      issues,
      backlogSize,
      doneCount,
    };
  }
}

function getFromDate(
  issues: Issue[],
  epic: Issue,
  params: CfdParams
): DateTime {
  return isEpicParams(params) && epic.statusCategory != "To Do"
    ? map(issues, "started").sort()[0].minus({ days: 1 })
    : params["fromDate"];
}

function getToDate(issues: Issue[], epic: Issue, params: CfdParams): DateTime {
  if (isEpicParams(params)) {
    if (epic?.statusCategory == "Done") {
      return map(issues, "completed").sort().reverse()[0].plus({ days: 1 });
    } else {
      return DateTime.local();
    }
  }
  return params["toDate"];
}

export function buildDataTable(
  { issues, backlogSize, doneCount, epic }: CfdData,
  params: CfdParams
): DataTableBuilder {
  const cfdBuilder = new CfdBuilder();
  cfdBuilder.addIssues(issues);
  cfdBuilder.setBacklogSize(backlogSize);
  cfdBuilder.setDoneCount(doneCount);
  const includeToDoColumn = isEpicParams(params) || params.includeToDoIssues;
  const fromDate = getFromDate(issues, epic, params);
  const toDate = getToDate(issues, epic, params);
  const rows = cfdBuilder.build(fromDate, toDate).map((cfdRow) => {
    const row = [
      formatDate(cfdRow.date),
      0,
      cfdRow.total,
      cfdRow.done,
      cfdRow.inProgress,
    ];
    if (includeToDoColumn) {
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
  if (includeToDoColumn) {
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
  { issues, backlogSize }: CfdData,
  params: CfdParams
): unknown {
  return {
    meta: {
      issuesCount: issues.length + backlogSize,
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
    height: 500,
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

export const buildCfd = chartBuilder<CfdParams, CfdData>(
  parseParams,
  queryData,
  buildDataTable,
  buildResponse
);
