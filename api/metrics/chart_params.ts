import { DateTime } from "luxon";

export type ChartParams = {
  fromDate: DateTime;
  toDate: DateTime;
  hierarchyLevel: string;
};

export class ValidationError extends Error {
  public readonly validationErrors: string[];
  public readonly statusCode: number;

  constructor(validationErrors: string[], statusCode = 400) {
    super(`Invalid request: ${validationErrors.join(", ")}`);
    this.validationErrors = validationErrors;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
