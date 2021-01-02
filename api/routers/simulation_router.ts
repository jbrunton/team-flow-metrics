import * as express from "express";
import { RouterDefinition } from "./router_definition";
import { ParsedQs } from "qs";
import { DateTime } from "luxon";
import { ValidationError } from "../metrics/chart_params";
import { queryData } from "../metrics/throughput";
import {
  getColorForPercentile,
  measure,
  run,
  summarize,
} from "../simulation/run";
import { DataTableBuilder } from "../metrics/data_table_builder";
import { formatDate } from "../helpers/charts_helper";
import { newGenerator } from "../simulation/select";

const router = express.Router();

type SimulationParams = {
  fromDate: DateTime;
  toDate: DateTime;
  startDate: DateTime;
  hierarchyLevel: string;
  backlogSize: number;
  seed?: number;
  excludeOutliers: boolean;
};

export function parseParams(query: ParsedQs): SimulationParams {
  const errors = [];
  ["fromDate", "toDate", "startDate", "hierarchyLevel", "backlogSize"].forEach(
    (param) => {
      if (!query[param]) {
        errors.push(`Missing query param: ${param}`);
      }
    }
  );

  if (errors.length) {
    throw new ValidationError(errors);
  }

  return {
    fromDate: DateTime.fromISO(query.fromDate as string),
    toDate: DateTime.fromISO(query.toDate as string),
    startDate: DateTime.fromISO(query.startDate as string),
    hierarchyLevel: query.hierarchyLevel as string,
    excludeOutliers: query.excludeOutliers === "true",
    backlogSize: parseInt(query.backlogSize as string),
    seed: query.seed ? parseInt(query.seed as string) : null,
  };
}

router.get("/when", async (req, res) => {
  try {
    const params = parseParams(req.query);
    const issues = await queryData(params);
    const measurements = measure(issues, params.excludeOutliers);
    const runs = run(
      params.backlogSize,
      measurements,
      10000,
      params.startDate,
      newGenerator(params.seed)
    );
    const results = summarize(runs, params.startDate);
    const dataTable = new DataTableBuilder([
      { label: "date", type: "date" },
      { type: "string", role: "annotation" },
      { type: "string", role: "annotationText" },
      { label: "count", type: "number" },
      { label: "style", type: "string", role: "style" },
    ]);
    dataTable.addRows(
      results.map((row) => {
        const color = getColorForPercentile(row.endPercentile);
        return [
          formatDate(row.date),
          row.annotation,
          row.annotationText,
          row.count,
          `color: ${color}`,
        ];
      })
    );
    return res.json({
      chartOpts: {
        seriesType: "bars",
        bar: { groupWidth: "95%" },
        chartArea: {
          width: "90%",
          height: "80%",
          top: "5%",
        },
        legend: {
          position: "none",
        },
        annotations: { style: "line" },
        height: 300,
      },
      chartData: dataTable.build(),
    });
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(e.statusCode).json({
        errors: e.validationErrors,
      });
    } else {
      console.log(e);
      return res.status(500);
    }
  }
});

module.exports = {
  routerPath: "/simulation",
  router: router,
} as RouterDefinition;
