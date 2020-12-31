import * as express from "express";
import { Field } from "../models/entities/field";
import { HierarchyLevel } from "../models/entities/hierarchy_level";
import { Status } from "../models/entities/status";
import { RouterDefinition } from "./router_definition";
import { getRepository } from "typeorm";
import { ParsedQs } from "qs";
import { DateTime, DateTimeFormatOptions } from "luxon";
import { ValidationError } from "../metrics/chart_params";
import { Issue } from "../models/entities/issue";
import { queryData } from "../metrics/throughput";
import { run, summarize } from "../simulation/run";

const router = express.Router();

type SimulationParams = {
  fromDate: DateTime;
  toDate: DateTime;
  hierarchyLevel: string;
  backlogSize: number;
}

export function parseParams(query: ParsedQs): SimulationParams {
  const errors = [];
  ["fromDate", "toDate", "hierarchyLevel", "backlogSize"].forEach((param) => {
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
    backlogSize: parseInt(query.backlogSize as string)
  };
}

router.get("/when", async (req, res) => {
  try {
    const params = parseParams(req.query);
    const issues = await queryData(params);
    const runs = run(issues, params.backlogSize, 1000);
    const results = summarize(runs);
    return res.json({
      results
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
