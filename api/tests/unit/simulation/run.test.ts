import { DateTime } from "luxon";
import { StepInterval } from "../../../helpers/date_helper";
import {
  computeThroughput,
  measure,
  Measurements,
  run,
  runOnce,
  summarize,
} from "../../../simulation/run";
import { IssueFactory } from "../../factories/issue_factory";

describe("runOnce", () => {
  it("runs the MCS once", () => {
    const measurements: Measurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: [1, 0, 2],
    };

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // cycle time sample
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(2) // throughput sample #2
      .mockReturnValueOnce(1) // throughput sample #3
      .mockReturnValueOnce(2); // throughput sample #4

    // days | th. | backlog count
    // 3.5  |  -  |  5  - cycle time sample is 3.5 days
    // 4.5  |  1  |  4  - throughput sample #1
    // 5.5  |  2  |  2  - throughput sample #2
    // 6.5  |  0  |  2  - throughput sample #3
    // 7.5  |  2  |  0  - throughput sample #4
    expect(runOnce(5, measurements, generator)).toEqual(7.5);
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
      [DateTime.local(2020, 1, 3), 1],
      [DateTime.local(2020, 1, 4), 0],
      [DateTime.local(2020, 1, 5), 2],
    ]);
  });
});

describe("measure", () => {
  it("measures cycle times and throughput for the given issues", () => {
    const issues = [
      IssueFactory.build({
        cycleTime: 1,
        completed: DateTime.local(2020, 1, 3, 9, 30),
      }),
      IssueFactory.build({
        cycleTime: 3,
        completed: DateTime.local(2020, 1, 5, 0, 10),
      }),
      IssueFactory.build({
        cycleTime: 2,
        completed: DateTime.local(2020, 1, 5, 10, 30),
      }),
    ];
    expect(measure(issues)).toEqual({
      cycleTimes: [1, 3, 2],
      throughputs: [1, 0, 2],
    });
  });
});

describe("run", () => {
  it("returns results for `runCount` runs of the simulation", () => {
    const measurements: Measurements = {
      cycleTimes: [2.5, 3.5, 5.5],
      throughputs: [1, 0, 2],
    };

    const generator = jest.fn();
    generator
      .mockReturnValueOnce(1) // cycle time sample #1
      .mockReturnValueOnce(0) // throughput sample #1
      .mockReturnValueOnce(2) // throughput sample #2
      .mockReturnValueOnce(1) // throughput sample #3
      .mockReturnValueOnce(2) // throughput sample #4
      .mockReturnValueOnce(2) // cycle time sample #2
      .mockReturnValueOnce(0) // throughput sample #5
      .mockReturnValueOnce(0) // throughput sample #6
      .mockReturnValueOnce(0) // throughput sample #7
      .mockReturnValueOnce(1) // throughput sample #8
      .mockReturnValueOnce(2); // throughput sample #9
    expect(run(5, measurements, 2, generator)).toEqual([7.5, 10.5]);
  });
});

describe("summarize", () => {
  it("returns data for a histogram of durations", () => {
    const startDate = DateTime.local(2020, 1, 1);
    const summary = summarize([1, 3, 10, 5, 9, 5], startDate);
    expect(summary).toEqual([
      { count: 1, date: DateTime.local(2020, 1, 2) },
      { count: 1, date: DateTime.local(2020, 1, 4) },
      { count: 2, date: DateTime.local(2020, 1, 6) },
      { count: 1, date: DateTime.local(2020, 1, 10) },
      { count: 1, date: DateTime.local(2020, 1, 11) },
    ]);
  });
});
