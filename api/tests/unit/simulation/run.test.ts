import { Measurements, runOnce } from "../../../simulation/run";

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
