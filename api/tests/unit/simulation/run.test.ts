import { DateTime } from "luxon";
import { StepInterval } from "../../../helpers/date_helper";
import {
  categorizeWeekday,
  computeThroughput,
  measure,
  Measurements,
  run,
  runOnce,
  summarize,
} from "../../../simulation/run";
import { IssueFactory } from "../../factories/issue_factory";

describe("categorizeWeekday", () => {
  it("categorizes weekdays", () => {
    expect(categorizeWeekday(1)).toEqual("weekday");
    expect(categorizeWeekday(2)).toEqual("weekday");
    expect(categorizeWeekday(3)).toEqual("weekday");
    expect(categorizeWeekday(4)).toEqual("weekday");
    expect(categorizeWeekday(5)).toEqual("weekday");

    expect(categorizeWeekday(6)).toEqual("weekend");
    expect(categorizeWeekday(7)).toEqual("weekend");
  });
});

describe("computeThroughput", () => {
  it("computes the throughput for a given ordered list of issues", () => {
    const issues = [
      IssueFactory.build({ completed: DateTime.local(2020, 1, 3, 9, 30) }),
      IssueFactory.build({ completed: DateTime.local(2020, 1, 5, 0, 10) }),
      IssueFactory.build({ completed: DateTime.local(2020, 1, 5, 10, 30) }),
    ];
    expect(computeThroughput(issues, StepInterval.Daily)).toEqual([
      { date: DateTime.local(2020, 1, 3), count: 1 },
      { date: DateTime.local(2020, 1, 4), count: 0 },
      { date: DateTime.local(2020, 1, 5), count: 2 },
    ]);
  });
});

describe("measure", () => {
  it("measures cycle times and throughput for the given issues", () => {
    const issues = [
      IssueFactory.build({
        cycleTime: 1,
        completed: DateTime.local(2020, 1, 2, 9, 30),
      }),
      IssueFactory.build({
        cycleTime: 3,
        completed: DateTime.local(2020, 1, 2, 12, 10),
      }),
      IssueFactory.build({
        cycleTime: 2,
        completed: DateTime.local(2020, 1, 6, 10, 30),
      }),
      IssueFactory.build({
        cycleTime: 200,
        completed: DateTime.local(2020, 1, 7, 10, 30),
      }),
    ];
    expect(measure(issues, false)).toEqual({
      cycleTimes: [1, 3, 2, 200],
      throughputs: {
        weekend: [0, 0],
        weekday: [2, 0, 1, 1],
      },
    });
  });

  it("optionally excludes cycle time outliers", () => {
    const issues = [
      IssueFactory.build({
        cycleTime: 1,
        completed: DateTime.local(2020, 1, 2, 9, 30),
      }),
      IssueFactory.build({
        cycleTime: 3,
        completed: DateTime.local(2020, 1, 2, 12, 10),
      }),
      IssueFactory.build({
        cycleTime: 2,
        completed: DateTime.local(2020, 1, 6, 10, 30),
      }),
      IssueFactory.build({
        cycleTime: 200,
        completed: DateTime.local(2020, 1, 7, 10, 30),
      }),
    ];
    expect(measure(issues, true)).toEqual({
      cycleTimes: [1, 3, 2],
      throughputs: {
        weekend: [0, 0],
        weekday: [2, 0, 1, 1],
      },
    });
  });
});

describe("runOnce", () => {
  it("runs the MCS once", () => {
    const measurements: Measurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: {
        weekend: [0],
        weekday: [1, 2],
      },
    };
    const startWeekday = 1;

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // cycle time sample (3.5)
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(1) // throughput sample #4
      .mockReturnValueOnce(1); // throughput sample #5

    // time | th. |   day   | backlog count
    // 3.5  |  -  | 4 (Thu) |  5  - cycle time sample is 3.5 days
    // 4.5  |  1  | 5 (Fri) |  4  - throughput sample #1
    // 4.5  |  0  | 6 (Sat) |  4  - throughput sample #2
    // 5.5  |  0  | 7 (Sun) |  4  - throughput sample #3
    // 6.5  |  2  | 1 (Mon) |  2  - throughput sample #4
    // 7.5  |  2  | 2 (Mon) |  0  - throughput sample #5
    expect(runOnce(5, measurements, startWeekday, generator)).toEqual(7.5);
  });
});

describe("run", () => {
  it("returns results for `runCount` runs of the simulation", () => {
    const measurements: Measurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: {
        weekend: [0],
        weekday: [1, 2],
      },
    };
    const startDate = DateTime.local(2020, 1, 6);

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // cycle time sample #1 (3.5)
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(1) // throughput sample #4
      .mockReturnValueOnce(1) // throughput sample #5
      .mockReturnValueOnce(1) // cycle time sample #2 (3.5)
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(0) // throughput sample #2
      .mockReturnValueOnce(0) // throughput sample #3
      .mockReturnValueOnce(1) // throughput sample #4
      .mockReturnValueOnce(0) // throughput sample #5
      .mockReturnValueOnce(0); // throughput sample #6
    expect(run(5, measurements, 2, startDate, generator)).toEqual([7.5, 8.5]);
  });
});

describe("summarize", () => {
  it("returns data for a histogram of durations", () => {
    const startDate = DateTime.local(2020, 1, 1);
    const summary = summarize([1, 3, 10, 5, 9, 5, 3, 5], startDate);
    expect(summary).toEqual([
      {
        date: DateTime.local(2020, 1, 2),
        count: 1,
        annotation: null,
        annotationText: null,
        startPercentile: 0,
        endPercentile: 0.125,
      },
      {
        date: DateTime.local(2020, 1, 4),
        count: 2,
        annotation: null,
        annotationText: null,
        startPercentile: 0.125,
        endPercentile: 0.375,
      },
      {
        date: DateTime.local(2020, 1, 6),
        count: 3,
        annotation: "50th",
        annotationText: "2020-01-06",
        startPercentile: 0.375,
        endPercentile: 0.75,
      },
      {
        date: DateTime.local(2020, 1, 10),
        count: 1,
        annotation: "85th",
        annotationText: "2020-01-10",
        startPercentile: 0.75,
        endPercentile: 0.875,
      },
      {
        date: DateTime.local(2020, 1, 11),
        count: 1,
        annotation: "95th",
        annotationText: "2020-01-11",
        startPercentile: 0.875,
        endPercentile: 1,
      },
    ]);
  });
});
