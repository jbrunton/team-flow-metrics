import { DateTime } from "luxon";
import { IssueFactory } from "../../factories/issue_factory";
import { times } from "lodash";
import {
  buildResponse,
  buildDataTable,
  parseParams,
} from "../../../metrics/throughput";
import { ValidationError } from "../../../metrics/chart_params";
import { StepInterval } from "../../../helpers/date_helper";

const params = {
  fromDate: DateTime.local(2020, 1, 1),
  toDate: DateTime.local(2020, 1, 8),
  hierarchyLevel: "Story",
  stepInterval: StepInterval.Daily,
};

describe("#parseParams", () => {
  it("parses the query params", () => {
    const params = parseParams({
      fromDate: "2020-01-01",
      toDate: "2020-02-01",
      hierarchyLevel: "Story",
      stepInterval: "Weekly",
    });
    expect(params).toEqual({
      fromDate: DateTime.local(2020, 1, 1),
      toDate: DateTime.local(2020, 2, 1),
      hierarchyLevel: "Story",
      stepInterval: StepInterval.Weekly,
    });
  });

  it("validates the params", () => {
    try {
      parseParams({});
      fail("Expected exception");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.validationErrors).toEqual([
        "Missing query param: fromDate",
        "Missing query param: toDate",
        "Missing query param: hierarchyLevel",
        "Missing query param: stepInterval",
      ]);
    }
  });
});

describe("#buildDataTable", () => {
  it("defines columns", () => {
    const dataTable = buildDataTable([], params);
    expect(dataTable.cols).toEqual([
      {
        label: "completed_time",
        type: "date",
      },
      {
        label: "Count",
        type: "number",
      },
      {
        label: "date",
        type: "string",
        role: "annotationText",
      },
    ]);
  });

  it("computes throughput", () => {
    const issues = times(2).map((index) => {
      return IssueFactory.build({
        key: `ISSUE-${index + 1}`,
        completed: DateTime.local(2020, 1, 1 + index),
        cycleTime: index + 1,
      });
    });
    const dataTable = buildDataTable(issues, params);
    expect(dataTable.rows).toEqual([
      ["Date(2020, 0, 1, 0, 0)", 1, "2020-01-01"],
      ["Date(2020, 0, 2, 0, 0)", 1, "2020-01-02"],
      ["Date(2020, 0, 3, 0, 0)", 0, "2020-01-03"],
      ["Date(2020, 0, 4, 0, 0)", 0, "2020-01-04"],
      ["Date(2020, 0, 5, 0, 0)", 0, "2020-01-05"],
      ["Date(2020, 0, 6, 0, 0)", 0, "2020-01-06"],
      ["Date(2020, 0, 7, 0, 0)", 0, "2020-01-07"],
    ]);
  });
});

it("builds the json response", () => {
  const issues = times(2).map((index) => {
    return IssueFactory.build({
      key: `ISSUE-${index + 1}`,
      completed: DateTime.local(2020, 1, 1 + index),
      cycleTime: index + 1,
    });
  });

  const dataTable = buildDataTable(issues, params);
  const response = buildResponse(dataTable, issues);

  expect(response).toEqual({
    meta: {
      issuesCount: 2,
    },
    chartOpts: {
      seriesType: "scatter",
      chartArea: {
        width: "90%",
        height: "80%",
        top: "5%",
      },
      legend: {
        position: "top",
      },
      series: {
        "0": {
          lineWidth: 1,
          pointSize: 4,
          color: "indianred",
        },
        "1": {
          type: "steppedArea",
          color: "#f44336",
          areaOpacity: 0,
          lineDashStyle: [4, 4],
        },
        "2": {
          type: "steppedArea",
          color: "#ff9800",
          areaOpacity: 0,
          lineDashStyle: [4, 4],
        },
        "3": {
          type: "steppedArea",
          color: "#03a9f4",
          areaOpacity: 0,
          lineDashStyle: [4, 4],
        },
      },
    },
    chartData: {
      cols: [
        {
          label: "completed_time",
          type: "date",
        },
        {
          label: "Count",
          type: "number",
        },
        {
          label: "date",
          type: "string",
          role: "annotationText",
        },
      ],
      rows: [
        {
          c: [{ v: "Date(2020, 0, 1, 0, 0)" }, { v: 1 }, { v: "2020-01-01" }],
        },
        {
          c: [{ v: "Date(2020, 0, 2, 0, 0)" }, { v: 1 }, { v: "2020-01-02" }],
        },
        {
          c: [{ v: "Date(2020, 0, 3, 0, 0)" }, { v: 0 }, { v: "2020-01-03" }],
        },
        {
          c: [{ v: "Date(2020, 0, 4, 0, 0)" }, { v: 0 }, { v: "2020-01-04" }],
        },
        {
          c: [{ v: "Date(2020, 0, 5, 0, 0)" }, { v: 0 }, { v: "2020-01-05" }],
        },
        {
          c: [{ v: "Date(2020, 0, 6, 0, 0)" }, { v: 0 }, { v: "2020-01-06" }],
        },
        {
          c: [{ v: "Date(2020, 0, 7, 0, 0)" }, { v: 0 }, { v: "2020-01-07" }],
        },
      ],
    },
  });
});
