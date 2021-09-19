import { Request, Response } from "express";
import { ParsedQs } from "qs";
import { ValidationError } from "./chart_params";
import { DataTableBuilder } from "./data_table_builder";

export function chartBuilder<Params, Data>(
  parseParams: (query: ParsedQs) => Params,
  queryData: (params: Params) => Promise<Data>,
  buildDataTable: (data: Data, params: Params) => DataTableBuilder,
  buildResponse: (
    builder: DataTableBuilder,
    data: Data,
    params: Params
  ) => unknown
) {
  return async (req: Request, res: Response): Promise<unknown> => {
    try {
      const params = parseParams(req.query);
      console.log({ params });
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
