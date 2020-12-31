import { RandomGenerator, randomGenerator, selectValue } from "./select";

export type Measurements = {
  cycleTimes: number[];
  throughputs: number[];
};

export function runOnce(
  backlogCount: number,
  measurements: Measurements,
  generator: RandomGenerator = randomGenerator
): number {
  let time = selectValue(measurements.cycleTimes, generator);
  while (backlogCount > 0) {
    const throughput = selectValue(measurements.throughputs, generator);
    backlogCount -= throughput;
    time += 1;
  }
  return time;
}
