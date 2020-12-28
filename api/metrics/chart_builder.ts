import { Request, Response } from "express";
import { ParsedQs } from "qs";
import { ValidationError } from "./chart_params";
import { DataTableBuilder } from "./data_table_builder";

export function chartBuilder<Params, Data>(
  parseParams: (ParsedQs) => Params,
  queryData: (Params) => Promise<Data[]>,
  buildDataTable: (Data, Params) => DataTableBuilder,
  buildResponse: (DataTableBuilder, Data, Params) => object
) {
  return async (req: Request, res: Response) => {
    try {
      const params = parseParams(req.query);
      const data = await queryData(params);
      const dataTable = buildDataTable(data, params);
      const response = buildResponse(dataTable, data, params);
      return res.json(response);
    } catch (e) {
      if (e instanceof ValidationError) {
        return res.status(e.statusCode).json({
          errors: e.validationErrors,
        });
      } else {
        console.log(e);
        return res.status(500);
      }
    }
  };
}
