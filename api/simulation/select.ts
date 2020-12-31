import { DateTime } from "luxon";
import { Issue } from "../models/types";

/**
 * Any function which given an integer k returns a random
 * integer in the range [0-k).
 */
export type RandomGenerator = (k: number) => number;

export function randomGenerator(k: number): number {
  return Math.floor(Math.random() * k);
}

export function selectValue(
  values: number[],
  generator: RandomGenerator
): number {
  const index = generator(values.length);
  return values[index];
}
