import { DateTime } from "luxon";
import { ParsedQs } from "qs";

export type ChartParams = {
  fromDate: DateTime;
  toDate: DateTime;
  hierarchyLevel: string;
};

export class ValidationError extends Error {
  public readonly validationErrors: string[];

  constructor(validationErrors: string[]) {
    super(`Invalid request: ${validationErrors.join(", ")}`);
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
