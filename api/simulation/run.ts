import { Issues } from "jira.js/out/api";
import { times } from "lodash";
import { DateTime, DateTimeFormatOptions } from "luxon";
import { dateRange, nextIntervalDate, StepInterval } from "../helpers/date_helper";
import { ChartParams } from "../metrics/chart_params";
import { ThroughputParams } from "../metrics/throughput";
import { jStat } from "jstat";
import { Issue } from "../models/types";
import { randomGenerator, selectValue } from "./select";
export type Measurements = {
  cycleTimes: number[];
  throughputs: number[];
};

export function runOnce(
  backlogCount: number,
  measurements: Measurements
): number {
  console.log("runOnce()")
  let time = selectValue(measurements.cycleTimes, randomGenerator);
  while (backlogCount > 0) {
    const throughput = selectValue(measurements.throughputs, randomGenerator);
    backlogCount -= throughput;
    time += 1;
  }
  console.log("DONE runOnce()", { time })
  return time;
}

export function computeThroughput(
  issues: Issue[],
  stepInterval: StepInterval
): [DateTime, number][] {
  console.log("computeThroughput()")
  let dates = dateRange(issues[0].completed, issues[issues.length - 1].completed, stepInterval);
  let results: Record<string, number> = {};
  for (const issue of issues) {
    const key = issue.completed.startOf("day").toLocal().toISODate();
    results[key] = (results[key] || 0) + 1;
  }
  for (const date of dates) {
    const key = date.startOf("day").toLocal().toISODate();
    if (!results[key]) {
      results[key] = 0;
    }
  }
  console.log("DONE computeThroughput()", { results })
  return dates.map(date => {
    const key = date.startOf("day").toLocal().toISODate();
    return [date, results[key]];
  });
}

export function run(
  workItems: Issue[],
  backlogCount: number,
  runCount: number
): number[] {
  console.log("run()");
  const throughputs = computeThroughput(workItems, StepInterval.Daily)
    .map(result => result[1]);
  const measurements: Measurements = {
    cycleTimes: workItems.map(issue => issue.cycleTime),
    throughputs
  };
  const results = times(runCount)
    .map(() => runOnce(backlogCount, measurements))
    .sort();
  console.log("DONE run()", { results });
  return results;
}

export function summarize(
  runs: number[]
): [number, number][] {
  return times(10).map(k => {
    const percentile = jStat.percentile(runs, k / 10);
    return [k * 10, percentile];
  });
}
