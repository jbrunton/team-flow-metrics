import { DateTime } from "luxon";
import { formatDate } from "../helpers/charts_helper";
import { HierarchyLevel } from "../models/entities/hierarchy_level";
import { Issue } from "../models/entities/issue";
import { DataTableBuilder } from "./data_table_builder";
import { ParsedQs } from "qs";
import { Between, getRepository, IsNull, Not } from "typeorm";
import { excludeOutliers } from "../helpers/data_helper";
import { Request, Response } from "express";

export type ScatterplotParams = {
  fromDate: DateTime;
  toDate: DateTime;
  hierarchyLevel: string;
  excludeOutliers: boolean;
};

export class ValidationError extends Error {
  public readonly validationErrors: string[];

  constructor(validationErrors: string[]) {
    super(`Invalid request: ${validationErrors.join(", ")}`);
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function parseParams(query: ParsedQs): ScatterplotParams {
  const errors = [];
  ["fromDate", "toDate", "hierarchyLevel"].forEach((param) => {
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
    excludeOutliers: query.excludeOutliers === "true",
  };
}

export async function queryData(params: ScatterplotParams): Promise<Issue[]> {
  const issues = await getRepository(Issue).find({
    where: {
      completed: Between(params.fromDate, params.toDate),
      issueType: params.hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
      started: Not(IsNull()),
    },
    order: {
      completed: "ASC",
    },
  });

  if (params.excludeOutliers) {
    return excludeOutliers(issues, (issue: Issue) => issue.cycleTime);
  }

  return issues;
}

export function buildDataTable(
  issues: Issue[],
  params: ScatterplotParams
): DataTableBuilder {
  const dataTable = new DataTableBuilder([
    {
      label: "completed_time",
      type: "date",
    },
    {
      label: "cycle_time",
      type: "number",
    },
    {
      label: "key",
      type: "string",
      role: "annotationText",
    },
  ]);

  dataTable.addRows(
    issues.map((issue) => [
      formatDate(issue.completed),
      issue.cycleTime,
      issue.key,
    ])
  );

  if (issues.length >= 3) {
    const percentiles = issues.length < 10 ? [50] : [50, 70, 85, 95];
    dataTable.addPercentiles(
      1,
      percentiles,
      formatDate(params.fromDate),
      formatDate(params.toDate)
    );
  }

  return dataTable;
}

export function buildResponse(dataTable: DataTableBuilder, data: Issue[]) {
  return {
    meta: {
      issuesCount: data.length,
    },
    chartOpts: getChartOps(data),
    chartData: dataTable.build(),
  };
}

function getChartOps(data: Issue[]) {
  return {
    seriesType: "scatter",
    interpolateNulls: true,
    series:
      data.length >= 10
        ? {
            "1": {
              type: "steppedArea",
              color: "#f44336",
              areaOpacity: 0,
            },
            "2": {
              type: "steppedArea",
              color: "#f44336",
              areaOpacity: 0,
              lineDashStyle: [4, 4],
            },
            "3": {
              type: "steppedArea",
              color: "#ff9800",
              areaOpacity: 0,
              lineDashStyle: [4, 4],
            },
            "4": {
              type: "steppedArea",
              color: "#03a9f4",
              areaOpacity: 0,
              lineDashStyle: [4, 4],
            },
          }
        : {
            "1": {
              type: "steppedArea",
              color: "#03a9f4",
              areaOpacity: 0,
              lineDashStyle: [4, 4],
            },
          },
    legend: {
      position: "none",
    },
    chartArea: {
      width: "90%",
      height: "80%",
      top: "5%",
    },
  };
}

export async function buildScatterplot(req: Request, res: Response) {
  let params: ScatterplotParams;
  try {
    params = parseParams(req.query);
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(400).json({
        errors: e.validationErrors,
      });
    } else {
      console.log(e);
      return res.status(500);
    }
  }

  const data = await queryData(params);
  const dataTable = buildDataTable(data, params);
  const response = buildResponse(dataTable, data);

  return res.json(response);
}
