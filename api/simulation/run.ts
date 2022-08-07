import { groupBy, times } from "lodash";
import { DateTime } from "luxon";
import { excludeOutliers } from "../helpers/data_helper";
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

export function measure(
  issues: Issue[],
  excludeCycleTimeOutliers: boolean,
  throughputScale: number,
): Measurements {
  const throughputs: Record<string, number[]> = {};
  for (const { date, count } of computeThroughput(issues, StepInterval.Daily)) {
    const category = categorizeWeekday(date.weekday);
    if (!throughputs[category]) {
      throughputs[category] = [];
    }
    throughputs[category].push(count * throughputScale);
  }
  let cycleTimes = issues.map((issue) => issue.cycleTime);
  if (excludeCycleTimeOutliers) {
    cycleTimes = excludeOutliers(cycleTimes, (x: number) => x);
  }
  return {
    cycleTimes,
    throughputs,
  };
}

export function runOnce(
  backlogSize: number,
  measurements: Measurements,
  startWeekday: number,
  excludeLeadTimes: boolean,
  generator: RandomGenerator
): number {
  let time = excludeLeadTimes
    ? 0
    : selectValue(measurements.cycleTimes, generator);
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

export function getColorForPercentile(percentile: number): string {
  if (percentile > 0.95) {
    return "#009600";
  }
  if (percentile > 0.85) {
    return "#00C900";
  }
  if (percentile > 0.7) {
    return "#C9C900";
  }
  if (percentile > 0.5) {
    return "#FF9B00";
  }
  return "#f44336";
}

export function getLongTailCutoff(rowCount: number): number {
  if (rowCount < 50) {
    return 0;
  }
  if (rowCount < 100) {
    return 0.01;
  }
  if (rowCount < 200) {
    return 0.02;
  }
  return 0.025;
}

export function run(
  backlogSize: number,
  measurements: Measurements,
  runCount: number,
  startDate: DateTime,
  excludeLeadTimes: boolean,
  generator: RandomGenerator
): number[] {
  const results = times(runCount)
    .map(() =>
      runOnce(
        backlogSize,
        measurements,
        startDate.weekday,
        excludeLeadTimes,
        generator
      )
    )
    .sort((a, b) => a - b);
  return results;
}

export type SummaryRow = {
  date: DateTime;
  count: number;
  annotation?: string;
  annotationText?: string;
  startPercentile: number;
  endPercentile: number;
  tooltip: string;
};

export function summarize(
  runs: number[],
  startDate: DateTime,
  includeLongTails: boolean
): SummaryRow[] {
  const timeByDays = groupBy(runs, (run) => Math.ceil(run));
  const rowCount = Object.keys(timeByDays).length;
  const longtail = getLongTailCutoff(rowCount);
  const minPercentile = longtail;
  const maxPercentile = 1 - longtail;
  const percentiles = {
    "50": 0.5,
    "70": 0.7,
    "85": 0.85,
    "95": 0.95,
  };
  let index = 0;
  return Object.entries(timeByDays)
    .map(([duration, runsWithDuration]) => {
      const count = runsWithDuration.length;
      const date = startDate.plus({ days: parseInt(duration) });
      const startPercentile = index / runs.length;
      const endPercentile = (index + count) / runs.length;

      const percentile = Object.entries(percentiles).find(([, percentile]) => {
        return startPercentile <= percentile && percentile < endPercentile;
      });
      const annotation = percentile ? `${percentile[0]}th` : null;
      const annotationText = percentile ? date.toISODate() : null;

      index += count;

      const percentComplete = Math.floor((index / runs.length) * 100);
      const tooltip = `${percentComplete}% of trials finished by ${date.toFormat(
        "d MMM yyyy"
      )}`;

      return {
        date,
        count,
        annotation,
        annotationText,
        startPercentile,
        endPercentile,
        tooltip,
      };
    })
    .filter((row) => {
      if (includeLongTails) {
        return true;
      }
      return (
        row.endPercentile >= minPercentile &&
        row.startPercentile <= maxPercentile
      );
    })
    .sort((row1, row2) => compareDateTimes(row1.date, row2.date));
}
