import seedrandom from "seedrandom";

/**
 * Any function which given an integer k returns a random
 * integer in the range [0-k).
 */
export type RandomGenerator = (k: number) => number;

export function newGenerator(seed?: number): RandomGenerator {
  const generator = seed ? seedrandom(seed.toString()) : seedrandom();
  return (k: number): number => {
    return Math.floor(generator() * k);
  };
}

export function selectValue(
  values: number[],
  generator: RandomGenerator
): number {
  const index = generator(values.length);
  return values[index];
}
