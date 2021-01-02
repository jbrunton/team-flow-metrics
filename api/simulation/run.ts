import { groupBy, times } from "lodash";
import { DateTime } from "luxon";
import {
  compareDateTimes,
  dateRange,
  StepInterval,
} from "../helpers/date_helper";
import { Issue } from "../models/types";
import { RandomGenerator, selectValue } from "./select";

export type Measurements = {
  cycleTimes: number[];
  throughputs: { [dayCategory: string]: number[] };
};

export function categorizeWeekday(weekday: number): string {
  return [6, 7].includes(weekday) ? "weekend" : "weekday";
}

export function computeThroughput(
  issues: Issue[],
  stepInterval: StepInterval
): { date: DateTime; count: number }[] {
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
    return { date, count: results[key] };
  });
}

export function measure(issues: Issue[]): Measurements {
  const throughputs: Record<string, number[]> = {};
  for (const { date, count } of computeThroughput(issues, StepInterval.Daily)) {
    const category = categorizeWeekday(date.weekday);
    if (!throughputs[category]) {
      throughputs[category] = [];
    }
    throughputs[category].push(count);
  }
  return {
    cycleTimes: issues.map((issue) => issue.cycleTime),
    throughputs,
  };
}

export function runOnce(
  backlogSize: number,
  measurements: Measurements,
  startWeekday: number,
  generator: RandomGenerator
): number {
  let time = selectValue(measurements.cycleTimes, generator);
  let weekday = Math.floor(time + startWeekday);
  while (weekday > 7) {
    weekday -= 7;
  }
  while (backlogSize > 0) {
    const category = categorizeWeekday(weekday);
    const throughput = selectValue(
      measurements.throughputs[category],
      generator
    );
    backlogSize -= throughput;
    time += 1;
    weekday += 1;
    while (weekday > 7) {
      weekday -= 7;
    }
  }
  return time;
}

export function run(
  backlogSize: number,
  measurements: Measurements,
  runCount: number,
  startDate: DateTime,
  generator: RandomGenerator
): number[] {
  const results = times(runCount)
    .map(() => runOnce(backlogSize, measurements, startDate.weekday, generator))
    .sort((a, b) => a - b);
  return results;
}

export type SummaryRow = {
  date: DateTime;
  count: number;
  annotation?: string;
  annotationText?: string;
};

export function summarize(runs: number[], startDate: DateTime): SummaryRow[] {
  const timeByDays = groupBy(runs, (run) => Math.ceil(run));
  const rows = Object.keys(timeByDays).length;
  const longtail = rows < 50 ? 0 : rows < 100 ? 0.01 : 0.02;
  const minIndex = Math.floor(runs.length * longtail);
  const maxIndex = Math.floor(runs.length * (1 - longtail));
  const percentiles = {
    "50": Math.floor(runs.length * 0.5),
    "70": Math.floor(runs.length * 0.7),
    "85": Math.floor(runs.length * 0.85),
  };
  let index = 0;
  return Object.entries(timeByDays)
    .map(([duration, runsWithDuration]) => {
      const count = runsWithDuration.length;
      const date = startDate.plus({ days: parseInt(duration) });
      const startIndex = index;
      const endIndex = index + count;

      const percentile = Object.entries(percentiles).find(
        ([, percentileIndex]) => {
          return startIndex <= percentileIndex && percentileIndex <= endIndex;
        }
      );
      const annotation = percentile ? `${percentile[0]}th` : null;
      const annotationText = percentile ? date.toISODate() : null;

      index += count;

      return {
        date,
        count,
        annotation,
        annotationText,
        startIndex,
        endIndex,
      };
    })
    .filter((row) => {
      const startIndex = row.startIndex;
      const endIndex = row.endIndex;
      delete row.startIndex;
      delete row.endIndex;
      return endIndex >= minIndex && startIndex <= maxIndex;
    })
    .sort((row1, row2) => compareDateTimes(row1.date, row2.date));
}
