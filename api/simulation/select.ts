import seedrandom from "seedrandom";

//const generator = seedrandom(123);

/**
 * Any function which given an integer k returns a random
 * integer in the range [0-k).
 */
export type RandomGenerator = (k: number) => number;

// export function randomGenerator(k: number): number {
//   //return Math.floor(Math.random() * k);
//   return Math.floor(generator() * k);
// }

export function createGenerator(seed = 123): RandomGenerator {
  const generator = seedrandom(seed.toString());
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
