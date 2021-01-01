import { groupBy, times } from "lodash";
import { DateTime } from "luxon";
import { dateRange, StepInterval } from "../helpers/date_helper";
import { Issue } from "../models/types";
import { RandomGenerator, createGenerator, selectValue } from "./select";

export type Measurements = {
  cycleTimes: number[];
  throughputs: number[];
};

export function runOnce(
  backlogSize: number,
  measurements: Measurements,
  generator: RandomGenerator
): number {
  let time = selectValue(measurements.cycleTimes, generator);
  while (backlogSize > 0) {
    const throughput = selectValue(measurements.throughputs, generator);
    backlogSize -= throughput;
    time += 1;
  }
  return time;
}

export function computeThroughput(
  issues: Issue[],
  stepInterval: StepInterval
): [DateTime, number][] {
  const dates = dateRange(
    issues[0].completed.toLocal().startOf("day"),
    issues[issues.length - 1].completed.toLocal().startOf("day"),
    stepInterval
  );
  const results: Record<string, number> = {};
  for (const issue of issues) {
    const key = issue.completed.toLocal().startOf("day").toISODate();
    results[key] = (results[key] || 0) + 1;
  }
  for (const date of dates) {
    const key = date.toLocal().startOf("day").toISODate();
    if (!results[key]) {
      results[key] = 0;
    }
  }
  return dates.map((date) => {
    const key = date.toLocal().startOf("day").toISODate();
    return [date, results[key]];
  });
}

export function measure(issues: Issue[]): Measurements {
  const throughputs = computeThroughput(issues, StepInterval.Daily).map(
    (result) => result[1]
  );
  return {
    cycleTimes: issues.map((issue) => issue.cycleTime),
    throughputs: throughputs,
  };
}

export function run(
  backlogSize: number,
  measurements: Measurements,
  runCount: number,
  generator: RandomGenerator = createGenerator()
): number[] {
  const results = times(runCount)
    .map(() => runOnce(backlogSize, measurements, generator))
    .sort((a, b) => a - b);
  return results;
}

export type SummaryRow = {
  days: number;
  count: number;
};

export function summarize(runs: number[]): SummaryRow[] {
  const timeByDays = groupBy(runs, (run) => Math.ceil(run));
  return Object.entries(timeByDays)
    .map(([key, runs]: [string, number[]]) => ({
      days: parseInt(key),
      count: runs.length,
    }))
    .sort((row1, row2) => row2.days - row1.days);
  // .map(([days, runs]) => ({
  //   days,
  //   count: runs.length
  // }));

  // const percentiles = times(10).map((k) => {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  //   const percentile = jStat.percentile(runs, k / 10) as number;
  //   return [k * 10, percentile];
  // });
  // const rows = percentiles.map(([percentile, cume], index) => {
  //   return {
  //     percentile,
  //     cume,
  //     count: index > 0 ? cume - percentiles[index - 1][1] : cume
  //   };
  // })
  // return rows;
}
