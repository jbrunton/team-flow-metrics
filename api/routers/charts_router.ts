import * as express from "express";
import { Between, IsNull, Not } from "typeorm";
import { DateTime } from "luxon";
import { getRepository } from "typeorm";
import { Issue } from "../models/entities/issue";
import { nextIntervalDate, StepInterval } from "../helpers/date_helper";
import { buildScatterplot } from "../metrics/scatterplot";
import { buildThroughputChart } from "../metrics/throughput";
import { buildCfd } from "../metrics/cfd";
import { RouterDefinition } from "./router_definition";

const router = express.Router();

router.get("/scatterplot", async (req, res) => {
  return buildScatterplot(req, res);
});

router.get("/cfd", async (req, res) => {
  return buildCfd(req, res);
});

router.get("/throughput", async (req, res) => {
  return buildThroughputChart(req, res);
});

router.get("/throughput/closedBetween", async (req, res) => {
  if (!req.query.fromDate) {
    res.status(400).json({
      error: "Required fromDate query param",
    });
  }

  if (!req.query.hierarchyLevel) {
    res.status(400).json({
      error: "Required hierarchyLevel query param",
    });
  }

  const fromDate = DateTime.fromISO(req.query.fromDate as string).toUTC();
  const stepInterval = StepInterval[
    req.query.stepInterval as string
  ] as StepInterval;
  const toDate = nextIntervalDate(fromDate, stepInterval);
  const hierarchyLevel = req.query.hierarchyLevel;

  const completedIssues = await getRepository(Issue).find({
    where: {
      completed: Between(fromDate, toDate),
      issueType: hierarchyLevel === "Epic" ? "Epic" : Not("Epic"), // TODO: this is a hack
      started: Not(IsNull()),
    },
    order: {
      completed: "ASC",
    },
  });

  res.json({
    count: completedIssues.length,
    issues: completedIssues,
  });
});

module.exports = {
  routerPath: "/charts",
  router: router,
} as RouterDefinition;
